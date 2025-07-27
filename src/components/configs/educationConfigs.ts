// Standart renk tipi enum'u - Tüm scene'ler için ortak
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

// Smishing Eğitimi Config
const smishingIntroConfig = {
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
            colorType: ColorType.RED
        },
        {
            iconName: "shield",
            text: "Korunma stratejileri",
            colorType: ColorType.GREEN
        },
        {
            iconName: "alert-triangle",
            text: "Şüpheli mesajları tespit etme",
            colorType: ColorType.ORANGE
        },
        {
            iconName: "users",
            text: "Ekip farkındalığı oluşturma",
            colorType: ColorType.BLUE
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
    containerClassName: "flex flex-col items-center justify-center h-full text-center px-6",
    cardSpacing: "space-y-4",
    maxWidth: "max-w-md w-full",
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
    containerClassName: "flex flex-col items-center justify-center h-full text-center px-6",
    cardSpacing: "space-y-4",
    maxWidth: "max-w-md w-full",
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
    containerClassName: "flex flex-col items-center justify-center h-full text-center px-6",
    cardSpacing: "space-y-4",
    maxWidth: "max-w-md w-full",
    glassEffect: {
        blur: "blur(24px)",
        saturation: "saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.30)",
        shadow: `0 8px 32px rgba(0, 0, 0, 0.08),
                 0 4px 16px rgba(0, 0, 0, 0.06),
                 inset 0 1px 0 rgba(255, 255, 255, 0.20)`
    }
};

// Scenario Scene Config
const smishingScenarioConfig = {
    title: "Gerçek Hayat Senaryosu",
    subtitle: "DevOps Manager'ın Phishing Deneyimi",
    description: "Gerçek bir phishing saldırısı senaryosunu inceleyin ve öğrenin",

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

    // Layout Configuration
    containerClassName: "flex flex-col items-center justify-start h-full px-4 py-4 sm:px-6 overflow-y-auto",
    videoContainerClassName: "w-full max-w-sm sm:max-w-md lg:max-w-lg mb-6 sm:mb-8",

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

    // Layout Configuration
    containerClassName: "flex flex-col items-center justify-start h-full px-4 py-4 sm:px-6 overflow-y-auto",
    videoContainerClassName: "w-full max-w-sm sm:max-w-md lg:max-w-lg mb-6 sm:mb-8",

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

    // Layout Configuration
    containerClassName: "flex flex-col items-center justify-start h-full px-4 py-4 sm:px-6 overflow-y-auto",
    videoContainerClassName: "w-full max-w-sm sm:max-w-md lg:max-w-lg mb-6 sm:mb-8",

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
            colorType: ColorType.BLUE,
            bgColorType: ColorType.BLUE
        },
        {
            iconName: "smartphone",
            title: "2FA Aktifleştirin",
            description: "Tüm kritik hesaplarınızda çok faktörlü kimlik doğrulama",
            tip: "Google Authenticator veya Authy kullanın",
            colorType: ColorType.GREEN,
            bgColorType: ColorType.GREEN
        },
        {
            iconName: "database",
            title: "Parola Yöneticisi",
            description: "Her hesap için farklı ve karmaşık parolalar",
            tip: "1Password, Bitwarden veya LastPass",
            colorType: ColorType.PURPLE,
            bgColorType: ColorType.PURPLE
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
        bgColorType: ColorType.BLUE
    },

    // Layout configuration
    containerClassName: "flex flex-col items-center justify-center h-full px-6",
    cardSpacing: "space-y-4",
    maxWidth: "max-w-md w-full",

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
            colorType: ColorType.BLUE,
            bgColorType: ColorType.BLUE
        },
        {
            iconName: "smartphone",
            title: "2FA Aktifleştirin",
            description: "Tüm kritik hesaplarınızda çok faktörlü kimlik doğrulama",
            tip: "Google Authenticator veya Authy kullanın",
            colorType: ColorType.GREEN,
            bgColorType: ColorType.GREEN
        },
        {
            iconName: "database",
            title: "Parola Yöneticisi",
            description: "Her hesap için farklı ve karmaşık parolalar",
            tip: "1Password, Bitwarden veya LastPass",
            colorType: ColorType.PURPLE,
            bgColorType: ColorType.PURPLE
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
        bgColorType: ColorType.GREEN
    },

    // Layout configuration
    containerClassName: "flex flex-col items-center justify-center h-full px-6",
    cardSpacing: "space-y-4",
    maxWidth: "max-w-md w-full",

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
            colorType: ColorType.RED,
            bgColorType: ColorType.RED
        },
        {
            iconName: "phone",
            title: "Doğrulama Yapın",
            description: "Gönderen numarasını ve mesaj içeriğini kontrol edin",
            tip: "Resmi web sitelerinden doğrulayın",
            colorType: ColorType.ORANGE,
            bgColorType: ColorType.ORANGE
        },
        {
            iconName: "shield",
            title: "Güvenlik Yazılımı",
            description: "Güncel antivirüs ve güvenlik yazılımları kullanın",
            tip: "Otomatik güncellemeleri aktif tutun",
            colorType: ColorType.BLUE,
            bgColorType: ColorType.BLUE
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
        bgColorType: ColorType.RED
    },

    // Layout configuration
    containerClassName: "flex flex-col items-center justify-center h-full px-6",
    cardSpacing: "space-y-4",
    maxWidth: "max-w-md w-full",

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
        introSceneConfig: smishingIntroConfig,
        goalSceneConfig: smishingGoalConfig,
        scenarioSceneConfig: smishingScenarioConfig,
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

// Backward compatibility için eski export'lar (isteğe bağlı)
export const smishingConfig = smishingIntroConfig;
export const passwordSecurityConfig = passwordSecurityIntroConfig;
export const socialEngineeringConfig = socialEngineeringIntroConfig;