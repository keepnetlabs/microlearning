/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.tsx"
  ],
  darkMode: 'class',
  safelist: [
    // Theme colors
    {
      pattern: /^(bg|text|border|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900)(\/\d+)?$/,
      variants: ['hover', 'focus', 'dark', 'dark:hover', 'dark:focus']
    },
    // Opacity variants
    {
      pattern: /^(bg|text|border)-(white|black|gray|slate|blue|indigo|purple|pink|red|orange|yellow|green|emerald|teal|cyan|sky|violet|fuchsia|rose|amber|lime|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)(\/\d+)?$/,
      variants: ['hover', 'focus', 'dark', 'dark:hover', 'dark:focus']
    },
    // Gradient directions
    {
      pattern: /^bg-gradient-to-(t|tr|r|br|b|bl|l|tl)$/
    },
    // Gradient color stops
    {
      pattern: /^(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent)-(50|100|200|300|400|500|600|700|800|900)(\/\d+)?$/
    },

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
      }
    },
  },
  plugins: [],
} 