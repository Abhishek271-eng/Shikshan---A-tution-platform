/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
      colors: {
        // Design Reference Palette
        lavender: {
          50: '#FBF9FE',
          100: '#F3EEFB',
          200: '#DFD8F3', // Soft lavender reference
          300: '#C7BBEA',
          400: '#A7AAE5', // Periwinkle reference
          500: '#7E76D8',
          600: '#5B4FCF',
          700: '#4136CA', // Deep violet reference
          800: '#3128A3',
          900: '#231C7A',
        },
        periwinkle: {
          DEFAULT: '#A7AAE5',
          light: '#C4C6F0',
          dark: '#8287D4',
        },
        deepviolet: {
          DEFAULT: '#4136CA',
          light: '#5348E0',
          dark: '#3026A8',
        },
        deepgreen: {
          DEFAULT: '#3B522F',
          light: '#506E40',
          dark: '#27371F',
        },
        clay: {
          canvas: '#F7F6FC',
          card: '#FFFFFF',
          subtle: '#F2F0FA',
          border: '#E3DFFA',
          text: '#1C1938',
          muted: '#686487',
        },
        brand: {
          50: '#F3EEFB',
          100: '#DFD8F3',
          500: '#7E76D8',
          600: '#4136CA',
          700: '#3128A3',
        },
      },
      boxShadow: {
        'clay-sm': '0 4px 12px -2px rgba(65, 54, 202, 0.06), 0 2px 6px -1px rgba(167, 170, 229, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        'clay': '0 12px 28px -6px rgba(65, 54, 202, 0.08), 0 4px 12px -2px rgba(167, 170, 229, 0.16), inset 0 1.5px 1px rgba(255, 255, 255, 0.95)',
        'clay-hover': '0 16px 36px -8px rgba(65, 54, 202, 0.14), 0 6px 16px -3px rgba(167, 170, 229, 0.22), inset 0 2px 1px rgba(255, 255, 255, 1)',
        'clay-card': '0 10px 25px -4px rgba(65, 54, 202, 0.07), 0 4px 10px -2px rgba(167, 170, 229, 0.12), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)',
        'clay-button': '0 8px 20px -3px rgba(65, 54, 202, 0.35), inset 0 1.5px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 2px rgba(0, 0, 0, 0.12)',
        'clay-button-subtle': '0 6px 14px -2px rgba(167, 170, 229, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        'clay-inset': 'inset 2px 2px 5px rgba(65, 54, 202, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
}
