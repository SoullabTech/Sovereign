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
  Wind,
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
  | 'changes'
  | 'teams'
  | 'maia'
  | 'tools'
  | 'settings';

export type ModuleCategory = 'core' | 'clients' | 'operations' | 'tools' | 'collaboration';

/**
 * Which studio mode a module appears in.
 *
 * Naming convention (keep these layers separate):
 *   DB / API state:  'personal' | 'practice'  (members.studio_mode)
 *   Module tag:      'field' | 'practice' | 'both'  (this type)
 *   UI label:        "Field" | "Practice"
 *
 * Translation: personal (state) → shows field + both modules → labeled "Field"
 */
export type ModuleMode = 'field' | 'practice' | 'both';

export interface ModuleDefinition {
  slug: ModuleSlug;
  label: string;
  icon: LucideIcon;
  href: string;
  category: ModuleCategory;
  description: string;
  alwaysOn: boolean;
  /** Which mode this module appears in. Defaults to 'both' if omitted. */
  mode: ModuleMode;
}

// ─── All Modules (ordered as they appear in nav) ────────

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // ── Core (both modes) ──
  {
    slug: 'command_center',
    label: 'Command Center',
    icon: LayoutGrid,
    href: '/studio',
    category: 'core',
    description: 'Your daily dashboard and triage queue',
    alwaysOn: true,
    mode: 'practice',
  },
  {
    slug: 'threshold',
    label: 'Threshold',
    icon: DoorOpen,
    href: '/studio/threshold',
    category: 'core',
    description: 'Six-week passage for practitioners',
    alwaysOn: false,
    mode: 'both',
  },

  // ── Practice modules (client-facing, operational) ──
  {
    slug: 'clients',
    label: 'Clients',
    icon: Users,
    href: '/studio/clients',
    category: 'clients',
    description: 'Manage your client relationships',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'groups',
    label: 'Groups',
    icon: FolderOpen,
    href: '/studio/groups',
    category: 'clients',
    description: 'Group programs, circles, and cohorts',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'sessions',
    label: 'Sessions',
    icon: Calendar,
    href: '/studio/sessions',
    category: 'operations',
    description: 'Session scheduling and notes',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'caseload',
    label: 'Caseload',
    icon: Briefcase,
    href: '/studio/caseload',
    category: 'operations',
    description: 'Active caseload management',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'services',
    label: 'Services',
    icon: Package,
    href: '/studio/services',
    category: 'operations',
    description: 'Service offerings and packages',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
    href: '/studio/calendar',
    category: 'operations',
    description: 'Availability and booking calendar',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/studio/tasks',
    category: 'operations',
    description: 'Task delegation and tracking',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'comms',
    label: 'Communications',
    icon: MessageSquare,
    href: '/studio/comms',
    category: 'operations',
    description: 'Client messaging and notifications',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    href: '/studio/marketing',
    category: 'operations',
    description: 'Outreach, campaigns, and content',
    alwaysOn: false,
    mode: 'practice',
  },

  // ── Field modules (personal orientation) ──
  {
    slug: 'decisions',
    label: 'Decisions',
    icon: Scale,
    href: '/studio/decisions',
    category: 'tools',
    description: 'Leadership decision logs and frameworks',
    alwaysOn: false,
    mode: 'field',
  },
  {
    slug: 'changes',
    label: 'Changes',
    icon: Wind,
    href: '/studio/changes',
    category: 'tools',
    description: 'Navigate life transitions with I Ching wisdom',
    alwaysOn: false,
    mode: 'field',
  },

  // ── Shared tools (both modes) ──
  {
    slug: 'vault',
    label: 'Vault',
    icon: Lock,
    href: '/studio/vault',
    category: 'tools',
    description: 'Secure document and note storage',
    alwaysOn: false,
    mode: 'both',
  },
  {
    slug: 'media',
    label: 'Media Studio',
    icon: MonitorPlay,
    href: '/studio/media',
    category: 'tools',
    description: 'Media production and editing',
    alwaysOn: false,
    mode: 'both',
  },
  {
    slug: 'camera',
    label: 'Live Camera',
    icon: Camera,
    href: '/studio/camera',
    category: 'tools',
    description: 'Live video and streaming tools',
    alwaysOn: false,
    mode: 'both',
  },
  {
    slug: 'code',
    label: 'Code Sessions',
    icon: Code2,
    href: '/studio/code',
    category: 'tools',
    description: 'AI agent code sessions',
    alwaysOn: false,
    mode: 'both',
  },
  {
    slug: 'scribe',
    label: 'Scribe',
    icon: Mic,
    href: '/studio/scribe',
    category: 'tools',
    description: 'Voice transcription and notes',
    alwaysOn: false,
    mode: 'both',
  },

  // ── Collaboration ──
  {
    slug: 'teams',
    label: 'Teams',
    icon: Users,
    href: '/studio/teams',
    category: 'collaboration',
    description: 'Team collaboration and delegation',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'maia',
    label: 'MAIA',
    icon: Sparkles,
    href: '/studio/maia',
    category: 'core',
    description: 'Your sovereign AI companion',
    alwaysOn: false,
    mode: 'both',
  },
  {
    slug: 'tools',
    label: 'Tools',
    icon: Wrench,
    href: '/studio/tools',
    category: 'tools',
    description: 'Integrations and utilities',
    alwaysOn: false,
    mode: 'both',
  },
  {
    slug: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/studio/settings',
    category: 'core',
    description: 'Studio configuration',
    alwaysOn: true,
    mode: 'both',
  },
];

// ─── Presets per Portal Type ────────────────────────────

const MODULE_PRESETS: Record<PortalType, ModuleSlug[]> = {
  generalist: ['clients', 'sessions', 'calendar', 'tasks', 'decisions', 'changes', 'maia', 'vault'],
  astrology: ['clients', 'sessions', 'calendar', 'decisions', 'changes', 'maia', 'vault'],
  therapy: ['clients', 'sessions', 'caseload', 'calendar', 'decisions', 'changes', 'maia', 'vault', 'comms'],
  clinician: ['clients', 'sessions', 'caseload', 'calendar', 'decisions', 'changes', 'maia', 'vault', 'comms'],
  bodywork: ['clients', 'sessions', 'calendar', 'decisions', 'changes', 'maia', 'services'],
  groups: ['clients', 'groups', 'sessions', 'calendar', 'decisions', 'changes', 'maia', 'comms', 'marketing'],
  consultant: ['clients', 'sessions', 'calendar', 'tasks', 'decisions', 'changes', 'maia', 'comms', 'teams'],
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
  portalType: PortalType,
  /** Optional mode filter: 'personal' shows field + both, 'practice' shows practice + both */
  studioMode?: 'personal' | 'practice'
): ModuleDefinition[] {
  const slugs = enabledModules ?? getDefaultModules(portalType);
  const alwaysOn = MODULE_DEFINITIONS.filter(m => m.alwaysOn).map(m => m.slug);
  const all = new Set([...alwaysOn, ...slugs]);

  let modules = MODULE_DEFINITIONS.filter(m => all.has(m.slug));

  // Filter by studio mode if provided
  if (studioMode === 'personal') {
    modules = modules.filter(m => m.mode === 'field' || m.mode === 'both');
  } else if (studioMode === 'practice') {
    modules = modules.filter(m => m.mode === 'practice' || m.mode === 'both');
  }

  return modules;
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
