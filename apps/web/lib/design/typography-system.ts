/**
 * Spiralogic Typography System
 *
 * Evolved aesthetic that maintains our soulful depth while achieving
 * Claude-level polish and warmth.
 *
 * Design Philosophy:
 * - User messages: Clean, present, grounded (sans-serif)
 * - MAIA messages: Warm, literary, slightly more elegant (serif or warm sans)
 * - Hierarchy through size, weight, and spacing (not boxes)
 * - Typography that breathes - generous line-height and letter-spacing
 */

export const typographySystem = {
  // Font Families
  fonts: {
    user: {
      family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      description: 'Clean, modern sans-serif for user input - feels present and grounded'
    },

    maia: {
      // Option A: Warm serif for literary quality
      familySerif: '"Crimson Pro", "Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif',

      // Option B: Warmer sans-serif (slightly different from user)
      familySans: '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif',

      description: 'Warmer, slightly more elegant for MAIA - feels wise and present'
    },

    interface: {
      family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      description: 'UI elements, buttons, labels'
    },

    monospace: {
      family: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
      description: 'Code blocks, technical content'
    }
  },

  // Scale (using fluid typography - responsive)
  scale: {
    // Display (page titles, welcome screens)
    display: {
      size: 'clamp(2rem, 4vw, 3rem)',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      weight: '700'
    },

    // Headings
    h1: {
      size: 'clamp(1.75rem, 3vw, 2.25rem)',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
      weight: '600'
    },

    h2: {
      size: 'clamp(1.5rem, 2.5vw, 1.875rem)',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
      weight: '600'
    },

    h3: {
      size: 'clamp(1.25rem, 2vw, 1.5rem)',
      lineHeight: '1.4',
      letterSpacing: '0',
      weight: '600'
    },

    // Body text - THE MOST IMPORTANT
    body: {
      size: 'clamp(1rem, 1.5vw, 1.125rem)', // 16-18px
      lineHeight: '1.7', // Generous - makes reading comfortable
      letterSpacing: '0.01em', // Slight breathing room
      weight: '400'
    },

    bodyLarge: {
      size: 'clamp(1.125rem, 1.75vw, 1.25rem)', // 18-20px for MAIA responses
      lineHeight: '1.7',
      letterSpacing: '0.01em',
      weight: '400'
    },

    // Small text
    small: {
      size: 'clamp(0.875rem, 1.25vw, 1rem)', // 14-16px
      lineHeight: '1.5',
      letterSpacing: '0.01em',
      weight: '400'
    },

    caption: {
      size: 'clamp(0.75rem, 1vw, 0.875rem)', // 12-14px
      lineHeight: '1.4',
      letterSpacing: '0.02em',
      weight: '400'
    }
  },

  // Message-specific styling
  messages: {
    user: {
      fontFamily: '"Inter", -apple-system, sans-serif',
      fontSize: 'clamp(1rem, 1.5vw, 1.0625rem)', // 16-17px
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0.01em',
      color: 'var(--color-text-user)', // Defined in color system

      // No background box - just clean text
      background: 'transparent',
      padding: '0',
      border: 'none',

      // Breathing room
      marginBottom: '1.5rem'
    },

    maia: {
      // Choose serif or sans based on preference
      fontFamily: '"Crimson Pro", "Iowan Old Style", serif', // Serif option
      // fontFamily: '"Source Sans 3", system-ui, sans-serif', // Sans option

      fontSize: 'clamp(1.0625rem, 1.5vw, 1.125rem)', // 17-18px (slightly larger)
      fontWeight: '400',
      lineHeight: '1.7', // More generous for longer responses
      letterSpacing: '0.01em',
      color: 'var(--color-text-maia)',

      // No background box
      background: 'transparent',
      padding: '0',
      border: 'none',

      // More breathing room
      marginBottom: '2rem'
    },

    system: {
      fontFamily: '"Inter", sans-serif',
      fontSize: 'clamp(0.875rem, 1.25vw, 1rem)', // 14-16px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0.01em',
      color: 'var(--color-text-muted)',
      fontStyle: 'italic',
      marginBottom: '1rem'
    }
  },

  // Reading width (optimal line length)
  readingWidth: {
    comfortable: '65ch', // 65 characters - ideal for body text
    wide: '80ch',        // For code blocks
    narrow: '45ch'       // For poetry, quotes
  }
};

/**
 * CSS Custom Properties
 * Apply these in your global CSS or theme
 */
export const typographyCSS = `
/* Typography System */
:root {
  /* Font families */
  --font-user: ${typographySystem.fonts.user.family};
  --font-maia: ${typographySystem.fonts.maia.familySerif};
  --font-interface: ${typographySystem.fonts.interface.family};
  --font-mono: ${typographySystem.fonts.monospace.family};

  /* Scale */
  --text-display: ${typographySystem.scale.display.size};
  --text-h1: ${typographySystem.scale.h1.size};
  --text-h2: ${typographySystem.scale.h2.size};
  --text-h3: ${typographySystem.scale.h3.size};
  --text-body: ${typographySystem.scale.body.size};
  --text-body-large: ${typographySystem.scale.bodyLarge.size};
  --text-small: ${typographySystem.scale.small.size};
  --text-caption: ${typographySystem.scale.caption.size};

  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  --leading-loose: 2;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.01em;
  --tracking-wider: 0.02em;

  /* Reading width */
  --reading-width: ${typographySystem.readingWidth.comfortable};
}

/* Base typography */
body {
  font-family: var(--font-interface);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  letter-spacing: var(--tracking-wide);
}

/* Message styles */
.message-user {
  font-family: var(--font-user);
  font-size: ${typographySystem.messages.user.fontSize};
  line-height: ${typographySystem.messages.user.lineHeight};
  letter-spacing: ${typographySystem.messages.user.letterSpacing};
  color: ${typographySystem.messages.user.color};
  margin-bottom: ${typographySystem.messages.user.marginBottom};
  max-width: var(--reading-width);
}

.message-maia {
  font-family: var(--font-maia);
  font-size: ${typographySystem.messages.maia.fontSize};
  line-height: ${typographySystem.messages.maia.lineHeight};
  letter-spacing: ${typographySystem.messages.maia.letterSpacing};
  color: ${typographySystem.messages.maia.color};
  margin-bottom: ${typographySystem.messages.maia.marginBottom};
  max-width: var(--reading-width);
}

.message-system {
  font-family: var(--font-interface);
  font-size: ${typographySystem.messages.system.fontSize};
  line-height: ${typographySystem.messages.system.lineHeight};
  letter-spacing: ${typographySystem.messages.system.letterSpacing};
  color: ${typographySystem.messages.system.color};
  font-style: italic;
  margin-bottom: ${typographySystem.messages.system.marginBottom};
}
`;

/**
 * Usage Examples
 */
export const typographyExamples = {
  userMessage: `
    <div className="message-user">
      This is what a user message looks like. Clean, present, grounded.
      The Inter font feels modern without being cold.
    </div>
  `,

  maiaMessageSerif: `
    <div className="message-maia">
      This is MAIA speaking. The serif font (Crimson Pro) adds warmth and
      literary quality - like reading a letter from a wise friend. Notice
      how the generous line-height (1.7) makes longer responses comfortable.
    </div>
  `,

  maiaMessageSans: `
    <div className="message-maia" style={{ fontFamily: 'var(--font-maia-sans)' }}>
      Or MAIA could use Source Sans 3 - warmer than Inter, still clean,
      slightly more approachable. This might feel better for shorter exchanges.
    </div>
  `
};
