import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SparkleConfigType } from "./types";

export const GradientSparkle = React.memo(({ config }: { config: SparkleConfigType; }) => {
    const randomValues = useMemo(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: (config.duration || 12) + Math.random() * 6,
        delay: Math.random() * (config.delay || 5)
    }), [config.duration, config.delay]);

    return (
        <motion.div
            className={`absolute w-${config.size || 1} h-${config.size || 1} rounded-full`}
            style={{
                left: `${randomValues.left}%`,
                top: `${randomValues.top}%`,
                background: `radial-gradient(circle, rgba(255, 255, 255, ${(config.opacity || 15) / 100}) 0%, rgba(255, 255, 255, ${(config.opacity || 15) / 200}) 50%, transparent 100%)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, (config.opacity || 15) / 100, 0], scale: [0, 1, 0] }}
            transition={{ duration: randomValues.duration, delay: randomValues.delay, repeat: Infinity, ease: "easeInOut" }}
        />
    );
});


