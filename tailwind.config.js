/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        palette: {
          bg: '#F9F8F6',
          surface: '#EFE9E3',
          card: '#FFFFFF',
          border: '#D9CFC7',
          accent: '#C9B59C',
          accentDark: '#8F7556',
          text: '#2D2B28',
          muted: '#7A756F'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    }
  },
  plugins: []
};
