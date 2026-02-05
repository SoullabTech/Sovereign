'use client';

/**
 * Practitioner Portals Page
 * Gateway for Pro Portals - passcode entry or sales pitch
 */

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface PortalOption {
  type: string;
  label: string;
  description: string;
  icon: string;
  examples: string[];
  href: string;
}

const PORTAL_OPTIONS: PortalOption[] = [
  {
    type: 'generalist',
    label: 'Generalist / Eclectic',
    description: 'For practitioners who blend multiple modalities',
    icon: 'sparkles',
    examples: ['Energy healing', 'Intuitive guidance', 'Spiritual coaching', 'Shamanic work'],
    href: '/studio/create?type=generalist',
  },
  {
    type: 'astrology',
    label: 'Astrology / Divination',
    description: 'For practitioners who deliver readings and artifacts',
    icon: 'star',
    examples: ['Natal charts', 'Transits', 'Tarot', 'Human Design'],
    href: '/studio/create?type=astrology',
  },
  {
    type: 'therapy',
    label: 'Therapy / Coaching',
    description: 'For session-based therapeutic practices',
    icon: 'heart',
    examples: ['Psychotherapy', 'Life coaching', 'Counseling', 'Integration'],
    href: '/studio/create?type=therapy',
  },
  {
    type: 'clinician',
    label: 'Clinician',
    description: 'For licensed clinical practitioners',
    icon: 'stethoscope',
    examples: ['Psychiatry', 'Psychology', 'LCSW/LMFT', 'Psychiatric nursing'],
    href: '/studio/create?type=clinician',
  },
  {
    type: 'bodywork',
    label: 'Bodywork',
    description: 'For hands-on healing modalities',
    icon: 'hand',
    examples: ['Massage', 'Acupuncture', 'Somatic therapy', 'Craniosacral'],
    href: '/studio/create?type=bodywork',
  },
  {
    type: 'groups',
    label: 'Groups / Ceremonies',
    description: 'For facilitators of group experiences',
    icon: 'users',
    examples: ['Workshops', 'Retreats', 'Circles', 'Group programs'],
    href: '/studio/create?type=groups',
  },
];

const FEATURES = [
  {
    icon: 'calendar',
    title: 'Smart Scheduling',
    description: 'Automated booking with buffer times, intake forms, and calendar sync',
  },
  {
    icon: 'users',
    title: 'Client Management',
    description: 'Secure client records, session notes, and progress tracking',
  },
  {
    icon: 'chart',
    title: 'Practice Analytics',
    description: 'Insights into your practice growth, client patterns, and revenue',
  },
  {
    icon: 'shield',
    title: 'Sovereign Data',
    description: 'Your data stays yours — self-hosted, encrypted, no third parties',
  },
  {
    icon: 'sparkles',
    title: 'MAIA Integration',
    description: 'AI-assisted session prep, note-taking, and client insights',
  },
  {
    icon: 'link',
    title: 'Custom Portal URL',
    description: 'Your own branded portal at soullab.life/portal/your-name',
  },
];

function FeatureIcon({ icon, className }: { icon: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    calendar: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    sparkles: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    link: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  };
  return icons[icon] || null;
}

function PortalIcon({ icon, className }: { icon: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    sparkles: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    star: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    heart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    stethoscope: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    hand: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  };
  return icons[icon] || null;
}

function PortalsContent() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      // First check if user is a beta tester with SOULLAB-* passcode
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        // Beta testers with SOULLAB-* passcodes have automatic access
        if (userData.passkey?.startsWith('SOULLAB-')) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }
      }

      // Check if user already has portal access via API
      const response = await apiFetch('/api/studio/whoami');
      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.isPractitioner || data.hasPortalAccess);
      } else {
        setHasAccess(false);
      }
    } catch {
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsVerifying(true);
    setPasscodeError(null);

    try {
      const response = await apiFetch('/api/practitioners/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim().toUpperCase() }),
      });

      if (response.ok) {
        setHasAccess(true);
      } else {
        const data = await response.json();
        setPasscodeError(data.error || 'Invalid passcode');
      }
    } catch {
      setPasscodeError('Failed to verify passcode');
    } finally {
      setIsVerifying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-64 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  // If user has access, show portal selection
  if (hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-white">Pro Portals</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose your portal type to get started
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid gap-4">
          {PORTAL_OPTIONS.map((portal) => (
            <Link
              key={portal.type}
              href={portal.href}
              className="group bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                  <PortalIcon icon={portal.icon} className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white group-hover:text-purple-300 transition-colors">
                      {portal.label}
                    </h3>
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{portal.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {portal.examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-500 rounded"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/studio"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors"
          >
            Go to Studio
          </Link>
          <Link
            href="/studio/settings"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Portal Settings
          </Link>
        </div>
      </div>
    );
  }

  // Sales page with passcode entry
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm text-purple-400">Pro Portals for Practitioners</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-medium text-white mb-4">
          Your Practice, <span className="text-purple-400">Sovereign</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A complete practice management platform designed for healers, therapists, bodyworkers, and consciousness practitioners.
          Built on MAIA's sovereign infrastructure — your data stays yours.
        </p>
      </div>

      {/* Passcode Entry */}
      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-2xl p-8 mb-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-medium text-white mb-2">Have a Passcode?</h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter your Pro Portal passcode to unlock access
          </p>
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              placeholder="PORTAL-XXXXX"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center font-mono tracking-wider placeholder-gray-600 focus:border-purple-500 focus:outline-none"
            />
            {passcodeError && (
              <p className="text-sm text-red-400">{passcodeError}</p>
            )}
            <button
              type="submit"
              disabled={isVerifying || !passcode.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Pro Portals'}
            </button>
          </form>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-white text-center mb-8">Everything You Need</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                <FeatureIcon icon={feature.icon} className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-medium text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Portal Types Preview */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-white text-center mb-2">Specialized for Your Modality</h2>
        <p className="text-gray-500 text-center mb-8">
          Choose the portal type that fits your practice
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTAL_OPTIONS.map((portal) => (
            <div
              key={portal.type}
              className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 opacity-75"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <PortalIcon icon={portal.icon} className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="font-medium text-gray-400">{portal.label}</h3>
              </div>
              <p className="text-xs text-gray-600">{portal.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-xl font-medium text-white mb-2">Ready to Transform Your Practice?</h2>
        <p className="text-gray-400 mb-6">
          Contact us to get your Pro Portal passcode and start your sovereign practice journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:kelly@soullab.life?subject=Pro Portal Access"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
          >
            Request Access
          </a>
          <Link
            href="/practitioner/dashboard"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Try Free Practice Tools
          </Link>
        </div>
        <p className="text-xs text-gray-600 mt-4">
          Already have MAIA access? The free practice dashboard is available to all members.
        </p>
      </div>
    </div>
  );
}

export default function PortalsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-64 bg-gray-800 rounded-lg" />
        </div>
      </div>
    }>
      <PortalsContent />
    </Suspense>
  );
}
