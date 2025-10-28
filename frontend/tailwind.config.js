/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00D9FF', // Bright Cyan/Teal
          light: '#33E1FF',
          dark: '#00B8D9',
        },
        accent: {
          DEFAULT: '#FFB800', // Yellow/Orange
          light: '#FFC533',
          dark: '#E6A600',
        },
        dark: {
          bg: '#0A0E27', // Deep background
          card: '#151934', // Card background
          border: '#1E2139', // Border color
          hover: '#1A1F3A', // Hover state
        },
        status: {
          pending: '#FFB800',
          approved: '#00D97E',
          rejected: '#E63757',
          active: '#00D97E',
          inactive: '#6C7293',
        },
      },
    },
  },
  plugins: [],
}
