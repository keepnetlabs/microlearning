import React from "react";
import {
  detectBrowserLanguage,
  getCountryCode,
  languages,
  normalizeBcp47Tag,
  resolveSupportedLanguage,
  formatLanguageLabel,
  isRTLLanguage
} from "../utils/languageUtils";

interface TestOverrides {
  language?: string;
}

interface UseLanguageOptions {
  appConfig: any;
  urlParams?: URLSearchParams | null;
  normalizeUrlParam: (value?: string | null) => string;
  testOverrides?: TestOverrides;
  changeLanguage: (newLanguage: string) => void;
}

interface LanguageMeta {
  code: string;
  name: string;
  flag: string;
}

export const useLanguage = ({
  appConfig,
  urlParams,
  normalizeUrlParam,
  testOverrides,
  changeLanguage
}: UseLanguageOptions) => {
  const initialLanguageFromUrl = React.useMemo(() => {
    const langUrlRaw = normalizeUrlParam(urlParams?.get("langUrl"));
    if (!langUrlRaw) return null;

    // Format 1: lang/tr-TR
    if (langUrlRaw.startsWith("lang/")) {
      const langCode = langUrlRaw.split("/")[1];
      if (langCode) {
        return normalizeBcp47Tag(langCode);
      }
    }

    // Format 2: tr-TR (direk dil kodu)
    if (langUrlRaw && !langUrlRaw.includes("/")) {
      return normalizeBcp47Tag(langUrlRaw);
    }

    return null;
  }, [urlParams, normalizeUrlParam]);

  // Derive available languages from remote microlearning metadata
  const availableLanguages: LanguageMeta[] = React.useMemo(() => {
    const codes = Array.isArray(appConfig?.microlearning_metadata?.language_availability)
      ? (appConfig.microlearning_metadata.language_availability as string[]).map(c => String(c).toLowerCase())
      : [] as string[];
    if (codes.length === 0) return [];

    const mapAvailabilityToLanguageCode = (code: string): string => {
      switch (code.toLowerCase()) {
        case "gr": return "el";
        case "en-uk": return "en-GB";
        case "tl": return "tl-PH";
        case "fil": return "tl-PH"; // Map fil -> tl-PH directly
        default: return normalizeBcp47Tag(code);
      }
    };

    const mapped = codes.map(code => {
      const metaCode = mapAvailabilityToLanguageCode(code);
      // Prefer a regional variant from master list if availability provided only primary code
      let lookupCode = metaCode;
      if (!metaCode.includes("-")) {
        const preferred = languages.find(l => l.code.split("-")[0].toLowerCase() === metaCode.toLowerCase());
        if (preferred) lookupCode = preferred.code;
      }
      const meta = languages.find(l => l.code.toLowerCase() === lookupCode.toLowerCase());
      return {
        code, // keep original availability code for selection and API
        name: meta?.name || formatLanguageLabel(lookupCode),
        flag: meta?.flag || "🏳️"
      };
    });

    if (initialLanguageFromUrl) {
      const normalizedTarget = normalizeBcp47Tag(initialLanguageFromUrl).toLowerCase();
      // Check if URL language is already in mapped list (handling strict or fuzzy/primary match)
      const hasLanguage = mapped.some(lang => {
        const lCode = normalizeBcp47Tag(lang.code).toLowerCase();
        // Exact match OR primary code match (e.g. tl vs tl-PH)
        return lCode === normalizedTarget || lCode.split('-')[0] === normalizedTarget.split('-')[0];
      });

      if (!hasLanguage) {
        // Fallback: try to find a regional variant (e.g. tl -> tl-PH) or primary match from MASTER list
        let master = languages.find(l => l.code.toLowerCase() === normalizedTarget);
        if (!master && !normalizedTarget.includes("-")) {
          // Try primary match
          master = languages.find(l => l.code.split("-")[0].toLowerCase() === normalizedTarget);
        }

        mapped.unshift({
          code: initialLanguageFromUrl,
          name: master?.name || formatLanguageLabel(initialLanguageFromUrl),
          flag: master?.flag || "🏳️"
        });
      }
    }

    return mapped;
  }, [appConfig, initialLanguageFromUrl]);

  // Dropdown and search state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = React.useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Initialize selected language from URL langUrl, localStorage, test override or browser language
  const initialSelectedLanguage = React.useMemo(() => {
    if (initialLanguageFromUrl) return initialLanguageFromUrl;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selected-language");
      if (stored) return normalizeBcp47Tag(stored);
    }
    if (testOverrides?.language) return normalizeBcp47Tag(testOverrides.language);
    return normalizeBcp47Tag(detectBrowserLanguage());
  }, [initialLanguageFromUrl, testOverrides?.language]);

  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(initialSelectedLanguage);

  // Ensure selectedLanguage is valid when availability is known
  React.useEffect(() => {
    if (availableLanguages.length === 0) return;

    const supported = availableLanguages.map(l => l.code);
    const resolved = resolveSupportedLanguage(selectedLanguage, supported, availableLanguages[0]?.code);

    // Only update if resolved is different AND semantically different (ignore simple casing or primary match)
    if (resolved && normalizeBcp47Tag(resolved) !== normalizeBcp47Tag(selectedLanguage)) {
      const selectedPrimary = selectedLanguage.split('-')[0].toLowerCase();
      const resolvedPrimary = resolved.split('-')[0].toLowerCase();
      // Treat fil and tl as same primary
      const p1 = (selectedPrimary === 'fil') ? 'tl' : selectedPrimary;
      const p2 = (resolvedPrimary === 'fil') ? 'tl' : resolvedPrimary;

      if (p1 === p2) return; // Keep user selection if it matches primary (e.g. user selected 'tl', resolved 'tl-PH')

      setSelectedLanguage(resolved);
    }
  }, [availableLanguages, selectedLanguage]);

  // Helper to find equivalent language metadata
  const findEquivalentMetadata = (targetCode: string, list: LanguageMeta[]): LanguageMeta | null => {
    if (list.length === 0) return null;

    // 1. Exact match
    const exact = list.find(l => l.code.toLowerCase() === targetCode.toLowerCase());
    if (exact) return exact;

    // 2. Primary/Fuzzy match (handling fil/tl equivalence)
    const targetPrimary = targetCode.split("-")[0].toLowerCase();
    const targetPrimaryNorm = (targetPrimary === 'fil') ? 'tl' : targetPrimary;

    const fuzzy = list.find(l => {
      const lPrimary = l.code.split("-")[0].toLowerCase();
      const lPrimaryNorm = (lPrimary === 'fil') ? 'tl' : lPrimary;
      return lPrimaryNorm === targetPrimaryNorm;
    });

    return fuzzy || null;
  };

  // Derived current language meta
  const currentLanguage = React.useMemo<LanguageMeta | null>(() => {
    // 1. Try to resolve metadata from the MASTER list first (for best flag/name)
    const masterMeta = findEquivalentMetadata(selectedLanguage, languages);

    if (availableLanguages.length > 0) {
      // 2. If availability list exists, ensure we pick a valid entry from there (or map to it)
      const availMeta = findEquivalentMetadata(selectedLanguage, availableLanguages);

      if (availMeta) return availMeta;

      // 3. If selected language is somehow not in availability despite checks, fallback to master meta if we have it
      if (masterMeta) {
        return { code: selectedLanguage, name: masterMeta.name, flag: masterMeta.flag };
      }

      // 4. Last resort: first available language
      return (availableLanguages[0] as LanguageMeta) || null;
    }

    // No availability specified: use master list result
    if (masterMeta) return { code: selectedLanguage, name: masterMeta.name, flag: masterMeta.flag };

    return (languages[0] as LanguageMeta) || null;
  }, [selectedLanguage, availableLanguages]);

  // Filtered list based on search term
  const filteredLanguages = React.useMemo(() => {
    const source = availableLanguages.length > 0 ? availableLanguages : [] as LanguageMeta[];
    if (!languageSearchTerm) return source;
    const q = languageSearchTerm.toLowerCase();
    return source.filter(l => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  }, [languageSearchTerm, availableLanguages]);

  // Public change handler with availability guard + persistence + remote fetch
  const handleLanguageChange = React.useCallback((newLanguage: string) => {
    if (availableLanguages.length > 0) {
      const allowed = new Set(availableLanguages.map(l => l.code.toLowerCase()));
      if (!allowed.has(newLanguage.toLowerCase())) return;
    }
    setSelectedLanguage(newLanguage);
    try { localStorage.setItem("selected-language", newLanguage); } catch { }
    changeLanguage(newLanguage);
  }, [availableLanguages, changeLanguage]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
        setLanguageSearchTerm("");
      }
    };
    if (isLanguageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isLanguageDropdownOpen]);

  // Close dropdown on Escape
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLanguageDropdownOpen(false);
        setLanguageSearchTerm("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onDropdownToggle = React.useCallback(() => {
    setIsLanguageDropdownOpen(prev => !prev);
  }, []);

  // Derived RTL state
  const isRTL = React.useMemo(() => isRTLLanguage(selectedLanguage), [selectedLanguage]);

  return {
    // state
    selectedLanguage,
    currentLanguage,
    availableLanguages,
    isLanguageDropdownOpen,
    languageSearchTerm,
    filteredLanguages,
    dropdownRef,
    isRTL,

    // actions
    setIsLanguageDropdownOpen,
    setLanguageSearchTerm,
    onDropdownToggle,
    handleLanguageChange,

    // utils
    getCountryCode
  };
};
