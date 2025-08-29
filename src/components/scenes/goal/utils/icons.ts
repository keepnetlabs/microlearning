import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconCache = new Map<string, LucideIcon>();

export const getIconComponent = (iconName: string): LucideIcon => {
    if (iconCache.has(iconName)) {
        return iconCache.get(iconName)!;
    }

    const camelCaseName = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    let iconComponent: LucideIcon;
    if (camelCaseName in LucideIcons) {
        iconComponent = LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
    } else {
        console.warn(`Icon "${iconName}" not found, using default icon`);
        iconComponent = LucideIcons.HelpCircle;
    }

    iconCache.set(iconName, iconComponent);
    return iconComponent;
};


