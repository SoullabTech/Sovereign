// lib/validation/sacredMirrorValidator.ts

export type SacredMirrorValidation = {
  ok: boolean;
  reasons: string[];
  evidence: {
    hasMirror: boolean;
    hasMap: boolean;
    hasMoveOuter: boolean;
    hasMoveInner: boolean;
    hasIntegrate: boolean;
  };
};

const FACET_RE = /\b(Fire|Water|Earth|Air)\s*[0-5]\b/i;

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((re) => re.test(text));
}

export function validateSacredMirror(output: string): SacredMirrorValidation {
  const t = output.trim();
  const reasons: string[] = [];

  // MIRROR: emotional resonance language + reflection tone
  const hasMirror = hasAny(t, [
    /\b(feel|feels|feeling|felt)\b/i,
    /\b(overwhelmed|anxious|tight|heavy|stuck|raw|tender|charged|frayed)\b/i,
    /\b(it makes sense|of course|no wonder)\b/i,
  ]);

  // MAP: mentions spiral/element/phase/facet *or* explicitly says "don't have it yet"
  const hasMap =
    hasAny(t, [/\bspiral\b/i, /\belement\b/i, /\bphase\b/i, FACET_RE]) ||
    hasAny(t, [/\bI don't have\b/i, /\bI don't have\b/i, /\bnot sure yet\b/i, /\bnot in the data\b/i]);

  // MOVE outer: concrete action verbs + real-world domain nouns
  const hasMoveOuter = hasAny(t, [
    /\b(today|tomorrow|this week|next)\b/i,
    /\b(send|schedule|write|ask|tell|apologize|walk|call|email|plan|block)\b/i,
    /\b(conversation|message|meeting|calendar|deadline|partner|boss|team)\b/i,
  ]);

  // MOVE inner: somatic/attention/ritual cue
  const hasMoveInner = hasAny(t, [
    /\b(breathe|breath|exhale|inhale)\b/i,
    /\b(body|somatic|nervous system|ground|settle)\b/i,
    /\b(meditation|practice|ritual|journal|sit|scan)\b/i,
  ]);

  // INTEGRATE: signals + logging/check-in language
  const hasIntegrate = hasAny(t, [
    /\bwatch for\b/i,
    /\bsignals?\b/i,
    /\bnotice\b/i,
    /\blog\b/i,
    /\bcheck-?in\b/i,
    /\btrack\b/i,
  ]);

  if (!hasMirror) reasons.push("Missing MIRROR (felt-sense reflection).");
  if (!hasMap) reasons.push("Missing MAP (spiral/phase/facet or explicit 'don't have it yet').");
  if (!hasMoveOuter) reasons.push("Missing MOVE (outer-world action).");
  if (!hasMoveInner) reasons.push("Missing MOVE (inner practice).");
  if (!hasIntegrate) reasons.push("Missing INTEGRATE (signals + what to log).");

  return {
    ok: reasons.length === 0,
    reasons,
    evidence: { hasMirror, hasMap, hasMoveOuter, hasMoveInner, hasIntegrate },
  };
}

// Backward compatibility export
export const validateSacredMirrorResponse = validateSacredMirror;
