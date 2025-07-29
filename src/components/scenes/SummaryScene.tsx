import { CheckCircle, TrendingUp, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { SummarySceneConfig } from "../configs/educationConfigs";

interface SummarySceneProps {
  config: SummarySceneConfig;
}

export function SummaryScene({ config }: SummarySceneProps) {
  const achievements = config.achievements || [
    "Güçlü parola oluşturma teknikleri",
    "2FA kurulumu ve önemi",
    "Parola yöneticisi kullanımı",
    "Phishing saldırılarını tanıma"
  ];

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
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="mb-4 relative">
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-yellow-900/40 dark:to-orange-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-600/40 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent dark:from-yellow-900/20 dark:to-transparent rounded-3xl"></div>
          <IconComponent
            size={config.icon?.size || 48}
            className={`${config.icon?.color || 'text-yellow-500 dark:text-yellow-400'} relative z-10`}
          />
        </div>
      </div>

      <h1 className="text-2xl mb-2 text-center text-gray-900 dark:text-white">
        {config.texts?.title || "Artık Daha Güvenlisiniz!"}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 text-center">
        {config.texts?.subtitle || "Bu bilgileri ekibinizle paylaşma ve uygulamaya başlama zamanı"}
      </p>

      <div className={`relative ${config.styling?.container?.padding || 'p-6'} ${config.styling?.container?.borderRadius || 'rounded-2xl'} ${config.styling?.container?.backgroundColor || 'bg-white/90 dark:bg-gray-800/80'} backdrop-blur-xl border ${config.styling?.container?.borderColor || 'border-gray-200/60 dark:border-gray-600/60'} ${config.styling?.container?.shadow || 'shadow-xl'} max-w-md w-full`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {config.texts?.achievementsTitle || "Öğrendikleriniz:"}
          </h3>

          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start group">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <div className={`p-1.5 rounded-full bg-gradient-to-r ${config.styling?.achievements?.iconColor || 'from-green-500 to-emerald-600'} shadow-sm border border-green-200/50 dark:border-green-500/30`}>
                    <CheckCircle size={12} className="text-white" />
                  </div>
                </div>
                <span className={`text-sm ${config.styling?.achievements?.textColor || 'text-gray-800 dark:text-gray-200'} group-${config.styling?.achievements?.hoverColor || 'hover:text-gray-900 dark:hover:text-white'} transition-colors leading-relaxed font-medium`}>
                  {achievement}
                </span>
              </div>
            ))}
          </div>

          <div className={`relative mt-6 p-4 rounded-xl bg-gradient-to-r ${config.styling?.progressCard?.backgroundColor || 'from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40'} backdrop-blur-sm border ${config.styling?.progressCard?.borderColor || 'border-green-300/60 dark:border-green-600/60'} shadow-lg`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-xl"></div>
            <div className="relative z-10 flex items-center">
              <div className="p-2 rounded-lg bg-white/70 dark:bg-gray-700/60 backdrop-blur-sm border border-white/40 dark:border-gray-600/50 mr-3 shadow-sm">
                <TrendingUp size={14} className={`${config.styling?.progressCard?.iconColor || 'text-green-600 dark:text-green-400'}`} />
              </div>
              <span className={`text-sm font-medium ${config.styling?.progressCard?.textColor || 'text-green-800 dark:text-green-200'}`}>
                {config.texts?.progressMessage || "Güvenlik seviyeniz %85 arttı!"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}