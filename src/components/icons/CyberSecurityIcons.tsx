import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

// Base icon wrapper with Apple Vision Pro styling
const IconWrapper = ({ 
  children, 
  isActive = false, 
  isCompleted = false, 
  size = 24,
  glowColor = "blue"
}: {
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
  glowColor?: string;
}) => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow Background */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-md opacity-30 dark:opacity-50 transition-all duration-500`}
        style={{
          background: isCompleted 
            ? `radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)`
            : isActive
            ? `radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)`
            : `radial-gradient(circle, rgba(156, 163, 175, 0.2) 0%, rgba(156, 163, 175, 0.05) 50%, transparent 100%)`
        }}
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
          opacity: isActive ? [0.3, 0.6, 0.3] : isCompleted ? 0.4 : 0.2
        }}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// 1. Intro Scene - Digital Welcome Badge
export const IntroIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  const controls = useAnimation();
  
  useEffect(() => {
    if (isActive) {
      controls.start({
        rotate: [0, 360],
        transition: { duration: 8, repeat: Infinity, ease: "linear" }
      });
    } else {
      controls.stop();
    }
  }, [isActive, controls]);

  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Background Shield */}
        <motion.path
          d="M12 2L3 7V12C3 16.55 6.84 20.74 9.91 21.86C11.08 22.24 12.92 22.24 14.09 21.86C17.16 20.74 21 16.55 21 12V7L12 2Z"
          fill="url(#introGradient)"
          stroke="url(#introStroke)"
          strokeWidth="0.5"
          className="drop-shadow-lg"
        />
        
        {/* Scanning Lines */}
        <motion.g animate={controls}>
          <motion.line
            x1="6" y1="9" x2="18" y2="9"
            stroke="url(#scanGradient)"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity={isActive ? 0.8 : 0.4}
          />
          <motion.line
            x1="6" y1="12" x2="18" y2="12"
            stroke="url(#scanGradient)"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity={isActive ? 0.6 : 0.3}
          />
          <motion.line
            x1="6" y1="15" x2="18" y2="15"
            stroke="url(#scanGradient)"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity={isActive ? 0.4 : 0.2}
          />
        </motion.g>

        {/* Central Icon */}
        <motion.circle
          cx="12" cy="12" r="3"
          fill="url(#centerGradient)"
          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="introGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isCompleted ? "#34d399" : isActive ? "#60a5fa" : "#94a3b8"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isCompleted ? "#6ee7b7" : isActive ? "#93c5fd" : "#cbd5e1"} stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="introStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isCompleted ? "#059669" : isActive ? "#2563eb" : "#475569"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} stopOpacity="0.3" />
          </linearGradient>
          
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
          
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor={isCompleted ? "#fbbf24" : "#60a5fa"} />
            <stop offset="100%" stopColor={isCompleted ? "#f59e0b" : "#3b82f6"} />
          </radialGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 2. Goals Scene - Security Target System
export const GoalsIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Radar Rings */}
        {[0, 1, 2].map((index) => (
          <motion.circle
            key={index}
            cx="12" cy="12" r={4 + index * 3}
            fill="none"
            stroke="url(#radarGradient)"
            strokeWidth="0.8"
            strokeDasharray="2,2"
            opacity={0.4 - index * 0.1}
            animate={isActive ? {
              scale: [1, 1.1, 1],
              opacity: [0.4 - index * 0.1, 0.6 - index * 0.1, 0.4 - index * 0.1]
            } : {}}
            transition={{
              duration: 3 + index,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.5
            }}
          />
        ))}

        {/* Target Center */}
        <motion.circle
          cx="12" cy="12" r="6"
          fill="url(#targetGradient)"
          stroke="url(#targetStroke)"
          strokeWidth="1"
          animate={isActive ? { 
            scale: [1, 1.05, 1],
            rotate: [0, 360]
          } : {}}
          transition={{
            scale: { duration: 2, repeat: isActive ? Infinity : 0 },
            rotate: { duration: 10, repeat: isActive ? Infinity : 0, ease: "linear" }
          }}
        />

        {/* Inner Target */}
        <motion.circle
          cx="12" cy="12" r="3"
          fill="url(#innerTargetGradient)"
          animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: isCompleted ? 3 : 0 }}
        />

        {/* Crosshairs */}
        <motion.g
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 8, repeat: isActive ? Infinity : 0, ease: "linear" }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <line x1="12" y1="6" x2="12" y2="8" stroke="url(#crosshairGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12" y2="18" stroke="url(#crosshairGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="12" x2="8" y2="12" stroke="url(#crosshairGradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="18" y2="12" stroke="url(#crosshairGradient)" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        <defs>
          <linearGradient id="radarGradient">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
          
          <radialGradient id="targetGradient">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isCompleted ? "#34d399" : isActive ? "#60a5fa" : "#94a3b8"} stopOpacity="0.3" />
          </radialGradient>
          
          <linearGradient id="targetStroke">
            <stop offset="0%" stopColor={isCompleted ? "#059669" : isActive ? "#2563eb" : "#475569"} />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} />
          </linearGradient>
          
          <radialGradient id="innerTargetGradient">
            <stop offset="0%" stopColor={isCompleted ? "#fbbf24" : "#60a5fa"} />
            <stop offset="100%" stopColor={isCompleted ? "#f59e0b" : "#3b82f6"} />
          </radialGradient>
          
          <linearGradient id="crosshairGradient">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 3. Scenario Scene - Threat Detection Radar
export const ScenarioIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Radar Base */}
        <motion.circle
          cx="12" cy="12" r="9"
          fill="url(#radarBaseGradient)"
          stroke="url(#radarBaseStroke)"
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Radar Grid */}
        <motion.g stroke="url(#gridGradient)" strokeWidth="0.4" opacity="0.4">
          <circle cx="12" cy="12" r="6" fill="none" />
          <circle cx="12" cy="12" r="3" fill="none" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </motion.g>

        {/* Scanning Beam */}
        <motion.g
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 4, repeat: isActive ? Infinity : 0, ease: "linear" }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <motion.path
            d="M12 12 L12 3 A9 9 0 0 1 16.36 4.64 Z"
            fill="url(#beamGradient)"
            opacity={isActive ? 0.6 : 0.3}
          />
        </motion.g>

        {/* Threat Indicators */}
        {[0, 1, 2].map((index) => (
          <motion.circle
            key={index}
            cx={8 + index * 4}
            cy={8 + index * 2}
            r="1.5"
            fill={isCompleted ? "#ef4444" : isActive ? "#f59e0b" : "#64748b"}
            animate={isActive ? {
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.3
            }}
          />
        ))}

        {/* Center Monitor */}
        <motion.circle
          cx="12" cy="12" r="2"
          fill="url(#monitorGradient)"
          stroke="#ffffff"
          strokeWidth="0.5"
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            boxShadow: ["0 0 0 rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.5)", "0 0 0 rgba(59, 130, 246, 0)"]
          } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />

        <defs>
          <radialGradient id="radarBaseGradient">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#1e40af" : "#374151"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isCompleted ? "#059669" : isActive ? "#1e3a8a" : "#1f2937"} stopOpacity="0.1" />
          </radialGradient>
          
          <linearGradient id="radarBaseStroke">
            <stop offset="0%" stopColor={isCompleted ? "#34d399" : isActive ? "#3b82f6" : "#6b7280"} />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#1e40af" : "#374151"} />
          </linearGradient>
          
          <linearGradient id="gridGradient">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
          </linearGradient>
          
          <radialGradient id="monitorGradient">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e40af" />
          </radialGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 4. Actions Scene - Digital Lock/Key System
export const ActionsIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Lock Body */}
        <motion.rect
          x="7" y="11" width="10" height="8"
          rx="2"
          fill="url(#lockGradient)"
          stroke="url(#lockStroke)"
          strokeWidth="1"
          animate={isCompleted ? { 
            scale: [1, 1.05, 1],
            filter: ["hue-rotate(0deg)", "hue-rotate(120deg)", "hue-rotate(0deg)"]
          } : {}}
          transition={{ duration: 2, repeat: isCompleted ? 3 : 0 }}
        />

        {/* Lock Shackle */}
        <motion.path
          d="M9 11V8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8V11"
          fill="none"
          stroke="url(#shackleGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          animate={isActive ? {
            pathLength: [0, 1, 0],
            strokeDasharray: ["0,100", "50,50", "100,0"]
          } : {}}
          transition={{ duration: 3, repeat: isActive ? Infinity : 0 }}
        />

        {/* Security Layers */}
        {[0, 1, 2].map((index) => (
          <motion.rect
            key={index}
            x={6 - index}
            y={10 - index}
            width={12 + index * 2}
            height={10 + index * 2}
            rx="3"
            fill="none"
            stroke="url(#layerGradient)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
            opacity={0.3 - index * 0.1}
            animate={isActive ? {
              scale: [1, 1.02, 1],
              opacity: [0.3 - index * 0.1, 0.5 - index * 0.1, 0.3 - index * 0.1]
            } : {}}
            transition={{
              duration: 2 + index,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.2
            }}
          />
        ))}

        {/* Keyhole */}
        <motion.circle
          cx="12" cy="15" r="1.5"
          fill="url(#keyholeGradient)"
          animate={isActive ? {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          } : {}}
          transition={{
            scale: { duration: 1.5, repeat: isActive ? Infinity : 0 },
            rotate: { duration: 4, repeat: isActive ? Infinity : 0, ease: "linear" }
          }}
        />

        {/* Key Slot */}
        <motion.rect
          x="11.5" y="16" width="1" height="2"
          fill="url(#keyholeGradient)"
          animate={isActive ? { height: [2, 3, 2] } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        />

        {/* Digital Elements */}
        <motion.g opacity={isActive ? 1 : 0.5}>
          {[0, 1, 2, 3].map((index) => (
            <motion.circle
              key={index}
              cx={19 - index * 1.5}
              cy={6 + index * 0.5}
              r="0.8"
              fill="#60a5fa"
              animate={isActive ? {
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0,
                delay: index * 0.3
              }}
            />
          ))}
        </motion.g>

        <defs>
          <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} />
            <stop offset="100%" stopColor={isCompleted ? "#059669" : isActive ? "#1e40af" : "#374151"} />
          </linearGradient>
          
          <linearGradient id="lockStroke">
            <stop offset="0%" stopColor={isCompleted ? "#34d399" : isActive ? "#60a5fa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} />
          </linearGradient>
          
          <linearGradient id="shackleGradient">
            <stop offset="0%" stopColor={isCompleted ? "#34d399" : isActive ? "#60a5fa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} />
          </linearGradient>
          
          <linearGradient id="layerGradient">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          
          <radialGradient id="keyholeGradient">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#374151" />
          </radialGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 5. Quiz Scene - Neural Network Brain
export const QuizIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Brain Shape */}
        <motion.path
          d="M9.5 4C7.01 4 5 6.01 5 8.5C5 9.14 5.14 9.75 5.38 10.31C4.55 11.11 4 12.25 4 13.5C4 15.99 6.01 18 8.5 18H15.5C17.99 18 20 15.99 20 13.5C20 12.25 19.45 11.11 18.62 10.31C18.86 9.75 19 9.14 19 8.5C19 6.01 16.99 4 14.5 4C13.5 4 12.58 4.31 11.82 4.82C11.08 4.31 10.16 4 9.5 4Z"
          fill="url(#brainGradient)"
          stroke="url(#brainStroke)"
          strokeWidth="1"
          animate={isActive ? {
            scale: [1, 1.03, 1],
            filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
          } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />

        {/* Neural Network Nodes */}
        {[
          { x: 8, y: 8, delay: 0 },
          { x: 12, y: 9, delay: 0.2 },
          { x: 16, y: 8, delay: 0.4 },
          { x: 9, y: 12, delay: 0.6 },
          { x: 15, y: 12, delay: 0.8 },
          { x: 12, y: 15, delay: 1 }
        ].map((node, index) => (
          <motion.circle
            key={index}
            cx={node.x} cy={node.y} r="1"
            fill="url(#nodeGradient)"
            animate={isActive ? {
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6]
            } : {}}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              delay: node.delay
            }}
          />
        ))}

        {/* Neural Connections */}
        <motion.g 
          stroke="url(#connectionGradient)" 
          strokeWidth="0.8" 
          opacity={isActive ? 0.8 : 0.4}
        >
          <motion.line x1="8" y1="8" x2="12" y2="9" 
            animate={isActive ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 0.1 }}
          />
          <motion.line x1="12" y1="9" x2="16" y2="8"
            animate={isActive ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 0.3 }}
          />
          <motion.line x1="8" y1="8" x2="9" y2="12"
            animate={isActive ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 0.5 }}
          />
          <motion.line x1="16" y1="8" x2="15" y2="12"
            animate={isActive ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 0.7 }}
          />
          <motion.line x1="9" y1="12" x2="12" y2="15"
            animate={isActive ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 0.9 }}
          />
          <motion.line x1="15" y1="12" x2="12" y2="15"
            animate={isActive ? { pathLength: [0, 1, 0] } : {}}
            transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 1.1 }}
          />
        </motion.g>

        {/* Knowledge Sparks */}
        {isActive && [0, 1, 2].map((index) => (
          <motion.circle
            key={index}
            cx={10 + index * 2}
            cy={6 + index}
            r="0.5"
            fill="#fbbf24"
            animate={{
              y: [0, -10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.4
            }}
          />
        ))}

        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#8b5cf6" : "#64748b"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isCompleted ? "#059669" : isActive ? "#6d28d9" : "#374151"} stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="brainStroke">
            <stop offset="0%" stopColor={isCompleted ? "#34d399" : isActive ? "#a78bfa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#8b5cf6" : "#64748b"} />
          </linearGradient>
          
          <radialGradient id="nodeGradient">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
          
          <linearGradient id="connectionGradient">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 6. Survey Scene - Feedback Security Bubble
export const SurveyIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Chat Bubble */}
        <motion.path
          d="M4 4H20C21.1 4 22 4.9 22 6V16C22 17.1 21.1 18 20 18H7L4 21V6C4 4.9 4.9 4 6 4H4Z"
          fill="url(#bubbleGradient)"
          stroke="url(#bubbleStroke)"
          strokeWidth="1"
          animate={isActive ? {
            scale: [1, 1.02, 1],
            y: [0, -1, 0]
          } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />

        {/* Security Checkmark */}
        <motion.path
          d="M8 12L11 15L16 10"
          stroke="url(#checkGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={isCompleted ? 1 : 0}
          animate={isCompleted ? {
            pathLength: [0, 1],
            opacity: [0, 1]
          } : isActive ? {
            pathLength: [0, 1, 0],
            opacity: [0.4, 1, 0.4]
          } : {}}
          transition={{
            pathLength: { duration: 1, ease: "easeInOut" },
            opacity: { duration: 1, ease: "easeInOut" },
            repeat: isActive && !isCompleted ? Infinity : 0
          }}
        />

        {/* Feedback Lines */}
        <motion.g opacity={isActive ? 0.8 : 0.4}>
          <motion.line x1="7" y1="8" x2="17" y2="8" 
            stroke="url(#lineGradient)" 
            strokeWidth="0.8" 
            strokeLinecap="round"
            animate={isActive ? { 
              strokeDasharray: ["0,20", "10,10", "20,0"] 
            } : {}}
            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
          />
          <motion.line x1="7" y1="10" x2="14" y2="10" 
            stroke="url(#lineGradient)" 
            strokeWidth="0.8" 
            strokeLinecap="round"
            animate={isActive ? { 
              strokeDasharray: ["0,14", "7,7", "14,0"] 
            } : {}}
            transition={{ duration: 2, repeat: isActive ? Infinity : 0, delay: 0.2 }}
          />
        </motion.g>

        {/* Security Shield Overlay */}
        <motion.circle
          cx="19" cy="6" r="3"
          fill="url(#shieldGradient)"
          stroke="url(#shieldStroke)"
          strokeWidth="0.8"
          animate={isActive ? {
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />

        {/* Shield Icon */}
        <motion.path
          d="M19 4.5L17.5 5.5V7C17.5 7.55 18.27 8.27 19 8.5C19.73 8.27 20.5 7.55 20.5 7V5.5L19 4.5Z"
          fill="white"
          animate={isCompleted ? {
            fill: ["white", "#10b981", "white"]
          } : {}}
          transition={{ duration: 2, repeat: isCompleted ? 3 : 0 }}
        />

        <defs>
          <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isCompleted ? "#059669" : isActive ? "#1e40af" : "#374151"} stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="bubbleStroke">
            <stop offset="0%" stopColor={isCompleted ? "#34d399" : isActive ? "#60a5fa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} />
          </linearGradient>
          
          <linearGradient id="checkGradient">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : "#60a5fa"} />
            <stop offset="100%" stopColor={isCompleted ? "#059669" : "#3b82f6"} />
          </linearGradient>
          
          <linearGradient id="lineGradient">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
          </linearGradient>
          
          <radialGradient id="shieldGradient">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          
          <linearGradient id="shieldStroke">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 7. Summary Scene - Achievement Trophy
export const SummaryIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Trophy Base */}
        <motion.rect
          x="10" y="18" width="4" height="3"
          fill="url(#baseGradient)"
          stroke="url(#baseStroke)"
          strokeWidth="0.8"
          animate={isActive ? {
            scale: [1, 1.02, 1]
          } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />

        {/* Trophy Cup */}
        <motion.path
          d="M7 8C7 6.9 7.9 6 9 6H15C16.1 6 17 6.9 17 8V12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12V8Z"
          fill="url(#cupGradient)"
          stroke="url(#cupStroke)"
          strokeWidth="1"
          animate={isCompleted ? {
            scale: [1, 1.05, 1],
            filter: ["hue-rotate(0deg)", "hue-rotate(60deg)", "hue-rotate(0deg)"]
          } : isActive ? {
            scale: [1, 1.02, 1]
          } : {}}
          transition={{ duration: 2, repeat: (isActive || isCompleted) ? Infinity : 0 }}
        />

        {/* Trophy Handles */}
        <motion.path
          d="M17 9C18.66 9 20 10.34 20 12C20 13.66 18.66 15 17 15"
          stroke="url(#handleGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M7 9C5.34 9 4 10.34 4 12C4 13.66 5.34 15 7 15"
          stroke="url(#handleGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Security Elements */}
        <motion.circle
          cx="12" cy="11" r="2"
          fill="url(#securityGradient)"
          animate={isActive ? {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          } : {}}
          transition={{
            scale: { duration: 1.5, repeat: isActive ? Infinity : 0 },
            rotate: { duration: 4, repeat: isActive ? Infinity : 0, ease: "linear" }
          }}
        />

        {/* Victory Sparkles */}
        {(isActive || isCompleted) && [0, 1, 2, 3, 4].map((index) => (
          <motion.circle
            key={index}
            cx={6 + index * 3}
            cy={3 + Math.sin(index) * 2}
            r="0.8"
            fill="#fbbf24"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [0, -15, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}

        {/* Achievement Glow */}
        <motion.circle
          cx="12" cy="11" r="8"
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="0.5"
          opacity="0.3"
          animate={isCompleted ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          } : {}}
          transition={{ duration: 2, repeat: isCompleted ? Infinity : 0 }}
        />

        <defs>
          <linearGradient id="baseGradient">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
          
          <linearGradient id="baseStroke">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          
          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isCompleted ? "#fbbf24" : isActive ? "#3b82f6" : "#64748b"} />
            <stop offset="50%" stopColor={isCompleted ? "#f59e0b" : isActive ? "#1e40af" : "#374151"} />
            <stop offset="100%" stopColor={isCompleted ? "#d97706" : isActive ? "#1e3a8a" : "#1f2937"} />
          </linearGradient>
          
          <linearGradient id="cupStroke">
            <stop offset="0%" stopColor={isCompleted ? "#fcd34d" : isActive ? "#60a5fa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#f59e0b" : isActive ? "#3b82f6" : "#64748b"} />
          </linearGradient>
          
          <linearGradient id="handleGradient">
            <stop offset="0%" stopColor={isCompleted ? "#fbbf24" : isActive ? "#60a5fa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#f59e0b" : isActive ? "#3b82f6" : "#64748b"} />
          </linearGradient>
          
          <radialGradient id="securityGradient">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor={isCompleted ? "#10b981" : "#60a5fa"} />
          </radialGradient>
          
          <linearGradient id="glowGradient">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};

// 8. Nudge Scene - Action Arrow with Momentum
export const NudgeIcon = ({ 
  isActive = false, 
  isCompleted = false, 
  size = 24 
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  size?: number;
}) => {
  return (
    <IconWrapper isActive={isActive} isCompleted={isCompleted} size={size}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        {/* Main Arrow */}
        <motion.path
          d="M5 12H19M19 12L15 8M19 12L15 16"
          stroke="url(#arrowGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={isActive ? {
            x: [0, 5, 0],
            strokeWidth: [2.5, 3, 2.5]
          } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        />

        {/* Momentum Waves */}
        {[0, 1, 2].map((index) => (
          <motion.path
            key={index}
            d="M3 12H6"
            stroke="url(#waveGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.6 - index * 0.2}
            animate={isActive ? {
              x: [0, 15, 30],
              opacity: [0.6 - index * 0.2, 0.3 - index * 0.1, 0]
            } : {}}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.3
            }}
          />
        ))}

        {/* Target Destination */}
        <motion.circle
          cx="20" cy="12" r="2"
          fill="url(#targetDestGradient)"
          stroke="url(#targetDestStroke)"
          strokeWidth="1"
          animate={isActive ? {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        />

        {/* Security Shield on Arrow */}
        <motion.circle
          cx="12" cy="12" r="2.5"
          fill="url(#shieldOnArrowGradient)"
          stroke="url(#shieldOnArrowStroke)"
          strokeWidth="0.8"
          animate={isActive ? {
            x: [0, 5, 0],
            rotate: [0, 180, 360]
          } : {}}
          transition={{
            x: { duration: 1.5, repeat: isActive ? Infinity : 0 },
            rotate: { duration: 3, repeat: isActive ? Infinity : 0, ease: "linear" }
          }}
        />

        {/* Progress Indicators */}
        {[0, 1, 2, 3].map((index) => (
          <motion.circle
            key={index}
            cx={7 + index * 2.5}
            cy={8}
            r="0.8"
            fill={index < (isCompleted ? 4 : isActive ? 2 : 1) ? "#10b981" : "#94a3b8"}
            animate={isActive ? {
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            } : {}}
            transition={{
              duration: 1,
              repeat: isActive ? Infinity : 0,
              delay: index * 0.2
            }}
          />
        ))}

        {/* Energy Particles */}
        {isActive && [0, 1, 2, 3, 4].map((index) => (
          <motion.circle
            key={index}
            cx={8 + index * 2}
            cy={16}
            r="1"
            fill="#60a5fa"
            animate={{
              x: [0, 20, 40],
              y: [0, -5, 10],
              scale: [1, 0.5, 0],
              opacity: [1, 0.7, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}

        <defs>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#64748b"} />
            <stop offset="50%" stopColor={isCompleted ? "#34d399" : isActive ? "#60a5fa" : "#94a3b8"} />
            <stop offset="100%" stopColor={isCompleted ? "#6ee7b7" : isActive ? "#93c5fd" : "#cbd5e1"} />
          </linearGradient>
          
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
          
          <radialGradient id="targetDestGradient">
            <stop offset="0%" stopColor={isCompleted ? "#fbbf24" : "#60a5fa"} />
            <stop offset="100%" stopColor={isCompleted ? "#f59e0b" : "#3b82f6"} />
          </radialGradient>
          
          <linearGradient id="targetDestStroke">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={isCompleted ? "#fbbf24" : "#60a5fa"} stopOpacity="0.6" />
          </linearGradient>
          
          <radialGradient id="shieldOnArrowGradient">
            <stop offset="0%" stopColor={isCompleted ? "#10b981" : isActive ? "#8b5cf6" : "#64748b"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isCompleted ? "#059669" : isActive ? "#6d28d9" : "#374151"} stopOpacity="0.5" />
          </radialGradient>
          
          <linearGradient id="shieldOnArrowStroke">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor={isCompleted ? "#34d399" : isActive ? "#a78bfa" : "#94a3b8"} stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </motion.svg>
    </IconWrapper>
  );
};