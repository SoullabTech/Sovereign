'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './dream.module.css';

type DreamRecord = {
  id: string;
  content: string;
  createdAt: string;
  source?: string | null;
  meta?: { place?: string } | null;
};

type RoomState =
  | { name: 'arrival' }
  | { name: 'remember' }
  | { name: 'dream'; dream: DreamRecord };

function MaiaQuiet() {
  return (
    <aside className={styles.maia} aria-label="MAIA presence">
      <div className={styles.maiaHead}>
        <span className={styles.orb} aria-hidden="true" />
        <strong>MAIA</strong>
      </div>
      <div className={styles.maiaBody}>
        <p>Always here when you're ready.</p>
      </div>
    </aside>
  );
}
function Shell({ children, state }: { children: React.ReactNode; state: RoomState['name'] }) {
  return (
    <main className={styles.shell} data-state={state}>
      <div className={styles.fieldAsset} aria-hidden="true" />
      <aside className={styles.leftMembrane}>
        <Link className={styles.brand} href="/house">Soullab</Link>
        <small>THE INNER LIFE<br />LIVES HERE</small>
        <nav>
          <Link href="/house">Home</Link>
          <span>Dream room</span>
          <Link href="/journal">Journal</Link>
          <Link href="/reflections">Reflections</Link>
          <Link href="/library">Library</Link>
          <Link href="/maia">MAIA</Link>
        </nav>
        <blockquote>A calmer,<br />truer you<br />is a kinder world.</blockquote>
      </aside>

      <section className={styles.room}>
        <header className={styles.topline}>
          <span>SOULLAB HOUSE&nbsp;&nbsp;/&nbsp;&nbsp;DREAM ROOM</span>
          <em>Same sky. Deeper you.</em>
        </header>
        <div className={styles.stage}>{children}</div>
      </section>

      <div className={styles.rightMembrane} aria-hidden="true">
        <span className={styles.orb} />
        <strong>MAIA</strong>
        <p>Present when invited.</p>
      </div>
      <footer className={styles.footer}>DREAMS REMIND US THAT A RICHER LIFE LIVES WITHIN.</footer>
    </main>
  );
}

function firstLine(text: string) {
  const line = text.split(/\n+/).map((part) => part.trim()).find(Boolean) || 'A dream';
  return line.length > 62 ? line.slice(0, 59).trimEnd() + '…' : line;
}
export default function DreamRoom({
  initialDreamId,
  from,
}: {
  initialDreamId?: string | null;
  from?: string | null;
}) {
  const [state, setState] = useState<RoomState>({ name: initialDreamId ? 'arrival' : 'arrival' });
  const [recent, setRecent] = useState<DreamRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExact = useCallback(async (id: string) => {
    const response = await apiFetch('/api/dreams/canonical/' + encodeURIComponent(id));
    const json = await response.json().catch(() => null);
    if (!json?.success || !json.dream) throw new Error('Dream not found');
    const dream: DreamRecord = {
      id: json.dream.id,
      content: json.dream.content,
      createdAt: json.dream.createdAt,
      source: json.dream.source ?? null,
      meta: json.dream.meta ?? null,
    };
    setState({ name: 'dream', dream });
    return dream;
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const response = await apiFetch('/api/journal/quick/list?type=dream&limit=24');
      const json = await response.json().catch(() => null);
      const rows = json?.success && Array.isArray(json.entries) ? json.entries : [];
      setRecent(rows.map((row: any) => ({
        id: String(row.id),
        content: String(row.content || ''),
        createdAt: String(row.created_at || ''),
        source: row.source ?? null,
        meta: row.meta ?? null,
      })));
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    if (!initialDreamId) return;
    void loadExact(initialDreamId).catch(() => {
      setError('That dream is not available.');
      setState({ name: 'arrival' });
    });
  }, [initialDreamId, loadExact]);
  const keepDream = useCallback(async (content: string) => {
    const response = await apiFetch('/api/journal/quick/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryType: 'dream',
        content,
        source: 'dream_room',
        meta: null,
      }),
    });
    const json = await response.json().catch(() => null);
    if (!json?.success || !json.entryId) throw new Error('Could not keep dream');
    await loadExact(json.entryId);
    void loadRecent();
  }, [loadExact, loadRecent]);

  if (state.name === 'remember') {
    return (
      <Shell state="remember">
        <Remember
          onCancel={() => setState({ name: 'arrival' })}
          onKeep={keepDream}
        />
      </Shell>
    );
  }

  if (state.name === 'dream') {
    return (
      <Shell state="dream">
        <DreamPage
          dream={state.dream}
          from={from}
          onBack={() => setState({ name: 'arrival' })}
          onAnother={() => setState({ name: 'remember' })}
        />
      </Shell>
    );
  }

  return (
    <Shell state="arrival">
      <Arrival
        recent={recent}
        ready={ready}
        error={error}
        onRecord={() => setState({ name: 'remember' })}
        onOpen={(id) => void loadExact(id).catch(() => setError('That dream is not available.'))}
      />
    </Shell>
  );
}
function Arrival({
  recent,
  ready,
  error,
  onRecord,
  onOpen,
}: {
  recent: DreamRecord[];
  ready: boolean;
  error: string | null;
  onRecord: () => void;
  onOpen: (id: string) => void;
}) {
  const visible = useMemo(() => recent.slice(0, 3), [recent]);

  return (
    <div className={styles.arrival}>
      <p className={styles.kicker}>THE DREAM ROOM</p>
      <h1>A place for what visits you</h1>
      <p className={styles.lead}>What is still with you?</p>
      <p className={styles.sublead}>Bring the dream as you remember it. Nothing here has to resolve before it belongs.</p>

      <div className={styles.primaryCards}>
        <button type="button" onClick={onRecord}>
          <span className={styles.abstractMark}>◌</span>
          <h3>Record a dream</h3>
          <p>Speak or type it as you remember it.</p>
        </button>
        <a href="#recent-dreams">
          <span className={styles.abstractMark}>□</span>
          <h3>Return to a dream</h3>
          <p>Revisit one of your own remembered dreams.</p>
        </a>
        <a href="#recent-dreams">
          <span className={styles.abstractMark}>∿</span>
          <h3>Your recent dreams</h3>
          <p>Recent dream records, without ranking or interpretation.</p>
        </a>
      </div>

      <section className={styles.recent} id="recent-dreams">
        <span>RECENT DREAMS</span>
        {error ? <p role="alert">{error}</p> : null}
        {!ready ? <p>Gathering.</p> : visible.length === 0 ? <p>No dreams kept yet.</p> : (
          <div className={styles.recentGrid}>
            {visible.map((dream) => (
              <button type="button" key={dream.id} onClick={() => onOpen(dream.id)}>
                <small>{new Date(dream.createdAt).toLocaleDateString()}</small>
                <h4>{firstLine(dream.content)}</h4>
                <p>{dream.content.length > 110 ? dream.content.slice(0, 107).trimEnd() + '…' : dream.content}</p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
function Remember({
  onCancel,
  onKeep,
}: {
  onCancel: () => void;
  onKeep: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function keep() {
    if (!content.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onKeep(content.trim());
    } catch {
      setError('The dream could not be kept just now. Your words are still here.');
      setSaving(false);
    }
  }

  return (
    <div className={styles.captureWrap}>
      <section className={styles.capturePaper}>
        <div className={styles.captureTop}><span>RE-MEMBER</span><em>Catch it here, before it fades.</em></div>
        <h1>Tell me your dream.</h1>
        <p>Just as you remember it. Fragments, images, feelings—even if it is unclear.</p>
        <textarea
          className={styles.dreamTextarea}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="I remember…"
          autoFocus
          aria-label="Dream memory"
        />
        <div className={styles.promptGhosts}>
          <span>What happened first?</span>
          <span>What remains?</span>
          <span>Who was there?</span>
          <span>How did it feel?</span>
        </div>
        {error ? <p role="alert">{error}</p> : null}
        <footer>
          <button type="button" className={styles.quietButton} onClick={onCancel}>Leave for now</button>
          <button type="button" onClick={() => void keep()} disabled={!content.trim() || saving}>
            {saving ? 'Keeping…' : 'Keep this dream'}
          </button>
        </footer>
      </section>
      <MaiaQuiet />
    </div>
  );
}
function DreamPage({
  dream,
  from,
  onBack,
  onAnother,
}: {
  dream: DreamRecord;
  from?: string | null;
  onBack: () => void;
  onAnother: () => void;
}) {
  const date = new Date(dream.createdAt);
  const lines = dream.content.split(/\n+/).filter(Boolean);

  return (
    <div className={styles.twoField}>
      <article className={styles.paper}>
        <div className={styles.paperMeta}>
          <span>{date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
          <span>PRIVATE · DREAM</span>
        </div>
        {lines.map((line, index) => <p key={index}>{line}</p>)}
        <div className={styles.paperRule} />
        <p className={styles.paperWhisper}>The dream remains itself.</p>
      </article>

      <aside className={styles.actionRail}>
        <p className={styles.kicker}>DREAM</p>
        <button type="button" disabled title="Dream conversation is opened in the next governed act">
          Explore with MAIA <span>—</span>
        </button>
        <Link
          href={'/maia/anchor?from=house&sourceFacet=dream&sourceRefId=' + encodeURIComponent(dream.id) + '&crossingId=dream-carry-today'}
        >
          Carry this dream into today <span>→</span>
        </Link>
        <Link href={'/journal?entry=' + encodeURIComponent(dream.id)}>
          Open this dream in Journal <span>→</span>
        </Link>
        <button type="button" onClick={onAnother}>Record another dream <span>→</span></button>
        <button type="button" onClick={onBack}>Return to Dream room <span>→</span></button>
        {from === 'journal' ? <blockquote>This is the same dream you wrote in Journal.</blockquote> : null}
      </aside>
    </div>
  );
}
