import { useCallback, useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";
import { EditableText } from "../common/EditableText";
import { EditModePanel } from "../common/EditModePanel";
import { EditModeProvider, useEditMode } from "../../contexts/EditModeContext";
import { deepMerge } from "../../utils/deepMerge";
import { logger } from "../../utils/logger";
import { CallToAction } from "../ui/CallToAction";
import { CodeReviewTextsModal } from "./code-review/code-review-texts-modal";
import { CodeReviewSceneConfig, CodeReviewSceneProps } from "./code-review/types";
import { Edit3, Loader2, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "./code-review/constants";
import { CommentPinsOverlay } from "../ui/comment-pins-overlay";

const DEFAULT_CONTAINER_CLASS = "w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6";
const DEFAULT_EDITOR_HEIGHT = 420;

const getIconComponent = (iconName: string): LucideIcon => {
    const camelCaseName = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    if (camelCaseName in LucideIcons) {
        return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
    }

    console.warn(`Icon "${iconName}" not found, using default icon`);
    return LucideIcons.HelpCircle;
};

const getThemeFromDocument = (): "light" | "vs-dark" | "hc-black" => {
    if (typeof document === "undefined") {
        return "light";
    }
    return document.documentElement.classList.contains("dark") ? "vs-dark" : "light";
};

function CodeReviewSceneContent({
    config,
    onNextSlide,
    onValidationStatusChange,
    selectedLanguage,
    sceneId,
    reducedMotion
}: CodeReviewSceneProps) {
    const { isEditMode, tempConfig, updateTempConfig } = useEditMode();
    const isMobile = useIsMobile();

    const currentConfig: CodeReviewSceneConfig = useMemo(() => {
        return deepMerge(config, tempConfig || {});
    }, [config, tempConfig]);

    // Extract icon for cleaner dependency array
    const icon = useMemo(() => (currentConfig as any)?.icon, [currentConfig]);

    // Memoize icon component
    const sceneIconComponent = useMemo(() => {
        if (!icon) return null;

        if (icon.component) {
            const SceneIcon = icon.component;
            return (
                <div className="mb-1 sm:mb-2 p-3 glass-border-3">
                    <SceneIcon
                        size={icon.size || 40}
                        className="text-[#1C1C1E] dark:text-[#F2F2F7]"
                        aria-hidden="true"
                    />
                </div>
            );
        } else if (icon.sceneIconName) {
            const SceneIcon = getIconComponent(icon.sceneIconName);
            return (
                <div className="mb-1 sm:mb-2 p-3 glass-border-3">
                    <SceneIcon
                        size={icon.size || 40}
                        className="text-[#1C1C1E] dark:text-[#F2F2F7]"
                        aria-hidden="true"
                    />
                </div>
            );
        }
        return null;
    }, [icon]);

    const [computedTheme, setComputedTheme] = useState<"light" | "vs-dark" | "hc-black">(() => getThemeFromDocument());
    const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
    const [showTextsModal, setShowTextsModal] = useState(false);
    const [validationFeedback, setValidationFeedback] = useState<string>("");
    const [validationHint, setValidationHint] = useState<string>("");

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }
        const root = document.documentElement;
        const observer = new MutationObserver(() => {
            setComputedTheme(getThemeFromDocument());
        });
        observer.observe(root, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Notify parent about validation status
    useEffect(() => {
        onValidationStatusChange?.(checkStatus === "success");
    }, [checkStatus, onValidationStatusChange]);

    const codeSnippet = useMemo(() => {
        return currentConfig.codeSnippet || { content: "", language: currentConfig.language };
    }, [currentConfig.codeSnippet, currentConfig.language]);
    const editorLanguage = (codeSnippet?.language || currentConfig.language || "javascript").toLowerCase();
    const codeContent = codeSnippet?.content ?? "";
    const [editorValue, setEditorValue] = useState(codeContent);
    const editorHeight = currentConfig.layout?.editorHeight ?? DEFAULT_EDITOR_HEIGHT;
    const containerClassName = `${currentConfig.layout?.containerClassName ?? DEFAULT_CONTAINER_CLASS} relative`;
    const ariaMainLabel = currentConfig.ariaTexts?.mainLabel || "Code review scene";
    const ariaMainDescription = currentConfig.ariaTexts?.mainDescription || "Interactive code review exercise";
    const ariaCodeRegionLabel = currentConfig.ariaTexts?.codeRegionLabel || "Code snippet";
    const ariaCodeRegionDescription = currentConfig.ariaTexts?.codeRegionDescription || "Review the provided code";

    const defaultStatusTexts = useMemo(() => ({
        checking: "Analyzing code…",
        success: "Code validated successfully. You can continue.",
        error: "We couldn't validate the snippet. Please review and try again."
    }), []);

    const statusTexts = currentConfig.checkStatusTexts || {};
    const checkingMessage = statusTexts.checking ?? defaultStatusTexts.checking;
    const successStatusMessage = statusTexts.success ?? defaultStatusTexts.success;
    const errorStatusMessage = statusTexts.error ?? defaultStatusTexts.error;

    const isChecking = checkStatus === "checking";
    const isSuccess = checkStatus === "success";

    // Handle CTA text as string or object (from edit mode)
    const getCtaText = (config: any): string => {
        if (!config) return "";
        if (typeof config === 'string') return config;
        if (typeof config === 'object' && config.desktop) return config.desktop;
        if (typeof config === 'object' && config.mobile) return config.mobile;
        return "";
    };

    const initialCtaText = getCtaText(currentConfig.callToActionText) || "Review before continuing";
    const successCtaText = getCtaText(currentConfig.successCallToActionText) || "Continue";
    const activeCtaText = isSuccess ? successCtaText : initialCtaText;

    const helperTextFallback = currentConfig.helperText || "Look for missing validation, unsafe DOM access, or unescaped output.";
    const successHelperTextFallback = currentConfig.successHelperText || "Great catch! You're cleared to continue.";
    const activeHelperText = isSuccess ? successHelperTextFallback : helperTextFallback;

    const editorTheme = currentConfig.codeSnippet?.theme || computedTheme;
    const showLineNumbers = currentConfig.codeSnippet?.showLineNumbers ?? true;
    const automaticLayout = currentConfig.codeSnippet?.automaticLayout ?? true;
    const editorOptions = useMemo(() => ({
        readOnly: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: (showLineNumbers ? "on" : "off") as "on" | "off",
        automaticLayout,
        fontSize: currentConfig.codeSnippet?.fontSize ?? 14
    }), [automaticLayout, currentConfig.codeSnippet?.fontSize, showLineNumbers]);

    useEffect(() => {
        setEditorValue(codeContent);
    }, [codeContent]);

    const handleCodeChange = useCallback((value: string | undefined) => {
        const nextValue = value ?? "";
        setEditorValue(nextValue);
        if (isEditMode) {
            updateTempConfig("codeSnippet.content", nextValue);
        }
    }, [isEditMode, updateTempConfig]);

    useEffect(() => {
        setCheckStatus("idle");
        setValidationFeedback("");
        setValidationHint("");
    }, [editorValue, editorLanguage]);

    const handleCheckClick = useCallback(async () => {
        if (!editorValue.trim()) {
            return;
        }

        setCheckStatus("checking");

        try {
            const originalCode = codeSnippet?.content || "";
            const issueType = (currentConfig as any)?.issueType || "Code Security Issue";
            const appLanguage = selectedLanguage || 'en-US';

            const payload = {
                issueType,
                originalCode,

                fixedCode: editorValue,
                language: editorLanguage,
                outputLanguage: appLanguage
            };

            console.log("[CodeReview] Sending validation request:", payload);

            // Call validation endpoint
            const response = await fetch("https://agentic-ally.keepnet-labs-ltd-business-profile4086.workers.dev/code-review-validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            console.log("[CodeReview] Response status:", response.status);

            const result = await response.json();

            console.log("[CodeReview] Validation result:", result);

            if (result.success && result.data?.isCorrect) {
                console.log("[CodeReview] ✅ Code is correct!");
                setValidationFeedback(result.data?.feedback || successStatusMessage);
                setValidationHint(result.data?.hint || "");
                setCheckStatus("success");
            } else {
                console.log("[CodeReview] ❌ Code has issues:", result.data?.feedback);
                setValidationFeedback(result.data?.feedback || errorStatusMessage);
                setValidationHint(result.data?.hint || "");
                setCheckStatus("error");
            }
        } catch (error) {
            console.error("[CodeReview] Validation error:", error);
            logger.push({
                level: "error",
                code: "CODE_REVIEW_VALIDATION_FAILED",
                message: "Code review validation failed",
                detail: error
            });
            setValidationFeedback("Validation error. Please try again.");
            setValidationHint("");
            setCheckStatus("error");
        }
    }, [editorValue, editorLanguage, codeSnippet, currentConfig, successStatusMessage, errorStatusMessage, selectedLanguage]);

    const handleNextClick = useCallback(() => {
        if (checkStatus !== "success") return;
        onNextSlide?.();
    }, [checkStatus, onNextSlide]);


    const handleTextsSave = useCallback((nextValues: {
        helperText: string;
        successHelperText: string;
        checkingText: string;
        successText: string;
        errorText: string;
    }) => {
        updateTempConfig("helperText", nextValues.helperText);
        updateTempConfig("successHelperText", nextValues.successHelperText);
        updateTempConfig("checkStatusTexts.checking", nextValues.checkingText);
        updateTempConfig("checkStatusTexts.success", nextValues.successText);
        updateTempConfig("checkStatusTexts.error", nextValues.errorText);
    }, [updateTempConfig]);

    return (
        <FontWrapper>
            <main
                role="main"
                aria-label={ariaMainLabel}
                aria-describedby={sceneId ? `code-review-description-${sceneId}` : undefined}
                data-scene-type={(currentConfig as any)?.scene_type || "code_review"}
                data-scene-id={sceneId as any}
                data-testid="scene-code-review"
                data-comment-surface="true"
                className={containerClassName}
            >
                <div className="sr-only" id={sceneId ? `code-review-description-${sceneId}` : undefined}>
                    {ariaMainDescription}
                </div>

                <header className="flex flex-col text-center">
                    {!isMobile && (
                        <div className="flex items-center justify-center" aria-hidden="true">
                            {sceneIconComponent}
                        </div>
                    )}
                    <h1
                        className="project-title"
                    >
                        <EditableText configPath="title" placeholder="Enter title" as="span" maxLength={120}>
                            {currentConfig.title || "Code Review Challenge"}
                        </EditableText>
                    </h1>

                    {currentConfig.subtitle && (
                        <p
                            className="project-subtitle"
                        >
                            <EditableText configPath="subtitle" placeholder="Enter subtitle" as="span" maxLength={200}>
                                {currentConfig.subtitle}
                            </EditableText>
                        </p>
                    )}

                    {currentConfig.description && (
                        <p
                            className="text-base sm:text-lg text-[#1C1C1E] dark:text-[#F2F2F7] max-w-3xl mx-auto"
                        >
                            <EditableText
                                configPath="description"
                                placeholder="Add a description"
                                as="span"
                                multiline
                                maxLength={600}
                            >
                                {currentConfig.description}
                            </EditableText>
                        </p>
                    )}
                </header>

                <section
                    className="flex flex-col gap-4"
                    aria-label={ariaCodeRegionLabel}
                    aria-describedby={sceneId ? `code-review-editor-description-${sceneId}` : undefined}
                >
                    <div className="sr-only" id={sceneId ? `code-review-editor-description-${sceneId}` : undefined}>
                        {ariaCodeRegionDescription}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        {isEditMode ? (
                            <label className="flex items-center gap-2 text-xs text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
                                <span>Language:</span>
                                <select
                                    value={editorLanguage}
                                    onChange={(event) => updateTempConfig("codeSnippet.language", event.target.value)}
                                    className="glass-border-1 bg-transparent px-2 py-1 text-xs text-[#1C1C1E] dark:text-[#F2F2F7] focus:outline-none rounded"
                                >
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang} className="text-[#1C1C1E]">
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <div className="text-xs text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
                                <span>Language: {editorLanguage}</span>
                            </div>
                        )}
                    </div>

                    <div
                        className="rounded-lg border border-[#1C1C1E]/10 dark:border-[#F2F2F7]/10 shadow-lg overflow-hidden bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur"
                    >
                        <Editor
                            height={editorHeight}
                            language={editorLanguage}
                            value={editorValue}
                            onChange={handleCodeChange}
                            onValidate={() => { }}
                            theme={editorTheme}
                            options={editorOptions}
                        />
                    </div>

                    {checkStatus !== "idle" && (
                        <div className="space-y-3">
                            {/* Feedback with icon */}
                            {validationFeedback && (
                                <div className={`p-4 glass-border-3 flex items-start gap-3 ${checkStatus === "success"
                                    ? "bg-green-50/20 dark:bg-green-950/15"
                                    : "bg-red-50/20 dark:bg-red-950/15"
                                    }`}>
                                    <div className="flex-shrink-0 mt-0.5">
                                        {checkStatus === "success" ? (
                                            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                                        ) : (
                                            <XCircle className="text-red-600 dark:text-red-400" size={20} />
                                        )}
                                    </div>
                                    <p className="text-sm leading-relaxed text-[#1C1C1E] dark:text-[#F2F2F7]">
                                        {validationFeedback}
                                    </p>
                                </div>
                            )}

                            {/* Hint Badge */}
                            {validationHint && (
                                <div className="p-3 glass-border-4 bg-blue-50/20 dark:bg-blue-950/15 flex items-start gap-2">
                                    <Lightbulb className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={18} />
                                    <div>
                                        <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed">
                                            {validationHint}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Default helper text when idle */}
                    {checkStatus === "idle" && activeHelperText && (
                        <div className="p-3 glass-border-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80 whitespace-pre-line">
                                    {activeHelperText}
                                </span>
                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() => setShowTextsModal(true)}
                                        className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full glass-border-4 text-[#1C1C1E] dark:text-[#F2F2F7] transition hover:scale-110"
                                        title="Edit helper & status texts"
                                        aria-label="Edit helper and status texts"
                                    >
                                        <Edit3 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <div className="flex flex-col gap-4">
                    <CallToAction
                        text={activeCtaText}
                        onClick={isSuccess ? handleNextClick : handleCheckClick}
                        disabled={!editorValue.trim() || isChecking}
                        dataTestId="cta-code-review"
                        reducedMotion={reducedMotion}
                        fieldLabels={{ mobile: "Initial Text", desktop: "Success Text" }}
                        icon={isChecking ? <Loader2 className="animate-spin" size={18} /> : undefined}
                    />
                </div>

                <CodeReviewTextsModal
                    isOpen={showTextsModal && isEditMode}
                    onClose={() => setShowTextsModal(false)}
                    helperText={helperTextFallback}
                    successHelperText={successHelperTextFallback}
                    checkingText={checkingMessage}
                    successText={successStatusMessage}
                    errorText={errorStatusMessage}
                    onSave={handleTextsSave}
                />
                <CommentPinsOverlay sceneId={sceneId} />
            </main>
        </FontWrapper>
    );
}

export function CodeReviewScene({ config, appConfig, onNextSlide, onCheckCode, onValidationStatusChange, selectedLanguage, sceneId, reducedMotion }: CodeReviewSceneProps & { appConfig?: any }) {
    const [configKey, setConfigKey] = useState(0);
    const [editChanges, setEditChanges] = useState<Partial<CodeReviewSceneConfig>>({});

    useEffect(() => {
        setConfigKey((prev) => prev + 1);
    }, [config.title, config.subtitle, config.language, config.codeSnippet?.language]);

    const handleSave = useCallback((newConfig: any) => {
        setEditChanges(newConfig);
    }, []);

    const currentConfig = useMemo(() => {
        return deepMerge(config, editChanges);
    }, [config, editChanges]);

    return (
        <EditModeProvider
            key={configKey}
            initialConfig={currentConfig}
            sceneId={sceneId?.toString()}
            onSave={handleSave}
        >
            <EditModePanel sceneId={sceneId} sceneLabel={(currentConfig as any)?.title} appConfig={appConfig} />
            <CodeReviewSceneContent
                config={currentConfig}
                onNextSlide={onNextSlide}
                onCheckCode={onCheckCode}
                onValidationStatusChange={onValidationStatusChange}
                selectedLanguage={selectedLanguage}
                sceneId={sceneId}
                reducedMotion={reducedMotion}
            />
        </EditModeProvider>
    );
}

