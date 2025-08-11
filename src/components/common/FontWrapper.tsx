import React, { ReactNode } from 'react';
import { useFontFamilyContext } from '../../contexts/FontFamilyContext';

interface FontWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'monospace';
    className?: string;
    style?: React.CSSProperties;
}

export const FontWrapper: React.FC<FontWrapperProps> = ({
    children,
    variant = 'primary',
    className = '',
    style = {},
    ...rest
}) => {
    const { fontStyles } = useFontFamilyContext();

    const combinedStyle = {
        ...fontStyles[variant],
        ...style
    };

    return (
        <div className={className} style={combinedStyle} {...rest}>
            {children}
        </div>
    );
}; 