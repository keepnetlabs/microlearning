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
            className="bottom-sheet-glass"
            snapPoints={({ maxHeight }) => [maxHeight, 0]}
            defaultSnap={({ maxHeight }) => maxHeight}
        >
            {title && (
                <div className="pt-10">
                    <h3 className="text-[24px] font-semibold text-center text-[#1C1C1E] dark:text-[#F2F2F7]">
                        {title}
                    </h3>
                </div>
            )}
            <div className="mx-4 mt-4 mb-10">
                {children}
            </div>
        </BottomSheet>
    );
}
