// MAIA Ops v1 — Founder sidebar navigation
import {
  CalendarCheck,
  Users,
  FileText,
  Rocket,
  Activity,
  Eye,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface FounderNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}

export const FOUNDER_NAV: FounderNavItem[] = [
  {
    label: 'Today',
    href: '/founder/today',
    icon: CalendarCheck,
    description: 'What matters right now',
  },
  {
    label: 'Pipeline',
    href: '/founder/pipeline',
    icon: Users,
    description: 'Leads, partners, practitioners',
  },
  {
    label: 'Content',
    href: '/founder/content',
    icon: FileText,
    description: 'Ideas, drafts, publications',
  },
  {
    label: 'Rollout',
    href: '/founder/rollout',
    icon: Rocket,
    description: 'Beta testers and activation',
  },
  {
    label: 'Growth & AI work',
    href: '/founder/constellation/work',
    icon: Activity,
    description: 'What people choose to tell us',
  },
  {
    label: 'Signals',
    href: '/founder/signals',
    icon: Activity,
    description: 'Health, momentum, risks',
  },
  {
    label: 'Relational Patterns',
    href: '/founder/relational-patterns',
    icon: Eye,
    description: 'Pattern detection review',
  },
];

/** Focused browser work area; does not expose unrelated flag-off founder tools. */
export const CONSTELLATION_FOUNDER_NAV: FounderNavItem[] = [
  { label: 'Growth & AI work', href: '/founder/constellation/work', icon: Activity, description: 'One outcome and one working brief' },
  { label: 'Pilot packet', href: '/founder/constellation/pilot', icon: FileText, description: 'Review the first invitation and experience' },
  { label: 'Doorway learning', href: '/founder/constellation', icon: Eye, description: 'What people choose to tell us' },
];
