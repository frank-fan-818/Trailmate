import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html').replace(/\\/g, '/'),
    path.join(__dirname, 'src/**/*.{vue,js,ts,jsx,tsx}').replace(/\\/g, '/')
  ],
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
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.25rem', { lineHeight: '1.25' }],
        'xl': ['1.5rem', { lineHeight: '1.25' }],
        '2xl': ['2rem', { lineHeight: '1.25' }],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.08)',
        'md': '0 4px 12px rgba(0,0,0,0.1)',
      },
      transitionDuration: {
        'fast': '150ms',
      },
    },
  },
  plugins: [],
}
