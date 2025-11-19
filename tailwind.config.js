/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.tsx"
  ],
  darkMode: 'class',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'he', 'fa', 'ur'],
  },
  safelist: [
    // Essential theme colors only
    {
      pattern: /^(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900)(\/\d+)?$/,
      variants: ['hover', 'focus', 'dark']
    },
    // Essential gradient directions
    {
      pattern: /^bg-gradient-to-(t|tr|r|br|b|bl|l|tl)$/
    },
    // Essential gradient color stops
    {
      pattern: /^(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)-(50|100|200|300|400|500|600|700|800|900)(\/\d+)?$/
    },
    // Custom gradients
    'bg-gradient-red',
    'bg-gradient-blue',
    'bg-gradient-green',
    'bg-gradient-gray',
    'bg-gradient-purple',
    'bg-gradient-yellow-smoke',
    'bg-gradient-yellow',
    'bg-gradient-light-yellow',
    'bg-gradient-orange',
    'bg-gradient-light-blue',
    'bg-gradient-pink',
    'bg-gradient-teal',
    'bg-gradient-indigo',
    'bg-gradient-emerald',
    'bg-gradient-violet',
    'bg-gradient-amber',
    // Glass border classes
    'glass-border-0',
    'glass-border-1',
    'glass-border-1-5', 
    'glass-border-2',
    'glass-border-3',
    'glass-border-4',
    'sm:glass-border-0',
    'sm:glass-border-1',
    'sm:glass-border-1-5', 
    'sm:glass-border-2',
    'sm:glass-border-3',
    'sm:glass-border-4',
    'md:glass-border-0',
    'md:glass-border-1',
    'md:glass-border-1-5', 
    'md:glass-border-2',
    'md:glass-border-3',
    'md:glass-border-4',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      backdropBlur: {
        '3xl': '64px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
      },
      colors: {
        'gray': {
          850: '#1f2937',
        }
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(106deg, #D77676 0%, #A53131 100%)',
        'gradient-blue': 'linear-gradient(106deg, #76B2D7 0%, #3178A5 100%)',
        'gradient-light-blue': 'linear-gradient(106deg, rgba(90, 200, 250, 0.30) 0%, rgba(0, 122, 255, 0.30) 100%), #FFF',
        'gradient-green': 'linear-gradient(106deg, #76D79D 0%, #31A561 100%)',
        'gradient-gray':'linear-gradient(106deg, rgba(200, 200, 205, 0.30) 0%, rgba(142, 142, 147, 0.30) 100%)',
        'gradient-purple':'linear-gradient(106deg, #7676D7 0%, #4831A5 100%)',
        'gradient-yellow-smoke':'linear-gradient(106deg, #CAD776 0%, #7CA531 100%)',
        'gradient-yellow':'linear-gradient(106deg, #E8E04F 0%, #B4960D 100%)',
        'gradient-light-yellow':'linear-gradient(106deg, rgba(255, 236, 179, 0.30) 0%, rgba(255, 204, 0, 0.30) 100%)',
        'gradient-orange':'linear-gradient(106deg, #E8AB4F 0%, #B47F0D 100%)',
        'gradient-pink':'linear-gradient(106deg, rgba(255, 99, 71, 0.30) 0%, rgba(255, 59, 48, 0.30) 100%)',
        'gradient-teal': 'linear-gradient(106deg, #76D7D4 0%, #31A59A 100%)',
        'gradient-indigo': 'linear-gradient(106deg, #6366F1 0%, #4F46E5 100%)',
        'gradient-emerald': 'linear-gradient(106deg, #6FD764 0%, #2B9D3F 100%)',
        'gradient-violet': 'linear-gradient(106deg, #A78BFA 0%, #7C3AED 100%)',
        'gradient-amber': 'linear-gradient(106deg, #FCD34D 0%, #D97706 100%)'
      }
    },
  },
  plugins: [],
} 