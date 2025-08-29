import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { EditableText } from "../../../common/EditableText";

export const StatsItem = React.memo(({ icon: Icon, text, statsStyles, configPath, isEditMode }: {
    icon: LucideIcon;
    text: string;
    statsStyles: React.CSSProperties;
    configPath: string;
    isEditMode: boolean;
}) => {
    return (
        <motion.div
            className={`relative flex items-center space-x-2 max-h-[24px] px-2 py-1 rounded-lg transition-all duration-500 ease-out group ${isEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'}`}
            whileHover={{ scale: 1.05 }}
            style={statsStyles}
        >
            <div
                className="absolute inset-0 opacity-[0.010] dark:opacity-[0.005] rounded-lg mix-blend-overlay pointer-events-none z-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='statsNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23statsNoise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '64px 64px'
                }}
            />

            <div
                className="absolute inset-0 rounded-lg pointer-events-none dark:border-white dark:border-1 z-0"
                style={{
                    background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)`,
                    mixBlendMode: 'overlay'
                }}
            />

            <span className="relative z-10 text-[#1C1C1E] dark:text-[#F2F2F7] text-[12px] max-h-[24px] flex items-center gap-1 font-medium">
                <Icon size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10 sm:w-4 sm:h-4" strokeWidth={2} />
                <div className="relative z-20">
                    <EditableText
                        configPath={configPath}
                        placeholder={configPath === "duration" ? "Enter duration..." : "Enter level..."}
                        maxLength={50}
                        as="span"
                    >
                        {text}
                    </EditableText>
                </div>
            </span>
        </motion.div>
    );
});


