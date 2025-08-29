import React from "react";

interface UseIsIOSOptions {
    testOverrides?: {
        isIOS?: boolean;
    };
}

export const useIsIOS = ({ testOverrides }: UseIsIOSOptions = {}) => {
    const [isIOS, setIsIOS] = React.useState<boolean>(() => {
        if (testOverrides?.isIOS !== undefined) return !!testOverrides.isIOS;
        if (typeof navigator === 'undefined') return false;
        const ua = navigator.userAgent;
        const isIOSUA = /iPad|iPhone|iPod/.test(ua);
        const isIPadOS13 = (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
        return isIOSUA || isIPadOS13;
    });

    React.useEffect(() => {
        if (testOverrides?.isIOS !== undefined) {
            setIsIOS(!!testOverrides.isIOS);
        }
    }, [testOverrides?.isIOS]);

    return isIOS;
};


