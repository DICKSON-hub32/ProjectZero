/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionDuration:{
        'slow':'1s',
         'extra-slow':'2s'
      }
    },
  },
  plugins: [],
}

