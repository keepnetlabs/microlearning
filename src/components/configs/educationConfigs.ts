
export enum ColorType {
    BLUE = 'blue',
    GREEN = 'green',
    PURPLE = 'purple',
    RED = 'red',
    ORANGE = 'orange',
    YELLOW = 'yellow',
    INDIGO = 'indigo',
    PINK = 'pink',
    GRAY = 'gray',
    EMERALD = 'emerald'
}

// Direct CSS class mappings for colors
export const ColorClasses = {
    BLUE: {
        icon: 'text-blue-500 dark:text-blue-300',
        bgGradient: 'from-blue-500/20 to-indigo-500/20',
        tip: 'from-blue-50/50 to-indigo-50/50 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-200/30 dark:border-blue-600/60',
        tipText: 'text-blue-800 dark:text-blue-100',
        tipIcon: 'text-blue-600 dark:text-blue-200'
    },
    GREEN: {
        icon: 'text-green-500 dark:text-green-300',
        bgGradient: 'from-green-500/20 to-emerald-500/20',
        tip: 'from-green-50/50 to-emerald-50/50 dark:from-green-900/40 dark:to-emerald-900/40 border-green-200/30 dark:border-green-600/60',
        tipText: 'text-green-800 dark:text-green-100',
        tipIcon: 'text-green-600 dark:text-green-200'
    },
    EMERALD: {
        icon: 'text-emerald-500 dark:text-emerald-300',
        bgGradient: 'from-emerald-500/20 to-emerald-600/20',
        tip: 'from-emerald-50/50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-800/40 border-emerald-200/30 dark:border-emerald-600/60',
        tipText: 'text-emerald-800 dark:text-emerald-100',
        tipIcon: 'text-emerald-600 dark:text-emerald-200'
    },
    PURPLE: {
        icon: 'text-purple-500 dark:text-purple-300',
        bgGradient: 'from-purple-500/20 to-pink-500/20',
        tip: 'from-purple-50/50 to-pink-50/50 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-200/30 dark:border-purple-600/60',
        tipText: 'text-purple-800 dark:text-purple-100',
        tipIcon: 'text-purple-600 dark:text-purple-200'
    },
    RED: {
        icon: 'text-red-500 dark:text-red-300',
        bgGradient: 'from-red-500/20 to-red-600/20',
        tip: 'from-red-50/50 to-red-100/50 dark:from-red-900/40 dark:to-red-800/40 border-red-200/30 dark:border-red-600/60',
        tipText: 'text-red-800 dark:text-red-100',
        tipIcon: 'text-red-600 dark:text-red-200'
    },
    ORANGE: {
        icon: 'text-orange-500 dark:text-orange-300',
        bgGradient: 'from-orange-500/20 to-orange-600/20',
        tip: 'from-orange-50/50 to-orange-100/50 dark:from-orange-900/40 dark:to-orange-800/40 border-orange-200/30 dark:border-orange-600/60',
        tipText: 'text-orange-800 dark:text-orange-100',
        tipIcon: 'text-orange-600 dark:text-orange-200'
    },
    YELLOW: {
        icon: 'text-yellow-500 dark:text-yellow-300',
        bgGradient: 'from-yellow-500/20 to-yellow-600/20',
        tip: 'from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/40 dark:to-yellow-800/40 border-yellow-200/30 dark:border-yellow-600/60',
        tipText: 'text-yellow-800 dark:text-yellow-100',
        tipIcon: 'text-yellow-600 dark:text-yellow-200'
    },
    INDIGO: {
        icon: 'text-indigo-500 dark:text-indigo-300',
        bgGradient: 'from-indigo-500/20 to-indigo-600/20',
        tip: 'from-indigo-50/50 to-indigo-100/50 dark:from-indigo-900/40 dark:to-indigo-800/40 border-indigo-200/30 dark:border-indigo-600/60',
        tipText: 'text-indigo-800 dark:text-indigo-100',
        tipIcon: 'text-indigo-600 dark:text-indigo-200'
    },
    PINK: {
        icon: 'text-pink-500 dark:text-pink-300',
        bgGradient: 'from-pink-500/20 to-pink-600/20',
        tip: 'from-pink-50/50 to-pink-100/50 dark:from-pink-900/40 dark:to-pink-800/40 border-pink-200/30 dark:border-pink-600/60',
        tipText: 'text-pink-800 dark:text-pink-100',
        tipIcon: 'text-pink-600 dark:text-pink-200'
    },
    GRAY: {
        icon: 'text-gray-500 dark:text-gray-300',
        bgGradient: 'from-gray-500/20 to-gray-600/20',
        tip: 'from-gray-50/50 to-gray-100/50 dark:from-gray-900/40 dark:to-gray-800/40 border-gray-200/30 dark:border-gray-600/60',
        tipText: 'text-gray-800 dark:text-gray-100',
        tipIcon: 'text-gray-600 dark:text-gray-200'
    }
};


export interface SurveySceneConfig {
    texts?: {
        title?: string;
        ratingQuestion?: string;
        topicsQuestion?: string;
        feedbackQuestion?: string;
        feedbackPlaceholder?: string;
        submitButton?: string;
        submittingText?: string;
        ratingRequiredText?: string;
        dataSecurityNotice?: string;
        successTitle?: string;
        successMessage1?: string;
        successMessage2?: string;
        successMessage3?: string;
        thankYouMessage?: string;
        // Accessibility texts
        mainLabel?: string;
        successDescription?: string;
        successRegionLabel?: string;
        successIconLabel?: string;
        formDescription?: string;
        headerLabel?: string;
        formContentDescription?: string;
        ratingDescription?: string;
        starLabel?: string;
        topicsDescription?: string;
        topicLabel?: string;
        feedbackDescription?: string;
        feedbackLabel?: string;
        submitSectionLabel?: string;
        submittingLabel?: string;
        submitLabel?: string;
        securityNoticeLabel?: string;
    };
    ariaTexts?: {
        mainLabel?: string;
        successDescription?: string;
        successRegionLabel?: string;
        successIconLabel?: string;
        formDescription?: string;
        headerLabel?: string;
        formContentDescription?: string;
        ratingDescription?: string;
        starLabel?: string;
        topicsDescription?: string;
        topicLabel?: string;
        feedbackDescription?: string;
        feedbackLabel?: string;
        submitSectionLabel?: string;
        submittingLabel?: string;
        submitLabel?: string;
        securityNoticeLabel?: string;
    };
    topics?: string[];
    icon?: {
        name?: string;
        size?: number;
        color?: string;
        isActive?: boolean;
        isCompleted?: boolean;
    };
    styling?: {
        container?: {
            backgroundColor?: string;
            borderColor?: string;
            borderRadius?: string;
            padding?: string;
            shadow?: string;
        };
        rating?: {
            starColor?: string;
            starSize?: string;
            hoverColor?: string;
        };
        topics?: {
            checkboxColor?: string;
            textColor?: string;
            hoverColor?: string;
        };
        feedback?: {
            backgroundColor?: string;
            borderColor?: string;
            textColor?: string;
            placeholderColor?: string;
        };
        submitButton?: {
            backgroundColor?: string;
            textColor?: string;
            disabledColor?: string;
            borderRadius?: string;
            padding?: string;
        };
        successCard?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
        };
    };
}

export interface SummarySceneConfig {
    texts?: {
        title?: string;
        subtitle?: string;
        achievementsTitle?: string;
        progressMessage?: string;
    };
    achievements?: string[];
    icon?: {
        name?: string;
        size?: number;
        color?: string;
    };
    styling?: {
        container?: {
            padding?: string;
            borderRadius?: string;
            backgroundColor?: string;
            borderColor?: string;
            shadow?: string;
        };
        achievements?: {
            iconColor?: string;
            textColor?: string;
            hoverColor?: string;
        };
        progressCard?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
        };
    };
}


const smishingGoalConfig = {
    title: "SMS Güvenlik Hedefleri",
    goals: [
        {
            iconName: "smartphone",
            title: "SMS Tehditleri Tanıma",
            subtitle: "Farkındalık",
            description: "SMS tabanlı phishing saldırılarını hızlıca tanıma ve tespit etme",
            colorType: ColorType.RED
        },
        {
            iconName: "shield",
            title: "Korunma Stratejileri",
            subtitle: "Savunma",
            description: "SMS saldırılarına karşı etkili korunma yöntemleri geliştirme",
            colorType: ColorType.GREEN
        },
        {
            iconName: "alert-triangle",
            title: "Şüpheli Mesaj Tespiti",
            subtitle: "Vigilance",
            description: "Şüpheli SMS mesajlarını analiz etme ve doğrulama",
            colorType: ColorType.ORANGE
        }
    ],
    icon: {
        component: null,
        size: 48,
        sceneIconName: "target",
        className: "text-red-500"
    },

    glassEffect: {
        blur: "blur(24px)",
        saturation: "saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.30)",
        shadow: `0 8px 32px rgba(0, 0, 0, 0.08),
                 0 4px 16px rgba(0, 0, 0, 0.06),
                 inset 0 1px 0 rgba(255, 255, 255, 0.20)`
    }
};

// Parola Güvenliği Eğitimi Config
const passwordSecurityIntroConfig = {
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
            colorType: ColorType.BLUE
        },
        {
            iconName: "lock",
            text: "Parola yöneticisi kullanımı",
            colorType: ColorType.GREEN
        },
        {
            iconName: "shield",
            text: "İki faktörlü doğrulama",
            colorType: ColorType.PURPLE
        },
        {
            iconName: "database",
            text: "Güvenli parola saklama",
            colorType: ColorType.INDIGO
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

const passwordSecurityGoalConfig = {
    title: "Parola Güvenlik Hedefleri",
    goals: [
        {
            iconName: "key",
            title: "Güçlü Parola Oluşturma",
            subtitle: "Komplekslik",
            description: "Karmaşık ve güvenli parolalar oluşturma becerisi geliştirme",
            colorType: ColorType.BLUE
        },
        {
            iconName: "lock",
            title: "Parola Yöneticisi",
            subtitle: "Organizasyon",
            description: "Parola yöneticisi kullanarak güvenli parola saklama",
            colorType: ColorType.GREEN
        },
        {
            iconName: "shield",
            title: "İki Faktörlü Doğrulama",
            subtitle: "Ekstra Güvenlik",
            description: "2FA kullanarak hesap güvenliğini artırma",
            colorType: ColorType.PURPLE
        }
    ],
    icon: {
        component: null,
        size: 48,
        sceneIconName: "shield",
        className: "text-blue-500"
    },
    glassEffect: {
        blur: "blur(24px)",
        saturation: "saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.30)",
        shadow: `0 8px 32px rgba(0, 0, 0, 0.08),
                 0 4px 16px rgba(0, 0, 0, 0.06),
                 inset 0 1px 0 rgba(255, 255, 255, 0.20)`
    }
};

// Sosyal Mühendislik Eğitimi Config
const socialEngineeringIntroConfig = {
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
            colorType: ColorType.PURPLE
        },
        {
            iconName: "brain",
            text: "Psikolojik manipülasyon",
            colorType: ColorType.PINK
        },
        {
            iconName: "eye",
            text: "Şüpheli davranışları tanıma",
            colorType: ColorType.ORANGE
        },
        {
            iconName: "shield-check",
            text: "Korunma yöntemleri",
            colorType: ColorType.GREEN
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

const socialEngineeringGoalConfig = {
    title: "Sosyal Mühendislik Korunma Hedefleri",
    goals: [
        {
            iconName: "users",
            title: "Sosyal Mühendislik Teknikleri",
            subtitle: "Farkındalık",
            description: "Yaygın sosyal mühendislik saldırı tekniklerini tanıma",
            colorType: ColorType.PURPLE
        },
        {
            iconName: "brain",
            title: "Psikolojik Manipülasyon",
            subtitle: "Anlayış",
            description: "Saldırganların kullandığı psikolojik manipülasyon tekniklerini anlama",
            colorType: ColorType.PINK
        },
        {
            iconName: "shield-check",
            title: "Korunma Yöntemleri",
            subtitle: "Savunma",
            description: "Sosyal mühendislik saldırılarına karşı etkili korunma stratejileri",
            colorType: ColorType.GREEN
        }
    ],
    icon: {
        component: null,
        size: 48,
        sceneIconName: "users",
        className: "text-purple-500"
    },
    glassEffect: {
        blur: "blur(24px)",
        saturation: "saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.30)",
        shadow: `0 8px 32px rgba(0, 0, 0, 0.08),
                 0 4px 16px rgba(0, 0, 0, 0.06),
                 inset 0 1px 0 rgba(255, 255, 255, 0.20)`
    }
};




const passwordSecurityScenarioConfig = {
    title: "Gerçek Hayat Senaryosu",
    subtitle: "Parola Güvenliği Vaka Çalışması",
    description: "Gerçek bir parola güvenliği senaryosunu inceleyin ve öğrenin",

    // Video Configuration
    video: {
        src: "https://customer-0lll6yc8omc23rbm.cloudflarestream.com/5fdb12ff1436c991f50b698a02e2faa1/manifest/video.m3u8",
        poster: null,
        disableForwardSeek: true,
        showTranscript: true,
        transcriptTitle: "Senaryo Transkripti",
        transcriptLanguage: "Türkçe"
    },

    // Transcript Data
    transcript: `00:00:01.040 as a devops manager my job is hectic and
00:00:04.400 security is always a top priority but an
00:00:07.919 experience I had last month made me
00:00:10.400 change my behavior one day during my
00:00:13.120 lunch break I received an email that
00:00:15.639 looked like it was from the finance
00:00:17.439 department it asked me to approve an
00:00:20.039 invoice something felt off the invoice
00:00:23.320 number was strange and there were a few
00:00:25.519 grammar mistakes thanks to my cyber
00:00:28.279 security training I quickly realized it
00:00:30.679 was a fishing attempt I thought someone
00:00:33.879 might fall for this but instead of
00:00:36.239 reporting it I moved on with my work
00:00:38.760 assuming it will catch it anyway a week
00:00:42.079 later our company announced a fishing
00:00:44.840 attack has led to a data breach exposing
00:00:47.680 customer
00:00:48.800 information the email I had ignored was
00:00:51.559 part of that attack if I had reported it
00:00:54.719 the whole crisis might have been avoided
00:00:57.600 after the breach the company held a
00:00:59.600 meeting
00:01:00.800 the IT team explained how the attack
00:01:03.199 happened and the Damage it caused not
00:01:05.880 just reputational harm but also
00:01:08.320 Financial loss I was shocked and felt
00:01:11.280 guilty a simple secure reporting
00:01:14.119 Behavior could have made all the
00:01:16.439 difference here's what I learned from
00:01:18.439 this experience don't assume someone
00:01:21.320 else will report it just do it if
00:01:24.119 everyone thinks the same way nothing
00:01:26.439 gets done we all share the
00:01:28.560 responsibility know your company's
00:01:30.960 reporting process if you're unsure ask
00:01:34.680 it there are always tools to make
00:01:37.439 reporting easier never underestimate
00:01:40.399 fishing attacks even one fake email can
00:01:43.439 put the entire company at risk after
00:01:46.560 this incident I realized that combating
00:01:49.079 cyber attacks is only possible when
00:01:51.439 everyone practices secure
00:01:53.640 behaviors identifying a fishing email
00:01:56.520 Isn't Enough you have to take action
00:02:00.000 but`,

    // Icon Configuration
    icon: {
        component: null,
        size: 40,
        sceneIconName: "play-circle",
        className: "text-blue-500"
    },

    // Animation Configuration
    animations: {
        headerIcon: {
            initial: { opacity: 0, scale: 0.8, y: -20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            transition: { duration: 0.8, ease: "easeOut" }
        },
        title: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.2 }
        },
        videoPlayer: {
            initial: { opacity: 0, y: 40, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.8, delay: 0.4 }
        },
        mobileHint: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 1.2 }
        }
    },

    // Mobile Hint Configuration
    mobileHint: {
        text: "💡 Videoyu izleyip transkripti inceleyin",
        className: "sm:hidden mt-2"
    }
};

const socialEngineeringScenarioConfig = {
    title: "Gerçek Hayat Senaryosu",
    subtitle: "Sosyal Mühendislik Vaka Çalışması",
    description: "Gerçek bir sosyal mühendislik senaryosunu inceleyin ve öğrenin",

    // Video Configuration
    video: {
        src: "https://customer-0lll6yc8omc23rbm.cloudflarestream.com/5fdb12ff1436c991f50b698a02e2faa1/manifest/video.m3u8",
        poster: null,
        disableForwardSeek: true,
        showTranscript: true,
        transcriptTitle: "Senaryo Transkripti",
        transcriptLanguage: "Türkçe"
    },

    // Transcript Data
    transcript: `00:00:01.040 as a devops manager my job is hectic and
00:00:04.400 security is always a top priority but an
00:00:07.919 experience I had last month made me
00:00:10.400 change my behavior one day during my
00:00:13.120 lunch break I received an email that
00:00:15.639 looked like it was from the finance
00:00:17.439 department it asked me to approve an
00:00:20.039 invoice something felt off the invoice
00:00:23.320 number was strange and there were a few
00:00:25.519 grammar mistakes thanks to my cyber
00:00:28.279 security training I quickly realized it
00:00:30.679 was a fishing attempt I thought someone
00:00:33.879 might fall for this but instead of
00:00:36.239 reporting it I moved on with my work
00:00:38.760 assuming it will catch it anyway a week
00:00:42.079 later our company announced a fishing
00:00:44.840 attack has led to a data breach exposing
00:00:47.680 customer
00:00:48.800 information the email I had ignored was
00:00:51.559 part of that attack if I had reported it
00:00:54.719 the whole crisis might have been avoided
00:00:57.600 after the breach the company held a
00:00:59.600 meeting
00:01:00.800 the IT team explained how the attack
00:01:03.199 happened and the Damage it caused not
00:01:05.880 just reputational harm but also
00:01:08.320 Financial loss I was shocked and felt
00:01:11.280 guilty a simple secure reporting
00:01:14.119 Behavior could have made all the
00:01:16.439 difference here's what I learned from
00:01:18.439 this experience don't assume someone
00:01:21.320 else will report it just do it if
00:01:24.119 everyone thinks the same way nothing
00:01:26.439 gets done we all share the
00:01:28.560 responsibility know your company's
00:01:30.960 reporting process if you're unsure ask
00:01:34.680 it there are always tools to make
00:01:37.439 reporting easier never underestimate
00:01:40.399 fishing attacks even one fake email can
00:01:43.439 put the entire company at risk after
00:01:46.560 this incident I realized that combating
00:01:49.079 cyber attacks is only possible when
00:01:51.439 everyone practices secure
00:01:53.640 behaviors identifying a fishing email
00:01:56.520 Isn't Enough you have to take action
00:02:00.000 but`,

    // Icon Configuration
    icon: {
        component: null,
        size: 40,
        sceneIconName: "play-circle",
        className: "text-purple-500"
    },

    // Animation Configuration
    animations: {
        headerIcon: {
            initial: { opacity: 0, scale: 0.8, y: -20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            transition: { duration: 0.8, ease: "easeOut" }
        },
        title: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, delay: 0.2 }
        },
        videoPlayer: {
            initial: { opacity: 0, y: 40, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: { duration: 0.8, delay: 0.4 }
        },
        mobileHint: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 1.2 }
        }
    },

    // Mobile Hint Configuration
    mobileHint: {
        text: "💡 Videoyu izleyip transkripti inceleyin",
        className: "sm:hidden mt-2"
    }
};

// Actionable Content Scene Configs
const smishingActionableContentConfig = {
    title: "Hemen Uygulanabilir Adımlar",
    actions: [
        {
            iconName: "key",
            title: "Güçlü Parola Oluşturun",
            description: "En az 12 karakter, büyük-küçük harf, sayı ve sembol",
            tip: "Örnek: 'Kahve!çok7Güzel#2024'",
            iconColorClass: ColorClasses.BLUE.icon,
            bgGradientClass: ColorClasses.BLUE.bgGradient,
            tipColorClass: ColorClasses.BLUE.tip,
            tipTextColorClass: ColorClasses.BLUE.tipText,
            tipIconColorClass: ColorClasses.BLUE.tipIcon
        },
        {
            iconName: "smartphone",
            title: "2FA Aktifleştirin",
            description: "Tüm kritik hesaplarınızda çok faktörlü kimlik doğrulama",
            tip: "Google Authenticator veya Authy kullanın",
            iconColorClass: ColorClasses.GREEN.icon,
            bgGradientClass: ColorClasses.GREEN.bgGradient,
            tipColorClass: ColorClasses.GREEN.tip,
            tipTextColorClass: ColorClasses.GREEN.tipText,
            tipIconColorClass: ColorClasses.GREEN.tipIcon
        },
        {
            iconName: "database",
            title: "Parola Yöneticisi",
            description: "Her hesap için farklı ve karmaşık parolalar",
            tip: "1Password, Bitwarden veya LastPass",
            iconColorClass: ColorClasses.PURPLE.icon,
            bgGradientClass: ColorClasses.PURPLE.bgGradient,
            tipColorClass: ColorClasses.PURPLE.tip,
            tipTextColorClass: ColorClasses.PURPLE.tipText,
            tipIconColorClass: ColorClasses.PURPLE.tipIcon
        }
    ],

    // Visual configuration
    icon: {
        component: null,
        size: 40,
        sceneIconName: "shield-check",
        className: "text-blue-500"
    },
    tipConfig: {
        iconName: "check-circle",
        iconSize: 12,
        tipColorClass: ColorClasses.BLUE.tip,
        tipTextColorClass: ColorClasses.BLUE.tipText,
        tipIconColorClass: ColorClasses.BLUE.tipIcon
    },

    // Glass effect configuration
    glassEffect: {
        cardBackground: "bg-white/60 dark:bg-gray-800/80",
        cardBorder: "border-white/30 dark:border-gray-600/60",
        shadow: "shadow-lg hover:shadow-xl",
        backdropBlur: "backdrop-blur-xl"
    }
};

const passwordSecurityActionableContentConfig = {
    title: "Parola Güvenliği Adımları",
    actions: [
        {
            iconName: "key",
            title: "Güçlü Parola Oluşturun",
            description: "En az 12 karakter, büyük-küçük harf, sayı ve sembol",
            tip: "Örnek: 'Kahve!çok7Güzel#2024'",
            iconColorClass: ColorClasses.BLUE.icon,
            bgGradientClass: ColorClasses.BLUE.bgGradient,
            tipColorClass: ColorClasses.BLUE.tip,
            tipTextColorClass: ColorClasses.BLUE.tipText,
            tipIconColorClass: ColorClasses.BLUE.tipIcon
        },
        {
            iconName: "smartphone",
            title: "2FA Aktifleştirin",
            description: "Tüm kritik hesaplarınızda çok faktörlü kimlik doğrulama",
            tip: "Google Authenticator veya Authy kullanın",
            iconColorClass: ColorClasses.GREEN.icon,
            bgGradientClass: ColorClasses.GREEN.bgGradient,
            tipColorClass: ColorClasses.GREEN.tip,
            tipTextColorClass: ColorClasses.GREEN.tipText,
            tipIconColorClass: ColorClasses.GREEN.tipIcon
        },
        {
            iconName: "database",
            title: "Parola Yöneticisi",
            description: "Her hesap için farklı ve karmaşık parolalar",
            tip: "1Password, Bitwarden veya LastPass",
            iconColorClass: ColorClasses.PURPLE.icon,
            bgGradientClass: ColorClasses.PURPLE.bgGradient,
            tipColorClass: ColorClasses.PURPLE.tip,
            tipTextColorClass: ColorClasses.PURPLE.tipText,
            tipIconColorClass: ColorClasses.PURPLE.tipIcon
        }
    ],

    // Visual configuration
    icon: {
        component: null,
        size: 40,
        sceneIconName: "shield-check",
        className: "text-green-500"
    },
    tipConfig: {
        iconName: "check-circle",
        iconSize: 12,
        tipColorClass: ColorClasses.GREEN.tip,
        tipTextColorClass: ColorClasses.GREEN.tipText,
        tipIconColorClass: ColorClasses.GREEN.tipIcon
    },

    // Glass effect configuration
    glassEffect: {
        cardBackground: "bg-white/60 dark:bg-gray-800/80",
        cardBorder: "border-white/30 dark:border-gray-600/60",
        shadow: "shadow-lg hover:shadow-xl",
        backdropBlur: "backdrop-blur-xl"
    }
};

const socialEngineeringActionableContentConfig = {
    title: "Sosyal Mühendislik Korunma Adımları",
    actions: [
        {
            iconName: "eye",
            title: "Şüpheli Mesajları Tanıyın",
            description: "Acil durum, korku veya acele hissi veren mesajlara dikkat",
            tip: "Resmi kurumlar asla SMS ile şifre istemez",
            iconColorClass: ColorClasses.RED.icon,
            bgGradientClass: ColorClasses.RED.bgGradient,
            tipColorClass: ColorClasses.RED.tip,
            tipTextColorClass: ColorClasses.RED.tipText,
            tipIconColorClass: ColorClasses.RED.tipIcon
        },
        {
            iconName: "phone",
            title: "Doğrulama Yapın",
            description: "Gönderen numarasını ve mesaj içeriğini kontrol edin",
            tip: "Resmi web sitelerinden doğrulayın",
            iconColorClass: ColorClasses.ORANGE.icon,
            bgGradientClass: ColorClasses.ORANGE.bgGradient,
            tipColorClass: ColorClasses.ORANGE.tip,
            tipTextColorClass: ColorClasses.ORANGE.tipText,
            tipIconColorClass: ColorClasses.ORANGE.tipIcon
        },
        {
            iconName: "shield",
            title: "Güvenlik Yazılımı",
            description: "Güncel antivirüs ve güvenlik yazılımları kullanın",
            tip: "Otomatik güncellemeleri aktif tutun",
            iconColorClass: ColorClasses.BLUE.icon,
            bgGradientClass: ColorClasses.BLUE.bgGradient,
            tipColorClass: ColorClasses.BLUE.tip,
            tipTextColorClass: ColorClasses.BLUE.tipText,
            tipIconColorClass: ColorClasses.BLUE.tipIcon
        }
    ],

    // Visual configuration
    icon: {
        component: null,
        size: 40,
        sceneIconName: "shield-check",
        className: "text-red-500"
    },
    tipConfig: {
        iconName: "check-circle",
        iconSize: 12,
        tipColorClass: ColorClasses.RED.tip,
        tipTextColorClass: ColorClasses.RED.tipText,
        tipIconColorClass: ColorClasses.RED.tipIcon
    },

    // Glass effect configuration
    glassEffect: {
        cardBackground: "bg-white/60 dark:bg-gray-800/80",
        cardBorder: "border-white/30 dark:border-gray-600/60",
        shadow: "shadow-lg hover:shadow-xl",
        backdropBlur: "backdrop-blur-xl"
    }
};

// Eğitim türlerine göre config mapping - Object of Objects yapısı
export const educationConfigs = {
    smishing: {
        goalSceneConfig: smishingGoalConfig,
        actionableContentSceneConfig: smishingActionableContentConfig
    },
    passwordSecurity: {
        introSceneConfig: passwordSecurityIntroConfig,
        goalSceneConfig: passwordSecurityGoalConfig,
        scenarioSceneConfig: passwordSecurityScenarioConfig,
        actionableContentSceneConfig: passwordSecurityActionableContentConfig
    },
    socialEngineering: {
        introSceneConfig: socialEngineeringIntroConfig,
        goalSceneConfig: socialEngineeringGoalConfig,
        scenarioSceneConfig: socialEngineeringScenarioConfig,
        actionableContentSceneConfig: socialEngineeringActionableContentConfig
    }
    // Diğer eğitim türleri buraya eklenebilir...
};



export type EducationType = keyof typeof educationConfigs;

export const passwordSecurityConfig = passwordSecurityIntroConfig;
export const socialEngineeringConfig = socialEngineeringIntroConfig;


export interface NudgeSceneConfig {
    texts?: {
        completionTitle?: string;
        completionSubtitle?: string;
        achievementsTitle?: string;
        actionPlanTitle?: string;
        resourcesTitle?: string;
        motivationalTitle?: string;
        motivationalMessage?: string;
        downloadButton?: string;
        downloadingText?: string;
        urgentLabel?: string;
        pointsLabel?: string;
        timeLabel?: string;
        completionLabel?: string;
    };
    achievements?: Array<{
        id: string;
        name: string;
        iconName: string;
        color: string;
    }>;
    completionData?: {
        totalPoints?: number;
        timeSpent?: string;
        completionDate?: string;
        achievements?: Array<{
            id: string;
            name: string;
            iconName: string;
            color: string;
        }>;
    };
    immediateActions?: Array<{
        iconName: string;
        title: string;
        description: string;
        priority: "critical" | "high" | "medium";
        timeframe: string;
        gradient: string;
        iconColor: string;
        bgColor: string;
        borderColor: string;
    }>;
    resources?: Array<{
        title: string;
        type: string;
        url: string;
        description: string;
    }>;
    icon?: {
        name?: string;
        size?: number;
        color?: string;
    };
    styling?: {
        container?: {
            padding?: string;
            borderRadius?: string;
            backgroundColor?: string;
            borderColor?: string;
            shadow?: string;
        };
        stats?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
        };
        downloadButton?: {
            backgroundColor?: string;
            borderColor?: string;
            textColor?: string;
            iconColor?: string;
            gradientFrom?: string;
            gradientTo?: string;
            shadow?: string;
            borderRadius?: string;
            padding?: string;
            fontSize?: string;
            fontWeight?: string;
        };
        achievements?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
            hoverColor?: string;
        };
        actionCards?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
            hoverColor?: string;
        };
        resourceCards?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
            hoverColor?: string;
        };
        motivationalCard?: {
            backgroundColor?: string;
            borderColor?: string;
            iconColor?: string;
            textColor?: string;
            titleColor?: string;
        };
    };
}
