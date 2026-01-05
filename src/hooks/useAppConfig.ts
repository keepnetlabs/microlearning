import { useState, useEffect, useRef, useCallback } from 'react';
import { detectBrowserLanguage } from '../utils/languageUtils';
import { createConfigChangeEvent, loadAppConfigAsyncCombined } from '../components/configs/appConfigLoader';
import { getApiBaseUrl, normalizeUrlParam } from '../utils/urlManager';

interface TestOverrides {
  language?: string;
}

interface UseAppConfigOptions {
  testOverrides?: TestOverrides;
}

export const useAppConfig = ({ testOverrides }: UseAppConfigOptions = {}) => {
  // Dinamik appConfig state'i - sadece remote'tan yüklenecek
  const [appConfig, setAppConfig] = useState<any>({ theme: {}, scenes: [] });
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Read remote URLs from query params (no env fallbacks), with defaults; store in refs for reuse
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const DEFAULT_LANG_URL = `lang/en`;

  const initialRemoteBaseUrl = getApiBaseUrl();

  // langUrl parametresini formatlandır: hem "lang/tr-TR" hem de "tr-TR" formatlarını destekle
  const normalizedLangUrl = (() => {
    const langUrlParam = normalizeUrlParam(urlParams?.get('langUrl')) || DEFAULT_LANG_URL;
    // Eğer "lang/" ile başlamıyorsa, ekle
    if (!langUrlParam.startsWith("lang/")) {
      return `lang/${langUrlParam}`;
    }
    return langUrlParam;
  })();

  const initialRemoteLangUrl = `${initialRemoteBaseUrl}/${normalizedLangUrl}`;
  const remoteBaseUrlRef = useRef<string>(initialRemoteBaseUrl);
  const remoteLangUrlTemplateRef = useRef<string>(initialRemoteLangUrl);

  // Backend'den gelecek tema config'i için state
  const [themeConfig, setThemeConfig] = useState(() => {
    // LocalStorage'dan kaydedilmiş tema config'ini yükle
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('theme-config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (error) {
          console.error('Error loading theme config:', error);
        }
      }
    }

    return {};
  });

  // İlk mount'ta remote config'i yükle (sadece remote)
  useEffect(() => {
    const detectedLanguage = testOverrides?.language ?? detectBrowserLanguage();
    const remoteBaseUrl = remoteBaseUrlRef.current;
    const remoteLangUrl = remoteLangUrlTemplateRef.current;
    setIsConfigLoading(true);

    // Eğer base+lang URL'si sağlanmışsa onları paralel indirip birleştir
    if (remoteBaseUrl && remoteLangUrl) {
      let isMounted = true;
      setIsConfigLoading(true);

      // During initial load: if template contains a concrete /lang/<code>, keep as-is;
      // otherwise support {lang} placeholder.
      const computeLangUrlInitial = (templateUrl: string, lang: string) => {
        const normalized = lang.toLowerCase();
        if (templateUrl.includes('{lang}')) {
          return templateUrl.replace('{lang}', normalized);
        }
        return templateUrl;
      };

      const resolvedLangUrl = computeLangUrlInitial(remoteLangUrl, detectedLanguage);

      loadAppConfigAsyncCombined(detectedLanguage, remoteBaseUrl, resolvedLangUrl, { timeoutMs: 10000 })
        .then(cfg => { if (isMounted && cfg) { setAppConfig(cfg); createConfigChangeEvent(detectedLanguage, cfg); } })
        .catch(err => { console.warn('[App] Remote combined config yüklenemedi:', err); })
        .finally(() => { if (isMounted) setIsConfigLoading(false); });

      return () => { isMounted = false; };
    }

    // Base + Language URL yoksa yükleme durdurulur
    setIsConfigLoading(false);
  }, [testOverrides?.language]);

  // appConfig değiştiğinde themeConfig'i güncelle
  useEffect(() => {
    setThemeConfig(appConfig.theme || {});
  }, [appConfig]);

  // Listen for per-scene config patches saved from EditModeProvider
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ sceneId: string; updatedConfig: any }>;
      const detail = custom.detail;
      if (!detail || !detail.sceneId || !detail.updatedConfig) return;
      setAppConfig((prev: any) => {
        if (!prev || !Array.isArray(prev.scenes)) return prev;
        const idx = prev.scenes.findIndex((s: any) => String(s.scene_id) === String(detail.sceneId));
        if (idx === -1) return prev;
        const nextScenes = [...prev.scenes];
        const scene = nextScenes[idx] || {};
        nextScenes[idx] = {
          ...scene,
          metadata: { ...(scene.metadata || {}), ...detail.updatedConfig }
        };
        return { ...prev, scenes: nextScenes };
      });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('sceneConfigPatched', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sceneConfigPatched', handler as EventListener);
      }
    };
  }, []);

  // Language change handler
  const changeLanguage = useCallback(async (newLanguage: string) => {
    const remoteBaseUrl = remoteBaseUrlRef.current;

    if (remoteBaseUrl) {
      setIsConfigLoading(true);
      try {
        // Normalize language code
        const normalized = newLanguage.toLowerCase();
        // Construct new language URL: baseUrl + /lang/{language}
        const newLangUrl = `${remoteBaseUrl}/lang/${normalized}`;
        const cfg = await loadAppConfigAsyncCombined(newLanguage, remoteBaseUrl, newLangUrl, { timeoutMs: 10000 });
        setAppConfig(cfg);
        createConfigChangeEvent(newLanguage, cfg);
      } catch (e) {
        console.warn('[App] Dil değişiminde remote combined yüklenemedi:', e);
      } finally {
        setIsConfigLoading(false);
      }
    }
  }, []);

  return {
    appConfig,
    themeConfig,
    isConfigLoading,
    setThemeConfig,
    setIsConfigLoading,
    changeLanguage,
    urlParams,
    normalizeUrlParam,
    remoteBaseUrlRef
  };
};