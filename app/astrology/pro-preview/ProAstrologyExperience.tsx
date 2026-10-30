'use client';

/**
 * ASTRO-PRO-03 — member-sovereign, chart-first experience candidate.
 * No billing, client records, developmental scoring, auto-interpretation,
 * persistence of member notes, or MAIA runtime modifications.
 *
 * Chart loading is an explicit member act. A dedicated owner-scoped server
 * route resolves the verified session and approved birth data privately; no
 * client-supplied third-party birth record or member ID is accepted.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Compass, BookOpen, Orbit, MessageCircle, Eye, EyeOff, ChevronRight, RotateCcw, ShieldCheck, Sparkles, CircleHelp, Share2 } from 'lucide-react';
import type { BirthChart } from '@/lib/astrology/proEphemerisCalculator';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';
import { chartBodies, hasValidChartGeometry, selectedRelationships, geometricHouseFromCusps, type WheelBody } from '@/lib/astrology/proChartGeometry';
import { CelestialChartWheel } from './CelestialChartWheel';
import ProResearchWorkbench from './ProResearchWorkbench';
import ProStudyWorkbench from './ProStudyWorkbench';
import ProRelationshipsWorkbench from './ProRelationshipsWorkbench';
import styles from './astrology-pro-preview.module.css';

type ChartStatus = 'idle' | 'loading' | 'ready' | 'signed-out' | 'consent-required' | 'incomplete' | 'unavailable';
type ViewingMode = 'facts' | 'questions' | 'meaning';
type ProHouseSystem = 'porphyry' | 'whole-sign' | 'equal';
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

function prepareMemberHandoff(chart: BirthChart, selected: WheelBody, note: string): string {
  const aspects = selectedRelationships(chart, selected.name).slice(0, 5);
  const report = [
    'I am explicitly choosing to bring these selected chart facts into our Astrology conversation.',
    'Please use a relational, whole-chart lens: calculated astronomy is not a description of my identity, and symbolic tradition is not evidence of destiny.',
    'Selected point: ' + formatBody(selected),
    ...(selected.position.motionStatus === 'stationary-uncertain'
      ? ['Near-station motion is uncertain. Do not describe the selected body as definitively direct or retrograde, even if older chart data carries a boolean flag.']
      : []),
    'Whole-chart anchors: Sun ' + chart.sun.sign + ' ' + chart.sun.degree.toFixed(2) + '°, Moon ' +
      chart.moon.sign + ' ' + chart.moon.degree.toFixed(2) + '°, Ascendant ' +
      chart.ascendant.sign + ' ' + chart.ascendant.degree.toFixed(2) + '°.',
    aspects.length
      ? 'Calculator-reported relationships: ' + aspects.map((a) =>
        a.planet1 + ' ' + a.type + ' ' + a.planet2 + ' (orb ' + a.orb.toFixed(2) + '°)').join('; ')
      : 'No relationships are selected from the reported aspect list.',
    note.trim()
      ? 'My own question or observation (not a statement by the model): ' + note.trim()
      : 'My question: What different ways could I explore the symbolism of this configuration?',
    'Please make space for multiple perspectives, ask what I recognize, and revise if I disagree. Do not assign me a developmental stage or predict my fate.',
  ];
  return report.join('\n\n');
}

export default function ProAstrologyExperience() {
  const [chartStatus, setChartStatus] = useState<ChartStatus>('idle');
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [sourceRevision, setSourceRevision] = useState<string | null>(null);
  const [privateViewVerified, setPrivateViewVerified] = useState(false);
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
  const [showHouseLines, setShowHouseLines] = useState(true);
  const [houseSystem, setHouseSystem] = useState<ProHouseSystem>('porphyry');
  // Each planet keeps its own unsaved draft; switching focus never attaches another planet's words.
  const [memberNotes, setMemberNotes] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<string | null>(null);
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
    setMemberNotes({});
    setCalculationQuality(null);
    setDraft(null);
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
    const verify = async () => {
      const requestEpoch = ++privateVerificationEpoch.current;
      setPrivateViewVerified(false);
      try {
        const reply = await apiFetch('/api/astrology/pro/my-chart', {
          method: 'GET', cache: 'no-store',
        });
        if (!active || requestEpoch !== privateVerificationEpoch.current) return;
        if (!reply.ok) {
          closePrivateChart(reply.status === 401 ? 'signed-out' : 'unavailable');
          if (reply.status !== 401)
            setChartError('Chart access could not be verified. Reopen it when your account is available.');
          return;
        }
        const result = await reply.json();
        if (!active || requestEpoch !== privateVerificationEpoch.current) return;
        if (result.memberId !== memberId) {
          closePrivateChart('signed-out');
          return;
        }
        if (result.sourceRevision !== sourceRevision) {
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
    setDraft(null);
    setMemberId(null);
    setSourceRevision(null);
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
      setPrivateViewVerified(document.visibilityState === 'visible');
      setFocusedBody('Sun');
      setChartStatus('ready');
    } catch {
      if (epoch !== chartRequestEpoch.current) return;
      setChartError('Chart unavailable: verify the member session or select an authorized chart.');
      setChartStatus('unavailable');
    }
  }

  const privateChart = privateViewVerified ? chart : null;
  const bodies = useMemo(() => privateChart ? chartBodies(privateChart) : [], [privateChart]);
  const selected = bodies.find((body) => body.name === focusedBody) || bodies[0] || null;
  const relationships = useMemo(
    () => privateChart && selected ? selectedRelationships(privateChart, selected.name).filter(
      (aspect) => Number.isFinite(aspect.orb) && aspect.orb >= 0 &&
        (maxAspectOrb === null || aspect.orb <= maxAspectOrb),
    ) : [],
    [privateChart, selected, maxAspectOrb],
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
    setDraft(null);
    setMode('facts');
  }

  function preparePrivateDraft() {
    if (!privateChart || !selected || !memberId) return;
    pendingShareEpoch.current += 1;
    setDraft(prepareMemberHandoff(privateChart, selected, memberNotes[selected.name] || ''));
  }

  // R4G legacy bypass closure: the previous GET consent check was not an
  // R4F transfer receipt. Never mount MAIA or transmit a prepared chart here.
  // A future approved transfer must be bound to the receiving server route.


  return (
    <main className={styles.studio} id="astrology-pro-preview">
      <header className={styles.topbar}>
        <Link href="/astrology" className={styles.brand} aria-label="Return to Soullab Astrology">
          <span className={styles.brandMark}>✧</span>
          <span>SOULLAB <b>CELESTIAL OBSERVATORY</b></span>
        </Link>
        <nav className={styles.navigation} aria-label="Pro Astrology work areas">
          <a className={styles.navCurrent} href="#the-chart">Natal</a>
          <a href="#current-sky">Transits</a>
          <a href="#relationships">Relationships · own-chart</a>
          <a href="#research">Research</a>
          <a href="#study">Study</a>
        </nav>
        <div className={styles.previewFlag}>PROFESSIONAL WORKSPACE · PRIVATE PREVIEW</div>
      </header>

      <div className={styles.content}>
        <section className={styles.proToolbar} aria-label="Observatory instruments">
          <div className={styles.proToolbarIdentity}>
            <span className={styles.eyebrow}>CELESTIAL OBSERVATORY</span>
            <h1 id="studio-title">Chart Studio</h1>
            <p>Private natal instrument · current sky · member-led inquiry. Changing house method closes the chart and unsent notes.</p>
          </div>
          <div className={styles.proToolbarActions}>
            <label htmlFor="pro-house-system" className={styles.houseMethodControl}>
              House system
              <select id="pro-house-system" value={houseSystem}
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
              </select>
            </label>
            <a href="#the-chart">Natal wheel</a>
            <a href="#current-sky">Transits</a>
            <a href="#maia-mentor">MAIA Mentor · transfer held</a>
          </div>
        </section>

        <section id="current-sky" className={styles.skyStrip} aria-label="Current calculated sky">
          <div className={styles.skyIntro}>
            <span className={styles.eyebrow}>THE SKY NOW</span>
            <p>Our shared present</p>
            {skyDate && <small>Calculated {new Date(skyDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small>}
          </div>
          <div className={styles.skyPositions}>
            {skyStatus === 'loading' && <p role="status">Calculating the sky…</p>}
            {skyStatus === 'unavailable' && <p role="status">The current sky is unavailable. Your natal chart can still be explored.</p>}
            {skyStatus === 'ready' && selectedSky.length === 0 && <p role="status">No verified sky positions were returned.</p>}
            {skyStatus === 'ready' && selectedSky.map((body) => (
              <div className={styles.skyPlanet} key={body.planet}>
                <span>{body.planet}</span>
                <strong>{body.sign} {body.degree.toFixed(1)}°
                  {body.motionStatus === 'retrograde' ? ' ℞' : ''}
                </strong>
                {body.motionStatus === 'stationary-uncertain' && <small role="status">Near station · direction uncertain</small>}
                {body.motionStatus === 'not-evaluated' && <small>Apparent motion not verified</small>}
              </div>
            ))}
          </div>
          <p className={styles.skyNote}>Astronomical calculations, not predictions. Current-sky and natal-chart direction use the same provisional geocentric method; near-station movement is explicitly uncertain. Advanced bodies use approximations.</p>
        </section>

        <section id="the-chart" className={styles.chartRoom} aria-labelledby="chart-room-title">
          <div className={styles.chartColumn}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>THE CHART WORKBENCH</span>
                <h2 id="chart-room-title">Your celestial instrument</h2>
              </div>
              {privateChart && (
                <div className={styles.viewControls} aria-label="Chart layers">
                  <button aria-pressed={showAspects} onClick={() => setShowAspects((s) => !s)}>
                    {showAspects ? <Eye size={16} /> : <EyeOff size={16} />} Aspects
                  </button>
                  <button aria-pressed={showHouseLines} onClick={() => setShowHouseLines((s) => !s)}>
                    <Orbit size={16} /> Houses
                  </button>
                  <label className={styles.orbFilterControl} htmlFor="pro-aspect-orb">
                    Max aspect orb
                    <select id="pro-aspect-orb" value={aspectOrbFilter}
                      aria-describedby="pro-orb-filter-description"
                      onChange={(event) => {
                        const choice = event.target.value;
                        if (choice === 'all' || choice === '1' || choice === '3' ||
                            choice === '5' || choice === '8') setAspectOrbFilter(choice);
                      }}>
                      <option value="all">All reported</option>
                      <option value="1">1°</option>
                      <option value="3">3°</option>
                      <option value="5">5°</option>
                      <option value="8">8°</option>
                    </select>
                  </label>
                  <button onClick={() => closePrivateChart()}>Close my chart</button>
                </div>
              )}
            </div>

            {privateChart ? (
              <>
                <CelestialChartWheel chart={privateChart} focusedBody={focusedBody} onFocusBody={selectBody}
                  showAspects={showAspects} showHouseLines={showHouseLines}
                  maxAspectOrb={maxAspectOrb} />
                <p id="pro-orb-filter-description" className={styles.sourceLabel} role="note">
                  The orb setting filters existing reported aspects for display; it does not
                  recalculate their accuracy or determine applying/separating phase.
                  Unverified aspect values are excluded from the diagram.
                </p>
                <div className={styles.planetIndex} aria-label="Planet selector">
                  {bodies.map((body) => (
                    <button key={body.name} className={body.name === focusedBody ? styles.bodySelected : ''}
                      onClick={() => selectBody(body.name)} aria-pressed={body.name === focusedBody}>
                      <span aria-hidden="true">{body.glyph}</span>{body.name}
                    </button>
                  ))}
                </div>
              </>
            ) : chart ? (
              <div className={styles.emptyWheel} role="status" aria-live="polite">
                <div className={styles.emptyChartInvitation}>
                  <h3>Verifying private chart access…</h3>
                  <p>Your chart and personal inquiry are hidden until your member session and saved chart revision have been checked.</p>
                  <button onClick={() => closePrivateChart()}>Close my chart</button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyWheel}>
                <div className={styles.emptyWheelCircle} aria-hidden="true"><div className={styles.emptyWheelInner}>✧</div></div>
                <div className={styles.emptyChartInvitation}>
                  <span className={styles.eyebrow}>YOUR CHART IS YOURS</span>
                  <h3>Natal chart workspace · {houseSystem === 'whole-sign' ? 'Whole Sign' : houseSystem === 'equal' ? 'Equal' : 'Porphyry'}</h3>
                  <p>When you choose to open it, we’ll read the birth details held by your signed-in account and calculate the chart. Nothing is inferred from another person's browser data.</p>
                  <button className={styles.primaryAction} onClick={loadMyChart} disabled={chartStatus === 'loading'}>
                    {chartStatus === 'loading' ? 'Opening your chart…' : 'Open my chart'} <ChevronRight size={18} aria-hidden="true" />
                  </button>
                  {chartStatus === 'signed-out' && <p role="status">Your member session needs verification. Please sign in again before opening your chart. <Link href="/signin">Sign in</Link></p>}
                  {chartStatus === 'consent-required' && <p role="status">Astrology access is not opted in for this account. Review your Astrology consent settings before opening your chart.</p>}
                   {chartStatus === 'incomplete' && <p role="status">{chartError || 'Your exact birth date, time, timezone or location needs clarification before strict-core calculation.'} <Link href="/astrology">Review chart details</Link>.</p>}
                  {chartStatus === 'unavailable' && <p role="alert">{chartError}</p>}
                </div>
              </div>
            )}
          </div>

          <aside className={styles.inquiryColumn} id="maia-mentor" aria-label="Private chart inquiry, not connected to MAIA conversation">
            <div className={styles.inquiryTop}>
              <span className={styles.eyebrow}>PRIVATE INQUIRY · MAIA TRANSFER HELD</span>
              <h2>{selected ? selected.name : 'Chart analysis'}</h2>
              <p>Examine configurations, rulerships, aspects, and the structure of the whole chart.</p>
            </div>
            {selected ? (
              <>
                <div className={styles.lensTabs} role="tablist" aria-label="Ways of relating to this chart">
                  <button role="tab" aria-selected={mode === 'facts'} onClick={() => setMode('facts')}>Calculated</button>
                  <button role="tab" aria-selected={mode === 'questions'} onClick={() => setMode('questions')}>Explore</button>
                  <button role="tab" aria-selected={mode === 'meaning'} onClick={() => setMode('meaning')}>My meaning</button>
                </div>
                <div className={styles.lensContent} role="tabpanel">
                  {mode === 'facts' && (
                    <>
                      <div className={styles.factEmphasis}><span aria-hidden="true">{selected.glyph}</span>
                        <div><small>CALCULATED POSITION</small><strong>{selected.position.sign} · {selected.position.degree.toFixed(2)}°</strong><p>House {selected.position.house}</p></div>
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
                      <h3>Relationships in this chart</h3>
                      {relationships.length ? (
                        <div className={styles.aspectList}>
                          {relationships.slice(0, 6).map((aspect, index) => (
                            <div key={index}><span>{aspect.planet1} {aspect.type} {aspect.planet2}</span><b>{aspect.orb.toFixed(2)}°</b></div>
                          ))}
                        </div>
                      ) : <p>No reported aspects meet the current display filter for this point.</p>}
                      <p className={styles.sourceLabel}>Calculated using {calculationQuality?.method || 'a declared'} house method. Professional certification remains pending. Near-station motion is labeled uncertain rather than forced into direct or retrograde. Minor-body positions and motion are provisional.</p>
                      <details className={styles.methodDisclosure}>
                        <summary>Calculation method and limits</summary>
                        <p>The displayed house uses a 5° pre-angular-cusp convention where applicable; geometric membership is distinct. Lunar nodes are approximate mean positions, not certified true nodes.</p>
                        <p>The source and accuracy of the stored birth time have not been established by this service. A time written to the minute is not automatically accurate to the minute.</p>
                        <p>These are astronomical and interpretive method disclosures, not predictions about the person.</p>
                      </details>
                    </>
                  )}
                  {mode === 'questions' && (
                    <>
                      <h3>Let the symbol open a question.</h3>
                      <p className={styles.inquiryPrompt}>{INQUIRY[selected.name] || 'What possibilities might this symbol open without defining who you are?'}</p>
                      <p>Different astrological schools may offer distinct, sometimes contradictory meanings. The member chooses which, if any, are illuminating.</p>
                      <button className={styles.inlineLink} onClick={() => setMode('meaning')}>Bring this into my own words <ChevronRight size={16} /></button>
                    </>
                  )}
                  {mode === 'meaning' && (
                    <>
                      <h3>You are the author.</h3>
                      <p>What feels true, untrue, unfinished or surprising? Your response matters more than a model's certainty.</p>
                      <label className={styles.noteLabel} htmlFor="astrology-member-meaning">My question or observation</label>
                      <textarea id="astrology-member-meaning" value={memberNotes[focusedBody] || ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          pendingShareEpoch.current += 1;
                          setMemberNotes((prev) => ({ ...prev, [focusedBody]: value }));
                          setDraft(null);
                        }}
                        rows={5} maxLength={1400}
                        placeholder="I notice… / I disagree… / I want to explore…" />
                      <p className={styles.sourceLabel}>Not saved by this preview. No chart material is automatically sent to MAIA.</p>
                    </>
                  )}
                </div>

                {(
                  <div className={styles.maiaInvite}>
                    <div className={styles.maiaMark}><Sparkles size={19} aria-hidden="true" /></div>
                    <div>
                      <h3>Prepare a private question</h3>
                      <p>You can gather the chart details and your question here. Transfer to MAIA is paused while privacy protections are reviewed.</p>
                    </div>
                    <button className={styles.secondaryAction} onClick={preparePrivateDraft}>
                      <MessageCircle size={17} aria-hidden="true" /> Preview my question
                    </button>
                  </div>
                )}
                {draft && (
                  <div className={styles.consentDraft}>
                    <h3>Private draft — not sent to MAIA</h3>
                    <p>This draft remains in the current page. Sending chart material to MAIA is temporarily unavailable pending independent privacy review.</p>
                    <textarea aria-label="Prepared chart context" value={draft} readOnly rows={7} />
                    <div className={styles.draftActions}>
                      <button onClick={() => {
                        pendingShareEpoch.current += 1;
                        setDraft(null);
                      }}>Keep it here</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.lensContent}>
                <h3>Come to know the map.</h3>
                <p>Select a chart to inspect planetary positions, house placements, aspects, and configurations.</p>
                <p>MAIA never decides what you should become. A chart may orient your attention; the journey remains yours.</p>
              </div>
            )}
          </aside>
        </section>

        <section className={styles.openPaths} aria-labelledby="paths-title">
          <div className={styles.pathsIntro}>
            <span className={styles.eyebrow}>YOUR MAP. MANY PATHS.</span>
            <h2 id="paths-title">Five areas for inquiry</h2>
            <p>Natal, current sky, own-chart Relationships, Research and Study are available in this candidate. Two-person synastry and MAIA chart transfer remain held.</p>
          </div>
          <div className={styles.pathsGrid}>
            <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
              <ProRelationshipsWorkbench chart={privateChart} />
            </div>
            <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
              <ProResearchWorkbench chart={privateChart} />
            </div>
            <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
              <ProStudyWorkbench chart={privateChart} />
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div><ShieldCheck size={18} aria-hidden="true" /> <span>Member sovereignty · Symbolism is not evidence of destiny · Your meaning remains yours</span></div>
          <p>Private design preview only. Gifting, subscriptions, other-member charts and MAIA chart transmission are disabled. Professional astronomical reference certification is incomplete; claims about astrological effects are not established.</p>
        </footer>
      </div>
    </main>
  );
}
