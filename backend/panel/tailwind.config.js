/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#6B1A2A',
          dark: '#300D14',
          deep: '#1F080D',
          light: '#841920',
          soft: '#FBF7F8',
        },
        gold: {
          DEFAULT: '#D9B86E',
          dark: '#BF9A4B',
          soft: '#FAF4E8',
          light: '#F5E7C8',
        },
        ivory: {
          DEFAULT: '#FAF6EE',
          warm: '#FDFBF7',
          border: '#EFE8DA',
        }
      },
      fontFamily: {
        display: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
