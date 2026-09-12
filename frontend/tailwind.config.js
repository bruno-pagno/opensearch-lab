/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rausch:   '#FF5A5F',
        balearic: '#00A699',
        ariel:    '#FC642D',
        hof:      '#484848',
        foggy:    '#767676',
        'air-bg': '#F7F7F7',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
