// SCORM 1.2 Standartlarına Uygun Service - İyileştirilmiş Versiyon
// @ts-ignore
import { SCORM } from 'pipwerks-scorm-api-wrapper';
if (process.env.NODE_ENV === 'development') {
    (window as any).API = {
        LMSInitialize: () => 'true',
        LMSGetValue: (param: string) => '',
        LMSSetValue: (param: string, value: string) => 'true',
        LMSCommit: () => 'true',
        LMSFinish: () => 'true',
        LMSGetLastError: () => '0'
    };
}
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
    private sessionStartTime: number = Date.now();
    private lastCommitTime: number = Date.now();
    private commitTimer: NodeJS.Timeout | null = null;

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
        // Lazy loading için constructor'da initialize etmeyin
    }

    private async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // SCORM global objesi - pipwerks API
            this.scorm = SCORM;

            // SCORM API'nin varlığını kontrol et
            this.data.isAvailable = SCORM.isAvailable();

            if (this.data.isAvailable) {
                console.log('[SCORM] API bulundu, başlatılıyor...');

                // SCORM API'yi initialize et
                const initSuccess = SCORM.init();
                if (!initSuccess) {
                    console.error('[SCORM] Initialize başarısız:', SCORM.debug.getCode());
                    this.data.isAvailable = false;
                    return;
                }

                await this.loadInitialData();
                this.setupEventListeners();
                this.setupPeriodicCommit(30000);
                this.isInitialized = true;

            } else {
                console.log('[SCORM] API bulunamadı - Standalone mod');
            }
        } catch (error) {
            console.error('[SCORM] Başlatma hatası:', error);
            this.data.isAvailable = false;
        }
    }

    private async loadInitialData(): Promise<void> {
        if (!this.scorm || !this.data.isAvailable) return;

        try {
            // SCORM 1.2 standart data model elementi kullan
            this.data.lessonStatus = this.scorm.get('cmi.core.lesson_status') || 'not attempted';
            this.data.scoreRaw = parseFloat(this.scorm.get('cmi.core.score.raw')) || 0;
            this.data.scoreMax = parseFloat(this.scorm.get('cmi.core.score.max')) || 100;
            this.data.scoreMin = parseFloat(this.scorm.get('cmi.core.score.min')) || 0;
            this.data.totalTime = this.scorm.get('cmi.core.total_time') || '0000:00:00.00';
            this.data.lessonLocation = this.scorm.get('cmi.core.lesson_location') || '';
            this.data.studentId = this.scorm.get('cmi.core.student_id') || '';
            this.data.studentName = this.scorm.get('cmi.core.student_name') || '';

            // Score max ve min'i set et (ilk kez açılıyorsa)
            if (!this.scorm.get('cmi.core.score.max')) {
                this.scorm.set('cmi.core.score.max', '100');
            }
            if (!this.scorm.get('cmi.core.score.min')) {
                this.scorm.set('cmi.core.score.min', '0');
            }

            console.log('[SCORM] Mevcut veriler yüklendi:', this.data);
        } catch (error) {
            console.error('[SCORM] Veri yükleme hatası:', error);
        }
    }

    private setupEventListeners(): void {
        // Sayfa kapatılırken otomatik finish
        window.addEventListener('beforeunload', () => {
            this.finish();
        });

        // Visibility change - pause/resume için
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateSessionTime();
                this.commit();
            }
        });
    }

    private setupPeriodicCommit(intervalMs: number): void {
        if (intervalMs <= 0) return;

        this.commitTimer = setInterval(() => {
            if (this.isInitialized && !document.hidden) {
                this.updateSessionTime();
                this.commit();
            }
        }, intervalMs);
    }

    // Public Methods - Lazy initialize eklenmiş
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
        if (!this.scorm || !this.data.isAvailable) return false;

        try {
            // Score güncelle (0-100 arası normalize et)
            const scoreRaw = Math.min(100, Math.max(0, Math.round(totalPoints)));
            this.scorm.set('cmi.core.score.raw', scoreRaw.toString());
            this.data.scoreRaw = scoreRaw;

            // Lesson status güncelle - SCORM 1.2 standart değerleri
            let status = 'incomplete';
            if (currentScene >= totalScenes - 1) {
                status = scoreRaw >= 80 ? 'passed' : 'completed';
            } else if (currentScene > 0) {
                status = 'browsed';
            }

            this.scorm.set('cmi.core.lesson_status', status);
            this.data.lessonStatus = status;

            // Lesson location güncelle
            this.scorm.set('cmi.core.lesson_location', currentScene.toString());
            this.data.lessonLocation = currentScene.toString();

            // Session time'ı güncelle
            this.updateSessionTime();

            // Değişiklikleri commit et
            const commitResult = this.commit();

            console.log('[SCORM] Progress güncellendi:', {
                scoreRaw,
                status,
                scene: currentScene,
                committed: commitResult
            });

            return commitResult;
        } catch (error) {
            console.error('[SCORM] Progress güncelleme hatası:', error);
            return false;
        }
    }

    public updateQuizResult(isCompleted: boolean, score: number, passingScore: number = 80): boolean {
        if (!this.scorm || !this.data.isAvailable) return false;
        try {
            if (isCompleted) {
                const normalizedScore = Math.min(100, Math.max(0, score));
                this.scorm.set('cmi.core.score.raw', normalizedScore.toString());
                this.data.scoreRaw = normalizedScore;

                const status = normalizedScore >= passingScore ? 'passed' : 'failed';
                this.scorm.set('cmi.core.lesson_status', status);
                this.data.lessonStatus = status;

                this.updateSessionTime();
                const commitResult = this.commit();

                console.log('[SCORM] Quiz tamamlandı:', {
                    score: normalizedScore,
                    status,
                    committed: commitResult
                });

                return commitResult;
            }
            return true;
        } catch (error) {
            console.error('[SCORM] Quiz güncelleme hatası:', error);
            return false;
        }
    }

    private updateSessionTime(): void {
        try {
            const sessionDuration = Date.now() - this.sessionStartTime;
            const sessionSeconds = Math.floor(sessionDuration / 1000);
            const sessionTimeString = this.formatSCORMTime(sessionSeconds);

            this.scorm.set('cmi.core.session_time', sessionTimeString);
            this.data.sessionTime = sessionTimeString;

            // Total time'ı da güncelle
            const currentTotalSeconds = this.parseTimeToSeconds(this.data.totalTime);
            const newTotalSeconds = currentTotalSeconds + sessionSeconds;
            const newTotalTime = this.formatSCORMTime(newTotalSeconds);
            this.data.totalTime = newTotalTime;

        } catch (error) {
            console.error('[SCORM] Session time güncelleme hatası:', error);
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
        if (!this.scorm || !this.data.isAvailable) return false;

        try {
            const enhancedData = {
                ...data,
                lastUpdate: new Date().toISOString(),
                timeSpent: Date.now() - this.sessionStartTime
            };

            let suspendData = JSON.stringify(enhancedData);

            if (suspendData.length > 4096) {
                console.warn('[SCORM] Suspend data çok büyük, kısaltılıyor...');

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

            this.scorm.set('cmi.suspend_data', suspendData);
            console.log('suspendData', suspendData);
            const commitResult = this.commit();

            console.log('[SCORM] Suspend data kaydedildi:', {
                size: suspendData.length,
                committed: commitResult
            });

            return commitResult;
        } catch (error) {
            console.error('[SCORM] Suspend data hatası:', error);
            return false;
        }
    }

    public loadSuspendData(): MicrolearningProgress | null {
        if (!this.scorm || !this.data.isAvailable) return null;

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
            console.error('[SCORM] Suspend data yükleme hatası:', error);
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
        if (!this.scorm || !this.data.isAvailable || !this.isInitialized) return false;

        try {
            if (this.commitTimer) {
                clearInterval(this.commitTimer);
                this.commitTimer = null;
            }

            this.updateSessionTime();
            this.scorm.set('cmi.core.exit', 'suspend');
            this.commit();

            // pipwerks SCORM API'de quit() kullanılır
            const finishResult = this.scorm.quit();

            console.log('[SCORM] SCORM sonlandırıldı:', finishResult);
            this.isInitialized = false;

            return finishResult;
        } catch (error) {
            console.error('[SCORM] Sonlandırma hatası:', error);
            return false;
        }
    }

    private formatSCORMTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);

        return `${hours.toString().padStart(4, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }

    public isAvailable(): boolean {
        return this.data.isAvailable;
    }

    public isServiceInitialized(): boolean {
        return this.isInitialized;
    }

    public getLastError(): string {
        if (!this.scorm) return 'SCORM service not initialized';
        return this.scorm.debug.getCode();
    }

    public commit(): boolean {
        if (!this.scorm || !this.data.isAvailable) return false;

        try {
            // pipwerks SCORM API'de save() kullanılır
            const result = this.scorm.save();

            if (result) {
                this.lastCommitTime = Date.now();
                console.log('[SCORM] Commit başarılı');
            } else {
                console.error('[SCORM] Commit başarısız:', this.scorm.debug.getCode());
            }

            return result;
        } catch (error) {
            console.error('[SCORM] Commit hatası:', error);
            return false;
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

// TEK EXPORT - Lazy loading ile
export const scormService = getSCORMService();

// Type exports
export type { SCORMData, MicrolearningProgress };