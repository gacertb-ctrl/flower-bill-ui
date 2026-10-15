/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f4f9f4',  // softest green/white
          100: '#e5f2e5', // light sage
          200: '#cce5cc', // soft olive light
          300: '#a3cfa3', // mint
          400: '#7ab87a', // sage green
          500: '#5c995c', // primary green
          600: '#477a47', // darker green
          700: '#335c33', // dark forest
          800: '#244024',
          900: '#142614', // dark mode bg
        },
        accent: {
          gold: '#e6c27a',
          orange: '#e69966',
          blue: '#7ab8e6'
        },
        cream: '#fdfbf7',
        beige: '#f5f0e6',
      },
      boxShadow: {
        'floating': '0 10px 40px -10px rgba(0,0,0,0.08), 0 4px 12px -5px rgba(0,0,0,0.04)',
        'floating-hover': '0 20px 50px -15px rgba(0,0,0,0.1), 0 8px 24px -10px rgba(0,0,0,0.05)',
        'glow': '0 0 15px rgba(122, 184, 122, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
