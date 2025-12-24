/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff00ff',
        'neon-purple': '#8b00ff',
        'neon-blue': '#00d4ff',
        'neon-cyan': '#00ffff',
        'hot-pink': '#ff1493',
        'dark-purple': '#1a0033',
        'game-bg': '#0a0015',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulseNeon 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 2s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-short': 'bounceShort 0.2s ease-in-out',
        'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
        'grid-flow': 'gridFlow 1s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff' },
          '50%': { boxShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { filter: 'brightness(1) drop-shadow(0 0 5px #ff00ff)' },
          '100%': { filter: 'brightness(1.3) drop-shadow(0 0 20px #ff00ff)' },
        },
        bounceShort: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        gridFlow: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' },
        },
      },
    },
  },
  plugins: [],
}
