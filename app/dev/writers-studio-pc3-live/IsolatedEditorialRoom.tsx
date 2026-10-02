'use client';

import {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type CSSProperties,
} from 'react';
import { passageContext } from '@/lib/writersStudio/editorialApproaches';
import { appearanceVars } from '@/app/writers-studio/full-redesign/tokens';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';
import {
  EDITORIAL_LATITUDES,
  LATITUDE_BANDS,
  type EditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';
import {
  DEFAULT_WORKING_STYLE,
  EXPLANATION_COPY,
  EXPLANATION_VALUES,
  PACE_COPY,
  PACE_VALUES,
  readWorkingStyle,
  writeWorkingStyle,
  type ExplanationDepth,
  type WorkingPace,
} from '@/lib/writersStudio/workingStyle';

type Props = {
  appearance: Appearance;
  title: string;
  currentText: string;
  sectionBody: string;
  busy: boolean;
  editingLatitude: EditorialLatitude;
  onEditingLatitude: (value: EditorialLatitude) => void;
  mayRemoveParagraphs: boolean;
  onMayRemoveParagraphs: (value: boolean) => void;
  mayProposeImmediately: boolean;
  onMayProposeImmediately: (value: boolean) => void;
  onClose: () => void;
  children: ReactNode;
};

const MIN_LEFT = 34;
const MAX_LEFT = 68;
const clamp = (value: number) => Math.max(MIN_LEFT, Math.min(MAX_LEFT, value));

const SESSION_PREF_KEY = 'writers-studio:p4r1:focus-view';

type FocusLayout = 'balanced' | 'passage' | 'maia' | 'stacked' | 'custom';
type ReadingSize = 'large' | 'larger' | 'largest';
type LineSpacing = 'open' | 'more-open';

type SessionFocusPrefs = {
  layout: FocusLayout;
  leftPercent: number;
  readingSize: ReadingSize;
  lineSpacing: LineSpacing;
  showDirections: boolean;
  showWorkingDraft: boolean;
  showCraftDepth: boolean;
};

const DEFAULT_PREFS: SessionFocusPrefs = {
  layout: 'balanced',
  leftPercent: 50,
  readingSize: 'large',
  lineSpacing: 'open',
  showDirections: true,
  showWorkingDraft: true,
  showCraftDepth: true,
};

function isLayout(value: unknown): value is FocusLayout {
  return ['balanced', 'passage', 'maia', 'stacked', 'custom'].includes(String(value));
}

function isReadingSize(value: unknown): value is ReadingSize {
  return ['large', 'larger', 'largest'].includes(String(value));
}

function isLineSpacing(value: unknown): value is LineSpacing {
  return ['open', 'more-open'].includes(String(value));
}

function parseSessionPrefs(raw: string | null): SessionFocusPrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionFocusPrefs>;
    return {
      layout: isLayout(parsed.layout) ? parsed.layout : DEFAULT_PREFS.layout,
      leftPercent: clamp(typeof parsed.leftPercent === 'number' ? parsed.leftPercent : DEFAULT_PREFS.leftPercent),
      readingSize: isReadingSize(parsed.readingSize) ? parsed.readingSize : DEFAULT_PREFS.readingSize,
      lineSpacing: isLineSpacing(parsed.lineSpacing) ? parsed.lineSpacing : DEFAULT_PREFS.lineSpacing,
      showDirections: typeof parsed.showDirections === 'boolean' ? parsed.showDirections : DEFAULT_PREFS.showDirections,
      showWorkingDraft: typeof parsed.showWorkingDraft === 'boolean' ? parsed.showWorkingDraft : DEFAULT_PREFS.showWorkingDraft,
      showCraftDepth: typeof parsed.showCraftDepth === 'boolean' ? parsed.showCraftDepth : DEFAULT_PREFS.showCraftDepth,
    };
  } catch {
    return null;
  }
}

function nearbyContext(text: string, side: 'before' | 'after'): string {
  const limit = 1200;
  if (text.length <= limit) return text.trim();
  if (side === 'before') {
    const slice = text.slice(-limit);
    const paragraph = slice.indexOf('\n\n');
    return '…' + (paragraph >= 0 ? slice.slice(paragraph + 2) : slice).trim();
  }
  const slice = text.slice(0, limit);
  const paragraph = slice.lastIndexOf('\n\n');
  return (paragraph > 0 ? slice.slice(0, paragraph) : slice).trim() + '…';
}

export default function IsolatedEditorialRoom({
  appearance,
  title,
  currentText,
  sectionBody,
  busy,
  editingLatitude,
  onEditingLatitude,
  mayRemoveParagraphs,
  onMayRemoveParagraphs,
  mayProposeImmediately,
  onMayProposeImmediately,
  onClose,
  children,
}: Props) {
  const [leftPercent, setLeftPercent] = useState(DEFAULT_PREFS.leftPercent);
  const [layout, setLayout] = useState<FocusLayout>(DEFAULT_PREFS.layout);
  const [readingSize, setReadingSize] = useState<ReadingSize>(DEFAULT_PREFS.readingSize);
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>(DEFAULT_PREFS.lineSpacing);
  const [showDirections, setShowDirections] = useState(DEFAULT_PREFS.showDirections);
  const [showWorkingDraft, setShowWorkingDraft] = useState(DEFAULT_PREFS.showWorkingDraft);
  const [showCraftDepth, setShowCraftDepth] = useState(DEFAULT_PREFS.showCraftDepth);
  const [workingPace, setWorkingPace] = useState<WorkingPace>(DEFAULT_WORKING_STYLE.pace);
  const [explanationDepth, setExplanationDepth] = useState<ExplanationDepth>(DEFAULT_WORKING_STYLE.explanation);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startX: number; startLeft: number; width: number } | null>(null);

  const context = useMemo(
    () => passageContext(sectionBody, currentText),
    [sectionBody, currentText],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = parseSessionPrefs(window.sessionStorage.getItem(SESSION_PREF_KEY));
    if (saved) {
      setLayout(saved.layout);
      setLeftPercent(saved.leftPercent);
      setReadingSize(saved.readingSize);
      setLineSpacing(saved.lineSpacing);
      setShowDirections(saved.showDirections);
      setShowWorkingDraft(saved.showWorkingDraft);
      setShowCraftDepth(saved.showCraftDepth);
    }
    const working = readWorkingStyle();
    setWorkingPace(working.pace);
    setExplanationDepth(working.explanation);
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!prefsLoaded || typeof window === 'undefined') return;
    const snapshot: SessionFocusPrefs = {
      layout,
      leftPercent,
      readingSize,
      lineSpacing,
      showDirections,
      showWorkingDraft,
      showCraftDepth,
    };
    try {
      window.sessionStorage.setItem(SESSION_PREF_KEY, JSON.stringify(snapshot));
    } catch {
      // Presentation preference failure must never block editorial work.
    }
  }, [
    prefsLoaded,
    layout,
    leftPercent,
    readingSize,
    lineSpacing,
    showDirections,
    showWorkingDraft,
    showCraftDepth,
  ]);

  useEffect(() => {
    if (!prefsLoaded) return;
    writeWorkingStyle({ pace: workingPace, explanation: explanationDepth });
  }, [prefsLoaded, workingPace, explanationDepth]);

  const beginDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!shellRef.current) return;
    const width = shellRef.current.getBoundingClientRect().width;
    drag.current = { startX: event.clientX, startLeft: leftPercent, width };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [leftPercent]);

  const moveDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const delta = event.clientX - drag.current.startX;
    const next = drag.current.startLeft + (delta / drag.current.width) * 100;
    setLeftPercent(clamp(next));
    setLayout('custom');
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const keyResize = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setLeftPercent((value) => clamp(value - 3));
      setLayout('balanced');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setLeftPercent((value) => clamp(value + 3));
      setLayout('balanced');
    } else if (event.key === 'Home') {
      event.preventDefault();
      setLeftPercent(MIN_LEFT);
      setLayout('maia');
    } else if (event.key === 'End') {
      event.preventDefault();
      setLeftPercent(MAX_LEFT);
      setLayout('passage');
    }
  }, []);

  const chooseLayout = useCallback((next: 'balanced' | 'passage' | 'maia' | 'stacked') => {
    setLayout(next);
    if (next === 'balanced') setLeftPercent(50);
    if (next === 'passage') setLeftPercent(62);
    if (next === 'maia') setLeftPercent(38);
  }, []);

  const resetView = useCallback(() => {
    setLayout('balanced');
    setLeftPercent(50);
    setReadingSize('large');
    setLineSpacing('open');
    setShowDirections(true);
    setShowWorkingDraft(true);
    setShowCraftDepth(true);
  }, []);

  return (
    <section
      className="p4r1-isolated-editorial"
      style={appearanceVars(appearance) as CSSProperties}
      data-appearance={appearance}
      data-isolated-editorial
      data-layout={layout}
      data-reading-size={readingSize}
      data-line-spacing={lineSpacing}
      data-show-directions={showDirections ? 'true' : 'false'}
      data-show-working={showWorkingDraft ? 'true' : 'false'}
      data-show-depth={showCraftDepth ? 'true' : 'false'}
      data-working-pace={workingPace}
      data-explanation-depth={explanationDepth}
      aria-label="Isolated passage editor"
    >
      <header className="p4r1-isolated-topbar">
        <div>
          <span className="p4r1-eyebrow">Passage focus</span>
          <strong>{title}</strong>
        </div>
        <div className="p4r1-isolated-controls">
          <span className="p4r1-isolated-balance">
            {layout === 'custom' ? 'Custom · ' : ''}{Math.round(leftPercent)} / {100 - Math.round(leftPercent)}
          </span>
          <span className="p4r1-isolated-latitude-status" title={LATITUDE_BANDS[editingLatitude].description}>
            Revision · {LATITUDE_BANDS[editingLatitude].label}
          </span>

          <details className="p4r1-isolated-menu">
            <summary>Layout</summary>
            <div className="p4r1-isolated-menu-card">
              {([
                ['balanced', 'Balanced', 'Equal room for passage and MAIA'],
                ['passage', 'Passage wide', 'More room for the writing'],
                ['maia', 'MAIA wide', 'More room for options and working draft'],
                ['stacked', 'Stacked', 'Passage above, editorial work below'],
              ] as const).map(([id, label, note]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={layout === id}
                  onClick={() => chooseLayout(id)}
                >
                  <b>{label}</b>
                  <span>{note}</span>
                </button>
              ))}
            </div>
          </details>

          <details className="p4r1-isolated-menu">
            <summary>Tools</summary>
            <div className="p4r1-isolated-menu-card p4r1-isolated-tool-list">
              <label>
                <input type="checkbox" checked={showDirections} onChange={(e) => setShowDirections(e.target.checked)} />
                <span><b>Revision directions</b><small>Options and alternate directions</small></span>
              </label>
              <label>
                <input type="checkbox" checked={showWorkingDraft} onChange={(e) => setShowWorkingDraft(e.target.checked)} />
                <span><b>Working draft</b><small>Your editable version and Apply flow</small></span>
              </label>
              <label>
                <input type="checkbox" checked={showCraftDepth} onChange={(e) => setShowCraftDepth(e.target.checked)} />
                <span><b>Craft depth</b><small>Why this works · Teach me why · Advanced view</small></span>
              </label>
            </div>
          </details>

          <details className="p4r1-isolated-menu">
            <summary>Preferences</summary>
            <div className="p4r1-isolated-menu-card p4r1-isolated-preferences">
              <section className="p4r1-working-style" aria-label="Working style">
                <div className="p4r1-working-style-head">
                  <strong>Working style</strong>
                  <span>How MAIA works with your words</span>
                </div>
                <label className="p4r1-latitude-label" htmlFor="p4r1-editing-latitude">
                  <span>Revision latitude</span>
                  <b>{LATITUDE_BANDS[editingLatitude].label}</b>
                </label>
                <input
                  id="p4r1-editing-latitude"
                  className="p4r1-latitude-slider"
                  type="range"
                  min={EDITORIAL_LATITUDES[0]}
                  max={EDITORIAL_LATITUDES[EDITORIAL_LATITUDES.length - 1]}
                  step={1}
                  value={editingLatitude}
                  disabled={busy}
                  aria-valuetext={LATITUDE_BANDS[editingLatitude].label}
                  onChange={(event) => onEditingLatitude(Number(event.target.value) as EditorialLatitude)}
                />
                <div className="p4r1-latitude-scale" aria-hidden="true">
                  {EDITORIAL_LATITUDES.map((value) => <span key={value}>{LATITUDE_BANDS[value].label}</span>)}
                </div>
                <p className="p4r1-latitude-description">{LATITUDE_BANDS[editingLatitude].description}</p>
                <p className="p4r1-latitude-law">This controls how far a proposed revision may move from your wording. Nothing is applied without you.</p>

                <div className="p4r1-working-axis">
                  <label className="p4r1-latitude-label" htmlFor="p4r1-working-pace">
                    <span>How much MAIA shows at once</span>
                    <b>{PACE_COPY[workingPace].label}</b>
                  </label>
                  <input
                    id="p4r1-working-pace"
                    className="p4r1-latitude-slider"
                    type="range"
                    min={0}
                    max={PACE_VALUES.length - 1}
                    step={1}
                    value={PACE_VALUES.indexOf(workingPace)}
                    aria-valuetext={PACE_COPY[workingPace].label}
                    onChange={(event) => setWorkingPace(PACE_VALUES[Number(event.target.value)] ?? DEFAULT_WORKING_STYLE.pace)}
                  />
                  <div className="p4r1-latitude-scale p4r1-scale-three" aria-hidden="true">
                    {PACE_VALUES.map((value) => <span key={value}>{PACE_COPY[value].label}</span>)}
                  </div>
                  <p className="p4r1-latitude-description">{PACE_COPY[workingPace].description}</p>
                </div>

                <div className="p4r1-working-axis">
                  <label className="p4r1-latitude-label" htmlFor="p4r1-explanation-depth">
                    <span>How MAIA explains what she sees</span>
                    <b>{EXPLANATION_COPY[explanationDepth].label}</b>
                  </label>
                  <input
                    id="p4r1-explanation-depth"
                    className="p4r1-latitude-slider"
                    type="range"
                    min={0}
                    max={EXPLANATION_VALUES.length - 1}
                    step={1}
                    value={EXPLANATION_VALUES.indexOf(explanationDepth)}
                    aria-valuetext={EXPLANATION_COPY[explanationDepth].label}
                    onChange={(event) => setExplanationDepth(EXPLANATION_VALUES[Number(event.target.value)] ?? DEFAULT_WORKING_STYLE.explanation)}
                  />
                  <div className="p4r1-latitude-scale" aria-hidden="true">
                    {EXPLANATION_VALUES.map((value) => <span key={value}>{EXPLANATION_COPY[value].label}</span>)}
                  </div>
                  <p className="p4r1-latitude-description">{EXPLANATION_COPY[explanationDepth].description}</p>
                  <div className="p4r1-working-preview" aria-live="polite">
                    <span>MAIA would say</span>
                    <p>{EXPLANATION_COPY[explanationDepth].preview}</p>
                  </div>
                </div>

                <label className="p4r1-working-style-check">
                  <input
                    type="checkbox"
                    checked={mayRemoveParagraphs}
                    disabled={busy}
                    onChange={(event) => onMayRemoveParagraphs(event.target.checked)}
                  />
                  <span><b>Allow paragraph-removal proposals</b><small>Separate permission; never implied by the slider.</small></span>
                </label>
                {editingLatitude === 1 ? (
                  <label className="p4r1-working-style-check">
                    <input
                      type="checkbox"
                      checked={mayProposeImmediately}
                      disabled={busy}
                      onChange={(event) => onMayProposeImmediately(event.target.checked)}
                    />
                    <span><b>Suggest wording straight away</b><small>Otherwise MAIA discusses the passage first at Touch.</small></span>
                  </label>
                ) : null}
              </section>

              <fieldset className="p4r1-reading-prefs">
                <legend>Reading size</legend>
                {([
                  ['large', 'Large'],
                  ['larger', 'Larger'],
                  ['largest', 'Largest'],
                ] as const).map(([id, label]) => (
                  <label key={id}>
                    <input
                      type="radio"
                      name="isolated-reading-size"
                      value={id}
                      checked={readingSize === id}
                      onChange={() => setReadingSize(id)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset>
                <legend>Line spacing</legend>
                <label>
                  <input
                    type="radio"
                    name="isolated-line-spacing"
                    checked={lineSpacing === 'open'}
                    onChange={() => setLineSpacing('open')}
                  />
                  <span>Open</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="isolated-line-spacing"
                    checked={lineSpacing === 'more-open'}
                    onChange={() => setLineSpacing('more-open')}
                  />
                  <span>More open</span>
                </label>
              </fieldset>

              <button type="button" className="p4r1-isolated-reset" onClick={resetView}>Reset view</button>
            </div>
          </details>

          <button type="button" disabled={busy} onClick={onClose}>Return to manuscript</button>
        </div>
      </header>

      <div
        ref={shellRef}
        className="p4r1-isolated-split"
        style={{ gridTemplateColumns: `${leftPercent}% 10px minmax(0, 1fr)` }}
      >
        <article className="p4r1-isolated-passage">
          <div className="p4r1-isolated-passage-inner">
            <span className="p4r1-eyebrow">Your passage</span>
            {context?.before ? <p className="p4r1-isolated-context">{nearbyContext(context.before, 'before')}</p> : null}
            <blockquote>{currentText}</blockquote>
            {context?.after ? <p className="p4r1-isolated-context">{nearbyContext(context.after, 'after')}</p> : null}
          </div>
        </article>

        <button
          type="button"
          className="p4r1-isolated-divider"
          aria-label="Resize passage and editorial panes"
          aria-valuemin={MIN_LEFT}
          aria-valuemax={MAX_LEFT}
          aria-valuenow={Math.round(leftPercent)}
          role="separator"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => chooseLayout('balanced')}
          onKeyDown={keyResize}
          title="Drag to resize · double-click to balance"
        >
          <span aria-hidden="true" />
        </button>

        <aside className="p4r1-isolated-maia">
          <div className="p4r1-isolated-maia-inner">
            {children}
          </div>
        </aside>
      </div>
    </section>
  );
}
