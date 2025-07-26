import { ColorType, BgColorType } from "../scenes/IntroScene";

// Smishing Eğitimi Config
export const smishingConfig = {
    // Content
    title: {
        words: ["SMS", "Phishing", "Korunma"],
        highlightLastWord: true,
        gradientClasses: "bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
    },
    subtitle: "SMS tabanlı dolandırıcılık saldırılarını tanıma ve korunma yöntemleri",
    sectionTitle: "Bu Eğitimde Öğrenecekleriniz:",
    highlights: [
        {
            iconName: "smartphone",
            text: "SMS phishing saldırılarını tanıma",
            colorType: ColorType.RED,
            bgColorType: BgColorType.RED
        },
        {
            iconName: "shield",
            text: "Korunma stratejileri",
            colorType: ColorType.GREEN,
            bgColorType: BgColorType.GREEN
        },
        {
            iconName: "alert-triangle",
            text: "Şüpheli mesajları tespit etme",
            colorType: ColorType.ORANGE,
            bgColorType: BgColorType.ORANGE
        },
        {
            iconName: "users",
            text: "Ekip farkındalığı oluşturma",
            colorType: ColorType.BLUE,
            bgColorType: BgColorType.BLUE
        }
    ],
    duration: "~10 dakika",
    level: "Tüm Seviyeler",
    callToActionText: "SMS güvenliğini öğrenmek için kaydırın",

    // Visual configuration
    particles: {
        enabled: true,
        count: 15,
        color: "bg-red-400/60",
        baseDuration: 5
    },
    icon: {
        component: null,
        size: 48,
        sparkleCount: 8,
        sparkleEnabled: true,
        sparkleIconName: "alert-triangle",
        sceneIconName: "smartphone",
        className: "text-red-500"
    },
    card: {
        backgroundColor: "bg-red-50/60 dark:bg-red-900/80",
        borderColor: "border-red-200/60 dark:border-red-600/60",
        gradientFrom: "from-red-50/50",
        gradientTo: "to-red-100/20"
    },
    sparkles: {
        enabled: true,
        ambient: {
            count: 6,
            opacity: 30,
            size: 0.5,
            duration: 10,
            delay: 1
        },
        floating: {
            count: 8,
            opacity: 25,
            size: 0.5,
            duration: 12,
            delay: 2
        },
        twinkling: {
            count: 10,
            opacity: 20,
            size: 0.5,
            duration: 8,
            delay: 3
        },
        gradient: {
            count: 4,
            opacity: 18,
            size: 1,
            duration: 15,
            delay: 4
        },
        drifting: {
            count: 6,
            opacity: 15,
            size: 0.5,
            duration: 18,
            delay: 5
        },
        breathing: {
            count: 7,
            opacity: 12,
            size: 0.5,
            duration: 11,
            delay: 6
        }
    },

    // Layout
    containerClassName: "flex flex-col items-center justify-center h-full text-center relative font-['Open_Sans'] overflow-hidden px-2 sm:px-4",

    // Animation delays
    animationDelays: {
        welcomeDelay: 1.0,
        iconDelay: 0.2,
        titleDelay: 0.3,
        subtitleDelay: 1.0,
        cardDelay: 0.5,
        statsDelay: 0.8,
        ctaDelay: 1.0
    }
};

// Parola Güvenliği Eğitimi Config
export const passwordSecurityConfig = {
    title: {
        words: ["Parola", "Güvenliği", "Eğitimi"],
        highlightLastWord: true,
        gradientClasses: "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
    },
    subtitle: "Güçlü parolalar oluşturma ve güvenli parola yönetimi",
    sectionTitle: "Bu Eğitimde Öğrenecekleriniz:",
    highlights: [
        {
            iconName: "key",
            text: "Güçlü parola oluşturma",
            colorType: ColorType.BLUE,
            bgColorType: BgColorType.BLUE
        },
        {
            iconName: "lock",
            text: "Parola yöneticisi kullanımı",
            colorType: ColorType.GREEN,
            bgColorType: BgColorType.GREEN
        },
        {
            iconName: "shield",
            text: "İki faktörlü doğrulama",
            colorType: ColorType.PURPLE,
            bgColorType: BgColorType.PURPLE
        },
        {
            iconName: "database",
            text: "Güvenli parola saklama",
            colorType: ColorType.INDIGO,
            bgColorType: BgColorType.INDIGO
        }
    ],
    duration: "~8 dakika",
    level: "Tüm Seviyeler",
    callToActionText: "Parola güvenliğini öğrenmek için kaydırın",

    // Visual configuration
    particles: {
        enabled: true,
        count: 12,
        color: "bg-blue-400/60",
        baseDuration: 4
    },
    card: {
        backgroundColor: "bg-blue-50/60 dark:bg-blue-900/80",
        borderColor: "border-blue-200/60 dark:border-blue-600/60",
        gradientFrom: "from-blue-50/50",
        gradientTo: "to-blue-100/20"
    },
    icon: {
        component: null,
        size: 48,
        sparkleCount: 6,
        sparkleEnabled: true,
        sparkleIconName: "key",
        sceneIconName: "shield",
        className: "text-purple-500"
    },
    sparkles: {
        enabled: true,
        ambient: {
            count: 4,
            opacity: 25,
            size: 0.5,
            duration: 8,
            delay: 2
        },
        floating: {
            count: 6,
            opacity: 20,
            size: 0.5,
            duration: 10,
            delay: 3
        },
        twinkling: {
            count: 8,
            opacity: 18,
            size: 0.5,
            duration: 6,
            delay: 4
        },
        gradient: {
            count: 3,
            opacity: 15,
            size: 1,
            duration: 12,
            delay: 5
        },
        drifting: {
            count: 4,
            opacity: 15,
            size: 0.5,
            duration: 15,
            delay: 6
        },
        breathing: {
            count: 5,
            opacity: 12,
            size: 0.5,
            duration: 9,
            delay: 7
        }
    },

    // Layout
    containerClassName: "flex flex-col items-center justify-center h-full text-center relative font-['Open_Sans'] overflow-hidden px-2 sm:px-4",

    // Animation delays
    animationDelays: {
        welcomeDelay: 1.5,
        iconDelay: 0.1,
        titleDelay: 0.2,
        subtitleDelay: 1.2,
        cardDelay: 0.4,
        statsDelay: 1.0,
        ctaDelay: 1.2
    }
};

// Sosyal Mühendislik Eğitimi Config
export const socialEngineeringConfig = {
    title: {
        words: ["Sosyal", "Mühendislik", "Korunma"],
        highlightLastWord: true,
        gradientClasses: "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
    },
    subtitle: "Sosyal mühendislik saldırılarını tanıma ve psikolojik manipülasyondan korunma",
    sectionTitle: "Bu Eğitimde Öğrenecekleriniz:",
    card: {
        backgroundColor: "bg-purple-50/60 dark:bg-purple-900/80",
        borderColor: "border-purple-200/60 dark:border-purple-600/60",
        gradientFrom: "from-purple-50/50",
        gradientTo: "to-purple-100/20"
    },
    highlights: [
        {
            iconName: "users",
            text: "Sosyal mühendislik teknikleri",
            colorType: ColorType.PURPLE,
            bgColorType: BgColorType.PURPLE
        },
        {
            iconName: "brain",
            text: "Psikolojik manipülasyon",
            colorType: ColorType.PINK,
            bgColorType: BgColorType.PINK
        },
        {
            iconName: "eye",
            text: "Şüpheli davranışları tanıma",
            colorType: ColorType.ORANGE,
            bgColorType: BgColorType.ORANGE
        },
        {
            iconName: "shield-check",
            text: "Korunma yöntemleri",
            colorType: ColorType.GREEN,
            bgColorType: BgColorType.GREEN
        }
    ],
    duration: "~12 dakika",
    level: "Orta Seviye",
    callToActionText: "Sosyal mühendislik korunmasını öğrenmek için kaydırın",

    // Visual configuration
    particles: {
        enabled: true,
        count: 18,
        color: "bg-purple-400/60",
        baseDuration: 6
    },
    icon: {
        component: null,
        size: 48,
        sparkleCount: 10,
        sparkleEnabled: true,
        sparkleIconName: "brain",
        sceneIconName: "users",
        className: "text-blue-500"
    },
    sparkles: {
        enabled: true,
        ambient: {
            count: 8,
            opacity: 35,
            size: 0.5,
            duration: 12,
            delay: 1
        },
        floating: {
            count: 10,
            opacity: 30,
            size: 0.5,
            duration: 15,
            delay: 2
        },
        twinkling: {
            count: 12,
            opacity: 25,
            size: 0.5,
            duration: 10,
            delay: 3
        },
        gradient: {
            count: 5,
            opacity: 20,
            size: 1,
            duration: 18,
            delay: 4
        },
        drifting: {
            count: 8,
            opacity: 18,
            size: 0.5,
            duration: 20,
            delay: 5
        },
        breathing: {
            count: 9,
            opacity: 15,
            size: 0.5,
            duration: 13,
            delay: 6
        }
    },

    // Layout
    containerClassName: "flex flex-col items-center justify-center h-full text-center relative font-['Open_Sans'] overflow-hidden px-2 sm:px-4",

    // Animation delays
    animationDelays: {
        welcomeDelay: 0.8,
        iconDelay: 0.3,
        titleDelay: 0.4,
        subtitleDelay: 0.9,
        cardDelay: 0.6,
        statsDelay: 0.7,
        ctaDelay: 0.9
    }
};

// Eğitim türlerine göre config mapping
export const educationConfigs = {
    smishing: smishingConfig,
    passwordSecurity: passwordSecurityConfig,
    socialEngineering: socialEngineeringConfig,
    // Diğer eğitim türleri buraya eklenebilir...
};

export type EducationType = keyof typeof educationConfigs;