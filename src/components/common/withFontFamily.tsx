import React, { ComponentType } from 'react';
import { useFontFamilyContext } from '../../contexts/FontFamilyContext';

interface WithFontFamilyProps {
    fontVariant?: 'primary' | 'secondary' | 'monospace';
}

export const withFontFamily = <P extends object>(
    WrappedComponent: ComponentType<P>,
    fontVariant: 'primary' | 'secondary' | 'monospace' = 'primary'
) => {
    const WithFontFamilyComponent: React.FC<P & WithFontFamilyProps> = (props) => {
        const { fontStyles } = useFontFamilyContext();

        const combinedProps = {
            ...props,
            style: {
                ...fontStyles[fontVariant],
                ...(props as any).style
            }
        };

        return <WrappedComponent {...(combinedProps as P)} />;
    };

    WithFontFamilyComponent.displayName = `withFontFamily(${WrappedComponent.displayName || WrappedComponent.name})`;

    return WithFontFamilyComponent;
}; 