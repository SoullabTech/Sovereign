'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import { CoreIdeasList } from '@/components/wisdom-fields/CoreIdeasList';
import { KeyWorksList } from '@/components/wisdom-fields/KeyWorksList';
import { ReflectionsFeed } from '@/components/wisdom-fields/ReflectionsFeed';
import { EvolutionThread } from '@/components/wisdom-fields/EvolutionThread';
import { OrientationMirror } from '@/components/wisdom-fields/OrientationMirror';

// ── Types ──────────────────────────────────────────────────────

interface Field {
  id: string;
  slug: string;
  field_type: 'wisdom_keeper' | 'masters_field';
  ai_posture: 'contextual' | 'none';
  master_name: string;
  master_dates?: string | null;
  master_domain?: string | null;
  orientation?: string | null;
  ai_posture_note?: string | null;
}

interface Membership {
  role: 'member' | 'steward';
  status: 'active' | 'left';
}

interface Contribution {
  id: string;
  memberName?: string;
  contributionType: 'reflection' | 'question' | 'integration' | 'application';
  title?: string | null;
  body: string;
  replyCount: number;
  createdAt: string;
}

interface EvolutionEntry {
  id: string;
  body: string;
  shared: boolean;
  created_at: string;
}

type Section = 'ideas' | 'works' | 'reflections' | 'evolution';

// ── Page ───────────────────────────────────────────────────────

export default function FieldPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [field, setField] = useState<Field | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [coreIdeas, setCoreIdeas] = useState<any[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [evolutionEntries, setEvolutionEntries] = useState<EvolutionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('ideas');

  // Load field data (public)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch(`/api/wisdom-fields/${slug}`);
        if (cancelled) return;
        if (res.status === 404) { router.replace('/commons/fields'); return; }
        if (!res.ok) throw new Error('Failed to load field');
        const data = await res.json();
        setField(data.field);
        setMembership(data.membership ?? null);
        setWorks(data.works ?? []);
        setCoreIdeas(data.coreIdeas ?? []);
      } catch {
        // leave loading spinner — surface error state later if needed
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug, router]);

  // Load contributions (member only)
  const loadContributions = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/wisdom-fields/${slug}/contributions`);
      if (res.ok) {
        const data = await res.json();
        setContributions(data.contributions ?? []);
      }
    } catch { /* not authenticated — leave empty */ }
  }, [slug]);

  // Load evolution thread (joined member only)
  const loadEvolution = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/wisdom-fields/${slug}/evolution`);
      if (res.ok) {
        const data = await res.json();
        setEvolutionEntries(data.entries ?? []);
      }
    } catch { /* not authenticated */ }
  }, [slug]);

  useEffect(() => {
    if (membership?.status === 'active') {
      loadContributions();
      loadEvolution();
    }
  }, [membership, loadContributions, loadEvolution]);

  async function handleJoin() {
    setJoining(true);
    try {
      const res = await apiFetch(`/api/wisdom-fields/${slug}/join`, { method: 'POST' });
      if (res.ok) {
        setMembership({ role: 'member', status: 'active' });
        loadContributions();
        loadEvolution();
      } else if (res.status === 401) {
        router.push('/signin');
      }
    } catch { /* silent */ } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-maia-navy-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-maia-navy-700 border-t-maia-ink-60" />
      </div>
    );
  }

  if (!field) return null;

  const isMember = membership?.status === 'active';
  const sections: { id: Section; label: string }[] = [
    { id: 'ideas', label: 'Core Ideas' },
    { id: 'works', label: 'Key Works' },
    { id: 'reflections', label: 'Reflections' },
    ...(isMember ? [{ id: 'evolution' as Section, label: 'Your Thread' }] : []),
  ];

  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-80">
      {/* Back nav */}
      <div className="sticky top-0 z-10 border-b border-maia-navy-800 bg-maia-navy-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-5 py-3">
          <Link href="/commons/fields" className="text-sm text-maia-ink-40 hover:text-maia-ink-60 transition-colors">
            ← Fields
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10 space-y-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs tracking-widest uppercase text-maia-ink-40">
                {field.field_type === 'wisdom_keeper' ? 'Wisdom Keeper' : "Master's Field"}
              </p>
              <h1 className="text-3xl font-semibold text-maia-ink-100">{field.master_name}</h1>
              {field.master_dates && (
                <p className="mt-0.5 text-sm text-maia-ink-40">{field.master_dates}</p>
              )}
              {field.master_domain && (
                <p className="mt-2 text-sm text-maia-ink-60">{field.master_domain}</p>
              )}
            </div>

            {/* Join / Joined */}
            {!isMember ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="shrink-0 rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 hover:bg-maia-spice-500/20 disabled:opacity-40 transition-colors"
              >
                {joining ? 'Entering…' : 'Enter field'}
              </button>
            ) : (
              <span className="shrink-0 rounded-xl border border-maia-navy-700 px-4 py-2 text-sm text-maia-ink-40">
                In this field
              </span>
            )}
          </div>

          {/* Orientation */}
          {field.orientation && (
            <p className="mt-6 text-base leading-relaxed text-maia-ink-60">{field.orientation}</p>
          )}

          {/* AI posture note */}
          {field.ai_posture_note && (
            <p className="mt-3 text-sm italic text-maia-ink-40">{field.ai_posture_note}</p>
          )}
        </motion.div>

        {/* Orientation mirror */}
        <OrientationMirror />

        {/* Section nav */}
        <div className="flex gap-1 border-b border-maia-navy-800">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2.5 text-sm transition-colors ${
                activeSection === s.id
                  ? 'border-b-2 border-maia-spice-400 text-maia-ink-80'
                  : 'text-maia-ink-40 hover:text-maia-ink-60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div>
          {activeSection === 'ideas' && (
            <CoreIdeasList ideas={coreIdeas} />
          )}

          {activeSection === 'works' && (
            <KeyWorksList works={works} />
          )}

          {activeSection === 'reflections' && (
            <ReflectionsFeed
              fieldSlug={slug}
              contributions={contributions}
              isMember={isMember}
              onContributionPosted={loadContributions}
            />
          )}

          {activeSection === 'evolution' && isMember && (
            <EvolutionThread
              fieldSlug={slug}
              entries={evolutionEntries}
              onEntryAdded={() => { loadEvolution(); loadContributions(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
