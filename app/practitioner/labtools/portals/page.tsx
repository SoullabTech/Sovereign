'use client';

/**
 * Practitioner Portals Page
 * Access different practitioner portal variants
 */

import { Suspense } from 'react';
import Link from 'next/link';

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
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-white">Pro Portals</h2>
        <p className="text-sm text-gray-500 mt-1">
          Specialized portals for different practitioner types
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

      {/* Info Card */}
      <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-sm font-medium text-purple-400 mb-2">About Pro Portals</h3>
        <p className="text-sm text-gray-400">
          Each portal type comes with customized defaults, templates, and workflows designed for your specific practice modality.
          You can always change your portal type later in Studio Settings.
        </p>
        <div className="mt-4">
          <Link
            href="/studio"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Go to Studio →
          </Link>
        </div>
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
