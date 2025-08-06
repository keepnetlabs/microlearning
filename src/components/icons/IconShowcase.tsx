import { useState } from "react";
import { motion } from "framer-motion";
import {
  IntroIcon,
  GoalsIcon,
  ScenarioIcon,
  ActionsIcon,
  QuizIcon,
  SurveyIcon,
  SummaryIcon,
  NudgeIcon
} from "./CyberSecurityIcons";

interface IconDemoProps {
  name: string;
  Icon: React.ComponentType<any>;
  description: string;
}

const IconDemo = ({ name, Icon, description }: IconDemoProps) => {
  const [state, setState] = useState<'passive' | 'active' | 'completed'>('passive');

  const stateConfig = {
    passive: { isActive: false, isCompleted: false },
    active: { isActive: true, isCompleted: false },
    completed: { isActive: false, isCompleted: true }
  };

  return (
    <motion.div
      layout
      className="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-600/60 shadow-lg transition-colors duration-300"
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon Display */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Icon
            {...stateConfig[state]}
            size={48}
          />
        </div>
      </div>

      {/* Icon Info */}
      <div className="text-center mb-2">
        <h3 className="font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-1">{name}</h3>
        <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] mb-3">{description}</p>
      </div>

      {/* State Controls */}
      <div className="flex justify-center space-x-2">
        {['passive', 'active', 'completed'].map((stateOption) => (
          <button
            key={stateOption}
            onClick={() => setState(stateOption as any)}
            className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 text-[#1C1C1E] dark:text-[#F2F2F7] glass-border-0`}
          >
            {stateOption.charAt(0).toUpperCase() + stateOption.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export const IconShowcase = () => {
  const icons = [
    {
      name: "Giriş",
      Icon: IntroIcon,
      description: "Dijital Hoşgeldin Badge - Güvenlik tarayıcı çizgileri"
    },
    {
      name: "Hedefler",
      Icon: GoalsIcon,
      description: "Güvenlik Hedef Sistemi - Radar halkaları ve crosshair"
    },
    {
      name: "Senaryo",
      Icon: ScenarioIcon,
      description: "Tehdit Tespit Radarı - Tarama ışını ve alarm sistemi"
    },
    {
      name: "Eylemler",
      Icon: ActionsIcon,
      description: "Dijital Kilit/Anahtar - Güvenlik katmanları"
    },
    {
      name: "Quiz",
      Icon: QuizIcon,
      description: "Güvenlik Neural Ağ - Beyin bağlantıları ve bilgi akışı"
    },
    {
      name: "Anket",
      Icon: SurveyIcon,
      description: "Geri Bildirim Balonu - Güvenlik onay sistemi"
    },
    {
      name: "Özet",
      Icon: SummaryIcon,
      description: "Başarı Kupası - Siber güvenlik achievement elementi"
    },
    {
      name: "Harekete Geç",
      Icon: NudgeIcon,
      description: "Aksiyon Oku - Güvenlik momentum dalgaları ve hedef"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">
          Cybersecurity Training Icon System
        </h1>
        <p className="text-lg text-[#1C1C1E] dark:text-[#F2F2F7] mb-4">
          Apple Vision Pro aesthetics with 3D gradients, glow effects and micro-animations
        </p>
        <div className="flex justify-center space-x-4 text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">
          <span>🔵 Passive</span>
          <span>🟦 Active</span>
          <span>🟢 Completed</span>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {icons.map((icon, index) => (
          <motion.div
            key={icon.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <IconDemo {...icon} />
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Apple Vision Pro Aesthetics",
            description: "3D görünüm, gradient geçişleri ve cam efektleri",
            icon: "🎨"
          },
          {
            title: "Micro Animations",
            description: "Parlayan ışık, tarama efektleri, güvenlik shield dolması",
            icon: "✨"
          },
          {
            title: "Cybersecurity Metaphors",
            description: "Soyut değil, anlamlı güvenlik metaforları",
            icon: "🔐"
          },
          {
            title: "Dark Mode Compatible",
            description: "Cam efektli dark mode ile mükemmel uyum",
            icon: "🌙"
          },
          {
            title: "Responsive Design",
            description: "Figma component olarak export edilebilir",
            icon: "📱"
          },
          {
            title: "State Management",
            description: "Aktif / Pasif / Tamamlandı versiyonları",
            icon: "⚡"
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/40 dark:border-gray-600/40 shadow-sm transition-colors duration-300"
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-1">{feature.title}</h3>
            <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7]">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};