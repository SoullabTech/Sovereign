'use client';

/**
 * /maia/portal — Personal Portal
 *
 * The client's view. Not a complicated dashboard.
 * Centered around the relationship with their practitioner.
 *
 * "Sarah never needed to learn Soullab.
 *  She learned one simple thing: this is the space Jondi and I use to continue our work."
 *
 * Design: docs/pitch/CASE_STUDY_JONDI_SARAH.md §Step 4
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface RelationshipSpace {
  id: string;
  relationship_type: string;
  practitioner_name: string;
  practice_display_name: string;
  status: string;
  consent_status: string;
  snapshot: {
    welcome_message: string | null;
    about_practice: string | null;
    how_we_work_together: string | null;
    orientation_style: string | null;
  } | null;
}

export default function PersonalPortalPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<RelationshipSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberName, setMemberName] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('beta_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setMemberName(user.preferred_name || user.name || '');
      } catch {}
    }
    loadPortal();
  }, []);

  async function loadPortal() {
    try {
      const res = await apiFetch('/api/member/portal');
      const json = await res.json();
      if (res.ok) setSpaces(json.spaces ?? []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-500 text-sm font-light">Opening your space…</p>
      </div>
    );
  }

  // No spaces yet — shouldn't normally happen if they arrived via invitation
  if (spaces.length === 0) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-stone-400 text-sm font-light">
            No shared spaces yet. When someone invites you, it will appear here.
          </p>
          <Link href="/maia" className="text-stone-600 text-xs underline">Go to MAIA</Link>
        </div>
      </div>
    );
  }

  // With exactly one space (typical for beta), show it directly
  const primarySpace = spaces[0];
  const needsConsent = primarySpace.consent_status !== 'accepted';

  if (needsConsent) {
    router.replace(`/relationship/${primarySpace.id}/threshold`);
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <div className="max-w-prose mx-auto px-6 py-14 space-y-12">

        {/* Greeting */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-stone-500">Your space</p>
          <h1 className="text-xl font-light text-stone-200">
            Welcome back{memberName ? `, ${memberName.split(' ')[0]}` : ''}.
          </h1>
          <p className="text-stone-500 text-sm font-light">
            Your shared space with {primarySpace.practitioner_name}.
          </p>
        </div>

        {/* Active Field — present-moment practitioner message if set */}
        {/* (rendered by the MAIA conversation when active_field_content is wired) */}

        {/* Primary actions */}
        <div className="space-y-3">
          <PrimaryAction
            href="/maia"
            label="Continue with MAIA"
            description="Reflect, prepare for your next session, or just be here."
          />
          <PrimaryAction
            href="/maia?intent=prepare"
            label="Prepare for your next session"
            description="Gather your thoughts before you meet."
          />
        </div>

        {/* How we work together — brief reminder */}
        {primarySpace.snapshot?.how_we_work_together && (
          <div className="border-t border-stone-800 pt-8 space-y-3">
            <p className="text-xs uppercase tracking-widest text-stone-600">How you work together</p>
            <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-4">
              {primarySpace.snapshot.how_we_work_together}
            </p>
          </div>
        )}

        {/* Multiple spaces */}
        {spaces.length > 1 && (
          <div className="border-t border-stone-800 pt-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-stone-600">Other spaces</p>
            {spaces.slice(1).map(space => (
              <div key={space.id} className="border border-stone-800 rounded p-4 space-y-1">
                <p className="text-stone-300 text-sm font-light">{space.practitioner_name}</p>
                {space.consent_status !== 'accepted' && (
                  <Link
                    href={`/relationship/${space.id}/threshold`}
                    className="text-stone-500 text-xs underline"
                  >
                    Accept invitation →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function PrimaryAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="block border border-stone-800 hover:border-stone-600 px-5 py-4 rounded transition-colors group"
    >
      <p className="text-stone-200 text-sm font-light group-hover:text-white transition-colors">{label}</p>
      <p className="text-stone-600 text-xs mt-1 font-light">{description}</p>
    </Link>
  );
}
