'use client';

/**
 * What is alive now — the current sky meeting this natal chart.
 *
 * JARVIS-ASTROLOGY-SOUL-JOURNEY-01 · T1 (field) · T2 (Major / Minor / All)
 * · T3 (deepening, first slice) · T4 (activation timeline) · T5 (wheel link).
 *
 * Layering is the law of this surface:
 *   calculated geometry  →  symbolic tradition  →  member meaning
 * Calculated facts come only from lib/astrology/transitField.ts. The symbolic
 * layer is labelled as tradition and phrased as possibility. Nothing here is
 * sent to MAIA except by the member's explicit gesture.
 */

import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '@/lib/http/apiBase';
// Type-only: the ephemeris engine stays on the server.
import type { NatalPointInput, TransitActivation, TransitField } from '@/lib/astrology/transitField';
import { PLANET_DOMAIN_MAP } from '@/lib/astrology/transitInterpretation';
import { synthesizeAspect } from '@/lib/astrology/aspectSynthesis';
import styles from './what-is-alive-now.module.css';

type Lens = 'major' | 'minor' | 'all';

const GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
  Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Ascendant: 'AC', Midheaven: 'MC',
};

const PRINCIPLES: Record<string, string> = {
  ...PLANET_DOMAIN_MAP,
  midheaven: 'vocation / public direction / what one is oriented toward',
};

const ASPECT_QUALITY: Record<string, string> = {
  conjunction: 'a conjunction fuses two principles in one place, where they can be hard to tell apart',
  sextile: 'a sextile opens an available cooperation that tends to need a step taken',
  square: 'a square is friction that has traditionally asked for adjustment or action',
  trine: 'a trine is an ease that can support, or simply pass unnoticed',
  opposition: 'an opposition is a polarity often met through relationship, mirror or balance',
};

/** Degrees → `0°24′` (mirrors formatOrb in lib/astrology/transitField.ts). */
function formatOrb(deg: number): string {
  let d = Math.floor(deg);
  let m = Math.round((deg - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, '0')}′`;
}

function shortDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function describeWindow(a: TransitActivation): string {
  const { windowStart, windowEnd, openStart, openEnd } = a.timing;
  const start = openStart ? 'before this view' : shortDate(windowStart);
  const end = openEnd ? 'beyond this view' : shortDate(windowEnd);
  return `active ${start} – ${end}`;
}

function describeExact(a: TransitActivation): string {
  if (a.deviation <= 1 / 60) return 'Exact now';
  if (a.timing.nextExact) return `Exact ${shortDate(a.timing.nextExact)}`;
  if (a.timing.lastExact) return `Was exact ${shortDate(a.timing.lastExact)}`;
  return 'Comes close without perfecting';
}

function contactLabel(a: TransitActivation): string {
  return `${a.transiting.body} ${a.aspect.symbol} natal ${a.natal.point}`;
}

function phaseOf(a: TransitActivation): string {
  if (a.deviation <= 1 / 60) return 'exact';
  if (a.motion === 'applying') return a.deviation <= 1 ? 'intensifying' : 'entering';
  return a.deviation <= 1 ? 'separating' : 'completing';
}

export interface WhatIsAliveNowProps {
  natal: NatalPointInput[];
  /** Verified activations, lifted so the House Wheel can draw the same field. */
  onField?: (field: TransitField | null) => void;
  /** Member asks to see an activation on the wheel. */
  onShowOnWheel?: (activation: TransitActivation) => void;
  /** Member explicitly brings this activation into a MAIA conversation. */
  onBringToMaia?: (text: string) => void;
}

export function WhatIsAliveNow({ natal, onField, onShowOnWheel, onBringToMaia }: WhatIsAliveNowProps) {
  const [field, setField] = useState<TransitField | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lens, setLens] = useState<Lens | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const natalKey = useMemo(() => JSON.stringify(natal), [natal]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetch(apiUrl('/api/astrology/transit-field'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: natalKey.length > 2 ? JSON.stringify({ natal: JSON.parse(natalKey) }) : '{}',
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => {
        if (cancelled) return;
        if (!json?.success || !json.field) throw new Error('no field');
        setField(json.field);
        setStatus('ready');
        onField?.(json.field);
      })
      .catch(() => {
        if (cancelled) return;
        setField(null);
        setStatus('error');
        onField?.(null);
      });
    return () => { cancelled = true; };
    // onField is a parent callback; re-run only when the natal input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natalKey]);

  const activations = field?.activations ?? [];
  const strongest = activations.slice(0, 4);
  const listed = lens ? activations.filter((a) => lens === 'all' || a.scale === lens) : [];
  const selected = activations.find((a) => a.id === selectedId) ?? null;

  function open(a: TransitActivation) {
    setSelectedId(a.id);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        document.getElementById('alive-now-deepening')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  return (
    <section className={styles.field} aria-label="What is alive now">
      <div className={styles.paper}>
        <header className={styles.head}>
          <div>
            <small>CURRENT SKY{field ? ' · ' + longDate(field.calculatedAt).toUpperCase() : ''}</small>
            <h2>What is alive now</h2>
          </div>
          <p>
            The current sky meeting your natal field. A temporal aperture — activation, not destiny.
          </p>
        </header>

        {status === 'loading' ? (
          <p className={styles.status}>Calculating which bodies are contacting your chart…</p>
        ) : status === 'error' ? (
          <p className={styles.status}>The current sky could not be calculated just now. Nothing is inferred in its place.</p>
        ) : activations.length === 0 ? (
          <p className={styles.status}>
            No body in the current sky is within orb of your admitted natal points today. That, too, is a calculated fact.
          </p>
        ) : (
          <>
            <div className={styles.sectionLabel}>
              <span>STRONGEST ACTIVATIONS TODAY</span>
              <em>{field?.orderingRule}</em>
            </div>
            <ul className={styles.rows}>
              {strongest.map((a) => (
                <ActivationRow key={a.id} a={a} selected={a.id === selectedId} onOpen={() => open(a)} />
              ))}
            </ul>

            <div className={styles.lenses} role="group" aria-label="Transit lens">
              <LensButton
                active={lens === 'major'}
                onClick={() => setLens(lens === 'major' ? null : 'major')}
                title="Major transits"
                count={field?.counts.major ?? 0}
                note="Slower bodies — longer developmental arcs"
              />
              <LensButton
                active={lens === 'minor'}
                onClick={() => setLens(lens === 'minor' ? null : 'minor')}
                title="Minor transits"
                count={field?.counts.minor ?? 0}
                note="Faster bodies — shorter, subtler movements"
              />
              <LensButton
                active={lens === 'all'}
                onClick={() => setLens(lens === 'all' ? null : 'all')}
                title="Whole field"
                count={field?.counts.all ?? 0}
                note="Every calculated contact"
              />
            </div>

            {lens ? (
              listed.length ? (
                <ul className={styles.rows}>
                  {listed.map((a) => (
                    <ActivationRow key={a.id} a={a} selected={a.id === selectedId} onOpen={() => open(a)} />
                  ))}
                </ul>
              ) : (
                <p className={styles.status}>No {lens} contacts are within orb today.</p>
              )
            ) : null}

            {selected ? (
              <Deepening
                a={selected}
                onClose={() => setSelectedId(null)}
                onShowOnWheel={onShowOnWheel}
                onBringToMaia={onBringToMaia}
              />
            ) : null}
          </>
        )}

        {field ? (
          <details className={styles.method}>
            <summary>How this field is calculated</summary>
            <p>
              Positions are calculated from a full ephemeris ({field.frame}). A contact is listed when a body is within
              its orb of an exact Ptolemaic aspect to one of your natal planets, Ascendant or Midheaven. Timing is
              searched in the ephemeris and stated to the day.
            </p>
            <table>
              <thead><tr><th>Body</th><th>Scale</th><th>Orb</th><th>Sextile</th></tr></thead>
              <tbody>
                {field.orbTable.map((row) => (
                  <tr key={row.body}>
                    <td>{row.body}</td>
                    <td>{row.scale}</td>
                    <td>{row.orb}°</td>
                    <td>{row.sextileOrb}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {field.excluded.map((item) => (
              <p key={item.point}><b>Held out — {item.point}.</b> {item.reason}</p>
            ))}
          </details>
        ) : null}
      </div>
    </section>
  );
}

function LensButton(props: { active: boolean; onClick: () => void; title: string; count: number; note: string }) {
  return (
    <button
      type="button"
      aria-pressed={props.active}
      className={props.active ? styles.lensActive : styles.lens}
      onClick={props.onClick}
    >
      <small>{props.title.toUpperCase()}</small>
      <b>{props.count} active</b>
      <span>{props.note}</span>
    </button>
  );
}

function ActivationRow({ a, selected, onOpen }: { a: TransitActivation; selected: boolean; onOpen: () => void }) {
  return (
    <li className={selected ? styles.rowSelected : styles.row}>
      <div className={styles.rowContact}>
        <span className={styles.glyph} aria-hidden="true">{GLYPHS[a.transiting.body]}</span>
        <div>
          <strong>{a.transiting.body} {a.aspect.name} natal {a.natal.point}</strong>
          <small>{a.transiting.sign} {a.transiting.degree.toFixed(1)}°{a.transiting.retrograde ? ' ℞' : ''} → {a.natal.sign} {a.natal.degree.toFixed(1)}°</small>
        </div>
      </div>
      <div className={styles.rowOrb}>
        <strong>{formatOrb(a.deviation)}</strong>
        <small>{a.deviation <= 1 / 60 ? 'exact' : a.motion}</small>
      </div>
      <div className={styles.rowTime}>
        <strong>{describeExact(a)}</strong>
        <small>{describeWindow(a)}</small>
      </div>
      <div className={styles.rowScale}>
        <span className={a.scale === 'major' ? styles.tagMajor : styles.tagMinor}>{a.scale}</span>
      </div>
      <button type="button" className={styles.explore} onClick={onOpen} aria-label={`Explore ${contactLabel(a)}`}>
        Explore →
      </button>
    </li>
  );
}

function Timeline({ a }: { a: TransitActivation }) {
  const now = Date.now();
  const startMs = a.timing.windowStart ? Date.parse(a.timing.windowStart) : null;
  const endMs = a.timing.windowEnd ? Date.parse(a.timing.windowEnd) : null;
  const passes = a.timing.passes.map((p) => Date.parse(p.at));
  const anchors = [now, ...passes, ...(startMs ? [startMs] : []), ...(endMs ? [endMs] : [])];
  const span = Math.max(...anchors) - Math.min(...anchors) || 86400_000;
  const lo = (startMs ?? Math.min(...anchors) - span * 0.12);
  const hi = (endMs ?? Math.max(...anchors) + span * 0.12);
  const pct = (t: number) => `${(((t - lo) / (hi - lo)) * 100).toFixed(2)}%`;

  return (
    <div className={styles.timeline} aria-label="Activation timeline">
      <div className={styles.track}>
        <div
          className={styles.window}
          style={{ left: '0%', right: '0%' }}
          data-open-start={a.timing.openStart}
          data-open-end={a.timing.openEnd}
        />
        {a.timing.passes.map((p) => (
          <span
            key={p.at}
            className={p.perfects ? styles.pass : styles.nearPass}
            style={{ left: pct(Date.parse(p.at)) }}
            title={(p.perfects ? 'Exact ' : 'Closest approach ') + longDate(p.at)}
          />
        ))}
        <span className={styles.today} style={{ left: pct(now) }}><em>today</em></span>
      </div>
      <div className={styles.timelineLabels}>
        <span>{a.timing.openStart ? 'began before this view' : 'enters ' + shortDate(a.timing.windowStart)}</span>
        <span>{a.timing.openEnd ? 'continues beyond this view' : 'leaves ' + shortDate(a.timing.windowEnd)}</span>
      </div>
      {a.timing.passes.length > 1 ? (
        <p className={styles.timelineNote}>
          {a.timing.passes.length} passes in this window — the body turns retrograde and back, revisiting the contact.
        </p>
      ) : null}
    </div>
  );
}

function Deepening({
  a,
  onClose,
  onShowOnWheel,
  onBringToMaia,
}: {
  a: TransitActivation;
  onClose: () => void;
  onShowOnWheel?: (a: TransitActivation) => void;
  onBringToMaia?: (text: string) => void;
}) {
  const transitPrinciple = PRINCIPLES[a.transiting.body.toLowerCase()];
  const natalPrinciple = PRINCIPLES[a.natal.point.toLowerCase()];
  const pairing = a.natal.point === 'Ascendant' || a.natal.point === 'Midheaven'
    ? null
    : synthesizeAspect(a.transiting.body, a.natal.point, a.aspect.name);

  function bring() {
    const lines = [
      'I am explicitly bringing one calculated transit from my chart into this conversation.',
      `Transit: ${a.transiting.body} ${a.aspect.name} natal ${a.natal.point}.`,
      `Geometry: ${a.transiting.body} at ${a.transiting.sign} ${a.transiting.degree.toFixed(1)}°${a.transiting.retrograde ? ' (retrograde)' : ''}; natal ${a.natal.point} at ${a.natal.sign} ${a.natal.degree.toFixed(1)}°; ${formatOrb(a.deviation)} from exact, ${a.motion}.`,
      `Timing: ${describeExact(a)}; ${describeWindow(a)}.`,
      'Please keep the calculated facts distinct from symbolic interpretation. Offer possibilities, not predictions or identity claims, and ask what I recognize in my own life.',
    ];
    onBringToMaia?.(lines.join('\n\n'));
  }

  return (
    <article id="alive-now-deepening" className={styles.deepening} aria-label={contactLabel(a)}>
      <header className={styles.deepHead}>
        <div>
          <small>CURRENT ACTIVATION · {phaseOf(a).toUpperCase()}</small>
          <h3>{a.transiting.body} {a.aspect.name} natal {a.natal.point}</h3>
          <p>
            {a.transiting.sign} {a.transiting.degree.toFixed(1)}° → {a.natal.sign} {a.natal.degree.toFixed(1)}° ·{' '}
            {formatOrb(a.deviation)} {a.deviation <= 1 / 60 ? 'exact' : a.motion}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close this activation">Close</button>
      </header>

      <div className={styles.layers}>
        <section className={styles.layer}>
          <small>CALCULATED</small>
          <ul>
            <li>{a.aspect.symbol} {a.aspect.name} ({a.aspect.angle}°), {formatOrb(a.deviation)} from exact within a {a.allowedOrb}° orb.</li>
            <li>
              {a.transiting.body} is {a.transiting.stationary ? 'near a station' : a.transiting.retrograde ? 'retrograde' : 'direct'},
              moving {Math.abs(a.transiting.speedPerDay).toFixed(a.transiting.speedPerDay > 1 ? 1 : 3)}° per day.
            </li>
            <li>{describeWindow(a).replace(/^a/, 'A')}.</li>
            {a.timing.passes.length === 0 ? <li>{describeExact(a)}.</li> : null}
            {a.timing.passes.map((p) => (
              <li key={p.at}>{p.perfects ? 'Exact' : 'Closest approach'} {longDate(p.at)}{p.perfects ? '' : ` (${formatOrb(p.deviation)})`}.</li>
            ))}
          </ul>
          <Timeline a={a} />
        </section>

        <section className={styles.layer}>
          <small>WHY THIS IS SURFACED</small>
          <ul>{a.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>

        <section className={styles.layer}>
          <small>SYMBOLIC TRADITION</small>
          <p>
            In Western tradition, {ASPECT_QUALITY[a.aspect.name]}. Here it joins transiting {a.transiting.body}
            {transitPrinciple ? ` (${transitPrinciple})` : ''} with natal {a.natal.point}
            {natalPrinciple ? ` (${natalPrinciple})` : ''}.
          </p>
          {pairing?.coreQuestion ? (
            <p className={styles.tradQuestion}>A question this pairing has traditionally raised: <em>{pairing.coreQuestion}</em></p>
          ) : null}
          <p className={styles.boundary}>
            This is a lens from a tradition, not a reading of your life. Where it sits within your whole chart, and how it
            may be expressed, are the next layers of this journey.
          </p>
        </section>

        <section className={styles.layer}>
          <small>YOUR MEANING</small>
          <p>What do you recognize here — including what does not fit?</p>
          <div className={styles.actions}>
            {onShowOnWheel ? (
              <button type="button" onClick={() => onShowOnWheel(a)}>Show on the House Wheel</button>
            ) : null}
            {onBringToMaia ? (
              <button type="button" className={styles.primary} onClick={bring}>Bring this activation to MAIA →</button>
            ) : null}
          </div>
          <p className={styles.consent}>Nothing is sent to MAIA until you choose to bring it.</p>
        </section>
      </div>
    </article>
  );
}

export default WhatIsAliveNow;
