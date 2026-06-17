'use client';

// ─────────────────────────────────────────────────────────────────────────────
// MAIA ASSIST — capability surface. One place that shows what MAIA can do in the
// world on your behalf, with an HONEST status for each. This is a legibility
// surface, not new functionality: it links to the live Email UI and names what is
// not built or not exposed. Every Assist action follows the same constitution —
// authored by you, sent only with explicit consent, audited, and revocable.
//
// Status accuracy is the point. The badges are the promotion ladder made visible:
//   Live · Pending Certification · In Build · Blocked · Not Available
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { Mail, CalendarDays, MessageSquareText, ArrowRight, Check, Minus, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Status = 'Live' | 'Pending Certification' | 'In Build' | 'Blocked' | 'Not Available';

const STATUS_STYLE: Record<Status, string> = {
  'Live': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Pending Certification': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'In Build': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'Blocked': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'Not Available': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

interface Action { label: string; done: boolean }
interface Capability {
  key: string;
  title: string;
  icon: LucideIcon;
  status: Status;
  summary: string;
  note: string;
  actions: Action[];
  href?: string;
  hrefLabel?: string;
}

const CAPABILITIES: Capability[] = [
  {
    key: 'email',
    title: 'Email',
    icon: Mail,
    status: 'Pending Certification',
    summary: 'Schedule a human-authored email to send at a time you choose.',
    note: 'Delivery rail is live in production (worker → send → audit). The human UI path (author → consent → send, and author → revoke) is awaiting its A/B certification.',
    actions: [
      { label: 'Schedule an email', done: true },
      { label: 'View scheduled & sent', done: true },
      { label: 'Cancel a pending email', done: true },
      { label: 'Send a test to yourself', done: true },
    ],
    href: '/studio/scheduled-sends',
    hrefLabel: 'Open scheduled email',
  },
  {
    key: 'calendar',
    title: 'Calendar',
    icon: CalendarDays,
    status: 'In Build',
    summary: 'Create, schedule, or cancel a calendar event on your behalf.',
    note: 'Planned as the second Authorized Action executor. Booking/calendar substrate exists, but the consent-gated event executor is not built yet — so no event actions are exposed here.',
    actions: [
      { label: 'Create event', done: false },
      { label: 'Schedule event', done: false },
      { label: 'Cancel event', done: false },
    ],
  },
  {
    key: 'text',
    title: 'Text / SMS',
    icon: MessageSquareText,
    status: 'Blocked',
    summary: 'Send a text message on your behalf.',
    note: 'Blocked until SMS consent and A2P / carrier compliance are resolved. Provider code exists but is intentionally not exposed.',
    actions: [
      { label: 'Not available yet', done: false },
      { label: 'Requires SMS consent + A2P / compliance', done: false },
    ],
  },
];

const LEGEND: Status[] = ['Live', 'Pending Certification', 'In Build', 'Blocked', 'Not Available'];

function Badge({ status }: { status: Status }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>{status}</span>
  );
}

export default function AssistPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] p-5 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-light text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> MAIA Assist
          </h1>
          <p className="text-slate-400 text-sm">
            What MAIA can do in the world on your behalf — and what it can&rsquo;t yet. Every action here is
            authored by you, sent only with your explicit consent, audited, and revocable before it happens.
            MAIA never originates an action.
          </p>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {LEGEND.map((s) => <Badge key={s} status={s} />)}
        </div>

        {/* Capability cards */}
        <div className="space-y-3">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <section key={cap.key} className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-white text-base font-medium">{cap.title}</h2>
                      <Badge status={cap.status} />
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{cap.summary}</p>

                    <ul className="mt-3 space-y-1">
                      {cap.actions.map((a) => (
                        <li key={a.label} className="flex items-center gap-2 text-sm">
                          {a.done
                            ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            : <Minus className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                          <span className={a.done ? 'text-slate-200' : 'text-slate-500'}>{a.label}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">{cap.note}</p>

                    {cap.href && (
                      <Link href={cap.href}
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-200 border border-amber-500/30 hover:bg-amber-500/25 transition text-sm">
                        {cap.hrefLabel} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <p className="text-[12px] text-slate-600 mt-6 leading-relaxed">
          Each capability becomes certified only when it passes the same review — authorship, consent, faithful
          execution, no substitution, revocability, legibility — proven by an execute-and-revoke test. New
          channels are added as executors; the governing model does not change.
        </p>
      </div>
    </div>
  );
}
