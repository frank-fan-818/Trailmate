/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B4A',
          hover: '#E55A3D',
          active: '#D04A2D',
        },
        secondary: {
          DEFAULT: '#8B7355',
          hover: '#9B8365',
          active: '#7B6345',
        },
        accent: {
          DEFAULT: '#C4956A',
          hover: '#D4A57A',
          active: '#B4855A',
        },
        neutral: {
          50: '#F7F5F2',
          100: '#E8E4DF',
          200: '#D1D5DB',
          500: '#6B7280',
          700: '#374151',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif', 'PingFang SC', 'Microsoft YaHei'],
        mono: ['Geist Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.75' }],
        'lg': ['1.125rem', { lineHeight: '1.75' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['2rem', { lineHeight: '1.3' }],
        '4xl': ['2.5rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '32': '8rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.08)',
        'md': '0 4px 12px rgba(0,0,0,0.1)',
        'lg': '0 10px 30px rgba(0,0,0,0.15)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'fade': '1000ms',
      },
      maxWidth: {
        'content': '1100px',
      },
    },
  },
  plugins: [],
}
