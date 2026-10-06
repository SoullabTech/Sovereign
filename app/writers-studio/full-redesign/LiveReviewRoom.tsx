'use client';

import { useState, type ReactNode } from 'react';
import type { ReviewDiscussionState } from '@/lib/writersStudio/rebuild/reviewDiscuss';

export type Pc3LiveReviewRailItem = {
  id: string;
  index: number;
  heading: string;
  current?: boolean;
};
export type Pc3LiveReviewFinding = {
  id: string;
  title: string;
  body: string;
  location: string;
  sectionId: string;
  lens: string;
  lensLabel: string;
  evidence: readonly string[];
  hypothesis?: boolean;
  canWorkWith?: boolean;
};
export type Pc3LiveReviewLens = {
  id: string;
  label: string;
  count: number;
  state: 'read' | 'read-nothing-noticed' | 'not-read' | 'failed';
};export type Pc3LiveReviewData = {
  workTitle: string;
  workKind: string;
  scopeLabel: string;
  rail: readonly Pc3LiveReviewRailItem[];
  heroSrc: string | null;
  findings: readonly Pc3LiveReviewFinding[];
  lenses: readonly Pc3LiveReviewLens[];
  coverage: {
    read: number;
    total: number;
    percent: number;
    depth: string;
    when: string;
  };
  selectedFindingId?: string;
};

function Arrow({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {dir === 'right' ? <path d="M2 7h10M8 3l4 4-4 4" /> : <path d="M12 7H2M6 3L2 7l4 4" />}
    </svg>
  );
}function SmallIcon({ kind }: { kind: 'doc' | 'lens' | 'finding' }) {
  if (kind === 'doc') return <span aria-hidden="true">◇</span>;
  if (kind === 'lens') return <span aria-hidden="true">✦</span>;
  return <span aria-hidden="true">·</span>;
}

export function LiveReviewRail({ data }: { data: Pc3LiveReviewData }) {
  return (
    <div className="fr-ms fr-ms-review" data-live-review-rail="">
      <div className="fr-work-id">
        <div><b>{data.workTitle}</b><span>{data.workKind}</span></div>
        <span className="fr-ic" aria-hidden="true"><SmallIcon kind="doc" /></span>
      </div>
      <div className="fr-part-group">
        <p className="fr-part-h"><b>Manuscript</b></p>
        <ol>
          {data.rail.map((item) => (
            <li key={item.id} className={item.current ? 'fr-current' : ''}
              aria-current={item.current ? 'true' : undefined}>
              <span className="fr-n">{item.index}</span>{item.heading}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}function FindingList({
  findings, selectedFindingId, onOpenFinding, onWorkWith, onDiscuss,
}: {
  findings: readonly Pc3LiveReviewFinding[];
  selectedFindingId?: string;
  onOpenFinding: (finding: Pc3LiveReviewFinding) => void;
  onWorkWith: (finding: Pc3LiveReviewFinding) => void;
  onDiscuss: (finding: Pc3LiveReviewFinding) => void;
}) {
  return (
    <ul className="fr-finding-list">
      {findings.map((finding) => (
        <li key={finding.id} className="fr-finding" data-live-finding={finding.id}
          data-selected={finding.id === selectedFindingId ? 'true' : undefined}>
          <span className="fr-finding-text">
            <b>{finding.title}</b>
            <p>{finding.body}</p>
            <small>{finding.location}</small>
          </span>
          <span className="fr-finding-side">            <span className="fr-tags">
              <span>{finding.lensLabel}</span>
              {finding.hypothesis ? <span>Possibility</span> : null}
            </span>
            {finding.canWorkWith ? (
              <button type="button" className="fr-open fr-open-primary" onClick={() => onWorkWith(finding)}>
                Show edit options <Arrow />
              </button>
            ) : null}
            <button type="button" className="fr-open" onClick={() => onOpenFinding(finding)}>
              Open in manuscript <Arrow />
            </button>
            <button type="button" className="fr-open" data-action="discuss"
              onClick={() => onDiscuss(finding)}>
              Discuss with MAIA
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function LensPanel({
  data, tab, onOpenFinding, onWorkWith, onDiscuss,
}: {
  data: Pc3LiveReviewData;
  tab: string;
  onOpenFinding: (finding: Pc3LiveReviewFinding) => void;
  onWorkWith: (finding: Pc3LiveReviewFinding) => void;
  onDiscuss: (finding: Pc3LiveReviewFinding) => void;
}) {  const lens = data.lenses.find((candidate) => candidate.label === tab);
  if (!lens) return <p className="fr-later">This Review view is not available.</p>;
  if (lens.state === 'failed') {
    return <p className="fr-later">This reading could not complete. Nothing has been inferred in its place.</p>;
  }
  if (lens.state === 'not-read') {
    return <p className="fr-later">MAIA has not read this Review scope through this lens.</p>;
  }
  const findings = data.findings.filter((finding) => finding.lens === lens.id);
  if (lens.state === 'read-nothing-noticed' || findings.length === 0) {
    return <p className="fr-later">MAIA completed this reading and found nothing to bring you.</p>;
  }
  return (
    <div className="fr-card fr-findings" data-landmark="findings">
      <div className="fr-card-top">
        <h3>{lens.label}</h3>
        <span className="fr-sel fr-sel-sm">{findings.length} finding{findings.length === 1 ? '' : 's'}</span>
      </div>
      <FindingList findings={findings} selectedFindingId={data.selectedFindingId}
        onOpenFinding={onOpenFinding} onWorkWith={onWorkWith} onDiscuss={onDiscuss} />
    </div>
  );
}export function LiveReviewChapter({
  data, filter, onFilter, tab, onTab, onBack, onOpenFinding, onWorkWith, onDiscuss, proof, recovery,
}: {
  data: Pc3LiveReviewData;
  filter: string;
  onFilter: (f: string) => void;
  tab: string;
  onTab: (t: string) => void;
  onBack: () => void;
  onOpenFinding: (finding: Pc3LiveReviewFinding) => void;
  onWorkWith: (finding: Pc3LiveReviewFinding) => void;
  onDiscuss: (finding: Pc3LiveReviewFinding) => void;
  /** Page-form witness of this same Work. Not a developmental lens and not an edit surface. */
  proof?: ReactNode;
  /** Earlier-version comparison. Surfaces possible Lost Gold without restoring anything. */
  recovery?: ReactNode;
}) {
  const tabs = [
    'Overview',
    ...data.lenses.map((lens) => lens.label),
    ...(recovery ? ['Recovery'] : []),
    ...(proof ? ['Proof'] : []),
  ];
  const shown = filter === 'All' ? data.findings
    : data.findings.filter((finding) => finding.lensLabel === filter);
  const completed = data.lenses.filter((lens) =>
    lens.state === 'read' || lens.state === 'read-nothing-noticed').length;
  const filters = [['All', data.findings.length] as const,
    ...data.lenses.map((lens) => [lens.label, lens.count] as const)];  return (
    <div className="fr-rev" data-live-review="">
      <div className="fr-rev-head">
        <h1>Review <span className="fr-crumb">›</span> <em>{data.scopeLabel}</em></h1>
        <span className="fr-chip">Saved Review</span>
        <button type="button" className="fr-back" onClick={onBack}>
          <Arrow dir="left" /> Back to Manuscript
        </button>
        <span className="fr-sq" aria-hidden="true">•••</span>
      </div>
      <p className="fr-rev-sub">
        See what MAIA noticed in this saved reading, with every finding tied back to your Work.
      </p>
      <div className="fr-tabs fr-tabs-rev" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} onClick={() => onTab(t)}>
            {t}
          </button>
        ))}
      </div>      {tab === 'Recovery' && recovery ? recovery : tab === 'Proof' && proof ? proof : tab !== 'Overview' ? (
        <LensPanel data={data} tab={tab} onOpenFinding={onOpenFinding} onWorkWith={onWorkWith} onDiscuss={onDiscuss} />
      ) : (
        <>
          <div className="fr-hero fr-hero-rev" data-landmark="hero">
            {data.heroSrc ? (
              <img src={data.heroSrc} alt={data.workTitle + ' — the image this Work carries'} />
            ) : (
              <div className="fr-review-live-hero-copy">
                <small>Your saved Review</small>
                <strong>{data.scopeLabel}</strong>
                <span>{data.coverage.read} of {data.coverage.total} sections read · {data.coverage.depth}</span>
              </div>
            )}
          </div>
          <div className="fr-tiles" data-landmark="tiles">
            <div className="fr-tile"><SmallIcon kind="finding" /><span><b>{data.findings.length}</b><span>Findings</span><small>in this Review</small></span></div>
            <div className="fr-tile"><SmallIcon kind="lens" /><span><b>{completed}</b><span>Read lenses</span><small>of {data.lenses.length}</small></span></div>            <div className="fr-tile"><SmallIcon kind="doc" /><span><b>{data.coverage.read}</b><span>Sections read</span><small>of {data.coverage.total}</small></span></div>
            <div className="fr-tile fr-tile-cov">
              <span className="fr-ring"
                style={{ ['--p' as string]: data.coverage.percent } as React.CSSProperties}>
                {data.coverage.percent}%
              </span>
              <span><span>Review coverage</span><small>{data.coverage.when}</small></span>
            </div>
          </div>
          <div className="fr-rev-grid">
            <div className="fr-card fr-findings" data-landmark="findings">
              <div className="fr-card-top"><h3>Findings in This Review</h3><span className="fr-sel fr-sel-sm">In manuscript order</span></div>
              <p className="fr-sub">Observations from the exact text MAIA read. They are things to consider, not grades.</p>
              <div className="fr-filters">
                {filters.map(([f, n]) => (
                  <button key={f} type="button" aria-pressed={f === filter} onClick={() => onFilter(f)}>{f} {n}</button>
                ))}
              </div>              <FindingList findings={shown} selectedFindingId={data.selectedFindingId}
                onOpenFinding={onOpenFinding} onWorkWith={onWorkWith} onDiscuss={onDiscuss} />
            </div>
            <div className="fr-rev-side">
              <section className="fr-card">
                <div className="fr-card-top"><h3>What MAIA read</h3><span className="fr-sel fr-sel-sm">{data.coverage.percent}%</span></div>
                <p className="fr-sub">{data.coverage.read} of {data.coverage.total} sections · {data.coverage.depth}.</p>
                <p className="fr-sub">Frozen {data.coverage.when}. Nothing here implies material outside that coverage was read.</p>
              </section>
              <section className="fr-card">
                <div className="fr-card-top"><h3>Ways this Review looked</h3></div>
                <div className="fr-ways">
                  {data.lenses.map((lens) => (
                    <div key={lens.id} className="fr-sugg-item" data-live-lens={lens.id}
                      data-live-lens-state={lens.state}>
                      <SmallIcon kind="lens" />
                      <span>{lens.label} · {lens.state === 'read' ? lens.count + ' to look at'
                        : lens.state === 'read-nothing-noticed' ? 'read; nothing surfaced'
                        : lens.state === 'failed' ? 'could not complete' : 'not read'}</span>
                    </div>
                  ))}
                </div>              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function LiveMaiaReview({
  data, selectedFinding, discussion, onSubmit, onClose, onTalkWork,
}: {
  data: Pc3LiveReviewData;
  selectedFinding: Pc3LiveReviewFinding | null;
  discussion: ReviewDiscussionState | null;
  onSubmit: (findingId: string, text: string) => void;
  onClose: () => void;
  /** Ordinary durable Work conversation. Distinct from frozen Review discussion. */
  onTalkWork?: () => void;
}) {
  const [text, setText] = useState('');
  const active = selectedFinding ?? data.findings.find((f) => f.id === data.selectedFindingId)
    ?? data.findings[0] ?? null;
  const state = discussion && active && discussion.findingId === active.id ? discussion : null;  return (
    <div className="fr-maia-inner" data-live-review-maia="">
      <div className="fr-maia-head fr-maia-head-lg">
        <div className="fr-orb fr-orb-lg" aria-hidden="true" />
        <div className="fr-maia-name"><h2>MAIA</h2><span>Your thinking partner</span></div>
        <span className="fr-dots" aria-hidden="true">•••</span>
      </div>
      <div className="fr-mbody">
        <div className="fr-say fr-say-rev" data-landmark="maia-card">
          {active ? (
            <>
              <p>{active.title}</p>
              <p className="fr-say-prompt">{active.body}</p>
              <div className="fr-ways">
                {active.evidence.map((evidence) => (
                  <div key={evidence} className="fr-sugg-item"><SmallIcon kind="doc" /><span>{evidence}</span></div>
                ))}
              </div>
            </>
          ) : <p>This saved Review contains no findings to discuss.</p>}
        </div>        {state?.kind === 'pending' ? <p className="fr-maia-quote">MAIA is staying with this observation as it was read…</p> : null}
        {state?.kind === 'answered' ? (
          <div data-review-discussion="answered">
            <p className="fr-maia-quote">{state.reply}</p>
            <button type="button" className="fr-open" onClick={onClose}>Close</button>
          </div>
        ) : null}
        {state?.kind === 'refused' ? (
          <div data-review-discussion="refused">
            <p className="fr-maia-quote">{state.copy}</p>
            <button type="button" className="fr-open" onClick={onClose}>Close</button>
          </div>
        ) : null}
        {onTalkWork ? (
          <button type="button" className="fr-open" data-action="talk-work" onClick={onTalkWork}>
            Talk about the larger Work
          </button>
        ) : null}
      </div>
      {active && (!state || state.kind === 'composing') ? (
        <form className="fr-compose" onSubmit={(e) => {
          e.preventDefault();
          const ask = text.trim();
          if (!ask) return;
          onSubmit(active.id, ask);
          setText('');
        }} aria-label="Discuss this finding with MAIA">          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Ask about this finding…" aria-label="Ask about this finding" />
          <button type="submit" className={text.trim() ? 'fr-send fr-send-ready' : 'fr-send'}
            aria-label="Send" disabled={!text.trim()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1.7">
              <path d="M7 12V2M3 6l4-4 4 4" />
            </svg>
          </button>
        </form>
      ) : null}
      <div className="fr-foot">MAIA discusses the finding as she read it. Your Work does not change.</div>
    </div>
  );
}
