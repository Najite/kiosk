/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        axon: {
          950: '#030305',
          900: '#07070B',
          850: '#0C0C12',
          800: '#11111B',
          750: '#171724',
          700: '#1F1F30',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-hover': 'rgba(168, 85, 247, 0.28)',
          'border-glow': 'rgba(192, 132, 252, 0.45)',
        },
        violet: {
          neon: '#8B5CF6',
          bright: '#A855F7',
          glow: '#C084FC',
          deep: '#6D28D9',
          dark: '#4C1D95',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 15px rgba(139, 92, 246, 0.25)',
        'neon-md': '0 0 30px rgba(139, 92, 246, 0.35)',
        'neon-lg': '0 0 60px rgba(168, 85, 247, 0.45)',
        'double-bezel': '0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'spin-slow': 'spin 24s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
