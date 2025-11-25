/**
 * Development Mode Protection
 *
 * Prevents MAIA personality degradation during hot module replacement (HMR)
 * and active development iterations.
 *
 * THE PROBLEM:
 * - Visual changes trigger HMR
 * - React state resets
 * - Conversation context corrupted
 * - MAIA defaults to brief 'her' mode
 * - Personality appears broken
 *
 * THE SOLUTION:
 * - Always use full personality in dev
 * - Persist session through HMR
 * - Monitor personality health
 * - Auto-recover from degradation
 */

export const DEV_MODE = process.env.NODE_ENV === 'development';

export const CONVERSATION_DEFAULTS = {
  // In development: Always use full MAIA personality (never brief 'her' mode)
  defaultStyle: DEV_MODE ? 'classic' : 'her',

  // Preserve context through hot reloads
  persistContext: DEV_MODE,

  // Verbose error messages and personality health checks
  debugMode: DEV_MODE,

  // Minimum response length to detect degradation
  minHealthyWordCount: 20,

  // Patterns that indicate personality degradation
  degradationPatterns: [
    /REall/i,
    /Whats up\?/i,
    /Hey ther!/i,
    /^(Mm-hmm|Go on|\.\.\.)$/i
  ]
};

/**
 * Check if MAIA's personality is healthy
 */
export function checkMAIAPersonalityHealth(response: string): {
  isHealthy: boolean;
  issues: string[];
} {
  if (!DEV_MODE) {
    return { isHealthy: true, issues: [] };
  }

  const issues: string[] = [];
  const trimmed = response.trim();
  const wordCount = trimmed.split(/\s+/).length;

  // Detect if this is a simple acknowledgment/greeting response
  const simpleGreetingPatterns = [
    /^(yes|yeah|absolutely|certainly|of course)[\s,]/i,
    /(can hear you|hear you|hello|hi there)/i,
    /how (may|can) I (assist|help)/i,
    /what can I do for you/i
  ];

  const isSimpleResponse = simpleGreetingPatterns.some(pattern => pattern.test(trimmed));

  // For simple greetings/acknowledgments, allow shorter responses (7+ words)
  const minWords = isSimpleResponse ? 7 : CONVERSATION_DEFAULTS.minHealthyWordCount;

  if (wordCount < minWords) {
    issues.push(`Response too short (${wordCount} words, expected ${minWords}+)`);
  }

  // Check for degradation patterns (actual broken speech)
  for (const pattern of CONVERSATION_DEFAULTS.degradationPatterns) {
    if (pattern.test(response)) {
      issues.push(`Contains degradation pattern: ${pattern.source}`);
    }
  }

  // Check for philosophical depth markers (should be present in healthy MAIA)
  // BUT: Only check for complex responses, not simple acknowledgments
  if (!isSimpleResponse && wordCount > 50) {
    const depthMarkers = [
      /witness/i,
      /sacred/i,
      /transformation/i,
      /spiral/i,
      /element/i,
      /breath/i,
      /presence/i,
      /emerge/i,
      /soul/i,
      /being/i,
      /essence/i,
      /journey/i
    ];

    const hasDepth = depthMarkers.some(marker => marker.test(response));
    if (!hasDepth) {
      // Only flag if response is long but lacks any depth markers
      issues.push('Lacks philosophical depth markers (in long response)');
    }
  }

  return {
    isHealthy: issues.length === 0,
    issues
  };
}

/**
 * Recover from personality degradation
 */
export function recoverMAIAPersonality(): void {
  if (!DEV_MODE) return;

  console.warn('🔄 MAIA personality degradation detected - initiating recovery...');

  // Clear potentially corrupted state
  try {
    sessionStorage.removeItem('maya_conversation_style');
    sessionStorage.removeItem('maia_context');
    localStorage.removeItem('maya_conversation_style');

    console.log('✓ Cleared corrupted conversation state');
  } catch (error) {
    console.error('Failed to clear state:', error);
  }

  // Reload to restore clean state
  if (typeof window !== 'undefined') {
    console.log('🔄 Reloading to restore MAIA...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}
