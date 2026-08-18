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
          DEFAULT: '#0a0a0a',
          lighter: '#1a1a1a',
          card: '#141414'
        },
        primary: {
          DEFAULT: '#FFD700', // Gold
          glow: 'rgba(255, 215, 0, 0.5)'
        },
        accent: {
          DEFAULT: '#00F0FF', // Cyan Neon
          glow: 'rgba(0, 240, 255, 0.5)'
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'], // Great for Arabic
      }
    },
  },
  plugins: [],
}
