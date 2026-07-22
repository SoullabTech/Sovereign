'use client';

/**
 * ArrivalPrototypeShell — DEV-ONLY Package 2 prototype (Premium Arrival direction).
 *
 * Composes the REAL MAIA components (no duplication, no logic changes):
 *   - holoflower:  <RhythmHoloflower> (components/liquid) fed idle/static props (no mic, no voice engagement)
 *   - greeting:    generateWelcomeGreeting() + resolveDisplayName() — real founder greeting from localStorage
 *   - composer:    <ModernTextInput> (components/ui) rendered INERT (no live conversation/mic/streaming controller)
 *   - worlds:      MAIA_WORLDS + getVisibleBoundaries() — real icons + routes, display-only
 *
 * Guardrails (see docs/plans/MAIA_PREMIUM_PROTOTYPE_PACKAGE2_BUILD_BRIEF_2026-07-22.md):
 *   - Six selectable dev views, in-memory only (NO persistence, NO default-state inference).
 *   - Splash is a dev view, never a gate: fully skippable, never recurs from lost localStorage.
 *   - Both Arrival variants (A explicit Begin · B immediate) shipped behind the switch.
 *   - Current surface preserved as a live comparison (same-origin iframe of /maia, lazy-mounted).
 *   - The real field visual is reproduced (stone gradient + spice particles + glow) MINUS the SOULLAB
 *     pill, so the working surface stays holoflower-only; no shared component is edited.
 */

import { useEffect, useMemo, useState } from 'react';
import { RhythmHoloflower } from '@/components/liquid/RhythmHoloflower';
import { ModernTextInput } from '@/components/ui/ModernTextInput';
import { generateWelcomeGreeting } from '@/lib/maia/welcomeGreeting';
import { resolveDisplayName } from '@/lib/services/greetingService';
import { MAIA_WORLDS, getVisibleBoundaries } from '@/lib/navigation/maiaNav';
import type { MaiaRailItem } from '@/lib/navigation/types';

type View = 'current' | 'splash' | 'signinA' | 'signinB' | 'arrivalA' | 'arrivalB' | 'arrivalC' | 'conversation' | 'house';

const VIEWS: { id: View; label: string }[] = [
  { id: 'current', label: 'Current' },
  { id: 'splash', label: 'Splash' },
  { id: 'signinA', label: 'Sign-in A' },
  { id: 'signinB', label: 'Sign-in B' },
  { id: 'arrivalA', label: 'Arrival A · Begin' },
  { id: 'arrivalB', label: 'Arrival B · Immediate' },
  { id: 'arrivalC', label: 'Arrival C · Emergent' },
  { id: 'conversation', label: 'In Conversation' },
  { id: 'house', label: 'The House' },
];

// SOULLAB wordmark — per-letter element colors (splash lockup only)
const SOULLAB = [
  ['S', '#D6A93C'], ['O', '#C8912F'], ['U', '#C0632B'], ['L', '#A8402A'],
  ['L', '#7A5A86'], ['A', '#3E6E9E'], ['B', '#4E8060'],
];

// Deterministic particle field (no Math.random → no hydration drift), mirrors MaiaCenterField's 30 spice dots
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  top: (i * 53 + 11) % 100,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.7,
  dur: 5 + (i % 5),
}));

// Match the live MAIA surface exactly: Spectral (loaded app-wide) + maia-spice gold.
const SERIF = 'Spectral, Georgia, "Iowan Old Style", Palatino, serif';

/** Reproduces the real /maia atmosphere (MaiaCenterField:87-120) minus the SOULLAB pill. */
// One deep-navy cosmos, different moods. Navy is the law; each surface gets its own emotional temperature:
//   wonder (Arrival)   — plum slightly up, holoflower alive: "something is alive here"
//   belonging (House)  — plum quieter, amber warmer: "you have come home"
function PrototypeField({ children, tone = 'wonder' }: { children: React.ReactNode; tone?: 'wonder' | 'belonging' }) {
  const plum = tone === 'belonging' ? 0.08 : 0.13;
  const amber = tone === 'belonging' ? 0.22 : 0.13;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'radial-gradient(110% 72% at 50% 10%, #0B1A30 0%, #071426 45%, #030814 100%)' }}>
      {/* deep-navy cosmos + subtle plum atmosphere (brand: navy foundation, plum as bloom only — holoflower is the jewel) */}
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-[46vmin] w-[46vmin] -translate-x-1/2 rounded-full blur-2xl"
           style={{ background: `radial-gradient(circle, rgba(124,94,170,${plum}), transparent 62%)` }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-full"
           style={{ background: `radial-gradient(120% 60% at 50% 120%, rgba(245,158,11,${amber}), transparent 55%)` }} />
      {/* spice particles */}
      <div className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span key={i} className="ap-particle absolute rounded-full bg-[#D4B896]/20"
                style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s` }} />
        ))}
      </div>
      {children}
    </div>
  );
}

/** Real holoflower + the pulsing color field behind it. */
function Holo({ size, dimmed = false, calm = false }: { size: number; dimmed?: boolean; calm?: boolean }) {
  return (
    <div className={`relative grid place-items-center ${calm ? 'ap-calm' : ''}`} style={{ width: size, height: size }}>
      <span className="ap-field-pulse pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{ width: size * 1.7, height: size * 1.7, transform: 'translate(-50%,-50%)',
                     background: 'radial-gradient(circle, rgba(124,94,170,0.22), rgba(96,72,150,0.06) 44%, transparent 70%)' }} />
      <div className="relative z-10">
        {/* REAL voice-reactive holoflower, idle (rhythmMetrics=null, no voiceAmplitude → no mic) */}
        <RhythmHoloflower rhythmMetrics={null} size={size} dimmed={dimmed || calm} interactive={false} />
      </div>
    </div>
  );
}

function TopMark() {
  return (
    <div className="absolute left-4 top-4 z-20 flex items-center gap-2 opacity-60">
      <span className="inline-block h-4 w-4"><RhythmHoloflower rhythmMetrics={null} size={16} interactive={false} /></span>
      <span className="text-[13px] tracking-[0.18em] text-stone-200" style={{ fontFamily: SERIF }}>MAIA</span>
    </div>
  );
}

function Splash({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <button onClick={() => onNavigate('signinA')}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-6 text-center"
            aria-label="Enter">
      <Holo size={120} />
      <div>
        <div className="flex justify-center text-[26px] font-light" style={{ letterSpacing: '0.34em' }}>
          {SOULLAB.map(([c, color], i) => <span key={i} style={{ color }}>{c}</span>)}
        </div>
        <div className="mt-1 text-[11px] tracking-[0.14em] text-stone-400" style={{ fontFamily: SERIF }}>know thyself</div>
      </div>
    </button>
  );
}

/**
 * Sign-in — presence begins at the threshold; recognition begins after it.
 * The field is present (navy + calmer holoflower); relationship is NOT presumed:
 * no speech, no personalization, no continuity/memory before authentication.
 * Real auth controls RE-SKINNED into the field, but REPRESENTATIONAL / inert here —
 * no change to authentication logic, persistence, or security. "Auth success" → Arrival B.
 */
function SignIn({ variant, onNavigate }: { variant: 'A' | 'B'; onNavigate: (v: View) => void }) {
  const head = 'Welcome.';
  const sub = variant === 'A' ? 'Sign in to enter.' : 'Sign in.';
  const go = () => onNavigate('arrivalB');
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      <Holo size={92} calm />
      <div className="mt-6 text-center">
        <div className="text-[clamp(21px,5vw,29px)] font-light text-stone-100" style={{ fontFamily: SERIF }}>{head}</div>
        <div className="mt-2 text-[13px] text-stone-400">{sub}</div>
      </div>
      <div className="mt-7 flex w-full max-w-sm flex-col gap-3">
        <div className="flex h-12 items-center rounded-xl border border-[#1E2F4D] bg-[#121A2B] px-4 text-[13px] text-stone-500">Email address</div>
        <button onClick={go} className="h-12 rounded-xl bg-[#D4AF37]/90 text-[13px] font-medium text-[#171208]">Continue</button>
        <button onClick={go} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#1E2F4D] text-[13px] text-stone-200">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><path d="M9.5 10v1M14.5 10v1M9.5 15c1.4 1 3.6 1 5 0M12 10v3" /></svg>
          Continue with Face ID or Touch ID
        </button>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-stone-600"><span className="h-px flex-1 bg-[#1E2F4D]" />or<span className="h-px flex-1 bg-[#1E2F4D]" /></div>
        <div className="flex gap-3">
          <button onClick={go} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#1E2F4D] text-[13px] text-stone-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M16 8.5A5 5 0 1 0 17.5 12H12" /></svg> Google
          </button>
          <button onClick={go} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#1E2F4D] text-[13px] text-stone-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M15.6 12.4c0-1.9 1.5-2.8 1.6-2.9-.9-1.3-2.2-1.5-2.7-1.5-1.1-.1-2.2.7-2.8.7-.6 0-1.5-.6-2.4-.6-1.2 0-2.4.7-3 1.9-1.3 2.2-.3 5.5.9 7.3.6 1 1.3 2 2.2 2 .9-.04 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.9 2.2-1.8.7-1 .9-2 .9-2.1-.02-.01-1.8-.7-1.8-2.9zM13.9 6.5c.5-.6.8-1.5.7-2.3-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.2.8.06 1.6-.4 2.2-1z" /></svg> Apple
          </button>
        </div>
        <button className="mt-1 text-[12px] text-stone-500">Use a password instead.</button>
      </div>
      <p className="mt-6 max-w-sm text-center text-[10px] leading-relaxed text-stone-600">
        representational · real auth controls re-skinned into the field · inert in prototype (no change to authentication, persistence, or security) · <span className="text-stone-500">no personalization, continuity, or memory before authentication</span>
      </p>
    </div>
  );
}

function ArrivalView({ variant, greeting, holoSize, onNavigate }:
  { variant: 'A' | 'B' | 'C'; greeting: { greeting: string; subtext: string }; holoSize: number; onNavigate: (v: View) => void }) {
  const [draft, setDraft] = useState('');
  // Arrival C — the OPTIONAL threshold emerges on an AMBIENT beat after arrival (a host's gesture),
  // NOT from watching the member's inactivity or behaviour. Hospitality, not surveillance.
  const [showInvite, setShowInvite] = useState(false);
  useEffect(() => {
    setShowInvite(false);
    if (variant !== 'C') return;
    const t = setTimeout(() => setShowInvite(true), 3800);
    return () => clearTimeout(t);
  }, [variant]);
  return (
    <div className="absolute inset-0 flex flex-col">
      <TopMark />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[clamp(24px,6vw,34px)] font-light leading-tight text-maia-spice-500" style={{ fontFamily: SERIF, letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          {greeting.greeting}
        </h1>
        <p className="mt-3 text-[clamp(13px,3.6vw,16px)] text-[#cdbfe0]" style={{ fontFamily: SERIF }}>
          {greeting.subtext}
        </p>
        <div className="my-8"><Holo size={holoSize} /></div>
        {variant === 'A' && (
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => onNavigate('conversation')}
                    className="rounded-full border border-[#E6A94A]/45 bg-[#E6A94A]/5 px-8 py-2.5 text-[15px] tracking-wide text-maia-spice-500"
                    style={{ fontFamily: SERIF }}>Begin</button>
            <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">speak · or type below</span>
          </div>
        )}
        {variant === 'B' && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-maia-spice-500/70">speak, or just start typing</span>
        )}
        {variant === 'C' && (
          <div className="flex min-h-[72px] flex-col items-center gap-3">
            {/* emergent, optional — fades in after the ambient beat; ignoring it does nothing */}
            <button onClick={() => onNavigate('conversation')} aria-hidden={!showInvite} tabIndex={showInvite ? 0 : -1}
                    className={`ap-invite text-[clamp(16px,4vw,21px)] text-maia-spice-500 ${showInvite ? 'in' : ''}`}
                    style={{ fontFamily: SERIF }}>What feels present today?</button>
            <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">or keep settling</span>
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-xl px-4 pb-6">
        <ModernTextInput
          value={draft}
          onChange={setDraft}
          onSubmit={() => { setDraft(''); onNavigate('conversation'); }}
          placeholder="Say something to Maia…"
          autoFocus={variant === 'B'}
          enableVoiceInput={false}
          enableVoiceInChat={false}
        />
        <button onClick={() => onNavigate('house')}
                className="mx-auto mt-3 flex flex-col items-center gap-0.5"
                style={{ fontFamily: SERIF }}>
          <span className="flex items-center gap-1.5 text-[13px] tracking-wide text-stone-300">⌂ The House <span aria-hidden className="text-[10px] text-stone-500">▾</span></span>
          <span className="text-[10px] tracking-wide text-stone-500">Your places and practices</span>
        </button>
      </div>
    </div>
  );
}

function ConversationView({ greeting, onNavigate }:
  { greeting: { greeting: string; subtext: string }; onNavigate: (v: View) => void }) {
  const [draft, setDraft] = useState('');
  return (
    <div className="absolute inset-0 flex flex-col">
      <TopMark />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-16">
        <div className="mb-4 flex justify-center opacity-90"><Holo size={56} dimmed /></div>
        {/* representational transcript — less box, more field: words live ON the field, not in bubbles */}
        <div className="flex flex-col gap-6">
          <p className="max-w-[80%] self-end text-right text-[13px] leading-relaxed text-[#b9adc6]">
            I&apos;ve been carrying something heavy this week.
          </p>
          <p className="max-w-[94%] text-[clamp(16px,2.3vw,21px)] font-light leading-[1.75] text-maia-spice-500" style={{ fontFamily: SERIF }}>
            I&apos;m here. Take your time — what does the weight feel like, when you notice it?
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-xl px-4 pb-6">
        <ModernTextInput value={draft} onChange={setDraft} onSubmit={() => setDraft('')}
                         placeholder="Say something to Maia…" enableVoiceInput={false} enableVoiceInChat={false} />
        <p className="mt-2 text-center text-[10px] tracking-wide text-stone-500">
          representational · composer is the real component, inert in the prototype (no live controller)
        </p>
      </div>
    </div>
  );
}

function HouseView({ isFounder }: { isFounder: boolean }) {
  const boundaries = useMemo(() => getVisibleBoundaries(isFounder), [isFounder]);
  const center = MAIA_WORLDS.find((w) => w.id === 'maia');
  const worlds = MAIA_WORLDS.filter((w) => w.id !== 'maia');
  const Item = ({ item, accent }: { item: MaiaRailItem; accent?: boolean }) => {
    const Icon = item.icon;
    return (
      <div className="flex items-center gap-3 border-b border-white/5 py-2.5">
        <Icon className={`h-5 w-5 ${accent ? 'text-maia-spice-500' : 'text-maia-spice-500/80'}`} />
        <div className="leading-tight">
          <div className={`text-[13px] ${accent ? 'text-maia-spice-500' : 'text-stone-100'}`}>{item.label}</div>
          <div className="text-[10px] text-stone-500">{item.route}</div>
        </div>
      </div>
    );
  };
  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <div className="mx-auto max-h-[86%] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-[#2A3F63]/70 bg-[#0b1524]/96 px-5 pb-8 pt-4 backdrop-blur">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20" />
        <h3 className="text-[15px] text-stone-100" style={{ fontFamily: SERIF }}>The House</h3>
        <p className="mb-3 mt-1 text-[11.5px] leading-relaxed text-stone-400" style={{ fontFamily: SERIF }}>Welcome to the house. These places are here when you need them.</p>
        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-maia-spice-500/60">Your center</p>
        {center && <Item item={center} accent />}
        <p className="mb-1 mt-4 text-[10px] uppercase tracking-[0.2em] text-maia-spice-500/60">Worlds</p>
        {worlds.map((w) => <Item key={w.id} item={w} />)}
        {boundaries.length > 0 && (
          <>
            <p className="mb-1 mt-4 text-[10px] uppercase tracking-[0.2em] text-maia-spice-500/60">
              Rooms{isFounder ? '' : ' · founder rooms shown when unlocked'}
            </p>
            {boundaries.map((b) => <Item key={b.id} item={b} />)}
          </>
        )}
        <p className="mt-4 text-center text-[10px] text-stone-500">display-only in prototype · destinations not wired</p>
      </div>
    </div>
  );
}

function CurrentSurface() {
  return (
    <div className="absolute inset-0 bg-[#0A1628]">
      <iframe src="/maia" title="Current MAIA surface" className="h-full w-full border-0" />
      <a href="/maia" target="_blank" rel="noreferrer"
         className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-stone-300 backdrop-blur">
        open /maia ↗
      </a>
    </div>
  );
}

export default function ArrivalPrototypeShell({ isFounder }: { isFounder: boolean }) {
  // In-memory only. Fixed dev default (NOT inferred from member state, NOT persisted).
  const [view, setView] = useState<View>('splash');
  const [holoSize, setHoloSize] = useState(200);
  const [greeting, setGreeting] = useState({ greeting: 'Hello', subtext: "I'm here when you're ready." });

  useEffect(() => {
    const onResize = () => setHoloSize(Math.round(Math.min(240, Math.max(140, window.innerWidth * 0.5))));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    try {
      const name = resolveDisplayName();
      let daysSinceLastVisit: number | undefined;
      const last = localStorage.getItem('lastSessionDate');
      if (last) {
        const d = Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000);
        if (!Number.isNaN(d) && d >= 0) daysSinceLastVisit = d;
      }
      let memberStyleProfile: string | undefined;
      try { memberStyleProfile = JSON.parse(localStorage.getItem('beta_user') || '{}')?.memberStyleProfile; } catch { /* noop */ }
      const g = generateWelcomeGreeting({
        userName: name, hourLocal: new Date().getHours(), daysSinceLastVisit,
        memberStyleProfile: memberStyleProfile as never,
      });
      setGreeting({ greeting: g.greeting, subtext: g.subtext });
    } catch { /* keep fallback */ }
  }, []);

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-[#0A1628] text-stone-100">
      {/* DEV SWITCH — visible developer control, six explicit views */}
      <div className="absolute inset-x-0 top-0 z-50 flex h-11 flex-wrap items-center gap-1.5 border-b border-white/10 bg-black/85 px-3 text-xs backdrop-blur">
        <span className="mr-1 font-semibold tracking-wide text-maia-spice-500">DEV · Arrival</span>
        {VIEWS.map((v) => (
          <button key={v.id} onClick={() => setView(v.id)} aria-pressed={view === v.id}
                  className={`rounded-full px-2.5 py-1 transition ${view === v.id ? 'bg-[#E6A94A] font-semibold text-black' : 'text-stone-300 hover:text-white'}`}>
            {v.label}
          </button>
        ))}
        <span className="ml-auto hidden text-[10px] text-stone-500 sm:inline">
          flag: arrivalPrototype · no persistence · not a production surface
        </span>
      </div>

      {/* VIEW AREA */}
      <div className="absolute inset-x-0 bottom-0 top-11">
        {view === 'current' ? (
          <CurrentSurface />
        ) : (
          <>
            <PrototypeField tone={view === 'house' ? 'belonging' : 'wonder'}>{null}</PrototypeField>
            {view === 'splash' && <Splash onNavigate={setView} />}
            {view === 'signinA' && <SignIn variant="A" onNavigate={setView} />}
            {view === 'signinB' && <SignIn variant="B" onNavigate={setView} />}
            {view === 'arrivalA' && <ArrivalView variant="A" greeting={greeting} holoSize={holoSize} onNavigate={setView} />}
            {view === 'arrivalB' && <ArrivalView variant="B" greeting={greeting} holoSize={holoSize} onNavigate={setView} />}
            {view === 'arrivalC' && <ArrivalView variant="C" greeting={greeting} holoSize={holoSize} onNavigate={setView} />}
            {view === 'conversation' && <ConversationView greeting={greeting} onNavigate={setView} />}
            {view === 'house' && <HouseView isFounder={isFounder} />}
          </>
        )}
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .ap-field-pulse { animation: apFieldPulse 5s ease-in-out infinite; }
          .ap-particle { animation: apFloat 6s ease-in-out infinite; }
        }
        .ap-invite { opacity: 0; transform: translateY(8px); transition: opacity 1.2s ease, transform 1.2s ease; pointer-events: none; }
        .ap-invite.in { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .ap-calm .ap-field-pulse { animation-duration: 9s !important; opacity: 0.5; }
        @keyframes apFieldPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.9; }
        }
        @keyframes apFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
}
