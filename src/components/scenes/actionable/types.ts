import type { LucideIcon } from "lucide-react";

export interface ActionItem {
    iconName: string;
    title: string;
    description: string;
    tip: string;
    iconColorClass: string;
    bgGradientClass: string;
    tipColorClass: string;
    tipTextColorClass: string;
    tipIconColorClass: string;
}

export interface IconConfig {
    component?: LucideIcon;
    size?: number;
    className?: string;
    sceneIconName?: string;
}

export interface TipConfig {
    iconName?: string;
    iconSize?: number;
    tipColorClass?: string;
    tipTextColorClass?: string;
    tipIconColorClass?: string;
}

export interface ActionableContentSceneConfig {
    title: string;
    subtitle: string;
    callToActionText?: string | { mobile?: string; desktop?: string; };
    successCallToActionText?: string | { mobile?: string; desktop?: string; };
    actions: ActionItem[];
    icon: IconConfig;
    tipConfig: TipConfig;
    cardSpacing?: string;
    maxWidth?: string;
    glassEffect?: {
        cardBackground: string;
        cardBorder: string;
        shadow: string;
        backdropBlur: string;
    };
    ariaTexts?: {
        mainLabel?: string;
        mainDescription?: string;
        headerLabel?: string;
        actionCardsLabel?: string;
        actionCardsDescription?: string;
        actionCardLabel?: string;
        tipLabel?: string;
    };
}

export interface ActionableContentSceneProps {
    config: ActionableContentSceneConfig;
}


