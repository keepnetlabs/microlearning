// Yeni config yükleme sistemi - microlearning.json + dil bazlı içerik
import microlearningConfig from './microlearning.json';
import enConfig from './en.json';
import trConfig from './tr.json';

// Desteklenen diller ve içerik dosyaları
const contentMap: Record<string, any> = {
  'tr': trConfig,
  'en': enConfig,
  'default': enConfig
};

// Deep merge fonksiyonu
const deepMerge = (target: any, source: any): any => {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
};

// Ana config yükleme fonksiyonu
export const loadAppConfig = (language: string): any => {
  // Dil kodunu normalize et (tr-TR -> tr)
  const normalizedLang = language.toLowerCase().split('-')[0];

  // İçerik config'ini yükle
  const contentConfig = contentMap[normalizedLang] || contentMap['default'];

  // microlearning.json'dan ana config'i deep copy ile al
  const appConfig = JSON.parse(JSON.stringify(microlearningConfig));

  // App texts ve ariaTexts'i theme'e ekle
  if (contentConfig.app?.texts) {
    appConfig.theme.texts = contentConfig.app.texts;
  }

  if (contentConfig.app?.ariaTexts) {
    appConfig.theme.ariaTexts = contentConfig.app.ariaTexts;
  }

  // Scene-specific içerikleri doğru şekilde map et
  appConfig.scenes.forEach((scene: any) => {
    const sceneId = scene.scene_id;
    const sceneContent = contentConfig[sceneId];

    if (sceneContent) {
      // Scene metadata'sına içeriği deep merge ile ekle
      scene.metadata = deepMerge(scene.metadata || {}, sceneContent);
    }
  });

  // Dil bilgisini ekle
  appConfig.currentLanguage = normalizedLang;

  return appConfig;
};

// Mevcut config'i export et (geriye uyumluluk için)
export const getCurrentConfig = (language: string = 'en') => {
  return loadAppConfig(language);
};

// Config değişikliklerini dinlemek için event sistemi
export const createConfigChangeEvent = (language: string) => {
  const event = new CustomEvent('configChanged', {
    detail: {
      language,
      config: loadAppConfig(language)
    }
  });
  window.dispatchEvent(event);
}; 