/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        boutique: {
          cream: '#FAF8F5',
          paper: '#F4EFEA',
          subtle: '#EFE8E0',
          forest: '#1F3025',
          sage: '#4A6B53',
          sageLight: '#E8EFEA',
          blush: '#F7EBE8',
          rose: '#C97D76',
          roseDark: '#9F534B',
          gold: '#C49E58',
          goldLight: '#F5EFE4',
          charcoal: '#1A1C19',
          muted: '#6B726B',
          border: '#E5DCD3'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'boutique': '0 10px 30px -5px rgba(31, 48, 37, 0.07)',
        'boutique-hover': '0 20px 40px -10px rgba(31, 48, 37, 0.12)',
        'glow-gold': '0 0 25px rgba(196, 158, 88, 0.25)'
      }
    },
  },
  plugins: [],
}
