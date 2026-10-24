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
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],   // ~13px (crisp badge & metadata)
        sm: ['0.9375rem', { lineHeight: '1.375rem' }],  // ~15px (clean body & inputs)
        base: ['1.0625rem', { lineHeight: '1.625rem' }], // ~17px (comfortable reading)
        lg: ['1.1875rem', { lineHeight: '1.75rem' }],   // ~19px (subheadings)
        xl: ['1.375rem', { lineHeight: '1.875rem' }],   // ~22px (section headers)
        '2xl': ['1.625rem', { lineHeight: '2.125rem' }], // ~26px (titles)
        '3xl': ['2rem', { lineHeight: '2.375rem' }],    // ~32px (KPI numbers)
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }]    // ~40px (hero metrics)
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    }
  },
  plugins: []
};
