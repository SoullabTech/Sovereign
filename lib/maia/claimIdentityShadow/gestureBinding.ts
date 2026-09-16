import type { ClaimUnit, GestureBinding, GestureKind } from './types';

export function classifyGesture(text: string): GestureKind {
  const t = text.trim().toLowerCase();
  if (/\b(?:that is|that's) exactly it\b|^exactly[.!]*$|^yes[,! ]+exactly\b/.test(t)) return 'CONFIRM';
  if (/^(?:no|nope)\b|\bthat's not (?:it|what i mean|right)\b|\bthat is not (?:it|what i mean|right)\b/.test(t)) return 'CORRECT';
  if (/\bi already told you\b/.test(t)) return 'RESTART_PROTEST';
  if (/\bkeep starting\b|\bstarting this conversation over\b/.test(t)) return 'META_PATTERN';
  if (/\bwhat was that (?:phrase|word|image)\b|\bwhat did i (?:say|mention) earlier\b/.test(t)) return 'OPAQUE_REFERENCE';
  return 'OTHER';
}

function atomic(units: readonly ClaimUnit[]): ClaimUnit[] {
  return units.filter((u) => u.segmentationStatus === 'atomic');
}

function quotedPhrases(text: string): string[] {
  const out: string[] = [];
  for (const match of text.matchAll(/["“]([^"”]{2,})["”]/g)) out.push(match[1]!.trim());
  return out;
}


function quotationConfirmationFrame(units: readonly ClaimUnit[]): ClaimUnit | null {
  const quotes = units.filter((u) => u.kind === 'quotation' && u.segmentationStatus === 'atomic');
  if (quotes.length !== 1) return null;
  const quote = quotes[0]!;
  const confirmingQuestions = units.filter((u) =>
    u.kind === 'question'
    && u.startChar > quote.endChar
    && /^(?:does that sound|is that (?:the one|what|right)|did i get that right|is this the one)/i.test(u.text.trim()),
  );
  return confirmingQuestions.length === 1 ? quote : null;
}

function result(
  gesture: GestureKind,
  outcome: GestureBinding['outcome'],
  reason: string,
  candidates: readonly ClaimUnit[],
  target?: ClaimUnit,
): GestureBinding {
  return {
    gesture,
    outcome,
    reason,
    candidateClaimIds: candidates.map((c) => c.claimId),
    ...(target ? { targetClaimId: target.claimId } : {}),
  };
}
export function bindGesture(
  memberText: string,
  priorTurnUnits: readonly ClaimUnit[],
): GestureBinding {
  const gesture = classifyGesture(memberText);
  const atoms = atomic(priorTurnUnits);

  const quotes = quotedPhrases(memberText);
  if (quotes.length > 0) {
    const matches = atoms.filter((u) => quotes.some((q) => u.text.includes(q)));
    if (matches.length === 1) return result(gesture, 'BOUND', 'explicit-quoted-selector', matches, matches[0]);
    if (matches.length > 1) return result(gesture, 'AMBIGUOUS', 'quoted-selector-matches-multiple-claims', matches);
  }

  if (gesture === 'CONFIRM') {
    const framedQuote = quotationConfirmationFrame(priorTurnUnits);
    if (framedQuote) return result(gesture, 'BOUND', 'quotation-confirmation-frame', [framedQuote], framedQuote);

    const relevant = priorTurnUnits.filter((u) => u.kind === 'assertion' || u.kind === 'quotation');
    if (relevant.length === 0) return result(gesture, 'NO_TARGET', 'no-confirmable-claim', []);
    if (relevant.length > 1) return result(gesture, 'AMBIGUOUS', 'multiple-confirmable-claims', relevant);
    const only = relevant[0]!;
    if (only.segmentationStatus !== 'atomic') return result(gesture, 'AMBIGUOUS', 'non-atomic-confirmable-claim', relevant);
    return result(gesture, 'BOUND', 'single-confirmable-atomic-claim', relevant, only);
  }

  if (gesture === 'CORRECT') {
    const relevant = priorTurnUnits.filter((u) => u.kind === 'assertion' || u.kind === 'quotation');
    if (relevant.length === 0) return result(gesture, 'NO_TARGET', 'no-correctable-claim', []);
    if (relevant.length > 1) return result(gesture, 'AMBIGUOUS', 'multiple-correctable-claims', relevant);
    const only = relevant[0]!;
    if (only.segmentationStatus !== 'atomic') return result(gesture, 'AMBIGUOUS', 'non-atomic-correctable-claim', relevant);
    return result(gesture, 'BOUND', 'single-correctable-atomic-claim', relevant, only);
  }
  if (gesture === 'RESTART_PROTEST') {
    const candidates = atoms.filter((u) => u.kind === 'question');
    if (candidates.length === 1) return result(gesture, 'BOUND', 'single-question-act', candidates, candidates[0]);
    if (candidates.length > 1) return result(gesture, 'AMBIGUOUS', 'multiple-question-acts', candidates);
    return result(gesture, 'NO_TARGET', 'no-question-act', candidates);
  }

  if (gesture === 'META_PATTERN') {
    return result(gesture, 'NO_TARGET', 'meta-pattern-not-single-claim', []);
  }

  if (gesture === 'OPAQUE_REFERENCE') {
    const candidates = atoms.filter((u) => u.kind !== 'directive');
    if (candidates.length === 0) return result(gesture, 'NO_TARGET', 'no-addressable-claim', candidates);
    return result(gesture, 'AMBIGUOUS', 'opaque-reference-needs-referent-evidence', candidates);
  }

  return result(gesture, 'NO_TARGET', 'gesture-not-standing-bearing', []);
}
