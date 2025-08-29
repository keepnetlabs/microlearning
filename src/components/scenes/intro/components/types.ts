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


