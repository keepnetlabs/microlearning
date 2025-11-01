import { useCallback, useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { FontWrapper } from "../common/FontWrapper";
import { EditableText } from "../common/EditableText";
import { EditModePanel } from "../common/EditModePanel";
import { EditModeProvider, useEditMode } from "../../contexts/EditModeContext";
import { deepMerge } from "../../utils/deepMerge";
import { logger } from "../../utils/logger";
import { CallToAction } from "../ui/CallToAction";
import { CodeReviewTextsModal } from "./code-review/code-review-texts-modal";
import { CodeReviewSceneConfig, CodeReviewSceneProps } from "./code-review/types";
import { Edit3, LucideLoader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "./code-review/constants";

const DEFAULT_CONTAINER_CLASS = "w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6";
const DEFAULT_EDITOR_HEIGHT = 420;
const DEFAULT_CHECK_LABEL = "Run Security Check";

const getThemeFromDocument = (): "light" | "vs-dark" | "hc-black" => {
    if (typeof document === "undefined") {
        return "light";
    }
    return document.documentElement.classList.contains("dark") ? "vs-dark" : "light";
};

function CodeReviewSceneContent({
    config,
    onNextSlide,
    onCheckCode,
    sceneId,
    reducedMotion
}: CodeReviewSceneProps) {
    const { isEditMode, tempConfig, updateTempConfig } = useEditMode();

    const currentConfig: CodeReviewSceneConfig = useMemo(() => {
        return deepMerge(config, tempConfig || {});
    }, [config, tempConfig]);

    const [computedTheme, setComputedTheme] = useState<"light" | "vs-dark" | "hc-black">(() => getThemeFromDocument());
    const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
    const [showTextsModal, setShowTextsModal] = useState(false);

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

    const codeSnippet = currentConfig.codeSnippet || { content: "", language: currentConfig.language };
    const editorLanguage = (codeSnippet?.language || currentConfig.language || "javascript").toLowerCase();
    const codeContent = codeSnippet?.content ?? "";
    const [editorValue, setEditorValue] = useState(codeContent);
    const editorHeight = currentConfig.layout?.editorHeight ?? DEFAULT_EDITOR_HEIGHT;
    const containerClassName = currentConfig.layout?.containerClassName ?? DEFAULT_CONTAINER_CLASS;
    const checkLabel = currentConfig.checkButtonLabel || DEFAULT_CHECK_LABEL;
    const ariaMainLabel = currentConfig.ariaTexts?.mainLabel || "Code review scene";
    const ariaMainDescription = currentConfig.ariaTexts?.mainDescription || "Interactive code review exercise";
    const ariaCodeRegionLabel = currentConfig.ariaTexts?.codeRegionLabel || "Code snippet";
    const ariaCodeRegionDescription = currentConfig.ariaTexts?.codeRegionDescription || "Review the provided code";
    const ariaCheckLabel = currentConfig.checkButtonAriaLabel || currentConfig.ariaTexts?.checkButtonLabel || checkLabel;

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

    const initialCtaText = currentConfig.callToActionText || "Review the snippet";
    const successCtaText = currentConfig.successCallToActionText || "Continue";
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
    }, [editorValue, editorLanguage]);

    const handleCheckClick = useCallback(async () => {
        if (!editorValue.trim()) {
            return;
        }

        setCheckStatus("checking");

        try {
            let handlerResult: unknown = undefined;
            if (onCheckCode) {
                const result = onCheckCode(editorValue, editorLanguage);
                handlerResult = await Promise.resolve(result as unknown);
            } else {
                logger.push({
                    level: "warn",
                    code: "CODE_REVIEW_NO_HANDLER",
                    message: "Code review check button clicked without handler",
                    detail: { sceneId, language: editorLanguage }
                });
            }

            const didSucceed = handlerResult === undefined ? true : handlerResult !== false;

            if (didSucceed) {
                setCheckStatus("success");
            } else {
                setCheckStatus("error");
            }
        } catch (error) {
            logger.push({
                level: "error",
                code: "CODE_REVIEW_CHECK_FAILED",
                message: "Code review validation failed",
                detail: error
            });
            setCheckStatus("error");
        }
    }, [editorValue, editorLanguage, onCheckCode, sceneId]);

    const handleNextClick = useCallback(() => {
        if (checkStatus !== "success") return;
        onNextSlide?.();
    }, [checkStatus, onNextSlide]);

    const statusMessage = checkStatus === "checking"
        ? checkingMessage
        : checkStatus === "success"
            ? successStatusMessage
            : checkStatus === "error"
                ? errorStatusMessage
                : undefined;

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
                className={containerClassName}
            >
                <div className="sr-only" id={sceneId ? `code-review-description-${sceneId}` : undefined}>
                    {ariaMainDescription}
                </div>

                <header className="flex flex-col gap-3 text-center">
                    <motion.h1
                        className="project-title"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.4 }}
                    >
                        <EditableText configPath="title" placeholder="Enter title" as="span" maxLength={120}>
                            {currentConfig.title || "Code Review Challenge"}
                        </EditableText>
                    </motion.h1>

                    {currentConfig.subtitle && (
                        <motion.p
                            className="project-subtitle"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.1 }}
                        >
                            <EditableText configPath="subtitle" placeholder="Enter subtitle" as="span" maxLength={200}>
                                {currentConfig.subtitle}
                            </EditableText>
                        </motion.p>
                    )}

                    {currentConfig.description && (
                        <motion.p
                            className="text-base sm:text-lg text-[#1C1C1E] dark:text-[#F2F2F7] max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.2 }}
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
                        </motion.p>
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
                        <div className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] uppercase tracking-wide">
                            {editorLanguage}
                        </div>
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.15 }}
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
                    </motion.div>

                    {activeHelperText && (
                        <div className="text-sm text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80">
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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3 sm:max-w-md">
                        <motion.button
                            type="button"
                            onClick={handleCheckClick}
                            disabled={!editorValue.trim() || isChecking}
                            aria-label={ariaCheckLabel}
                            className={`group relative inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium focus:outline-none glass-border-3 transition ${(!editorValue.trim() || isChecking) ? "opacity-60 cursor-not-allowed" : "hover:shadow-xl"}`}
                            whileHover={(!isChecking && editorValue.trim()) ? { scale: 1.02 } : undefined}
                            whileTap={(!isChecking && editorValue.trim()) ? { scale: 0.98 } : undefined}
                        >
                            <span className="absolute inset-0 rounded-full bg-white/15 dark:bg-white/10 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                            <span className={`relative inline-flex items-center ${isChecking ? "gap-0" : "gap-2"} text-[#1C1C1E] dark:text-[#F2F2F7]`}>
                                {isChecking ? (
                                    <>
                                        <LucideLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    </>
                                ) : (
                                    <span>{checkLabel}</span>
                                )}
                            </span>
                        </motion.button>
                        {statusMessage && (
                            <p
                                className={`text-sm ${checkStatus === "error" ? "text-red-600 dark:text-red-400" : "text-[#1C1C1E]/80 dark:text-[#F2F2F7]/80"}`}
                                role="status"
                                aria-live="polite"
                            >
                                {statusMessage}
                            </p>
                        )}
                    </div>

                    <div className="flex-1">
                        <CallToAction
                            text={activeCtaText}
                            onClick={handleNextClick}
                            disabled={!isSuccess}
                            dataTestId="cta-code-review"
                            reducedMotion={reducedMotion}
                            fieldLabels={{ mobile: "Initial Text", desktop: "Success Text" }}
                        />
                    </div>
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
            </main>
        </FontWrapper>
    );
}

export function CodeReviewScene({ config, onNextSlide, onCheckCode, sceneId, reducedMotion }: CodeReviewSceneProps) {
    const [configKey, setConfigKey] = useState(0);

    useEffect(() => {
        setConfigKey((prev) => prev + 1);
    }, [config.title, config.subtitle, config.language, config.codeSnippet?.language]);

    return (
        <EditModeProvider
            key={configKey}
            initialConfig={config}
            sceneId={sceneId?.toString()}
        >
            <EditModePanel />
            <CodeReviewSceneContent
                config={config}
                onNextSlide={onNextSlide}
                onCheckCode={onCheckCode}
                sceneId={sceneId}
                reducedMotion={reducedMotion}
            />
        </EditModeProvider>
    );
}

