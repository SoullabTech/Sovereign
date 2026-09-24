'use client';

/**
 * PC3-S2 — Home / Arrival, composed in the accepted Light Shell family.
 *
 * Home is where a writer recognizes their Work and knows how to begin or
 * return. It is one room: no manuscript rail, no resident MAIA, no dashboard.
 *
 * Truth law carried from the live Home (app/writers-studio/HomeView.tsx):
 *  - a Work is DECLARED by the member; writing no Work has claimed is shown as
 *    writing and is never called a Work;
 *  - "return" is offered only where durable place evidence exists (the Work's
 *    `returnPlace`); nothing here says "continue where you left off";
 *  - dates are fixed points ("written September 22"), never elapsed-time pressure;
 *  - the conditional search searches TITLES, and says so;
 *  - removing a Work and deleting writing are two acts with two consequences.
 *
 * This component renders what it is handed. It fetches nothing, writes
 * nothing, and navigates nowhere: every act is reported through `onAct`.
 */
import { useMemo, useState, type ReactNode } from 'react';
import type { HomeStateId } from './types';
import type { HomeWork, HomeWriting } from './fixtures';

export type HomeRoomData = {
  state: HomeStateId;
  images: Record<string, string>;
  /** The Work with durable return evidence, when there is one. */
  work?: HomeWork;
  otherWorks?: ReadonlyArray<HomeWork>;
  allWorks?: ReadonlyArray<HomeWork>;
  writings?: ReadonlyArray<HomeWriting>;
  keptLine?: { text: string; address: string; reason: string };
  history?: ReadonlyArray<readonly [string, string]>;
  writingSpace: { title: string; line: string; quote: string; by: string; image: string };
  copy: {
    beginWelcome: string; begin: string; importWriting: string; bringSources: string; trust: string;
    returnEyebrow: string; returnWelcome: (t: string) => string; returnPlace: (c: string, t: string) => string;
    returnAction: string; alsoWritten: string; writingHere: string; openWriting: string; makeWork: string;
    addToWork: string; yourWorks: string; yourWriting: string; findByTitle: string; searchScope: string;
    keptEyebrow: string; historyEyebrow: string; writingLabel: string; workLabel: string;
  };
  removeOrDelete: {
    remove: { action: string; hint: string };
    delete: { action: string; hint: string };
  };
  /** Reports an intended act. The review harness answers "fixture — nothing happens". */
  onAct?: (act: string) => void;
};

export function HomeRoom(d: HomeRoomData) {
  switch (d.state) {
    case 'home-begin':
      return <HomeBegin {...d} />;
    case 'home-return':
      return <HomeReturn {...d} />;
    case 'home-unclaimed-writing':
      return <HomeUnclaimed {...d} />;
    case 'home-many-works':
      return <HomeMany {...d} />;
  }
}

// ── pieces ──────────────────────────────────────────────────────────────────
function Icon({ name }: { name: 'plus' | 'import' | 'notes' | 'page' | 'search' | 'arrow' }) {
  const c = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': true } as const;
  switch (name) {
    case 'plus':
      return <svg {...c}><path d="M9 3.5v11M3.5 9h11" /></svg>;
    case 'import':
      return <svg {...c}><path d="M9 2.5v9M5.5 8L9 11.5 12.5 8" /><path d="M3 12.5v2.5h12v-2.5" /></svg>;
    case 'notes':
      return <svg {...c}><path d="M4 2.5h7l3 3v10H4z" /><path d="M6.5 8h5M6.5 10.5h5M6.5 13h3" /></svg>;
    case 'page':
      return <svg {...c} width={22} height={22}><path d="M4 1.5h7l3.5 3.5v11.5H4z" /><path d="M11 1.5V5h3.5M6.5 8.5h5.5M6.5 11h5.5M6.5 13.5h3.5" /></svg>;
    case 'search':
      return <svg {...c}><circle cx="8" cy="8" r="5" /><path d="M12 12l3.5 3.5" /></svg>;
    case 'arrow':
      return <svg {...c} width={14} height={14}><path d="M3 9h11M10 5l4 4-4 4" /></svg>;
  }
}

function Primary({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="fr-home-primary" data-primary-act="" onClick={onClick}>
      {children}
    </button>
  );
}

function Quiet({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="fr-home-quiet" onClick={onClick}>
      {children}
    </button>
  );
}

function WritingSpace({ ws }: { ws: HomeRoomData['writingSpace'] }) {
  return (
    <aside className="fr-home-space" aria-label={ws.title}>
      <h2>{ws.title}</h2>
      <p className="fr-home-space-line">{ws.line}</p>
      <img src={ws.image} alt="" />
      <blockquote>{ws.quote}</blockquote>
      <p className="fr-home-space-by">— {ws.by}</p>
    </aside>
  );
}

function BeginActions({ d, primary }: { d: HomeRoomData; primary: boolean }) {
  const act = (a: string) => () => d.onAct?.(a);
  return (
    <div className="fr-home-actions">
      {primary ? (
        <Primary onClick={act(d.copy.begin)}>
          <Icon name="plus" />
          {d.copy.begin}
        </Primary>
      ) : null}
      <Quiet onClick={act(d.copy.importWriting)}>
        <Icon name="import" />
        {d.copy.importWriting}
      </Quiet>
      <Quiet onClick={act(d.copy.bringSources)}>
        <Icon name="notes" />
        {d.copy.bringSources}
      </Quiet>
    </div>
  );
}

function WorkCard({ w, d, compact }: { w: HomeWork; d: HomeRoomData; compact?: boolean }) {
  return (
    <article className={compact ? 'fr-home-workcard fr-home-workcard-compact' : 'fr-home-workcard'} data-kind="work" aria-label={`${d.copy.workLabel}: ${w.title}`}>
      <img src={d.images[w.image]} alt="" />
      <div>
        <span className="fr-home-chip fr-home-chip-work">{d.copy.workLabel}</span>
        <h3>{w.title}</h3>
        <p className="fr-home-kind">{w.kind}</p>
        <p className="fr-home-facts">
          <span>{w.facts}</span>
          <span className="fr-home-dot" aria-hidden="true">
            {' · '}
          </span>
          <span>{w.written}</span>
        </p>
      </div>
    </article>
  );
}

function WritingItem({ m, d, lead, works }: { m: HomeWriting; d: HomeRoomData; lead?: boolean; works: ReadonlyArray<HomeWork> }) {
  const [choosing, setChoosing] = useState(false);
  const act = (a: string) => () => d.onAct?.(`${a} · ${m.title}`);
  return (
    <article className={lead ? 'fr-home-writing fr-home-writing-lead' : 'fr-home-writing'} data-kind="writing" aria-label={`${d.copy.writingLabel}: ${m.title}`}>
      <span className="fr-home-page" aria-hidden="true">
        <Icon name="page" />
      </span>
      <div className="fr-home-writing-body">
        <span className="fr-home-chip">{d.copy.writingLabel}</span>
        {lead ? <h1 className="fr-home-writing-title">{m.title}</h1> : <h3>{m.title}</h3>}
        <p className="fr-home-facts">
          {m.pages} · {m.written}
        </p>
        <div className="fr-home-actions">
          {lead ? <Primary onClick={act(d.copy.openWriting)}>{d.copy.openWriting}</Primary> : <Quiet onClick={act(d.copy.openWriting)}>{d.copy.openWriting}</Quiet>}
          <Quiet onClick={act(d.copy.makeWork)}>{d.copy.makeWork}</Quiet>
          {works.length > 0 ? (
            <Quiet onClick={() => setChoosing((v) => !v)}>
              {d.copy.addToWork}
            </Quiet>
          ) : null}
        </div>
        {choosing ? (
          <ul className="fr-home-chooser" aria-label={d.copy.addToWork}>
            {works.map((w) => (
              <li key={w.id}>
                <button type="button" onClick={act(`${d.copy.addToWork}: ${w.title}`)}>
                  {w.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function RemoveOrDelete({ d, title }: { d: HomeRoomData; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fr-home-rd">
      <button type="button" className="fr-home-link" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Remove or delete…
      </button>
      {open ? (
        <div className="fr-home-rd-panel" role="group" aria-label={`Remove or delete ${title}`}>
          <div>
            <button type="button" onClick={() => d.onAct?.(`${d.removeOrDelete.remove.action} · ${title}`)}>
              {d.removeOrDelete.remove.action}
            </button>
            <p>{d.removeOrDelete.remove.hint}</p>
          </div>
          <div>
            <button type="button" className="fr-home-danger" onClick={() => d.onAct?.(`${d.removeOrDelete.delete.action} · ${title}`)}>
              {d.removeOrDelete.delete.action}
            </button>
            <p>{d.removeOrDelete.delete.hint}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReturnBlock({ d, w, compact }: { d: HomeRoomData; w: HomeWork; compact?: boolean }) {
  const place = w.returnPlace;
  return (
    <section className={compact ? 'fr-home-return fr-home-return-compact' : 'fr-home-return'} data-landmark="return">
      <p className="fr-home-eyebrow">{d.copy.returnEyebrow}</p>
      <h1 className="fr-home-greeting">{d.copy.returnWelcome(w.title)}</h1>
      {place ? <p className="fr-home-place">{d.copy.returnPlace(place.chapter, place.title)}</p> : null}
      <div className="fr-home-work-hero">
        <img src={d.images[w.image]} alt={`${w.title} — the image this Work carries`} />
        <div>
          <h2>{w.title}</h2>
          <p className="fr-home-kind">{w.kind}</p>
          <p className="fr-home-facts">
            {w.facts} · {w.written}
          </p>
          <div className="fr-home-actions">
            {place ? (
              <Primary onClick={() => d.onAct?.(`${d.copy.returnAction} · ${place.chapter}`)}>
                {d.copy.returnAction}
                <Icon name="arrow" />
              </Primary>
            ) : null}
            <RemoveOrDelete d={d} title={w.title} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── H1 · begin ──────────────────────────────────────────────────────────────
function HomeBegin(d: HomeRoomData) {
  return (
    <div className="fr-home fr-home-begin" data-home-state={d.state}>
      <section className="fr-home-main">
        <h1 className="fr-home-welcome">{d.copy.beginWelcome}</h1>
        <BeginActions d={d} primary />
        <p className="fr-home-trust">{d.copy.trust}</p>
      </section>
      <WritingSpace ws={d.writingSpace} />
    </div>
  );
}

// ── H2 · return ─────────────────────────────────────────────────────────────
function HomeReturn(d: HomeRoomData) {
  const w = d.work!;
  return (
    <div className="fr-home fr-home-returning" data-home-state={d.state}>
      <div className="fr-home-main">
        <ReturnBlock d={d} w={w} />
        {d.keptLine ? (
          <figure className="fr-home-kept">
            <p className="fr-home-eyebrow">{d.copy.keptEyebrow}</p>
            <blockquote>{d.keptLine.text}</blockquote>
            <figcaption>
              {d.keptLine.address} · {d.keptLine.reason}
            </figcaption>
          </figure>
        ) : null}
        {d.otherWorks && d.otherWorks.length > 0 ? (
          <section>
            <p className="fr-home-eyebrow">{d.copy.alsoWritten}</p>
            <div className="fr-home-shelf fr-home-shelf-2">
              {d.otherWorks.map((o) => (
                <WorkCard key={o.id} w={o} d={d} compact />
              ))}
            </div>
          </section>
        ) : null}
        <div className="fr-home-begin-quiet">
          <BeginActions d={d} primary={false} />
          <button type="button" className="fr-home-link" onClick={() => d.onAct?.(d.copy.begin)}>
            <Icon name="plus" />
            {d.copy.begin}
          </button>
        </div>
      </div>
      <div className="fr-home-side">
        <WritingSpace ws={d.writingSpace} />
        {d.history && d.history.length > 0 ? (
          <section className="fr-home-history" aria-label={d.copy.historyEyebrow}>
            <p className="fr-home-eyebrow">{d.copy.historyEyebrow}</p>
            <ol>
              {d.history.map(([date, act]) => (
                <li key={date + act}>
                  <time>{date}</time>
                  <span>{act}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  );
}

// ── H3 · unclaimed writing ──────────────────────────────────────────────────
function HomeUnclaimed(d: HomeRoomData) {
  const [lead, ...rest] = d.writings ?? [];
  const works = d.allWorks ?? [];
  return (
    <div className="fr-home fr-home-unclaimed" data-home-state={d.state}>
      <div className="fr-home-main">
        <p className="fr-home-here">{d.copy.writingHere}</p>
        {lead ? <WritingItem m={lead} d={d} lead works={works} /> : null}
        {rest.length > 0 ? (
          <section>
            <p className="fr-home-eyebrow">{d.copy.yourWriting}</p>
            {rest.map((m) => (
              <WritingItem key={m.id} m={m} d={d} works={works} />
            ))}
          </section>
        ) : null}
        <div className="fr-home-begin-quiet">
          <button type="button" className="fr-home-link" onClick={() => d.onAct?.(d.copy.begin)}>
            <Icon name="plus" />
            {d.copy.begin}
          </button>
        </div>
      </div>
      <div className="fr-home-side">
        {works.length > 0 ? (
          <section>
            <p className="fr-home-eyebrow">{d.copy.yourWorks}</p>
            <div className="fr-home-shelf">
              {works.map((w) => (
                <WorkCard key={w.id} w={w} d={d} compact />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

// ── H4 · many works ─────────────────────────────────────────────────────────
function HomeMany(d: HomeRoomData) {
  const [q, setQ] = useState('');
  const works = d.allWorks ?? [];
  const writings = d.writings ?? [];
  const query = q.trim().toLowerCase();
  // Titles only — the same scope the live Home searches, and the scope it names.
  const matchWorks = useMemo(() => (query ? works.filter((w) => w.title.toLowerCase().includes(query)) : works), [query, works]);
  const matchWritings = useMemo(() => (query ? writings.filter((m) => m.title.toLowerCase().includes(query)) : writings), [query, writings]);
  return (
    <div className="fr-home fr-home-many" data-home-state={d.state}>
      <div className="fr-home-main fr-home-main-wide">
        {d.work ? <ReturnBlock d={d} w={d.work} compact /> : null}
        <div className="fr-home-search" role="search">
          <label>
            <Icon name="search" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setQ('');
              }}
              placeholder={d.copy.findByTitle}
              aria-label={`${d.copy.findByTitle} ${d.copy.searchScope.toLowerCase()}`}
              data-search-scope="title"
            />
          </label>
          <span className="fr-home-scope">{d.copy.searchScope}</span>
          {query ? (
            <span className="fr-home-count" role="status">
              {matchWorks.length + matchWritings.length} {matchWorks.length + matchWritings.length === 1 ? 'title matches' : 'titles match'}
            </span>
          ) : null}
        </div>
        <section>
          <p className="fr-home-eyebrow">{d.copy.yourWorks}</p>
          <div className="fr-home-shelf fr-home-shelf-4">
            {matchWorks.map((w) => (
              <WorkCard key={w.id} w={w} d={d} compact />
            ))}
          </div>
        </section>
        {matchWritings.length > 0 ? (
          <section>
            <p className="fr-home-eyebrow">{d.copy.yourWriting}</p>
            <div className="fr-home-writing-row">
              {matchWritings.map((m) => (
                <WritingItem key={m.id} m={m} d={d} works={works} />
              ))}
            </div>
          </section>
        ) : null}
        <div className="fr-home-begin-quiet">
          <BeginActions d={d} primary={false} />
          <button type="button" className="fr-home-link" onClick={() => d.onAct?.(d.copy.begin)}>
            <Icon name="plus" />
            {d.copy.begin}
          </button>
        </div>
      </div>
    </div>
  );
}
