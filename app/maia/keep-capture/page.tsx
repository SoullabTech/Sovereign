/**
 * /maia/keep-capture
 *
 * The Keep/Capture Portfolio — Phase 1 member-facing surface.
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 * Spec:
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
 *
 * Design discipline (Freemason):
 *   Practice first. Explanation later.
 *   The architecture works through use, not through being explained.
 *   No mention of "Spiral Memory Hierarchy", "registers", "lenses",
 *   "elemental classification", or any internal taxonomy.
 *
 *   The member sees:
 *     - their own material first
 *     - "Keep this for me" as the primary affordance
 *     - already-kept items with simple actions (still alive / set aside / etc.)
 *     - "Look at this another way" as an optional doorway into lens-passes
 *
 *   The member does NOT see:
 *     - dashboard metrics
 *     - system-generated insights
 *     - inferred patterns
 *     - personality classifications
 *     - any system lecture about how memory works
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { ReturnToMaia } from '@/components/navigation/ReturnToMaia';
import { ELEMENTAL_LENS_PROMPTS } from '@/lib/psyche/types';
import type {
  AtomGesture,
  CrystallizedMemory,
  ElementalLens,
  PortfolioSourceCandidate,
} from '@/lib/psyche/types';

// ════════════════════════════════════════════════════════════════════════════
// API helpers — use apiFetch so iOS Capacitor gets x-member-id header injection
// ════════════════════════════════════════════════════════════════════════════

async function apiGet<T>(url: string): Promise<T> {
  const r = await apiFetch(url);
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`GET ${url} failed: ${r.status} ${text}`);
  }
  return r.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const r = await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`POST ${url} failed: ${r.status} ${text}`);
  }
  return r.json();
}

async function apiDelete<T>(url: string): Promise<T> {
  const r = await apiFetch(url, { method: 'DELETE' });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`DELETE ${url} failed: ${r.status} ${text}`);
  }
  return r.json();
}

// ════════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════════

export default function KeepCapturePage() {
  const [kept, setKept] = useState<CrystallizedMemory[]>([]);
  const [candidates, setCandidates] = useState<PortfolioSourceCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLensAtom, setActiveLensAtom] = useState<CrystallizedMemory | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [keptResp, ideaResp, blockResp] = await Promise.all([
        apiGet<{ atoms: CrystallizedMemory[] }>('/api/psyche/portfolio/atoms?view=chronological'),
        apiGet<{ candidates: PortfolioSourceCandidate[] }>('/api/psyche/portfolio/source-candidates?sourceType=idea'),
        apiGet<{ candidates: PortfolioSourceCandidate[] }>('/api/psyche/portfolio/source-candidates?sourceType=idea_block'),
      ]);
      setKept(keptResp.atoms.filter((a) => a.status !== 'archived'));
      setCandidates(
        [...ideaResp.candidates, ...blockResp.candidates].filter((c) => !c.alreadyKept),
      );
    } catch (err) {
      console.error('[keep-capture] load failed', err);
      setError('Could not load right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function keepCandidate(c: PortfolioSourceCandidate) {
    try {
      await apiPost('/api/psyche/portfolio/keep', {
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        title: c.title,
      });
      await reload();
    } catch (err) {
      console.error('[keep-capture] keep failed', err);
    }
  }

  async function applyGesture(atomId: string, gesture: AtomGesture) {
    try {
      await apiPost(`/api/psyche/portfolio/atoms/${atomId}/gesture`, { gesture });
      await reload();
    } catch (err) {
      console.error('[keep-capture] gesture failed', err);
    }
  }

  // Decline a practitioner observation ("This isn't true for me"). Records the
  // member's verdict — the loader then releases the atom from ambient recall.
  // Reversible: withdrawDecline restores it. Only ever applied to
  // source_type === 'practitioner_observation' atoms (see the observations section).
  async function declineObservation(atomId: string) {
    try {
      await apiPost(`/api/sovereign/atoms/${atomId}/decline`, {});
      await reload();
    } catch (err) {
      console.error('[keep-capture] decline failed', err);
    }
  }

  async function withdrawDecline(atomId: string) {
    try {
      await apiDelete(`/api/sovereign/atoms/${atomId}/decline`);
      await reload();
    } catch (err) {
      console.error('[keep-capture] withdraw decline failed', err);
    }
  }

  // Observations shared ABOUT the member by a practitioner are held on a
  // distinct axis from the member's own kept material: they carry a decline
  // verdict (member_response_status), not curation gestures. Split them out so
  // each surface shows only the affordances that apply.
  const observations = kept.filter((a) => a.sourceType === 'practitioner_observation');
  const memberAtoms = kept.filter((a) => a.sourceType !== 'practitioner_observation');

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* The way out. The House opens Keeps with
            `returnBehavior: 'back-to-maia'`; nothing in this page's component
            closure honoured that until now, so a member who entered was
            stranded here. */}
        <ReturnToMaia className="text-stone-400 hover:text-stone-600 text-sm mb-6" />

        <header className="mb-12">
          <h1 className="text-2xl font-light text-stone-800">
            Here is what you&apos;ve brought.
          </h1>
          <p className="text-stone-500 mt-2">
            What do you want MAIA to keep?
          </p>
        </header>

        {loading && (
          <p className="text-stone-400 text-sm">…</p>
        )}

        {error && !loading && (
          <p className="text-stone-500 text-sm">{error}</p>
        )}

        {!loading && !error && (
          <>
            {memberAtoms.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-4">
                  Kept
                </h2>
                <ul className="space-y-3">
                  {memberAtoms.map((atom) => (
                    <KeptItem
                      key={atom.id}
                      atom={atom}
                      onGesture={(g) => applyGesture(atom.id, g)}
                      onLook={() => setActiveLensAtom(atom)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {observations.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-4">
                  Shared with you
                </h2>
                <ul className="space-y-3">
                  {observations.map((atom) => (
                    <PractitionerObservationItem
                      key={atom.id}
                      atom={atom}
                      onDecline={() => declineObservation(atom.id)}
                      onWithdrawDecline={() => withdrawDecline(atom.id)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {candidates.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-4">
                  From your work
                </h2>
                <ul className="space-y-3">
                  {candidates.map((c) => (
                    <CandidateItem
                      key={`${c.sourceType}-${c.sourceId}`}
                      candidate={c}
                      onKeep={() => keepCandidate(c)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {kept.length === 0 && candidates.length === 0 && (
              <p className="text-stone-500">
                When you develop ideas, the ones you choose to shape and refine
                can appear here for you to keep.
              </p>
            )}
          </>
        )}
      </div>

      {activeLensAtom && (
        <LensDialog
          atom={activeLensAtom}
          onClose={() => setActiveLensAtom(null)}
          onSaved={async () => {
            setActiveLensAtom(null);
            await reload();
          }}
        />
      )}
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Kept item
// ════════════════════════════════════════════════════════════════════════════

function KeptItem({
  atom,
  onGesture,
  onLook,
}: {
  atom: CrystallizedMemory;
  onGesture: (g: AtomGesture) => void;
  onLook: () => void;
}) {
  const isStillAlive = atom.status === 'still_alive';
  const isSetAside = atom.status === 'set_aside';
  const isProtected = atom.status === 'protected';

  // Witness-as-gesture feedback. Brief morph after "Still here" tap.
  // Resets after 800ms — long enough to register, short enough not to linger.
  const [justWitnessed, setJustWitnessed] = useState(false);

  return (
    <li className="bg-white rounded-lg p-5 border border-stone-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-stone-800 font-medium leading-snug">{atom.title}</h3>
        {isStillAlive && (
          <span className="text-xs text-amber-600 mt-1 whitespace-nowrap">still alive</span>
        )}
        {isSetAside && (
          <span className="text-xs text-stone-400 mt-1 whitespace-nowrap">set aside</span>
        )}
        {isProtected && (
          <span className="text-xs text-stone-500 mt-1 whitespace-nowrap">protected</span>
        )}
      </div>

      {atom.body && (
        <p className="text-stone-600 text-sm mt-2 whitespace-pre-wrap">{atom.body}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {/* Witness affordance — equal weight to "Look at this another way" */}
        <button
          onClick={() => {
            setJustWitnessed(true);
            onGesture({ kind: 'touch' });
            setTimeout(() => setJustWitnessed(false), 800);
          }}
          className="text-stone-700 hover:text-stone-900"
        >
          {justWitnessed ? '✓ Held' : 'Still here'}
        </button>

        <button onClick={onLook} className="text-stone-700 hover:text-stone-900">
          Look at this another way
        </button>

        {!isStillAlive && (
          <button
            onClick={() => onGesture({ kind: 'mark_still_alive' })}
            className="text-stone-500 hover:text-stone-800"
          >
            Still alive
          </button>
        )}

        {!isSetAside && (
          <button
            onClick={() => onGesture({ kind: 'set_aside' })}
            className="text-stone-500 hover:text-stone-800"
          >
            Set aside
          </button>
        )}

        {(isSetAside) && (
          <button
            onClick={() => onGesture({ kind: 'return_to_active' })}
            className="text-stone-500 hover:text-stone-800"
          >
            Return to this
          </button>
        )}

        {!isProtected && (
          <button
            onClick={() => onGesture({ kind: 'protect' })}
            className="text-stone-500 hover:text-stone-800"
          >
            Protect
          </button>
        )}

        <button
          onClick={() => onGesture({ kind: 'archive' })}
          className="text-stone-400 hover:text-stone-700 ml-auto"
        >
          Archive
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3 text-xs">
        <span className="text-stone-400">
          {atom.returnPreference === 'member_pulled' ? 'Sealed' : 'May return'}
        </span>
        <button
          onClick={() =>
            onGesture({
              kind: 'set_return_preference',
              preference:
                atom.returnPreference === 'member_pulled'
                  ? 'contextual_doorway'
                  : 'member_pulled',
            })
          }
          className="text-stone-500 hover:text-stone-800"
        >
          {atom.returnPreference === 'member_pulled' ? 'Allow return' : 'Reseal'}
        </button>
      </div>
    </li>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Practitioner observation item
//
// An observation a practitioner recorded ABOUT the member. Unlike the member's
// own kept material, this carries no curation gestures — only the member's
// verdict. "This isn't true for me" records a decline (member_response_status =
// 'rejected'), which releases the observation so it stops surfacing in
// conversation. Fully reversible: "Undo" withdraws the decline and it may
// surface again. Sovereignty is reversible — the undo is always visible.
//
// Authority: docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
// ════════════════════════════════════════════════════════════════════════════

function PractitionerObservationItem({
  atom,
  onDecline,
  onWithdrawDecline,
}: {
  atom: CrystallizedMemory;
  onDecline: () => Promise<void> | void;
  onWithdrawDecline: () => Promise<void> | void;
}) {
  const isDeclined = atom.memberResponseStatus === 'rejected';
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void> | void) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="bg-white rounded-lg p-5 border border-stone-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-stone-800 font-medium leading-snug">{atom.title}</h3>
        <span className="text-xs text-stone-400 mt-1 whitespace-nowrap">
          shared with you
        </span>
      </div>

      {atom.body && (
        <p className="text-stone-600 text-sm mt-2 whitespace-pre-wrap">{atom.body}</p>
      )}

      {!isDeclined ? (
        <div className="mt-4 flex items-center gap-4 text-sm">
          <button
            onClick={() => run(onDecline)}
            disabled={busy}
            className="text-stone-500 hover:text-stone-800 disabled:text-stone-300"
          >
            This isn&apos;t true for me
          </button>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3 text-sm">
          <span className="text-stone-500">
            You declined this. It won&apos;t come back up.
          </span>
          <button
            onClick={() => run(onWithdrawDecline)}
            disabled={busy}
            className="text-amber-700 hover:text-amber-900 disabled:text-stone-300"
          >
            Undo
          </button>
        </div>
      )}
    </li>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Candidate item
// ════════════════════════════════════════════════════════════════════════════

function CandidateItem({
  candidate,
  onKeep,
}: {
  candidate: PortfolioSourceCandidate;
  onKeep: () => void;
}) {
  return (
    <li className="bg-white rounded-lg p-5 border border-stone-200">
      <h3 className="text-stone-800 font-medium leading-snug">{candidate.title}</h3>
      {candidate.preview && candidate.preview !== candidate.title && (
        <p className="text-stone-600 text-sm mt-2 line-clamp-3">{candidate.preview}</p>
      )}
      <div className="mt-4">
        <button
          onClick={onKeep}
          className="text-sm text-amber-700 hover:text-amber-900"
        >
          Keep this for me
        </button>
      </div>
    </li>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Lens dialog — entry-as-practice
// ════════════════════════════════════════════════════════════════════════════

function LensDialog({
  atom,
  onClose,
  onSaved,
}: {
  atom: CrystallizedMemory;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [lens, setLens] = useState<ElementalLens | null>(null);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const lenses: ElementalLens[] = ['fire', 'water', 'earth', 'air', 'aether'];

  async function save() {
    if (!lens || response.trim().length === 0) return;
    setSaving(true);
    try {
      await apiPost(`/api/psyche/portfolio/atoms/${atom.id}/lens-passes`, {
        lens,
        prompt: ELEMENTAL_LENS_PROMPTS[lens],
        memberResponse: response.trim(),
      });
      await onSaved();
    } catch (err) {
      console.error('[keep-capture] lens-pass save failed', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-stone-50 rounded-xl max-w-xl w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-stone-700 mb-5 italic">&ldquo;{atom.title}&rdquo;</p>

        {!lens && (
          <>
            <p className="text-stone-600 text-sm mb-4">
              Would you like to look at this through a few different angles?
            </p>
            <div className="grid grid-cols-1 gap-2">
              {lenses.map((l) => (
                <button
                  key={l}
                  onClick={() => setLens(l)}
                  className="text-left p-3 bg-white border border-stone-200 rounded-lg hover:border-stone-400 transition-colors"
                >
                  <span className="text-stone-700 capitalize">{l}:</span>
                  <span className="text-stone-600 ml-2">{ELEMENTAL_LENS_PROMPTS[l]}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button onClick={onClose} className="text-sm text-stone-500 hover:text-stone-700">
                Not now
              </button>
            </div>
          </>
        )}

        {lens && (
          <>
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">{lens}</p>
            <p className="text-stone-700 mb-3">{ELEMENTAL_LENS_PROMPTS[lens]}</p>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="w-full p-3 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-stone-500 resize-none"
              placeholder=""
              autoFocus
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setLens(null);
                  setResponse('');
                }}
                className="text-sm text-stone-500 hover:text-stone-700"
              >
                Try another angle
              </button>
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="text-sm text-stone-500 hover:text-stone-700"
                >
                  Leave it
                </button>
                <button
                  onClick={save}
                  disabled={saving || response.trim().length === 0}
                  className="text-sm text-amber-700 hover:text-amber-900 disabled:text-stone-300"
                >
                  {saving ? 'Saving…' : 'Keep this response'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
