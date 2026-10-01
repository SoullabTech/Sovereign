'use client';

/**
 * The Blueprint - Your Cosmic Spiral
 *
 * A living map of consciousness woven through celestial rhythms.
 * Not a dashboard — a threshold into archetypal wisdom.
 *
 * Integrates:
 * - Birth chart archetypal essence
 * - Elemental balance (Fire/Water/Earth/Air/Aether)
 * - MAIA's astrological intelligence
 * - Circadian color rhythm (day/night transitions)
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Flame, Droplet, Sprout, Wind, Sparkle, TrendingUp, Settings2, ChevronDown, ChevronUp, Info, Lock, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { MiniHoloflower } from '@/components/holoflower/MiniHoloflower';
import { getZodiacArchetype, generateArchetypalDescription } from '@/lib/astrology/archetypeLibrary';
import { getPlanetaryArchetype } from '@/lib/astrology/spiralogicMapping';
import { getSpiralogicHouseData } from '@/lib/astrology/spiralogicHouseMapping';
import { synthesizeAspect, AspectType } from '@/lib/astrology/aspectSynthesis';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltip, CARD_COPY } from '@/lib/content/CrossSystemConvergenceCopy';
import { useUserAuth } from '@/lib/hooks/useUserAuth';
// Tier checks removed for beta - all users have full access
import { mapAudienceMode } from '@/lib/content/audienceMode';
import ZodiacToggle, { type ZodiacSystem, type AyanamsaType } from '@/components/astrology/ZodiacToggle';
import { calculateAyanamsa, tropicalToSidereal } from '@/lib/astrology/ayanamsaCalculator';
import { BirthChartCalculator } from '@/components/astrology/BirthChartCalculator';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { useBirthChart } from '@/lib/hooks/useBirthChart';
import type { AlienPattern } from '@/lib/astrology/alienPatterns';
import { OracleConversation } from '@/components/OracleConversation';
import { WhatIsAliveNow } from '@/components/astrology/WhatIsAliveNow';
import type { TransitActivation, TransitField } from '@/lib/astrology/transitField';
import { chooseTransitActivation } from '@/lib/astrology/transitJourney';
import styles from './astrology-room.module.css';

// Elemental colors for planet insights
const elementalColors = {
  fire: { color: '#F5A362', glow: 'rgba(245, 163, 98, 0.3)' },
  water: { color: '#8BADD6', glow: 'rgba(139, 173, 214, 0.3)' },
  earth: { color: '#A8C69F', glow: 'rgba(168, 198, 159, 0.3)' },
  air: { color: '#F5D565', glow: 'rgba(245, 213, 101, 0.3)' },
};

// Zodiac signs in order (0-360 degrees, 30 degrees each)
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert tropical sign + degree to sidereal sign + degree
function getTropicalLongitude(sign: string, degree: number): number {
  const signIndex = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === sign.toLowerCase());
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalizedLong = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLong / 30);
  const degree = normalizedLong % 30;
  return { sign: ZODIAC_SIGNS[signIndex], degree };
}

interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

interface BirthChartData {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury?: PlanetPosition;
  venus?: PlanetPosition;
  mars?: PlanetPosition;
  jupiter?: PlanetPosition;
  saturn?: PlanetPosition;
  uranus?: PlanetPosition;
  neptune?: PlanetPosition;
  pluto?: PlanetPosition;
  chiron?: PlanetPosition;
  northNode?: PlanetPosition;
  southNode?: PlanetPosition;
  lilith?: PlanetPosition;
  ceres?: PlanetPosition;
  pallas?: PlanetPosition;
  juno?: PlanetPosition;
  vesta?: PlanetPosition;
  ascendant: { sign: string; degree: number };
  midheaven?: { sign: string; degree: number };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

interface SavedSynastryItem {
  analysisId: string;
  savedAt?: string;  // Optional - edge cases may omit
  chartA?: { sunSign?: string; moonSign?: string; name?: string };
  chartB?: { sunSign?: string; moonSign?: string; name?: string };
  scores?: { attraction?: number; harmony?: number; friction?: number; growth?: number };
}

// House system options with descriptions
type HouseSystemType = 'porphyry' | 'placidus' | 'whole-sign' | 'equal' | 'koch';

const HOUSE_SYSTEMS: { value: HouseSystemType; label: string; description: string; fallback?: boolean }[] = [
  { value: 'porphyry', label: 'Porphyry', description: 'Destiny spine — crisp identity + vocation clarity' },
  { value: 'placidus', label: 'Placidus*', description: 'Lived experience — where life pressure actually lands', fallback: true },
  { value: 'whole-sign', label: 'Whole Sign', description: 'Mythic map — each sign a clear chapter of your journey' },
  { value: 'equal', label: 'Equal', description: 'Clean structure — stable, straightforward house map' },
  { value: 'koch', label: 'Koch*', description: 'Inner growth — how you unfold through thresholds', fallback: true },
];

// Transit position interface for current sky
interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
  longitude: number;
}

// Transform chartData into planets array for SacredHouseWheel
function chartDataToPlanets(chart: BirthChartData) {
  const planetKeys = [
    { key: 'sun', name: 'Sun' },
    { key: 'moon', name: 'Moon' },
    { key: 'mercury', name: 'Mercury' },
    { key: 'venus', name: 'Venus' },
    { key: 'mars', name: 'Mars' },
    { key: 'jupiter', name: 'Jupiter' },
    { key: 'saturn', name: 'Saturn' },
    { key: 'uranus', name: 'Uranus' },
    { key: 'neptune', name: 'Neptune' },
    { key: 'pluto', name: 'Pluto' },
    { key: 'chiron', name: 'Chiron' },
    { key: 'northNode', name: 'North Node' },
    { key: 'southNode', name: 'South Node' },
    { key: 'lilith', name: 'Lilith' },
    { key: 'ceres', name: 'Ceres' },
    { key: 'pallas', name: 'Pallas' },
    { key: 'juno', name: 'Juno' },
    { key: 'vesta', name: 'Vesta' },
  ];

  return planetKeys
    .map(({ key, name }) => {
      const pos = chart[key as keyof BirthChartData] as PlanetPosition | undefined;
      if (!pos?.sign) return null;
      return {
        name,
        sign: pos.sign,
        house: pos.house || 1,
        degree: pos.degree || 0,
      };
    })
    .filter(Boolean) as { name: string; sign: string; house: number; degree: number }[];
}

export default function AstrologyPage() {
  const router = useRouter();
  // Beta: all users have full access
  const isPersonal = true;
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [maiaOpen, setMaiaOpen] = useState(false);
  const [chartContextShared, setChartContextShared] = useState(false);
  const [maiaInjection, setMaiaInjection] = useState<{ text: string; nonce: number } | null>(null);
  const [recognitionText, setRecognitionText] = useState('');
  const [recognitionSaving, setRecognitionSaving] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [keptReflectionId, setKeptReflectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBirthData, setHasBirthData] = useState(false);
  // Distinct from !hasBirthData: the server could not name the authenticated
  // member, so we do not know whether birth data exists. Unavailable ≠ absent.
  //   'signed-out'  — 401/403. Deterministic. The remedy is to sign in, and
  //                   saying "just now" here would make a permanent state look
  //                   transient and invite futile reloads.
  //   'unreachable' — 5xx / transport. Genuinely transient; retry is the remedy.
  // Both refuse the cache; they differ only in what they truthfully tell the
  // person to do about it.
  const [unresolvedReason, setUnresolvedReason] = useState<'signed-out' | 'unreachable' | null>(null);
  const [elementalBalance, setElementalBalance] = useState({
    fire: 0.28,
    water: 0.38,
    earth: 0.18,
    air: 0.16,
  });

  // Alien patterns (Steinbrecher) — detected from chart
  const [alienPatterns, setAlienPatterns] = useState<AlienPattern[]>([]);

  // Birth entry belongs to this page. The hook owns the save contract, so entry
  // here writes to the authenticated member profile exactly as every other
  // surface does — no page-local persistence path.
  const { save: saveBirthData, error: birthSaveError } = useBirthChart();


  // Circadian rhythm - detect time of day for color transitions
  const [isDayMode, setIsDayMode] = useState(true);

  // Expanded planet for planetary positions panel
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Saved synastry for timeline surfacing
  const [savedSynastry, setSavedSynastry] = useState<SavedSynastryItem[]>([]);
  const [savedSynastryLoading, setSavedSynastryLoading] = useState(false);

  // House system selection
  const [houseSystem, setHouseSystem] = useState<HouseSystemType>('porphyry');
  const [houseSystemLoading, setHouseSystemLoading] = useState(false);

  // Transits display
  const [showTransits, setShowTransits] = useState(false);
  const [transitPositions, setTransitPositions] = useState<TransitPosition[]>([]);
  const [transitLoading, setTransitLoading] = useState(false);
  // What is alive now — verified transit field, shared with the House Wheel
  const [transitField, setTransitField] = useState<TransitField | null>(null);
  const [wheelTransitFocus, setWheelTransitFocus] = useState<string | null>(null);
  const [fieldActivationFocus, setFieldActivationFocus] = useState<string | null>(null);

  // House system guide toggle
  const [showHouseGuide, setShowHouseGuide] = useState(false);

  // Zodiac system toggle (tropical/sidereal)
  const [zodiacMode, setZodiacMode] = useState<ZodiacSystem>('tropical');
  const [ayanamsa, setAyanamsa] = useState<AyanamsaType>('lahiri');
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  // Audience mode for convergence copy (profile-adaptive)
  const { oracleAgent, preferences } = useUserAuth();
  const audienceMode = mapAudienceMode({
    consciousness_archetype: oracleAgent?.archetype,
    communication_style: preferences?.style,
  });

  // DEV OVERRIDE: Test audience modes via ?mode=mystic|pragmatic|product
  // Gated to dev only - safe to keep permanently
  const resolvedMode = useMemo(() => {
    // Hard gate: never allow URL overrides in production
    if (process.env.NODE_ENV === 'production') return audienceMode;
    if (typeof window === 'undefined') return audienceMode;

    const forced = new URLSearchParams(window.location.search).get('mode');
    return (forced === 'mystic' || forced === 'pragmatic' || forced === 'product')
      ? forced
      : audienceMode;
  }, [audienceMode]);

  // Memoized sort - avoid re-sorting on every render
  const sortedSavedSynastry = useMemo(() => {
    // NaN-safe timestamp parser (handles malformed dates gracefully)
    const ts = (s?: string) => {
      const n = s ? Date.parse(s) : 0;
      return Number.isFinite(n) ? n : 0;
    };
    return [...savedSynastry].sort((a, b) => ts(b.savedAt) - ts(a.savedAt));
  }, [savedSynastry]);

  const primaryAspectReadings = useMemo(() => {
    if (!chartData?.aspects?.length) return [];
    return [...chartData.aspects]
      .sort((a, b) => a.orb - b.orb)
      .map((aspect) => ({
        ...aspect,
        synthesis: synthesizeAspect(
          aspect.planet1,
          aspect.planet2,
          aspect.type as AspectType,
        ),
      }))
      .filter((aspect) => aspect.synthesis)
      .slice(0, 4);
  }, [chartData]);

  // Calculate current ayanamsa value (memoized)
  const ayanamsaValue = useMemo(() => {
    const date = birthDate || new Date();
    return calculateAyanamsa(date, ayanamsa);
  }, [birthDate, ayanamsa]);

  // Hydration-safe zodiac state initialization
  useEffect(() => {
    // Sidereal now has its own page — redirect if stored or URL says sidereal
    const urlParams = new URLSearchParams(window.location.search);
    const urlZodiac = urlParams.get('zodiac');
    if (urlZodiac === 'sidereal') {
      localStorage.removeItem('astro_zodiac_mode');
      router.replace('/astrology/vedic');
      return;
    }
    const storedMode = localStorage.getItem('astro_zodiac_mode');
    if (storedMode === 'sidereal') {
      localStorage.removeItem('astro_zodiac_mode');
      router.replace('/astrology/vedic');
      return;
    }

    // Load ayanamsa preference
    const storedAyanamsa = localStorage.getItem('astro_ayanamsa');
    if (storedAyanamsa === 'lahiri' || storedAyanamsa === 'true_chitra' || storedAyanamsa === 'krishnamurti') {
      setAyanamsa(storedAyanamsa);
    }
  }, [router]);

  // Persist zodiac mode changes
  const setZodiacModeAndPersist = useCallback((mode: ZodiacSystem) => {
    // Each system has its own authentic page
    if (mode === 'chinese') { router.push('/astrology/chinese'); return; }
    if (mode === 'sidereal') { router.push('/astrology/vedic'); return; }
    if (mode === 'mayan') { router.push('/astrology/mayan'); return; }
    // Tropical stays on this page
    setZodiacMode(mode);
    localStorage.setItem('astro_zodiac_mode', mode);
    const url = new URL(window.location.href);
    url.searchParams.delete('zodiac');
    window.history.replaceState({}, '', url.toString());
  }, [router]);

  // Persist ayanamsa changes
  const setAyanamsaAndPersist = useCallback((value: AyanamsaType) => {
    setAyanamsa(value);
    localStorage.setItem('astro_ayanamsa', value);
  }, []);

  // Helper to get sidereal position for a planet
  const getSiderealPosition = useCallback((data: PlanetPosition | undefined) => {
    if (!data?.sign) return null;
    const tropicalLong = getTropicalLongitude(data.sign, data.degree);
    const siderealLong = tropicalToSidereal(tropicalLong, ayanamsaValue);
    return longitudeToSign(siderealLong);
  }, [ayanamsaValue]);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDayMode(hour >= 6 && hour < 20); // Day mode 6am-8pm
  }, []);

  // Fetch saved synastry
  useEffect(() => {
    const memberId = getOrCreateExplorerId();
    if (!memberId) return;

    let isMounted = true;

    (async () => {
      try {
        setSavedSynastryLoading(true);
        const res = await apiFetch(
          `/api/astrology/synastry/saved?memberId=${encodeURIComponent(memberId)}&limit=3`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        if (isMounted) setSavedSynastry(items);
      } catch {
        // Silent fail - not critical
      } finally {
        if (isMounted) setSavedSynastryLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Load birth chart data from profile API, then localStorage fallback
  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Client-cached identity plays NO part in resolving member birth data.
        // It previously did two harmful things here:
        //   1. it GATED this lookup — yet /api/members/profile resolves the
        //      member from a verified session credential (maia_session cookie or
        //      x-session-token, validated against auth_sessions) and ignores any
        //      client-supplied id. A missing or stale `beta_user` therefore had
        //      no authority over the ANSWER, only over whether we bothered to
        //      ASK; gating on it silently presented an authenticated member with
        //      a chart as "no birth data".
        //   2. it served as FALLBACK — see the removal note below.
        //
        // 1. AUTHORITATIVE: ask the server who the authenticated member is.
        //    Unconditional. Via apiFetch so x-session-token accompanies the
        //    request on Safari/Capacitor, where cookie transport is unavailable
        //    and a plain same-origin fetch would arrive unauthenticated.
        //    NOTE: a 401 here includes the deliberate hard-fail when a client
        //    identity CLAIM diverges from the session (getMemberFromRequest
        //    rejects rather than substituting). That must stay a rejection —
        //    fallback below must not "helpfully" resolve a different member.
        // Set when the server REFUSES to name the member (401/403) — either no
        // session at all, or a client identity CLAIM that diverged from the
        // session and was rejected by getMemberIdFromRequest. In that state the
        // local caches below are NOT safe to read: they carry a member identity
        // the server has declined to confirm, so trusting them would let this UI
        // undo the very impersonation guard the server just enforced.
        // A transport/network failure is deliberately NOT this — see the catch.
        // TRUE only when the server POSITIVELY named the authenticated member.
        // Anything else — 401/403 (will not say), 5xx (could not answer),
        // network error, malformed body — leaves this false.
        //
        // Why "could not answer" is treated as strictly as "will not say":
        // neither local cache can establish its own owner.
        //   • birthChartData carries NO member id at all, and is cleared in
        //     exactly one place in the entire app (app/journey/page.tsx) — not
        //     by clearAuthState, not by /signout. It SURVIVES sign-out and
        //     account switch.
        //   • beta_user does carry a server-returned id and IS cleared on
        //     sign-out and overwritten on sign-in — but this page cannot verify
        //     that id equals the authenticated member without the very call
        //     that just failed.
        // So a stale cache can present one member's birth field under another
        // member's session with no server rejection involved at all. Server
        // unavailability must not become a second route to the same defect.
        let memberEstablished = false;
        // 401/403 — the server REFUSED to name the member: no session at all, or
        // a client identity claim that diverged from the session and was rejected
        // by getMemberIdFromRequest. Both are deterministic, and for both the
        // honest remedy is to sign in. Left false for 5xx/transport, which are
        // transient and where retry is the honest remedy.
        let authRefused = false;
        {
          try {
            console.log('[Astrology] Fetching from profile API...');
            const profileRes = await apiFetch('/api/members/profile');
            console.log('[Astrology] Profile API response status:', profileRes.status);
            if (profileRes.status === 401 || profileRes.status === 403) {
              authRefused = true;
            }
            if (profileRes.ok) {
              const profile = await profileRes.json();
              setMemberId(typeof profile.id === 'string' ? profile.id : null);
              // The server has now named the authenticated member. Whatever it
              // says about birthData — present or absent — is AUTHORITATIVE for
              // this member, and outranks any cache.
              memberEstablished = true;
              console.log('[Astrology] Profile data:', profile);
              if (profile.birthData?.date) {
                console.log('[Astrology] Found birth data in profile:', profile.birthData);
                // We have birth data saved in database - use it to calculate chart
                const birthData = profile.birthData;

                // Format date for API (YYYY-MM-DD)
                const dateStr = typeof birthData.date === 'string'
                  ? birthData.date.split('T')[0]
                  : new Date(birthData.date).toISOString().split('T')[0];

                // Format time (HH:MM)
                const timeStr = birthData.time
                  ? (birthData.time.includes(':') ? birthData.time.substring(0, 5) : birthData.time)
                  : '12:00';

                // Build location object - use defaults if not saved
                const location = birthData.location || {
                  lat: 30.4515, // Default to Baton Rouge if no location
                  lng: -91.1871,
                  name: 'Baton Rouge, Louisiana',
                  timezone: 'America/Chicago',
                };

                console.log('[Astrology] Calculating chart with:', { date: dateStr, time: timeStr, location });

                // Calculate the chart
                // Calculator route: apiUrl() for Capacitor host correctness,
                // plain fetch so it acquires no member/session identity.
                const chartRes = await fetch(apiUrl('/api/astrology/birth-chart'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    date: dateStr,
                    time: timeStr,
                    location,
                    houseSystem: 'porphyry',
                  }),
                });

                console.log('[Astrology] Chart API response status:', chartRes.status);
                if (chartRes.ok) {
                  const chartJson = await chartRes.json();
                  const data = chartJson.data;
                  const fullChart = {
                    ...data,
                    date: dateStr,
                    time: timeStr,
                    location,
                    houseSystem: 'porphyry',
                  };

                  // Cache in localStorage for faster subsequent loads
                  localStorage.setItem('birthChartData', JSON.stringify(fullChart));

                  setChartData(fullChart);
                  if (chartJson.alienPatterns) setAlienPatterns(chartJson.alienPatterns);
                  setHasBirthData(true);
                  calculateElementalBalance(fullChart);
                  setLoading(false);
                  return;
                }
              }
            }
          } catch (profileErr) {
            console.error('Error fetching profile birth data:', profileErr);
          }
        }

        // ── THE AUTHORITATIVE LOOKUP IS TERMINAL, BOTH WAYS ──────────────────
        //
        // UNAVAILABLE ≠ ABSENT. These are different states and must not collapse
        // into the same screen.
        if (!memberEstablished) {
          // The server did not name the member: no session, a rejected identity
          // claim, a 5xx, or a transport failure. We do not know whose browser
          // this is, so we cannot know whose chart the caches hold. Render
          // "unknown", never someone's cached chart.
          console.warn('[Astrology] authenticated member not established — refusing unbound local cache');
          setUnresolvedReason(authRefused ? 'signed-out' : 'unreachable');
          setHasBirthData(false);
          setLoading(false);
          return;
        }

        // The member IS established and we reached here, so the server's answer
        // for THIS member was "no birth data" (or the chart computation failed).
        // Either way the server has spoken for this member and outranks a cache
        // that cannot prove whose it is. This is the legitimate empty state.
        console.log('[Astrology] member established, no authoritative birth data — legitimate empty state');
        setHasBirthData(false);
        setLoading(false);
        return;

        // ── BRANCHES 2 AND 3 REMOVED (2026-08-16) ────────────────────────────
        // They resolved member birth data from localStorage:
        //   beta_user.birthData   — carries a server-returned id, cleared on
        //                           sign-out, overwritten on sign-in, but this
        //                           page cannot verify that id equals the
        //                           authenticated member without the very call
        //                           that would have already answered.
        //   birthChartData        — carries NO member id at all, and is removed
        //                           in exactly one place in the whole app
        //                           (app/journey/page.tsx). It SURVIVES sign-out
        //                           and account switch.
        // Neither can establish its own owner, so neither may be read before the
        // authenticated member is known — and once known, the server's answer is
        // authoritative and they are redundant. Reading them was a live path for
        // presenting one member's birth field under another member's session.
        //
        // Removed rather than left unreachable: TypeScript drops control-flow
        // narrowing in unreachable code, so the dead branches failed the
        // no-regression gate — and dead code that reads unbound identity caches
        // misleads the next reader about what this page does.
        //
        // RESTORING OFFLINE/DEGRADED CHART VIEWING is a product decision that is
        // AWAITING_AUTHORITY, and does NOT mean reinstating this code. It means
        // BINDING the cache: write { memberId: <server-verified>, birthData,
        // validAsOf } at every write site (this page, app/journey/page.tsx,
        // lib/hooks/useBirthChart.ts) and permit fallback only when the
        // authenticated member equals that id. Prior shape: git show HEAD~:app/astrology/page.tsx
        // No valid chart data found
        setLoading(false);
        setHasBirthData(false);

      } catch (error) {
        console.error('Error loading chart data:', error);
        setLoading(false);
        setHasBirthData(false);
      }
    };

    loadChartData();
  }, []);

  // Elemental balance from the chart's inner planets. Lifted to component
  // scope so the load effect and the inline birth-entry path share one
  // definition. Deliberately placed AFTER the effect: birthDataResolution.test
  // slices the loader as loadChartData -> calculateElementalBalance to prove no
  // chart is produced past the identity guard, and defining it earlier collapsed
  // that slice to empty, silently disabling the check.
  const calculateElementalBalance = useCallback((chart: BirthChartData) => {
    const planets = [
      chart.sun, chart.moon, chart.mercury, chart.venus,
      chart.mars, chart.jupiter, chart.saturn
    ].filter((p): p is PlanetPosition => p != null);

    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
    const fireSign = ['Aries', 'Leo', 'Sagittarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];

    planets.forEach(p => {
      if (fireSign.includes(p.sign)) elementCounts.fire++;
      else if (waterSigns.includes(p.sign)) elementCounts.water++;
      else if (earthSigns.includes(p.sign)) elementCounts.earth++;
      else if (airSigns.includes(p.sign)) elementCounts.air++;
    });

    const total = planets.length || 1;
    setElementalBalance({
      fire: elementCounts.fire / total,
      water: elementCounts.water / total,
      earth: elementCounts.earth / total,
      air: elementCounts.air / total,
    });
  }, []);

  /**
   * Birth data entered on this page.
   *
   * Persist first, calculate second. If the profile write does not land, the
   * hook surfaces a retryable error and no chart is drawn — a chart resting on
   * birth data that failed to persist is the state that made this page look
   * like it had forgotten the member.
   */
  const handleBirthDataSubmit = async (data: {
    date: string;
    time: string;
    location: { name: string; lat: number; lng: number; timezone: string };
    houseSystem?: string;
  }) => {
    const persisted = await saveBirthData({
      date: data.date,
      time: data.time,
      location: data.location,
      houseSystem: data.houseSystem || 'porphyry',
    });
    if (!persisted) return;

    setLoading(true);
    try {
      // Calculator route — identity-free by contract.
      const chartRes = await fetch(apiUrl('/api/astrology/birth-chart'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          time: data.time,
          location: data.location,
          houseSystem: 'porphyry',
        }),
      });

      if (chartRes.ok) {
        const chartJson = await chartRes.json();
        const fullChart = {
          ...chartJson.data,
          date: data.date,
          time: data.time,
          location: data.location,
          houseSystem: 'porphyry',
        };
        setChartData(fullChart);
        if (chartJson.alienPatterns) setAlienPatterns(chartJson.alienPatterns);
        setHasBirthData(true);
        setUnresolvedReason(null);
        calculateElementalBalance(fullChart);
      } else {
        console.error('[Astrology] Chart calculation failed:', chartRes.status);
      }
    } catch (error) {
      console.error('[Astrology] Error calculating chart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle house system change - recalculate chart with new system
  const handleHouseSystemChange = async (newSystem: HouseSystemType) => {
    if (!chartData || newSystem === houseSystem) return;

    setHouseSystemLoading(true);
    try {
      const savedChartJson = localStorage.getItem('birthChartData');
      if (!savedChartJson) return;

      const savedChart = JSON.parse(savedChartJson);
      if (!savedChart.date || !savedChart.time || !savedChart.location) {
        console.error('Missing birth data for recalculation');
        return;
      }

      // Calculator route — see the calculator contract in birthDataResolution.test
      const res = await fetch(apiUrl('/api/astrology/birth-chart'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: savedChart.date,
          time: savedChart.time,
          location: savedChart.location,
          houseSystem: newSystem,
        }),
      });

      if (res.ok) {
        const resJson4 = await res.json();
        const fullChart = { ...savedChart, ...resJson4.data, houseSystem: newSystem };
        localStorage.setItem('birthChartData', JSON.stringify(fullChart));
        setChartData(fullChart);
        if (resJson4.alienPatterns) setAlienPatterns(resJson4.alienPatterns);
        setHouseSystem(newSystem);
      }
    } catch (error) {
      console.error('Error changing house system:', error);
    } finally {
      setHouseSystemLoading(false);
    }
  };

  // Natal points for the transit field: tropical longitudes of the admitted points only.
  const transitNatal = useMemo(() => {
    if (!chartData) return [];
    const entries: Array<[string, { sign: string; degree: number } | undefined]> = [
      ['Sun', chartData.sun], ['Moon', chartData.moon], ['Mercury', chartData.mercury],
      ['Venus', chartData.venus], ['Mars', chartData.mars], ['Jupiter', chartData.jupiter],
      ['Saturn', chartData.saturn], ['Uranus', chartData.uranus], ['Neptune', chartData.neptune],
      ['Pluto', chartData.pluto], ['Ascendant', chartData.ascendant], ['Midheaven', chartData.midheaven],
    ];
    return entries
      .filter((entry): entry is [string, { sign: string; degree: number }] =>
        Boolean(entry[1]?.sign) && Number.isFinite(entry[1]?.degree))
      .map(([point, pos]) => ({ point, longitude: getTropicalLongitude(pos.sign, pos.degree) }));
  }, [chartData]);

  const wheelTransitAspects = useMemo(() => {
    if (!transitField) return undefined;
    return transitField.activations
      .filter((a) => !wheelTransitFocus || a.id === wheelTransitFocus)
      .map((a) => ({
        transitPlanet: a.transiting.body,
        natalPlanet: a.natal.point,
        aspectType: a.aspect.name,
        orb: a.deviation,
        applying: a.motion === 'applying',
      }));
  }, [transitField, wheelTransitFocus]);

  function showActivationOnWheel(activation: TransitActivation) {
    setWheelTransitFocus(activation.id);
    setShowTransits(true);
    requestAnimationFrame(() => {
      document.getElementById('house-wheel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function openTransitFromWheel(
    planet: string,
    displayedAspects: Array<{ natalPlanet: string; aspectType: string; orb: number }>,
  ) {
    const activation = chooseTransitActivation(
      transitField?.activations ?? [],
      planet,
      displayedAspects,
    );
    if (!activation) return;
    setWheelTransitFocus(activation.id);
    // Reset first so choosing the same wheel planet can reopen a field the member closed.
    setFieldActivationFocus(null);
    requestAnimationFrame(() => setFieldActivationFocus(activation.id));
  }

  function bringActivationToMaia(text: string) {
    setMaiaInjection({ text, nonce: Date.now() });
    setMaiaOpen(true);
  }

  // Fetch current transit positions
  const fetchTransits = async () => {
    setTransitLoading(true);
    try {
      const res = await fetch(apiUrl('/api/astrology/current-transits'));
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.positions) {
          // Transform to our TransitPosition interface
          const positions = json.data.positions.map((p: { planet: string; sign: string; degree: number; longitude: number }) => ({
            planet: p.planet,
            sign: p.sign,
            degree: p.degree,
            longitude: p.longitude,
          }));
          setTransitPositions(positions);
        }
      }
    } catch (error) {
      console.error('Error fetching transits:', error);
    } finally {
      setTransitLoading(false);
    }
  };

  // Fetch transits when toggle is enabled
  useEffect(() => {
    if (showTransits && transitPositions.length === 0) {
      fetchTransits();
    }
  }, [showTransits, transitPositions.length]);

  function closeMaiaEncounter() {
    setMaiaOpen(false);
    // A context injection is a one-time member gesture. Clearing the carrier on
    // close prevents a remounted canonical conversation from re-sending it.
    setMaiaInjection(null);
  }

  async function keepRecognitionAsReflection() {
    const text = recognitionText.trim();
    if (!text || recognitionSaving || keptReflectionId) return;
    setRecognitionSaving(true);
    setRecognitionError(null);
    try {
      const response = await apiFetch('/api/astrology/reflection', {
        method: 'POST',
        body: JSON.stringify({
          text,
          zodiacMode,
          houseSystem,
          ayanamsa: zodiacMode === 'sidereal' ? ayanamsa : undefined,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || 'Could not keep this reflection');
      setKeptReflectionId(body?.reflection?.id || null);
    } catch (err) {
      setRecognitionError(err instanceof Error ? err.message : 'Could not keep this reflection');
    } finally {
      setRecognitionSaving(false);
    }
  }

  function beginAnotherRecognition() {
    setRecognitionText('');
    setRecognitionError(null);
    setKeptReflectionId(null);
  }

  function bringChartFactsToMaia() {
    if (!chartData) return;
    const aspectFacts = primaryAspectReadings.slice(0, 4).map((aspect) =>
      aspect.planet1 + ' ' + aspect.type + ' ' + aspect.planet2 + ' (' + aspect.orb.toFixed(1) + '° orb)'
    );
    const parts = [
      'I am explicitly bringing selected calculated facts from my natal chart into this conversation.',
      'Current lens: ' + (zodiacMode === 'tropical' ? 'Tropical' : zodiacMode) + ' · ' + (HOUSE_SYSTEMS.find((item) => item.value === houseSystem)?.label || houseSystem),
      'Sun: ' + chartData.sun.sign + ' ' + chartData.sun.degree.toFixed(1) + '° · House ' + chartData.sun.house,
      'Moon: ' + chartData.moon.sign + ' ' + chartData.moon.degree.toFixed(1) + '° · House ' + chartData.moon.house,
      'Ascendant: ' + chartData.ascendant.sign + ' ' + chartData.ascendant.degree.toFixed(1) + '°',
    ];
    if (aspectFacts.length) {
      parts.push('Selected chart relationships: ' + aspectFacts.join('; '));
    }
    parts.push(
      'Please keep calculated facts distinct from symbolic interpretation. Offer possibilities rather than identity claims or predictions, and ask what I recognize in lived experience. Do not treat chart symbolism as established truth about me.'
    );
    setMaiaInjection({ text: parts.join('\n\n'), nonce: Date.now() });
    setChartContextShared(true);
  }

  if (loading) {
    return (
      <main className={styles.loadingRoom}>
        <div className={styles.emptyInner}>
          <MiniHoloflower size={72} isDayMode={false} animated={true} />
          <h1>Gathering your chart</h1>
          <p>Calculating the sky you were born into.</p>
        </div>
      </main>
    );
  }

  if (!chartData || !hasBirthData) {
    return (
      <main className={styles.room}>
        <header className={styles.threshold} aria-label="Astrology room navigation">
          <Link href="/house" className={styles.brand} aria-label="Return to the House">
            <img src="/holoflower-studio-transparent.png" alt="" />
            <span>SOULLAB</span>
          </Link>
          <div className={styles.roomName}>
            <span>THE HOUSE</span>
            <b>ASTROLOGY</b>
          </div>
          <Link href="/house" className={styles.return}>Return to House →</Link>
        </header>
        <section className={styles.emptyRoom}>
          <div className={styles.emptyInner}>
            <MiniHoloflower size={72} isDayMode={false} animated={true} />
            {unresolvedReason ? (
              <>
                <h1>{unresolvedReason === 'signed-out' ? 'Sign in to see your chart' : 'We couldn’t reach your chart'}</h1>
                <p>
                  {unresolvedReason === 'signed-out'
                    ? 'Your chart belongs to your account, so Soullab needs to know who you are before showing it.'
                    : 'We could not confirm your account just now, so no chart is shown rather than risk showing the wrong one.'}
                </p>
                {unresolvedReason === 'signed-out' ? (
                  <Link href="/signin" className={styles.reportLink}>Sign in</Link>
                ) : (
                  <button type="button" onClick={() => window.location.reload()} className={styles.reportLink}>Try again</button>
                )}
              </>
            ) : (
              <>
                <h1>Your birth chart</h1>
                <p>Add your birth date, time, and place. These details are used to calculate your chart; they do not determine who you are.</p>
                <div className="w-full max-w-xl mx-auto text-left">
                  <BirthDataForm
                    onSubmit={handleBirthDataSubmit}
                    loading={loading}
                    isDayMode={false}
                    title={null}
                    subtitle={null}
                  />
                  {birthSaveError && (
                    <p role="alert" className="mt-4 text-center text-base font-serif text-amber-200">
                      {birthSaveError}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.room}>
      <BirthChartCalculator isDayMode={isDayMode} />

      <header className={styles.threshold} aria-label="Astrology room navigation">
        <Link href="/house" className={styles.brand} aria-label="Return to the House">
          <img src="/holoflower-studio-transparent.png" alt="" />
          <span>SOULLAB</span>
        </Link>
        <div className={styles.roomName}>
          <span>THE HOUSE</span>
          <b>ASTROLOGY</b>
        </div>
        <Link href="/house" className={styles.return}>Return to House →</Link>
      </header>

      <div className={styles.content}>
        <section className={styles.arrival}>
          <div>
            <p className={styles.kicker}>ASTROLOGY · NATAL CHART</p>
            <h1>A symbolic map of your sky at birth.</h1>
            <p className={styles.lead}>
              Your chart begins with calculated positions. Symbolic traditions can help us think with those patterns,
              but they do not tell you who you are.
            </p>
          </div>
          <aside className={styles.boundary}>
            <small>THE CHART IS A LENS</small>
            <p>Facts can be calculated. Interpretation remains provisional. Lived meaning belongs to you.</p>
          </aside>
        </section>

        <section className={styles.atlas} aria-label="Whole-chart orientation">
          <div className={styles.atlasPaper}>
            <div className={styles.atlasHead}>
              <div>
                <small>CALCULATED CHART FACTS</small>
                <h2>Your chart at first glance</h2>
              </div>
              <p>Three familiar entry points, held as coordinates within the whole chart rather than definitions of the person.</p>
            </div>

            <div className={styles.factGrid}>
              <article className={styles.fact}>
                <small>SUN</small>
                <h3>{chartData.sun.sign} · {chartData.sun.degree.toFixed(1)}°</h3>
                <p>House {chartData.sun.house}</p>
                <Link href="/astrology/placements/sun" prefetch={false}>Explore this placement →</Link>
              </article>
              <article className={styles.fact}>
                <small>MOON</small>
                <h3>{chartData.moon.sign} · {chartData.moon.degree.toFixed(1)}°</h3>
                <p>House {chartData.moon.house}</p>
                <Link href="/astrology/placements/moon" prefetch={false}>Explore this placement →</Link>
              </article>
              <article className={styles.fact}>
                <small>ASCENDANT</small>
                <h3>{chartData.ascendant.sign} · {chartData.ascendant.degree.toFixed(1)}°</h3>
                <p>The eastern horizon at birth.</p>
                <Link href="/astrology/placements/ascendant" prefetch={false}>Explore this placement →</Link>
              </article>
            </div>

            <div className={styles.elemental}>
              <div className={styles.elementalHead}>
                <span>ELEMENTAL EMPHASIS</span>
                <em>Derived from the chart’s inner planets; not a personality score.</em>
              </div>
              <div className={styles.elementGrid}>
                <div><span>Fire</span><b>{Math.round(elementalBalance.fire * 100)}%</b></div>
                <div><span>Water</span><b>{Math.round(elementalBalance.water * 100)}%</b></div>
                <div><span>Earth</span><b>{Math.round(elementalBalance.earth * 100)}%</b></div>
                <div><span>Air</span><b>{Math.round(elementalBalance.air * 100)}%</b></div>
              </div>
            </div>
          </div>
        </section>

        <WhatIsAliveNow
          natal={transitNatal}
          natalAspects={chartData?.aspects ?? []}
          focusActivationId={fieldActivationFocus}
          reflectionContext={memberId ? {
            zodiacMode: zodiacMode === 'sidereal' ? 'sidereal' : 'tropical',
            houseSystem,
            ayanamsa: zodiacMode === 'sidereal' ? ayanamsa : null,
          } : undefined}
          onField={setTransitField}
          onShowOnWheel={showActivationOnWheel}
          onBringToMaia={memberId ? bringActivationToMaia : undefined}
        />

        <section className={styles.lensBar}>
          <div className={styles.lensCopy}>
            <small>CURRENT LENS</small>
            <h2>Tropical · {HOUSE_SYSTEMS.find(s => s.value === houseSystem)?.label || 'Porphyry'}</h2>
            <p>Change the lens when the question changes. The underlying birth chart remains the same member-owned source.</p>
            <div className="mt-4">
              <ZodiacToggle
                value={zodiacMode}
                onChange={setZodiacModeAndPersist}
                ayanamsa={ayanamsa}
                onAyanamsaChange={setAyanamsaAndPersist}
              />
            </div>
          </div>
          <div className={styles.lensActions}>
            <Link href="/astrology/report" className={styles.reportLink}>Open the full chart report →</Link>
            {memberId ? (
              <button type="button" className={styles.maiaDoor} onClick={() => setMaiaOpen(true)}>
                <MessageCircle aria-hidden="true" />
                Explore this chart with MAIA
              </button>
            ) : null}
          </div>
        </section>

        {maiaOpen && memberId ? (
          <section className={styles.maiaEncounter} aria-label="Explore this chart with MAIA">
            <article className={styles.chartAnchor}>
              <div className={styles.chartAnchorHead}>
                <div>
                  <small>THE CHART REMAINS IN VIEW</small>
                  <h2>Selected calculated facts</h2>
                </div>
                <button type="button" onClick={closeMaiaEncounter} aria-label="Close MAIA conversation">
                  <X aria-hidden="true" />
                </button>
              </div>

              <div className={styles.chartFactList}>
                <div><span>Sun</span><strong>{chartData.sun.sign} · {chartData.sun.degree.toFixed(1)}° · House {chartData.sun.house}</strong></div>
                <div><span>Moon</span><strong>{chartData.moon.sign} · {chartData.moon.degree.toFixed(1)}° · House {chartData.moon.house}</strong></div>
                <div><span>Ascendant</span><strong>{chartData.ascendant.sign} · {chartData.ascendant.degree.toFixed(1)}°</strong></div>
              </div>

              {primaryAspectReadings.length ? (
                <div className={styles.chartAspectFacts}>
                  <small>SELECTED RELATIONSHIPS</small>
                  {primaryAspectReadings.slice(0,4).map((aspect,index) => (
                    <p key={aspect.planet1 + '-' + aspect.type + '-' + aspect.planet2 + '-' + index}>
                      {aspect.planet1} {aspect.type} {aspect.planet2} · {aspect.orb.toFixed(1)}° orb
                    </p>
                  ))}
                </div>
              ) : null}

              <div className={styles.contextConsent}>
                <small>CONTEXT STAYS WITH YOU UNTIL YOU SEND IT</small>
                <p>
                  Opening MAIA does not send your chart. The conversation knows only that you are in Astrology
                  until you explicitly bring these selected chart facts into it.
                </p>
                <button type="button" onClick={bringChartFactsToMaia}>
                  {chartContextShared ? 'Bring the current chart facts again' : 'Bring these chart facts to MAIA'} <span>→</span>
                </button>
              </div>
            </article>

            <div className={styles.maiaChamber}>
              <div className={styles.maiaChamberHead}>
                <div>
                  <span className={styles.orb} aria-hidden="true" />
                  <div>
                    <small>MAIA · ASTROLOGY</small>
                    <strong>Think with the chart, not from above it</strong>
                  </div>
                </div>
                <button type="button" onClick={closeMaiaEncounter} aria-label="Return to Astrology">
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className={styles.maiaConversation}>
                <OracleConversation
                  userId={memberId}
                  sessionId={'astrology-natal-' + memberId}
                  presentationMode="contained"
                  initialShowChatInterface
                  voiceEnabled
                  includeStoredBirthData={false}
                  showAnalytics={false}
                  shouldRenderArrival={false}
                  surface="maia"
                  placeContext={{
                    placeId: 'astrology',
                    placeName: 'Astrology',
                    route: '/astrology',
                    purpose: 'A room for reflective orientation through a member-owned birth chart.',
                    objectType: 'natal_chart',
                    objectId: memberId,
                  }}
                  injectedMessage={maiaInjection}
                  onSessionEnd={closeMaiaEncounter}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.memberMeaning} aria-label="Your meaning">
          <div className={styles.memberMeaningIntro}>
            <small>YOUR MEANING</small>
            <h2>What do you recognize here?</h2>
            <p>
              Keep only what becomes true in your own experience. The chart can suggest a pattern and MAIA can reflect with you,
              but neither gets to author what it means for your life.
            </p>
          </div>

          {keptReflectionId ? (
            <div className={styles.keptMeaning}>
              <small>KEPT AS YOUR REFLECTION</small>
              <blockquote>{recognitionText}</blockquote>
              <div>
                <Link href={'/reflections/' + encodeURIComponent(keptReflectionId)}>Open this Reflection →</Link>
                <button type="button" onClick={beginAnotherRecognition}>Write another recognition</button>
              </div>
            </div>
          ) : (
            <div className={styles.memberMeaningWrite}>
              <textarea
                value={recognitionText}
                onChange={(event) => setRecognitionText(event.target.value)}
                placeholder="Write what you recognize — including what does not fit, what remains uncertain, or what becomes clearer in your own words."
                aria-label="What do you recognize here"
                rows={6}
              />
              <div className={styles.memberMeaningKeep}>
                <div>
                  <small>{recognitionText.trim() ? 'YOUR WORDS ONLY' : 'NOTHING IS KEPT YET'}</small>
                  <p>
                    {recognitionText.trim()
                      ? 'Keeping creates a Reflection from these exact words. MAIA’s interpretation is not copied.'
                      : 'Write first. Nothing from the chart or conversation is saved as your meaning automatically.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!recognitionText.trim() || recognitionSaving}
                  onClick={keepRecognitionAsReflection}
                >
                  {recognitionSaving ? 'Keeping…' : 'Keep this as a Reflection'}
                </button>
              </div>
              {recognitionError ? <p className={styles.memberMeaningError} role="alert">{recognitionError}</p> : null}
            </div>
          )}
        </section>

        <div className={styles.detailWrap}>
          {/* House Wheel & Planetary Positions */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* House Wheel */}
            <div id="house-wheel" className="bg-black/40 backdrop-blur-md border border-bene-gesserit-gold/30 rounded-lg p-6 shadow-xl overflow-visible relative" style={{ zIndex: 10, scrollMarginTop: 80 }}>
              <h3 className="text-dune-amber font-semibold mb-4 text-center">House Wheel</h3>

              {/* House System Selector & Transits Toggle */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* House System Dropdown */}
                <div className="flex-1 relative">
                  <label className="block text-xs text-amber-200/70 mb-1">House System</label>
                  <select
                    value={houseSystem}
                    onChange={(e) => handleHouseSystemChange(e.target.value as HouseSystemType)}
                    disabled={houseSystemLoading}
                    className="w-full bg-black/50 border border-bene-gesserit-gold/30 rounded-lg px-3 py-2 text-sm text-amber-200 appearance-none cursor-pointer hover:border-dune-amber/50 transition-colors disabled:opacity-50"
                  >
                    {HOUSE_SYSTEMS.map((sys) => (
                      <option key={sys.value} value={sys.value}>
                        {sys.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-7 w-4 h-4 text-amber-200/40 pointer-events-none" />
                  {houseSystemLoading && (
                    <div className="absolute right-8 top-7">
                      <div className="w-4 h-4 border-2 border-dune-amber/30 border-t-dune-amber rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Transits Toggle */}
                <div className="flex items-end">
                  <button
                    onClick={() => { setShowTransits(!showTransits); setWheelTransitFocus(null); }}
                    aria-pressed={showTransits}
                    title="Show the current sky's geometry on the wheel"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      showTransits
                        ? 'bg-dune-amber/20 border-dune-amber text-dune-amber'
                        : 'bg-black/30 border-bene-gesserit-gold/30 text-amber-200/90 hover:border-dune-amber/50'
                    }`}
                  >
                    {transitLoading ? (
                      <div className="w-4 h-4 border-2 border-dune-amber/30 border-t-dune-amber rounded-full animate-spin" />
                    ) : (
                      <span className="text-lg">🌙</span>
                    )}
                    <span className="text-sm">Transits on chart</span>
                  </button>
                </div>
              </div>

              {/* House System Description + Fallback footnote */}
              <div className="mb-3">
                <p className="text-amber-200/70 text-xs text-center italic">
                  {HOUSE_SYSTEMS.find(s => s.value === houseSystem)?.description || 'Click a planet on the wheel for insights'}
                </p>
                {HOUSE_SYSTEMS.find(s => s.value === houseSystem)?.fallback && (
                  <p className="text-amber-200/60 text-[10px] mt-1 text-center">
                    *Uses Porphyry calculation — true {houseSystem === 'placidus' ? 'Placidus' : 'Koch'} requires complex iterative solving
                  </p>
                )}
              </div>

              {/* Collapsible House System Guide */}
              <div className="mb-4">
                <button
                  onClick={() => setShowHouseGuide(!showHouseGuide)}
                  className="w-full flex items-center justify-center gap-1 text-amber-200/60 hover:text-amber-200/70 text-[10px] transition-colors"
                >
                  <span>Which lens fits your inquiry?</span>
                  {showHouseGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence>
                  {showHouseGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3 bg-black/30 rounded-lg border border-bene-gesserit-gold/20 text-[10px] text-amber-200/70 space-y-2">
                        <p><span className="text-dune-amber">Inner growth:</span> Koch — how you unfold through thresholds</p>
                        <p><span className="text-dune-amber">Timing & transits:</span> Whole Sign — cleanest for house-based prediction</p>
                        <p><span className="text-dune-amber">Soul story:</span> Whole Sign — each sign a chapter of the journey</p>
                        <p><span className="text-dune-amber">Lived experience:</span> Placidus — where life pressure actually lands</p>
                        <p><span className="text-dune-amber">Clean structure:</span> Equal — stable, straightforward for learning</p>
                        <p><span className="text-dune-amber">Destiny spine:</span> Porphyry — crisp identity + vocation clarity</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <SacredHouseWheel
                planets={chartDataToPlanets(chartData)}
                aspects={(chartData.aspects || [])
                  .filter((a): a is typeof a & { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' } =>
                    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
                  )}
                transits={showTransits
                  ? (transitField
                      ? transitField.sky.map((p) => ({ planet: p.body, sign: p.sign, degree: p.degree, longitude: p.longitude }))
                      : transitPositions)
                  : undefined}
                transitAspects={showTransits ? wheelTransitAspects : undefined}
                onTransitSelect={(transit, aspects) => openTransitFromWheel(transit.planet, aspects)}
                missionLayerSettings={{
                  showEmerging: false,
                  showActive: false,
                  showCompleted: false,
                  showUrgent: false,
                  showArchetypal: false,
                  showTransits: showTransits,
                }}
                isDayMode={false}
                layoutMode="traditional"
                showAspects={true}
                className="max-h-[500px]"
              />
            </div>

            {/* Planetary Positions - Clickable with Insights */}
            <div className="bg-black/40 backdrop-blur-md border border-bene-gesserit-gold/30 rounded-lg p-6 shadow-xl">
              <h3 className="text-dune-amber font-semibold mb-4">
                Planetary Positions
                {zodiacMode === 'sidereal' && (
                  <span className="text-indigo-400 text-sm font-normal ml-2">(Sidereal)</span>
                )}
              </h3>
              <p className="text-amber-200/70 text-xs mb-4 italic">Click a planet to reveal archetypal insights</p>
              <div className="space-y-1 text-sm max-h-[500px] overflow-y-auto text-amber-200">
                {[
                  { name: 'Sun', icon: '☉', data: chartData.sun },
                  { name: 'Moon', icon: '☽', data: chartData.moon },
                  { name: 'Mercury', icon: '☿', data: chartData.mercury },
                  { name: 'Venus', icon: '♀', data: chartData.venus },
                  { name: 'Mars', icon: '♂', data: chartData.mars },
                  { name: 'Jupiter', icon: '♃', data: chartData.jupiter },
                  { name: 'Saturn', icon: '♄', data: chartData.saturn },
                  { name: 'Uranus', icon: '♅', data: chartData.uranus },
                  { name: 'Neptune', icon: '♆', data: chartData.neptune },
                  { name: 'Pluto', icon: '♇', data: chartData.pluto },
                  { name: 'Chiron', icon: '⚷', data: chartData.chiron },
                  { name: 'North Node', icon: '☊', data: chartData.northNode },
                  { name: 'South Node', icon: '☋', data: chartData.southNode },
                  { name: 'Lilith', icon: '⚸', data: chartData.lilith },
                  { name: 'Ceres', icon: '⚳', data: chartData.ceres },
                  { name: 'Pallas', icon: '⚴', data: chartData.pallas },
                  { name: 'Juno', icon: '⚵', data: chartData.juno },
                  { name: 'Vesta', icon: '⚶', data: chartData.vesta },
                ].filter(p => p.data?.sign).map(({ name, icon, data }) => {
                  const isExpanded = expandedPlanet === name;

                  // Calculate display position (sidereal or tropical)
                  const siderealPos = zodiacMode === 'sidereal' ? getSiderealPosition(data) : null;
                  const displaySign = siderealPos?.sign || data?.sign;
                  const displayDegree = siderealPos?.degree ?? data?.degree;

                  const zodiacArchetype = displaySign ? getZodiacArchetype(displaySign) : null;
                  const planetArchetype = getPlanetaryArchetype(name);
                  const houseData = data?.house ? getSpiralogicHouseData(data.house) : null;
                  const element = zodiacArchetype?.element || 'fire';
                  const elementStyle = elementalColors[element as keyof typeof elementalColors];
                  const planetAspects = chartData.aspects?.filter(
                    a => a.planet1 === name || a.planet2 === name
                  ) || [];

                  return (
                    <div key={name}>
                      {/* Planet Row - Clickable */}
                      <div
                        className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isExpanded
                            ? 'bg-dune-amber/10 border border-dune-amber/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                        onClick={() => setExpandedPlanet(isExpanded ? null : name)}
                      >
                        <span className="text-amber-200/90 flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          {name}
                          {(data as PlanetPosition)?.retrograde && <span className="text-red-400 text-xs">℞</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={zodiacMode === 'sidereal' ? 'text-indigo-300' : 'text-dune-amber'}>
                            {displaySign} {displayDegree?.toFixed(1)}°
                            <span className="text-amber-200/70 ml-2">H{(data as PlanetPosition)?.house}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-dune-amber/60" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-amber-200/40" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Insight Panel */}
                      <AnimatePresence>
                        {isExpanded && data?.sign && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mx-2 mb-3 p-4 rounded-lg border"
                              style={{
                                background: `linear-gradient(135deg, ${elementStyle.color}10, transparent)`,
                                borderColor: `${elementStyle.color}30`,
                              }}
                            >
                              {/* Element & Modality Tags */}
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                                  style={{ background: `${elementStyle.color}20`, color: elementStyle.color }}
                                >
                                  {zodiacArchetype?.element || 'Unknown'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-amber-200/80 uppercase tracking-wide">
                                  {zodiacArchetype?.modality || 'Unknown'}
                                </span>
                                {zodiacArchetype?.temperament && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 uppercase tracking-wide">
                                    {zodiacArchetype.temperament}
                                  </span>
                                )}
                              </div>

                              {/* Archetype Info */}
                              <div className="space-y-3">
                                {/* Planetary Archetype */}
                                <div>
                                  <h5 className="text-xs uppercase tracking-wider text-amber-200/70 mb-1">
                                    {name} symbolism
                                  </h5>
                                  <p className="text-amber-200/90 text-sm font-medium">
                                    {planetArchetype?.archetype || 'The Guide'}
                                  </p>
                                  <p className="text-amber-200/70 text-xs mt-1">
                                    {planetArchetype?.description}
                                  </p>
                                </div>

                                {/* Sign Facet */}
                                <div>
                                  <h5 className="text-xs uppercase tracking-wider text-amber-200/70 mb-1">
                                    {data.sign} symbolism
                                  </h5>
                                  <p className="text-dune-amber text-sm font-medium">
                                    {zodiacArchetype?.facetName}
                                  </p>
                                  {zodiacArchetype?.archetypes?.mythological && (
                                    <p className="text-amber-200/70 text-xs mt-1 italic">
                                      {zodiacArchetype.archetypes.mythological.slice(0, 2).join(', ')}
                                    </p>
                                  )}
                                </div>

                                {/* House Activation */}
                                {houseData && (
                                  <div>
                                    <h5 className="text-xs uppercase tracking-wider text-amber-200/70 mb-1">
                                      House {(data as PlanetPosition).house} symbolism
                                    </h5>
                                    <p className="text-amber-200/90 text-sm font-medium">
                                      {houseData.facet}
                                    </p>
                                    <p className="text-amber-200/70 text-xs mt-1">
                                      {houseData.lesson}
                                    </p>
                                  </div>
                                )}

                                {/* Aspects */}
                                {planetAspects.length > 0 && (
                                  <div>
                                    <h5 className="text-xs uppercase tracking-wider text-amber-200/70 mb-1">
                                      Connections ({planetAspects.length})
                                    </h5>
                                    <div className="space-y-1">
                                      {planetAspects.slice(0, 3).map((aspect, idx) => {
                                        const otherPlanet = aspect.planet1 === name ? aspect.planet2 : aspect.planet1;
                                        const aspectSynthesis = synthesizeAspect(
                                          name,
                                          otherPlanet,
                                          aspect.type as AspectType
                                        );
                                        return (
                                          <div key={idx} className="text-xs">
                                            <span className={`font-medium ${
                                              aspect.type === 'conjunction' ? 'text-amber-400' :
                                              aspect.type === 'trine' ? 'text-blue-400' :
                                              aspect.type === 'square' ? 'text-red-400' :
                                              aspect.type === 'opposition' ? 'text-purple-400' :
                                              'text-green-400'
                                            }`}>
                                              {aspect.type}
                                            </span>
                                            <span className="text-amber-200/70"> with {otherPlanet}</span>
                                            {aspectSynthesis?.coreQuestion && (
                                              <p className="text-amber-200/70 text-xs italic mt-0.5 pl-2 border-l border-white/10">
                                                {aspectSynthesis.coreQuestion}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                      {planetAspects.length > 3 && (
                                        <p className="text-amber-200/60 text-xs italic">
                                          +{planetAspects.length - 3} more
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* One symbolic synthesis — not a calculated fact */}
                              {generateArchetypalDescription(name, data.sign, (data as PlanetPosition).house) && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <h5 className="text-xs uppercase tracking-wider text-amber-200/70 mb-1">
                                    One symbolic synthesis
                                  </h5>
                                  <p className="text-xs italic text-dune-amber/80">
                                    "{generateArchetypalDescription(name, data.sign, (data as PlanetPosition).house)}"
                                  </p>
                                  <p className="text-xs text-amber-200/60 mt-1">
                                    Read as a possibility to test against lived experience, not as a statement of identity.
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <section className={styles.interpretiveField} aria-label="Chart interpretation">
            <header className={styles.interpretiveHead}>
              <div>
                <small>THE CHART IN RELATION</small>
                <h2>Patterns to hold together</h2>
              </div>
              <p>
                These are not conclusions about you. They are selected relationships in the chart,
                read through one symbolic tradition and offered as questions rather than verdicts.
              </p>
            </header>

            <div className={styles.aspectReadingGrid}>
              {primaryAspectReadings.length ? primaryAspectReadings.map((aspect, index) => {
                const possibleGift = aspect.synthesis?.giftExpression
                  ?.replace(/^When integrated:\s*/i, '')
                  .replace(/^When mature:\s*/i, '');
                const possibleDifficulty = aspect.synthesis?.shadowExpression
                  ?.replace(/^When unconscious:\s*/i, '')
                  .replace(/^When reactive:\s*/i, '');

                return (
                  <article className={styles.aspectReading} key={aspect.planet1 + '-' + aspect.type + '-' + aspect.planet2 + '-' + index}>
                    <div className={styles.layer}>
                      <small>CALCULATED RELATION</small>
                      <h3>{aspect.planet1} {aspect.type} {aspect.planet2}</h3>
                      <p>{aspect.orb.toFixed(1)}° orb</p>
                    </div>

                    <div className={styles.layer}>
                      <small>SYMBOLIC TRADITION</small>
                      <p>{aspect.synthesis?.elementalDynamic || 'A traditional aspect relationship between these two planetary functions.'}</p>
                    </div>

                    {possibleGift ? (
                      <div className={styles.layer}>
                        <small>ONE POSSIBLE EXPRESSION</small>
                        <p>{possibleGift}</p>
                      </div>
                    ) : null}

                    {possibleDifficulty ? (
                      <div className={styles.layer}>
                        <small>ONE POSSIBLE COUNTERPOINT</small>
                        <p>{possibleDifficulty}</p>
                      </div>
                    ) : null}

                    {aspect.synthesis?.coreQuestion ? (
                      <div className={styles.memberQuestion}>
                        <small>FOR YOUR OWN RECOGNITION</small>
                        <p>{aspect.synthesis.coreQuestion}</p>
                      </div>
                    ) : null}

                    <Link href={'/astrology/aspects/' + aspect.planet1.toLowerCase() + '-' + aspect.type + '-' + aspect.planet2.toLowerCase()}>
                      Open this aspect →
                    </Link>
                  </article>
                );
              }) : (
                <p className={styles.noInterpretation}>No major aspect interpretation from the current library is available for this chart.</p>
              )}
            </div>
          </section>

          {(chartData.northNode || chartData.southNode) && (
            <section className={styles.nodeField} aria-label="Lunar node lens">
              <header>
                <div>
                  <small>ONE SYMBOLIC TRADITION</small>
                  <h2>The lunar nodes as an evolutionary lens</h2>
                </div>
                <p>
                  Many modern Western astrology schools read the nodes as a tension between familiar patterning
                  and qualities to explore. That is a symbolic tradition, not a calculated statement about destiny or past lives.
                </p>
              </header>

              <div className={styles.nodeGrid}>
                {chartData.northNode ? (
                  <article>
                    <small>CALCULATED NORTH NODE</small>
                    <h3>{chartData.northNode.sign} · {chartData.northNode.degree.toFixed(1)}°</h3>
                    <p>House {chartData.northNode.house}</p>
                    <div>
                      <span>TRADITIONAL READING</span>
                      <p>
                        This lens often treats the North Node as qualities worth experimenting with.
                        Here the symbolic vocabulary is {getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.facetName?.toLowerCase() || chartData.northNode.sign.toLowerCase()}.
                      </p>
                    </div>
                  </article>
                ) : null}

                {chartData.southNode ? (
                  <article>
                    <small>CALCULATED SOUTH NODE</small>
                    <h3>{chartData.southNode.sign} · {chartData.southNode.degree.toFixed(1)}°</h3>
                    <p>House {chartData.southNode.house}</p>
                    <div>
                      <span>TRADITIONAL READING</span>
                      <p>
                        This lens often treats the South Node as familiar or well-practiced patterning.
                        Here the symbolic vocabulary is {getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.facetName?.toLowerCase() || chartData.southNode.sign.toLowerCase()}.
                      </p>
                    </div>
                  </article>
                ) : null}
              </div>
            </section>
          )}

          <section className={styles.currentSky} aria-label="Current sky">
            <header>
              <div>
                <small>NOW · CALCULATED SKY</small>
                <h2>The current sky is a separate layer</h2>
              </div>
              <p>
                Current planetary positions are facts about the sky now. They become natal activations only when
                an actual aspect to your birth chart is calculated.
              </p>
            </header>

            {!showTransits ? (
              <button type="button" onClick={() => setShowTransits(true)}>Show the current sky →</button>
            ) : transitLoading ? (
              <p className={styles.skyStatus}>Calculating the current positions…</p>
            ) : transitPositions.length ? (
              <>
                <div className={styles.skyGrid}>
                  {transitPositions.slice(0, 10).map((transit) => (
                    <div key={transit.planet}>
                      <small>{transit.planet}</small>
                      <strong>{transit.sign} · {transit.degree.toFixed(1)}°</strong>
                    </div>
                  ))}
                </div>
                <p className={styles.skyBoundary}>
                  No natal influence is inferred here. This view shows the current sky only.
                </p>
                <button type="button" onClick={() => setShowTransits(false)}>Hide current sky</button>
              </>
            ) : (
              <p className={styles.skyStatus}>The current sky could not be calculated just now.</p>
            )}
          </section>

          {/* Alien Patterns — Steinbrecher transpersonal forces */}
          {alienPatterns.length > 0 && (
          <div className="bg-black/40 backdrop-blur-md border border-amber-800/30 rounded-lg p-6 mb-12 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-xs tracking-widest uppercase mb-2 text-amber-500/60">
                STEINBRECHER LENS
              </p>
              <h2 className="text-xl font-medium tracking-wide text-dune-amber mb-3">
                One symbolic reading of outer-planet patterns
              </h2>
              <div className="max-w-2xl mx-auto text-sm text-amber-200/70 leading-relaxed space-y-2">
                <p>
                  In the Inner Guide Meditation tradition, certain natal configurations are interpreted through what Edward Steinbrecher called &ldquo;alien patterns&rdquo; — a symbolic framework for reading contacts between outer planets and personal points.
                </p>
                <p>
                  Soullab presents this as one tradition, not as a fact about what operates through you. The configuration is calculated; the meaning belongs to the interpretive framework and remains something to test against lived experience.
                </p>
                <p className="text-amber-200/50 text-xs italic">
                  In this tradition: Power names a Sun contact · Vessel names a Moon contact · Instrument names a first-house/Ascendant contact · Adept names an absent element or mode.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {alienPatterns.map((pattern, i) => (
                <div
                  key={i}
                  className="bg-black/30 border border-amber-800/20 rounded-lg p-5"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-serif text-lg text-dune-amber">
                      {pattern.type === 'adept'
                        ? pattern.label
                        : `${pattern.planet ? pattern.planet.charAt(0).toUpperCase() + pattern.planet.slice(1) : ''} force present`
                      }
                    </h3>
                    <span className="text-xs text-amber-200/50">
                      {pattern.type === 'adept'
                        ? pattern.type
                        : `${pattern.label}${pattern.orb !== undefined ? ` · ${pattern.orb}°` : ''}`
                      }
                    </span>
                  </div>
                  <div className={styles.traditionQuote}>
                    <small>THIS TRADITION DESCRIBES THE PATTERN AS</small>
                    <p>{pattern.description}</p>
                  </div>
                  {pattern.livePrompt && (
                    <p className="text-sm italic mt-3 pt-3 border-t border-amber-800/10 text-amber-300/60">
                      {pattern.livePrompt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Spiralogic Pathways */}
          <div className="bg-black/40 backdrop-blur-md border border-spice-orange/30 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-medium tracking-wide text-dune-amber mb-6">Spiralogic Pathways</h2>
            <p className="text-amber-200/90 mb-6 text-sm tracking-wide">
              The 12 houses organized by elemental pathways and consciousness functions
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fire Pathway */}
              <Link
                href="/astrology/pathways/fire"
                className="group bg-black/30 border border-spice-orange/40 hover:border-spice-orange/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-spice-orange/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-amber">Fire Pathway</h3>
                    <p className="text-sm text-amber-200/90">Houses 1, 5, 9 · Vision & Projection</p>
                  </div>
                </div>
                <p className="text-amber-200/90 group-hover:text-spice-orange transition-colors">
                  Experience → Expression → Expansion
                </p>
              </Link>

              {/* Water Pathway */}
              <Link
                href="/astrology/pathways/water"
                className="group bg-black/30 border border-fremen-azure/40 hover:border-fremen-azure/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-fremen-azure/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">💧</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-amber">Water Pathway</h3>
                    <p className="text-sm text-amber-200/90">Houses 4, 8, 12 · Introspection & Depth</p>
                  </div>
                </div>
                <p className="text-amber-200/90 group-hover:text-sky-400 transition-colors">
                  Heart → Healing → Holiness
                </p>
              </Link>

              {/* Earth Pathway */}
              <Link
                href="/astrology/pathways/earth"
                className="group bg-black/30 border border-atreides-green/40 hover:border-atreides-green/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-atreides-green/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🌍</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-amber">Earth Pathway</h3>
                    <p className="text-sm text-amber-200/90">Houses 2, 6, 10 · Manifestation & Grounding</p>
                  </div>
                </div>
                <p className="text-amber-200/90 group-hover:text-green-400 transition-colors">
                  Mission → Means → Medicine
                </p>
              </Link>

              {/* Air Pathway */}
              <Link
                href="/astrology/pathways/air"
                className="group bg-black/30 border border-bene-gesserit-gold/40 hover:border-bene-gesserit-gold/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-bene-gesserit-gold/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🌬</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-amber">Air Pathway</h3>
                    <p className="text-sm text-amber-200/90">Houses 3, 7, 11 · Communication & Connection</p>
                  </div>
                </div>
                <p className="text-amber-200/90 group-hover:text-yellow-400 transition-colors">
                  Connection → Community → Consciousness
                </p>
              </Link>
            </div>

            {/* Deep Dive Link */}
            <div className="mt-8">
              <Link
                href="/deep-dive"
                className="group block bg-black/30 hover:bg-black/50 border border-spice-orange/40 hover:border-spice-orange/70 rounded-xl p-8 transition-all duration-300 shadow-lg hover:shadow-spice-orange/20"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">📖</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dune-amber group-hover:text-spice-orange transition-colors mb-2">
                      The Deep Dive: Elemental Alchemy
                    </h3>
                    <p className="text-amber-200/90 mb-3">
                      Go beyond your chart into the phenomenological journey through consciousness.
                      Kelly Nezat's book as living curriculum.
                    </p>
                    <div className="flex items-center gap-2 text-spice-glow text-sm">
                      <span>Begin your transformation</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Cross-System Convergence */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-amber-200/90">
                  Additional Wisdom Systems
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="What does cross-system convergence mean?"
                        className="inline-flex items-center"
                      >
                        <Info className="w-4 h-4 text-amber-200/40 hover:text-amber-200/70" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{getTooltip('s', resolvedMode)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-amber-200/70 mb-4">
                {CARD_COPY[resolvedMode]}
              </p>

              {isPersonal ? (
                /* Paid user - full access */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vedic Astrology */}
                  <Link
                    href="/astrology/vedic"
                    className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-indigo-500/40 hover:border-indigo-500/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20"
                  >
                    <div className="text-4xl">🕉️</div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-dune-amber group-hover:text-indigo-300 transition-colors">
                        Vedic Astrology
                      </h3>
                      <p className="text-amber-200/90 text-sm">
                        Explore your sidereal chart, nakshatra, and Vimshottari Dasha periods →
                      </p>
                    </div>
                  </Link>

                  {/* Mayan Astrology */}
                  <Link
                    href="/astrology/mayan"
                    className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-bene-gesserit-gold/40 hover:border-bene-gesserit-gold/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-bene-gesserit-gold/20"
                  >
                    <div className="text-4xl">☀️</div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-dune-amber group-hover:text-yellow-400 transition-colors">
                        Mayan Astrology
                      </h3>
                      <p className="text-amber-200/90 text-sm">
                        Discover your Galactic Signature in the Tzolk&apos;in Sacred Calendar →
                      </p>
                    </div>
                  </Link>

                  {/* Chinese Astrology */}
                  <Link
                    href="/astrology/chinese"
                    className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-red-500/40 hover:border-red-500/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                  >
                    <div className="text-4xl">🐉</div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-dune-amber group-hover:text-red-400 transition-colors">
                        Chinese Astrology
                      </h3>
                      <p className="text-amber-200/90 text-sm">
                        Explore your zodiac animal, element, and traditional cycle symbolism →
                      </p>
                    </div>
                  </Link>

                  {/* Synastry */}
                  <Link
                    href="/astrology/synastry"
                    className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-violet-500/40 hover:border-violet-500/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-violet-500/20"
                  >
                    <div className="text-4xl">💞</div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-dune-amber group-hover:text-violet-300 transition-colors">
                        Synastry
                      </h3>
                      <p className="text-amber-200/90 text-sm">
                        Compare two charts through relationship patterns and symbolic dynamics →
                      </p>
                    </div>
                  </Link>
                </div>
              ) : (
                /* Free user - preview with upgrade CTA */
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
                    {/* Vedic - locked preview */}
                    <div className="inline-flex items-center gap-3 bg-black/30 border border-indigo-500/30 rounded-xl p-6">
                      <div className="text-4xl opacity-50">🕉️</div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dune-amber/70 flex items-center gap-2">
                          Vedic Astrology
                          <Lock className="w-4 h-4" />
                        </h3>
                        <p className="text-amber-200/70 text-sm">
                          Sidereal chart, nakshatra, Dasha periods
                        </p>
                      </div>
                    </div>

                    {/* Mayan - locked preview */}
                    <div className="inline-flex items-center gap-3 bg-black/30 border border-bene-gesserit-gold/30 rounded-xl p-6">
                      <div className="text-4xl opacity-50">☀️</div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dune-amber/70 flex items-center gap-2">
                          Mayan Astrology
                          <Lock className="w-4 h-4" />
                        </h3>
                        <p className="text-amber-200/70 text-sm">
                          Galactic Signature, Tzolk&apos;in Calendar
                        </p>
                      </div>
                    </div>

                    {/* Chinese - locked preview */}
                    <div className="inline-flex items-center gap-3 bg-black/30 border border-red-500/30 rounded-xl p-6">
                      <div className="text-4xl opacity-50">🐉</div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dune-amber/70 flex items-center gap-2">
                          Chinese Astrology
                          <Lock className="w-4 h-4" />
                        </h3>
                        <p className="text-amber-200/70 text-sm">
                          Zodiac animal, element, and traditional cycle symbolism
                        </p>
                      </div>
                    </div>

                    {/* Synastry - locked preview */}
                    <div className="inline-flex items-center gap-3 bg-black/30 border border-violet-500/30 rounded-xl p-6">
                      <div className="text-4xl opacity-50">💞</div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-dune-amber/70 flex items-center gap-2">
                          Synastry
                          <Lock className="w-4 h-4" />
                        </h3>
                        <p className="text-amber-200/70 text-sm">
                          Chart comparison, relationship analysis
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade CTA overlay */}
                  <div className="mt-6 flex flex-col items-center text-center py-6 bg-black/40 rounded-xl border border-dune-amber/30">
                    <Lock className="w-8 h-8 text-dune-amber mb-3" />
                    <h3 className="text-lg font-medium text-dune-amber mb-2">
                      Unlock 4 Wisdom Systems
                    </h3>
                    <p className="text-amber-200/90 text-sm mb-4 max-w-md">
                      Access Vedic, Mayan, Chinese astrology and Synastry relationship analysis with Personal Mentor
                    </p>
                    <Link
                      href="/maia/membership"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-spice-orange/80 hover:bg-spice-orange text-amber-900 font-medium rounded-lg transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Upgrade to unlock
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Synastry - only show for paid users */}
            {isPersonal && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-amber-200">Saved Synastry</h2>
                    <p className="text-sm text-amber-200/70">Your recent relationship analyses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/astrology/synastry"
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-amber-200/70 hover:bg-white/15"
                    >
                      New
                    </Link>
                    <Link
                      href="/astrology/synastry/saved"
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-amber-200/70 hover:bg-white/15"
                    >
                      View all
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {savedSynastryLoading ? (
                    <>
                      <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
                      <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
                      <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
                    </>
                  ) : sortedSavedSynastry.length === 0 ? (
                    <div className="col-span-3 text-sm text-amber-200/70 py-4">
                      No saved synastry yet. Run one and hit <span className="text-amber-200/90">Save to Timeline</span>.
                    </div>
                  ) : (
                    sortedSavedSynastry.map((item) => {
                      const a = item.chartA?.sunSign ?? 'Person A';
                      const b = item.chartB?.sunSign ?? 'Person B';
                      const when = item.savedAt ? new Date(item.savedAt).toLocaleDateString() : '';
                      const s = item.scores ?? {};
                      return (
                        <Link
                          key={item.analysisId}
                          href={`/astrology/synastry/${item.analysisId}`}
                          className="group rounded-xl border border-white/10 bg-black/20 p-4 hover:border-violet-500/40 hover:bg-black/40 transition"
                        >
                          <div className="text-sm font-semibold text-amber-200 group-hover:text-violet-200">
                            {a} × {b}
                          </div>
                          <div className="mt-1 text-xs text-amber-200/60">Saved {when}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-amber-200/60">
                            {typeof s.attraction === 'number' && <span>A:{s.attraction.toFixed(1)}</span>}
                            {typeof s.harmony === 'number' && <span>H:{s.harmony.toFixed(1)}</span>}
                            {typeof s.friction === 'number' && <span>F:{s.friction.toFixed(1)}</span>}
                            {typeof s.growth === 'number' && <span>G:{s.growth.toFixed(1)}</span>}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}