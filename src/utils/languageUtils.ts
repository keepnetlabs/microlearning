import React from "react";

// Legacy → BCP47 mapping
export const mapLegacyToBCP47 = (tag: string): string => {
    if (!tag) return tag;
    const t = String(tag).trim().replace(/_/g, "-").toLowerCase();
    switch (t) {
        case "iw": return "he";
        case "in": return "id";
        case "ji": return "yi";
        case "gr": return "el";
        case "en-uk": return "en-GB";
        case "pt-br": return "pt-BR";
        case "zh-cn": return "zh-CN";
        case "zh-tw": return "zh-TW";
        default: return tag.replace(/_/g, "-");
    }
};

// BCP 47 helpers
export const normalizeBcp47Tag = (input: string): string => {
    if (!input) return "";
    const pre = mapLegacyToBCP47(input);
    const raw = String(pre).trim().replace(/_/g, "-");
    try {
        // @ts-ignore - not always typed in TS lib
        if (typeof (Intl as any).getCanonicalLocales === "function") {
            // @ts-ignore
            const arr = (Intl as any).getCanonicalLocales(raw);
            if (arr && arr.length > 0) return arr[0];
        }
    } catch {}
    try {
        // @ts-ignore
        if (typeof (Intl as any).Locale === "function") {
            // @ts-ignore
            const loc = new (Intl as any).Locale(raw);
            return loc.toString();
        }
    } catch {}
    const parts = raw.split("-");
    if (parts.length === 0) return raw.toLowerCase();
    const [language, ...rest] = parts;
    const normalized: string[] = [];
    normalized.push(language.toLowerCase());
    for (const part of rest) {
        if (/^[A-Za-z]{4}$/.test(part)) {
            normalized.push(part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
        } else if (/^[A-Za-z]{2}$/.test(part) || /^\d{3}$/.test(part)) {
            normalized.push(part.toUpperCase());
        } else {
            normalized.push(part.toLowerCase());
        }
    }
    return normalized.join("-");
};

export const extractRegionFromTag = (tag: string): string | undefined => {
    if (!tag) return undefined;
    const normalized = normalizeBcp47Tag(tag);
    const parts = normalized.split("-");
    // language [ - script ] [ - region ] [ - variants ... ]
    // Detect region: 2 alpha or 3 digits
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (/^[A-Z]{2}$/.test(part) || /^\d{3}$/.test(part)) {
            return part;
        }
    }
    return undefined;
};

export const resolveSupportedLanguage = (tag: string, supportedCodes: string[], fallback?: string): string => {
    if (!supportedCodes || supportedCodes.length === 0) return fallback || "en";
    if (!tag) return supportedCodes[0];
    const norm = normalizeBcp47Tag(tag);
    const normalizedAvailable = supportedCodes.map(c => normalizeBcp47Tag(c));
    const supportedSet = new Set(normalizedAvailable.map(c => c.toLowerCase()));
    const candidates: string[] = [];
    // Build RFC 4647 Lookup candidates by truncating from the right
    const parts = norm.split("-");
    for (let i = parts.length; i >= 1; i--) {
        candidates.push(parts.slice(0, i).join("-"));
    }
    for (const c of candidates) {
        const key = c.toLowerCase();
        if (supportedSet.has(key)) {
            const exact = normalizedAvailable.find(x => x.toLowerCase() === key)!;
            return exact;
        }
    }
    // Fallback to primary language match
    const primary = parts[0].toLowerCase();
    const primaryHit = normalizedAvailable.find(x => x.split("-")[0].toLowerCase() === primary);
    if (primaryHit) return primaryHit;
    return fallback ? normalizeBcp47Tag(fallback) : normalizedAvailable[0];
};

// Helper function to convert language codes to country codes
export const getCountryCode = (languageCode: string): string => {
    // If BCP 47 tag includes a region, prefer that
    const region = extractRegionFromTag(languageCode);
    if (region) return region;

    // Otherwise, map primary language to a default country
    const languageToCountry: { [key: string]: string } = {
        'tr': 'TR',
        'en': 'US',
        'en-gb': 'GB',
        'gr': 'GR',
        'es': 'ES',
        'es-mx': 'MX',
        'fr': 'FR',
        'de': 'DE',
        'it': 'IT',
        'pt': 'PT',
        'pt-br': 'BR',
        'ru': 'RU',
        'zh': 'CN',
        'zh-tw': 'TW',
        'ja': 'JP',
        'ko': 'KR',
        'ar': 'SA',
        'hi': 'IN',
        'bn': 'BD',
        'ur': 'PK',
        'fa': 'IR',
        'th': 'TH',
        'vi': 'VN',
        'id': 'ID',
        'ms': 'MY',
        'nl': 'NL',
        'pl': 'PL',
        'sv': 'SE',
        'da': 'DK',
        'no': 'NO',
        'fi': 'FI',
        'cs': 'CZ',
        'sk': 'SK',
        'hu': 'HU',
        'ro': 'RO',
        'bg': 'BG',
        'hr': 'HR',
        'sl': 'SI',
        'et': 'EE',
        'lv': 'LV',
        'lt': 'LT',
        'el': 'GR',
        'mt': 'MT',
        'ga': 'IE',
        'cy': 'GB',
        'eu': 'ES',
        'ca': 'ES',
        'gl': 'ES',
        'af': 'ZA',
        'sq': 'AL',
        'am': 'ET',
        'hy': 'AM',
        'az': 'AZ',
        'be': 'BY',
        'bs': 'BA',
        'ceb': 'PH',
        'ny': 'MW',
        'co': 'FR',
        'eo': 'UN',
        'tl': 'PH',
        'fy': 'NL',
        'ka': 'GE',
        'gu': 'IN',
        'ht': 'HT',
        'ha': 'NG',
        'haw': 'US',
        'iw': 'IL',
        'hmn': 'LA',
        'is': 'IS',
        'ig': 'NG',
        'jw': 'ID',
        'kn': 'IN',
        'kk': 'KZ',
        'km': 'KH',
        'ku': 'TR',
        'ky': 'KG',
        'lo': 'LA',
        'la': 'VA',
        'lb': 'LU',
        'mk': 'MK',
        'mg': 'MG',
        'ml': 'IN',
        'mi': 'NZ',
        'mr': 'IN',
        'mn': 'MN',
        'my': 'MM',
        'ne': 'NP',
        'ps': 'AF',
        'sm': 'WS',
        'gd': 'GB',
        'sr': 'RS',
        'st': 'LS',
        'sn': 'ZW',
        'sd': 'PK',
        'si': 'LK',
        'so': 'SO',
        'su': 'ID',
        'sw': 'KE',
        'tg': 'TJ',
        'ta': 'IN',
        'te': 'IN',
        'uk': 'UA',
        'uz': 'UZ',
        'xh': 'ZA',
        'yi': 'IL',
        'yo': 'NG',
        'zu': 'ZA'
    };

    const primary = String(languageCode || "").toLowerCase().split('-')[0];
    return languageToCountry[primary] || 'UN';
};


// Helper function to detect browser language
export const detectBrowserLanguage = () => {
    if (typeof window !== 'undefined') {
        const browserLang = navigator.language || navigator.languages?.[0] || 'tr';
        return normalizeBcp47Tag(browserLang);
    }
    return 'en';
};

// Custom hook for mobile detection
export const useIsMobile = () => {
    const MOBILE_BREAKPOINT = 1024;
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        // initialize immediately
        onChange();
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return !!isMobile;
};

// Complete list of supported languages
export const languages = [
    // European Languages (Most Used)
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
    { code: 'cy', name: 'Welsh', flag: '🇬🇧' },
    { code: 'gd', name: 'Scots Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { code: 'eu', name: 'Basque', flag: '🇪🇸' },
    { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
    { code: 'gl', name: 'Galician', flag: '🇪🇸' },
    { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
    { code: 'be', name: 'Belarusian', flag: '🇧🇾' },
    { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
    { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
    { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
    { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
    { code: 'lb', name: 'Luxembourgish', flag: '🇱🇺' },
    { code: 'co', name: 'Corsican', flag: '🇫🇷' },
    { code: 'fy', name: 'Frisian', flag: '🇳🇱' },
    { code: 'la', name: 'Latin', flag: '🇻🇦' },
    { code: 'eo', name: 'Esperanto', flag: '🌍' },

    // World's Most Spoken Languages
    { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
    { code: 'jw', name: 'Javanese', flag: '🇮🇩' },
    { code: 'su', name: 'Sundanese', flag: '🇮🇩' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
    { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
    { code: 'my', name: 'Myanmar (Burmese)', flag: '🇲🇲' },
    { code: 'km', name: 'Khmer', flag: '🇰🇭' },
    { code: 'lo', name: 'Lao', flag: '🇱🇦' },
    { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
    { code: 'sd', name: 'Sindhi', flag: '🇵🇰' },
    { code: 'ps', name: 'Pashto', flag: '🇦🇫' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'yi', name: 'Yiddish', flag: '🇮🇱' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
    { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
    { code: 'sm', name: 'Samoan', flag: '🇼🇸' },
    { code: 'mi', name: 'Maori', flag: '🇳🇿' },
    { code: 'haw', name: 'Hawaiian', flag: '🇺🇸' },
    { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹' },
    { code: 'ceb', name: 'Cebuano', flag: '🇵🇭' },
    { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
    { code: 'so', name: 'Somali', flag: '🇸🇴' },
    { code: 'ku', name: 'Kurdish (Kurmanji)', flag: '🇹🇷' },
    { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
    { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬' },
    { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
    { code: 'tg', name: 'Tajik', flag: '🇹🇯' },
    { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
    { code: 'hmn', name: 'Hmong', flag: '🇱🇦' }
]; 