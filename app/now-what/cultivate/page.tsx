'use client';

/**
 * Now What? — the Flourishing Field. A landscape, not a chat (founder
 * ruling 2026-08-05: "What you are cultivating should open to a field of
 * contributions, not another gate to chat").
 *
 * Six living areas — flourishing domains used as product structure,
 * pending Larry's validation of them as his authored framework (agreement
 * unsigned, corpus not captured — see
 * CLIENT_FIELD_TALK_ALIGNMENT_2026-08-05.md). Member-facing copy keeps the
 * unattributed posture ("dimensions of a flourishing life") until that
 * validation exists.
 *
 * Per-dimension GATHERING waits on the member's placing gesture (a
 * reflection is placed under a dimension by the member, never
 * auto-categorized).
 *
 * CONTINUITY GESTURES (2026-08-05 build directive: "the field should become
 * a working environment, not an archive"). Each placed thread carries the
 * member's continuity gestures — all member-initiated, all in the member's
 * own words, none inferred:
 *   - Reflect further  → the room, through this dimension's door
 *   - This has changed → the member restates the thread (PATCH restate)
 *   - Carry forward    → a new thread descended from this one (PATCH)
 * And each dimension offers "Add a thought" — a member-authored thread
 * placed directly, no session required. No scores, no assessments, no
 * progress, no activity feed.
 */

import { Suspense, useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PaperRoom, SERIF, INK_FAINT, RULE } from '@/components/now-what/PaperRoom';

interface PlacedThread {
  id: string;
  title: string;
  created_at: string;
  flourishing_dimension: string | null;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

const DOMAINS = [
  { slug: 'relationships', name: 'Relationships', facets: 'connection · belonging · love',
    line: 'People who matter. Conversations that shaped you. Moments of connection.' },
  { slug: 'meaning', name: 'Meaning & purpose', facets: 'what your life is for',
    line: 'What matters now. What you are devoted to. What outlasts you.' },
  { slug: 'presence', name: 'Presence', facets: 'experiencing the life you built',
    line: 'Moments you were fully there. What you savored. What you noticed.' },
  { slug: 'health', name: 'Health & energy', facets: 'movement · sleep · vitality',
    line: 'How you are caring for the foundation beneath everything else.' },
  { slug: 'contribution', name: 'Contribution', facets: 'what you give beyond yourself',
    line: 'Where your gifts serve something larger. Who you are helping become.' },
  { slug: 'time', name: 'Time', facets: 'enough of it for what matters',
    line: 'Do you own your time, or does your schedule own you?' },
];

const INPUT_STYLE: CSSProperties = {
  fontFamily: SERIF,
  fontSize: 15,
  fontWeight: 300,
  width: '100%',
  maxWidth: 460,
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${RULE}`,
  outline: 'none',
  padding: '4px 0',
};

const GESTURE_STYLE: CSSProperties = {
  fontSize: 12,
  color: INK_FAINT,
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
  marginRight: 18,
};

/** One placed thread with its continuity gestures. */
function PlacedThreadRow({
  thread, roomHref, onChanged,
}: {
  thread: PlacedThread;
  dimensionSlug: string;
  roomHref: string;
  onChanged: () => void;
}) {
  const [restating, setRestating] = useState(false);
  const [restated, setRestated] = useState(thread.title);
  const [busy, setBusy] = useState(false);
  const [carried, setCarried] = useState(false);

  const gesture = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await apiFetch('/api/now-what/field-note', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: thread.id, ...payload }),
      });
      if (res.ok) onChanged();
      return res.ok;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 14 }}>
      <p className="nwp-member" style={{ fontSize: 16 }}>{thread.title}</p>
      <p className="nwp-prov">in your words · {dayLabel(thread.created_at)} · placed here by you</p>
      {restating ? (
        <div style={{ marginTop: 6 }}>
          <input
            style={INPUT_STYLE}
            value={restated}
            onChange={(e) => setRestated(e.target.value)}
            aria-label="Restate this in your current words"
            maxLength={400}
            disabled={busy}
          />
          <p style={{ marginTop: 6 }}>
            <button
              style={GESTURE_STYLE}
              disabled={busy || !restated.trim() || restated.trim() === thread.title}
              onClick={async () => {
                const ok = await gesture({ action: 'restate', title: restated.trim() });
                if (ok) setRestating(false);
              }}
            >
              Keep the new words
            </button>
            <button style={GESTURE_STYLE} disabled={busy} onClick={() => { setRestating(false); setRestated(thread.title); }}>
              Leave it as it was
            </button>
          </p>
        </div>
      ) : (
        <p style={{ marginTop: 4 }}>
          <a className="nwp-door" style={{ ...GESTURE_STYLE, textDecoration: 'none' }} href={roomHref}>
            Reflect further &rarr;
          </a>
          <button style={GESTURE_STYLE} disabled={busy} onClick={() => setRestating(true)}>
            This has changed
          </button>
          {carried ? (
            <span style={{ fontSize: 12, color: INK_FAINT }}>carried forward</span>
          ) : (
            <button
              style={GESTURE_STYLE}
              disabled={busy}
              onClick={async () => {
                const ok = await gesture({ action: 'carry_forward' });
                if (ok) setCarried(true);
              }}
            >
              Carry forward
            </button>
          )}
        </p>
      )}
    </div>
  );
}

/** "Add a thought" — a member-authored thread placed directly under a dimension. */
function AddThought({
  dimensionSlug, fieldContext, onAdded,
}: {
  dimensionSlug: string;
  fieldContext: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button style={GESTURE_STYLE} onClick={() => setOpen(true)}>
        Add a thought
      </button>
    );
  }
  return (
    <span style={{ display: 'block', marginTop: 8 }}>
      <input
        style={INPUT_STYLE}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="In your own words"
        aria-label="Add a thought in your own words"
        maxLength={400}
        disabled={busy}
        autoFocus
      />
      <span style={{ display: 'block', marginTop: 6 }}>
        <button
          style={GESTURE_STYLE}
          disabled={busy || !text.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await apiFetch('/api/now-what/field-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  created: [{ title: text.trim() }],
                  dimension: dimensionSlug,
                  fieldContext,
                }),
              });
              if (res.ok) {
                setText('');
                setOpen(false);
                onAdded();
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          Place it here
        </button>
        <button style={GESTURE_STYLE} disabled={busy} onClick={() => { setOpen(false); setText(''); }}>
          Never mind
        </button>
      </span>
    </span>
  );
}

function CultivateInner() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const session = useMemberSession();

  /*
   * The field GATHERS: threads the member PLACED under a dimension (by
   * entering the room through that dimension's door and keeping material,
   * or by placing a thought here directly). Unplaced material never renders
   * here — the placing gesture is the only way in. Non-fatal: a read
   * failure leaves the landscape quiet.
   */
  const [placed, setPlaced] = useState<Record<string, PlacedThread[]>>({});
  const loadThreads = useCallback(async () => {
    if (!fieldContext) return;
    try {
      const res = await apiFetch(`/api/now-what/field-note?fieldContext=${encodeURIComponent(fieldContext)}`);
      if (!res.ok) return;
      const json = await res.json().catch(() => ({}));
      const threads: PlacedThread[] = json?.threads ?? [];
      const byDim: Record<string, PlacedThread[]> = {};
      for (const t of threads) {
        if (t.flourishing_dimension) {
          (byDim[t.flourishing_dimension] ??= []).push(t);
        }
      }
      setPlaced(byDim);
    } catch {
      /* quiet landscape */
    }
  }, [fieldContext]);

  useEffect(() => {
    if (session !== 'in' || !fieldContext) return;
    void loadThreads();
  }, [session, fieldContext, loadThreads]);

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Flourishing Field"
        line="The dimensions of a flourishing life — and the field where your own contributions to them gather."
        fieldContext={fieldContext}
      />
    );
  }

  return (
    <PaperRoom location="Flourishing Field" homeHref={`/now-what${ctx}`}>
      <h1 className="nwp-h1">What you are cultivating</h1>
      <p className="nwp-lede">
        The dimensions of a flourishing life — each a living area for your
        reflections, moments, and contributions. Nothing here measures you;
        the field simply holds what you place in it.
      </p>

      {DOMAINS.map((d) => {
        const roomHref = `/now-what/room${ctx}${ctx ? '&' : '?'}entry=cultivate&dimension=${d.slug}`;
        return (
          <section key={d.slug} className="nwp-sec">
            <p className="nwp-label">
              {d.name}{' '}
              <span style={{ fontSize: 12, color: INK_FAINT, fontFamily: 'inherit', fontWeight: 300 }}>
                {d.facets}
              </span>
            </p>
            <p className="nwp-quiet" style={{ marginTop: 8, fontFamily: SERIF, fontStyle: 'italic' }}>
              {d.line}
            </p>
            {(placed[d.slug] ?? []).slice(0, 6).map((t) => (
              <PlacedThreadRow
                key={t.id}
                thread={t}
                dimensionSlug={d.slug}
                roomHref={roomHref}
                onChanged={loadThreads}
              />
            ))}
            <p style={{ marginTop: 10 }}>
              <a className="nwp-door" style={{ marginRight: 22 }} href={roomHref}>
                Add a reflection &rarr;
              </a>
              {fieldContext ? (
                <AddThought dimensionSlug={d.slug} fieldContext={fieldContext} onAdded={loadThreads} />
              ) : null}
              <a className="nwp-door" href={`/now-what/field${ctx}`}>
                Explore &rarr;
              </a>
            </p>
          </section>
        );
      })}

      <p
        className="nwp-quiet"
        style={{ marginTop: 34, paddingTop: 22, borderTop: `1px dashed ${RULE}`, fontSize: 12.5, color: INK_FAINT }}
      >
        Everything here is placed, restated, or carried forward by you, in
        your words. Nothing is auto-categorized, and nothing here is a score.
      </p>
    </PaperRoom>
  );
}

export default function CultivatePage() {
  return (
    <Suspense fallback={null}>
      <CultivateInner />
    </Suspense>
  );
}
