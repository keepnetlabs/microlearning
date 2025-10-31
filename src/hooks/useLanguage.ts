import React from "react";
import {
  detectBrowserLanguage,
  getCountryCode,
  languages,
  normalizeBcp47Tag,
  resolveSupportedLanguage,
  formatLanguageLabel
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
    if (langUrlRaw && langUrlRaw.startsWith("lang/")) {
      const langCode = langUrlRaw.split("/")[1];
      if (langCode) {
        return normalizeBcp47Tag(langCode);
      }
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
        case "gr":
          return "el";
        case "en-uk":
          return "en-GB";
        default:
          return normalizeBcp47Tag(code);
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
      const hasLanguage = mapped.some(lang => normalizeBcp47Tag(lang.code).toLowerCase() === normalizedTarget);
      if (!hasLanguage) {
        const master = languages.find(l => l.code.toLowerCase() === normalizedTarget);
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
    if (initialLanguageFromUrl) {
      return initialLanguageFromUrl;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selected-language");
      if (stored) {
        return normalizeBcp47Tag(stored);
      }
    }
    if (testOverrides?.language) {
      return normalizeBcp47Tag(testOverrides.language);
    }
    return normalizeBcp47Tag(detectBrowserLanguage());
  }, [initialLanguageFromUrl, testOverrides?.language]);

  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(initialSelectedLanguage);

  // Ensure selectedLanguage is valid when availability is known
  React.useEffect(() => {
    if (availableLanguages.length === 0) return;
    const supported = availableLanguages.map(l => l.code);
    const resolved = resolveSupportedLanguage(selectedLanguage, supported, availableLanguages[0]?.code);
    if (resolved && resolved !== selectedLanguage) {
      setSelectedLanguage(resolved);
    }
  }, [availableLanguages, selectedLanguage]);

  // Derived current language meta
  const currentLanguage = React.useMemo<LanguageMeta | null>(() => {
    // Try to resolve metadata for the exact selectedLanguage using master list
    const masterExact = languages.find(l => l.code.toLowerCase() === selectedLanguage.toLowerCase());

    if (availableLanguages.length > 0) {
      // If availability explicitly includes the selectedLanguage code, use it
      const exactAvail = availableLanguages.find(l => l.code.toLowerCase() === selectedLanguage.toLowerCase());
      if (exactAvail) return exactAvail as LanguageMeta;

      // Otherwise, if master has metadata for the selectedLanguage (e.g., en-US while availability has only en),
      // synthesize a meta that preserves the selectedLanguage code for UI
      if (masterExact) {
        return { code: selectedLanguage, name: masterExact.name, flag: masterExact.flag };
      }

      // Fallbacks within availability list
      const source = availableLanguages;
      const lower = source.find(l => l.code.toLowerCase() === selectedLanguage.toLowerCase());
      if (lower) return lower as LanguageMeta;
      const primary = selectedLanguage.split("-")[0].toLowerCase();
      const primaryMatch = source.find(l => l.code.split("-")[0].toLowerCase() === primary);
      if (primaryMatch) return primaryMatch as LanguageMeta;
      return (source[0] as LanguageMeta) || null;
    }

    // No availability specified: use master list
    if (masterExact) return { code: selectedLanguage, name: masterExact.name, flag: masterExact.flag };
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

  return {
    // state
    selectedLanguage,
    currentLanguage,
    availableLanguages,
    isLanguageDropdownOpen,
    languageSearchTerm,
    filteredLanguages,
    dropdownRef,

    // actions
    setIsLanguageDropdownOpen,
    setLanguageSearchTerm,
    onDropdownToggle,
    handleLanguageChange,

    // utils
    getCountryCode
  };
};


