/**
 * WS2-04B — fetching the resolved write state, and choosing what to mount.
 *
 * The mode gate is FAIL-SAFE. If authority cannot be established, nothing
 * mounts: guessing `continuous` would let the whole-manuscript writer touch a
 * draft that may already be section-authoritative, and one save from it would
 * overwrite every section at once.
 *
 * `no_draft` is NOT a failure. Worktable owns first-draft creation
 * (loadDraft → none → beginDraft), and the write-state GET simply sees that
 * moment earlier. It means "let the continuous engine begin it", never
 * "cannot write".
 */

export interface WriteStateRow {
  id: string;
  position: number;
  heading: string | null;
  chars: number;
}

export interface WriteStateSection {
  id: string;
  position: number;
  heading: string | null;
  body: string;
  editable: boolean;
}

export type WriteState =
  | { mode: 'section_aware'; version: number; rows: WriteStateRow[]; sections: WriteStateSection[] }
  | { mode: 'continuous'; version: number; content: string; notice: { title: string; body: string } }
  | { mode: 'continuous_unprovable'; version: number; content: string; notice: { title: string; body: string } }
  | { mode: 'no_draft' };

/** What the Canvas should mount. */
export type WriteMount =
  /** The quiet opening state. No writing engine yet. */
  | { mount: 'pending' }
  /** The existing continuous Worktable, unchanged. */
  | { mount: 'worktable'; notice?: { title: string; body: string } }
  /** The section-aware session, with resolved data already in hand. */
  | { mount: 'sections'; version: number; rows: WriteStateRow[]; sections: WriteStateSection[] }
  /** Authority unknown. Mount neither engine. */
  | { mount: 'unavailable' };

export function chooseMount(
  phase: 'loading' | 'ready' | 'error',
  state: WriteState | null,
): WriteMount {
  /* Nothing mounts while the answer is unknown. useSectionWriting takes its
     version and first active section from its arguments AT MOUNT and resets
     only on draftKey — so mounting it empty and filling it later would build a
     session against the loading state. The decision has to be a mount
     boundary, not a prop update. */
  if (phase === 'loading') return { mount: 'pending' };

  /* Fail closed. An unknown write mode is not an invitation to use the older,
     wider writer. */
  if (phase === 'error' || !state) return { mount: 'unavailable' };

  switch (state.mode) {
    case 'section_aware':
      return {
        mount: 'sections',
        version: state.version,
        rows: state.rows,
        sections: state.sections,
      };
    case 'continuous':
      return { mount: 'worktable' };
    case 'continuous_unprovable':
      /* Worktable stays available; the outline says why navigation is not. */
      return { mount: 'worktable', notice: state.notice };
    case 'no_draft':
      /* The existing creation path, preserved. */
      return { mount: 'worktable' };
  }
}

/** GET the resolved state. A 404 is `no_draft`, not an error. */
export async function fetchWriteState(
  manuscriptId: string,
  fetcher: (url: string) => Promise<Response>,
): Promise<{ phase: 'ready' | 'error'; state: WriteState | null }> {
  try {
    const res = await fetcher(`/api/sovereign/manuscripts/${manuscriptId}/write-state`);
    if (res.status === 404) return { phase: 'ready', state: { mode: 'no_draft' } };
    if (!res.ok) return { phase: 'error', state: null };
    return { phase: 'ready', state: (await res.json()) as WriteState };
  } catch {
    return { phase: 'error', state: null };
  }
}
