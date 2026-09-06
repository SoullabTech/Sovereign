/**
 * DEVELOP PREPARATION — the client's two calls, and the sentences the room
 * says instead of "it needs a draft with sections."
 *
 * WHY THE COPY LIVES HERE. The refusal the room used to show collapsed three
 * different states into one sentence, and that sentence contradicted what the
 * writer could see one mode away: an outline of 185 sections in WRITE beside
 * "this work needs a draft with sections" in DEVELOP. A member reading that
 * has been told something false about their own book. Keeping the mapping
 * pure means the correspondence between state and sentence is a unit test
 * rather than a hope about a component tree.
 *
 * WHAT THESE SENTENCES MAY NOT DO. Promise a reading, describe the member's
 * prose, or imply the system knows where a boundary went when it does not.
 */

import { apiFetch } from '@/lib/http/apiBase';
import type { DevelopPreparation, Divergence } from '@/lib/manuscript/development/preparation';

export type { DevelopPreparation };

export type PreparationOutcome =
  | { ok: true; state: DevelopPreparation }
  | { ok: false; refusal: 'unauthorized' | 'unreachable' | string };

export async function fetchPreparation(manuscriptId: string): Promise<PreparationOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/develop/preparation`, { method: 'GET' });
    if (res.status === 401) return { ok: false, refusal: 'unauthorized' };
    if (!res.ok) return { ok: false, refusal: `http_${res.status}` };
    const state = (await res.json()) as DevelopPreparation;
    if (!state?.kind) return { ok: false, refusal: 'malformed' };
    return { ok: true, state };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export type ConvertOutcome =
  | { ok: true; sectionCount: number }
  | { ok: false; refusal: string; detail?: string };

/**
 * The member's confirmation. `disclosure` names the state they were shown; the
 * server re-derives it under the row lock and refuses if the draft has moved.
 */
export async function confirmPreparation(
  manuscriptId: string,
  disclosure: string,
): Promise<ConvertOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/develop/preparation`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirm: 'convert', disclosure }),
      });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) return { ok: false, refusal: 'unauthorized' };
    if (!res.ok) {
      return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`), detail: body?.detail };
    }
    return { ok: true, sectionCount: Number(body?.sectionCount ?? 0) };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

/* ── what the room says ──────────────────────────────────────────────────── */

export interface PreparationCopy {
  title: string;
  /** Paragraphs, in order. */
  body: string[];
  /** The label of the act, when there is one to offer. */
  action: string | null;
  /** Which act the gesture performs, for the room to dispatch on. */
  act: 'begin_draft' | 'convert' | null;
}

/** The sentence a state owes the writer. PURE. */
export function preparationCopy(state: DevelopPreparation): PreparationCopy | null {
  switch (state.kind) {
    /* Nothing to say. The room shows its ordinary invitation to ask. */
    case 'ready':
      return null;

    case 'no_source':
      return {
        title: 'There is nothing here to read yet',
        body: ['This Work has no sections. Add your manuscript in Write, then come back.'],
        action: null,
        act: null,
      };

    case 'no_draft':
      return {
        title: 'Prepare this Work for Develop',
        body: [
          `Your source holds ${state.sourceSections} section${state.sourceSections === 1 ? '' : 's'}, but this Work has no working draft yet — a draft begins the first time you write.`,
          'Preparing it initializes the working draft from your source, exactly as opening Write would. Your words are copied verbatim; nothing is rewritten.',
        ],
        action: 'Prepare this Work for Develop',
        act: 'begin_draft',
      };

    case 'convertible':
      return {
        title: 'Prepare this draft for Develop',
        body: state.diverged
          ? [
              `This Work was created before section-based development existed, so its draft was never divided into sections. Your source holds ${state.sourceSections} of them.`,
              /* THE DISCLOSURE. Named as change, counted, and attributed to
                 the member — never described as damage or drift. */
              `Your draft has changed since it was imported: ${describeChange(state.divergence)}. Soullab will not guess where your sections now begin, so each boundary has been located in the text you actually wrote — all ${state.divergence.resolved} of ${state.divergence.boundaries}.`,
              'Preparing divides your current draft at those boundaries. Not one character moves, and your versions stay where they are. Confirm to continue.',
            ]
          : [
              `This Work was created before section-based development existed, so its draft was never divided into sections. Your source holds ${state.sourceSections} of them, and your draft still matches it exactly.`,
              'Preparing divides your draft at those boundaries. Not one character moves, and your versions stay where they are.',
            ],
        action: 'Prepare this draft for Develop',
        act: 'convert',
      };

    case 'unresolvable':
      return {
        title: 'This draft cannot be prepared automatically',
        body: [
          'This Work was created before section-based development existed, and its draft has changed too much for Soullab to say where its sections now begin.',
          /* ⛔ NO OFFER. There is nothing here a member could confirm: the
             system does not know where the boundaries went, and asking them
             to approve a partition it cannot locate would be asking them to
             ratify a guess. */
          `${state.divergence.resolved} of ${state.divergence.boundaries} boundaries could be located. Soullab will not place the rest by guessing, so nothing has been changed.`,
          'Your work is safe and unaffected. Write is unchanged.',
        ],
        action: null,
        act: null,
      };

    case 'indeterminate':
      return {
        title: 'This draft could not be read',
        body: ['Soullab could not establish how this draft is divided, so it has done nothing. Your work is unaffected.'],
        action: null,
        act: null,
      };
  }
}

/** The change, in counts. Never a quotation. */
function describeChange(d: Divergence): string {
  const parts: string[] = [];
  if (d.bodyLinesChanged > 0) {
    parts.push(`${d.bodyLinesChanged} line${d.bodyLinesChanged === 1 ? '' : 's'} of text differ from the import`);
  }
  if (d.headingsChanged > 0) {
    parts.push(`${d.headingsChanged} heading${d.headingsChanged === 1 ? '' : 's'} differ`);
  }
  return parts.length > 0 ? parts.join(', and ') : 'it differs from the import';
}
