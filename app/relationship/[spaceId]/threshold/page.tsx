'use client';

/**
 * /relationship/[spaceId]/threshold
 *
 * The threshold screen shown before a client enters a Relationship Space.
 *
 * Sarah understands the relationship before entering it:
 *   1. AIN constitutional commitments (what the platform guarantees)
 *   2. Practitioner's Practice Field (how Jondi works, how MAIA supports)
 *   3. Professional declarations (Jondi's professional context)
 *   4. Consent acknowledgment
 *
 * Per JURISDICTIONAL_DISCLOSURE: AIN governs only what it holds.
 * Professional obligations are declared by the practitioner, not verified by the platform.
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface ThresholdData {
  space_id: string;
  relationship_type: string;
  practitioner_name: string;
  already_accepted?: boolean;
  snapshot: {
    welcome_message: string | null;
    about_practice: string | null;
    how_we_work_together: string | null;
    how_maia_supports: string | null;
    professional_practice: string | null;
    orientation_style: string | null;
  } | null;
}

export default function ThresholdPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const router = useRouter();

  const [data, setData] = useState<ThresholdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadThreshold();
  }, [spaceId]);

  async function loadThreshold() {
    try {
      const res = await apiFetch(`/api/relationship-spaces/${spaceId}/threshold`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.already_accepted) {
        router.replace('/maia/portal');
        return;
      }
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Unable to load this space.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/relationship-spaces/${spaceId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_items: ['platform_constitutional_commitments', 'practice_field_terms', 'maia_support_role'],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      router.push('/maia/portal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-500 text-sm font-light">Opening the threshold…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
        <p className="text-stone-400 text-sm">{error || 'This space could not be found.'}</p>
      </div>
    );
  }

  const { practitioner_name, snapshot } = data;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <div className="max-w-prose mx-auto px-6 py-14 space-y-12">

        {/* Opening */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Before you enter</p>
          <h1 className="text-xl font-light text-stone-200">
            Welcome to your shared space with {practitioner_name}.
          </h1>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            I'm MAIA. I'm here to support the work the two of you do together.{' '}
            {practitioner_name} has described how they accompany people and the commitments they bring.
            Before you enter, we'd like you to understand both.
          </p>
        </div>

        {/* Platform commitments */}
        <Section
          title="What Soullab Commits To"
          expanded={expanded === 'platform'}
          onToggle={() => setExpanded(expanded === 'platform' ? null : 'platform')}
        >
          <ul className="space-y-3 text-stone-400 text-sm font-light leading-relaxed">
            <li className="flex gap-3"><span className="text-stone-600 mt-0.5">—</span><span>Your reflections belong to you. Memory is yours to hold, share, or remove.</span></li>
            <li className="flex gap-3"><span className="text-stone-600 mt-0.5">—</span><span>Your relationship with {practitioner_name} is respected. MAIA supports but does not replace it.</span></li>
            <li className="flex gap-3"><span className="text-stone-600 mt-0.5">—</span><span>MAIA does not claim authority over your meaning, your choices, or your direction.</span></li>
            <li className="flex gap-3"><span className="text-stone-600 mt-0.5">—</span><span>You can ask MAIA to enter Sanctuary Mode at any time. Those conversations are not stored.</span></li>
            <li className="flex gap-3"><span className="text-stone-600 mt-0.5">—</span><span>Your information is self-hosted and never sold or used for training.</span></li>
          </ul>
        </Section>

        {/* How we work together */}
        {snapshot?.how_we_work_together && (
          <Section
            title={`How ${practitioner_name} Works With You`}
            expanded={expanded === 'htw'}
            onToggle={() => setExpanded(expanded === 'htw' ? null : 'htw')}
          >
            <p className="text-stone-400 text-sm font-light leading-relaxed whitespace-pre-line">
              {snapshot.how_we_work_together}
            </p>
          </Section>
        )}

        {/* How MAIA supports */}
        {snapshot?.how_maia_supports && (
          <Section
            title="How MAIA Supports Your Work"
            expanded={expanded === 'maia'}
            onToggle={() => setExpanded(expanded === 'maia' ? null : 'maia')}
          >
            <p className="text-stone-400 text-sm font-light leading-relaxed whitespace-pre-line">
              {snapshot.how_maia_supports}
            </p>
          </Section>
        )}

        {/* Professional declarations */}
        {snapshot?.professional_practice && (
          <Section
            title={`${practitioner_name}'s Professional Context`}
            expanded={expanded === 'prof'}
            onToggle={() => setExpanded(expanded === 'prof' ? null : 'prof')}
          >
            <p className="text-stone-400 text-sm font-light leading-relaxed whitespace-pre-line">
              {snapshot.professional_practice}
            </p>
            <p className="text-stone-600 text-xs mt-4">
              These declarations were made by {practitioner_name}. The platform records what practitioners declare; it does not verify professional credentials or legal obligations.
            </p>
          </Section>
        )}

        {/* Consent */}
        <div className="border-t border-stone-800 pt-8 space-y-4">
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            By entering, you acknowledge that you've read and understood the above, and that you consent to MAIA supporting the work you and {practitioner_name} do together.
          </p>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="bg-stone-200 text-stone-900 px-8 py-3 text-sm font-medium tracking-wide hover:bg-white transition-colors disabled:opacity-50"
          >
            {accepting ? 'Entering…' : 'Enter the shared space'}
          </button>
        </div>

      </div>
    </div>
  );
}

function Section({
  title, children, expanded, onToggle,
}: {
  title: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-stone-800 pt-6 space-y-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left group"
      >
        <span className="text-stone-300 text-sm font-light group-hover:text-stone-200 transition-colors">
          {title}
        </span>
        <span className="text-stone-600 text-xs">{expanded ? '↑' : '↓'}</span>
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
}
