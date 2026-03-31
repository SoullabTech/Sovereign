'use client';

/**
 * WISDOM — Living field of insight
 *
 * Canonical destination: /wisdom-keepers/wisdom
 *
 * Three layers:
 * 1. Orientation — what this place is
 * 2. Emerging Reflections — rotating curated wisdom (actionable)
 * 3. Pathways & Sources — searchable domain catalog (actionable)
 *
 * Every quote, source, and domain is a doorway into MAIA conversation
 * via the seedMaiaPrompt system (localStorage → auto-send on /maia mount).
 */

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  Compass,
  Heart,
  Leaf,
  MessageCircle,
  Moon,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react';

import { WISDOM_SOURCES, type WisdomDomain } from '@/lib/wisdom/wisdomSources';
import { WISDOM_QUOTES, type WisdomQuote } from '@/lib/wisdom/WisdomQuotes';
import { WISDOM_FACETS } from '@/lib/wisdom/WisdomFacets';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';

// ---------------------------------------------------------------------------
// Icon resolver — maps string icon names from data to Lucide components
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Moon,
  Star,
  Sparkles,
  Leaf,
  Brain,
  Sun,
  BookOpen,
};

function DomainIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || BookOpen;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Color system
// ---------------------------------------------------------------------------

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/30' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  teal:    { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/30' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/30' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  slate:   { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/30' },
};

function getColors(color: string) {
  return COLOR_MAP[color] || COLOR_MAP.slate;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickRandomQuotes(count: number): WisdomQuote[] {
  const pool = [...WISDOM_QUOTES];
  const picked: WisdomQuote[] = [];
  while (pool.length > 0 && picked.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function getFacetQuestion(voiceKey?: string): string | null {
  if (!voiceKey) return null;
  const facet = (WISDOM_FACETS as Record<string, { coreQuestion?: string }>)[voiceKey];
  return facet?.coreQuestion ?? null;
}

function getFacetName(voiceKey?: string): string | null {
  if (!voiceKey) return null;
  const facet = (WISDOM_FACETS as Record<string, { tradition?: string }>)[voiceKey];
  return facet?.tradition ?? null;
}

function matchesQuery(domain: WisdomDomain, source: { title: string; author: string; focus: string }, query: string): boolean {
  if (!query.trim()) return true;
  const hay = [domain.title, source.title, source.author, source.focus].join(' ').toLowerCase();
  return hay.includes(query.toLowerCase());
}

// ---------------------------------------------------------------------------
// Action button component
// ---------------------------------------------------------------------------

function ActionButton({
  onClick,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary';
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition
        ${variant === 'primary'
          ? 'bg-[#D4B896]/20 text-[#D4B896] border border-[#D4B896]/30 hover:bg-[#D4B896]/30'
          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80'
        }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WisdomPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});
  const [featuredQuotes, setFeaturedQuotes] = useState<WisdomQuote[]>(() => pickRandomQuotes(4));

  const totalSources = useMemo(
    () => WISDOM_SOURCES.reduce((sum, d) => sum + d.sources.length, 0),
    [],
  );

  const filteredDomains = useMemo(() => {
    return WISDOM_SOURCES
      .map((domain) => ({
        ...domain,
        sources: domain.sources.filter((s) => matchesQuery(domain, s, query)),
      }))
      .filter((d) => d.sources.length > 0 || !query.trim());
  }, [query]);

  const toggleDomain = (id: string) =>
    setOpenDomains((prev) => ({ ...prev, [id]: !prev[id] }));

  const refreshQuotes = () => setFeaturedQuotes(pickRandomQuotes(4));

  // ── Seed + Navigate to MAIA ──
  const goToMaia = useCallback((prompt: string, sourceLabel: string) => {
    seedMaiaPrompt({
      prompt,
      source: 'wisdom-keepers',
      sourceLabel,
      returnTo: '/wisdom-keepers/wisdom',
      tone: 'exploratory',
    });
    router.push('/maia');
  }, [router]);

  // Quote actions
  const reflectOnQuote = useCallback((q: WisdomQuote) => {
    const tradition = getFacetName(q.voice) || q.voice || 'this tradition';
    goToMaia(
      `I want to reflect on this: "${q.text}" What might this mean for where I am right now?`,
      `Wisdom: ${tradition}`,
    );
  }, [goToMaia]);

  const exploreTradition = useCallback((q: WisdomQuote) => {
    const tradition = getFacetName(q.voice) || q.voice || 'this tradition';
    goToMaia(
      `Tell me about the ${tradition} tradition and how it might be relevant to my inner work right now.`,
      `Tradition: ${tradition}`,
    );
  }, [goToMaia]);

  // Source action
  const exploreSource = useCallback((source: { title: string; author: string; focus: string }) => {
    goToMaia(
      `I'm curious about "${source.title}" by ${source.author}. What does this source offer for the kind of inner work I might be doing right now?`,
      `Source: ${source.title}`,
    );
  }, [goToMaia]);

  // Domain pathway action
  const enterPathway = useCallback((domain: WisdomDomain) => {
    goToMaia(
      `Guide me into the ${domain.title} pathway. What are the key themes, and where should I begin?`,
      `Pathway: ${domain.title}`,
    );
  }, [goToMaia]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] text-[#f6f1e8]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Nav */}
        <div className="mb-8">
          <Link
            href="/maia"
            className="inline-flex items-center gap-2 text-sm text-[#D4B896] transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* ── Layer 1: Orientation ── */}
        <section className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D4B896]/40 bg-[#D4B896]/10 px-3 py-1 text-xs tracking-wide text-[#D4B896]">
                <Sparkles className="h-3.5 w-3.5" />
                Curated Field
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {totalSources} sources
              </span>
            </div>

            <h1 className="mb-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Wisdom
            </h1>

            <p className="max-w-3xl text-lg leading-relaxed text-white/80">
              A curated field of enduring knowledge — voices, traditions, and texts
              that deepen perception, practice, and human becoming.
            </p>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
              Tap any quote, source, or pathway to explore it with MAIA.
              This is a threshold into practice, not a reference page.
            </p>
          </motion.div>
        </section>

        {/* ── Layer 2: Emerging Reflections ── */}
        <section className="mb-14">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Emerging Reflections</h2>
              <p className="mt-1 text-sm text-white/55">
                Rotating wisdom surfaced for contemplation.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshQuotes}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#D4B896] transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredQuotes.map((q, i) => {
              const facetQuestion = getFacetQuestion(q.voice);
              return (
                <motion.article
                  key={q.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                >
                  <p className="mb-4 flex-1 text-sm leading-7 text-white/90 italic">
                    &ldquo;{q.text}&rdquo;
                  </p>

                  <div className="text-xs text-[#D4B896] mb-1">
                    {q.source || q.voice}
                  </div>

                  {facetQuestion && (
                    <div className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/50">
                      <span className="text-[#D4B896]/80">Inquiry:</span>{' '}
                      {facetQuestion}
                    </div>
                  )}

                  {/* Quote actions */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    <ActionButton variant="primary" onClick={() => reflectOnQuote(q)}>
                      <MessageCircle className="h-3 w-3" />
                      Reflect with MAIA
                    </ActionButton>
                    {q.voice && (
                      <ActionButton onClick={() => exploreTradition(q)}>
                        <Compass className="h-3 w-3" />
                        Explore tradition
                      </ActionButton>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* ── Layer 3: Pathways & Sources ── */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">Pathways & Sources</h2>
            <p className="mt-1 text-sm text-white/55">
              Browse by domain, tradition, author, or theme.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <label className="flex items-center gap-3">
              <Search className="h-4 w-4 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, authors, domains..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </label>
          </div>

          {/* Domain cards */}
          <div className="space-y-4">
            {filteredDomains.map((domain) => {
              const isOpen = !!openDomains[domain.id];
              const colors = getColors(domain.color);

              return (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`overflow-hidden rounded-2xl border ${colors.border} bg-white/[0.03]`}
                >
                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => toggleDomain(domain.id)}
                    className={`flex w-full items-center gap-4 p-5 text-left transition hover:bg-white/[0.03] ${colors.bg}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                      <DomainIcon name={domain.icon} className={`h-5 w-5 ${colors.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${colors.text}`}>{domain.title}</h3>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                          {domain.sources.length}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-white/50 truncate">{domain.description}</p>
                    </div>

                    {isOpen
                      ? <ChevronUp className="h-5 w-5 text-white/40 shrink-0" />
                      : <ChevronDown className="h-5 w-5 text-white/40 shrink-0" />
                    }
                  </button>

                  {/* Pathway action bar */}
                  {isOpen && (
                    <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02]">
                      <ActionButton variant="primary" onClick={() => enterPathway(domain)}>
                        <Compass className="h-3 w-3" />
                        Enter this pathway with MAIA
                      </ActionButton>
                    </div>
                  )}

                  {/* Source list */}
                  {isOpen && (
                    <div className="border-t border-white/5 bg-black/20">
                      <div className="divide-y divide-white/5">
                        {domain.sources.map((source, sIdx) => (
                          <div
                            key={sIdx}
                            className="group px-5 py-3 hover:bg-white/[0.03] transition cursor-pointer"
                            onClick={() => exploreSource(source)}
                          >
                            <div className="flex items-start gap-3">
                              <BookOpen className="mt-0.5 h-4 w-4 text-white/25 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white/90">{source.title}</div>
                                <div className="text-xs text-[#D4B896]/70 mt-0.5">{source.author}</div>
                                <div className="text-xs text-white/45 mt-1">{source.focus}</div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition shrink-0 self-center">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-[#D4B896]/20 px-2.5 py-1 text-[11px] text-[#D4B896] border border-[#D4B896]/30">
                                  <MessageCircle className="h-3 w-3" />
                                  Explore
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Footer: Working with wisdom ── */}
        <section className="mt-16 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-[#D4B896]" />
              <h2 className="text-lg font-semibold text-[#D4B896]">Working with wisdom</h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-white/60">
              Read slowly. Return over time. Let themes constellate rather than
              resolve too quickly. Tap anything that stirs you to explore it with MAIA.
              Wisdom becomes alive when it enters relationship.
            </p>
            <p className="mt-3 text-xs text-white/40">
              MAIA doesn&apos;t quote sources directly. She weaves their wisdom into presence.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
