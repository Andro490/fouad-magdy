/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#080b1a',
          lighter: '#0f1530',
          card: '#0d1228'
        },
        primary: {
          DEFAULT: '#ff2d9b', // Neon Pink from image
          glow: 'rgba(255, 45, 155, 0.5)'
        },
        accent: {
          DEFAULT: '#00e5ff', // Cyan from image
          glow: 'rgba(0, 229, 255, 0.5)'
        },
        purple: {
          DEFAULT: '#7c3aed',
          glow: 'rgba(124, 58, 237, 0.4)'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'], // Great for Arabic
      }
    },
  },
  plugins: [],
}
