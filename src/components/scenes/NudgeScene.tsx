import React from "react";
import { CheckCircle, TrendingUp, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { NudgeSceneConfig } from "../configs/educationConfigs";
import { FontWrapper } from "../common/FontWrapper";

interface NudgeSceneProps {
  config: NudgeSceneConfig;
}

export function NudgeScene({ config }: NudgeSceneProps) {
  const achievements = config.achievements || [];

  // Dinamik icon mapping function (diğer componentlerle aynı)
  const getIconComponent = (iconName?: string): LucideIcon => {
    if (!iconName) {
      return LucideIcons.Award;
    }

    // İkon adını camelCase'e çevir (örn: "book-open" -> "BookOpen")
    const camelCaseName = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // Lucide ikonlarını kontrol et
    if (camelCaseName in LucideIcons) {
      return LucideIcons[camelCaseName as keyof typeof LucideIcons] as LucideIcon;
    }

    // Fallback ikon
    console.warn(`Icon "${iconName}" not found, using default icon`);
    return LucideIcons.Award;
  };

  const IconComponent = getIconComponent(config.icon?.name);

  return (
    <FontWrapper>
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="mb-4 relative">
          <div className="relative p-3 glass-border-3">
            <IconComponent
              size={config.icon?.size || 40}
              className={`text-[#1C1C1E] dark:text-[#F2F2F7] relative z-10`}
            />
          </div>
        </div>

        <h1 className="text-2xl mb-2 text-center leading-[1.5] text-[#1C1C1E] dark:text-white">
          {config.texts?.title || "Artık Daha Güvenlisiniz!"}
        </h1>
        <p className="text-[#1C1C1E] dark:text-[#F2F2F7] mb-4 text-center">
          {config.texts?.subtitle || "Bu bilgileri ekibinizle paylaşma ve uygulamaya başlama zamanı"}
        </p>

        <div className={`relative p-6 glass-border-3 max-w-md w-full`}>
          <div className="relative z-10 space-y-4">
            <h3 className="text-[#1C1C1E] dark:text-[#F2F2F7] mb-4">
              {config.texts?.achievementsTitle || "Öğrendikleriniz:"}
            </h3>

            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start group">
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    <div className={`p-1.5 glass-border-0`}>
                      <CheckCircle size={12} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                    </div>
                  </div>
                  <span className={`text-sm text-[#1C1C1E] dark:text-[#F2F2F7] group-${'hover:text-[#1C1C1E] dark:hover:text-white'} transition-colors leading-relaxed font-medium`}>
                    {achievement}
                  </span>
                </div>
              ))}
            </div>

            <div className={`relative mt-6 p-4 glass-border-3`}>
              <div className="relative z-10 flex items-center">
                <div className="p-2 glass-border-0 mr-3">
                  <TrendingUp size={14} className={`text-[#1C1C1E] dark:text-[#F2F2F7]`} />
                </div>
                <span className={`text-[#1C1C 1E] dark:text-[#F2F2F7]`}>
                  {config.texts?.progressMessage || "Güvenlik seviyeniz %85 arttı!"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FontWrapper>
  );
}