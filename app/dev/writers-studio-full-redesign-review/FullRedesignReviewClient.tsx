'use client';

/**
 * PC3-S1 / PC3-S2 / PC3-S3 founder-review client.
 *
 * ⛔ Fixture only. This client makes no network request, reads no member data,
 * writes nothing, and commissions no cognition. Every word MAIA "says" here is
 * transcribed from the founder's design originals. The founder-review strip
 * sits BELOW the captured 100vh product frame and names that plainly.
 */
import { useState } from 'react';
import { Shell, ChevronDown } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY, STATE_GEOMETRY, WRITE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { HomeRoom } from '@/app/writers-studio/full-redesign/HomeRoom';
import { WriteManuscriptRail, WriteRoom } from '@/app/writers-studio/full-redesign/WriteRoom';
import {
  CHAPTER_6, CHAPTER_LIST, CONTINUITY_ROWS, DEVELOP_TABS, FIXTURE_STATES, IMAGES, MAIA_SUGGESTIONS,
  MANUSCRIPT_MAIA, RAIL_QUOTE, REFERENCES, REVIEW_COVERAGE, REVIEW_CURRENT_CHAPTER, REVIEW_FILTERS,
  REVIEW_FINDINGS, REVIEW_MAIA, REVIEW_PARTS, REVIEW_TABS, REVIEW_TILES, STATE_MODE, STORY_MAP_MOVEMENTS,
  THEMES, WHERE_CHAPTER_LIVES, WORK, type ThemeFixture,
  HISTORY, HOME_COPY, HOME_REFERENCES, HOME_STATES, KEPT_LINE, MANY_WORKS, OTHER_WORKS, REMOVE_OR_DELETE,
  RIVER_WORK, UNCLAIMED_WRITING, WRITING_SPACE, isHomeState,
  WRITE_COPY, WRITE_FIXTURE, WRITE_REFERENCE, WRITE_STATES, isWriteState,
} from '@/app/writers-studio/full-redesign/fixtures';
import { DEFAULT_APPEARANCE, type Appearance, type HomeStateId, type ReviewStateId, type StudioMode } from '@/app/writers-studio/full-redesign/types';

export type FullRedesignReviewClientProps = {
  initialState: ReviewStateId;
  initialAppearance?: Appearance;
};

const MODE_STATE: Record<StudioMode, ReviewStateId> = { home: 'home-return', write: 'write-resting', develop: 'develop-themes', review: 'review-chapter' };

export function FullRedesignReviewClient({ initialState, initialAppearance = DEFAULT_APPEARANCE }: FullRedesignReviewClientProps) {
  const [state, setState] = useState<ReviewStateId>(initialState);
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance);
  const [note, setNote] = useState<string>('');
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [devTab, setDevTab] = useState<string>('Themes');
  const [maiaTab, setMaiaTab] = useState<'passage' | 'larger'>('passage');
  const [reviewFilter, setReviewFilter] = useState<string>('All');
  const [reviewTab, setReviewTab] = useState<string>('Overview');
  // PC3-S3: Full Canvas is a presentation state of the Write room, held here so
  // the Shell recedes with it. `write-full-canvas` only opens the room in it.
  const [canvas, setCanvas] = useState<boolean>(initialState === 'write-full-canvas');

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const home = isHomeState(state);
  const write = isWriteState(state);
  const mode: StudioMode = isHomeState(state) ? 'home' : isWriteState(state) ? 'write' : STATE_MODE[state];
  const act = (a: string) => setNote(`Fixture — \u201C${a}\u201D would act in the live Studio. Nothing happens here.`);

  function selectMode(next: StudioMode) {
    setState(MODE_STATE[next]);
    setCanvas(false);
    setNote('');
  }

  function selectState(next: ReviewStateId) {
    setState(next);
    setCanvas(next === 'write-full-canvas');
    setNote('');
  }

  const body = isHomeState(state)
    ? { work: <HomeState state={state} onAct={act} /> }
    : isWriteState(state)
      ? {
          manuscript: <WriteManuscriptRail fixture={WRITE_FIXTURE} onAct={act} />,
          work: <WriteRoom fixture={WRITE_FIXTURE} copy={WRITE_COPY} canvas={canvas} onCanvasChange={setCanvas} onAct={act} />,
        }
    : state === 'develop-themes'
      ? {
          manuscript: <ManuscriptPassage />,
          work: <DevelopThemes theme={theme} tab={devTab} onTab={setDevTab} onTheme={setThemeId} />,
          maia: <MaiaPassage tab={maiaTab} onTab={setMaiaTab} lead={maiaTab === 'passage' ? theme.maia : LARGER} />,
        }
      : state === 'develop-manuscript'
        ? { manuscript: <ChapterRail />, work: <ManuscriptInContext />, maia: <MaiaStandsOut tab={maiaTab} onTab={setMaiaTab} /> }
        : {
            manuscript: <ReviewRail />,
            work: <ReviewChapter filter={reviewFilter} onFilter={setReviewFilter} tab={reviewTab} onTab={setReviewTab} />,
            maia: <MaiaReview />,
          };

  return (
    <div className="fr-page" data-fixture-state={state}>
      <div className="fr-capture-frame" data-capture-frame="">
        <Shell
          mode={mode}
          appearance={appearance}
          geometry={isHomeState(state) ? HOME_GEOMETRY : isWriteState(state) ? WRITE_GEOMETRY : STATE_GEOMETRY[state]}
          workTitle={state === 'home-begin' ? undefined : WORK.title}
          memberInitial={WORK.memberInitial}
          onSelectMode={selectMode}
          manuscript={'manuscript' in body ? body.manuscript : undefined}
          work={body.work}
          maia={'maia' in body ? body.maia : undefined}
          maiaAbove={state === 'review-chapter' ? <span className="fr-matters">Your story matters. ✦</span> : undefined}
          footer={state === 'review-chapter' ? <span>A deeper you. A more human world.</span> : undefined}
          canvas={write ? canvas : undefined}
        />
      </div>

      <section className="fr-review-strip" data-founder-review-marker="" aria-label="Founder review controls">
        <strong>Founder review · fixture data</strong>
        <span>
          {write ? 'PC3-S3 Write candidate' : home ? 'PC3-S2 Home candidate' : 'PC3-S1 shell candidate'}. Nothing on this page is live: no member
          data, no reading, no MAIA call, no save. Reference:{' '}
          {isWriteState(state) ? (
            <>
              {WRITE_REFERENCE.label} · <code>{WRITE_REFERENCE.sha256.slice(0, 12)}…</code>
            </>
          ) : isHomeState(state) ? (
            <>
              {HOME_REFERENCES.family.label} · <code>{HOME_REFERENCES.family.sha256.slice(0, 12)}…</code> (supporting:{' '}
              {HOME_REFERENCES.supporting.label})
            </>
          ) : (
            <>
              {REFERENCES[state].label} · <code>{REFERENCES[state].sha256.slice(0, 12)}…</code>
            </>
          )}
        </span>
        <label>
          State{' '}
          <select value={state} onChange={(e) => selectState(e.target.value as ReviewStateId)}>
            {[...FIXTURE_STATES, ...HOME_STATES, ...WRITE_STATES].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Appearance{' '}
          <select value={appearance} onChange={(e) => setAppearance(e.target.value as Appearance)}>
            <option value="light">Light (default)</option>
            <option value="night">Night (proof)</option>
          </select>
        </label>
        {note ? <em role="status">{note}</em> : null}
      </section>
    </div>
  );
}

/** PC3-S2 · the four Home fixture states, composed from fixture data only. */
function HomeState({ state, onAct }: { state: HomeStateId; onAct: (act: string) => void }) {
  const common = {
    images: IMAGES as Record<string, string>,
    copy: HOME_COPY,
    removeOrDelete: REMOVE_OR_DELETE,
    writingSpace: { ...WRITING_SPACE, image: IMAGES.railMist },
    onAct,
  };
  switch (state) {
    case 'home-begin':
      return <HomeRoom state={state} {...common} />;
    case 'home-return':
      return <HomeRoom state={state} {...common} work={RIVER_WORK} otherWorks={OTHER_WORKS} keptLine={KEPT_LINE} history={HISTORY} />;
    case 'home-unclaimed-writing':
      return <HomeRoom state={state} {...common} writings={UNCLAIMED_WRITING} allWorks={[RIVER_WORK, ...OTHER_WORKS]} />;
    case 'home-many-works':
      return <HomeRoom state={state} {...common} work={RIVER_WORK} allWorks={[RIVER_WORK, ...MANY_WORKS]} writings={UNCLAIMED_WRITING} />;
  }
}

const LARGER = [
  'Across the manuscript, change and transition gathers strength from Chapter 5 onward.',
  'Belonging begins to surface in Chapter 6 and may carry more weight in Part III.',
];

// ── Shared pieces ───────────────────────────────────────────────────────────
function Icon({ name, gold }: { name: string; gold?: boolean }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, 'aria-hidden': true } as const;
  switch (name) {
    case 'book':
      return <svg {...common}><path d="M3 5.5c3-.8 6-.5 9 1.2 3-1.7 6-2 9-1.2v13c-3-.8-6-.5-9 1.2-3-1.7-6-2-9-1.2z" /><path d="M12 6.7v13.2" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5l5 5" /></svg>;
    case 'spark':
      return <svg {...common} stroke={gold ? 'var(--fr-gold)' : 'currentColor'}><path d="M12 2.5l2 7.5 7.5 2-7.5 2-2 7.5-2-7.5-7.5-2 7.5-2z" strokeLinejoin="round" /></svg>;
    case 'leaf':
      return <svg {...common}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19l8-8" /></svg>;
    case 'people':
      return <svg {...common}><circle cx="8.5" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M3 19c.6-3.4 2.8-5 5.5-5s4.9 1.6 5.5 5M12 19c.6-3.4 2.8-5 4-5s3.4 1.6 4 5" /></svg>;
    case 'wave':
      return <svg {...common}><path d="M3 10c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" /></svg>;
    case 'doc':
      return <svg {...common}><path d="M6 3h8l4 4v14H6z" /><path d="M9 11h6M9 14h6M9 17h4" /></svg>;
    case 'chat':
      return <svg {...common}><path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.4A8 8 0 0 1 4 12z" /></svg>;
    default:
      return null;
  }
}

function Chev() {
  return (
    <svg className="fr-chev" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 4l5 5-5 5" />
    </svg>
  );
}

function Arrow({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {dir === 'right' ? <path d="M2 7h10M8 3l4 4-4 4" /> : <path d="M12 7H2M6 3L2 7l4 4" />}
    </svg>
  );
}

function Orb({ large }: { large?: boolean }) {
  return <div className={large ? 'fr-orb fr-orb-lg' : 'fr-orb'} aria-hidden="true" />;
}

function Compose({ mic }: { mic?: boolean }) {
  const [text, setText] = useState('');
  return (
    <form className="fr-compose" onSubmit={(e) => e.preventDefault()} aria-label="Share your thoughts with MAIA (fixture)">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your thoughts…" aria-label="Share your thoughts" />
      {mic ? (
        <span className="fr-mic" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="6.5" y="2" width="5" height="9" rx="2.5" /><path d="M4 9a5 5 0 0 0 10 0M9 14v2.5" /></svg>
        </span>
      ) : null}
      <button type="submit" className={text.trim() ? 'fr-send fr-send-ready' : 'fr-send'} aria-label="Send (fixture — nothing is sent)" disabled={!text.trim()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 12V2M3 6l4-4 4 4" /></svg>
      </button>
    </form>
  );
}

function MaiaHead({ subtitle, large }: { subtitle?: string; large?: boolean }) {
  return (
    <div className={large ? 'fr-maia-head fr-maia-head-lg' : 'fr-maia-head'}>
      <Orb large={large} />
      <div className="fr-maia-name">
        <h2>MAIA</h2>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      <span className="fr-dots" aria-hidden="true">•••</span>
    </div>
  );
}

function MaiaTabs<T extends string>({ tabs, value, onChange }: { tabs: ReadonlyArray<readonly [T, string]>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="fr-mtabs" role="tablist" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(([id, label]) => (
        <button key={id} type="button" role="tab" aria-selected={id === value} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Suggestions({ items }: { items: ReadonlyArray<{ icon: string; text: string }> }) {
  return (
    <div className="fr-sugg">
      {items.map((s) => (
        <div key={s.text} className="fr-sugg-item">
          <Icon name={s.icon} gold={s.icon === 'spark'} />
          <span>{s.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── State 1 · develop-themes (#10) ──────────────────────────────────────────
function ManuscriptPassage() {
  return (
    <div className="fr-ms">
      <div className="fr-ms-head">
        <h2>
          Manuscript <ChevronDown />
        </h2>
        <span className="fr-ic" aria-hidden="true"><Icon name="search" /></span>
        <span className="fr-ic" aria-hidden="true"><Icon name="doc" /></span>
      </div>
      <div className="fr-ms-body">
        <p className="fr-ch-no">{CHAPTER_6.label}</p>
        <p className="fr-ch-title">{CHAPTER_6.title}</p>
        {CHAPTER_6.paragraphs.slice(0, 4).map((p, i) => (
          <p key={i} className={i === CHAPTER_6.heldIndex ? 'fr-para fr-held' : 'fr-para'}>
            {p}
          </p>
        ))}
      </div>
      <div className="fr-ms-foot">
        <span><Arrow dir="left" /> Go to previous</span>
        <span>Go to next <Arrow /></span>
      </div>
    </div>
  );
}

function Presence({ n }: { n: number }) {
  return (
    <span className="fr-bars" aria-label={`Presence ${n} of 5`}>
      {[6, 9, 12, 15, 18].map((h, i) => (
        <i key={h} className={i < n ? 'fr-on' : ''} style={{ height: h }} />
      ))}
    </span>
  );
}

function ThemeChart({ t }: { t: ThemeFixture }) {
  const W = 440, H = 142, L = 100, R = 16, T = 10, B = 26, n = t.points.length;
  const x = (i: number) => L + (i * (W - L - R)) / (n - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v / 5);
  const d = t.points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg className="fr-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.name} across chapters 1 to 8 (fixture)`}>
      <text x="0" y={T + 10} className="fr-chart-t">Stronger presence</text>
      <text x="0" y={H - B - 2} className="fr-chart-t">Weaker presence</text>
      <line x1={L - 6} x2={L - 6} y1={T} y2={H - B} className="fr-chart-axis" />
      <line x1={L - 6} x2={W - R} y1={H - B} y2={H - B} className="fr-chart-axis" />
      <path d={d} className="fr-chart-line" />
      {t.points.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.6" className="fr-chart-dot" />
      ))}
      {t.points.map((_, i) => (
        <text key={`c${i}`} x={x(i)} y={H - 10} textAnchor="middle" className="fr-chart-t">
          Ch {i + 1}
        </text>
      ))}
    </svg>
  );
}

function DevelopThemes({ theme, tab, onTab, onTheme }: { theme: ThemeFixture; tab: string; onTab: (t: string) => void; onTheme: (id: string) => void }) {
  return (
    <div className="fr-dev">
      <div className="fr-dev-head">
        <div className="fr-dev-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 20v-9" /><path d="M11 12c-.4-3.6-2.8-5.8-6-6 .2 3.4 2.6 5.8 6 6z" /><path d="M11 12c.4-3.6 2.8-5.8 6-6-.2 3.4-2.6 5.8-6 6z" /><path d="M11 9.5c-1.6-1.8-1.6-4.2 0-6 1.6 1.8 1.6 4.2 0 6z" /></svg>
        </div>
        <h1>{tab}</h1>
        <p>{tab === 'Themes' ? 'See the larger patterns in your story, and how they evolve.' : 'A later PC3 state — not part of the S1 shell review.'}</p>
      </div>
      <div className="fr-tabs" role="tablist">
        {DEVELOP_TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} onClick={() => onTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab !== 'Themes' ? (
        <p className="fr-later">This lens is a later PC3 state family. S1 reviews the shell only.</p>
      ) : (
        <>
          <div className="fr-hero" data-landmark="hero">
            <img src={IMAGES.heroThemes} alt="Themes are how your story finds its shape. They run through moments, characters, and choices — revealing what your story is really about." />
          </div>
          <div className="fr-sec-h">
            <div>
              <h3>Emerging Themes</h3>
              <p>These themes appear across your manuscript. Select one to explore.</p>
            </div>
            <span className="fr-sel"><Icon name="book" /> All Chapters <ChevronDown /></span>
          </div>
          <div className="fr-themes">
            {THEMES.map((t) => (
              <button key={t.id} type="button" className="fr-theme" data-landmark="theme-row" aria-pressed={t.id === theme.id} onClick={() => onTheme(t.id)}>
                <img src={IMAGES[t.image]} alt="" />
                <span className="fr-theme-text">
                  <b>{t.name}</b>
                  <span>{t.desc}</span>
                </span>
                <Presence n={t.presence} />
                <span className="fr-range">{t.range}</span>
                <Chev />
              </button>
            ))}
          </div>
          <div className="fr-lower" data-landmark="lower">
            <div className="fr-card">
              <h4>Theme Across Your Manuscript</h4>
              <p className="fr-sub">See how this theme appears and evolves.</p>
              <ThemeChart t={theme} />
            </div>
            <div className="fr-card">
              <div className="fr-card-top">
                <span className="fr-sel fr-sel-sm">View by: Chapters <ChevronDown /></span>
              </div>
              <h4>Key Moments</h4>
              <p className="fr-sub">Passages where this theme is especially present.</p>
              <ul className="fr-moments">
                {theme.moments.map(([c, s]) => (
                  <li key={s}>
                    <b>Ch {c}</b>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MaiaPassage({ tab, onTab, lead }: { tab: 'passage' | 'larger'; onTab: (t: 'passage' | 'larger') => void; lead: ReadonlyArray<string> }) {
  return (
    <div className="fr-maia-inner">
      <MaiaHead />
      <MaiaTabs<'passage' | 'larger'> tabs={[['passage', 'This Passage'], ['larger', 'Larger Patterns']]} value={tab} onChange={onTab} />
      <div className="fr-mbody">
        <div className="fr-say" data-landmark="maia-card">
          {lead.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="fr-also">You might also explore:</p>
        <Suggestions items={MAIA_SUGGESTIONS} />
      </div>
      <Compose />
      <div className="fr-foot">MAIA reads with you, not ahead of you.</div>
    </div>
  );
}

// ── State 2 · develop-manuscript (#11) ──────────────────────────────────────
function ChapterRail() {
  return (
    <div className="fr-ms">
      <div className="fr-ms-head">
        <h2>
          Manuscript <ChevronDown />
        </h2>
        <span className="fr-ic" aria-hidden="true"><Icon name="search" /></span>
        <span className="fr-ic" aria-hidden="true"><Icon name="doc" /></span>
      </div>
      <ol className="fr-chapters">
        {CHAPTER_LIST.map((c) => (
          <li key={c.head} className={c.current ? 'fr-current' : c.kind === 'part' ? 'fr-part' : ''} aria-current={c.current ? 'true' : undefined}>
            <b>{c.head}</b>
            <span>{c.sub}</span>
          </li>
        ))}
      </ol>
      <figure className="fr-rail-fig">
        <img src={IMAGES.railMist} alt="" />
        <blockquote>{RAIL_QUOTE.text}</blockquote>
        <figcaption>
          {RAIL_QUOTE.by}
          <span>{RAIL_QUOTE.line}</span>
        </figcaption>
      </figure>
    </div>
  );
}

function ManuscriptInContext() {
  return (
    <div className="fr-page-doc">
      <div className="fr-doc-head">
        <div>
          <p className="fr-doc-label">{CHAPTER_6.label}</p>
          <h1>{CHAPTER_6.title}</h1>
        </div>
        <p className="fr-doc-meta">
          {CHAPTER_6.words}
          <br />
          {CHAPTER_6.saved}
        </p>
      </div>
      <div className="fr-doc-body">
        {CHAPTER_6.paragraphs.map((p, i) => (
          <p key={i} className={i === CHAPTER_6.heldIndex ? 'fr-held-passage' : undefined} data-landmark={i === CHAPTER_6.heldIndex ? 'held' : undefined}>
            {p}
          </p>
        ))}
      </div>
      <div className="fr-doc-foot">
        <span>{CHAPTER_6.label}</span>
        <span>{CHAPTER_6.words}</span>
      </div>
      <div className="fr-toolbar" aria-label="Formatting (arrives with real Write, PC5)" aria-disabled="true">
        <span>Paragraph <ChevronDown /></span>
        <b>B</b>
        <i>I</i>
        <span aria-hidden="true">☰</span>
        <span aria-hidden="true">≡</span>
        <span aria-hidden="true">⌁</span>
      </div>
    </div>
  );
}

function MaiaStandsOut({ tab, onTab }: { tab: 'passage' | 'larger'; onTab: (t: 'passage' | 'larger') => void }) {
  return (
    <div className="fr-maia-inner">
      <MaiaHead />
      <MaiaTabs<'passage' | 'larger'> tabs={[['passage', 'This Passage'], ['larger', 'Larger Patterns']]} value={tab} onChange={onTab} />
      <div className="fr-mbody">
        <div className="fr-say fr-say-blue" data-landmark="maia-card">
          <p className="fr-say-lead">{tab === 'passage' ? MANUSCRIPT_MAIA.lead : LARGER[0]}</p>
          <p>{tab === 'passage' ? MANUSCRIPT_MAIA.body : LARGER[1]}</p>
        </div>
        <p className="fr-also fr-also-strong">What stands out here</p>
        <div className="fr-stands">
          {MANUSCRIPT_MAIA.standsOut.map((s) => (
            <div key={s.name} className="fr-stand">
              <img src={IMAGES[s.image]} alt="" />
              <span>
                <b>{s.name}</b>
                <span>{s.desc}</span>
              </span>
              <Chev />
            </div>
          ))}
        </div>
        <p className="fr-also fr-also-strong">You might also explore</p>
        <Suggestions items={MAIA_SUGGESTIONS} />
      </div>
      <Compose />
      <div className="fr-foot">MAIA reads with you, not ahead of you.</div>
    </div>
  );
}

// ── State 3 · review-chapter (#23) ──────────────────────────────────────────
function ReviewRail() {
  return (
    <div className="fr-ms fr-ms-review">
      <div className="fr-work-id">
        <div>
          <b>{WORK.title}</b>
          <span>{WORK.subtitle}</span>
        </div>
        <span className="fr-ic" aria-hidden="true"><Icon name="doc" /></span>
      </div>
      {REVIEW_PARTS.map((p) => (
        <div key={p.part} className="fr-part-group">
          <p className="fr-part-h">
            <b>{p.part}</b> {p.name}
          </p>
          <ol>
            {p.chapters.map(([n, name]) => (
              <li key={n} className={n === REVIEW_CURRENT_CHAPTER ? 'fr-current' : ''} aria-current={n === REVIEW_CURRENT_CHAPTER ? 'true' : undefined}>
                <span className="fr-n">{n}</span>
                {name}
              </li>
            ))}
          </ol>
        </div>
      ))}
      <figure className="fr-rail-fig fr-rail-fig-tall">
        <img src={IMAGES.railRiver} alt="" />
        <blockquote>{RAIL_QUOTE.text}</blockquote>
        <figcaption>— {RAIL_QUOTE.by}</figcaption>
      </figure>
    </div>
  );
}

function ReviewChapter({ filter, onFilter, tab, onTab }: { filter: string; onFilter: (f: string) => void; tab: string; onTab: (t: string) => void }) {
  return (
    <div className="fr-rev">
      <div className="fr-rev-head">
        <h1>
          Review <span className="fr-crumb">›</span> <em>Chapter 5 · What Shifts</em>
        </h1>
        <span className="fr-chip">In Progress</span>
        <span className="fr-back"><Arrow dir="left" /> Back to Manuscript</span>
        <span className="fr-sq" aria-hidden="true">•••</span>
      </div>
      <p className="fr-rev-sub">See your manuscript clearly. Explore, refine, and prepare what comes next.</p>
      <div className="fr-tabs fr-tabs-rev" role="tablist">
        {REVIEW_TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} onClick={() => onTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab !== 'Overview' ? (
        <p className="fr-later">This Review lens is a later PC3 state family. S1 reviews the shell only.</p>
      ) : (
        <>
          <div className="fr-hero fr-hero-rev" data-landmark="hero">
            <img src={IMAGES.heroReview} alt="Chapter 5, What Shifts. Movement and reorientation. Old patterns loosen, new possibilities appear." />
          </div>
          <div className="fr-tiles" data-landmark="tiles">
            {REVIEW_TILES.map((t) => (
              <div key={t.label} className="fr-tile">
                <Icon name={t.icon} />
                <span>
                  <b>{t.value}</b>
                  <span>{t.label}</span>
                  <small>{t.sub}</small>
                </span>
              </div>
            ))}
            <div className="fr-tile fr-tile-cov">
              <span className="fr-ring" style={{ ['--p' as string]: REVIEW_COVERAGE.percent } as React.CSSProperties}>
                {REVIEW_COVERAGE.percent}%
              </span>
              <span>
                <span>{REVIEW_COVERAGE.label}</span>
                <small className="fr-link">{REVIEW_COVERAGE.link} <Arrow /></small>
              </span>
            </div>
          </div>
          <div className="fr-rev-grid">
            <div className="fr-card fr-findings" data-landmark="findings">
              <div className="fr-card-top">
                <h3>Findings in This Chapter</h3>
                <span className="fr-sel fr-sel-sm">In manuscript order</span>
              </div>
              <p className="fr-sub">Moments that carry your story’s heart — and may deserve another look.</p>
              <div className="fr-filters">
                {REVIEW_FILTERS.map(([f, n]) => (
                  <button key={f} type="button" aria-pressed={f === filter} onClick={() => onFilter(f)}>
                    {f} {n}
                  </button>
                ))}
              </div>
              <ul className="fr-finding-list">
                {REVIEW_FINDINGS.filter((f) => filter === 'All' || f.tags.some((t) => filter.startsWith(t))).map((f) => (
                  <li key={f.title} className="fr-finding">
                    <img src={IMAGES[f.image]} alt="" />
                    <span className="fr-finding-text">
                      <b>{f.title}</b>
                      <q>{f.quote.replace(/[“”]/g, '')}</q>
                      <small>{f.page}</small>
                    </span>
                    <span className="fr-finding-side">
                      <span className="fr-tags">
                        <span>{f.tags[0]}</span>
                        <span>{f.tags[1]}</span>
                      </span>
                      <span className="fr-open">Open in manuscript <Arrow /></span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="fr-own">
                <span className="fr-plus" aria-hidden="true">+</span>
                <span>
                  <b>Add your own observation</b>
                  <small>Mark a passage, a question, or a possibility</small>
                </span>
                <span className="fr-add">+ Add</span>
              </div>
            </div>
            <div className="fr-rev-side">
              <div className="fr-card">
                <div className="fr-card-top">
                  <h3><Icon name="leaf" /> Your Story Map</h3>
                  <span className="fr-sel fr-sel-sm">Edit your map</span>
                </div>
                <p className="fr-sub">A member-declared map of your story’s movement. This is your lens — you can rename, reorder, or revise it anytime.</p>
                <div className="fr-storymap">
                  {STORY_MAP_MOVEMENTS.map((m, i) => (
                    <span key={m} style={{ ['--i' as string]: i } as React.CSSProperties}>
                      <small>{m}</small>
                      <i />
                    </span>
                  ))}
                </div>
                <span className="fr-link">See the full map <Arrow /></span>
              </div>
              <div className="fr-card">
                <div className="fr-card-top">
                  <h3>Continuity Map</h3>
                  <span className="fr-sel fr-sel-sm">View full map</span>
                </div>
                <div className="fr-cmap">
                  <span />
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="fr-cmap-n">{i === 0 ? 'Ch\u00A01' : i + 1}</span>
                  ))}
                  {CONTINUITY_ROWS.map(([name, cells]) => (
                    <span key={name} className="fr-cmap-row">
                      <span className="fr-cmap-l">{name}</span>
                      {cells.map((v, i) => (
                        <i key={i} className={`fr-s${v}`} />
                      ))}
                    </span>
                  ))}
                </div>
                <div className="fr-legend">
                  <span><i className="fr-s3" />Often appears</span>
                  <span><i className="fr-s2" />Sometimes</span>
                  <span><i className="fr-s1" />Once or twice</span>
                  <span><i className="fr-s0" />Not present</span>
                </div>
              </div>
              <div className="fr-lives">
                <div className="fr-card">
                  <h3>Where This Chapter Lives</h3>
                  <ol className="fr-where">
                    {WHERE_CHAPTER_LIVES.map(([c, t, s], i) => (
                      <li key={c} className={i === 1 ? 'fr-here' : ''}>
                        <b>{c}</b>
                        <span>{t}</span>
                        <small>{s}</small>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="fr-card">
                  <h3>Nearby Movements</h3>
                  <div className="fr-nearby"><Arrow dir="left" /><span><b>Chapter 4</b>The First Threshold</span></div>
                  <div className="fr-nearby"><span><b>Chapter 6</b>The Current Changes</span><Chev /></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MaiaReview() {
  const [tab, setTab] = useState<'chapter' | 'larger' | 'ask'>('chapter');
  return (
    <div className="fr-maia-inner">
      <MaiaHead large subtitle="Your thinking partner" />
      <MaiaTabs<'chapter' | 'larger' | 'ask'> tabs={[['chapter', 'This Chapter'], ['larger', 'Larger Patterns'], ['ask', 'Ask Anything']]} value={tab} onChange={setTab} />
      <div className="fr-mbody">
        <div className="fr-say fr-say-rev" data-landmark="maia-card">
          <p>{tab === 'chapter' ? REVIEW_MAIA.lead : tab === 'larger' ? LARGER[0] : 'Ask about anything in this Work. MAIA answers from what she has read, and says what she has not.'}</p>
          <p className="fr-say-prompt">{REVIEW_MAIA.prompt}</p>
          <div className="fr-ways">
            {REVIEW_MAIA.ways.map(([icon, text]) => (
              <div key={text} className="fr-sugg-item">
                <Icon name={icon} gold={icon === 'spark'} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="fr-maia-quote">{REVIEW_MAIA.quote}</p>
      </div>
      <Compose mic />
      <div className="fr-foot">MAIA reads with you, not ahead of you.</div>
    </div>
  );
}
