/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0D14',
        obsidianLight: '#0E121B',
        slatePanel: '#111827',
        slateBorder: 'rgba(255,255,255,0.08)',
        cyan: {
          DEFAULT: '#00E5FF',
          dim: '#38BDF8',
          glow: 'rgba(0,229,255,0.15)',
        },
        emerald: {
          DEFAULT: '#10B981',
          dim: '#34D399',
          glow: 'rgba(16,185,129,0.12)',
        },
        amber: {
          DEFAULT: '#F59E0B',
          dim: '#FBBF24',
          glow: 'rgba(245,158,11,0.12)',
        },
        rose: {
          DEFAULT: '#F43F5E',
          dim: '#FB7185',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        'cyan-glow': 'radial-gradient(ellipse at top, rgba(0,229,255,0.06), transparent 60%)',
        'emerald-glow': 'radial-gradient(ellipse at top right, rgba(16,185,129,0.05), transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-delayed': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'scan-line': 'scanLine 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'orbit': 'orbit 20s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'pulse-ring': 'pulseRing 3s ease-out infinite',
        'gradient-pan': 'gradientPan 8s ease infinite',
        'glow-breath': 'glowBreath 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scanLine: { '0%,100%': { transform: 'translateY(0)', opacity: '0.3' }, '50%': { transform: 'translateY(100%)', opacity: '0.8' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        orbit: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.8' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
        gradientPan: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        glowBreath: { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
      },
    },
  },
  plugins: [],
};
