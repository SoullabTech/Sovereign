'use client';

import { useState } from 'react';
import {
  CONTINUITY_ROWS, IMAGES, RAIL_QUOTE, REVIEW_COVERAGE, REVIEW_CURRENT_CHAPTER,
  REVIEW_FILTERS, REVIEW_FINDINGS, REVIEW_MAIA, REVIEW_PARTS, REVIEW_TABS,
  REVIEW_TILES, STORY_MAP_MOVEMENTS, WHERE_CHAPTER_LIVES, WORK,
} from './fixtures';

const LARGER = [
  'Across the manuscript, change and transition gathers strength from Chapter 5 onward.',
  'Belonging begins to surface in Chapter 6 and may carry more weight in Part III.',
] as const;

/**
 * PC3-S1 Review presentation.
 *
 * Extracted mechanically from the founder-accepted fixture harness so the
 * fixture and live host can render the same Review composition. This module
 * owns presentation only; it performs no fetch, commission, persistence or
 * Work mutation.
 */

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

// ── State 3 · review-chapter (#23) ──────────────────────────────────────────
export function ReviewRail() {
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

export function ReviewChapter({ filter, onFilter, tab, onTab }: { filter: string; onFilter: (f: string) => void; tab: string; onTab: (t: string) => void }) {
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

export function MaiaReview() {
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
