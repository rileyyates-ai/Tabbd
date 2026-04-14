/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0066FF',
        'brand-light': '#EBF2FF',
        surface: '#F8F9FA',
        'type-home': '#D97706',
        'type-growth': '#059669',
        'type-personal': '#0066FF',
      },
      fontFamily: {
        sans: ['DM Sans', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
