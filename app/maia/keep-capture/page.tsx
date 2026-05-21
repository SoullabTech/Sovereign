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

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
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
            {kept.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-4">
                  Kept
                </h2>
                <ul className="space-y-3">
                  {kept.map((atom) => (
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
                Nothing yet. When you create or reflect, the things you make will
                appear here, and you can choose what to keep.
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
