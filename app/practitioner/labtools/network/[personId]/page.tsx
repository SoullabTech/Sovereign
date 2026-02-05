'use client';

/**
 * Contact Detail Page
 * View and manage a specific contact
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Contact {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  personType: string;
  company: string | null;
  roleTitle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  source: string | null;
  tags: string[];
  notesPrivate: string | null;
  recentMeetings: Array<{
    id: string;
    title: string;
    scheduledStartAt: string;
    meetingType: string;
    status: string;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    stage: string;
    estimatedValueCents: number | null;
  }>;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  partner: 'Partner',
  prospect: 'Prospect',
  vendor: 'Vendor',
  investor: 'Investor',
  team: 'Team',
  contact: 'Contact',
};

const TYPE_COLORS: Record<string, string> = {
  partner: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  prospect: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  vendor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  investor: 'bg-green-500/20 text-green-300 border-green-500/30',
  team: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  contact: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(cents: number | null) {
  if (!cents) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.personId as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPracticeId(practices[0].id);

        const contactRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/labtools/network/${personId}`
        );
        if (!contactRes.ok) throw new Error('Failed to load contact');
        const { contact: c } = await contactRes.json();
        setContact(c);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, personId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64" />
          <div className="h-32 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error || 'Contact not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/practitioner/labtools/network')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-medium text-white">{contact.displayName}</h1>
            {(contact.roleTitle || contact.company) && (
              <p className="text-sm text-gray-400 mt-0.5">
                {contact.roleTitle}{contact.roleTitle && contact.company && ' at '}{contact.company}
              </p>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm border ${TYPE_COLORS[contact.personType] || TYPE_COLORS.contact}`}>
          {TYPE_LABELS[contact.personType] || contact.personType}
        </span>
      </header>

      {/* Contact Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {contact.email && (
            <div>
              <span className="text-gray-500">Email</span>
              <a href={`mailto:${contact.email}`} className="block text-amber-400 hover:underline">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div>
              <span className="text-gray-500">Phone</span>
              <a href={`tel:${contact.phone}`} className="block text-white">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.linkedinUrl && (
            <div>
              <span className="text-gray-500">LinkedIn</span>
              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="block text-amber-400 hover:underline">
                View Profile
              </a>
            </div>
          )}
          {contact.source && (
            <div>
              <span className="text-gray-500">Source</span>
              <p className="text-white capitalize">{contact.source.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {contact.notesPrivate && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Notes</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{contact.notesPrivate}</p>
        </div>
      )}

      {/* Recent Meetings */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Recent Meetings</h2>
          <Link
            href={`/practitioner/labtools/meetings/new?personId=${contact.id}`}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            + Schedule
          </Link>
        </div>
        {contact.recentMeetings.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No meetings yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {contact.recentMeetings.map(meeting => (
              <Link
                key={meeting.id}
                href={`/practitioner/labtools/meetings/${meeting.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-700/30"
              >
                <div>
                  <p className="text-white">{meeting.title}</p>
                  <p className="text-xs text-gray-500">{meeting.meetingType}</p>
                </div>
                <span className="text-sm text-gray-400">{formatDate(meeting.scheduledStartAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Opportunities */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Opportunities</h2>
          <Link
            href={`/practitioner/labtools/pipeline/new?personId=${contact.id}`}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            + New
          </Link>
        </div>
        {contact.opportunities.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No opportunities yet
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {contact.opportunities.map(opp => (
              <Link
                key={opp.id}
                href={`/practitioner/labtools/pipeline/${opp.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-700/30"
              >
                <div>
                  <p className="text-white">{opp.title}</p>
                  <p className="text-xs text-gray-500">{opp.stage}</p>
                </div>
                <span className="text-sm text-green-400">{formatCurrency(opp.estimatedValueCents)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/practitioner/labtools/meetings/new?personId=${contact.id}`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          + Schedule Meeting
        </Link>
        <Link
          href={`/practitioner/labtools/pipeline/new?personId=${contact.id}`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          + New Opportunity
        </Link>
      </div>
    </div>
  );
}
