/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#F4F7F4',
          100: '#E6EFE7',
          200: '#CCDCCC',
          300: '#A4BEA5',
          400: '#739A75',
          500: '#4D7850',
          600: '#3A603D',
          700: '#2E4B30',
          800: '#253828', // Core brand moss
          900: '#1B2A1E', // Deep moss black
          950: '#0F1811',
        },
        sand: {
          50: '#FAF8F5', // Core warm off-white background
          100: '#F5F2EB', // Light warm neutral
          200: '#EBE5D9', // Subtle borders
          300: '#DDD5C4',
          400: '#C8BC9F',
          500: '#AF9F7E',
          600: '#8E7F61',
          700: '#6E624A',
          800: '#524838',
          900: '#3A3328',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#EAEAEA',
          200: '#D5D5D5',
          300: '#ABABAB',
          400: '#7E7E7E',
          500: '#5F5F5F',
          600: '#474747',
          700: '#333333',
          800: '#222222',
          900: '#181818',
          950: '#111111',
        },
        clay: {
          50: '#FAF4F2',
          100: '#F4E7E3',
          500: '#9E583F',
          600: '#83442E',
        },
        gold: {
          500: '#C4924A',
          600: '#A87936',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        'tightest': '-0.035em',
        'super-wide': '0.25em',
        'ultra-wide': '0.35em',
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      aspectRatio: {
        'editorial': '4 / 5',
        'portrait': '3 / 4',
        'landscape': '16 / 9',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      }
    },
  },
  plugins: [],
}