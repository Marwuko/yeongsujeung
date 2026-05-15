import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — warm, trustworthy, slightly Korean-aesthetic
        brand: {
          50: '#fef7ee',
          100: '#fdecd6',
          200: '#fad5ad',
          300: '#f6b679',
          400: '#f18d43',
          500: '#ed6f1f',
          600: '#de5615',
          700: '#b84014',
          800: '#933418',
          900: '#762d17',
        },
        ink: {
          50: '#f6f6f5',
          100: '#e7e7e4',
          200: '#d0d0cb',
          300: '#aeaea6',
          400: '#85857c',
          500: '#6a6a61',
          600: '#55554d',
          700: '#454540',
          800: '#3a3a36',
          900: '#33332f',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
