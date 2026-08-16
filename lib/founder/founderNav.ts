// MAIA Ops v1 — Founder sidebar navigation
import {
  CalendarCheck,
  Users,
  FileText,
  Rocket,
  Activity,
  Eye,
  Sparkles,
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
  {
    label: 'Field Signals',
    href: '/founder/field-signals',
    icon: Sparkles,
    description: 'Participatory theme signals',
  },
];
