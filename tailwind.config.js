/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#010736', // App background
          900: '#0d1c42', // Card & Panel
          800: '#16285a', // Hover state
          700: '#22396f', // Border & Secondary
          600: '#34529c'
        },
        cream: {
          50: '#fffdf5',
          100: '#fcf1d0', // Primary accent / text
          200: '#f5e2a3',
          300: '#ebd176'
        },
        slate: {
          400: '#8fa2cb',
          300: '#c7d5f5'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    }
  },
  plugins: []
};
