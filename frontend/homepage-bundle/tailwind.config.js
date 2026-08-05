/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#6B1A2A',
          dark: '#4A0F1C',
          light: '#9C3A4E',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97E',
          pale: '#F5EDD6',
        },
        ivory: {
          DEFAULT: '#FAF6EE',
          dark: '#F0E8D8',
        },
        charcoal: '#2A1A1E',
        muted: '#7A6065',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Sans', 'sans-serif'],
        cormorant: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
