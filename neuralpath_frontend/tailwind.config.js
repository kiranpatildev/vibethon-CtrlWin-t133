/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neural: {
          bg: '#0A0F1E',
          surface: '#111827',
          card: '#1A2235',
          border: '#2A3A5C',
          accent: '#00D4FF',
          'accent-dim': '#0099BB',
          xp: '#FFB347',
          success: '#22C55E',
          danger: '#EF4444',
          purple: '#8B5CF6',
          text: '#E2E8F0',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glow: { '0%,100%': { boxShadow: '0 0 20px rgba(0,212,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.6)' } },
      },
      backgroundImage: {
        'gradient-neural': 'linear-gradient(135deg, #0A0F1E 0%, #111827 50%, #0A0F1E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00D4FF, #8B5CF6)',
        'gradient-card': 'linear-gradient(145deg, #1A2235, #111827)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
