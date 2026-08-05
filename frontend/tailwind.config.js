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
          light: '#9F3145',
        },
        gold: {
          DEFAULT: '#C29B57',
          light: '#E8C97E',
          pale: '#F6EAD2',
        },
        ivory: {
          DEFAULT: '#FAF6EE',
          dark: '#E8DCC4',
        },
        charcoal: '#2A1A1E',
        muted: '#75646A',
        teal: '#0F5B55',
        primary: {
          DEFAULT: '#6B1A2A',
          dark: '#4A0F1C',
          light: '#9F3145',
        },
        accent: {
          DEFAULT: '#C29B57',
          light: '#E8C97E',
          pale: '#F6EAD2',
          teal: '#0F5B55',
        },
        surface: {
          DEFAULT: '#FAF6EE',
          soft: '#FFFCF7',
          card: '#FFFFFF',
        },
        border: '#E8DCC4',
        text: {
          DEFAULT: '#2A1A1E',
          muted: '#75646A',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Sans', 'sans-serif'],
        cormorant: ['DM Sans', 'sans-serif'],
        playfair: ['DM Sans', 'sans-serif'],
        montserrat: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
