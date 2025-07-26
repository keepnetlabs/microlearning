import { Target, Users, Briefcase, Shield, LucideIcon } from "lucide-react";
import { GoalsIcon } from "../icons/CyberSecurityIcons";
import { ReactNode } from "react";

// Import enums from IntroScene for consistency
export enum ColorType {
  BLUE = 'blue',
  GREEN = 'green', 
  PURPLE = 'purple',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  INDIGO = 'indigo',
  PINK = 'pink',
  GRAY = 'gray',
  EMERALD = 'emerald'
}

export enum BgColorType {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple', 
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  INDIGO = 'indigo',
  PINK = 'pink',
  GRAY = 'gray',
  EMERALD = 'emerald'
}

// Props interfaces
interface GoalItem {
  icon: LucideIcon;
  title: string;
  description: string;
  colorType: ColorType;
  bgColorType: BgColorType;
}

interface IconConfig {
  component?: ReactNode;
  size?: number;
}

interface GoalSceneProps {
  // Content props
  title?: string;
  goals?: GoalItem[];
  
  // Visual configuration
  icon?: IconConfig;
  
  // Layout props
  containerClassName?: string;
  cardSpacing?: string;
  maxWidth?: string;
  
  // Glass effect configuration
  glassEffect?: {
    blur?: string;
    saturation?: string;
    border?: string;
    shadow?: string;
  };
}

// Color mapping functions
const getIconColorClass = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return 'text-blue-500';
    case ColorType.GREEN:
      return 'text-green-500';
    case ColorType.EMERALD:
      return 'text-emerald-500';
    case ColorType.PURPLE:
      return 'text-purple-500';
    case ColorType.RED:
      return 'text-red-500';
    case ColorType.ORANGE:
      return 'text-orange-500';
    case ColorType.YELLOW:
      return 'text-yellow-500';
    case ColorType.INDIGO:
      return 'text-indigo-500';
    case ColorType.PINK:
      return 'text-pink-500';
    case ColorType.GRAY:
      return 'text-gray-500';
    default:
      return 'text-blue-500';
  }
};

const getBgGradientClass = (bgColorType: BgColorType): string => {
  switch (bgColorType) {
    case BgColorType.BLUE:
      return 'from-blue-500/12 to-blue-600/8';
    case BgColorType.GREEN:
      return 'from-green-500/12 to-emerald-500/8';
    case BgColorType.EMERALD:
      return 'from-emerald-500/12 to-emerald-600/8';
    case BgColorType.PURPLE:
      return 'from-purple-500/12 to-purple-600/8';
    case BgColorType.RED:
      return 'from-red-500/12 to-pink-500/8';
    case BgColorType.ORANGE:
      return 'from-orange-500/12 to-orange-600/8';
    case BgColorType.YELLOW:
      return 'from-yellow-500/12 to-yellow-600/8';
    case BgColorType.INDIGO:
      return 'from-indigo-500/12 to-indigo-600/8';
    case BgColorType.PINK:
      return 'from-pink-500/12 to-pink-600/8';
    case BgColorType.GRAY:
      return 'from-gray-500/12 to-gray-600/8';
    default:
      return 'from-blue-500/12 to-blue-600/8';
  }
};

export function GoalScene({
  // Content defaults
  title = "Eğitim Hedefleri",
  goals = [
    {
      icon: Briefcase,
      title: "Profesyonel Güvenlik",
      description: "Kurumsal verileri korumak için güvenli parola politikaları oluşturmak",
      colorType: ColorType.BLUE,
      bgColorType: BgColorType.BLUE
    },
    {
      icon: Users,
      title: "Ekip Liderliği", 
      description: "Takım üyelerinize güvenlik bilinciyle örnek olmak",
      colorType: ColorType.GREEN,
      bgColorType: BgColorType.GREEN
    },
    {
      icon: Shield,
      title: "Risk Yönetimi",
      description: "Güvenlik açıklarını önceden tespit etmek ve önlemek",
      colorType: ColorType.RED,
      bgColorType: BgColorType.RED
    }
  ],
  
  // Visual configuration defaults
  icon = {
    component: null,
    size: 48
  },
  
  // Layout defaults
  containerClassName = "flex flex-col items-center justify-center h-full text-center px-6",
  cardSpacing = "space-y-4",
  maxWidth = "max-w-md w-full",
  
  // Glass effect defaults
  glassEffect = {
    blur: "blur(24px)",
    saturation: "saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.30)",
    shadow: `0 8px 32px rgba(0, 0, 0, 0.08),
             0 4px 16px rgba(0, 0, 0, 0.06),
             inset 0 1px 0 rgba(255, 255, 255, 0.20)`
  }
}: GoalSceneProps) {

  return (
    <div className={containerClassName}>
      <div className="mb-4 relative">
        {icon.component || (
          <GoalsIcon 
            isActive={true}
            isCompleted={false}
            size={icon.size}
          />
        )}
      </div>
      
      <h1 className="text-2xl mb-6 text-gray-900 dark:text-white">
        {title}
      </h1>
      
      <div className={`${cardSpacing} ${maxWidth}`}>
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const iconColor = getIconColorClass(goal.colorType);
          const bgGradient = getBgGradientClass(goal.bgColorType);
          
          return (
            <div 
              key={index} 
              className="relative p-4 sm:p-5 rounded-2xl overflow-hidden transition-all duration-500 ease-out group hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
              style={{
                // ENHANCED LIQUID GLASS BACKGROUND - Industry Standards
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.25) 0%, 
                  rgba(255, 255, 255, 0.18) 30%,
                  rgba(255, 255, 255, 0.12) 70%,
                  rgba(255, 255, 255, 0.08) 100%
                )`,
                backdropFilter: `${glassEffect.blur} ${glassEffect.saturation}`,
                WebkitBackdropFilter: `${glassEffect.blur} ${glassEffect.saturation}`,
                border: glassEffect.border,
                boxShadow: glassEffect.shadow,
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              {/* ULTRA-FINE NOISE TEXTURE - Apple VisionOS Style */}
              <div 
                className="absolute inset-0 opacity-[0.020] dark:opacity-[0.012] rounded-2xl mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='goalCardNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23goalCardNoise)'/%3E%3C/svg%3E")`,
                  backgroundSize: '200px 200px'
                }}
              />

              {/* MULTI-LAYERED GLASS GRADIENTS - Enhanced depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/8 to-white/4 dark:from-white/8 dark:via-white/4 dark:to-white/2 rounded-2xl transition-colors duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} dark:opacity-40 rounded-2xl transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-100/8 via-transparent to-transparent dark:from-gray-800/6 rounded-2xl transition-colors duration-500" />
              
              {/* APPLE-STYLE RADIAL HIGHLIGHT - Premium inner glow */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.18) 30%, rgba(255, 255, 255, 0.08) 60%, transparent 85%)`,
                  mixBlendMode: 'soft-light'
                }}
              />

              {/* ENHANCED BORDER SYSTEM - Ultra-thin with soft glow */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none" 
                style={{
                  border: '0.5px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)'
                }}
              />
              
              {/* HOVER GLOW EFFECT - Interactive feedback */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.15) 0%, 
                    rgba(255, 255, 255, 0.08) 50%, 
                    rgba(255, 255, 255, 0.05) 100%
                  )`,
                  boxShadow: '0 0 32px rgba(255, 255, 255, 0.12)'
                }}
              />

              {/* PREMIUM DARK MODE ADAPTATION */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/15 via-gray-900/8 to-gray-900/5 dark:from-gray-700/20 dark:via-gray-800/12 dark:to-gray-900/8 rounded-2xl opacity-0 dark:opacity-100 transition-opacity duration-500" />
              
              {/* CONTENT LAYER */}
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  {/* ENHANCED ICON CONTAINER - Liquid glass style */}
                  <div 
                    className="p-2 sm:p-2.5 rounded-xl mr-3 overflow-hidden transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.40) 0%, 
                        rgba(255, 255, 255, 0.25) 50%,
                        rgba(255, 255, 255, 0.15) 100%
                      )`,
                      backdropFilter: 'blur(16px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      boxShadow: `
                        0 4px 16px rgba(0, 0, 0, 0.06),
                        inset 0 1px 0 rgba(255, 255, 255, 0.25)
                      `
                    }}
                  >
                    {/* Icon container noise texture */}
                    <div 
                      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.008] rounded-xl mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='iconNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23iconNoise)'/%3E%3C/svg%3E")`,
                        backgroundSize: '64px 64px'
                      }}
                    />
                    
                    <Icon 
                      size={16} 
                      className={`${iconColor} dark:opacity-90 relative z-10 transition-all duration-300 group-hover:scale-110`} 
                    />
                  </div>
                  
                  {/* ENHANCED TITLE TEXT - Better contrast */}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                    {goal.title}
                  </h3>
                </div>
                
                {/* ENHANCED DESCRIPTION TEXT - Better readability */}
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-100">
                  {goal.description}
                </p>
              </div>

              {/* SUBTLE INNER DEPTH EFFECT */}
              <div className="absolute inset-1 bg-gradient-to-br from-white/12 via-transparent to-transparent dark:from-white/6 rounded-xl pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}