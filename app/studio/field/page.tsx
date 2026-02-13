'use client';

import { useState, useEffect } from 'react';
import { Wind, Scale, BookOpen, Calendar, CheckSquare, Mic } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { InsightTrigger } from '@/components/guidance/InsightTrigger';

interface FieldStats {
  activeChanges: number;
  activeDecisions: number;
  upcomingSessions: number;
  pendingTasks: number;
}

export default function FieldPage() {
  const [stats, setStats] = useState<FieldStats>({
    activeChanges: 0,
    activeDecisions: 0,
    upcomingSessions: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFieldState() {
      try {
        // Load active changes count
        const [changesRes, decisionsRes] = await Promise.allSettled([
          apiFetch('/api/studio/changes?status=active&limit=1').then(r => r.json()),
          apiFetch('/api/studio/decisions?status=active&limit=1').then(r => r.json()),
        ]);

        setStats({
          activeChanges: changesRes.status === 'fulfilled' ? (changesRes.value.changes?.length ?? 0) : 0,
          activeDecisions: decisionsRes.status === 'fulfilled' ? (decisionsRes.value.decisions?.length ?? 0) : 0,
          upcomingSessions: 0,
          pendingTasks: 0,
        });
      } catch {
        // Silent fail — field page is orientation, not critical
      } finally {
        setLoading(false);
      }
    }
    loadFieldState();
  }, []);

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-12">
          <p className="text-slate-500 text-sm tracking-wider uppercase mb-2">{greeting.label}</p>
          <h1 className="text-3xl font-light text-white mb-2 flex items-center gap-2">
            Field
            <InsightTrigger featureKey="studio.field" />
          </h1>
          <p className="text-slate-400">Your personal orientation space. What wants attention?</p>
        </div>

        {/* Field Entry Points */}
        <div className="space-y-3">
          <FieldCard
            href="/studio/changes"
            icon={Wind}
            title="Changes"
            subtitle="Navigate what is shifting"
            count={stats.activeChanges}
            loading={loading}
            accent="amber"
          />
          <FieldCard
            href="/studio/decisions"
            icon={Scale}
            title="Decisions"
            subtitle="Clarify what needs choosing"
            count={stats.activeDecisions}
            loading={loading}
            accent="blue"
          />
          <FieldCard
            href="/studio/scribe"
            icon={Mic}
            title="Scribe"
            subtitle="Speak what needs to be heard"
            accent="emerald"
          />
          <FieldCard
            href="/studio/vault"
            icon={BookOpen}
            title="Vault"
            subtitle="Private notes and reflections"
            accent="purple"
          />
          <FieldCard
            href="/studio/calendar"
            icon={Calendar}
            title="Calendar"
            subtitle="What is coming"
            accent="slate"
          />
          <FieldCard
            href="/studio/tasks"
            icon={CheckSquare}
            title="Tasks"
            subtitle="What needs doing"
            accent="slate"
          />
        </div>
      </div>
    </div>
  );
}

function FieldCard({
  href,
  icon: Icon,
  title,
  subtitle,
  count,
  loading,
  accent = 'slate',
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  count?: number;
  loading?: boolean;
  accent?: string;
}) {
  const accentColors: Record<string, string> = {
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    slate: 'text-slate-400',
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition group"
    >
      <Icon className={`w-5 h-5 ${accentColors[accent] ?? 'text-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium">{title}</div>
        <div className="text-slate-500 text-xs">{subtitle}</div>
      </div>
      {loading ? (
        <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />
      ) : count !== undefined && count > 0 ? (
        <span className={`text-xs ${accentColors[accent] ?? 'text-slate-400'} bg-white/5 px-2 py-1 rounded-full`}>
          {count} active
        </span>
      ) : null}
    </Link>
  );
}

function getGreeting(): { label: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { label: 'Still night' };
  if (hour < 12) return { label: 'Morning' };
  if (hour < 17) return { label: 'Afternoon' };
  if (hour < 21) return { label: 'Evening' };
  return { label: 'Night' };
}
