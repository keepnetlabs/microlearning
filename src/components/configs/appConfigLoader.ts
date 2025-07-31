// Dil bazlı config yükleme sistemi
import appConfig from './appConfig.json';
import appConfigTr from './appConfig-tr.json';

// Desteklenen diller ve config dosyaları
const configMap: Record<string, any> = {
  'tr': appConfigTr,
  'en': appConfig, // Varsayılan İngilizce config
  'default': appConfig
};

// Config yükleme fonksiyonu
export const loadAppConfig = (language: string): any => {
  // Dil kodunu normalize et (tr-TR -> tr)
  const normalizedLang = language.toLowerCase().split('-')[0];
  // Config'i yükle
  const config = configMap[normalizedLang] || configMap['default'];

  return config;
};

// Mevcut config'i export et (geriye uyumluluk için)
export const getCurrentConfig = (language: string = 'tr') => {
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