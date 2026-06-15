/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#A8E63D', light: '#F2FBDF' }
      }
    }
  },
  plugins: []
}

