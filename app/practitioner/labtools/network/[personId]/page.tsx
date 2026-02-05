'use client';

/**
 * Person Timeline Page
 * View person details and activity history
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface TimelineItem {
  type: string;
  id: string;
  title: string;
  description?: string;
  date: string;
  status?: string;
}

interface Person {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  relationshipType: string | null;
  notesPrivate: string | null;
  tags: string[];
}

interface PersonData {
  person: Person;
  timeline: TimelineItem[];
  summary: {
    opportunitiesCount: number;
    meetingsCount: number;
    tasksCount: number;
    containersCount: number;
  };
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  client: 'Client',
  prospect: 'Prospect',
  partner: 'Partner',
  vendor: 'Vendor',
  team_member: 'Team Member',
  advisor: 'Advisor',
  investor: 'Investor',
  other: 'Other'
};

const TYPE_ICONS: Record<string, string> = {
  opportunity: '📊',
  meeting: '📅',
  task: '✓',
  container: '📁'
};

const TYPE_COLORS: Record<string, string> = {
  opportunity: 'text-blue-400',
  meeting: 'text-purple-400',
  task: 'text-green-400',
  container: 'text-amber-400'
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return formatDate(dateStr);
}

export default function PersonTimelinePage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.personId as string;

  const [data, setData] = useState<PersonData | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPerson() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);

        const practicesRes = await fetch('/api/practitioner/practices', {
          headers: { 'x-member-id': member.id }
        });

        if (!practicesRes.ok) throw new Error('Failed to load practices');

        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }

        const practice = practices[0];
        setPracticeId(practice.id);

        const timelineRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/people/${personId}/timeline`,
          { headers: { 'x-member-id': member.id } }
        );

        if (!timelineRes.ok) {
          if (timelineRes.status === 404) {
            throw new Error('Person not found');
          }
          throw new Error('Failed to load timeline');
        }

        const timelineData = await timelineRes.json();
        setData(timelineData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load person');
      } finally {
        setIsLoading(false);
      }
    }

    loadPerson();
  }, [router, personId]);

  const getItemLink = (item: TimelineItem): string => {
    switch (item.type) {
      case 'opportunity':
        return `/practitioner/labtools/pipeline/${item.id}`;
      case 'meeting':
        return `/practitioner/labtools/meetings/${item.id}`;
      case 'container':
        return `/practitioner/containers/${item.id}`;
      default:
        return '#';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="h-48 bg-gray-800 rounded mb-6" />
          <div className="h-64 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error || 'Failed to load person'}</p>
          </div>
          <Link
            href="/practitioner/labtools/network"
            className="text-sm text-gray-500 hover:text-gray-400 mt-4 block"
          >
            ← Back to Network
          </Link>
        </div>
      </div>
    );
  }

  const { person, timeline, summary } = data;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/practitioner/labtools" className="hover:text-gray-400">
              Labtools
            </Link>
            <span>/</span>
            <Link href="/practitioner/labtools/network" className="hover:text-gray-400">
              Network
            </Link>
            <span>/</span>
            <span className="text-gray-400">{person.displayName}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-medium text-white">{person.displayName}</h1>
                {person.relationshipType && (
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
                    {RELATIONSHIP_LABELS[person.relationshipType] || person.relationshipType}
                  </span>
                )}
              </div>
              {(person.role || person.company) && (
                <p className="text-sm text-gray-400 mt-1">
                  {person.role}
                  {person.role && person.company && ' at '}
                  {person.company}
                </p>
              )}
            </div>
            <Link
              href={`/practitioner/people/${personId}`}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white
                       border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Edit
            </Link>
          </div>
        </header>

        {/* Contact Info */}
        <section className="mb-8">
          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {person.email && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
                  <a
                    href={`mailto:${person.email}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {person.email}
                  </a>
                </div>
              )}
              {person.phone && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</div>
                  <a
                    href={`tel:${person.phone}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {person.phone}
                  </a>
                </div>
              )}
            </div>

            {person.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {person.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8">
          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-medium text-white tabular-nums">
                  {summary.opportunitiesCount}
                </div>
                <div className="text-xs text-gray-500">Opportunities</div>
              </div>
              <div>
                <div className="text-xl font-medium text-white tabular-nums">
                  {summary.meetingsCount}
                </div>
                <div className="text-xs text-gray-500">Meetings</div>
              </div>
              <div>
                <div className="text-xl font-medium text-white tabular-nums">
                  {summary.tasksCount}
                </div>
                <div className="text-xs text-gray-500">Tasks</div>
              </div>
              <div>
                <div className="text-xl font-medium text-white tabular-nums">
                  {summary.containersCount}
                </div>
                <div className="text-xs text-gray-500">Relationships</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="flex gap-3">
            <Link
              href={`/practitioner/labtools/pipeline/new?personId=${personId}`}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300
                       rounded-lg transition-colors"
            >
              + Add Opportunity
            </Link>
            <Link
              href={`/practitioner/labtools/meetings/new?attendeeId=${personId}`}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300
                       rounded-lg transition-colors"
            >
              + Schedule Meeting
            </Link>
            <Link
              href={`/practitioner/tasks/new?personId=${personId}`}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300
                       rounded-lg transition-colors"
            >
              + Add Task
            </Link>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
            Activity Timeline
          </h2>

          {timeline.length === 0 ? (
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6 text-center text-gray-500">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={getItemLink(item)}
                  className="block bg-[#111827] rounded-xl border border-gray-700 p-4
                           hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{TYPE_ICONS[item.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${TYPE_COLORS[item.type]}`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        {item.status && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-medium mt-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelativeDate(item.date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        {person.notesPrivate && (
          <section className="mt-8">
            <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
              Private Notes
            </h2>
            <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
              <p className="text-gray-300 whitespace-pre-wrap">{person.notesPrivate}</p>
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/labtools/network"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Network
          </Link>
        </div>
      </div>
    </div>
  );
}
