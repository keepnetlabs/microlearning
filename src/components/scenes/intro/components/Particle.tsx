import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ParticlesConfig } from "./types";

export const Particle = React.memo(({ config }: { config: ParticlesConfig; }) => {
    const randomValues = useMemo(() => ({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        duration: (config.baseDuration || 4) + Math.random() * 3,
        delay: Math.random() * 2
    }), [config.baseDuration]);

    return (
        <motion.div
            className={`absolute w-1 h-1 ${config.color || "bg-blue-400/60"} rounded-full`}
            initial={{
                x: randomValues.x,
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                opacity: 0
            }}
            animate={{ y: -20, opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: randomValues.duration, delay: randomValues.delay, repeat: Infinity, ease: "easeOut" }}
        />
    );
});


