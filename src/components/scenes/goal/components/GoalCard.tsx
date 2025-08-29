import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { EditableText } from "../../../common/EditableText";
import { LucideIcon } from "lucide-react";
import { getIconComponent } from "../utils/icons";
import { GoalItem } from "../types";

export const GoalCard = memo(({ goal, index, isEditMode }: {
    goal: GoalItem;
    index: number;
    isEditMode: boolean;
}) => {
    const Icon = useMemo<LucideIcon>(() => getIconComponent(goal.iconName), [goal.iconName]);

    return (
        <article
            className={`relative p-4 sm:p-5 ${isEditMode ? 'glass-border-2-no-overflow' : 'glass-border-2'} transition-all duration-500 ease-out group hover:scale-[1.03] cursor-pointer`}
            aria-labelledby={`goal-title-${index}`}
            aria-describedby={`goal-description-${index}`}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); } }}
        >
            <div className="relative z-10">
                <header className="flex items-center mb-3">
                    <div className={`p-2 sm:p-2.5 ${isEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'} rounded-xl mr-3 transition-all duration-300 ease-out group-hover:scale-105`} aria-hidden="true">
                        <Icon size={16} className={'relative z-10 transition-all duration-300 ease-out group-hover:scale-105 text-[#1C1C1E] dark:text-[#F2F2F7]'} aria-hidden="true" />
                    </div>
                    <div className="flex flex-col items-start">
                        <motion.h3 id={`goal-title-${index}`} className="text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors duration-300 ease-out">
                            <EditableText configPath={`goals.${index}.title`} placeholder="Enter goal title..." maxLength={100} as="span">
                                {goal.title}
                            </EditableText>
                        </motion.h3>
                    </div>
                </header>
                <div id={`goal-description-${index}`} className="text-sm text-left text-[#1C1C1E] dark:text-[#F2F2F7] leading-relaxed transition-colors duration-300 ease-out">
                    <EditableText configPath={`goals.${index}.description`} placeholder="Enter goal description..." maxLength={300} multiline={true} as="span">
                        {goal.description}
                    </EditableText>
                </div>
            </div>
        </article>
    );
});

GoalCard.displayName = 'GoalCard';


