/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Roboto Serif"', 'Georgia', 'serif'],
      },
      colors: {
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        'card-dark': 'var(--bg-card-dark)',
        badge: 'var(--bg-badge)',
        surface: 'var(--bg-surface)',
        gold: 'var(--border-gold)',
        'gold-alt': 'var(--border-gold-alt)',
        'border-l': 'var(--border-light)',
        'on-page': 'var(--text-primary)',
        'on-card': 'var(--text-on-card)',
        muted: 'var(--text-muted)',
        primary: 'var(--color-primary)',
        danger: 'var(--color-danger)',
        accent: 'var(--accent-dark)',
      },
    },
  },
  plugins: [],
}
