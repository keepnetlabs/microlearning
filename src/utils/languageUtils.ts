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
    } catch { }
    try {
        // @ts-ignore
        if (typeof (Intl as any).Locale === "function") {
            // @ts-ignore
            const loc = new (Intl as any).Locale(raw);
            return loc.toString();
        }
    } catch { }
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
    // If exact tag is supported, use it
    if (supportedSet.has(norm.toLowerCase())) return norm;
    // If a region was requested (e.g., en-US) but only primary (e.g., en) exists, preserve requested tag for UI
    const parts = norm.split("-");
    if (parts.length > 1) {
        const primary = parts[0].toLowerCase();
        const hasPrimary = normalizedAvailable.some(x => x.split('-')[0].toLowerCase() === primary);
        const hasExact = normalizedAvailable.some(x => x.toLowerCase() === norm.toLowerCase());
        if (hasPrimary && !hasExact) return norm;
    }
    const candidates: string[] = [];
    // Build RFC 4647 Lookup candidates by truncating from the right
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
    // Special rule: prefer en-GB for generic 'en' if available
    if (primary === 'en') {
        const hasEnGb = normalizedAvailable.find(x => x.toLowerCase() === 'en-gb');
        if (hasEnGb) return hasEnGb;
    }
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
        'en': 'GB',
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
        'he': 'IL',
        'iw': 'IL',
        'hmn': 'LA',
        'is': 'IS',
        'ig': 'NG',
        'jv': 'ID',
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
        'pa': 'IN',
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
        const normalized = normalizeBcp47Tag(browserLang);
        // Prefer en-GB for generic 'en'
        if (normalized.toLowerCase() === 'en') return 'en-GB';
        return normalized;
    }
    return 'en';
};

// Format a BCP 47 language tag as "Language (Region)" using Intl when available
export const formatLanguageLabel = (tag: string, locale: string = 'en'): string => {
    if (!tag) return '';
    const norm = normalizeBcp47Tag(tag);
    const parts = norm.split('-');
    const language = parts[0];
    const region = extractRegionFromTag(norm);
    try {
        // @ts-ignore
        const langNames = new (Intl as any).DisplayNames([locale], { type: 'language' });
        // @ts-ignore
        const regionNames = new (Intl as any).DisplayNames([locale], { type: 'region' });
        const langLabel = langNames.of(language) || language;
        const regionLabel = region ? (regionNames.of(region) || region) : '';
        return regionLabel ? `${langLabel} (${regionLabel})` : langLabel;
    } catch {
        // Fallback simple mapping
        const langMap: Record<string, string> = {
            'en': 'English',
            'en-GB': 'English (United Kingdom)',
            'en-US': 'English (United States)',
            'fr': 'French',
            'fr-CA': 'French (Canada)'
        };
        return langMap[norm] || norm;
    }
};

// Helper function to check if a language is RTL (Right-to-Left)
export const isRTLLanguage = (languageCode: string): boolean => {
    if (!languageCode) return false;
    const code = String(languageCode).toLowerCase().split('-')[0];
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'ps', 'sd', 'ug', 'dv'];
    return rtlLanguages.includes(code);
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
    // Core languages with explicit regions for UX clarity
    { code: 'en-GB', name: 'English (United Kingdom)', flag: '🇬🇧' },
    { code: 'en-US', name: 'English (United States)', flag: '🇺🇸' },
    { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
    { code: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦' },
    { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'nl-NL', name: 'Dutch (Netherlands)', flag: '🇳🇱' },
    { code: 'pl-PL', name: 'Polish (Poland)', flag: '🇵🇱' },
    { code: 'ru-RU', name: 'Russian (Russia)', flag: '🇷🇺' },
    { code: 'tr-TR', name: 'Turkish (Turkey)', flag: '🇹🇷' },

    // Nordics & Baltics
    { code: 'sv-SE', name: 'Swedish (Sweden)', flag: '🇸🇪' },
    { code: 'da-DK', name: 'Danish (Denmark)', flag: '🇩🇰' },
    { code: 'no-NO', name: 'Norwegian (Norway)', flag: '🇳🇴' },
    { code: 'fi-FI', name: 'Finnish (Finland)', flag: '🇫🇮' },
    { code: 'et-EE', name: 'Estonian (Estonia)', flag: '🇪🇪' },
    { code: 'lv-LV', name: 'Latvian (Latvia)', flag: '🇱🇻' },
    { code: 'lt-LT', name: 'Lithuanian (Lithuania)', flag: '🇱🇹' },

    // Central & Eastern Europe
    { code: 'cs-CZ', name: 'Czech (Czechia)', flag: '🇨🇿' },
    { code: 'hu-HU', name: 'Hungarian (Hungary)', flag: '🇭🇺' },
    { code: 'ro-RO', name: 'Romanian (Romania)', flag: '🇷🇴' },
    { code: 'bg-BG', name: 'Bulgarian (Bulgaria)', flag: '🇧🇬' },
    { code: 'hr-HR', name: 'Croatian (Croatia)', flag: '🇭🇷' },
    { code: 'sk-SK', name: 'Slovak (Slovakia)', flag: '🇸🇰' },
    { code: 'sl-SI', name: 'Slovenian (Slovenia)', flag: '🇸🇮' },
    { code: 'el-GR', name: 'Greek (Greece)', flag: '🇬🇷' },

    // East Asia
    { code: 'zh-CN', name: 'Chinese (Simplified, China)', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional, Taiwan)', flag: '🇹🇼' },
    { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean (South Korea)', flag: '🇰🇷' },

    // South & Southeast Asia
    { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
    { code: 'bn-BD', name: 'Bengali (Bangladesh)', flag: '🇧🇩' },
    { code: 'ur-PK', name: 'Urdu (Pakistan)', flag: '🇵🇰' },
    { code: 'th-TH', name: 'Thai (Thailand)', flag: '🇹🇭' },
    { code: 'vi-VN', name: 'Vietnamese (Vietnam)', flag: '🇻🇳' },
    { code: 'id-ID', name: 'Indonesian (Indonesia)', flag: '🇮🇩' },
    { code: 'ms-MY', name: 'Malay (Malaysia)', flag: '🇲🇾' },
    { code: 'tl-PH', name: 'Filipino (Philippines)', flag: '🇵🇭' },
    { code: 'jv-ID', name: 'Javanese (Indonesia)', flag: '🇮🇩' },
    { code: 'su-ID', name: 'Sundanese (Indonesia)', flag: '🇮🇩' },
    { code: 'ta-IN', name: 'Tamil (India)', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu (India)', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada (India)', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam (India)', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi (India)', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'Punjabi (India)', flag: '🇮🇳' },
    { code: 'si-LK', name: 'Sinhala (Sri Lanka)', flag: '🇱🇰' },
    { code: 'my-MM', name: 'Burmese (Myanmar)', flag: '🇲🇲' },
    { code: 'km-KH', name: 'Khmer (Cambodia)', flag: '🇰🇭' },
    { code: 'lo-LA', name: 'Lao (Laos)', flag: '🇱🇦' },
    { code: 'ne-NP', name: 'Nepali (Nepal)', flag: '🇳🇵' },

    // Middle East & Africa
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
    { code: 'fa-IR', name: 'Persian (Iran)', flag: '🇮🇷' },
    { code: 'he-IL', name: 'Hebrew (Israel)', flag: '🇮🇱' },
    { code: 'am-ET', name: 'Amharic (Ethiopia)', flag: '🇪🇹' },
    { code: 'sw-KE', name: 'Swahili (Kenya)', flag: '🇰🇪' },
    { code: 'ha-NG', name: 'Hausa (Nigeria)', flag: '🇳🇬' },
    { code: 'yo-NG', name: 'Yoruba (Nigeria)', flag: '🇳🇬' },
    { code: 'ig-NG', name: 'Igbo (Nigeria)', flag: '🇳🇬' },
    { code: 'zu-ZA', name: 'Zulu (South Africa)', flag: '🇿🇦' },
    { code: 'xh-ZA', name: 'Xhosa (South Africa)', flag: '🇿🇦' },
    { code: 'af-ZA', name: 'Afrikaans (South Africa)', flag: '🇿🇦' },
    { code: 'st-LS', name: 'Sesotho (Lesotho)', flag: '🇱🇸' },
    { code: 'so-SO', name: 'Somali (Somalia)', flag: '🇸🇴' },

    // Other European/Adjacents
    { code: 'is-IS', name: 'Icelandic (Iceland)', flag: '🇮🇸' },
    { code: 'lb-LU', name: 'Luxembourgish (Luxembourg)', flag: '🇱🇺' },
    { code: 'co-FR', name: 'Corsican (France)', flag: '🇫🇷' },
    { code: 'fy-NL', name: 'Frisian (Netherlands)', flag: '🇳🇱' },
    { code: 'ga-IE', name: 'Irish (Ireland)', flag: '🇮🇪' },
    { code: 'cy-GB', name: 'Welsh (United Kingdom)', flag: '🇬🇧' },
    { code: 'mt-MT', name: 'Maltese (Malta)', flag: '🇲🇹' },
    { code: 'sq-AL', name: 'Albanian (Albania)', flag: '🇦🇱' },
    { code: 'be-BY', name: 'Belarusian (Belarus)', flag: '🇧🇾' },
    { code: 'bs-BA', name: 'Bosnian (Bosnia & Herzegovina)', flag: '🇧🇦' },
    { code: 'mk-MK', name: 'Macedonian (North Macedonia)', flag: '🇲🇰' },
    { code: 'sr-RS', name: 'Serbian (Serbia)', flag: '🇷🇸' },
    { code: 'uk-UA', name: 'Ukrainian (Ukraine)', flag: '🇺🇦' },
    { code: 'hy-AM', name: 'Armenian (Armenia)', flag: '🇦🇲' },
    { code: 'ka-GE', name: 'Georgian (Georgia)', flag: '🇬🇪' },
    { code: 'az-AZ', name: 'Azerbaijani (Azerbaijan)', flag: '🇦🇿' },

    // Others & constructed
    { code: 'la-VA', name: 'Latin (Vatican City)', flag: '🇻🇦' },
    { code: 'eo', name: 'Esperanto', flag: '🌍' },
    { code: 'ps-AF', name: 'Pashto (Afghanistan)', flag: '🇦🇫' },
    { code: 'sd-PK', name: 'Sindhi (Pakistan)', flag: '🇵🇰' },
    { code: 'ht-HT', name: 'Haitian Creole (Haiti)', flag: '🇭🇹' },
    { code: 'sm-WS', name: 'Samoan (Samoa)', flag: '🇼🇸' },
    { code: 'mi-NZ', name: 'Maori (New Zealand)', flag: '🇳🇿' },
    { code: 'haw-US', name: 'Hawaiian (United States)', flag: '🇺🇸' },
    { code: 'ceb-PH', name: 'Cebuano (Philippines)', flag: '🇵🇭' },
    { code: 'mg-MG', name: 'Malagasy (Madagascar)', flag: '🇲🇬' }, { code: 'kk-KZ', name: 'Kazakh (Kazakhstan)', flag: '🇰🇿' },
    { code: 'ky-KG', name: 'Kyrgyz (Kyrgyzstan)', flag: '🇰🇬' },
    { code: 'uz-UZ', name: 'Uzbek (Uzbekistan)', flag: '🇺🇿' },
    { code: 'tg-TJ', name: 'Tajik (Tajikistan)', flag: '🇹🇯' },
    { code: 'mn-MN', name: 'Mongolian (Mongolia)', flag: '🇲🇳' },
    { code: 'hmn-LA', name: 'Hmong (Laos)', flag: '🇱🇦' }
].map((l) => ({ ...l, code: l.code.toLowerCase() })); 