/**
 * Adaptive Typography System for MAIA
 *
 * Responds to context:
 * - Device (mobile vs desktop)
 * - Message length (short wisdom vs extended reflection)
 * - Content type (prose vs code vs poetry)
 *
 * Philosophy: The font should serve the reading experience, not vice versa.
 */

export interface TypographyContext {
  isMobile: boolean;
  messageLength: number;
  hasCodeBlock: boolean;
  hasMarkdown: boolean;
  conversationDepth: number; // Number of messages in thread
}

/**
 * Determine optimal font for MAIA message based on context
 */
export function getMaiaFont(context: TypographyContext): string {
  // Mobile: Always use warmer sans (lighter, easier scanning)
  if (context.isMobile) {
    return 'var(--font-maia-sans)'; // Source Sans 3
  }

  // Desktop with code blocks: Use sans (better for mixed content)
  if (context.hasCodeBlock) {
    return 'var(--font-maia-sans)';
  }

  // Short messages (< 100 chars): Serif feels too formal
  if (context.messageLength < 100) {
    return 'var(--font-maia-sans)';
  }

  // Long, reflective responses on desktop: Serif shines
  if (context.messageLength > 200) {
    return 'var(--font-maia-serif)'; // Crimson Pro
  }

  // Default: Warmer sans (safe choice)
  return 'var(--font-maia-sans)';
}

/**
 * Determine optimal line-height based on message length
 */
export function getMaiaLineHeight(messageLength: number): string {
  // Shorter messages: Tighter line-height
  if (messageLength < 100) return '1.6';

  // Medium messages: Standard
  if (messageLength < 300) return '1.7';

  // Long reflections: More generous
  return '1.75';
}

/**
 * Responsive font sizing
 */
export const responsiveFontSizes = {
  mobile: {
    user: 'clamp(1rem, 4vw, 1rem)',      // 16px fixed on mobile
    maia: 'clamp(1.0625rem, 4vw, 1.0625rem)', // 17px fixed
    interface: 'clamp(0.875rem, 3.5vw, 0.875rem)' // 14px
  },

  tablet: {
    user: 'clamp(1rem, 2vw, 1.0625rem)',      // 16-17px
    maia: 'clamp(1.0625rem, 2vw, 1.125rem)',  // 17-18px
    interface: 'clamp(0.875rem, 1.5vw, 1rem)' // 14-16px
  },

  desktop: {
    user: 'clamp(1rem, 1.5vw, 1.0625rem)',      // 16-17px
    maia: 'clamp(1.0625rem, 1.5vw, 1.125rem)',  // 17-18px
    interface: 'clamp(0.875rem, 1.25vw, 1rem)' // 14-16px
  }
};

/**
 * Spacing adjustments for mobile
 */
export const responsiveSpacing = {
  mobile: {
    messagePadding: '0 1rem',
    messageMarginBottom: {
      user: '1.25rem',
      maia: '1.5rem'
    },
    maxWidth: '100%', // Full width on mobile
    betweenTurns: '2rem'
  },

  tablet: {
    messagePadding: '0 2rem',
    messageMarginBottom: {
      user: '1.5rem',
      maia: '1.75rem'
    },
    maxWidth: '65ch',
    betweenTurns: '2.5rem'
  },

  desktop: {
    messagePadding: '0 3rem',
    messageMarginBottom: {
      user: '1.5rem',
      maia: '2rem'
    },
    maxWidth: '65ch',
    betweenTurns: '3rem'
  }
};

/**
 * React hook for adaptive typography
 */
export function useAdaptiveTypography() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' &&
    window.innerWidth >= 768 && window.innerWidth < 1024;

  return {
    isMobile,
    isTablet,

    getFontForMessage: (message: string, hasCode: boolean = false) => {
      return getMaiaFont({
        isMobile,
        messageLength: message.length,
        hasCodeBlock: hasCode,
        hasMarkdown: message.includes('**') || message.includes('*'),
        conversationDepth: 0 // Could track from context
      });
    },

    getLineHeight: (message: string) => {
      return getMaiaLineHeight(message.length);
    },

    spacing: isMobile
      ? responsiveSpacing.mobile
      : isTablet
        ? responsiveSpacing.tablet
        : responsiveSpacing.desktop
  };
}

/**
 * Usage in a message component:
 */
export const adaptiveTypographyExample = `
import { useAdaptiveTypography } from '@/lib/design/adaptive-typography';

function MaiaMessage({ text, hasCodeBlock }) {
  const { getFontForMessage, getLineHeight, spacing } = useAdaptiveTypography();

  return (
    <div
      className="message-maia"
      style={{
        fontFamily: getFontForMessage(text, hasCodeBlock),
        lineHeight: getLineHeight(text),
        marginBottom: spacing.messageMarginBottom.maia,
        maxWidth: spacing.maxWidth,
        padding: spacing.messagePadding
      }}
    >
      {text}
    </div>
  );
}
`;

/**
 * Testing recommendation:
 *
 * To A/B test serif vs sans:
 * 1. Track user preference (if they manually switch)
 * 2. Measure reading time (slow = might prefer sans)
 * 3. Survey: "How does MAIA's voice feel?" (warm? wise? approachable?)
 * 4. Default to sans, allow serif toggle in settings for power users
 */
export const testingStrategy = {
  defaultFont: 'sans', // Safe choice

  serifEnabled: {
    desktop: true,    // Available on desktop
    mobile: false,    // Not recommended on mobile
    tablet: true      // Optional on tablet
  },

  userPreference: {
    // Store in localStorage: 'maia-font-preference'
    // Options: 'auto' | 'serif' | 'sans'
    default: 'auto',

    // Auto uses context-aware logic
    // Serif forces serif everywhere (desktop only)
    // Sans forces sans everywhere
  }
};
