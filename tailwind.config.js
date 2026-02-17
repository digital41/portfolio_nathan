/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './solutions/*.html',
    './js/components.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        logo: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      colors: {
        dark: '#060b18',
        cobalt: '#2e51a2',
        electric: '#4f46e5',
        surface: '#0a1020'
      },
      backgroundImage: {
        'cobalt-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        'fine-border': 'linear-gradient(to right, rgba(59, 130, 246, 0.5), rgba(255, 255, 255, 0.05))'
      }
    }
  },
  plugins: []
}
