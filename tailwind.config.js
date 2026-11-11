/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: '#120c10',
          base: '#0d070b',
          surface: '#181016',
          card: '#20151e',
          hover: '#291b26',
          border: '#382332',
          borderLight: '#4e3346',
        },
        rose: {
          50: '#fdf4f3',
          100: '#fbe7e5',
          200: '#f7d3cf',
          300: '#f1b3ab',
          400: '#e89a92', // Reference hero accent blush
          500: '#df7e74',
          600: '#cc5e54',
          700: '#a8453c',
          800: '#8c3a33',
          900: '#75342e',
        },
        brand: {
          50: '#fdf4f3',
          100: '#fbe7e5',
          200: '#f7d3cf',
          300: '#f1b3ab',
          400: '#e89a92',
          500: '#df7e74',
          600: '#e89a92', // Primary interactive accent
          700: '#cc5e54',
          800: '#8c3a33',
          900: '#75342e',
        },
        cream: {
          DEFAULT: '#faf3ee',
          pure: '#ffffff',
          soft: '#f5eee8',
          muted: '#a89490',
          dark: '#7e6c69',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tightest: '-0.06em',
        widest: '0.2em',
        ultra: '0.35em',
      },
    },
  },
  plugins: [],
}
