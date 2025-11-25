/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Desert Sand Tones
        'spice-sand': '#D4A574',
        'deep-sand': '#8B6F47',
        'dune-amber': '#E6B887',
        'sienna-rock': '#A0522D',

        // Spice Orange (The Melange)
        'spice-orange': '#FF8C42',
        'spice-glow': '#FFA85C',
        'spice-deep': '#CC6F35',

        // Fremen Blue (Eyes of Ibad)
        'ibad-blue': '#1E3A5F',
        'fremen-azure': '#2E5A8A',
        'spice-blue': '#4A7BA7',

        // Caladan Water (Memory of Home)
        'caladan-teal': '#2C7873',
        'water-deep': '#1A4D4A',
        'ocean-mist': '#5FA8A3',

        // Semantic Colors
        'bene-gesserit-gold': '#B8860B',
        'navigator-purple': '#6A4C93',
        'atreides-green': '#4A7C59',
        'harkonnen-crimson': '#8B0000',
        'guild-silver': '#C0C0C0',

        // Base Colors
        'desert-light': '#F5E6D3',
        'desert-dark': '#2A1F1A',
        'sand-white': '#FFF8F0',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'Palatino', 'Georgia', 'serif'],
        'cormorant': ['Cormorant Garamond', 'Didot', 'Bodoni', 'serif'],
        'raleway': ['Raleway', 'Futura', 'Avenir', 'sans-serif'],
        'ibm-mono': ['IBM Plex Mono', 'Courier Prime', 'monospace'],
      },
      spacing: {
        'sacred-xs': '0.5rem',
        'sacred-sm': '1rem',
        'sacred-md': '1.5rem',
        'sacred-lg': '2rem',
        'sacred-xl': '3rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // Guild fine print
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // Mentat notation
        'base': ['1rem', { lineHeight: '1.5rem' }],    // Standard observation
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // Emphasis
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // Section headers
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // Chapter titles
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // Major proclamations
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // Imperial decrees
      },
      boxShadow: {
        'spice': '0 4px 12px rgba(255, 140, 66, 0.2), 0 2px 4px rgba(139, 111, 71, 0.3)',
        'spice-lg': '0 10px 30px rgba(255, 140, 66, 0.3), 0 4px 10px rgba(139, 111, 71, 0.4)',
        'fremen': '0 4px 12px rgba(46, 90, 138, 0.2), 0 2px 4px rgba(30, 58, 95, 0.3)',
        'prescient': '0 0 20px rgba(106, 76, 147, 0.3), 0 0 40px rgba(184, 134, 11, 0.2)',
      },
      keyframes: {
        'spice-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'water-ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'thumper': {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-1px)' },
          '75%': { transform: 'translateY(1px)' },
        },
        'spice-vision': {
          '0%': { filter: 'blur(4px)', opacity: '0.7', transform: 'scale(0.98)' },
          '100%': { filter: 'blur(0px)', opacity: '1', transform: 'scale(1)' },
        },
        'sandworm-spiral': {
          '0%': { transform: 'rotate(0deg) scale(0.8)', opacity: '0.3' },
          '50%': { transform: 'rotate(180deg) scale(1)', opacity: '0.6' },
          '100%': { transform: 'rotate(360deg) scale(0.8)', opacity: '0.3' },
        },
        'fremen-breath': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
      },
      animation: {
        'spice-pulse': 'spice-pulse 2s ease-in-out infinite',
        'water-ripple': 'water-ripple 0.6s ease-out',
        'thumper': 'thumper 0.3s ease-in-out',
        'spice-vision': 'spice-vision 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'sandworm-spiral': 'sandworm-spiral 3s ease-in-out infinite',
        'fremen-breath': 'fremen-breath 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
