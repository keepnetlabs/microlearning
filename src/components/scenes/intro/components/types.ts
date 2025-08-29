import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface HighlightItemData {
    iconName: string;
    text: string;
    textColor: string;
    liquidGlassBackground?: string;
    liquidGlassBorder?: string;
    liquidGlassBoxShadow?: string;
    multiLayerGradient?: string;
    radialHighlight?: string;
    innerDepthGradient?: string;
}

export interface ParticlesConfig {
    enabled?: boolean;
    count?: number;
    color?: string;
    baseDuration?: number;
}

export interface IconConfig {
    component?: ReactNode;
    size?: number;
    sparkleCount?: number;
    sparkleEnabled?: boolean;
    sparkleIconName?: string;
    sceneIconName?: string;
    className?: string;
}

export type SparkleConfigType = {
    size?: number;
    opacity?: number;
    duration?: number;
    delay?: number;
};

export type HighlightItemWithIcon = HighlightItemData & { Icon: LucideIcon; index: number };

export interface SparklesConfig {
    enabled?: boolean;
    ambient?: { count?: number; opacity?: number; size?: number; duration?: number; delay?: number; };
    floating?: { count?: number; opacity?: number; size?: number; duration?: number; delay?: number; };
    twinkling?: { count?: number; opacity?: number; size?: number; duration?: number; delay?: number; };
    gradient?: { count?: number; opacity?: number; size?: number; duration?: number; delay?: number; };
    drifting?: { count?: number; opacity?: number; size?: number; duration?: number; delay?: number; };
    breathing?: { count?: number; opacity?: number; size?: number; duration?: number; delay?: number; };
}

export interface AnimationDelays {
    welcomeDelay?: number;
    iconDelay?: number;
    titleDelay?: number;
    subtitleDelay?: number;
    cardDelay?: number;
    statsDelay?: number;
    ctaDelay?: number;
}

export interface IntroSceneConfig {
    title?: string;
    subtitle?: string;
    sectionTitle?: string;
    highlights?: HighlightItemData[];
    duration?: string;
    level?: string;
    callToActionText?: string | { mobile?: string; desktop?: string; };
    particles?: ParticlesConfig;
    icon?: IconConfig;
    sparkles?: SparklesConfig;
    card?: { backgroundColor?: string; borderColor?: string; gradientFrom?: string; gradientTo?: string; };
    containerClassName?: string;
    animationDelays?: AnimationDelays;
}


