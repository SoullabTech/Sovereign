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
import type { BirthChart } from '@/lib/astrology/ephemerisCalculator';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';
import { chartBodies, hasValidChartGeometry, selectedRelationships, type WheelBody } from '@/lib/astrology/proChartGeometry';
import { CelestialChartWheel } from './CelestialChartWheel';
import { SoulPortraitGifting } from './SoulPortraitGifting';
import styles from './astrology-pro-preview.module.css';

type ChartStatus = 'idle' | 'loading' | 'ready' | 'signed-out' | 'consent-required' | 'incomplete' | 'unavailable';
type ViewingMode = 'facts' | 'questions' | 'meaning';
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
  const [chartError, setChartError] = useState<string | null>(null);
  const [skyStatus, setSkyStatus] = useState<SkyStatus>('loading');
  const [sky, setSky] = useState<SkyPosition[]>([]);
  const [skyDate, setSkyDate] = useState<string | null>(null);
  const [focusedBody, setFocusedBody] = useState('Sun');
  const [mode, setMode] = useState<ViewingMode>('facts');
  const [showAspects, setShowAspects] = useState(true);
  const [showHouseLines, setShowHouseLines] = useState(true);
  // Each planet keeps its own unsaved draft; switching focus never attaches another planet's words.
  const [memberNotes, setMemberNotes] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<string | null>(null);
  const chartRequestEpoch = useRef(0);
  const pendingShareEpoch = useRef(0);
  const [calculationQuality, setCalculationQuality] = useState<null | {
    profile: string; method: string; independentlyCertified: boolean;
    warnings: string[];
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
    pendingShareEpoch.current += 1;
    setChart(null);
    setMemberId(null);
    setMemberNotes({});
    setCalculationQuality(null);
    setDraft(null);
    setChartStatus(reason);
  }

  // Recheck the session after tab return, focus and at bounded intervals.
  // A revoked or switched identity removes the on-screen personal chart and
  // all unsent member-authored context instead of leaving it in a stale tab.
  useEffect(() => {
    if (!memberId) return;
    let active = true;
    const verify = async () => {
      try {
        const reply = await apiFetch('/api/astrology/pro/my-chart', {
          method: 'GET', cache: 'no-store',
        });
        if (!active) return;
        if (!reply.ok) { closePrivateChart('signed-out'); return; }
        const result = await reply.json();
        if (active && result.memberId !== memberId) closePrivateChart('signed-out');
      } catch {
        if (active) closePrivateChart('unavailable');
      }
    };
    const whenVisible = () => {
      if (document.visibilityState === 'visible') void verify();
    };
    const whenFocus = () => { void verify(); };
    document.addEventListener('visibilitychange', whenVisible);
    window.addEventListener('focus', whenFocus);
    const interval = window.setInterval(() => void verify(), 60_000);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', whenVisible);
      window.removeEventListener('focus', whenFocus);
      window.clearInterval(interval);
    };
  }, [memberId]);

  async function loadMyChart() {
    if (chartStatus === 'loading') return;
    const epoch = ++chartRequestEpoch.current;
    pendingShareEpoch.current += 1;
    setChartError(null);
    setChartStatus('loading');
    setChart(null);
    setMemberNotes({});
    setCalculationQuality(null);
    setDraft(null);
    setMemberId(null);
    try {
      // The server loads ONLY the authenticated member's opted-in chart data.
      // No birth record, personal time, location or claimed member ID is sent
      // in this request or written into browser storage by the preview.
      const reply = await apiFetch('/api/astrology/pro/my-chart', {
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
        } else if (reply.status === 422) {
          setChartStatus('incomplete');
          setChartError('Your stored birth information needs clarification before a precise chart can be calculated.');
        } else throw new Error('member_chart_unavailable');
        return;
      }
      const result = await reply.json();
      if (epoch !== chartRequestEpoch.current) return;
      if (!hasValidChartGeometry(result?.data) ||
          typeof result.memberId !== 'string' || !result.memberId) {
        throw new Error('chart_geometry_or_identity_unverified');
      }
      setMemberId(result.memberId);
      setCalculationQuality(result.calculationQuality || null);
      setChart(result.data);
      setFocusedBody('Sun');
      setChartStatus('ready');
    } catch {
      if (epoch !== chartRequestEpoch.current) return;
      setChartError('Your chart could not be verified right now. Please try again when your session is available.');
      setChartStatus('unavailable');
    }
  }

  const bodies = useMemo(() => chart ? chartBodies(chart) : [], [chart]);
  const selected = bodies.find((body) => body.name === focusedBody) || bodies[0] || null;
  const relationships = useMemo(
    () => chart && selected ? selectedRelationships(chart, selected.name) : [],
    [chart, selected],
  );
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
    if (!chart || !selected || !memberId) return;
    pendingShareEpoch.current += 1;
    setDraft(prepareMemberHandoff(chart, selected, memberNotes[selected.name] || ''));
  }

  // R4G legacy bypass closure: the previous GET consent check was not an
  // R4F transfer receipt. Never mount MAIA or transmit a prepared chart here.
  // A future approved transfer must be bound to the receiving server route.


  return (
    <main className={styles.studio} id="astrology-pro-preview">
      <header className={styles.topbar}>
        <Link href="/astrology" className={styles.brand} aria-label="Return to Soullab Astrology">
          <span className={styles.brandMark}>✧</span>
          <span>SOULLAB <b>ASTROLOGY</b></span>
        </Link>
        <nav className={styles.navigation} aria-label="Astrology navigation">
          <a className={styles.navCurrent} href="#the-chart">Chart</a>
          <a href="#current-sky">The sky</a>
          <Link href="/astrology/synastry">Relationships</Link>
          <a href="#soul-portrait-gifts">Soul Portraits</a>
          <Link href="/astrology/discover">Explore</Link>
        </nav>
        <div className={styles.previewFlag}>PRO STUDIO · PRIVATE PREVIEW</div>
      </header>

      <div className={styles.content}>
        <section className={styles.arrival} aria-labelledby="studio-title">
          <div>
            <p className={styles.eyebrow}>THE CELESTIAL OBSERVATORY</p>
            <h1 id="studio-title">The sky is a map.<br /><em>Your life is yours to make.</em></h1>
            <p className={styles.introduction}>
              A place to orient, explore and create with the movements of the cosmos.
              Your chart offers relationships to investigate—not instructions to obey.
            </p>
          </div>
          <div className={styles.arrivalAside}>
            <span className={styles.orbitIcon}><Compass size={24} aria-hidden="true" /></span>
            <p>Notice what is present. Choose what matters. Return differently.</p>
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
                <span className={styles.eyebrow}>YOUR LIVING CHART</span>
                <h2 id="chart-room-title">A field of relationships</h2>
              </div>
              {chart && (
                <div className={styles.viewControls} aria-label="Chart layers">
                  <button aria-pressed={showAspects} onClick={() => setShowAspects((s) => !s)}>
                    {showAspects ? <Eye size={16} /> : <EyeOff size={16} />} Aspects
                  </button>
                  <button aria-pressed={showHouseLines} onClick={() => setShowHouseLines((s) => !s)}>
                    <Orbit size={16} /> Houses
                  </button>
                  <button onClick={() => closePrivateChart()}>Close my chart</button>
                </div>
              )}
            </div>

            {chart ? (
              <>
                <CelestialChartWheel chart={chart} focusedBody={focusedBody} onFocusBody={selectBody}
                  showAspects={showAspects} showHouseLines={showHouseLines} />
                <div className={styles.planetIndex} aria-label="Planet selector">
                  {bodies.map((body) => (
                    <button key={body.name} className={body.name === focusedBody ? styles.bodySelected : ''}
                      onClick={() => selectBody(body.name)} aria-pressed={body.name === focusedBody}>
                      <span aria-hidden="true">{body.glyph}</span>{body.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyWheel}>
                <div className={styles.emptyWheelCircle} aria-hidden="true"><div className={styles.emptyWheelInner}>✧</div></div>
                <div className={styles.emptyChartInvitation}>
                  <span className={styles.eyebrow}>YOUR CHART IS YOURS</span>
                  <h3>Begin with your own sky.</h3>
                  <p>When you choose to open it, we’ll read the birth details held by your signed-in account and calculate the chart. Nothing is inferred from another person's browser data.</p>
                  <button className={styles.primaryAction} onClick={loadMyChart} disabled={chartStatus === 'loading'}>
                    {chartStatus === 'loading' ? 'Opening your chart…' : 'Open my chart'} <ChevronRight size={18} aria-hidden="true" />
                  </button>
                  {chartStatus === 'signed-out' && <p role="status">Your member session needs verification. Please sign in again before opening your chart. <Link href="/signin">Sign in</Link></p>}
                  {chartStatus === 'consent-required' && <p role="status">Astrology access is not opted in for this account. Review your Astrology consent settings before opening your chart.</p>}
                  {chartStatus === 'incomplete' && <p role="status">Your exact birth date, time, timezone or location needs clarification before strict-core calculation. <Link href="/astrology">Review chart details</Link>.</p>}
                  {chartStatus === 'unavailable' && <p role="alert">{chartError}</p>}
                </div>
              </div>
            )}
          </div>

          <aside className={styles.inquiryColumn} aria-label="Your inquiry and MAIA">
            <div className={styles.inquiryTop}>
              <span className={styles.eyebrow}>A LIVING INQUIRY</span>
              <h2>{selected ? selected.name : 'What draws your attention?'}</h2>
              <p>There is no single right reading of a life.</p>
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
                      ) : <p>The chart calculator returned no aspects involving this point.</p>}
                      <p className={styles.sourceLabel}>Calculated using {calculationQuality?.method || 'a declared'} house method. Professional certification remains pending. Near-station motion is labeled uncertain rather than forced into direct or retrograde. Minor-body positions and motion are provisional.</p>
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
                <p>The chart becomes interactive when you open your authenticated birth chart. Until then, the sky above is shared—not an assessment of you.</p>
                <p>MAIA never decides what you should become. A chart may orient your attention; the journey remains yours.</p>
              </div>
            )}
          </aside>
        </section>

        <SoulPortraitGifting />

        <section className={styles.openPaths} aria-labelledby="paths-title">
          <div className={styles.pathsIntro}>
            <span className={styles.eyebrow}>YOUR MAP. MANY PATHS.</span>
            <h2 id="paths-title">Choose what you explore next.</h2>
            <p>This is a studio to enter and return to, not a program that tells you which direction your life must take.</p>
          </div>
          <div className={styles.pathsGrid}>
            <Link href="/astrology/synastry"><span><Orbit size={20} /></span><h3>Relationship</h3><p>Explore chart-to-chart perspectives without defining another person.</p><b>Open relationships <ChevronRight size={16} /></b></Link>
            <Link href="/astrology/discover"><span><Compass size={20} /></span><h3>Different traditions</h3><p>Learn what changes when the lens changes, and what stays open.</p><b>Explore astrology <ChevronRight size={16} /></b></Link>
            <Link href="/astrology/report"><span><BookOpen size={20} /></span><h3>Reflect and study</h3><p>Make meaning by learning the techniques, not surrendering interpretation.</p><b>View existing reports <ChevronRight size={16} /></b></Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <div><ShieldCheck size={18} aria-hidden="true" /> <span>Member sovereignty · Symbolism is not evidence of destiny · Your meaning remains yours</span></div>
          <p>Private design preview only. No Astrology Pro subscription or new professional client system is active. Scientific claims about astrological effects are not established by this experience.</p>
        </footer>
      </div>
    </main>
  );
}
