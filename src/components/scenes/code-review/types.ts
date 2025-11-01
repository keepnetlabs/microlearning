export interface CodeSnippetConfig {
    content: string;
    language?: string;
    theme?: "light" | "vs-dark" | "hc-black";
    readOnly?: boolean;
    showLineNumbers?: boolean;
    automaticLayout?: boolean;
    fontSize?: number;
}

export interface CodeReviewStatusTexts {
    checking?: string;
    success?: string;
    error?: string;
}

export interface CodeReviewSceneAriaTexts {
    mainLabel?: string;
    mainDescription?: string;
    codeRegionLabel?: string;
    codeRegionDescription?: string;
    checkButtonLabel?: string;
    checkButtonDescription?: string;
}

export interface CodeReviewSceneLayoutConfig {
    containerClassName?: string;
    editorHeight?: number;
}

export interface CodeReviewSceneConfig {
    scene_type?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    language?: string;
    codeSnippet?: CodeSnippetConfig;
    checkButtonLabel?: string;
    checkButtonAriaLabel?: string;
    helperText?: string;
    successHelperText?: string;
    callToActionText?: string;
    successCallToActionText?: string;
    ariaTexts?: CodeReviewSceneAriaTexts;
    layout?: CodeReviewSceneLayoutConfig;
    checkStatusTexts?: CodeReviewStatusTexts;
}

export interface CodeReviewSceneProps {
    config: CodeReviewSceneConfig;
    onNextSlide?: () => void;
    onCheckCode?: (code: string, language?: string) => boolean | void | Promise<boolean | void>;
    sceneId?: string | number;
    reducedMotion?: boolean;
}

