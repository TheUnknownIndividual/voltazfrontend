/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f2fff0',
          100: '#e3ffdf',
          200: '#c5ffbd',
          300: '#9bff8b',
          400: '#40dc3a',
          500: '#40dc3a', 
          600: '#00463c', // User requested #00463c as primary
          700: '#003a32',
          800: '#002e27',
          900: '#00221d',
          950: '#001612',
        },
      },
    },
  },
  plugins: [],
}
