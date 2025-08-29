import React from "react";
import { motion } from "framer-motion";
import { HighlightItemWithIcon } from "./types";
import { EditableText } from "../../../common/EditableText";

export const HighlightItem = React.memo(({ item, index, delays, isEditMode }: {
    item: HighlightItemWithIcon;
    index: number;
    delays: Record<string, number>;
    isEditMode: boolean;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: delays.cardItems + index * 0.15, type: "spring", stiffness: 200 }}
            whileHover={{ x: 5, transition: { type: "spring", stiffness: 400 } }}
            className="flex items-center group hover:transform hover:scale-102 transition-all duration-300"
        >
            <div className="flex-shrink-0 mr-3 sm:mr-4">
                <motion.div
                    className={`relative p-2 sm:p-3 rounded-[10px] transition-all duration-500 ease-out group-item ${isEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'}`}
                    whileHover={{ scale: 1.1, rotate: 5, transition: { type: "spring", stiffness: 400 } }}
                    style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                >
                    <item.Icon size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10 sm:w-4 sm:h-4`} strokeWidth={2} />
                </motion.div>
            </div>
            <span className="text-sm max-h-[24px] text-[#1C1C1E] dark:text-[#F2F2F7] font-medium leading-relaxed group-hover:text-[#1C1C1E] dark:group-hover:text-white transition-colors">
                <EditableText
                    configPath={`highlights.${index}.text`}
                    placeholder="Enter highlight text..."
                    maxLength={100}
                    as="span"
                >
                    {item.text}
                </EditableText>
            </span>
        </motion.div>
    );
});


