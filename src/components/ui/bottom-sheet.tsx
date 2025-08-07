import React from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

interface BottomSheetProps {
    open: boolean;
    onDismiss: () => void;
    children: React.ReactNode;
    title?: string;
    snapPoints?: ({ min: number; max: number } | number)[];
    defaultSnap?: ({ min: number; max: number } | number);
}

export function BottomSheetComponent({
    open,
    onDismiss,
    children,
    title,
}: BottomSheetProps) {
    return (
        <BottomSheet
            open={open}
            onDismiss={onDismiss}
            snapPoints={({ minHeight }) => [Math.max(384, minHeight), 0]}
            defaultSnap={({ maxHeight }) => Math.max(384, maxHeight)}
        >
            {title && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                </div>
            )}
            <div className="px-4 py-2">
                {children}
            </div>
        </BottomSheet>
    );
}
