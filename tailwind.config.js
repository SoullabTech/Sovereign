/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '!**/node_modules/**', // exclude nested node_modules (e.g. app/api/_backend/)
  ],
  theme: {
    extend: {
      colors: {
        // ══════════════════════════════════════════════════════════════════════
        // MAIA CORE BRAND TOKENS
        // The unified design system. Use these for all new UI.
        // ══════════════════════════════════════════════════════════════════════
        maia: {
          // ── Soullab Core: canonical surface system ──
          // These are the actual values used across /maia, /signin, admin.
          // See docs/canon/SOULLAB_THEME.md for usage rules.
          navy: {
            950: '#060D18',  // deepest canvas (page edges)
            900: '#0A1628',  // primary page background
            850: '#0F1D32',  // cards, inputs, panels
            800: '#162640',  // hover/raised surfaces
            700: '#1E3A5F',  // borders, dividers
            600: '#2A4A73',  // focus rings, active borders
          },

          // Typography / neutrals (maps to Tailwind slate)
          ink: {
            100: '#f8fafc',  // primary text (≈ white)
            80: '#e2e8f0',   // secondary text (≈ slate-200)
            60: '#94a3b8',   // muted text (≈ slate-400)
            50: '#7c8fa4',   // mid-muted (≈ slate-400/500 midpoint)
            40: '#64748b',   // tertiary (≈ slate-500)
            35: '#5c6d7e',   // soft hint
            30: '#536070',   // dim hint
            25: '#4c5c6c',   // very dim
            20: '#475569',   // subtle hints (≈ slate-600)
            15: '#3d4d5c',   // near-invisible (deepest readable hint)
          },

          // Signal accent — gold (meaningful actions, step indicators)
          gold: {
            DEFAULT: '#B8860B',  // primary signal
            hover: '#9c6f0a',    // hover/pressed
            subtle: '#B8860B33', // 20% opacity backgrounds
          },

          // Soul accent ("spice" — warmth, sacred highlight)
          spice: {
            400: '#fbbf24',  // icon highlight
            500: '#f59e0b',  // primary accent
            600: '#d97706',  // hover/pressed
            700: '#b45309',  // deep accent
          },

          // Sage — reserved for onboarding/wellness contexts only.
          // NOT for core navigation, chrome, or brand surfaces.
          sage: {
            400: '#5eead4',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
          },

          // Semantic
          danger: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
        },

        // ══════════════════════════════════════════════════════════════════════
        // SOULLAB CORE — Canonical token layer (CSS-variable-backed)
        // See docs/canon/SOULLAB_THEME.md. Use bg-soullab-canvas, etc.
        // ══════════════════════════════════════════════════════════════════════
        soullab: {
          // Field hierarchy: void → field → surface → signal
          field: {
            void: 'var(--sl-bg-canvas-deep)',   // cosmic depth, page edges
            base: 'var(--sl-bg-canvas)',         // main environment
            lift: 'var(--sl-bg-canvas-lift)',     // interaction threshold
          },

          // Legacy aliases (same values, flat namespace)
          canvas:        'var(--sl-bg-canvas)',
          'canvas-deep': 'var(--sl-bg-canvas-deep)',
          'canvas-lift': 'var(--sl-bg-canvas-lift)',

          surface:       'var(--sl-bg-surface)',
          elevated:      'var(--sl-bg-elevated)',
          soft:          'var(--sl-bg-soft)',

          border: {
            subtle: 'var(--sl-border-subtle)',
            strong: 'var(--sl-border-strong)',
          },

          text: {
            primary:   'var(--sl-text-primary)',
            secondary: 'var(--sl-text-secondary)',
            muted:     'var(--sl-text-muted)',
          },

          accent: {
            primary:      'var(--sl-accent-primary)',
            soft:         'var(--sl-accent-soft)',
            maia:         'var(--sl-accent-maia)',
            admin:        'var(--sl-accent-admin)',
            practitioner: 'var(--sl-accent-practitioner)',
            world:        'var(--sl-accent-world)',
            archive:      'var(--sl-accent-archive)',
          },

          state: {
            success: 'var(--sl-state-success)',
            warning: 'var(--sl-state-warning)',
            error:   'var(--sl-state-error)',
            info:    'var(--sl-state-info)',
          },
        },

        // ══════════════════════════════════════════════════════════════════════
        // JADE PALETTE (Mentor / Decision panels — earthy wisdom tones)
        // ══════════════════════════════════════════════════════════════════════
        jade: {
          jade:      '#a8c7a0',  // primary text (soft sage-green)
          sage:      '#8aad82',  // secondary text / borders
          mineral:   '#6b8f64',  // tertiary text / labels
          copper:    '#b89a6a',  // warm accent labels
          bronze:    '#9a7d52',  // gradient accent
          malachite: '#5fa87a',  // vivid accent (buttons, highlights)
          forest:    '#2a4a3a',  // section backgrounds
          shadow:    '#1a2e24',  // outer background layer
          night:     '#162720',  // mid background layer
          dusk:      '#1e3429',  // inner background layer
          abyss:     '#0f1e16',  // deepest backdrop
          silver:    '#b8c9b4',  // light accent
        },

        // ══════════════════════════════════════════════════════════════════════
        // WORLD PALETTES (for special modes / thematic pages)
        // Keep but use sparingly - default to maia.* tokens
        // ══════════════════════════════════════════════════════════════════════

        // Dune world palette
        dune: {
          sand: '#D4A574',
          deep: '#8B6F47',
          amber: '#E6B887',
          sienna: '#A0522D',
          orange: '#FF8C42',
          glow: '#FFA85C',
          dark: '#2A1F1A',
          white: '#FFF8F0',
        },

        // Fremen world palette
        fremen: {
          ibad: '#1E3A5F',
          azure: '#2E5A8A',
          spice: '#4A7BA7',
        },

        // Caladan world palette
        caladan: {
          teal: '#2C7873',
          deep: '#1A4D4A',
          mist: '#5FA8A3',
        },

        // ══════════════════════════════════════════════════════════════════════
        // LEGACY FLAT TOKENS (backward compatibility - migrate away over time)
        // ══════════════════════════════════════════════════════════════════════
        'spice-sand': '#D4A574',
        'deep-sand': '#8B6F47',
        'dune-amber': '#E6B887',
        'sienna-rock': '#A0522D',
        'spice-orange': '#FF8C42',
        'spice-glow': '#FFA85C',
        'spice-deep': '#CC6F35',
        'ibad-blue': '#1E3A5F',
        'fremen-azure': '#2E5A8A',
        'spice-blue': '#4A7BA7',
        'caladan-teal': '#2C7873',
        'water-deep': '#1A4D4A',
        'ocean-mist': '#5FA8A3',
        'bene-gesserit-gold': '#B8860B',
        'navigator-purple': '#6A4C93',
        'atreides-green': '#4A7C59',
        'harkonnen-crimson': '#8B0000',
        'guild-silver': '#C0C0C0',
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
        // MAIA Core Shadows
        'maia-panel': '0 10px 30px rgba(0, 0, 0, 0.45)',
        'maia-panel-hover': '0 18px 45px rgba(0, 0, 0, 0.55)',
        'maia-spice-glow': '0 0 18px rgba(245, 158, 11, 0.25)',
        'maia-spice-glow-lg': '0 0 25px rgba(245, 158, 11, 0.35)',

        // Legacy world shadows (keep for thematic pages)
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
        // Talk-first: subtle cognition hint on left rail world icons
        'rail-breath': {
          '0%': { opacity: '0.5', filter: 'drop-shadow(0 0 0px rgba(212, 184, 150, 0))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 4px rgba(212, 184, 150, 0.4))' },
          '100%': { opacity: '0.5', filter: 'drop-shadow(0 0 0px rgba(212, 184, 150, 0))' },
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Soullab Core field gradients — immersion, not decoration
        'soullab-core': 'linear-gradient(to bottom, var(--sl-bg-canvas-lift), var(--sl-bg-canvas), var(--sl-bg-canvas-deep))',
        'field-core': 'radial-gradient(120% 120% at 50% 0%, var(--sl-bg-canvas-lift) 0%, var(--sl-bg-canvas) 40%, var(--sl-bg-canvas-deep) 100%)',
        'field-depth': 'radial-gradient(80% 100% at 50% 20%, var(--sl-bg-canvas-lift) 0%, var(--sl-bg-canvas) 50%, var(--sl-bg-canvas-deep) 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom)' },
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top)' },
        '.mb-safe': { marginBottom: 'env(safe-area-inset-bottom)' },
        '.mt-safe': { marginTop: 'env(safe-area-inset-top)' },
      });
    },
  ],
}
