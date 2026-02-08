/**
 * STUDIO MODULE DEFINITIONS
 *
 * Single source of truth for all Studio nav modules.
 * Portal type determines default presets; practitioners customize via enabled_modules.
 */

import {
  LayoutGrid,
  Users,
  Calendar,
  CalendarDays,
  CheckSquare,
  Package,
  MessageSquare,
  Lock,
  MonitorPlay,
  Code2,
  Sparkles,
  Settings,
  Camera,
  Megaphone,
  FolderOpen,
  Briefcase,
  Wrench,
  Mic,
  DoorOpen,
  Scale,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────

export type PortalType =
  | 'generalist'
  | 'astrology'
  | 'therapy'
  | 'bodywork'
  | 'groups'
  | 'clinician'
  | 'consultant';

export type ModuleSlug =
  | 'command_center'
  | 'threshold'
  | 'clients'
  | 'groups'
  | 'sessions'
  | 'caseload'
  | 'services'
  | 'calendar'
  | 'tasks'
  | 'comms'
  | 'marketing'
  | 'vault'
  | 'media'
  | 'camera'
  | 'code'
  | 'scribe'
  | 'decisions'
  | 'teams'
  | 'maia'
  | 'tools'
  | 'settings';

export type ModuleCategory = 'core' | 'clients' | 'operations' | 'tools' | 'collaboration';

export interface ModuleDefinition {
  slug: ModuleSlug;
  label: string;
  icon: LucideIcon;
  href: string;
  category: ModuleCategory;
  description: string;
  alwaysOn: boolean;
}

// ─── All Modules (ordered as they appear in nav) ────────

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    slug: 'command_center',
    label: 'Command Center',
    icon: LayoutGrid,
    href: '/studio',
    category: 'core',
    description: 'Your daily dashboard and triage queue',
    alwaysOn: true,
  },
  {
    slug: 'threshold',
    label: 'Threshold',
    icon: DoorOpen,
    href: '/studio/threshold',
    category: 'core',
    description: 'Six-week passage for practitioners',
    alwaysOn: false,
  },
  {
    slug: 'clients',
    label: 'Clients',
    icon: Users,
    href: '/studio/clients',
    category: 'clients',
    description: 'Manage your client relationships',
    alwaysOn: false,
  },
  {
    slug: 'groups',
    label: 'Groups',
    icon: FolderOpen,
    href: '/studio/groups',
    category: 'clients',
    description: 'Group programs, circles, and cohorts',
    alwaysOn: false,
  },
  {
    slug: 'sessions',
    label: 'Sessions',
    icon: Calendar,
    href: '/studio/sessions',
    category: 'operations',
    description: 'Session scheduling and notes',
    alwaysOn: false,
  },
  {
    slug: 'caseload',
    label: 'Caseload',
    icon: Briefcase,
    href: '/studio/caseload',
    category: 'operations',
    description: 'Active caseload management',
    alwaysOn: false,
  },
  {
    slug: 'services',
    label: 'Services',
    icon: Package,
    href: '/studio/services',
    category: 'operations',
    description: 'Service offerings and packages',
    alwaysOn: false,
  },
  {
    slug: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
    href: '/studio/calendar',
    category: 'operations',
    description: 'Availability and booking calendar',
    alwaysOn: false,
  },
  {
    slug: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/studio/tasks',
    category: 'operations',
    description: 'Task delegation and tracking',
    alwaysOn: false,
  },
  {
    slug: 'comms',
    label: 'Communications',
    icon: MessageSquare,
    href: '/studio/comms',
    category: 'operations',
    description: 'Client messaging and notifications',
    alwaysOn: false,
  },
  {
    slug: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    href: '/studio/marketing',
    category: 'operations',
    description: 'Outreach, campaigns, and content',
    alwaysOn: false,
  },
  {
    slug: 'decisions',
    label: 'Decisions',
    icon: Scale,
    href: '/studio/decisions',
    category: 'tools',
    description: 'Leadership decision logs and frameworks',
    alwaysOn: false,
  },
  {
    slug: 'vault',
    label: 'Vault',
    icon: Lock,
    href: '/studio/vault',
    category: 'tools',
    description: 'Secure document and note storage',
    alwaysOn: false,
  },
  {
    slug: 'media',
    label: 'Media Studio',
    icon: MonitorPlay,
    href: '/studio/media',
    category: 'tools',
    description: 'Media production and editing',
    alwaysOn: false,
  },
  {
    slug: 'camera',
    label: 'Live Camera',
    icon: Camera,
    href: '/studio/camera',
    category: 'tools',
    description: 'Live video and streaming tools',
    alwaysOn: false,
  },
  {
    slug: 'code',
    label: 'Code Sessions',
    icon: Code2,
    href: '/studio/code',
    category: 'tools',
    description: 'AI agent code sessions',
    alwaysOn: false,
  },
  {
    slug: 'scribe',
    label: 'Scribe',
    icon: Mic,
    href: '/studio/scribe',
    category: 'tools',
    description: 'Voice transcription and notes',
    alwaysOn: false,
  },
  {
    slug: 'teams',
    label: 'Teams',
    icon: Users,
    href: '/studio/teams',
    category: 'collaboration',
    description: 'Team collaboration and delegation',
    alwaysOn: false,
  },
  {
    slug: 'maia',
    label: 'MAIA',
    icon: Sparkles,
    href: '/studio/maia',
    category: 'core',
    description: 'Your sovereign AI companion',
    alwaysOn: false,
  },
  {
    slug: 'tools',
    label: 'Tools',
    icon: Wrench,
    href: '/studio/tools',
    category: 'tools',
    description: 'Integrations and utilities',
    alwaysOn: false,
  },
  {
    slug: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/studio/settings',
    category: 'core',
    description: 'Studio configuration',
    alwaysOn: true,
  },
];

// ─── Presets per Portal Type ────────────────────────────

const MODULE_PRESETS: Record<PortalType, ModuleSlug[]> = {
  generalist: ['clients', 'sessions', 'calendar', 'tasks', 'decisions', 'maia', 'vault'],
  astrology: ['clients', 'sessions', 'calendar', 'decisions', 'maia', 'vault'],
  therapy: ['clients', 'sessions', 'caseload', 'calendar', 'decisions', 'maia', 'vault', 'comms'],
  clinician: ['clients', 'sessions', 'caseload', 'calendar', 'decisions', 'maia', 'vault', 'comms'],
  bodywork: ['clients', 'sessions', 'calendar', 'decisions', 'maia', 'services'],
  groups: ['clients', 'groups', 'sessions', 'calendar', 'decisions', 'maia', 'comms', 'marketing'],
  consultant: ['clients', 'sessions', 'calendar', 'tasks', 'decisions', 'maia', 'comms', 'teams'],
};

// ─── Helpers ────────────────────────────────────────────

/** Get default module slugs for a portal type (including always-on modules) */
export function getDefaultModules(portalType: PortalType): ModuleSlug[] {
  const alwaysOn = MODULE_DEFINITIONS.filter(m => m.alwaysOn).map(m => m.slug);
  const preset = MODULE_PRESETS[portalType] ?? MODULE_PRESETS.generalist;
  // Deduplicate and preserve definition order
  const all = new Set([...alwaysOn, ...preset]);
  return MODULE_DEFINITIONS.filter(m => all.has(m.slug)).map(m => m.slug);
}

/** Get visible modules for a practitioner (resolved from enabled_modules or defaults) */
export function getVisibleModules(
  enabledModules: ModuleSlug[] | null,
  portalType: PortalType
): ModuleDefinition[] {
  const slugs = enabledModules ?? getDefaultModules(portalType);
  const alwaysOn = MODULE_DEFINITIONS.filter(m => m.alwaysOn).map(m => m.slug);
  const all = new Set([...alwaysOn, ...slugs]);
  return MODULE_DEFINITIONS.filter(m => all.has(m.slug));
}

/** All known module slugs (for validation) */
export const ALL_MODULE_SLUGS: ModuleSlug[] = MODULE_DEFINITIONS.map(m => m.slug);

/** Validate an array of module slugs */
export function validateModuleSlugs(slugs: string[]): slugs is ModuleSlug[] {
  const valid = new Set<string>(ALL_MODULE_SLUGS);
  return slugs.every(s => valid.has(s));
}

/** Get module definitions grouped by category */
export function getModulesByCategory(): Record<ModuleCategory, ModuleDefinition[]> {
  const grouped: Record<ModuleCategory, ModuleDefinition[]> = {
    core: [],
    clients: [],
    operations: [],
    tools: [],
    collaboration: [],
  };
  for (const mod of MODULE_DEFINITIONS) {
    grouped[mod.category].push(mod);
  }
  return grouped;
}

/** Category display labels */
export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: 'Core',
  clients: 'Clients & Groups',
  operations: 'Operations',
  tools: 'Tools',
  collaboration: 'Collaboration',
};
