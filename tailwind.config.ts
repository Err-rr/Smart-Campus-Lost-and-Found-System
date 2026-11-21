import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F4F3EF',
        line: '#E6E4DE',
        divider: '#ECEAE5',
        ink: {
          DEFAULT: '#111111',
          2: '#5F5F66',
          3: '#6B6B72',
          icon: '#3F3F46',
        },
        tile: '#F0EFEA',
        panel: {
          DEFAULT: '#18181B',
          inner: '#232327',
          line: '#303036',
          muted: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#F5C83B',
          hover: '#EDBC24',
          ink: '#111111',
        },
        notice: {
          bg: '#FDF7E1',
          line: '#F1E2A6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        title: ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        section: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.6' }],
        eyebrow: ['11px', { lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      borderRadius: {
        tile: '10px',
        card: '16px',
        panel: '24px',
      },
      maxWidth: {
        page: '1200px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
