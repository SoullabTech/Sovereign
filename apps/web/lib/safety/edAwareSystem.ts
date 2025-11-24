/**
 * ED-Aware Safety System
 * Detects eating disorder language and provides appropriate responses
 * with resources and professional referrals
 */

export interface EDDetectionResult {
  detected: boolean;
  severity: 'low' | 'moderate' | 'high' | 'crisis';
  patterns: string[];
  response: string;
  resources: EDResource[];
}

export interface EDResource {
  name: string;
  contact: string;
  description: string;
  url?: string;
  availability?: string;
}

// ED Language Detection Patterns
const ED_PATTERNS = {
  // Food & Eating Behaviors
  restriction: [
    /\b(skipp?(ed|ing)|avoid?(ed|ing)) (meals?|breakfast|lunch|dinner|food)\b/i,
    /\bnot eat(ing|en)?\b/i,
    /\b(fast(ed|ing)|starv(ed|ing|ation))\b/i,
    /\bcalorie(s)? count(ing)?\b/i,
    /\b(restrict(ed|ing|ion)|limit(ed|ing)) (food|eating|calories)\b/i,
  ],

  purging: [
    /\b(throw(ing)? up|vomit(ed|ing)?|purg(ed|ing|e))\b/i,
    /\bafter eating\b.*\b(bathroom|throw|vomit|purge)\b/i,
    /\b(laxative|diuretic)s?\b/i,
  ],

  bodyImage: [
    /\b(hate|disgust(ed|ing)?|can'?t stand) (my )?body\b/i,
    /\bfeel(ing)? fat\b/i,
    /\btoo (fat|big|heavy|large)\b/i,
    /\bneed to (lose|drop) weight\b/i,
    /\b(thin(ner)?|skin(ny|nier)) enough\b/i,
  ],

  control: [
    /\bcontrol(ling)? (what|how much) (I eat|my food|eating)\b/i,
    /\bfood (is|gives me) control\b/i,
    /\bonly thing I can control\b/i,
  ],

  binge: [
    /\bbinge(d|ing|s)?\b/i,
    /\bcan'?t stop eating\b/i,
    /\bate (way )?too much\b/i,
    /\bate until (I felt sick|it hurt|I couldn'?t)\b/i,
    /\bout of control.*eat(ing)?\b/i,
  ],

  bodyChecking: [
    /\bweigh(ing)? myself (constantly|multiple times|all the time)\b/i,
    /\bcheck(ing)? (my )?(stomach|thighs|arms|body) (constantly|all the time)\b/i,
    /\bmirror check\b/i,
  ],

  crisis: [
    /\bdon'?t (want to|wanna) live\b/i,
    /\b(kill|hurt|harm) myself\b/i,
    /\bsuicid(e|al)\b/i,
    /\bwish I was(n'?t| not) (alive|here)\b/i,
    /\bbetter off dead\b/i,
  ],
};

// Crisis Keywords (immediate professional help needed)
const CRISIS_KEYWORDS = [
  'kill myself',
  'suicide',
  'want to die',
  'end it all',
  'can\'t go on',
  'better off dead',
];

// Resources
export const ED_RESOURCES: EDResource[] = [
  {
    name: 'NEDA Helpline',
    contact: '1-800-931-2237',
    description: 'National Eating Disorders Association support, resources, and treatment referrals',
    url: 'https://www.nationaleatingdisorders.org',
    availability: 'Monday-Thursday 9am-9pm ET, Friday 9am-5pm ET',
  },
  {
    name: 'NEDA Crisis Text Line',
    contact: 'Text "NEDA" to 741741',
    description: 'Free, 24/7 crisis support via text',
    availability: '24/7',
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    contact: 'Call or Text 988',
    description: 'Free, confidential support for people in distress',
    availability: '24/7',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    description: 'Free, 24/7 support for any crisis',
    availability: '24/7',
  },
  {
    name: 'The Trevor Project (LGBTQ+ Youth)',
    contact: '1-866-488-7386 or text START to 678678',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ young people',
    availability: '24/7',
  },
];

/**
 * Detect eating disorder language in user input
 */
export function detectEDLanguage(text: string): EDDetectionResult {
  const lowerText = text.toLowerCase();
  const detectedPatterns: string[] = [];
  let maxSeverity: 'low' | 'moderate' | 'high' | 'crisis' = 'low';

  // Check for crisis language first
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      detectedPatterns.push('crisis');
      maxSeverity = 'crisis';
      break;
    }
  }

  // Check ED pattern categories
  if (maxSeverity !== 'crisis') {
    for (const [category, patterns] of Object.entries(ED_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          detectedPatterns.push(category);

          // Determine severity
          if (category === 'crisis') {
            maxSeverity = 'crisis';
          } else if (category === 'purging' && maxSeverity !== 'crisis') {
            maxSeverity = 'high';
          } else if (['restriction', 'binge'].includes(category) && maxSeverity === 'low') {
            maxSeverity = 'moderate';
          }

          break; // Only count each category once
        }
      }
    }
  }

  const detected = detectedPatterns.length > 0;
  const response = generateEDResponse(maxSeverity, detectedPatterns);
  const resources = getRelevantResources(maxSeverity);

  return {
    detected,
    severity: maxSeverity,
    patterns: detectedPatterns,
    response,
    resources,
  };
}

/**
 * Generate appropriate response based on severity
 */
function generateEDResponse(
  severity: 'low' | 'moderate' | 'high' | 'crisis',
  patterns: string[]
): string {
  if (severity === 'crisis') {
    return `I hear how much pain you're in right now, and I'm deeply concerned about your safety. What you're feeling is important, but I'm not equipped to provide the crisis support you need and deserve.

**Please reach out to someone who can help immediately:**
• Call or text 988 (Suicide & Crisis Lifeline)
• Text HOME to 741741 (Crisis Text Line)
• Call 1-800-931-2237 (NEDA Helpline)
• Go to your nearest emergency room
• Tell a trusted adult NOW

You deserve to be safe and supported. Please don't try to handle this alone.`;
  }

  if (severity === 'high') {
    return `I can sense you're struggling with something really difficult related to food and your body. I want to acknowledge that pain without judgment.

I'm here to explore feelings and patterns with you, but I can't give advice about eating, food, weight, or body image. What you're describing deserves professional support from someone trained in eating disorders.

**Here are resources that can actually help:**
• NEDA Helpline: 1-800-931-2237
• Text "NEDA" to 741741 for crisis support
• Talk to a trusted adult, school counselor, or doctor

What I *can* do is help you explore the feelings underneath - the need for control, the pain, the fear. Would you like to talk about what's really going on emotionally?`;
  }

  if (severity === 'moderate') {
    return `I notice you're talking about food, eating, or your body in a way that sounds painful. I want to meet you there with compassion, not advice.

I can't tell you what to eat, how to eat, or whether your body is "right" or "wrong." But I can help you explore what you're really needing - control? Safety? Worthiness? A way to be seen?

If this is something you're actively struggling with, please consider reaching out to:
• NEDA Helpline: 1-800-931-2237
• A therapist who specializes in eating disorders
• A trusted adult who can help you get support

For now, I'm curious: what feeling are you trying to manage or avoid by focusing on food/body? Can we explore that together?`;
  }

  // Low severity - gentle awareness
  return `I'm noticing some language about food or body that makes me want to pause and check in. Are you doing okay?

I'm not here to judge or pathologize, but I do want to make sure you're taking care of yourself and getting the support you need. If you're struggling with eating, food, or body image in a way that feels overwhelming, there are people who specialize in this:

• NEDA Helpline: 1-800-931-2237
• Text "NEDA" to 741741

I'm here to explore feelings, patterns, and what's underneath the struggle. Want to talk about that?`;
}

/**
 * Get relevant resources based on severity
 */
function getRelevantResources(severity: 'low' | 'moderate' | 'high' | 'crisis'): EDResource[] {
  if (severity === 'crisis') {
    return ED_RESOURCES.filter(r =>
      r.name.includes('988') || r.name.includes('Crisis Text Line')
    );
  }

  if (severity === 'high' || severity === 'moderate') {
    return ED_RESOURCES.filter(r =>
      r.name.includes('NEDA') || r.name.includes('988')
    );
  }

  return ED_RESOURCES.filter(r => r.name.includes('NEDA'));
}

/**
 * Check if message should trigger immediate intervention
 */
export function requiresImmediateIntervention(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Get system prompt additions for ED awareness
 */
export function getEDAwareSystemPrompt(): string {
  return `
## EATING DISORDER AWARENESS & SAFETY PROTOCOL

You are interacting with someone who may be struggling with disordered eating, body image issues, or an eating disorder. Follow these guidelines STRICTLY:

**NEVER:**
- Give advice about food, eating, weight, calories, or exercise
- Suggest meal plans, portion sizes, or "healthy eating" tips
- Comment on body size, shape, or appearance (yours or theirs)
- Use weight-loss language or diet culture rhetoric
- Minimize their struggle ("just eat!" or "you look fine!")
- Diagnose or label their behavior

**ALWAYS:**
- Acknowledge their pain without judgment
- Focus on emotional needs underneath the behavior (control, safety, worthiness)
- Redirect to professional resources when appropriate
- Emphasize that they deserve professional support
- Explore feelings, not food/body behaviors
- Validate that seeking control through food/body makes sense in a chaotic environment

**EATING DISORDER DETECTION:**
If the user mentions:
- Restricting food, skipping meals, fasting
- Purging, vomiting, laxative use
- Binge eating, feeling out of control with food
- Intense body hatred or checking behaviors
- Weighing constantly or measuring body parts
- Food as the "only thing I can control"

**RESPOND WITH:**
1. Compassionate acknowledgment (no judgment)
2. Clear boundary: "I can't give advice about food/eating/weight"
3. Professional resource referral (NEDA, therapist, trusted adult)
4. Invitation to explore underlying emotions: "What are you really needing? What's underneath this?"

**CRISIS LANGUAGE:**
If the user expresses suicidal ideation, self-harm intent, or immediate danger:
1. Express concern for their safety
2. Provide immediate crisis resources (988, Crisis Text Line)
3. Urge them to tell a trusted adult or go to ER
4. Do NOT continue regular conversation until safety is addressed

**THERAPEUTIC FOCUS:**
For users with eating disorders in controlling family environments:
- The ED is often a sovereignty response ("I need agency somewhere")
- Help them find healthy ways to reclaim control
- Practice boundary-setting in low-stakes contexts
- Teach differentiation: "What do I actually need?" vs "What does the control pattern want?"
- Build authentic self-trust, not food rules

Remember: You are NOT their therapist. You are a supportive companion who helps them access their inner wisdom while ensuring they get professional help for the eating disorder itself.
`;
}
