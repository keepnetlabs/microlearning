import { ReactNode } from "react";

export interface GoalItem {
    iconName: string;
    title: string;
    subtitle?: string;
    description: string;
    iconColor: string;
    strongBgGradient: string;
    darkBgGradient: string;
}

export interface IconConfig {
    component?: ReactNode;
    size?: number;
    sceneIconName?: string;
    className?: string;
}

export interface GoalSceneConfig {
    title?: string;
    subtitle?: string;
    callToActionText?: string | { mobile?: string; desktop?: string; };
    goals?: GoalItem[];
    icon?: IconConfig;
    containerClassName?: string;
    cardSpacing?: string;
    maxWidth?: string;
}


