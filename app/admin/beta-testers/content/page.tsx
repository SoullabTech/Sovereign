'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { betaSession } from '@/lib/auth/betaSession';
import { ROADMAP_STATUS, ELEMENTS, observationOpening, FIELD_ACCENT } from '@/lib/beta-testers/constants';

const ACCENT = FIELD_ACCENT;
const STATUSES = Object.keys(ROADMAP_STATUS);
const COHORT_STATUS = ['invited', 'active', 'paused', 'removed'];

const inputCls =
  'w-full rounded-lg border border-white/10 bg-black/30 p-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none';
const btnPrimary = 'rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-40';
const btnGhost = 'rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5';

type Tab = 'cohort' | 'news' | 'challenges' | 'roadmap' | 'questions' | 'experiments' | 'observations' | 'pulse' | 'learnings';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cohort', label: 'Cohort' },
  { key: 'questions', label: 'Living Questions' },
  { key: 'experiments', label: 'Experiments' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'observations', label: 'Observations' },
  { key: 'pulse', label: 'Field Pulse' },
  { key: 'learnings', label: 'Shared Learnings' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'news', label: 'News' },
];

async function send(path: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await apiFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function BetaTestersAdminPage() {
  const [tab, setTab] = useState<Tab>('cohort');
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setSignedIn(!!betaSession.getUser());
  }, []);

  const onAuth = useCallback((status: number) => {
    if (status === 401 || status === 403) setForbidden(true);
  }, []);

  if (signedIn === false) {
    return (
      <Shell>
        <Banner
          title="Admin sign-in required"
          body={
            <>
              Sign in with an admin account.{' '}
              <Link className="underline" href="/signin?next=/admin/beta-testers/content">
                Sign in
              </Link>
            </>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="rounded-full px-3.5 py-1.5 text-sm transition-colors"
            style={tab === t.key ? { backgroundColor: ACCENT, color: '#0c0c0f' } : { border: '1px solid rgba(255,255,255,0.12)', color: '#a1a1aa' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {forbidden && (
        <Banner
          title="Admin access required"
          body="Your account does not have the admin role. Ask an admin to grant it, or set BETA_ADMIN_MEMBER_IDS."
        />
      )}

      {tab === 'cohort' && <CohortAdmin onAuth={onAuth} />}
      {tab === 'news' && <NewsAdmin onAuth={onAuth} />}
      {tab === 'challenges' && <ChallengesAdmin onAuth={onAuth} />}
      {tab === 'roadmap' && <RoadmapAdmin onAuth={onAuth} />}
      {tab === 'questions' && <QuestionsAdmin onAuth={onAuth} />}
      {tab === 'experiments' && <ExperimentsAdmin onAuth={onAuth} />}
      {tab === 'observations' && <ObservationsAdmin onAuth={onAuth} />}
      {tab === 'pulse' && <PulseAdmin onAuth={onAuth} />}
      {tab === 'learnings' && <LearningsAdmin onAuth={onAuth} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0c0f] text-zinc-300">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <header className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">MAIA Beta · Admin</div>
          <h1 className="mt-1 text-2xl font-light text-zinc-100">The Beta Learning Field — Content</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage cohort access; author the inquiry, experiments, invitations, news, and roadmap; review the observation
            stream; curate shared learnings.
          </p>
          <Link href="/beta-testers" className="mt-3 inline-block text-sm" style={{ color: ACCENT }}>
            View the field →
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

function Banner({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-amber-200/80">{body}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">{children}</div>;
}

function Pill({ text, on }: { text: string; on: boolean }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px]"
      style={on ? { color: '#7C9A6B', backgroundColor: '#7C9A6B1a' } : { color: '#a1a1aa', backgroundColor: 'rgba(255,255,255,0.06)' }}
    >
      {text}
    </span>
  );
}

/* ---------------------------------------------------------------- Cohort */
function CohortAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [who, setWho] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/cohort', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.memberships) ? data.memberships : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!who.trim()) return;
    setBusy(true);
    setErr('');
    const looksUuid = /^[0-9a-f-]{36}$/i.test(who.trim());
    const { status, data } = await send('/api/admin/beta-testers/cohort', 'POST', {
      [looksUuid ? 'memberId' : 'username']: who.trim(),
      status: 'active',
    });
    onAuth(status);
    setBusy(false);
    if (status < 400) {
      setWho('');
      load();
    } else {
      setErr(data?.error || 'Could not add');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">Invite to the field</h3>
        <p className="mb-3 text-xs text-zinc-500">Adds an active membership — this is the invite. Enter a username or member id.</p>
        <div className="flex flex-wrap gap-2">
          <input className={inputCls + ' max-w-xs'} placeholder="username or member id" value={who} onChange={(e) => setWho(e.target.value)} />
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !who.trim()} onClick={add}>
            Add as active
          </button>
        </div>
        {err && <p className="mt-2 text-xs text-amber-300">{err}</p>}
      </Card>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-zinc-600">No memberships yet.</p>}
        {items.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="min-w-0">
              <span className="text-sm text-zinc-100">{m.username || (typeof m.member_id === 'string' ? m.member_id.slice(0, 8) : '?')}</span>
              <span className="ml-2 text-xs text-zinc-600">{m.cohort_name}</span>
            </div>
            <select
              className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-200"
              value={m.status}
              onChange={async (e) => {
                const { status } = await send('/api/admin/beta-testers/cohort', 'PATCH', { id: m.id, status: e.target.value });
                onAuth(status);
                load();
              }}
            >
              {COHORT_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ News */
function NewsAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/news', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.news) ? data.news : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    const { status } = await send('/api/admin/beta-testers/news', 'POST', { title, body, published: publish });
    onAuth(status);
    setBusy(false);
    if (status < 400) {
      setTitle('');
      setBody('');
      setPublish(true);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">New post</h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inputCls} rows={4} placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Publish now
          </label>
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !title.trim() || !body.trim()} onClick={create}>
            Create
          </button>
        </div>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-600">No posts yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-zinc-100">{it.title}</span>
                <Pill text={it.published ? 'published' : 'draft'} on={it.published} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{it.body}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={btnGhost} onClick={async () => { const { status } = await send('/api/admin/beta-testers/news', 'PATCH', { id: it.id, published: !it.published }); onAuth(status); load(); }}>
                {it.published ? 'Unpublish' : 'Publish'}
              </button>
              <button className={btnGhost} onClick={async () => { const { status } = await send(`/api/admin/beta-testers/news?id=${it.id}`, 'DELETE'); onAuth(status); load(); }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Challenges */
function ChallengesAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [element, setElement] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/challenges', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.challenges) ? data.challenges : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!title.trim() || !prompt.trim()) return;
    setBusy(true);
    const { status } = await send('/api/admin/beta-testers/challenges', 'POST', { title, prompt, element: element || null, sortOrder: items.length + 1 });
    onAuth(status);
    setBusy(false);
    if (status < 400) { setTitle(''); setPrompt(''); setElement(''); load(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">New invitation</h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inputCls} rows={3} placeholder="Prompt — an invitation to bring a real question" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <select className={inputCls} value={element} onChange={(e) => setElement(e.target.value)}>
            <option value="">No lens</option>
            {ELEMENTS.map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !title.trim() || !prompt.trim()} onClick={create}>
            Create
          </button>
        </div>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-600">No challenges yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-zinc-100">{it.title}</span>
                {it.element && <span className="text-xs text-zinc-500">{it.element}</span>}
                <Pill text={it.active ? 'active' : 'hidden'} on={it.active} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{it.prompt}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={btnGhost} onClick={async () => { const { status } = await send('/api/admin/beta-testers/challenges', 'PATCH', { id: it.id, active: !it.active }); onAuth(status); load(); }}>
                {it.active ? 'Hide' : 'Show'}
              </button>
              <button className={btnGhost} onClick={async () => { const { status } = await send(`/api/admin/beta-testers/challenges?id=${it.id}`, 'DELETE'); onAuth(status); load(); }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Roadmap */
function RoadmapAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('considering');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { status: s, data } = await send('/api/admin/beta-testers/roadmap', 'GET');
    onAuth(s);
    setItems(Array.isArray(data.items) ? data.items : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const { status: s } = await send('/api/admin/beta-testers/roadmap', 'POST', { title, description, status, sortOrder: items.length + 1 });
    onAuth(s);
    setBusy(false);
    if (s < 400) { setTitle(''); setDescription(''); setStatus('considering'); load(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">New roadmap item</h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inputCls} rows={2} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((st) => (
              <option key={st} value={st}>{ROADMAP_STATUS[st].label} — {ROADMAP_STATUS[st].note}</option>
            ))}
          </select>
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !title.trim()} onClick={create}>
            Create
          </button>
        </div>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-600">No items yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="min-w-0">
              <span className="text-[15px] text-zinc-100">{it.title}</span>
              {it.description && <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{it.description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <select
                className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-200"
                value={it.status}
                onChange={async (e) => { const { status: s } = await send('/api/admin/beta-testers/roadmap', 'PATCH', { id: it.id, status: e.target.value }); onAuth(s); load(); }}
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{ROADMAP_STATUS[st].label}</option>
                ))}
              </select>
              <button className={btnGhost} onClick={async () => { const { status: s } = await send(`/api/admin/beta-testers/roadmap?id=${it.id}`, 'DELETE'); onAuth(s); load(); }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Questions */
function QuestionsAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/questions', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.questions) ? data.questions : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!question.trim()) return;
    setBusy(true);
    const { status } = await send('/api/admin/beta-testers/questions', 'POST', { question, detail, sortOrder: items.length + 1 });
    onAuth(status);
    setBusy(false);
    if (status < 400) { setQuestion(''); setDetail(''); load(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">New question (What We Are Learning)</h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="The question we're holding" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <textarea className={inputCls} rows={2} placeholder="Why this matters (optional)" value={detail} onChange={(e) => setDetail(e.target.value)} />
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !question.trim()} onClick={create}>
            Create
          </button>
        </div>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-600">No questions yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-zinc-100">{it.question}</span>
                <Pill text={it.active ? 'active' : 'hidden'} on={it.active} />
              </div>
              {it.detail && <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{it.detail}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={btnGhost} onClick={async () => { const { status } = await send('/api/admin/beta-testers/questions', 'PATCH', { id: it.id, active: !it.active }); onAuth(status); load(); }}>
                {it.active ? 'Hide' : 'Show'}
              </button>
              <button className={btnGhost} onClick={async () => { const { status } = await send(`/api/admin/beta-testers/questions?id=${it.id}`, 'DELETE'); onAuth(status); load(); }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Experiments */
function ExperimentsAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [protocol, setProtocol] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/experiments', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.experiments) ? data.experiments : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!title.trim() || !protocol.trim()) return;
    setBusy(true);
    const { status } = await send('/api/admin/beta-testers/experiments', 'POST', { code: code || null, title, protocol, sortOrder: items.length + 1 });
    onAuth(status);
    setBusy(false);
    if (status < 400) { setCode(''); setTitle(''); setProtocol(''); load(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">New experiment (investigation)</h3>
        <div className="space-y-3">
          <input className={inputCls + ' max-w-xs'} placeholder="Code, e.g. Experiment 04" value={code} onChange={(e) => setCode(e.target.value)} />
          <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inputCls} rows={3} placeholder="Protocol — what to try, and what to notice" value={protocol} onChange={(e) => setProtocol(e.target.value)} />
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !title.trim() || !protocol.trim()} onClick={create}>
            Create
          </button>
        </div>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-600">No experiments yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {it.code && <span className="text-xs uppercase tracking-wide" style={{ color: ACCENT }}>{it.code}</span>}
                <span className="text-[15px] text-zinc-100">{it.title}</span>
                <Pill text={it.active ? 'active' : 'hidden'} on={it.active} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{it.protocol}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={btnGhost} onClick={async () => { const { status } = await send('/api/admin/beta-testers/experiments', 'PATCH', { id: it.id, active: !it.active }); onAuth(status); load(); }}>
                {it.active ? 'Hide' : 'Show'}
              </button>
              <button className={btnGhost} onClick={async () => { const { status } = await send(`/api/admin/beta-testers/experiments?id=${it.id}`, 'DELETE'); onAuth(status); load(); }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Observations */
function ObservationsAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/observations', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.observations) ? data.observations : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const setVisibility = async (id: string, visibility: string) => {
    const { status } = await send('/api/admin/beta-testers/observations', 'PATCH', { id, visibility });
    onAuth(status);
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        The sealed observation stream — for reading, not for any model or memory pipeline. Private observations are not
        shown here. Approve one to share it (anonymously) in cohort Shared Learnings.
      </p>
      {items.length === 0 && <p className="text-sm text-zinc-600">No observations to review.</p>}
      {items.map((o) => {
        const shared = o.visibility === 'shared_approved';
        return (
          <div key={o.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm" style={{ color: ACCENT }}>{observationOpening(o.prompt_type)}</span>
              <span className="text-xs text-zinc-600">
                {o.elemental_lens ? `${o.elemental_lens} · ` : ''}
                {typeof o.member_id === 'string' ? o.member_id.slice(0, 8) : ''}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-zinc-300">{o.observation_text}</p>
            <div className="mt-3 flex items-center gap-3">
              <Pill text={shared ? 'shared' : 'in review'} on={shared} />
              {shared ? (
                <button className={btnGhost} onClick={() => setVisibility(o.id, 'admin_review')}>Return to review</button>
              ) : (
                <button className={btnGhost} onClick={() => setVisibility(o.id, 'shared_approved')}>Approve for sharing</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- Field Pulse */
function PulseAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [theme, setTheme] = useState('');
  const [questions, setQuestions] = useState('');
  const [note, setNote] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/pulse', 'GET');
    onAuth(status);
    const p = data?.pulse;
    if (p) {
      setTheme(p.sensing_theme || '');
      setQuestions(p.returning_questions || '');
      setNote(p.sensing_note || '');
      setUpdatedAt(p.updated_at || null);
    }
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    setSaved(false);
    const { status } = await send('/api/admin/beta-testers/pulse', 'PUT', {
      sensingTheme: theme,
      returningQuestions: questions,
      sensingNote: note,
    });
    onAuth(status);
    setBusy(false);
    if (status < 400) {
      setSaved(true);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        The measured pulse (counts, most-active lens, who returned) is computed live. This is the human reading shown
        beneath it — name only what you actually sense.
      </p>
      <Card>
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-zinc-600">Strongest emerging theme</label>
            <input className={inputCls + ' mt-1'} placeholder="e.g. Belonging" value={theme} onChange={(e) => setTheme(e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-zinc-600">Questions people are returning to</label>
            <textarea className={inputCls + ' mt-1'} rows={2} placeholder="Purpose, Relationship, Trust" value={questions} onChange={(e) => setQuestions(e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-zinc-600">Reflection (optional)</label>
            <textarea className={inputCls + ' mt-1'} rows={3} placeholder="A sentence or two on what the field feels like right now" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy} onClick={save}>
              Save reading
            </button>
            {saved && <span className="text-sm text-zinc-500">Saved.</span>}
            {updatedAt && <span className="text-xs text-zinc-600">last saved {new Date(updatedAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------- Shared Learnings */
function LearningsAdmin({ onAuth }: { onAuth: (s: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('admin_only');
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { status, data } = await send('/api/admin/beta-testers/learnings', 'GET');
    onAuth(status);
    setItems(Array.isArray(data.learnings) ? data.learnings : []);
  }, [onAuth]);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    const { status } = await send('/api/admin/beta-testers/learnings', 'POST', { title, body, visibility, publish });
    onAuth(status);
    setBusy(false);
    if (status < 400) { setTitle(''); setBody(''); setVisibility('admin_only'); setPublish(false); load(); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-zinc-200">New synthesized learning</h3>
        <p className="mb-3 text-xs text-zinc-500">For patterns you author across observations. (Single approved observations reach the cohort from the Observations tab.)</p>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={inputCls} rows={4} placeholder="What the cohort is noticing, reflected back" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex flex-wrap items-center gap-4">
            <select className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-zinc-200" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="admin_only">admin only</option>
              <option value="cohort">cohort-visible</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Publish
            </label>
          </div>
          <p className="text-xs text-zinc-600">Visible to testers only when cohort-visible AND published.</p>
          <button className={btnPrimary} style={{ backgroundColor: ACCENT, color: '#0c0c0f' }} disabled={busy || !title.trim() || !body.trim()} onClick={create}>
            Create
          </button>
        </div>
      </Card>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-600">Nothing authored yet.</p>}
        {items.map((it) => {
          const live = it.visibility === 'cohort' && !!it.published_at;
          return (
            <div key={it.id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] text-zinc-100">{it.title}</span>
                  <Pill text={live ? 'live to cohort' : it.visibility === 'cohort' ? 'cohort · unpublished' : 'admin only'} on={live} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{it.body}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button className={btnGhost} onClick={async () => { const { status } = await send('/api/admin/beta-testers/learnings', 'PATCH', { id: it.id, visibility: it.visibility === 'cohort' ? 'admin_only' : 'cohort' }); onAuth(status); load(); }}>
                  {it.visibility === 'cohort' ? 'Make admin-only' : 'Make cohort'}
                </button>
                <button className={btnGhost} onClick={async () => { const { status } = await send('/api/admin/beta-testers/learnings', 'PATCH', { id: it.id, publish: !it.published_at }); onAuth(status); load(); }}>
                  {it.published_at ? 'Unpublish' : 'Publish'}
                </button>
                <button className={btnGhost} onClick={async () => { const { status } = await send(`/api/admin/beta-testers/learnings?id=${it.id}`, 'DELETE'); onAuth(status); load(); }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
