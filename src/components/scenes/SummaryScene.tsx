import { Award, CheckCircle, TrendingUp } from "lucide-react";

export function SummaryScene() {
  const achievements = [
    "Güçlü parola oluşturma teknikleri",
    "2FA kurulumu ve önemi",
    "Parola yöneticisi kullanımı",
    "Phishing saldırılarını tanıma"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="mb-4 relative">
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-yellow-900/40 dark:to-orange-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-600/40 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent dark:from-yellow-900/20 dark:to-transparent rounded-3xl"></div>
          <Award size={48} className="relative z-10 text-yellow-500 dark:text-yellow-400" />
        </div>
      </div>
      
      <h1 className="text-2xl mb-2 text-center text-gray-900 dark:text-white">
        Artık Daha Güvenlisiniz!
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 text-center">
        Bu bilgileri ekibinizle paylaşma ve uygulamaya başlama zamanı
      </p>
      
      <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-600/60 shadow-xl max-w-md w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-2xl"></div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-sm text-gray-900 dark:text-white mb-4">Öğrendikleriniz:</h3>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start group">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <div className="p-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-relaxed">
                  {achievement}
                </span>
              </div>
            ))}
          </div>
          
          <div className="relative mt-6 p-4 rounded-xl bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:from-green-900/40 dark:to-emerald-900/40 backdrop-blur-sm border border-green-200/50 dark:border-green-600/60">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20 dark:to-transparent rounded-xl"></div>
            <div className="relative z-10 flex items-center">
              <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 mr-3">
                <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-green-800 dark:text-green-200">Güvenlik seviyeniz %85 arttı!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}