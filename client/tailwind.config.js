/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef1fb',
          100: '#d5dbf5',
          200: '#aab7eb',
          300: '#7f90e0',
          400: '#5469d4',
          500: '#3a52c8',
          600: '#182c8f',
          700: '#132375',
          800: '#0f1b5c',
          900: '#07134c',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
