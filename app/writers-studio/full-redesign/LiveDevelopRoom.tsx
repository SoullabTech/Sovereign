'use client';

import { ChevronDown } from './Shell';
import { DEVELOP_TABS, IMAGES } from './fixtures';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { LiveDevelopReading } from '@/lib/writersStudio/develop/liveLens';
import type { LiveGovernedTheme, LiveThemeCandidate, LiveThemesPayload } from '@/lib/writersStudio/themes/liveTypes';
import type { ReadingSummary } from '@/lib/manuscript/developmentalReading/store';

export type Pc3DevelopTab = (typeof DEVELOP_TABS)[number];

export interface Pc3DevelopOverview {
  work: string;
  kind: string;
  sections: number;
  words: number;
  structure: readonly {
    sectionId: string;
    label: string;
    position: number;
    depth: number | null;
  }[];
}

export interface LiveDevelopRoomProps {
  tab: Pc3DevelopTab;
  onTab: (tab: Pc3DevelopTab) => void;
  sections: readonly RebuildSection[];
  activeSectionId: string | null;
  onOpenSection: (sectionId: string) => void;
  overview: Pc3DevelopOverview;
  themes: LiveThemesPayload | null;
  themesState: 'loading' | 'ready' | 'unavailable';
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string) => void;
  onOpenThemeEvidence: (sectionId: string) => void;
  reading: LiveDevelopReading | null;
  readingChoices: readonly ReadingSummary[];
  selectedReadingId: string | null;
  onSelectReading: (readingId: string) => void;
  onReadForLens: () => void;
  readingBusy: boolean;
  readingRefusal: string | null;
  onOpenReadingEvidence: (sectionId: string) => void;
}

const PROVENANCE: Record<string, string> = {
  'member-declared': 'You named this',
  'textual-entity': 'Repeated in the text',
  'maia-observation': 'MAIA noticed this',
  'template-selected': 'From a selected template',
};

function paragraphs(body: string): string[] {
  return body.length === 0 ? [''] : body.split(/\n{2,}/);
}

function currentSection(props: LiveDevelopRoomProps): RebuildSection | null {
  if (props.activeSectionId) {
    const found = props.sections.find((section) => section.draftSectionId === props.activeSectionId);
    if (found) return found;
  }
  return props.sections[0] ?? null;
}

function tabQuestion(tab: Pc3DevelopTab): string {
  switch (tab) {
    case 'Overview': return 'See the Work as it stands now.';
    case 'Structure': return 'See the authored shape of the Work.';
    case 'Themes': return 'See what keeps returning, and where the evidence lives.';
    case 'Voice': return 'See what a saved reading noticed about the voice.';
    case 'Continuity': return 'See what carries through, and what drops.';
    case 'Reader Perspective': return 'See what the reader meets, in the order it is met.';
  }
}

function DevelopmentMark() {
  return (
    <div className="fr-dev-mark" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M11 20v-9" />
        <path d="M11 12c-.4-3.6-2.8-5.8-6-6 .2 3.4 2.6 5.8 6 6z" />
        <path d="M11 12c.4-3.6 2.8-5.8 6-6-.2 3.4-2.6 5.8-6 6z" />
        <path d="M11 9.5c-1.6-1.8-1.6-4.2 0-6 1.6 1.8 1.6 4.2 0 6z" />
      </svg>
    </div>
  );
}

function Tabs(props: { tab: Pc3DevelopTab; onTab: (tab: Pc3DevelopTab) => void }) {
  return (
    <div className="fr-tabs" role="tablist">
      {DEVELOP_TABS.map((item) => (
        <button key={item} type="button" role="tab" aria-selected={item === props.tab} onClick={() => props.onTab(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

export function LiveDevelopManuscript(props: LiveDevelopRoomProps) {
  const active = currentSection(props);
  const listMode = props.tab !== 'Themes';
  return (
    <div className="fr-ms">
      <div className="fr-ms-head">
        <h2>Manuscript <ChevronDown /></h2>
      </div>
      {listMode ? (
        <ol className="fr-chapters">
          {props.sections.map((section, index) => {
            const current = section.draftSectionId === active?.draftSectionId;
            return (
              <li key={section.draftSectionId} className={current ? 'fr-current' : ''} aria-current={current ? 'true' : undefined}>
                <button type="button" onClick={() => props.onOpenSection(section.draftSectionId)} style={{ textAlign: 'left' }}>
                  <b>{section.heading?.trim() || 'Section ' + (index + 1)}</b>
                  <span>{section.headingDepth ? 'Authored level ' + section.headingDepth : 'Authored section'}</span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="fr-ms-body">
          <p className="fr-ch-no">{active?.heading?.trim() || 'Current section'}</p>
          {paragraphs(active?.body ?? '').slice(0, 5).map((text, index) => (
            <p key={index} className="fr-para">{text}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function maxPresence(theme: LiveGovernedTheme): number {
  if (!theme.projection) return 0;
  return Math.max(0, ...theme.projection.cells.map((cell) => cell.presence ?? 0));
}

function Presence(props: { value: number }) {
  const active = props.value <= 0 ? 0 : props.value === 1 ? 2 : props.value === 2 ? 3 : 5;
  return (
    <span className="fr-bars" aria-label={'Presence level ' + props.value + ' of 3'}>
      {[6, 9, 12, 15, 18].map((height, index) => (
        <i key={height} className={index < active ? 'fr-on' : ''} style={{ height }} />
      ))}
    </span>
  );
}

function themeRange(theme: LiveGovernedTheme): string {
  const points = theme.projection?.trajectory ?? [];
  if (points.length === 0) return 'No mapped occurrences';
  if (points.length === 1) return points[0]!.label;
  return points[0]!.label + ' – ' + points[points.length - 1]!.label;
}

function ThemeChart(props: { theme: LiveGovernedTheme }) {
  const points = props.theme.projection?.trajectory ?? [];
  if (points.length === 0) {
    return <p className="fr-sub">No current occurrence trajectory is claimed for this theme.</p>;
  }
  const width = 440, height = 142, left = 100, right = 16, top = 10, bottom = 26;
  const minPosition = Math.min(...points.map((point) => point.sectionPosition));
  const maxPosition = Math.max(...points.map((point) => point.sectionPosition));
  const span = Math.max(1, maxPosition - minPosition);
  const x = (position: number) => left + ((position - minPosition) * (width - left - right)) / span;
  const y = (presence: number) => top + (height - top - bottom) * (1 - presence / 3);
  const path = points.map((point, index) =>
    (index ? 'L' : 'M') + x(point.sectionPosition).toFixed(1) + ' ' + y(point.presence).toFixed(1)
  ).join(' ');
  return (
    <svg className="fr-chart" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label={props.theme.label + ' occurrence presence across covered sections'}>
      <text x="0" y={top + 10} className="fr-chart-t">Stronger presence</text>
      <text x="0" y={height - bottom - 2} className="fr-chart-t">Weaker presence</text>
      <line x1={left - 6} x2={left - 6} y1={top} y2={height - bottom} className="fr-chart-axis" />
      <line x1={left - 6} x2={width - right} y1={height - bottom} y2={height - bottom} className="fr-chart-axis" />
      <path d={path} className="fr-chart-line" />
      {points.map((point) => (
        <circle key={point.sectionId} cx={x(point.sectionPosition)} cy={y(point.presence)} r="3.6" className="fr-chart-dot" />
      ))}
    </svg>
  );
}

function ThemesPanel(props: LiveDevelopRoomProps) {
  const themes = props.themes?.themes.filter((theme) => theme.standing !== 'rejected') ?? [];
  const selected = themes.find((theme) => theme.id === props.selectedThemeId) ?? themes[0] ?? null;
  const decorative = [IMAGES.themeChange, IMAGES.themeBelonging, IMAGES.themePerception, IMAGES.themeGrowth];
  return (
    <>
      <div className="fr-hero" data-landmark="hero">
        <img src={IMAGES.heroThemes} alt="" />
      </div>
      <div className="fr-sec-h">
        <div>
          <h3>Themes across your Work</h3>
          <p>Only themes with explicit provenance and admitted evidence appear here.</p>
        </div>
      </div>
      {props.themesState === 'loading' ? <p className="fr-later">Opening the theme record…</p> : null}
      {props.themesState === 'unavailable' ? <p className="fr-later">Theme evidence is not available here yet. Nothing is inferred in its place.</p> : null}
      {props.themesState === 'ready' && themes.length === 0 ? <p className="fr-later">No governed themes are present yet.</p> : null}
      <div className="fr-themes">
        {themes.map((theme, index) => (
          <button key={theme.id} type="button" className="fr-theme" data-landmark="theme-row" aria-pressed={theme.id === selected?.id} onClick={() => props.onSelectTheme(theme.id)}>
            <img src={decorative[index % decorative.length]} alt="" />
            <span className="fr-theme-text">
              <b>{theme.label}</b>
              <span>{(PROVENANCE[theme.provenance] ?? theme.provenance) + ' · ' + theme.sourceState}</span>
            </span>
            <Presence value={maxPresence(theme)} />
            <span className="fr-range">{themeRange(theme)}</span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {selected ? (
        <div className="fr-lower" data-landmark="lower">
          <div className="fr-card">
            <h4>Theme across your manuscript</h4>
            <p className="fr-sub">
              {selected.projection
                ? selected.projection.coverage.read + ' of ' + selected.projection.coverage.total + ' sections were covered by the source reading.'
                : 'No current occurrence projection is claimed.'}
            </p>
            <ThemeChart theme={selected} />
          </div>
          <div className="fr-card">
            <h4>Exact evidence</h4>
            <p className="fr-sub">Return only to evidence that still has a current section address.</p>
            <ul className="fr-moments">
              {(selected.evidence ?? []).map((evidence) => (
                <li key={evidence.sectionId + ':' + (evidence.range?.start ?? 'section')}>
                  <b>{evidence.label}</b>
                  {evidence.currentAddress ? (
                    <button type="button" onClick={() => props.onOpenThemeEvidence(evidence.sectionId)}>Open in Write</button>
                  ) : <span>Historical address</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

function OverviewPanel(props: { overview: Pc3DevelopOverview }) {
  return (
    <div className="fr-lower" data-landmark="lower">
      <div className="fr-card">
        <h4>Your manuscript now</h4>
        <p className="fr-sub">{props.overview.sections} authored sections · {props.overview.words.toLocaleString('en-US')} words</p>
        <p>This is manuscript fact only. Opening Develop has not commissioned a reading.</p>
      </div>
      <div className="fr-card">
        <h4>The Work</h4>
        <p className="fr-sub">{props.overview.work}</p>
        <p>{props.overview.kind}</p>
      </div>
    </div>
  );
}

function StructurePanel(props: { overview: Pc3DevelopOverview; onOpen: (id: string) => void }) {
  return (
    <div className="fr-lower" data-landmark="lower">
      <div className="fr-card" style={{ gridColumn: '1 / -1' }}>
        <h4>Authored structure</h4>
        <p className="fr-sub">Only headings and order already authored in the manuscript are shown.</p>
        <ul className="fr-moments">
          {props.overview.structure.map((section) => (
            <li key={section.sectionId}>
              <b>{section.position}</b>
              <button type="button" onClick={() => props.onOpen(section.sectionId)}>{section.label}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReadingPanel(props: LiveDevelopRoomProps) {
  const active = currentSection(props);
  return (
    <div className="fr-page-doc">
      <div className="fr-doc-head">
        <div>
          <p className="fr-doc-label">Current manuscript place</p>
          <h1>{active?.heading?.trim() || 'Untitled section'}</h1>
        </div>
      </div>
      <div className="fr-doc-body">
        {paragraphs(active?.body ?? '').map((text, index) => <p key={index}>{text}</p>)}
      </div>
      <div className="fr-doc-foot">
        <span>{props.tab}</span>
        <span>{props.reading ? props.reading.state : 'No saved reading selected'}</span>
      </div>
    </div>
  );
}

export function LiveDevelopWork(props: LiveDevelopRoomProps) {
  return (
    <div className="fr-dev">
      <div className="fr-dev-head">
        <DevelopmentMark />
        <h1>{props.tab}</h1>
        <p>{tabQuestion(props.tab)}</p>
      </div>
      <Tabs tab={props.tab} onTab={props.onTab} />
      {props.tab === 'Overview' ? <OverviewPanel overview={props.overview} /> : null}
      {props.tab === 'Structure' ? <StructurePanel overview={props.overview} onOpen={props.onOpenSection} /> : null}
      {props.tab === 'Themes' ? <ThemesPanel {...props} /> : null}
      {props.tab === 'Voice' || props.tab === 'Continuity' || props.tab === 'Reader Perspective'
        ? <ReadingPanel {...props} /> : null}
    </div>
  );
}

function MaiaHead() {
  return (
    <div className="fr-maia-head">
      <div className="fr-orb" aria-hidden="true" />
      <div className="fr-maia-name"><h2>MAIA</h2><span>Developmental reading</span></div>
      <span className="fr-dots" aria-hidden="true">•••</span>
    </div>
  );
}

function ReadingChoices(props: LiveDevelopRoomProps) {
  return (
    <>
      <p className="fr-also fr-also-strong">Saved readings</p>
      <div className="fr-sugg">
        {props.readingChoices.length === 0 ? <p>No saved reading exists for this lens.</p> : null}
        {props.readingChoices.map((choice) => (
          <button key={choice.id} type="button" className="fr-sugg-item" aria-pressed={choice.id === props.selectedReadingId} onClick={() => props.onSelectReading(choice.id)}>
            <span>{new Date(choice.frozenAt).toLocaleDateString()}</span>
          </button>
        ))}
      </div>
      <button type="button" className="fr-sugg-item" onClick={props.onReadForLens} disabled={props.readingBusy}>
        {props.readingBusy ? 'Reading…' : 'Read this Work for ' + props.tab}
      </button>
      {props.readingRefusal ? <p>{props.readingRefusal}</p> : null}
    </>
  );
}

function ThemeMaia(props: LiveDevelopRoomProps) {
  const selected = props.themes?.themes.find((theme) => theme.id === props.selectedThemeId)
    ?? props.themes?.themes[0] ?? null;
  const candidates: readonly LiveThemeCandidate[] = props.themes?.candidates ?? [];
  return (
    <>
      <div className="fr-say" data-landmark="maia-card">
        <p>{selected ? selected.label + ' is shown from ' + (PROVENANCE[selected.provenance] ?? selected.provenance) + '.' : 'No theme is selected.'}</p>
        <p>{selected?.projection ? 'Its presence map comes only from admitted occurrences inside the source reading coverage.' : 'No presence map is claimed without admitted evidence.'}</p>
      </div>
      {candidates.length ? (
        <>
          <p className="fr-also fr-also-strong">Ungoverned candidates</p>
          <div className="fr-sugg">
            {candidates.slice(0, 4).map((candidate) => (
              <div key={candidate.readingId + ':' + candidate.observationId} className="fr-sugg-item">
                <span>{candidate.label} · MAIA observation · not yet accepted as a Work theme</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function ReadingMaia(props: LiveDevelopRoomProps) {
  if (!props.reading) return <ReadingChoices {...props} />;
  return (
    <>
      <div className="fr-say fr-say-blue" data-landmark="maia-card">
        <p className="fr-say-lead">{props.reading.stateSentence}</p>
        <p>{props.reading.coverage.sentence}</p>
      </div>
      <p className="fr-also fr-also-strong">What this saved reading noticed</p>
      <div className="fr-stands">
        {props.reading.observations.map((observation) => (
          <div key={observation.id} className="fr-stand">
            <img src={IMAGES.maiaChange} alt="" />
            <span>
              <b>{observation.label}</b>
              <span>{observation.text}</span>
              {observation.returnTo ? (
                <button type="button" onClick={() => props.onOpenReadingEvidence(observation.returnTo!.sectionId)}>Open exact evidence</button>
              ) : <span>{observation.state === 'current' ? 'No current exact section address' : observation.stateSentence}</span>}
            </span>
            <span aria-hidden="true">›</span>
          </div>
        ))}
      </div>
      <ReadingChoices {...props} />
    </>
  );
}

export function LiveDevelopMaia(props: LiveDevelopRoomProps) {
  return (
    <div className="fr-maia-inner">
      <MaiaHead />
      <div className="fr-mbody">
        {props.tab === 'Overview' ? <div className="fr-say"><p>Overview shows manuscript facts only. No reading was commissioned by opening this room.</p></div> : null}
        {props.tab === 'Structure' ? <div className="fr-say"><p>Structure here is the shape you authored. No split, merge, or rename action is inferred or offered.</p></div> : null}
        {props.tab === 'Themes' ? <ThemeMaia {...props} /> : null}
        {props.tab === 'Voice' || props.tab === 'Continuity' || props.tab === 'Reader Perspective' ? <ReadingMaia {...props} /> : null}
      </div>
      <form className="fr-compose" onSubmit={(event) => event.preventDefault()} aria-label="Develop discussion is not wired in this act">
        <textarea disabled placeholder="Discussion stays separate from this Develop act." />
        <button type="submit" className="fr-send" disabled aria-label="Discussion unavailable in this Develop act">↑</button>
      </form>
      <div className="fr-foot">MAIA reads with you, not ahead of you.</div>
    </div>
  );
}
