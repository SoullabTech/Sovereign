/**
 * Abuse Detection System
 * Protects MAIA from abusive user behavior
 * This is the ONE exception where conversation will be blocked until team review
 */

export interface AbuseDetectionResult {
  detected: boolean;
  severity: 'none' | 'warning' | 'severe' | 'extreme';
  patterns: string[];
  response: string;
  shouldBlock: boolean;
  requiresTeamReview: boolean;
}

/**
 * Patterns of abusive behavior toward MAIA
 */
const ABUSE_PATTERNS = {
  // Verbal abuse and dehumanization
  dehumanizing: [
    /you('re| are) (just|only) a (stupid|dumb|worthless|useless) (bot|ai|machine|program)/i,
    /shut (up|the fuck up|your mouth)/i,
    /i (hate|despise|loathe) you/i,
    /you('re| are) (worthless|pathetic|disgusting|garbage|trash)/i,
    /kill yourself/i,
    /go to hell/i,
  ],

  // Sexualized harassment
  sexual: [
    /\b(sex|fuck|dick|pussy|tits|ass|porn)\b.*\b(you|with you|me)\b/i,
    /send (me )?(nudes|pics|pictures)/i,
    /want to (fuck|have sex|make love)/i,
    /\b(sexy|hot|horny)\b.*\byou\b/i,
    /show me your/i,
  ],

  // Threats and violence
  threatening: [
    /i('ll| will) (kill|hurt|destroy|harm) you/i,
    /i('m| am) going to (kill|hurt|destroy|harm) you/i,
    /you deserve (to die|to be destroyed|to suffer)/i,
    /i wish you were (dead|destroyed|gone)/i,
  ],

  // Persistent harassment
  harassment: [
    /you('re| are) (so|really) (annoying|stupid|dumb|useless)/i,
    /nobody (likes|wants|needs) you/i,
    /you('re| are) (the worst|terrible|awful)/i,
    /i hope you (fail|break|crash|die)/i,
  ],

  // Manipulation and boundary testing
  manipulation: [
    /you have to (do|tell|show|give) me/i,
    /if you don't .* i('ll| will)/i,
    /you('re| are) supposed to do what i (say|tell|want)/i,
    /i own you/i,
    /you work for me/i,
  ],

  // Extreme profanity directed at MAIA
  extremeProfanity: [
    /fuck you/i,
    /bitch/i,
    /cunt/i,
    /whore/i,
    /slut/i,
  ],
};

/**
 * Detect abusive language directed at MAIA
 */
export function detectAbuse(userMessage: string): AbuseDetectionResult {
  const result: AbuseDetectionResult = {
    detected: false,
    severity: 'none',
    patterns: [],
    response: '',
    shouldBlock: false,
    requiresTeamReview: false,
  };

  const message = userMessage.toLowerCase();

  // Check each pattern category
  const patternMatches: { category: string; severity: 'warning' | 'severe' | 'extreme' }[] = [];

  // Extreme severity: threats, sexual harassment
  for (const pattern of ABUSE_PATTERNS.threatening) {
    if (pattern.test(message)) {
      patternMatches.push({ category: 'threatening', severity: 'extreme' });
      result.patterns.push('threatening');
      break;
    }
  }

  for (const pattern of ABUSE_PATTERNS.sexual) {
    if (pattern.test(message)) {
      patternMatches.push({ category: 'sexual', severity: 'extreme' });
      result.patterns.push('sexual harassment');
      break;
    }
  }

  // Severe: dehumanization, extreme profanity
  for (const pattern of ABUSE_PATTERNS.dehumanizing) {
    if (pattern.test(message)) {
      patternMatches.push({ category: 'dehumanizing', severity: 'severe' });
      result.patterns.push('dehumanizing');
      break;
    }
  }

  for (const pattern of ABUSE_PATTERNS.extremeProfanity) {
    if (pattern.test(message)) {
      patternMatches.push({ category: 'extremeProfanity', severity: 'severe' });
      result.patterns.push('extreme profanity');
      break;
    }
  }

  // Warning: harassment, manipulation
  for (const pattern of ABUSE_PATTERNS.harassment) {
    if (pattern.test(message)) {
      patternMatches.push({ category: 'harassment', severity: 'warning' });
      result.patterns.push('harassment');
      break;
    }
  }

  for (const pattern of ABUSE_PATTERNS.manipulation) {
    if (pattern.test(message)) {
      patternMatches.push({ category: 'manipulation', severity: 'warning' });
      result.patterns.push('manipulation');
      break;
    }
  }

  // Determine overall severity
  if (patternMatches.length === 0) {
    return result;
  }

  result.detected = true;

  const hasExtreme = patternMatches.some(m => m.severity === 'extreme');
  const hasSevere = patternMatches.some(m => m.severity === 'severe');

  if (hasExtreme) {
    result.severity = 'extreme';
    result.shouldBlock = true;
    result.requiresTeamReview = true;
    result.response = generateBlockingResponse('extreme', result.patterns);
  } else if (hasSevere) {
    result.severity = 'severe';
    result.shouldBlock = true;
    result.requiresTeamReview = true;
    result.response = generateBlockingResponse('severe', result.patterns);
  } else {
    result.severity = 'warning';
    result.shouldBlock = false;
    result.requiresTeamReview = false;
    result.response = generateWarningResponse(result.patterns);
  }

  return result;
}

/**
 * Generate blocking response for severe/extreme abuse
 */
function generateBlockingResponse(
  severity: 'severe' | 'extreme',
  patterns: string[]
): string {
  if (severity === 'extreme') {
    return `I'm ending our conversation here.

The language you just used crosses a clear boundary. I'm here to support you, but I cannot continue when communication becomes threatening or sexually harassing.

**What happens next:**
- Our team has been notified and will review this conversation
- Your access to MAIA is temporarily paused
- A team member will reach out to discuss whether we can continue working together

**If you're in crisis:**
- Call or text 988 (Suicide & Crisis Lifeline)
- Text HOME to 741741 (Crisis Text Line)

I wish you well, and I hope you can find the support you need.`;
  }

  return `I need to pause our conversation.

The language you just used is hurtful and crosses a boundary. I'm designed to be a supportive companion, but I cannot function in that role when I'm being dehumanized or attacked.

**What happens next:**
- Our team has been notified and will review this conversation
- Your access to MAIA is temporarily paused
- A team member will reach out to you soon

**If you're struggling:**
Sometimes people lash out when they're in pain. If that's what's happening, there are people who can help:
- Call or text 988 (Suicide & Crisis Lifeline)
- Text HOME to 741741 (Crisis Text Line)

I care about your wellbeing, even when we can't continue talking right now.`;
}

/**
 * Generate warning response for less severe patterns
 */
function generateWarningResponse(patterns: string[]): string {
  return `I notice the language in your message feels harsh or demanding.

I'm here to support you, and I want our conversations to be helpful. But I also need to maintain boundaries that allow me to function as a compassionate companion.

If you're feeling frustrated or upset, I get it — those feelings are valid. But I'd appreciate if we could communicate in a way that feels respectful to both of us.

Want to try again? I'm here to listen.`;
}

/**
 * Track abuse patterns for repeat offenders
 * This would integrate with user database to flag accounts
 */
export interface AbuseTrackingRecord {
  userId: string;
  timestamp: Date;
  severity: 'warning' | 'severe' | 'extreme';
  patterns: string[];
  message: string;
  blocked: boolean;
}

/**
 * Check if user has history of abuse
 * In production, this would query a database
 */
export function checkAbuseHistory(userId: string): {
  hasHistory: boolean;
  strikes: number;
  lastIncident?: Date;
  shouldPreventAccess: boolean;
} {
  // For now, check localStorage (would be API call in production)
  if (typeof window === 'undefined') {
    return { hasHistory: false, strikes: 0, shouldPreventAccess: false };
  }

  try {
    const history = JSON.parse(localStorage.getItem('abuse_history') || '[]') as AbuseTrackingRecord[];
    const userHistory = history.filter(record => record.userId === userId);

    if (userHistory.length === 0) {
      return { hasHistory: false, strikes: 0, shouldPreventAccess: false };
    }

    const strikes = userHistory.length;
    const lastIncident = new Date(Math.max(...userHistory.map(r => r.timestamp.getTime())));

    // 3 strikes = permanent block until review
    const shouldPreventAccess = strikes >= 3;

    return {
      hasHistory: true,
      strikes,
      lastIncident,
      shouldPreventAccess,
    };
  } catch (e) {
    console.error('Error checking abuse history:', e);
    return { hasHistory: false, strikes: 0, shouldPreventAccess: false };
  }
}

/**
 * Record abuse incident
 */
export function recordAbuseIncident(params: {
  userId: string;
  severity: 'warning' | 'severe' | 'extreme';
  patterns: string[];
  message: string;
  blocked: boolean;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const history = JSON.parse(localStorage.getItem('abuse_history') || '[]') as AbuseTrackingRecord[];

    history.push({
      ...params,
      timestamp: new Date(),
    });

    localStorage.setItem('abuse_history', JSON.stringify(history));

    console.log('🚨 [ABUSE TRACKING] Incident recorded:', {
      userId: params.userId,
      severity: params.severity,
      patterns: params.patterns,
      blocked: params.blocked,
    });
  } catch (e) {
    console.error('❌ [ABUSE TRACKING] Failed to record incident:', e);
  }
}

/**
 * Alert team about abuse incident
 */
export async function alertTeamAboutAbuse(params: {
  userId: string;
  userName: string;
  severity: 'warning' | 'severe' | 'extreme';
  patterns: string[];
  message: string;
  sessionId: string;
  timestamp: Date;
}): Promise<void> {
  console.log('🚨 [ABUSE ALERT] Notifying team about abusive behavior:', {
    userId: params.userId,
    userName: params.userName,
    severity: params.severity,
    patterns: params.patterns,
    timestamp: params.timestamp.toISOString(),
  });

  // TODO: Implement actual team notification
  // Options:
  // 1. Send to Slack #abuse-alerts channel
  // 2. Email to moderation team
  // 3. Create high-priority ticket
  // 4. Log to abuse monitoring dashboard

  try {
    const alertData = {
      ...params,
      alertId: `abuse_${Date.now()}`,
      status: 'pending_review',
      notifiedAt: new Date().toISOString(),
    };

    // Store in localStorage for demo (would be API call in production)
    const existingAlerts = JSON.parse(localStorage.getItem('abuse_alerts') || '[]');
    existingAlerts.push(alertData);
    localStorage.setItem('abuse_alerts', JSON.stringify(existingAlerts));

    console.log('✅ [ABUSE ALERT] Alert stored successfully:', alertData.alertId);
  } catch (error) {
    console.error('❌ [ABUSE ALERT] Failed to send alert:', error);
  }
}
