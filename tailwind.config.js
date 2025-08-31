/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy palettes retained for backward compatibility (do not remove existing utility usage)
        primary: {
          50: '#f0f9ff',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          500: '#10b981',
          600: '#059669',
        },
        // New brand tokens per redesign spec
        brand: {
          green: '#16A34A', // Primary CTA / success
          orange: '#FFB703', // Accent / highlights
        },
        page: {
          bg: '#FAFAFB', // Soft off-white background
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'elevate': '0 6px 18px rgba(15,23,42,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
