'use client';

/**
 * S3 · P1 · step 7 — THE HUMAN MOMENT.
 *
 *   ⭐⭐ All of that backend law has to become almost invisible here: MAIA asks
 *       before she reads, and the writer says yes or no without leaving the Work.
 *
 * ⛔ NOT A DESTINATION. This renders inside the conversation the writer already
 * opened. No route, no navigation, no second screen, no iframe. The Work's
 * measured geometry is untouched — nothing here participates in it.
 *
 * ⛔ IT DECIDES NOTHING. Every word comes from `viewFor`, every section name from
 * the server's own recognition metadata, and the act lifecycle belongs to the
 * machine. This component reads and calls back.
 *
 * ⛔ NO CATCH-ALL. There is no "Something went wrong / Try again": the states
 * mean different things, and a shared consolation would erase the distinctions
 * this lane spent its whole length establishing.
 */

import { PRESS } from '../pressTheme';
import { viewFor, type BodyProtocolOutcome } from '@/lib/writersStudio/bodyAuthorization';

export interface BodyAuthorizationPanelProps {
  outcome: BodyProtocolOutcome;
  /** ⭐ Sections the member is currently authorizing. Server identities. */
  selectedSectionIds: readonly string[];
  /** True while this act is in flight. ⛔ A press here is the SAME act. */
  busy: boolean;
  onToggleSection: (sectionId: string) => void;
  /** ⭐ THE PHYSICAL PRESS. The machine mints one act identity from it. */
  onAuthorize: () => void;
  onDecline: () => void;
}

/** The offer's words, per act. ⛔ "Try again" is never used for two things. */
const ACT_LABEL: Record<string, string> = {
  authorize: 'Allow MAIA to read',
  authorize_remaining: 'Allow the rest',
  reauthorize: 'Authorize again',
  retry_same: 'Try that again',
};

export default function BodyAuthorizationPanel({
  outcome, selectedSectionIds, busy, onToggleSection, onAuthorize, onDecline,
}: BodyAuthorizationPanelProps) {
  const view = viewFor(outcome);
  if (view.kind === 'BODY_AUTHORIZED') return null;

  const choosable = view.kind === 'BODY_AUTHORITY_REQUIRED'
    || view.kind === 'BODY_SCOPE_INCOMPLETE';

  return (
    <div
      data-body-authorization={view.kind}
      className="mt-3 border rounded-sm p-3"
      style={{ borderColor: PRESS.ruleSoft }}
    >
      <p className="text-[10.5px] tracking-[0.15em] uppercase opacity-45">
        {/* ⭐ SECTION, never passage — section is what the writer authorizes. */}
        permission to read
      </p>

      <p className="text-[13.5px] leading-relaxed opacity-85 mt-1">{view.message}</p>

      {/* ⭐ EVERY REQUIRED SECTION, VISIBLE BEFORE THE ACT. All-or-none is the
          answer contract, and nobody can decide about a set they were not shown. */}
      {choosable && view.sections.length > 0 && (
        <ul className="mt-2 space-y-1">
          {view.sections.map((s) => (
            <li key={s.sectionId}>
              <label className="flex items-center gap-2 text-[12.5px] opacity-80">
                <input
                  type="checkbox"
                  checked={selectedSectionIds.includes(s.sectionId)}
                  disabled={busy}
                  onChange={() => onToggleSection(s.sectionId)}
                />
                {/* ⛔ The server's label, never D9's heading and never a UUID. */}
                <span>{s.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {view.act && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            /* ⭐ ONE PRESS, ONE ACT. Disabled while in flight, so a double-click
               cannot even reach the machine — which refuses it a second time
               anyway. Two guards, because this one is only a UI convenience. */
            disabled={busy || (choosable && selectedSectionIds.length === 0)}
            onClick={onAuthorize}
            className="text-[12px] px-3 py-1 border rounded-sm disabled:opacity-40"
            style={{ borderColor: PRESS.ruleSoft }}
          >
            {busy ? 'Asking…' : ACT_LABEL[view.act] ?? 'Continue'}
          </button>

          {choosable && (
            <button
              type="button"
              disabled={busy}
              onClick={onDecline}
              className="text-[12px] opacity-55 hover:opacity-80 disabled:opacity-30"
            >
              {/* ⭐ Declining is a real act, and it reaches no server. */}
              Not this time
            </button>
          )}
        </div>
      )}
    </div>
  );
}
