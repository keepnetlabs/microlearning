// Yeni config yükleme sistemi - sadece remote kaynaklar

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

// Taban config'ten uygulama config'ini oluştur (remote veya local fark etmeksizin)
export const buildAppConfigFromBase = (
  baseConfig: any,
  language: string,
  contentOverride?: any
): any => {
  // Dil kodunu normalize et (sadece lowercase)
  const normalizedLang = language.toLowerCase();

  // İçerik config'i uzaktan geldiyse onu kullan; yoksa base olduğu gibi kalsın
  const contentConfig = contentOverride;

  // Sağlanan base config'ten deep copy oluştur
  const appConfig = JSON.parse(JSON.stringify(baseConfig));

  // App texts ve ariaTexts'i theme'e ekle (varsa)
  if (contentConfig?.app?.texts) {
    appConfig.theme = appConfig.theme || {};
    appConfig.theme.texts = contentConfig.app.texts;
  }

  if (contentConfig?.app?.ariaTexts) {
    appConfig.theme = appConfig.theme || {};
    appConfig.theme.ariaTexts = contentConfig.app.ariaTexts;
  }

  // Scene-specific içerikleri doğru şekilde map et
  if (Array.isArray(appConfig.scenes) && contentConfig) {
    appConfig.scenes.forEach((scene: any) => {
      const sceneId = scene.scene_id;
      const sceneContent = contentConfig[sceneId];
      if (sceneContent) {
        scene.metadata = deepMerge(scene.metadata || {}, sceneContent);
      }
    });
  }

  // Dil bilgisini ekle
  appConfig.currentLanguage = normalizedLang;

  return appConfig;
};

// Config değişikliklerini dinlemek için event sistemi
export const createConfigChangeEvent = (language: string, config?: any) => {
  const event = new CustomEvent('configChanged', {
    detail: {
      language,
      config
    }
  });
  window.dispatchEvent(event);
}; 

// Remote URL'den microlearning config'i indirip appConfig oluşturan async fonksiyon
export const fetchRemoteMicrolearningConfig = async (
  url: string,
  language: string,
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<any> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 10000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: options?.signal ?? controller.signal
    } as RequestInit);

    if (!response.ok) {
      throw new Error(`Failed to fetch remote microlearning.json: ${response.status} ${response.statusText}`);
    }
    const remoteBaseConfig = await response.json();

    // İndirilen raw config'i cache'le (opsiyonel)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('remote-microlearning-config', JSON.stringify(remoteBaseConfig));
        localStorage.setItem('remote-microlearning-url', url);
      }
    } catch {}

    // Raw base'ten app config'i oluştur
    return buildAppConfigFromBase(remoteBaseConfig, language);
  } finally {
    clearTimeout(timeout);
  }
};

// Remote dil içeriğini indir
export const fetchRemoteLanguageConfig = async (
  url: string,
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<any> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 10000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: options?.signal ?? controller.signal
    } as RequestInit);
    if (!response.ok) {
      throw new Error(`Failed to fetch language content: ${response.status} ${response.statusText}`);
    }
    const langConfig = await response.json();
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('remote-language-config', JSON.stringify(langConfig));
        localStorage.setItem('remote-language-url', url);
      }
    } catch {}
    return langConfig;
  } finally {
    clearTimeout(timeout);
  }
};

// Genel amaçlı raw JSON fetcher (base config için kullanılabilir)
export const fetchRawJson = async (
  url: string,
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<any> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 10000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: options?.signal ?? controller.signal
    } as RequestInit);
    if (!response.ok) {
      throw new Error(`Failed to fetch json: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

// Remote varsa oradan, yoksa local'den yükleyen convenience fonksiyonu
export const loadAppConfigAsync = async (
  language: string,
  url?: string,
  options?: { timeoutMs?: number; signal?: AbortSignal; useCacheFirst?: boolean }
): Promise<any> => {
  const useCacheFirst = options?.useCacheFirst ?? true;

  // Cache varsa ve isteniyorsa önce onu dene
  if (useCacheFirst && typeof window !== 'undefined') {
    const cached = localStorage.getItem('remote-microlearning-config');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return buildAppConfigFromBase(parsed, language);
      } catch {}
    }
  }

  if (!url) throw new Error('[loadAppConfigAsync] url is required for remote loading');
  return await fetchRemoteMicrolearningConfig(url, language, { timeoutMs: options?.timeoutMs, signal: options?.signal });
};

// Base ve dil JSON'unu aynı anda indirip birleştir
export const loadAppConfigAsyncCombined = async (
  language: string,
  baseUrl?: string,
  langUrl?: string,
  options?: { timeoutMs?: number; signal?: AbortSignal; useCacheFirst?: boolean }
): Promise<any> => {
  const useCacheFirst = options?.useCacheFirst ?? true;
  const normalizedLang = language.toLowerCase();

  let baseConfig: any | null = null;
  let langConfig: any | null = null;

  // Cache'den oku
  if (useCacheFirst && typeof window !== 'undefined') {
    const cachedBase = localStorage.getItem('remote-microlearning-config');
    if (cachedBase) {
      try { baseConfig = JSON.parse(cachedBase); } catch {}
    }
    const cachedLang = localStorage.getItem('remote-language-config');
    if (cachedLang) {
      try { langConfig = JSON.parse(cachedLang); } catch {}
    }
  }

  // Promise.all ile paralel fetch (mevcut olmayan URL'ler skip edilir)
  try {
    const fetches: Array<Promise<any>> = [];
    if (baseUrl) fetches.push(fetchRawJson(baseUrl, { timeoutMs: options?.timeoutMs, signal: options?.signal }));
    if (langUrl) fetches.push(fetchRemoteLanguageConfig(langUrl, { timeoutMs: options?.timeoutMs, signal: options?.signal }));

    if (fetches.length > 0) {
      const results = await Promise.allSettled(fetches);
      let rIndex = 0;
      if (baseUrl) {
        const r = results[rIndex++];
        if (r.status === 'fulfilled') {
          baseConfig = r.value;
        }
      }
      if (langUrl) {
        const r = results[rIndex++];
        if (r.status === 'fulfilled') {
          langConfig = r.value;
        }
      }
    }
  } catch (err) {
    console.warn('[loadAppConfigAsyncCombined] Parallel fetch error:', err);
  }

  // baseConfig zorunlu
  if (!baseConfig) throw new Error('[loadAppConfigAsyncCombined] base config could not be loaded');

  // Build: base + dil (remote varsa)
  const appConfig = buildAppConfigFromBase(baseConfig, normalizedLang, langConfig || undefined);
  appConfig.currentLanguage = normalizedLang;
  return appConfig;
};