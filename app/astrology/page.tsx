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
import { Sparkles, Flame, Droplet, Sprout, Wind, Sparkle, TrendingUp, Settings2, ChevronDown, ChevronUp, Info, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
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
import type { AlienPattern } from '@/lib/astrology/alienPatterns';

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
        const res = await fetch(
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
                const chartRes = await fetch('/api/astrology/birth-chart', {
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

    // Helper function to calculate elemental balance
    const calculateElementalBalance = (chart: BirthChartData) => {
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
    };

    loadChartData();
  }, []);

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

      const res = await fetch('/api/astrology/birth-chart', {
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

  // Fetch current transit positions
  const fetchTransits = async () => {
    setTransitLoading(true);
    try {
      const res = await fetch('/api/astrology/current-transits');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0d1b2e' }}>
        {/* Soft spiral unfurling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative z-10"
        >
          <Sparkle
            className={`w-12 h-12 ${isDayMode ? 'text-amber-600' : 'text-amber-400'} animate-pulse`}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className={`absolute mt-24 text-sm ${isDayMode ? 'text-amber-300' : 'text-amber-200'} font-serif italic`}
        >
          The cosmos remembers you...
        </motion.p>
      </div>
    );
  }

  if (!chartData || !hasBirthData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0d1b2e' }}>
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="text-center relative z-10">
          <div className="mx-auto mb-6 flex justify-center">
            <MiniHoloflower size={80} isDayMode={false} animated={true} />
          </div>
          {unresolvedReason ? (
            <>
              {/* UNAVAILABLE ≠ ABSENT. We could not establish the authenticated
                  member, so we do not know whether birth data exists. Saying
                  "enter your birth details" here would assert an absence we have
                  NOT established, and would invite someone who already has a
                  chart to re-enter it — the exact confusion that started this
                  investigation.
                  The two reasons are told apart because the honest remedy
                  differs: signing in vs waiting. Offering "try again" to a
                  signed-out person makes a permanent state look transient. */}
              <h2 className="text-2xl font-bold text-dune-amber mb-2">
                {unresolvedReason === 'signed-out'
                  ? 'Sign in to see your chart'
                  : 'We couldn’t reach your chart'}
              </h2>
              <p className="text-amber-200/90 mb-6 max-w-md mx-auto">
                {unresolvedReason === 'signed-out'
                  ? 'Your chart is tied to your account, so we need to know who you are before we can show it.'
                  : 'We couldn’t confirm your account just now, so we’re not showing a chart rather than risk showing the wrong one.'}
              </p>
              {unresolvedReason === 'signed-out' ? (
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-spice-orange/80 hover:bg-spice-orange text-amber-900 font-semibold rounded-lg transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Sign in
                </Link>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-spice-orange/80 hover:bg-spice-orange text-amber-900 font-semibold rounded-lg transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Try again
                </button>
              )}
            </>
          ) : (
            <>
              {/* Genuine absence: the server named the member and said they have
                  no birth data. The /journey destination is deliberately
                  UNCHANGED — where "Enter Birth Details" should lead is a
                  separate product ruling, outside this repair unit. */}
              <h2 className="text-2xl font-bold text-dune-amber mb-2">Your Cosmic Blueprint Awaits</h2>
              <p className="text-amber-200/90 mb-6 max-w-md mx-auto">
                Enter your birth details to unlock your personalized astrological map
              </p>
              <Link
                href="/journey"
                className="inline-flex items-center gap-2 px-6 py-3 bg-spice-orange/80 hover:bg-spice-orange text-amber-900 font-semibold rounded-lg transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Enter Birth Details
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d1b2e' }}>

      {/* Birth Chart Calculator - Upper Right Corner */}
      <BirthChartCalculator isDayMode={isDayMode} />

      {/* Arrakis Night Sky - Starfield */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() > 0.8 ? '2px' : '1px',
              height: Math.random() > 0.8 ? '2px' : '1px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
      </div>

      {/* Distant moons glow */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-spice-orange/10 rounded-full blur-3xl" />
      <div className="absolute top-40 left-32 w-24 h-24 bg-fremen-azure/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light tracking-wide !text-dune-amber mb-2">Your Cosmic Blueprint</h1>
            <p className="!text-amber-200 text-sm tracking-wider">Spiralogic Astrology: Elemental Pathways of Consciousness</p>

            {/* Zodiac System Toggle */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <ZodiacToggle
                value={zodiacMode}
                onChange={setZodiacModeAndPersist}
                ayanamsa={ayanamsa}
                onAyanamsaChange={setAyanamsaAndPersist}
              />
              {zodiacMode === 'sidereal' && (
                <p className="text-xs text-amber-200/70 mt-1">
                  Showing sidereal positions in Planetary Positions.{' '}
                  <Link href="/astrology/vedic" className="text-dune-amber hover:text-spice-glow underline">
                    Full Vedic Dashboard →
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Spiralogic Evolutionary Report CTA */}
          <div className="mb-8">
            <Link
              href="/astrology/report"
              className="flex items-center justify-between w-full p-5 border transition-colors group"
              style={{ borderColor: '#D88A2D60', backgroundColor: 'rgba(216,138,45,0.06)' }}
            >
              <div>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: '#9B6B3C', fontWeight: 300 }}>
                  Full Report
                </p>
                <p className="text-base font-serif" style={{ color: '#D88A2D', fontWeight: 300 }}>
                  Your Spiralogic Evolutionary Report
                </p>
                <p className="text-xs mt-1" style={{ color: '#8B7355', fontWeight: 300 }}>
                  All 12 facets · Karmic insights · Current transits · Integration practices
                </p>
              </div>
              <span className="text-lg ml-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: '#D88A2D' }}>→</span>
            </Link>
          </div>

          {/* Archetypal Profile */}
          <div className="bg-black/40 backdrop-blur-md border border-bene-gesserit-gold/40 rounded-lg p-6 mb-12 shadow-xl text-amber-200">
            <h2 className="text-xl font-medium tracking-wide !text-dune-amber mb-4">Your Archetypal Profile</h2>
            <p className="!text-amber-200/80 mb-6 text-sm tracking-wide">
              The core archetypal energies shaping your soul's journey
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 border border-spice-orange/30 rounded-lg p-4 text-amber-200">
                <h3 className="!text-spice-glow font-semibold mb-2">
                  {getZodiacArchetype(chartData.sun.sign.toLowerCase())?.facetName || 'The Explorer'}
                </h3>
                <p className="!text-amber-200/80 text-sm">
                  {chartData.sun.sign} Sun · {getZodiacArchetype(chartData.sun.sign.toLowerCase())?.archetypes?.jungian?.[0] || 'archetypal core identity'}
                </p>
              </div>
              <div className="bg-black/30 border border-fremen-azure/30 rounded-lg p-4 text-amber-200">
                <h3 className="!text-sky-300 font-semibold mb-2">
                  {getZodiacArchetype(chartData.moon.sign.toLowerCase())?.facetName || 'The Mystic'}
                </h3>
                <p className="!text-amber-200/80 text-sm">
                  {chartData.moon.sign} Moon · {getZodiacArchetype(chartData.moon.sign.toLowerCase())?.archetypes?.jungian?.[0] || 'inner emotional landscape'}
                </p>
              </div>
            </div>
          </div>

          {/* Big Three */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Sun */}
            <div className="bg-black/40 backdrop-blur-md border border-spice-orange/40 rounded-lg p-6 shadow-xl text-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spice-orange to-spice-deep flex items-center justify-center shadow-lg shadow-spice-orange/30">
                  <span className="text-2xl">☉</span>
                </div>
                <div>
                  <h3 className="!text-dune-amber font-semibold">Sun · Core Identity</h3>
                  <p className="text-sm !text-amber-200/80">Conscious Expression</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold !text-spice-glow">
                  {chartData.sun.sign} · {getZodiacArchetype(chartData.sun.sign.toLowerCase())?.facetName || 'The Explorer'}
                </p>
                <p className="text-sm !text-amber-200/70">
                  {chartData.sun.degree.toFixed(1)}° · House {chartData.sun.house}
                </p>
                <p className="text-sm !text-amber-200/90 italic mt-2">
                  {getZodiacArchetype(chartData.sun.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Archetypal essence'}
                </p>
                <Link
                  href={`/astrology/placements/sun`}
                  prefetch={false}
                  className="text-sm !text-orange-400 hover:!text-orange-300 hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Moon */}
            <div className="bg-black/40 backdrop-blur-md border border-fremen-azure/50 rounded-lg p-6 shadow-xl text-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fremen-azure to-dune-ibad-blue flex items-center justify-center shadow-lg shadow-fremen-azure/30">
                  <span className="text-2xl text-amber-200">☽</span>
                </div>
                <div>
                  <h3 className="!text-dune-amber font-semibold">Moon · Emotional Truth</h3>
                  <p className="text-sm !text-amber-200/80">Subconscious Landscape</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold !text-sky-300">
                  {chartData.moon.sign} · {getZodiacArchetype(chartData.moon.sign.toLowerCase())?.facetName || 'The Mystic'}
                </p>
                <p className="text-sm !text-amber-200/70">
                  {chartData.moon.degree.toFixed(1)}° · House {chartData.moon.house}
                </p>
                <p className="text-sm !text-amber-200/90 italic mt-2">
                  {getZodiacArchetype(chartData.moon.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Emotional archetype'}
                </p>
                <Link
                  href={`/astrology/placements/moon`}
                  prefetch={false}
                  className="text-sm !text-sky-400 hover:!text-sky-300 hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Ascendant */}
            <div className="bg-black/40 backdrop-blur-md border border-bene-gesserit-gold/40 rounded-lg p-6 shadow-xl text-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bene-gesserit-gold to-dune-sienna-rock flex items-center justify-center shadow-lg shadow-bene-gesserit-gold/30">
                  <span className="text-2xl">⇡</span>
                </div>
                <div>
                  <h3 className="!text-dune-amber font-semibold">Ascendant · Life Portal</h3>
                  <p className="text-sm !text-amber-200/80">How You Meet the World</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold !text-yellow-300">
                  {chartData.ascendant.sign} · {getZodiacArchetype(chartData.ascendant.sign.toLowerCase())?.facetName || 'The Sustainer'}
                </p>
                <p className="text-sm !text-amber-200/70">
                  {chartData.ascendant.degree.toFixed(1)}°
                </p>
                <p className="text-sm !text-amber-200/90 italic mt-2">
                  {getZodiacArchetype(chartData.ascendant.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Rising energy'}
                </p>
                <Link
                  href={`/astrology/placements/ascendant`}
                  prefetch={false}
                  className="text-sm !text-yellow-400 hover:!text-yellow-300 hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* House Wheel & Planetary Positions */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* House Wheel */}
            <div className="bg-black/40 backdrop-blur-md border border-bene-gesserit-gold/30 rounded-lg p-6 shadow-xl overflow-visible relative" style={{ zIndex: 10 }}>
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
                    onClick={() => setShowTransits(!showTransits)}
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
                    <span className="text-sm">Transits</span>
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
                transits={showTransits ? transitPositions : undefined}
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
                                    {name} Archetype
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
                                    {data.sign} Expression
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
                                      House {(data as PlanetPosition).house} Activation
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

                              {/* Synthesis Quote */}
                              {generateArchetypalDescription(name, data.sign, (data as PlanetPosition).house) && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-xs italic text-dune-amber/80">
                                    "{generateArchetypalDescription(name, data.sign, (data as PlanetPosition).house)}"
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

          {/* Major Aspects */}
          <div className="bg-black/40 backdrop-blur-md border border-spice-orange/30 rounded-lg p-6 mb-12 shadow-xl relative">
            <h2 className="text-xl font-medium tracking-wide text-dune-amber mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-spice-orange" />
              Major Aspects
            </h2>
            <p className="text-amber-200/90 mb-6 text-sm tracking-wide">
              Archetypal dynamics between planetary energies in your chart
            </p>

            {isPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartData.aspects.map((aspect, index) => {
                  const aspectIcon = aspect.type === 'square' ? '□' :
                    aspect.type === 'conjunction' ? '☌' :
                      aspect.type === 'trine' ? '△' :
                        aspect.type === 'quincunx' ? '⚻' : '○';

                  const aspectColor = aspect.type === 'square' ? 'text-red-400' :
                    aspect.type === 'conjunction' ? 'text-spice-orange' :
                      aspect.type === 'trine' ? 'text-green-400' :
                        'text-sky-400';

                  return (
                    <Link
                      key={index}
                      href={`/astrology/aspects/${aspect.planet1.toLowerCase()}-${aspect.type}-${aspect.planet2.toLowerCase()}`}
                      className="group bg-black/30 border border-spice-sand/20 hover:border-spice-orange/60 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-spice-orange/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl ${aspectColor}`}>{aspectIcon}</span>
                          <span className="text-dune-amber font-semibold">
                            {aspect.planet1} {aspect.type} {aspect.planet2}
                          </span>
                        </div>
                        <span className="text-xs text-amber-200/70">
                          {aspect.orb.toFixed(1)}° orb
                        </span>
                      </div>
                      <p className="text-sm text-amber-200/90 group-hover:text-spice-glow transition-colors">
                        Tap to explore archetypal interpretation →
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* Free user preview */
              <div className="relative">
                {/* Blurred preview of first 2 aspects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 blur-sm opacity-50 pointer-events-none">
                  {chartData.aspects.slice(0, 2).map((aspect, index) => {
                    const aspectIcon = aspect.type === 'square' ? '□' :
                      aspect.type === 'conjunction' ? '☌' :
                        aspect.type === 'trine' ? '△' : '○';
                    return (
                      <div key={index} className="bg-black/30 border border-spice-sand/20 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl text-spice-orange">{aspectIcon}</span>
                          <span className="text-dune-amber font-semibold">
                            {aspect.planet1} {aspect.type} {aspect.planet2}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Upgrade overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                  <Lock className="w-8 h-8 text-dune-amber mb-3" />
                  <p className="text-dune-amber font-medium mb-2">
                    {chartData.aspects.length} aspects in your chart
                  </p>
                  <p className="text-amber-200/90 text-sm mb-4 text-center px-4">
                    Unlock detailed aspect interpretations with Personal Mentor
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

          {/* North & South Nodes */}
          {(chartData.northNode || chartData.southNode) && (
          <div className="bg-black/40 backdrop-blur-md border border-navigator-purple/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-xl font-medium tracking-wide text-dune-amber mb-6 flex items-center gap-2">
              <span className="text-2xl">☊☋</span>
              North & South Nodes
            </h2>
            <p className="text-amber-200/90 mb-6 text-sm tracking-wide">
              Your soul's evolutionary path: past mastery and future growth
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* North Node */}
              {chartData.northNode && (
              <div className="bg-black/30 border border-atreides-green/40 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☊</span>
                  <h3 className="text-xl font-bold text-green-400">North Node</h3>
                </div>
                <p className="text-lg font-semibold text-dune-amber mb-2">
                  {chartData.northNode.sign} in {chartData.northNode.house}
                  {chartData.northNode.house === 1 ? 'st' :
                   chartData.northNode.house === 2 ? 'nd' :
                   chartData.northNode.house === 3 ? 'rd' : 'th'} House
                </p>
                <p className="text-sm text-amber-200/90 mb-2">
                  {chartData.northNode.degree.toFixed(1)}°
                </p>
                <p className="text-amber-200/90 text-sm mb-3">
                  Your soul's calling toward {getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.facetName?.toLowerCase() || 'growth'} energy.
                  {getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.archetypes?.mythological?.[0] &&
                   ` Embrace the archetype of ${getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.archetypes?.mythological?.[0]}.`}
                </p>
              </div>
              )}

              {/* South Node */}
              {chartData.southNode && (
              <div className="bg-black/30 border border-dune-sienna-rock/40 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☋</span>
                  <h3 className="text-xl font-bold text-orange-400">South Node</h3>
                </div>
                <p className="text-lg font-semibold text-dune-amber mb-2">
                  {chartData.southNode.sign} in {chartData.southNode.house}
                  {chartData.southNode.house === 1 ? 'st' :
                   chartData.southNode.house === 2 ? 'nd' :
                   chartData.southNode.house === 3 ? 'rd' : 'th'} House
                </p>
                <p className="text-sm text-amber-200/90 mb-2">
                  {chartData.southNode.degree.toFixed(1)}°
                </p>
                <p className="text-amber-200/90 text-sm mb-3">
                  Past life mastery in {getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.facetName?.toLowerCase() || 'expression'} energy.
                  {getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.archetypes?.mythological?.[0] &&
                   ` Release the shadow of ${getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.archetypes?.mythological?.[0]}.`}
                </p>
              </div>
              )}
            </div>
          </div>
          )}

          {/* Current Transits */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-spice-blue/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-xl font-medium tracking-wide text-dune-amber mb-6 flex items-center gap-2">
              <span className="text-lg">🌙</span>
              Current Transits & Activations
            </h2>
            <p className="text-amber-200/90 mb-6 text-sm tracking-wide">
              Planetary movements currently influencing your chart
            </p>

            <div className="space-y-4">
              <div className="bg-black/30 border border-spice-orange/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-spice-orange">Jupiter conjunct Natal Sun</h3>
                  <span className="text-xs text-amber-200/70">Active Now</span>
                </div>
                <p className="text-amber-200/90 text-sm">
                  A time of expansion and opportunity. Your philosophical nature is amplified, bringing growth in teaching, travel, or higher learning.
                </p>
              </div>

              <div className="bg-black/30 border border-fremen-azure/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sky-400">Saturn trine Natal Moon</h3>
                  <span className="text-xs text-amber-200/70">Approaching</span>
                </div>
                <p className="text-amber-200/90 text-sm">
                  Emotional maturity and structure. A supportive time for grounding feelings and building sustainable emotional foundations.
                </p>
              </div>
            </div>
          </div>

          {/* Alien Patterns — Steinbrecher transpersonal forces */}
          {alienPatterns.length > 0 && (
          <div className="bg-black/40 backdrop-blur-md border border-amber-800/30 rounded-lg p-6 mb-12 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-xs tracking-widest uppercase mb-2 text-amber-500/60">
                After Steinbrecher
              </p>
              <h2 className="text-xl font-medium tracking-wide text-dune-amber mb-3">
                Forces Active in Your Field
              </h2>
              <div className="max-w-2xl mx-auto text-sm text-amber-200/70 leading-relaxed space-y-2">
                <p>
                  In the Inner Guide Meditation tradition, certain natal configurations create what Edward Steinbrecher called &ldquo;alien patterns&rdquo; — places where transpersonal forces (Saturn, Uranus, Neptune, Pluto) fuse with personal points (Sun, Moon, Ascendant).
                </p>
                <p>
                  These are not personality labels. They describe archetypal forces that operate through you — whether you intend them to or not. Brought to consciousness through the guide work, they become precision instruments. Left unconscious, they manifest as compulsive patterns and intense reactions from others.
                </p>
                <p className="text-amber-200/50 text-xs italic">
                  Power = Sun fused with outer planet (you radiate it) · Vessel = Moon fused (you magnetize it in others) · Instrument = outer planet in 1st house (it operates through your body) · Adept = missing element or mode (you instinctively understand what you cannot easily access)
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
                  <p className="text-sm leading-relaxed text-amber-200/80">
                    {pattern.description}
                  </p>
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
                        Explore your zodiac animal, element, and cosmic destiny →
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
                        Compare two charts for harmony, friction, and soul-growth vectors →
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
                          Zodiac animal, element, cosmic destiny
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
    </div>
  );
}