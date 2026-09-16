import type { CaptureLossCause } from './micLiveness';
import type { CaptureSilenceWitness } from './captureForensics';

/**
 * Evidence gate for the one bounded Safari Web-Speech self-heal.
 *
 * A silent recognizer is NOT enough. We repair automatically only when the
 * page-local analyser proves that live voice audio is still reaching the page,
 * the member explicitly owns the floor, and the page is foregrounded. Every
 * other loss remains fail-closed and member-initiated.
 */
export function shouldSelfHealSafariRecognition(input: {
  cause: CaptureLossCause;
  witness: CaptureSilenceWitness;
  isSafari: boolean;
  explicitFloorHeld: boolean;
  pageHidden: boolean;
  recognitionActive: boolean;
  alreadyAttempted: boolean;
}): boolean {
  return (
    input.cause === 'silent_death' &&
    input.witness === 'analyser_hearing_voice' &&
    input.isSafari &&
    input.explicitFloorHeld &&
    !input.pageHidden &&
    input.recognitionActive &&
    !input.alreadyAttempted
  );
}

function normalize(text: string): string {
  return (text || '').trim().replace(/\s+/g, ' ');
}

/**
 * Materialize what the member can already see as their held web turn.
 * Safari may leave the freshest phrase as INTERIM indefinitely; explicit yield
 * and recognizer replacement must not discard that visible member-authored text.
 */
export function materializeHeldWebTurn(finalized: string, outstandingInterim: string): string {
  const finalText = normalize(finalized);
  const interimText = normalize(outstandingInterim);
  if (!interimText) return finalText;
  if (!finalText) return interimText;

  const f = finalText.toLowerCase();
  const i = interimText.toLowerCase();
  // Some engines repeat the full recognized turn as their current interim.
  if (i.startsWith(f)) return interimText;
  // Or the outstanding interim can be merely the suffix of a final already seen.
  if (f.endsWith(i)) return finalText;
  return `${finalText} ${interimText}`;
}
