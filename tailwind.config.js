/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pantone 308 - Color principal del sistema
        'primary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#00587C',  // Pantone 308 - Color principal
          600: '#004a67',  // Más oscuro
          700: '#003d54',
          800: '#003145',
          900: '#002739',
        },
      },
    },
  },
  plugins: [],
}