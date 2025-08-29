import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SparkleConfigType } from "./types";

export const Sparkle = React.memo(({ type, config }: { type: string; config: SparkleConfigType; }) => {
    const randomValues = useMemo(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: (config.duration || 8) + Math.random() * 4,
        delay: Math.random() * (config.delay || 2),
        x: Math.random() * 12 - 6,
        y: Math.random() * 12 - 6,
        scale: Math.random() * 0.5 + 0.3
    }), [config.duration, config.delay]);

    return (
        <motion.div
            className={`absolute w-${config.size || 0.5} h-${config.size || 0.5} bg-white/${config.opacity || 25} rounded-full`}
            style={{ left: `${randomValues.left}%`, top: `${randomValues.top}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, (config.opacity || 25) / 100, 0],
                scale: [0, randomValues.scale, 0],
                ...(type === 'floating' && { y: [0, -8, 0] }),
                ...(type === 'drifting' && { x: [0, randomValues.x, 0], y: [0, randomValues.y, 0] })
            }}
            transition={{ duration: randomValues.duration, delay: randomValues.delay, repeat: Infinity, ease: "easeInOut" }}
        />
    );
});


