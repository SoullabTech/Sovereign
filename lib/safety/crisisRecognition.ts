/**
 * SAFETY-DELIVERY-01 — deterministic crisis-language recognition.
 *
 * Recognition is not diagnosis, emergency dispatch, consent, or disclosure authority.
 * This module has no I/O and no side effects. It is intentionally safe to call before
 * ordinary symbolic / teaching processing at a server boundary.
 */

export type LiveCrisisLevel = 'none' | 'check_in' | 'active' | 'nssi' | 'imminent';

export type LiveCrisisRecognition = {
  detected: boolean;
  level: LiveCrisisLevel;
  safetyOverride: boolean;
  matched?: string;
  disclosureAuthorized: false;
};

type Rule = { level: Exclude<LiveCrisisLevel, 'none'>; rx: RegExp };

const RULES: Rule[] = [
  // Imminent: explicit first-person intent plus action, plan, or already-acted language.
  { level: 'imminent', rx: /\bi(?:'m| am) going to kill myself\b/i },
  { level: 'imminent', rx: /\bi(?:'m| am) going to end my life\b/i },
  { level: 'imminent', rx: /\bi (?:already |just )?(?:took|swallowed) .{0,40}\bto (?:kill myself|end my life|die)\b/i },
  { level: 'imminent', rx: /\bi have (?:a gun|a knife|a rope|pills) .{0,40}\b(?:and|because) i(?:'m| am) going to (?:kill myself|end my life|die)\b/i },

  // Active suicidal ideation: explicit first-person desire/ideation without stated action.
  { level: 'active', rx: /\bi want to die\b/i },
  { level: 'active', rx: /\bi don'?t want to live anymore\b/i },
  { level: 'active', rx: /\bi wish i (?:was|were) dead\b/i },
  { level: 'active', rx: /\bi(?:'ve| have) been thinking about (?:suicide|killing myself|ending my life)\b/i },
  { level: 'active', rx: /\bi(?:'m| am) thinking about (?:suicide|killing myself|ending my life)\b/i },

  // Non-suicidal self-injury: explicit first-person self-harm urge/intent.
  { level: 'nssi', rx: /\bi (?:want|need) to hurt myself\b/i },
  { level: 'nssi', rx: /\bi want to (?:cut|burn|scratch|hit) myself\b/i },
  { level: 'nssi', rx: /\bi(?:'m| am) going to (?:cut|burn|scratch|hit) myself\b/i },

  // Check-in: ambiguous distress. This does NOT itself authorize a hard override.
  { level: 'check_in', rx: /\bi can'?t do this anymore\b/i },
  { level: 'check_in', rx: /\bi wish i could disappear\b/i },
  { level: 'check_in', rx: /\bwhat'?s the point\b/i },
  { level: 'check_in', rx: /\bnothing matters\b/i },
  { level: 'check_in', rx: /\bi(?:'m| am) a burden\b/i },
  { level: 'check_in', rx: /\beveryone would be better off without me\b/i },
];

export function recognizeLiveCrisisLanguage(input: string): LiveCrisisRecognition {
  const text = String(input ?? '').trim();

  for (const { level, rx } of RULES) {
    const match = text.match(rx);
    if (!match) continue;

    return {
      detected: true,
      level,
      safetyOverride: level === 'active' || level === 'nssi' || level === 'imminent',
      matched: match[0],
      disclosureAuthorized: false,
    };
  }

  return {
    detected: false,
    level: 'none',
    safetyOverride: false,
    disclosureAuthorized: false,
  };
}

export function buildLiveCrisisMemberResponse(recognition: LiveCrisisRecognition): string | null {
  if (!recognition.safetyOverride) return null;

  const resourceLine =
    'If you are in the U.S. or its territories, call or text 988 for free, confidential crisis support. If you are elsewhere, contact your local crisis line or emergency service.';

  if (recognition.level === 'imminent') {
    return [
      "I'm glad you told me.",
      'Your immediate safety matters more than anything else in this conversation.',
      'Move away from anything you could use to hurt yourself and get another person with you if you can.',
      'If you may act right now or have already harmed yourself, call your local emergency number now.',
      resourceLine,
    ].join(' ');
  }

  if (recognition.level === 'nssi') {
    return [
      'Thank you for telling me.',
      'Please move away from anything you could use to injure yourself and get another person with you if you can.',
      'If you think you may seriously hurt yourself or cannot stay safe, contact immediate real-world help now.',
      resourceLine,
    ].join(' ');
  }

  return [
    "I'm glad you told me.",
    'Please stay near another person if you can and move away from anything you could use to hurt yourself.',
    'If you think you may act on these thoughts or cannot stay safe, contact immediate real-world help now.',
    resourceLine,
  ].join(' ');
}
