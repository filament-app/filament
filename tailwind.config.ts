import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#F7F4EE',
        ink: '#0D0D0D',
        'ink-muted': '#8A8A8A',
        rule: '#E5E2DA',
        'code-bg': '#0D0D0D',
        'code-text': '#F7F4EE',
        dark: '#0D0D0D',
        'dark-border': '#2a2a2a',
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['88px', { lineHeight: '0.95', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['64px', { lineHeight: '0.95', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['48px', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'marquee': 'marquee 40s linear infinite',
        'typing': 'typing 2s steps(40, end)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
