'use client';

/**
 * ASTRO-PRO-03 — member-sovereign, chart-first experience candidate.
 *
 * Laid out as a cockpit (founder direction 2026-11-09): the wheel stays in
 * place as the centre instrument, a rail opens and closes the tools beside it,
 * and one MAIA dock follows whatever is open. Nothing is a long page to scroll.
 *
 * No billing, client records, developmental scoring, auto-interpretation,
 * persistence of member notes, or MAIA runtime modifications.
 *
 * Chart loading is an explicit member act. A dedicated owner-scoped server
 * route resolves the verified session and approved birth data privately; no
 * client-supplied third-party birth record or member ID is accepted.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen, Bookmark, ChevronDown, ChevronRight, ChevronUp, CircleDot, Clock, Eye, EyeOff, FlaskConical, Globe2,
  GraduationCap, Info, MapPin, Orbit, PanelRightOpen, Sparkles, Users, X, type LucideIcon,
} from 'lucide-react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';
import { chartBodies, hasValidChartGeometry, selectedRelationships, geometricHouseFromCusps, type WheelBody } from '@/lib/astrology/proChartGeometry';
import { CelestialChartWheel } from './CelestialChartWheel';
import ProResearchWorkbench from './ProResearchWorkbench';
import ProStudyWorkbench from './ProStudyWorkbench';
import ProRelationshipsWorkbench from './ProRelationshipsWorkbench';
import ProSavedCharts, { type SavedChartSummary } from './ProSavedCharts';
import ProTransitPanel from './ProTransitPanel';
import ProAspectGrid from './ProAspectGrid';
import ProComparePanel from './ProComparePanel';
import ProDerivedPanel from './ProDerivedPanel';
import ProSystemsPanel, { type SystemsWork } from './ProSystemsPanel';
import { PanelMemoryProvider } from './panelMemory';
import { askKey } from './ProAskMaiaPanel';
import ProMaiaDock from './ProMaiaDock';
import { MaiaDockProvider, useMaiaDock, useMaiaSubject } from './maiaDock';
import type { ProAskSection, ProAskView } from '@/lib/astrology/proAskMaiaSections';
import ProDeepReadingPanel from './ProDeepReadingPanel';
import ProChartViews from './ProChartViews';
import ProHouseWheel from './ProHouseWheel';
import ProEphemerisPanel from './ProEphemerisPanel';
import ProAstroMapPanel from './ProAstroMapPanel';
import ProTraditionReport from './ProTraditionReport';
import ProOrbSettings, { useSavedOrbSettings } from './ProOrbSettings';
import { withOrbSettings } from '@/lib/astrology/proAspectOrbs';
import type { ChartPoints } from '@/lib/astrology/proChartPoints';
import type { Declination } from '@/lib/astrology/proDeclinations';
import type { TransitBody } from '@/lib/astrology/proTransits';
import ProSoulPortraitPanel from './ProSoulPortraitPanel';
import styles from './astrology-pro-preview.module.css';
import cockpit from './pro-cockpit.module.css';

type ChartStatus = 'idle' | 'loading' | 'ready' | 'signed-out' | 'consent-required' | 'incomplete' | 'unavailable';
type ViewingMode = 'facts' | 'questions' | 'meaning';
type ProHouseSystem = 'porphyry' | 'whole-sign' | 'equal' | 'placidus' | 'koch';
type SkyPosition = { planet: string; sign: string; degree: number; retrograde?: boolean; motionStatus?: 'direct' | 'retrograde' | 'stationary-uncertain' | 'not-evaluated' };
type SkyStatus = 'loading' | 'ready' | 'unavailable';

const SKY_FOCUS = ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

const INQUIRY: Record<string, string> = {
  Sun: 'Where do you find vitality and direction, and where does your life ask for a different expression?',
  Moon: 'What supports belonging and emotional attunement in your lived experience?',
  Mercury: 'How do language, attention and curiosity shape the worlds you can encounter?',
  Venus: 'Where do beauty, affection, reciprocity and value invite attention?',
  Mars: 'What does initiative or friction open up for you, and where might choice matter?',
  Jupiter: 'What deserves room to grow, and what might need careful discernment?',
  Saturn: 'What are you building a relationship with through time, boundaries and responsibility?',
  Uranus: 'When does change invite freedom, and when might continuity deserve protection?',
  Neptune: 'What inspires wonder, and what also asks for clarity or grounding?',
  Pluto: 'What has altered your understanding of power, loss or transformation?',
  Chiron: 'How might you encounter a difficult theme without making it your identity?',
  'North Node': 'Which possibilities interest you without treating any symbolic direction as destiny?',
  'South Node': 'What traditions or familiar ways of being do you value, question or want to revisit?',
};

function motionLabel(body: WheelBody): string {
  const status = body.position.motionStatus;
  if (status === 'stationary-uncertain') return 'near a station; apparent direction uncertain';
  if (status === 'not-evaluated') return 'apparent motion not verified for this approximate point';
  if (status === 'retrograde') return 'retrograde (provisional geocentric calculation)';
  if (status === 'direct') return 'direct (provisional geocentric calculation)';
  return body.position.retrograde ? 'retrograde (older calculation; not verified)' : '';
}

function formatBody(body: WheelBody): string {
  const p = body.position;
  const motion = body.name === 'Sun' || body.name === 'Moon' ? '' : motionLabel(body);
  return body.name + ' · ' + p.sign + ' ' + p.degree.toFixed(2) + '° · House ' + p.house +
    (motion ? ' · ' + motion : '');
}

type ToolId = 'chart' | 'timing' | 'relationships' | 'places' | 'traditions' | 'readings' | 'research' | 'study' | 'saved';
interface ToolTab {
  id: string;
  label: string;
  /** Works with no chart open (Saved charts; a Soul Portrait of your own chart). */
  withoutChart?: boolean;
  /** What MAIA is told the astrologer has open. */
  view?: ProAskView;
  /** An instrument's own subject the dock should prefer while this is open. */
  prefer?: readonly ProAskSection[];
  render: () => ReactNode;
}
interface Tool { id: ToolId; label: string; icon: LucideIcon; tabs: ToolTab[] }

const HOUSE_SYSTEM_NAMES = { 'whole-sign': 'Whole Sign', equal: 'Equal', porphyry: 'Porphyry', placidus: 'Placidus', koch: 'Koch' } as const;

function typingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

export default function ProAstrologyExperience() {
  return <MaiaDockProvider><Cockpit /></MaiaDockProvider>;
}

function Cockpit() {
  const dock = useMaiaDock();
  // The tools open beside the wheel, most recently opened first; `lead` is the one in hand.
  const [openTools, setOpenTools] = useState<ToolId[]>(['saved']);
  const [lead, setLead] = useState<ToolId | null>('saved');
  const [folded, setFolded] = useState<Partial<Record<ToolId, boolean>>>({});
  const [tabOf, setTabOf] = useState<Partial<Record<ToolId, string>>>({});
  // A tab mounts when first shown and stays mounted (hidden) so its work is kept.
  const [shown, setShown] = useState<Record<string, true>>({});
  const [methodOpen, setMethodOpen] = useState(false);
  const [chartStatus, setChartStatus] = useState<ChartStatus>('idle');
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [sourceRevision, setSourceRevision] = useState<string | null>(null);
  // null = the member's own chart; otherwise a saved chart for another person.
  const [savedSubject, setSavedSubject] = useState<SavedChartSummary | null>(null);
  // The Soul Portrait panel, opened from the empty-chart box or the open chart's toolbar.
  const [portraitOpen, setPortraitOpen] = useState(false);
  // Sky at a member-chosen moment. Not private: it carries no birth data.
  // Up to two outer rings (biwheel / triwheel), one per source. A compared or
  // derived chart is fetched through the same owner-only routes.
  type RingKind = 'transits' | 'compare' | 'derived';
  // Bumped the first time Timing opens, so Transits arrives showing the sky now.
  const [transitRequest, setTransitRequest] = useState(0);
  const [rings, setRings] = useState<Array<{ kind: RingKind; bodies: TransitBody[]; label: string }>>([]);
  const ringOf = (kind: RingKind) => rings.find((r) => r.kind === kind)?.bodies ?? [];
  const transits = ringOf('transits');
  function setRing(kind: RingKind, bodies: TransitBody[], label: string | null) {
    setRings((current) => {
      const others = current.filter((r) => r.kind !== kind);
      return bodies.length && label ? [...others, { kind, bodies, label }].slice(-2) : others;
    });
  }
  const [declinations, setDeclinations] = useState<Declination[] | null>(null);
  const [chartPoints, setChartPoints] = useState<ChartPoints | null>(null);
  const [privateViewVerified, setPrivateViewVerified] = useState(false);
  // Working place in panels that unmount while access is re-checked; cleared with the chart.
  const [systemsWork, setSystemsWork] = useState<SystemsWork | null>(null);
  const privateVerificationEpoch = useRef(0);
  const [chartError, setChartError] = useState<string | null>(null);
  const [skyStatus, setSkyStatus] = useState<SkyStatus>('loading');
  const [sky, setSky] = useState<SkyPosition[]>([]);
  const [skyDate, setSkyDate] = useState<string | null>(null);
  const [focusedBody, setFocusedBody] = useState('Sun');
  const [mode, setMode] = useState<ViewingMode>('facts');
  const [showAspects, setShowAspects] = useState(true);
  const [aspectOrbFilter, setAspectOrbFilter] = useState<'all' | '1' | '3' | '5' | '8'>('all');
  const maxAspectOrb = aspectOrbFilter === 'all' ? null : Number(aspectOrbFilter);
  const [orbSettings, setOrbSettings] = useSavedOrbSettings();
  const [showHouseLines, setShowHouseLines] = useState(true);
  const [houseSystem, setHouseSystem] = useState<ProHouseSystem>('porphyry');
  // Each planet keeps its own unsaved draft; switching focus never attaches another planet's words.
  const [memberNotes, setMemberNotes] = useState<Record<string, string>>({});
  const chartRequestEpoch = useRef(0);
  const pendingShareEpoch = useRef(0);
  const [calculationQuality, setCalculationQuality] = useState<null | {
    profile: string; method: string; independentlyCertified: boolean;
    warnings: string[];
    housePlacementConvention?: string;
    lunarNodeMethod?: string;
    birthTimeSource?: string;
  }>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl('/api/astrology/current-transits'), { method: 'GET', cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Sky calculation unavailable');
        return res.json();
      })
      .then((body) => {
        if (controller.signal.aborted) return;
        const positions = Array.isArray(body?.data?.positions) ? body.data.positions : [];
        const result = positions.filter((p: any): p is SkyPosition =>
          typeof p?.planet === 'string' && typeof p?.sign === 'string' &&
          typeof p?.degree === 'number' && Number.isFinite(p.degree) && p.degree >= 0 && p.degree < 30
        );
        setSky(result);
        setSkyDate(typeof body.calculatedAt === 'string' ? body.calculatedAt : null);
        setSkyStatus('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setSkyStatus('unavailable'); });
    return () => controller.abort();
  }, []);

  function closePrivateChart(reason: 'idle' | 'signed-out' | 'unavailable' = 'idle') {
    // Invalidate any in-flight reply before changing the visible subject.
    chartRequestEpoch.current += 1;
    privateVerificationEpoch.current += 1;
    pendingShareEpoch.current += 1;
    setPrivateViewVerified(false);
    setChart(null);
    setMemberId(null);
    setSourceRevision(null);
    setSavedSubject(null);
    setRings([]);
    setMemberNotes({});
    setCalculationQuality(null);
    setSystemsWork(null);
    setPortraitOpen(false);
    setChartStatus(reason);
  }

  // A backgrounded/blurring tab must not keep a private chart mounted in
  // the visible/accessibility DOM while revocation or source checks are pending.
  // This masks, rather than deletes, ephemeral notes until re-verification;
  // any mismatch/refusal clears both chart and notes through closePrivateChart.
  useEffect(() => {
    if (!memberId || sourceRevision === null) return;
    let active = true;
    const mask = () => {
      privateVerificationEpoch.current += 1;
      setPrivateViewVerified(false);
    };
    // A check while the chart is showing leaves it showing: only a failed check
    // closes it. Blur and hidden tabs still mask it at once (above).
    const verify = async () => {
      const requestEpoch = ++privateVerificationEpoch.current;
      try {
        // A saved chart re-verifies that it still exists for this member; the
        // member's own chart re-verifies its birth-data revision.
        const savedId = sourceRevision.startsWith('saved:') ? sourceRevision.slice(6) : null;
        const reply = await apiFetch(savedId
          ? '/api/astrology/pro/charts/' + encodeURIComponent(savedId)
          : '/api/astrology/pro/my-chart', {
          method: 'GET', cache: 'no-store',
        });
        if (!active || requestEpoch !== privateVerificationEpoch.current) return;
        if (!reply.ok) {
          closePrivateChart(reply.status === 401 ? 'signed-out' : 'unavailable');
          if (savedId && reply.status === 404)
            setChartError('This chart is no longer in your saved charts, so it was closed.');
          else if (reply.status !== 401)
            setChartError('Chart access could not be verified. Reopen it when your account is available.');
          return;
        }
        const result = await reply.json();
        if (!active || requestEpoch !== privateVerificationEpoch.current) return;
        if (result.memberId !== memberId) {
          closePrivateChart('signed-out');
          return;
        }
        if (savedId ? result.chartId !== savedId : result.sourceRevision !== sourceRevision) {
          closePrivateChart('unavailable');
          setChartError('Your saved birth details changed. The older chart was closed; reopen your chart to calculate the current version.');
          return;
        }
        // Successful verification is necessary, and an actually visible tab
        // is separately necessary, before chart content can remount.
        if (document.visibilityState === 'visible') setPrivateViewVerified(true);
      } catch {
        if (active && requestEpoch === privateVerificationEpoch.current)
          closePrivateChart('unavailable');
      }
    };
    const whenVisible = () => {
      if (document.visibilityState !== 'visible') mask();
      else void verify();
    };
    const whenFocus = () => {
      if (document.visibilityState === 'visible') void verify();
    };
    const whenBlur = () => mask();
    const whenPageHide = () => closePrivateChart();
    document.addEventListener('visibilitychange', whenVisible);
    window.addEventListener('focus', whenFocus);
    window.addEventListener('blur', whenBlur);
    window.addEventListener('pagehide', whenPageHide);
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void verify();
      else mask();
    }, 60_000);
    return () => {
      active = false;
      privateVerificationEpoch.current += 1;
      document.removeEventListener('visibilitychange', whenVisible);
      window.removeEventListener('focus', whenFocus);
      window.removeEventListener('blur', whenBlur);
      window.removeEventListener('pagehide', whenPageHide);
      window.clearInterval(interval);
    };
  }, [memberId, sourceRevision]);

  async function loadMyChart() {
    if (chartStatus === 'loading') return;
    const epoch = ++chartRequestEpoch.current;
    pendingShareEpoch.current += 1;
    setChartError(null);
    setChartStatus('loading');
    setPrivateViewVerified(false);
    setChart(null);
    setMemberNotes({});
    setCalculationQuality(null);
    setMemberId(null);
    setSourceRevision(null);
    setSavedSubject(null);
    try {
      // The server loads ONLY the authenticated member's opted-in chart data.
      // No birth record, personal time, location or claimed member ID is sent
      // in this request or written into browser storage by the preview.
      const reply = await apiFetch('/api/astrology/pro/my-chart?houseSystem=' + encodeURIComponent(houseSystem), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: '{}', cache: 'no-store',
      });
      if (epoch !== chartRequestEpoch.current) return;
      if (!reply.ok) {
        const failure = await reply.json().catch(() => ({}));
        if (epoch !== chartRequestEpoch.current) return;
        if (reply.status === 401) setChartStatus('signed-out');
        else if (reply.status === 403 && failure.error === 'astrology_consent_required') {
          setChartStatus('consent-required');
        } else if (reply.status === 409 && failure.error === 'chart_source_changed') {
          // The server refused a chart built from an obsolete member-owned
          // source. Do not display a stale chart or preserve prepared MAIA text.
          // This remains a member-initiated retry, never an automatic reload.
          setChartStatus('unavailable');
          setChartError('Your saved birth details changed during calculation. Reopen your chart to use the current details; the older chart was not shown.');
        } else if (reply.status === 422) {
          setChartStatus('incomplete');
          setChartError(failure.error === 'TIME_HISTORICAL_OFFSET_PRECISION_UNVERIFIED'
            ? 'Historical timezone offsets may include seconds. This chart cannot be calculated as precision-verified yet; review the birth-time source and historical time standard.'
            : 'Your stored birth information needs clarification before a precise chart can be calculated.');
        } else throw new Error('member_chart_unavailable');
        return;
      }
      const result = await reply.json();
      if (epoch !== chartRequestEpoch.current) return;
      if (!hasValidChartGeometry(result?.data) ||
          typeof result.memberId !== 'string' || !result.memberId ||
          typeof result.sourceRevision !== 'string' ||
          !/^(0|[1-9][0-9]*)$/.test(result.sourceRevision)) {
        throw new Error('chart_geometry_or_identity_unverified');
      }
      setSourceRevision(result.sourceRevision);
      setMemberId(result.memberId);
      setCalculationQuality(result.calculationQuality || null);
      setChart(result.data);
      setDeclinations(Array.isArray(result.declinations) ? result.declinations : null);
      setChartPoints(result.points && typeof result.points === 'object' ? result.points : null);
      setPrivateViewVerified(document.visibilityState === 'visible');
      setFocusedBody('Sun');
      setChartStatus('ready');
      openTool('chart');
    } catch {
      if (epoch !== chartRequestEpoch.current) return;
      setChartError('Chart unavailable: verify the member session or select an authorized chart.');
      setChartStatus('unavailable');
    }
  }

  async function loadSavedChart(saved: SavedChartSummary) {
    if (chartStatus === 'loading') return;
    const epoch = ++chartRequestEpoch.current;
    pendingShareEpoch.current += 1;
    setChartError(null);
    setChartStatus('loading');
    setPrivateViewVerified(false);
    setChart(null);
    setMemberNotes({});
    setCalculationQuality(null);
    setMemberId(null);
    setSourceRevision(null);
    setSavedSubject(null);
    try {
      // Only the chart id travels; the server reads the stored birth details
      // for the verified owner and recalculates.
      const reply = await apiFetch('/api/astrology/pro/charts/' + encodeURIComponent(saved.id) +
        '?houseSystem=' + encodeURIComponent(houseSystem), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: '{}', cache: 'no-store',
      });
      if (epoch !== chartRequestEpoch.current) return;
      if (!reply.ok) {
        const failure = await reply.json().catch(() => ({}));
        if (epoch !== chartRequestEpoch.current) return;
        if (reply.status === 401) setChartStatus('signed-out');
        else {
          setChartStatus('unavailable');
          setChartError(reply.status === 404
            ? 'That saved chart no longer exists.'
            : reply.status === 422
              ? 'This chart’s birth details cannot be calculated exactly. Delete it and enter the details again.'
              : failure.error === 'cross_origin_request_refused'
                ? 'The chart request was refused. Reload the page and try again.'
                : 'The chart is unavailable right now. Please try again.');
        }
        return;
      }
      const result = await reply.json();
      if (epoch !== chartRequestEpoch.current) return;
      if (!hasValidChartGeometry(result?.data) ||
          typeof result.memberId !== 'string' || !result.memberId ||
          result.chartId !== saved.id) {
        throw new Error('chart_geometry_or_identity_unverified');
      }
      setSavedSubject(saved);
      setSourceRevision('saved:' + saved.id);
      setMemberId(result.memberId);
      setCalculationQuality(result.calculationQuality || null);
      setChart(result.data);
      setDeclinations(Array.isArray(result.declinations) ? result.declinations : null);
      setChartPoints(result.points && typeof result.points === 'object' ? result.points : null);
      setPrivateViewVerified(document.visibilityState === 'visible');
      setFocusedBody('Sun');
      setChartStatus('ready');
      openTool('chart');
    } catch {
      if (epoch !== chartRequestEpoch.current) return;
      setChartError('The chart is unavailable right now. Please try again.');
      setChartStatus('unavailable');
    }
  }

  const privateChart = privateViewVerified ? chart : null;
  // The same chart with its aspects found under the astrologer's orbs.
  const orbChart = useMemo(() => privateChart ? withOrbSettings(privateChart, orbSettings) : null, [privateChart, orbSettings]);
  const bodies = useMemo(() => privateChart ? chartBodies(privateChart) : [], [privateChart]);
  const selected = bodies.find((body) => body.name === focusedBody) || bodies[0] || null;
  const relationships = useMemo(
    () => orbChart && selected ? selectedRelationships(orbChart, selected.name).filter(
      (aspect) => Number.isFinite(aspect.orb) && aspect.orb >= 0 &&
        (maxAspectOrb === null || aspect.orb <= maxAspectOrb),
    ) : [],
    [orbChart, selected, maxAspectOrb],
  );
  const geometricHouse = privateChart && selected
    ? geometricHouseFromCusps(selected.longitude, privateChart.houses) : null;
  const selectedSky = useMemo(
    () => SKY_FOCUS.flatMap((planet) => sky.filter((s) => s.planet === planet)).slice(0, 7),
    [sky],
  );

  function selectBody(name: string) {
    pendingShareEpoch.current += 1;
    setFocusedBody(name);
    setMode('facts');
    // Selecting a point brings its figures up beside the wheel.
    openTool('chart', 'point');
  }

  function openTool(id: ToolId, tab?: string) {
    // One tool in hand: the others stay on the desk, folded to their header bars.
    setOpenTools((current) => [id, ...current.filter((t) => t !== id)]);
    setFolded((current) => {
      const next: Partial<Record<ToolId, boolean>> = {};
      for (const t of [id, ...openTools]) next[t] = t !== id;
      return { ...current, ...next };
    });
    if (tab) setTabOf((current) => ({ ...current, [id]: tab }));
    setLead(id);
    if (id === 'timing' && !openTools.includes('timing')) setTransitRequest((n) => n + 1);
    dock?.focus(null, false);
  }
  function closeTool(id: ToolId) {
    setOpenTools((current) => current.filter((t) => t !== id));
    setLead((current) => (current === id ? openTools.find((t) => t !== id) ?? null : current));
  }
  function toggleTool(id: ToolId) {
    if (openTools.includes(id)) closeTool(id);
    else openTool(id);
  }

  // R4G legacy bypass closure: the previous GET consent check was not an
  // R4F transfer receipt. Never mount MAIA or transmit a prepared chart here.
  // A future approved transfer must be bound to the receiving server route.


  // Panels keep their place for this member, chart revision and house system only.
  const panelScope = memberId && sourceRevision ? `${memberId}|${sourceRevision}|${houseSystem}` : null;

  const subjectId = savedSubject ? savedSubject.id : 'own';
  const chartLabel = savedSubject ? savedSubject.label : 'my chart';
  const readsWhose = savedSubject ? `${savedSubject.label}’s chart` : 'your chart';
  const systemsTab = systemsWork?.tab ?? 'vedic';

  const pointPanel = () => selected && (
    <div className={cockpit.point}>
      <div className={styles.lensTabs} role="tablist" aria-label="Ways of relating to this point">
        <button role="tab" aria-selected={mode === 'facts'} onClick={() => setMode('facts')}>Calculated</button>
        <button role="tab" aria-selected={mode === 'questions'} onClick={() => setMode('questions')}>Explore</button>
        <button role="tab" aria-selected={mode === 'meaning'} onClick={() => setMode('meaning')}>My notes</button>
      </div>
      <div role="tabpanel">
        {mode === 'facts' && (
          <>
            <div className={styles.factEmphasis}><span aria-hidden="true">{selected.glyph}</span>
              <div><small>{selected.name.toUpperCase()}</small><strong>{selected.position.sign} · {selected.position.degree.toFixed(2)}°</strong><p>House {selected.position.house}</p></div>
            </div>
            {geometricHouse !== null && geometricHouse !== selected.position.house && (
              <p className={styles.sourceLabel} role="note">
                Exact geometric membership: house {geometricHouse}. House {selected.position.house} here reflects the separate 5° pre-angular-cusp convention. Planet longitude is unchanged.
              </p>
            )}
            {(selected.name === 'North Node' || selected.name === 'South Node') && (
              <p className={styles.sourceLabel} role="note">
                Approximate mean lunar node; not an independently verified true-node calculation.
              </p>
            )}
            {selected.position.motionStatus && selected.name !== 'Sun' && selected.name !== 'Moon' && (
              <p className={styles.sourceLabel} role={selected.position.motionStatus === 'stationary-uncertain' ? 'status' : undefined}>
                Apparent motion: {motionLabel(selected)}. Close-to-station direction is provisional, not independently certified.
              </p>
            )}
            <h4 className={cockpit.subhead}>Aspects to {selected.name}</h4>
            {relationships.length ? (
              <div className={styles.aspectList}>
                {relationships.slice(0, 8).map((aspect, index) => (
                  <div key={index}><span>{aspect.planet1} {aspect.type} {aspect.planet2}</span><b>{aspect.orb.toFixed(2)}°</b></div>
                ))}
              </div>
            ) : <p>No reported aspects meet the current display filter for this point.</p>}
          </>
        )}
        {mode === 'questions' && (
          <>
            <p className={styles.inquiryPrompt}>{INQUIRY[selected.name] || 'What possibilities might this symbol open without defining who you are?'}</p>
            <p>Different astrological schools may offer distinct, sometimes contradictory meanings. The astrologer and the person choose which, if any, are illuminating.</p>
          </>
        )}
        {mode === 'meaning' && (
          <>
            <label className={styles.noteLabel} htmlFor="astrology-member-meaning">My notes on {selected.name}</label>
            <textarea id="astrology-member-meaning" className={cockpit.notes} value={memberNotes[focusedBody] || ''}
              onChange={(event) => {
                const value = event.target.value;
                pendingShareEpoch.current += 1;
                setMemberNotes((prev) => ({ ...prev, [focusedBody]: value }));
              }}
              rows={6} maxLength={1400}
              placeholder="I notice… / I disagree… / I want to explore…" />
            <p className={styles.sourceLabel}>Kept in this page while the chart is open. Not saved, and not sent to MAIA.</p>
          </>
        )}
      </div>
    </div>
  );

  const tools: Tool[] = [
    { id: 'chart', label: 'Chart', icon: CircleDot, tabs: [
      { id: 'point', label: selected ? selected.name : 'Point', view: 'point', render: pointPanel },
      { id: 'aspects', label: 'Aspects', view: 'aspects',
        render: () => privateChart && <ProAspectGrid chart={orbChart ?? privateChart} declinations={declinations} onSelectBody={selectBody} /> },
      { id: 'views', label: 'Views', view: 'chart-views',
        render: () => privateChart && <ProChartViews chart={privateChart} points={chartPoints} /> },
      { id: 'houses', label: 'Houses', view: 'house-wheel',
        render: () => privateChart && <ProHouseWheel chart={orbChart ?? privateChart} /> },
    ] },
    { id: 'timing', label: 'Timing', icon: Clock, tabs: [
      { id: 'transits', label: 'Transits', prefer: ['transits'],
        render: () => <ProTransitPanel natalBodies={bodies} transits={transits} showNowRequest={transitRequest}
          onTransits={(next) => setRing('transits', next, 'Transits')}
          ask={{ subject: subjectId, houseSystem, readsWhose }} /> },
      { id: 'progress', label: 'Progressions', prefer: ['progressed'],
        render: () => <ProDerivedPanel subjectId={subjectId} chartLabel={chartLabel} houseSystem={houseSystem}
          onOuter={(next, label) => setRing('derived', next, label)} /> },
      { id: 'ephemeris', label: 'Ephemeris', view: 'ephemeris', render: () => <ProEphemerisPanel natalBodies={bodies} /> },
    ] },
    { id: 'relationships', label: 'Relationships', icon: Users, tabs: [
      { id: 'compare', label: 'Two charts', prefer: ['biwheel', 'composite'],
        render: () => privateChart && <ProComparePanel chart={privateChart} chartLabel={chartLabel}
          currentSubjectId={subjectId} houseSystem={houseSystem}
          natalBodies={bodies} outer={ringOf('compare')}
          onOuter={(next, label) => setRing('compare', next, label)} /> },
      { id: 'own', label: 'Questions', view: 'relationships',
        render: () => <ProRelationshipsWorkbench chart={savedSubject ? null : privateChart} /> },
    ] },
    { id: 'places', label: 'Places', icon: MapPin, tabs: [
      { id: 'map', label: 'Astro map', view: 'astro-map',
        render: () => <ProAstroMapPanel subjectId={subjectId} chartLabel={chartLabel} houseSystem={houseSystem} /> },
    ] },
    { id: 'traditions', label: 'Traditions', icon: Globe2, tabs: [
      { id: 'systems', label: 'Vedic · Chinese · Mayan',
        view: systemsTab === 'chinese' ? undefined : systemsTab, prefer: systemsTab === 'chinese' ? ['four-pillars'] : [],
        render: () => <ProSystemsPanel subjectId={subjectId} chartLabel={chartLabel} work={systemsWork} onWork={setSystemsWork} /> },
    ] },
    { id: 'readings', label: 'Readings', icon: BookOpen, tabs: [
      { id: 'deep', label: 'Deep reading',
        render: () => <ProDeepReadingPanel subject={subjectId} houseSystem={houseSystem} readsWhose={readsWhose} /> },
      { id: 'portrait', label: 'Soul Portrait', view: 'soul-portrait', withoutChart: true,
        render: () => <ProSoulPortraitPanel source={savedSubject ? savedSubject.id : 'mine'}
          label={savedSubject ? savedSubject.label : ''}
          chartLine={savedSubject
            ? `${savedSubject.label} · ${savedSubject.birthDate} · ${savedSubject.birthTime}${savedSubject.placeLabel ? ` · ${savedSubject.placeLabel}` : ''}`
            : "Your own chart, from your account's birth details"}
          birthDate={savedSubject?.birthDate} onClose={() => closeTool('readings')} /> },
      { id: 'tradition', label: 'Tradition report', view: 'tradition-report',
        render: () => privateChart && <ProTraditionReport chart={orbChart ?? privateChart} chartLabel={chartLabel} questions={INQUIRY} /> },
    ] },
    { id: 'research', label: 'Research', icon: FlaskConical, tabs: [
      { id: 'research', label: 'Research', view: 'research', render: () => <ProResearchWorkbench chart={privateChart} /> },
    ] },
    { id: 'study', label: 'Study', icon: GraduationCap, tabs: [
      { id: 'study', label: 'Study', view: 'study', render: () => <ProStudyWorkbench chart={privateChart} /> },
    ] },
    { id: 'saved', label: 'Saved charts', icon: Bookmark, tabs: [
      { id: 'saved', label: 'Saved charts', withoutChart: true,
        render: () => <ProSavedCharts
          openChartId={savedSubject?.id ?? null}
          opening={chartStatus === 'loading'}
          onOpen={(saved) => void loadSavedChart(saved)}
          onDeleted={(chartId) => { if (savedSubject?.id === chartId) closePrivateChart(); }} /> },
    ] },
  ];
  const activeTab = (tool: Tool): ToolTab => tool.tabs.find((t) => t.id === tabOf[tool.id]) ?? tool.tabs[0];

  // What the astrologer has in hand, for MAIA: the lead tool's open tab, or the wheel.
  const leadTool = privateChart && lead && openTools.includes(lead) && !folded[lead]
    ? tools.find((t) => t.id === lead) ?? null : null;
  const leadTab = leadTool ? activeTab(leadTool) : null;
  const leadView: ProAskView | undefined = leadTab ? leadTab.view : 'wheel';
  const natalRequest = {
    section: 'natal' as const, subject: subjectId, houseSystem,
    ...(leadView ? { view: leadView } : {}),
    ...(selected && (leadView === 'wheel' || leadView === 'point') ? { point: selected.name } : {}),
  };
  useMaiaSubject(privateChart ? {
    key: askKey(natalRequest), request: natalRequest, readsWhose,
    subjectLabel: savedSubject ? `${savedSubject.label}’s natal chart` : 'your natal chart',
  } : null);

  // Mark a tab as shown once it is first on screen, so it mounts then and stays.
  const onScreen = openTools.filter((id) => !folded[id])
    .map((id) => { const tool = tools.find((t) => t.id === id)!; return `${id}.${activeTab(tool).id}`; });
  const onScreenKey = onScreen.join('|');
  useEffect(() => {
    setShown((current) => {
      const missing = onScreen.filter((k) => !current[k]);
      if (!missing.length) return current;
      const next = { ...current };
      for (const k of missing) next[k] = true;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScreenKey]);
  // A closed chart forgets which instruments had been opened for it.
  useEffect(() => { if (!panelScope) setShown({}); }, [panelScope]);

  // Keys: 1–9 open or close a tool, M shows or hides MAIA. Never while typing.
  const toggleRef = useRef<(key: string) => void>(() => {});
  toggleRef.current = (key: string) => {
    if (key === 'm' || key === 'M') { dock?.setOpen(!dock.open); return; }
    const tool = tools[Number(key) - 1];
    if (tool) toggleTool(tool.id);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || typingTarget(event.target)) return;
      if (/^[1-9mM]$/.test(event.key)) { event.preventDefault(); toggleRef.current(event.key); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dockOpen = !!dock?.open;

  return (
    <PanelMemoryProvider scope={panelScope}>
    <main className={`${styles.studio} ${cockpit.cockpit}`} id="astrology-pro-preview">
      <header className={cockpit.statusBar}>
        <Link href="/astrology" className={cockpit.brand} aria-label="Return to Soullab Astrology">
          <span aria-hidden="true">✧</span> <b>Astrology Pro</b>
        </Link>

        <div className={cockpit.identity}>
          <h1 id="studio-title">{privateChart ? (savedSubject ? savedSubject.label : 'My chart') : 'No chart open'}</h1>
          <label htmlFor="pro-house-system" className={cockpit.field}>
            <span>Houses</span>
            <select id="pro-house-system" value={houseSystem}
              title="Changing the house system closes the open chart and its unsaved notes"
              onChange={(event) => {
                const next = event.target.value as ProHouseSystem;
                if (next === houseSystem) return;
                closePrivateChart();
                setHouseSystem(next);
                setChartError(null);
              }}>
              <option value="porphyry">Porphyry</option>
              <option value="whole-sign">Whole Sign</option>
              <option value="equal">Equal</option>
              <option value="placidus">Placidus</option>
              <option value="koch">Koch</option>
            </select>
          </label>
          {privateChart && (
            <>
              <button type="button" className={cockpit.iconButton} aria-expanded={methodOpen}
                aria-label="Calculation method and limits" title="Calculation method and limits"
                onClick={() => setMethodOpen((o) => !o)}>
                <Info size={17} aria-hidden="true" />
              </button>
              <button type="button" className={cockpit.quiet} onClick={() => closePrivateChart()}>Close chart</button>
            </>
          )}
        </div>

        <div className={cockpit.sky} aria-label="The sky now">
          {skyStatus === 'loading' && <span role="status">Calculating the sky…</span>}
          {skyStatus === 'unavailable' && <span role="status">Current sky unavailable</span>}
          {skyStatus === 'ready' && selectedSky.map((body) => (
            <span key={body.planet} className={cockpit.skyBody}
              title={body.motionStatus === 'stationary-uncertain' ? 'Near station · direction uncertain' : body.motionStatus === 'not-evaluated' ? 'Apparent motion not verified' : undefined}>
              <small>{body.planet}</small> {body.sign.slice(0, 3)} {body.degree.toFixed(0)}°{body.motionStatus === 'retrograde' ? ' ℞' : ''}
            </span>
          ))}
          {skyStatus === 'ready' && skyDate && (
            <small className={cockpit.skyAt}>Sky at {new Date(skyDate).toLocaleTimeString([], { timeStyle: 'short' })}</small>
          )}
        </div>

        <span className={cockpit.flag}>Private preview</span>
        {!dockOpen && (
          <button type="button" className={cockpit.maiaToggle} onClick={() => dock?.setOpen(true)} title="Show MAIA (M)">
            <PanelRightOpen size={16} aria-hidden="true" /> MAIA
          </button>
        )}
      </header>

      {methodOpen && privateChart && (
        <section className={cockpit.method} aria-label="Calculation method and limits">
          <p>Calculated using {calculationQuality?.method || 'a declared'} house method. Professional certification remains pending. Near-station motion is labelled uncertain rather than forced into direct or retrograde. Minor-body positions and motion are provisional.</p>
          <p>The displayed house uses a 5° pre-angular-cusp convention where applicable; geometric membership is distinct. Lunar nodes are approximate mean positions, not certified true nodes.</p>
          <p>The source and accuracy of the stored birth time have not been established by this service. A time written to the minute is not automatically accurate to the minute.</p>
          <p>Orbs decide which aspects are found from the calculated positions; the max orb setting then filters them for display. Neither determines applying or separating phase.</p>
          <p>These are astronomical and interpretive method disclosures, not predictions about the person. Symbolism is not evidence of destiny.</p>
          <button type="button" className={cockpit.quiet} onClick={() => setMethodOpen(false)}>Close</button>
        </section>
      )}

      <div className={cockpit.body} data-dock={dockOpen ? 'open' : 'closed'}>
        <nav className={cockpit.rail} aria-label="Tools">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const on = openTools.includes(tool.id);
            return (
              <button key={tool.id} type="button" aria-pressed={on} className={on ? cockpit.railOn : undefined}
                title={`${tool.label} (${index + 1})`} onClick={() => toggleTool(tool.id)}>
                <Icon size={20} aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </nav>

        <section id="the-chart" className={cockpit.stage} aria-labelledby="studio-title">
          {privateChart ? (
            <>
              <div className={cockpit.layers} aria-label="Chart layers">
                <button aria-pressed={showAspects} onClick={() => setShowAspects((s) => !s)}>
                  {showAspects ? <Eye size={15} /> : <EyeOff size={15} />} Aspects
                </button>
                <button aria-pressed={showHouseLines} onClick={() => setShowHouseLines((s) => !s)}>
                  <Orbit size={15} /> Houses
                </button>
                <label className={cockpit.field} htmlFor="pro-aspect-orb">
                  <span>Max orb</span>
                  <select id="pro-aspect-orb" value={aspectOrbFilter}
                    onChange={(event) => {
                      const choice = event.target.value;
                      if (choice === 'all' || choice === '1' || choice === '3' ||
                          choice === '5' || choice === '8') setAspectOrbFilter(choice);
                    }}>
                    <option value="all">All</option>
                    <option value="1">1°</option>
                    <option value="3">3°</option>
                    <option value="5">5°</option>
                    <option value="8">8°</option>
                  </select>
                </label>
                <ProOrbSettings settings={orbSettings} onChange={setOrbSettings} />
              </div>
              <CelestialChartWheel chart={orbChart ?? privateChart} focusedBody={focusedBody} onFocusBody={selectBody}
                showAspects={showAspects} showHouseLines={showHouseLines}
                maxAspectOrb={maxAspectOrb} outerBodies={rings[0]?.bodies} outerLabel={rings[0]?.label}
                outerBodies2={rings[1]?.bodies} outerLabel2={rings[1]?.label} />
              <div className={cockpit.bodies} aria-label="Planet selector">
                {bodies.map((body) => (
                  <button key={body.name} className={body.name === focusedBody ? cockpit.bodyOn : undefined}
                    title={formatBody(body)}
                    onClick={() => selectBody(body.name)} aria-pressed={body.name === focusedBody}>
                    <span aria-hidden="true">{body.glyph}</span>{body.name}
                  </button>
                ))}
              </div>
            </>
          ) : chart ? (
            <div className={cockpit.invitation} role="status" aria-live="polite">
              <h2>Verifying private chart access…</h2>
              <p>Your chart and notes are hidden until your member session and saved chart revision have been checked.</p>
              <button className={cockpit.quiet} onClick={() => closePrivateChart()}>Close chart</button>
            </div>
          ) : (
            <div className={cockpit.invitation}>
              <div className={cockpit.emptyRing} aria-hidden="true">✧</div>
              <h2>Open a chart to begin</h2>
              <p>Your own chart is calculated from the birth details held by your signed-in account. A client’s chart opens from Saved charts.</p>
              <div className={cockpit.invitationActions}>
                <button className={styles.primaryAction} onClick={loadMyChart} disabled={chartStatus === 'loading'}>
                  {chartStatus === 'loading' ? 'Opening your chart…' : 'Open my chart'} <ChevronRight size={18} aria-hidden="true" />
                </button>
                <button type="button" className={cockpit.quiet} onClick={() => openTool('saved')}>Saved charts</button>
              </div>
              <p><Link href="/account/settings">Edit my birth details</Link> · {HOUSE_SYSTEM_NAMES[houseSystem]} houses</p>
              {chartStatus === 'signed-out' && <p role="status">Your member session needs verification. Please sign in again before opening your chart. <Link href="/signin">Sign in</Link></p>}
              {chartStatus === 'consent-required' && <p role="status">Astrology access is not opted in for this account. Review your Astrology consent settings before opening your chart.</p>}
              {chartStatus === 'incomplete' && <p role="status">{chartError || 'Your exact birth date, time, timezone or location needs clarification before strict-core calculation.'} <Link href="/astrology">Review chart details</Link>.</p>}
              {chartStatus === 'unavailable' && <p role="alert">{chartError}</p>}
            </div>
          )}
        </section>

        <section className={cockpit.deck} aria-label="Open tools">
          {openTools.length === 0 && (
            <p className={cockpit.deckEmpty}>No tools open. Choose one from the rail, or press 1–9.</p>
          )}
          {openTools.map((id) => {
            const tool = tools.find((t) => t.id === id)!;
            const Icon = tool.icon;
            const tab = activeTab(tool);
            const isFolded = !!folded[id];
            return (
              <article key={id} className={`${cockpit.tool} ${lead === id ? cockpit.toolLead : ''} ${isFolded ? cockpit.toolFolded : ''}`} aria-label={tool.label}
                onPointerDownCapture={() => { if (lead !== id) { setLead(id); dock?.focus(null, false); } }}>
                <header className={cockpit.toolHead}
                  onClick={isFolded ? (event) => { if (!(event.target as HTMLElement).closest('button')) openTool(id); } : undefined}>
                  <Icon size={17} aria-hidden="true" />
                  <h2>{tool.label}</h2>
                  {tool.tabs.length > 1 && !isFolded && (
                    <div className={cockpit.tabs} role="tablist" aria-label={`${tool.label} views`}>
                      {tool.tabs.map((t) => (
                        <button key={t.id} type="button" role="tab" aria-selected={t.id === tab.id}
                          onClick={() => { setTabOf((current) => ({ ...current, [id]: t.id })); dock?.focus(null, false); }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className={cockpit.toolActions}>
                    {privateChart && (
                      <button type="button" className={cockpit.iconButton} aria-label={`Ask MAIA about ${tool.label}`} title="Ask MAIA about this"
                        onClick={() => { openTool(id); dock?.focus(null); }}>
                        <Sparkles size={16} aria-hidden="true" />
                      </button>
                    )}
                    <button type="button" className={cockpit.iconButton} aria-expanded={!isFolded}
                      aria-label={isFolded ? `Expand ${tool.label}` : `Collapse ${tool.label}`}
                      onClick={() => (isFolded ? openTool(id) : setFolded((c) => ({ ...c, [id]: true })))}>
                      {isFolded ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronUp size={16} aria-hidden="true" />}
                    </button>
                    <button type="button" className={cockpit.iconButton} aria-label={`Close ${tool.label}`} onClick={() => closeTool(id)}>
                      <X size={16} aria-hidden="true" />
                    </button>
                  </span>
                </header>
                {tool.tabs.map((t) => {
                  const visible = !isFolded && t.id === tab.id;
                  const usable = !!privateChart || !!t.withoutChart;
                  if (!usable) {
                    return visible ? (
                      <p key={t.id} className={cockpit.needsChart}>
                        Open a chart to use {t.label === tool.label ? tool.label : `${tool.label} · ${t.label}`}.
                      </p>
                    ) : null;
                  }
                  if (!visible && !shown[`${id}.${t.id}`]) return null;
                  return (
                    <div key={t.id} role={tool.tabs.length > 1 ? 'tabpanel' : undefined} hidden={!visible} className={cockpit.toolBody}>
                      {t.render()}
                    </div>
                  );
                })}
              </article>
            );
          })}
        </section>

        <ProMaiaDock chartOpen={!!privateChart}
          whereLabel={leadTab ? (leadTab.label === leadTool?.label ? leadTab.label : `${leadTool?.label} · ${leadTab.label}`) : privateChart ? 'the chart wheel' : null}
          preferSections={leadTab?.prefer ?? []} />
      </div>
    </main>
    </PanelMemoryProvider>
  );
}
