// SCORM 1.2 Compliant Service - Enhanced Version
// @ts-ignore
import { SCORM } from 'pipwerks-scorm-api-wrapper';

interface SCORMData {
    lessonStatus: string;
    scoreRaw: number;
    scoreMax: number;
    scoreMin: number;
    totalTime: string;
    sessionTime: string;
    lessonLocation: string;
    studentId: string;
    studentName: string;
    isAvailable: boolean;
}

interface MicrolearningProgress {
    lastScene: number;
    completedScenes: number[];
    totalScore: number;
    sceneData?: any;
    lastUpdate: string;
    timeSpent?: number;
}

class SCORMService {
    private scorm: any = null;
    private isInitialized: boolean = false;
    private isInitializing: boolean = false;
    private sessionStartTime: number = Date.now();
    private lastCommitTime: number = Date.now();
    private commitTimer: ReturnType<typeof setInterval> | null = null;
    private listenersAttached: boolean = false;
    private commitInProgress: boolean = false;
    private lastSessionUpdateMs: number = Date.now();
    private readonly MIN_COMMIT_INTERVAL_MS: number = 1500;
    // Embed bridge
    private isEmbedMode: boolean = false;
    private parentOrigin: string = '*';
    private embedSuspendDataCache: any | null = null;
    private lastReportedProgress: { sceneIndex?: number; totalPoints?: number; totalScenes?: number; status?: string } | null = null;

    private data: SCORMData = {
        lessonStatus: 'not attempted',
        scoreRaw: 0,
        scoreMax: 100,
        scoreMin: 0,
        totalTime: '0000:00:00.00',
        sessionTime: '0000:00:00.00',
        lessonLocation: '',
        studentId: '',
        studentName: '',
        isAvailable: false
    };

    constructor() {
        // Don't initialize in constructor for lazy loading
        // Detect embed (iframe) mode and read optional parentOrigin
        try {
            const inBrowser = typeof window !== 'undefined';
            const topDifferent = inBrowser ? ((): boolean => { try { return window.top !== window; } catch { return true; } })() : false;
            this.isEmbedMode = topDifferent;
            if (inBrowser) {
                const sp = new URLSearchParams(window.location.search);
                const po = sp.get('parentOrigin');
                if (po && po.trim()) this.parentOrigin = po;
                if (this.isEmbedMode) {
                    // Listen for suspend data replies from parent shell
                    window.addEventListener('message', (e: MessageEvent) => {
                        try {
                            if (this.parentOrigin !== '*' && e.origin !== this.parentOrigin) return;
                            const data: any = (e as any).data || {};
                            if (data && data.type === 'scorm:suspendData') {
                                this.embedSuspendDataCache = data.payload || null;
                            }
                        } catch { }
                    });
                }
            }
        } catch { }
    }

    private postToParent(type: string, payload?: any): void {
        if (!this.isEmbedMode) return;
        try {
            window.parent.postMessage({ type, payload }, this.parentOrigin || '*');
        } catch { }
    }

    private async initialize(): Promise<void> {
        if (this.isInitialized || this.isInitializing) return;
        this.isInitializing = true;

        try {
            // In embed (cross-origin iframe) mode, DO NOT touch pipwerks API (will throw SecurityError)
            if (this.isEmbedMode) {
                this.data.isAvailable = false;
                this.isInitialized = true;
                // We can still use event listeners to flush any pending messages
                this.setupEventListeners();
                // No periodic commit needed in embed proxy mode
                // Request initial suspend_data from parent
                this.postToParent('scorm:getSuspendData');
                return;
            }
            // SCORM global object - pipwerks API
            this.scorm = SCORM;

            // Check SCORM API availability
            this.data.isAvailable = SCORM.isAvailable();

            if (this.data.isAvailable) {
                console.log('[SCORM] API found, initializing...');

                // Initialize SCORM API
                const initSuccess = SCORM.init();
                if (!initSuccess) {
                    const errorCode = SCORM.debug.getCode();
                    const errorInfo = SCORM.debug.getInfo();
                    console.error('[SCORM] Initialize failed:', `${errorCode}: ${errorInfo}`);
                    this.data.isAvailable = false;
                    return;
                }

                await this.loadInitialData();
                this.setupEventListeners();
                this.setupPeriodicCommit(30000);
                this.isInitialized = true;
                // Start session counters
                this.sessionStartTime = Date.now();
                this.lastSessionUpdateMs = this.sessionStartTime;
                this.lastCommitTime = this.sessionStartTime;

            } else {
                console.log('[SCORM] API not found - Standalone mode');
            }
        } catch (error) {
            console.error('[SCORM] Initialization error:', error);
            this.data.isAvailable = false;
        } finally {
            this.isInitializing = false;
        }
    }

    private async loadInitialData(): Promise<void> {
        if (!this.scorm || !this.data.isAvailable) return;

        try {
            // Use SCORM 1.2 standard data model elements
            this.data.lessonStatus = this.scorm.get('cmi.core.lesson_status') || 'not attempted';
            this.data.scoreRaw = parseFloat(this.scorm.get('cmi.core.score.raw')) || 0;
            this.data.scoreMax = parseFloat(this.scorm.get('cmi.core.score.max')) || 100;
            this.data.scoreMin = parseFloat(this.scorm.get('cmi.core.score.min')) || 0;
            this.data.totalTime = this.scorm.get('cmi.core.total_time') || '0000:00:00.00';
            this.data.lessonLocation = this.scorm.get('cmi.core.lesson_location') || '';
            this.data.studentId = this.scorm.get('cmi.core.student_id') || '';
            this.data.studentName = this.scorm.get('cmi.core.student_name') || '';

            // Set entry value - resume or ab-initio
            const hasProgress = this.data.lessonStatus !== 'not attempted' || this.data.lessonLocation !== '';
            const entryValue = hasProgress ? 'resume' : 'ab-initio';
            this.scorm.set('cmi.core.entry', entryValue);

            // Set score max and min (if opening for first time)
            if (!this.scorm.get('cmi.core.score.max')) {
                this.scorm.set('cmi.core.score.max', '100');
            }
            if (!this.scorm.get('cmi.core.score.min')) {
                this.scorm.set('cmi.core.score.min', '0');
            }

            console.log('[SCORM] Current data loaded:', this.data);
        } catch (error) {
            console.error('[SCORM] Data loading error:', error);
        }
    }

    private setupEventListeners(): void {
        if (this.listenersAttached) return;
        this.listenersAttached = true;

        // Auto finish on page close
        window.addEventListener('beforeunload', () => {
            this.updateSessionTime();
            this.commit();
        });

        // Reliable closure in some browsers including Mobile Safari
        window.addEventListener('pagehide', () => {
            this.updateSessionTime();
            this.commit();
        });

        // Visibility change - for pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateSessionTime();
                this.commit();
            }
        });
    }

    private setupPeriodicCommit(intervalMs: number): void {
        if (intervalMs <= 0) return;

        if (this.commitTimer) {
            clearInterval(this.commitTimer);
            this.commitTimer = null;
        }

        this.commitTimer = setInterval(() => {
            if (this.isInitialized && !document.hidden) {
                this.updateSessionTime();
                this.commit();
            }
        }, intervalMs);
    }

    // Public Methods - Lazy initialize added
    private ensureInitialized(): void {
        if (!this.isInitialized) {
            this.initialize();
        }
    }

    public updateGlobalState(): SCORMData {
        return { ...this.data };
    }

    public getStudentInfo(): { id: string; name: string } {
        return {
            id: this.data.studentId,
            name: this.data.studentName
        };
    }

    public updateProgress(totalPoints: number, currentScene: number, totalScenes: number): boolean {
        // If SCORM is not available, proxy to parent shell in embed mode
        if (!this.scorm || !this.data.isAvailable) {
            if (this.isEmbedMode) {
                const scoreRaw = Math.min(100, Math.max(0, Math.round(totalPoints)));
                const status = currentScene >= totalScenes - 1 ? (scoreRaw >= 80 ? 'passed' : 'completed') : 'incomplete';
                const payload = { sceneIndex: currentScene, totalPoints: scoreRaw, totalScenes, status };
                this.lastReportedProgress = payload;
                this.postToParent('scorm:updateProgress', payload);
                return true;
            }
        }

        if (!this.scorm || !this.data.isAvailable) return false;

        try {
            let anyChanged = false;

            // Update score (normalize between 0-100)
            const scoreRaw = Math.min(100, Math.max(0, Math.round(totalPoints)));
            if (scoreRaw !== this.data.scoreRaw) {
                this.scorm.set('cmi.core.score.raw', scoreRaw.toString());
                this.data.scoreRaw = scoreRaw;
                anyChanged = true;
            }

            // Update lesson status - SCORM 1.2 standard values
            let status = 'incomplete';
            if (currentScene >= totalScenes - 1) {
                status = scoreRaw >= 80 ? 'passed' : 'completed';
            }
            if (status !== this.data.lessonStatus) {
                this.scorm.set('cmi.core.lesson_status', status);
                this.data.lessonStatus = status;
                anyChanged = true;
            }

            // Update lesson location
            const newLocation = currentScene.toString();
            if (newLocation !== this.data.lessonLocation) {
                this.scorm.set('cmi.core.lesson_location', newLocation);
                this.data.lessonLocation = newLocation;
                anyChanged = true;
            }

            // Update session time
            const now = Date.now();
            const pendingDeltaSeconds = Math.floor((now - this.lastSessionUpdateMs) / 1000);
            this.updateSessionTime();

            // Commit changes
            const shouldCommit = anyChanged || pendingDeltaSeconds > 0;
            const commitResult = shouldCommit ? this.commit() : true;

            console.log('[SCORM] Progress updated:', {
                scoreRaw,
                status,
                scene: currentScene,
                committed: commitResult
            });

            return commitResult;
        } catch (error) {
            console.error('[SCORM] Progress update error:', error);
            return false;
        }
    }

    public updateQuizResult(isCompleted: boolean, score: number, passingScore: number = 80): boolean {
        // If SCORM not available, proxy to parent in embed mode
        if (!this.scorm || !this.data.isAvailable) {
            if (isCompleted && this.isEmbedMode) {
                const normalizedScore = Math.min(100, Math.max(0, score));
                const status = normalizedScore >= passingScore ? 'passed' : 'failed';
                const payload = { sceneIndex: undefined as unknown as number, totalPoints: normalizedScore, totalScenes: undefined as unknown as number, status };
                this.lastReportedProgress = payload;
                this.postToParent('scorm:updateProgress', payload);
                return true;
            }
            return false;
        }
        try {
            if (isCompleted) {
                const normalizedScore = Math.min(100, Math.max(0, score));
                let anyChanged = false;
                if (normalizedScore !== this.data.scoreRaw) {
                    this.scorm.set('cmi.core.score.raw', normalizedScore.toString());
                    this.data.scoreRaw = normalizedScore;
                    anyChanged = true;
                }

                const status = normalizedScore >= passingScore ? 'passed' : 'failed';
                if (status !== this.data.lessonStatus) {
                    this.scorm.set('cmi.core.lesson_status', status);
                    this.data.lessonStatus = status;
                    anyChanged = true;
                }

                const now = Date.now();
                const pendingDeltaSeconds = Math.floor((now - this.lastSessionUpdateMs) / 1000);
                this.updateSessionTime();
                const commitResult = (anyChanged || pendingDeltaSeconds > 0) ? this.commit() : true;

                console.log('[SCORM] Quiz completed:', {
                    score: normalizedScore,
                    status,
                    committed: commitResult
                });

                return commitResult;
            }
            return true;
        } catch (error) {
            console.error('[SCORM] Quiz update error:', error);
            return false;
        }
    }

    private updateSessionTime(): void {
        try {
            // No-op in embed or when SCORM API is unavailable
            if (!this.scorm || !this.data.isAvailable) {
                this.lastSessionUpdateMs = Date.now();
                return;
            }
            const now = Date.now();
            const deltaSeconds = Math.floor((now - this.lastSessionUpdateMs) / 1000);
            if (deltaSeconds <= 0) return;

            // SCORM 1.2: session_time elapsed time per commit (delta)
            const sessionTimeDelta = this.formatSCORMTime(deltaSeconds);
            this.scorm.set('cmi.core.session_time', sessionTimeDelta);

            // Total session time for visual reporting
            const totalSessionSeconds = Math.floor((now - this.sessionStartTime) / 1000);
            this.data.sessionTime = this.formatSCORMTime(totalSessionSeconds);

            // Accumulate total time with delta
            const currentTotalSeconds = this.parseTimeToSeconds(this.data.totalTime);
            const newTotalSeconds = currentTotalSeconds + deltaSeconds;
            this.data.totalTime = this.formatSCORMTime(newTotalSeconds);

            // Set total_time to SCORM
            this.scorm.set('cmi.core.total_time', this.data.totalTime);

            this.lastSessionUpdateMs = now;

        } catch (error) {
            console.error('[SCORM] Session time update error:', error);
        }
    }

    private parseTimeToSeconds(timeString: string): number {
        try {
            const parts = timeString.split(':');
            if (parts.length !== 3) return 0;

            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            const seconds = parseFloat(parts[2]) || 0;

            return (hours * 3600) + (minutes * 60) + seconds;
        } catch {
            return 0;
        }
    }

    public saveSuspendData(data: any): boolean {
        // Embed proxy when SCORM is unavailable
        if (!this.scorm || !this.data.isAvailable) {
            if (this.isEmbedMode) {
                try {
                    const enhancedData = {
                        version: 1,
                        ...data,
                        lastUpdate: new Date().toISOString(),
                        timeSpent: Date.now() - this.sessionStartTime
                    };
                    this.postToParent('scorm:setSuspendData', enhancedData);
                    return true;
                } catch (error) {
                    console.error('[SCORM] Suspend data postMessage error:', error);
                    return false;
                }
            }
            return false;
        }

        try {
            const enhancedData = {
                version: 1,
                ...data,
                lastUpdate: new Date().toISOString(),
                timeSpent: Date.now() - this.sessionStartTime
            };

            let suspendData = JSON.stringify(enhancedData);

            if (suspendData.length > 4096) {
                console.warn('[SCORM] Suspend data too large, truncating...');

                const compactData = {
                    lastScene: data.lastScene,
                    completedScenes: data.completedScenes,
                    totalScore: data.totalScore,
                    lastUpdate: enhancedData.lastUpdate,
                    timeSpent: enhancedData.timeSpent
                };

                suspendData = JSON.stringify(compactData);

                if (suspendData.length > 4096) {
                    suspendData = suspendData.substring(0, 4096);
                }
            }

            // Don't set/commit if data hasn't changed
            const currentSuspendData = this.scorm.get('cmi.suspend_data') || '';
            if (currentSuspendData === suspendData) {
                return true;
            }

            this.scorm.set('cmi.suspend_data', suspendData);
            console.log('suspendData', suspendData);
            const commitResult = this.commit();

            console.log('[SCORM] Suspend data saved:', {
                size: suspendData.length,
                committed: commitResult
            });

            return commitResult;
        } catch (error) {
            console.error('[SCORM] Suspend data error:', error);
            return false;
        }
    }

    public loadSuspendData(): MicrolearningProgress | null {
        if (!this.scorm || !this.data.isAvailable) {
            // In embed mode, return last received suspend data (if any)
            if (this.isEmbedMode) {
                return this.embedSuspendDataCache as any;
            }
            return null;
        }

        try {
            const suspendData = this.scorm.get('cmi.suspend_data');
            if (suspendData && suspendData.trim() !== '') {
                const parsed = JSON.parse(suspendData);

                return {
                    lastScene: parsed.lastScene || 0,
                    completedScenes: parsed.completedScenes || [],
                    totalScore: parsed.totalScore || 0,
                    sceneData: parsed.sceneData,
                    lastUpdate: parsed.lastUpdate || new Date().toISOString(),
                    timeSpent: parsed.timeSpent || 0
                };
            }
        } catch (error) {
            console.error('[SCORM] Suspend data loading error:', error);
        }

        return null;
    }

    public initializeMicrolearning(courseId?: string, userId?: string) {
        this.ensureInitialized();
        if (this.isAvailable()) {
            const suspendData = this.loadSuspendData();
            const studentInfo = this.getStudentInfo();
            const healthStatus = this.getHealthStatus();

            return {
                isAvailable: true,
                isHealthy: healthStatus.isHealthy,
                lastPosition: suspendData?.lastScene || 0,
                completedScenes: suspendData?.completedScenes || [],
                totalScore: suspendData?.totalScore || 0,
                timeSpent: suspendData?.timeSpent || 0,
                studentInfo,
                courseId: courseId || 'default',
                userId: userId || studentInfo.id
            };
        }

        return {
            isAvailable: false,
            isHealthy: false,
            lastPosition: 0,
            completedScenes: [],
            totalScore: 0,
            timeSpent: 0,
            studentInfo: { id: '', name: '' },
            courseId: courseId || 'default',
            userId: userId || ''
        };
    }

    public saveMicrolearningProgress(sceneIndex: number, sceneData: any, totalScore: number, totalScenes: number = 10): boolean {
        const progressData: MicrolearningProgress = {
            lastScene: sceneIndex,
            completedScenes: Array.from(new Set([
                ...Array.from({ length: sceneIndex }, (_, i) => i),
                sceneIndex
            ])),
            totalScore,
            sceneData,
            lastUpdate: new Date().toISOString(),
            timeSpent: Date.now()
        };
        console.log('progressData', progressData);

        const saveResult = this.saveSuspendData(progressData);
        this.updateProgress(totalScore, sceneIndex, totalScenes);
        return saveResult;
    }

    public finish(): boolean {
        // If no SCORM, still notify parent shell in embed mode
        if (!this.scorm || !this.data.isAvailable || !this.isInitialized) {
            if (this.isEmbedMode) {
                // Send last known progress with guaranteed 100 score and passed status, then finish
                const payload = { ...(this.lastReportedProgress || {}), totalPoints: 100, status: 'passed' };
                this.postToParent('scorm:updateProgress', payload);
                this.postToParent('scorm:finish');
                return true;
            }
            return false;
        }

        try {
            if (this.commitTimer) {
                clearInterval(this.commitTimer);
                this.commitTimer = null;
            }

            this.updateSessionTime();
            // Ensure perfect score and success on finish for microlearning
            try { this.scorm.set('cmi.core.score.raw', '100'); } catch {}
            try { this.scorm.set('cmi.core.lesson_status', 'passed'); } catch {}
            this.scorm.set('cmi.core.exit', 'suspend');
            this.commit();

            // Use quit() in pipwerks SCORM API
            const finishResult = this.scorm.quit();

            console.log('[SCORM] SCORM terminated:', finishResult);
            this.isInitialized = false;

            // Also notify parent shell (embed) for good measure
            if (this.isEmbedMode) {
                this.postToParent('scorm:finish');
            }

            return finishResult;
        } catch (error) {
            console.error('[SCORM] Termination error:', error);
            return false;
        }
    }

    private formatSCORMTime(totalSeconds: number): string {
        // SCORM 1.2 session_time expects HH:MM:SS or HH:MM:SS.ss; prefer HH:MM:SS for compatibility
        const seconds = Math.max(0, Math.floor(totalSeconds));
        let hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        // Clamp hours to 99 to comply with conservative LMS parsers
        if (hours > 99) {
            hours = 99;
        }

        const hh = hours.toString().padStart(2, '0');
        const mm = minutes.toString().padStart(2, '0');
        const ss = secs.toString().padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    public isAvailable(): boolean {
        return this.data.isAvailable;
    }

    public isServiceInitialized(): boolean {
        return this.isInitialized;
    }

    public getLastError(): string {
        if (!this.scorm) return 'SCORM service not initialized';
        const errorCode = this.scorm.debug.getCode();
        const errorDescription = this.scorm.debug.getInfo();
        return errorCode !== '0' ? `${errorCode}: ${errorDescription}` : 'No error';
    }

    public commit(): boolean {
        if (!this.scorm || !this.data.isAvailable) return false;
        if (this.commitInProgress) return true; // Don't start new commit before current one finishes
        const now = Date.now();
        if (now - this.lastCommitTime < this.MIN_COMMIT_INTERVAL_MS) return true; // Throttle frequent commits

        try {
            this.commitInProgress = true;
            // Use save() in pipwerks SCORM API
            const result = this.scorm.save();

            if (result) {
                this.lastCommitTime = Date.now();
                console.log('[SCORM] Commit successful');
            } else {
                const errorCode = this.scorm.debug.getCode();
                const errorInfo = this.scorm.debug.getInfo();
                console.error('[SCORM] Commit failed:', `${errorCode}: ${errorInfo}`);
            }

            return result;
        } catch (error) {
            console.error('[SCORM] Commit error:', error);
            return false;
        } finally {
            this.commitInProgress = false;
        }
    }

    public getSCORMData(): SCORMData {
        return { ...this.data };
    }

    public getHealthStatus(): {
        isHealthy: boolean;
        lastCommit: number;
        sessionDuration: number;
    } {
        const timeSinceLastCommit = Date.now() - this.lastCommitTime;
        const sessionDuration = Date.now() - this.sessionStartTime;

        return {
            isHealthy: this.isInitialized && this.data.isAvailable && timeSinceLastCommit < 120000,
            lastCommit: timeSinceLastCommit,
            sessionDuration
        };
    }
}

// Singleton pattern - Lazy loading
let scormServiceInstance: SCORMService | null = null;

export const getSCORMService = (): SCORMService => {
    if (!scormServiceInstance) {
        scormServiceInstance = new SCORMService();
    }
    return scormServiceInstance;
};

export const destroySCORMService = (): void => {
    if (scormServiceInstance) {
        scormServiceInstance.finish();
        scormServiceInstance = null;
    }
};

// SINGLE EXPORT - With lazy loading
export const scormService = getSCORMService();

// Type exports
export type { SCORMData, MicrolearningProgress };