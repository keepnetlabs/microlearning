import React, { ReactNode } from 'react';
import { useFontFamilyContext } from '../../contexts/FontFamilyContext';

interface FontWrapperProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'monospace';
    className?: string;
    style?: React.CSSProperties;
}

export const FontWrapper: React.FC<FontWrapperProps> = ({
    children,
    variant = 'primary',
    className = '',
    style = {}
}) => {
    const { fontStyles } = useFontFamilyContext();

    const combinedStyle = {
        ...fontStyles[variant],
        ...style
    };

    return (
        <div className={className} style={combinedStyle}>
            {children}
        </div>
    );
}; 