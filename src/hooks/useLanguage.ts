import React from "react";
import {
  detectBrowserLanguage,
  getCountryCode,
  languages,
  normalizeBcp47Tag,
  resolveSupportedLanguage
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

    return codes.map(code => {
      const metaCode = mapAvailabilityToLanguageCode(code);
      const meta = languages.find(l => l.code.toLowerCase() === metaCode.toLowerCase());
      return {
        code, // keep the original availability code for selection and API
        name: meta?.name || code.toUpperCase(),
        flag: meta?.flag || "🏳️"
      };
    });
  }, [appConfig]);

  // Dropdown and search state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = React.useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Initialize selected language from URL langUrl, localStorage, test override or browser language
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("selected-language") : undefined;
    const langUrl = normalizeUrlParam(urlParams?.get("langUrl"));
    if (langUrl && langUrl.startsWith("lang/")) {
      const langFromUrl = langUrl.split("/")[1];
      if (langFromUrl) {
        return normalizeBcp47Tag(langFromUrl);
      }
    }
    return normalizeBcp47Tag(saved || testOverrides?.language || detectBrowserLanguage());
  });

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
    const source = availableLanguages.length > 0 ? availableLanguages : languages;
    const exact = source.find(l => l.code === selectedLanguage);
    if (exact) return exact as LanguageMeta;
    const lower = source.find(l => l.code.toLowerCase() === selectedLanguage.toLowerCase());
    if (lower) return lower as LanguageMeta;
    const primary = selectedLanguage.split("-")[0].toLowerCase();
    const primaryMatch = source.find(l => l.code.split("-")[0].toLowerCase() === primary);
    return (primaryMatch as LanguageMeta) || (source[0] as LanguageMeta);
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
    try { localStorage.setItem("selected-language", newLanguage); } catch {}
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


