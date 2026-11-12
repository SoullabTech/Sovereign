'use client';
/**
 * The writer says, for this session on this device, whether MAIA holds the work as Ordinary or Sanctuary.
 *
 * EA walk 2026-11-11: when the posture could not be read, Studio surfaces said "Open MAIA here once, then try again", but /maia is now
 * only a signpost and opening MAIA no longer sets it, so the writer had no way forward. This offers the same choice Write already
 * offers (EditorialDancePanel), in place, with the same words.
 *
 * The posture is set ONLY by the writer's click: never defaulted, never inferred, never guessed. It writes the one existing live
 * authority (`maia_settings.sanctuary`) through the shared setter, which preserves every other field.
 */
import { applySessionSanctuary } from '@/lib/settings/sessionSanctuaryInit';

export default function SessionPostureChoice(props: {
  /** called after the writer chooses; `sanctuary` is what they chose */
  onChosen?: (sanctuary: boolean) => void;
  compact?: boolean;
}) {
  const choose = (sanctuary: boolean) => {
    applySessionSanctuary(sanctuary);
    props.onChosen?.(sanctuary);
  };
  const button = { font: 'inherit', fontSize: 13, cursor: 'pointer', color: 'inherit', background: 'none',
    border: '1px solid color-mix(in srgb, currentColor 22%, transparent)', borderRadius: 999, padding: '4px 13px' } as const;
  return (
    <div role="group" aria-label="Choose privacy posture for this session" data-session-posture-choice="true"
      style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, margin: props.compact ? 0 : '6px 0' }}>
      <span><b>How would you like me to hold this session?</b> I won’t guess. Ordinary can be remembered; Sanctuary is never saved.</span>
      <span style={{ display: 'flex', gap: 8 }}>
        <button type="button" data-session-posture="ordinary" onClick={() => choose(false)} style={button}>Ordinary</button>
        <button type="button" data-session-posture="sanctuary" onClick={() => choose(true)} style={button}>Sanctuary</button>
      </span>
    </div>
  );
}
