import { CheckCircle, Key, Smartphone, Database, LucideIcon } from "lucide-react";
import { ActionsIcon } from "../icons/CyberSecurityIcons";
import { ReactNode } from "react";

// Import enums for consistency with other scenes
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
interface ActionItem {
  icon: LucideIcon;
  title: string;
  description: string;
  tip: string;
  colorType: ColorType;
  bgColorType: BgColorType;
}

interface IconConfig {
  component?: ReactNode;
  size?: number;
}

interface TipConfig {
  icon?: LucideIcon;
  iconSize?: number;
  bgColorType?: BgColorType;
}

interface ActionableContentSceneProps {
  // Content props
  title?: string;
  actions?: ActionItem[];
  
  // Visual configuration
  icon?: IconConfig;
  tipConfig?: TipConfig;
  
  // Layout props
  containerClassName?: string;
  cardSpacing?: string;
  maxWidth?: string;
  
  // Glass effect configuration
  glassEffect?: {
    cardBackground?: string;
    cardBorder?: string;
    shadow?: string;
    backdropBlur?: string;
  };
}

// Color mapping functions
const getIconColorClass = (colorType: ColorType): string => {
  switch (colorType) {
    case ColorType.BLUE:
      return 'text-blue-500 dark:text-blue-300';
    case ColorType.GREEN:
      return 'text-green-500 dark:text-green-300';
    case ColorType.EMERALD:
      return 'text-emerald-500 dark:text-emerald-300';
    case ColorType.PURPLE:
      return 'text-purple-500 dark:text-purple-300';
    case ColorType.RED:
      return 'text-red-500 dark:text-red-300';
    case ColorType.ORANGE:
      return 'text-orange-500 dark:text-orange-300';
    case ColorType.YELLOW:
      return 'text-yellow-500 dark:text-yellow-300';
    case ColorType.INDIGO:
      return 'text-indigo-500 dark:text-indigo-300';
    case ColorType.PINK:
      return 'text-pink-500 dark:text-pink-300';
    case ColorType.GRAY:
      return 'text-gray-500 dark:text-gray-300';
    default:
      return 'text-blue-500 dark:text-blue-300';
  }
};

const getBgGradientClass = (bgColorType: BgColorType): string => {
  switch (bgColorType) {
    case BgColorType.BLUE:
      return 'from-blue-500/20 to-indigo-500/20';
    case BgColorType.GREEN:
      return 'from-green-500/20 to-emerald-500/20';
    case BgColorType.EMERALD:
      return 'from-emerald-500/20 to-emerald-600/20';
    case BgColorType.PURPLE:
      return 'from-purple-500/20 to-pink-500/20';
    case BgColorType.RED:
      return 'from-red-500/20 to-red-600/20';
    case BgColorType.ORANGE:
      return 'from-orange-500/20 to-orange-600/20';
    case BgColorType.YELLOW:
      return 'from-yellow-500/20 to-yellow-600/20';
    case BgColorType.INDIGO:
      return 'from-indigo-500/20 to-indigo-600/20';
    case BgColorType.PINK:
      return 'from-pink-500/20 to-pink-600/20';
    case BgColorType.GRAY:
      return 'from-gray-500/20 to-gray-600/20';
    default:
      return 'from-blue-500/20 to-indigo-500/20';
  }
};

const getTipColorClass = (bgColorType: BgColorType): string => {
  switch (bgColorType) {
    case BgColorType.BLUE:
      return 'from-blue-50/50 to-indigo-50/50 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-200/30 dark:border-blue-600/60';
    case BgColorType.GREEN:
      return 'from-green-50/50 to-emerald-50/50 dark:from-green-900/40 dark:to-emerald-900/40 border-green-200/30 dark:border-green-600/60';
    case BgColorType.EMERALD:
      return 'from-emerald-50/50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-800/40 border-emerald-200/30 dark:border-emerald-600/60';
    case BgColorType.PURPLE:
      return 'from-purple-50/50 to-pink-50/50 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-200/30 dark:border-purple-600/60';
    case BgColorType.RED:
      return 'from-red-50/50 to-red-100/50 dark:from-red-900/40 dark:to-red-800/40 border-red-200/30 dark:border-red-600/60';
    case BgColorType.ORANGE:
      return 'from-orange-50/50 to-orange-100/50 dark:from-orange-900/40 dark:to-orange-800/40 border-orange-200/30 dark:border-orange-600/60';
    case BgColorType.YELLOW:
      return 'from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/40 dark:to-yellow-800/40 border-yellow-200/30 dark:border-yellow-600/60';
    case BgColorType.INDIGO:
      return 'from-indigo-50/50 to-indigo-100/50 dark:from-indigo-900/40 dark:to-indigo-800/40 border-indigo-200/30 dark:border-indigo-600/60';
    case BgColorType.PINK:
      return 'from-pink-50/50 to-pink-100/50 dark:from-pink-900/40 dark:to-pink-800/40 border-pink-200/30 dark:border-pink-600/60';
    case BgColorType.GRAY:
      return 'from-gray-50/50 to-gray-100/50 dark:from-gray-900/40 dark:to-gray-800/40 border-gray-200/30 dark:border-gray-600/60';
    default:
      return 'from-blue-50/50 to-indigo-50/50 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-200/30 dark:border-blue-600/60';
  }
};

const getTipTextColorClass = (bgColorType: BgColorType): string => {
  switch (bgColorType) {
    case BgColorType.BLUE:
      return 'text-blue-800 dark:text-blue-100';
    case BgColorType.GREEN:
      return 'text-green-800 dark:text-green-100';
    case BgColorType.EMERALD:
      return 'text-emerald-800 dark:text-emerald-100';
    case BgColorType.PURPLE:
      return 'text-purple-800 dark:text-purple-100';
    case BgColorType.RED:
      return 'text-red-800 dark:text-red-100';
    case BgColorType.ORANGE:
      return 'text-orange-800 dark:text-orange-100';
    case BgColorType.YELLOW:
      return 'text-yellow-800 dark:text-yellow-100';
    case BgColorType.INDIGO:
      return 'text-indigo-800 dark:text-indigo-100';
    case BgColorType.PINK:
      return 'text-pink-800 dark:text-pink-100';
    case BgColorType.GRAY:
      return 'text-gray-800 dark:text-gray-100';
    default:
      return 'text-blue-800 dark:text-blue-100';
  }
};

const getTipIconColorClass = (bgColorType: BgColorType): string => {
  switch (bgColorType) {
    case BgColorType.BLUE:
      return 'text-blue-600 dark:text-blue-200';
    case BgColorType.GREEN:
      return 'text-green-600 dark:text-green-200';
    case BgColorType.EMERALD:
      return 'text-emerald-600 dark:text-emerald-200';
    case BgColorType.PURPLE:
      return 'text-purple-600 dark:text-purple-200';
    case BgColorType.RED:
      return 'text-red-600 dark:text-red-200';
    case BgColorType.ORANGE:
      return 'text-orange-600 dark:text-orange-200';
    case BgColorType.YELLOW:
      return 'text-yellow-600 dark:text-yellow-200';
    case BgColorType.INDIGO:
      return 'text-indigo-600 dark:text-indigo-200';
    case BgColorType.PINK:
      return 'text-pink-600 dark:text-pink-200';
    case BgColorType.GRAY:
      return 'text-gray-600 dark:text-gray-200';
    default:
      return 'text-blue-600 dark:text-blue-200';
  }
};

export function ActionableContentScene({
  // Content defaults
  title = "Hemen Uygulanabilir Adımlar",
  actions = [
    {
      icon: Key,
      title: "Güçlü Parola Oluşturun",
      description: "En az 12 karakter, büyük-küçük harf, sayı ve sembol",
      tip: "Örnek: 'Kahve!çok7Güzel#2024'",
      colorType: ColorType.BLUE,
      bgColorType: BgColorType.BLUE
    },
    {
      icon: Smartphone,
      title: "2FA Aktifleştirin",
      description: "Tüm kritik hesaplarınızda çok faktörlü kimlik doğrulama",
      tip: "Google Authenticator veya Authy kullanın",
      colorType: ColorType.GREEN,
      bgColorType: BgColorType.GREEN
    },
    {
      icon: Database,
      title: "Parola Yöneticisi",
      description: "Her hesap için farklı ve karmaşık parolalar",
      tip: "1Password, Bitwarden veya LastPass",
      colorType: ColorType.PURPLE,
      bgColorType: BgColorType.PURPLE
    }
  ],
  
  // Visual configuration defaults
  icon = {
    component: null,
    size: 40
  },
  tipConfig = {
    icon: CheckCircle,
    iconSize: 12,
    bgColorType: BgColorType.BLUE
  },
  
  // Layout defaults
  containerClassName = "flex flex-col items-center justify-center h-full px-6",
  cardSpacing = "space-y-4",
  maxWidth = "max-w-md w-full",
  
  // Glass effect defaults
  glassEffect = {
    cardBackground: "bg-white/60 dark:bg-gray-800/80",
    cardBorder: "border-white/30 dark:border-gray-600/60",
    shadow: "shadow-lg hover:shadow-xl",
    backdropBlur: "backdrop-blur-xl"
  }
}: ActionableContentSceneProps) {

  const TipIcon = tipConfig.icon || CheckCircle;

  return (
    <div className={containerClassName}>
      <div className="mb-3">
        {icon.component || (
          <ActionsIcon 
            isActive={true}
            isCompleted={false}
            size={icon.size}
          />
        )}
      </div>
      
      <h1 className="text-xl mb-6 text-center text-gray-900 dark:text-white">
        {title}
      </h1>
      
      <div className={`${cardSpacing} ${maxWidth}`}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          const iconColor = getIconColorClass(action.colorType);
          const bgGradient = getBgGradientClass(action.bgColorType);
          const tipColorClass = getTipColorClass(action.bgColorType);
          const tipTextColor = getTipTextColorClass(action.bgColorType);
          const tipIconColor = getTipIconColorClass(action.bgColorType);
          
          return (
            <div 
              key={index} 
              className={`relative p-5 rounded-2xl ${glassEffect.cardBackground} ${glassEffect.backdropBlur} border ${glassEffect.cardBorder} ${glassEffect.shadow} transition-all duration-300 hover:scale-105`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} dark:opacity-50 rounded-2xl`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 shadow-sm">
                      <Icon size={20} className={iconColor} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-900 dark:text-white font-medium mb-2">{action.title}</h3>
                    <p className="text-xs text-gray-700 dark:text-gray-200 mb-3 leading-relaxed">{action.description}</p>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-r ${tipColorClass} backdrop-blur-sm border`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-gray-800/10 dark:to-transparent rounded-xl"></div>
                      <div className="relative z-10 flex items-start">
                        <TipIcon size={tipConfig.iconSize} className={`${tipIconColor} mr-2 mt-0.5 flex-shrink-0`} />
                        <span className={`text-xs ${tipTextColor}`}>{action.tip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}