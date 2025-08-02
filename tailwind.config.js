/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.tsx"
  ],
  darkMode: 'class',
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
    // Glass border classes
    'glass-border-0',
    'glass-border-1',
    'glass-border-1-5', 
    'glass-border-2',
    'glass-border-3',
    'glass-border-4',
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
      }
    },
  },
  plugins: [],
} 