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
  CalendarPlus,
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
  Globe,
  Compass,
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
  | 'consultant'
  | 'personal';

export type ModuleSlug =
  | 'command_center'
  | 'field'
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
  | 'settings'
  | 'portal'
  | 'scheduling'
  | 'booking'
  | 'vision-studio'
  | 'soul_portraits'
  | 'maia-guidance'
  | 'materials'
  | 'programs';

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
  /**
   * When true, the module is hidden from nav (getVisibleModules filters it out)
   * regardless of presets or enabled_modules. Use for surfaces with no working
   * backend yet — avoids shipping a broken door. Reversible: remove the flag.
   */
  comingSoon?: boolean;
}

// ─── All Modules (ordered as they appear in nav) ────────

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // ── Core (both modes) ──
  {
    slug: 'command_center',
    label: 'Home',
    icon: LayoutGrid,
    href: '/studio',
    category: 'core',
    description: 'Your practice at a glance',
    alwaysOn: true,
    mode: 'practice',
  },
  {
    // Personal Field home — the orientation floor. Symmetric to command_center
    // ("Home") in Practice mode: always-on, leads the sidebar, the place you
    // return to. mode 'field' → shows in Personal Field, hidden in Practice.
    slug: 'field',
    label: 'Field',
    icon: Compass,
    href: '/studio/field',
    category: 'core',
    description: 'Your orientation space — what is alive right now',
    alwaysOn: true,
    mode: 'field',
  },
  {
    slug: 'threshold',
    label: 'Threshold',
    icon: DoorOpen,
    href: '/studio/threshold',
    category: 'core',
    description: 'Six-week passage for practitioners',
    alwaysOn: false,
    // Practitioner passage — does not belong in Personal Field. Shows in Practice Portal only.
    mode: 'practice',
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
    slug: 'maia-guidance',
    label: 'MAIA Guidance',
    icon: Compass,
    href: '/studio/maia-guidance',
    category: 'clients',
    description: 'Shape how MAIA engages within your field — tone, language, boundaries (narrows only; never overrides her safeguards)',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'materials',
    label: 'Materials',
    icon: FolderOpen,
    href: '/studio/materials',
    category: 'clients',
    description: 'Upload and organize your writings, recordings, and worksheets — you ratify what MAIA may draw on',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'programs',
    label: 'Programs',
    icon: DoorOpen,
    href: '/studio/programs',
    category: 'clients',
    description: 'Build your courses, workshops, and trainings — steps, materials, practices',
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
    slug: 'soul_portraits',
    label: 'Soul Portraits',
    icon: Sparkles,
    href: '/studio/soul-portraits',
    category: 'clients',
    description: 'Generate and steward private Soul Portrait drafts',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'portal',
    label: 'Client Portal',
    icon: Globe,
    href: '/studio/portal',
    category: 'clients',
    description: 'Manage client portal access and invites',
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
    description: 'Your schedule and what is coming',
    alwaysOn: false,
    // On the Personal sidebar too (Kelly directive). Today's day-calendar lives
    // in the Field home (field_events); this links to the fuller calendar view.
    mode: 'both',
  },
  {
    slug: 'scheduling',
    label: 'Scheduling',
    icon: CalendarPlus,
    href: '/studio/scheduling',
    category: 'operations',
    description: 'Availability hours, blocked dates, and booking link',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'booking',
    label: 'Booking & Reservations',
    icon: CalendarDays,
    href: '/studio/booking',
    category: 'operations',
    description: 'Your booking page, services, availability, and upcoming reservations',
    alwaysOn: false,
    mode: 'practice',
  },
  {
    slug: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/studio/tasks',
    category: 'operations',
    description: 'Track what needs doing',
    alwaysOn: false,
    // Person-centric — a task is a task whether you're a practitioner, founder,
    // or member. Available in both modes so Personal has a home for intentions
    // (keeps the Field contemplative instead of a disguised task list).
    mode: 'both',
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
    // Showroom only (mockStats, no backend) — hidden from the practitioner
    // threshold until a real campaigns backend exists. Reversible.
    comingSoon: true,
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
    // No backend yet: /api/vault/files and the vault_files table do not exist, so
    // the page 404s on load. Hidden until the storage backend is built/validated.
    // See docs/architecture/PRACTITIONER_STUDIO_INVENTORY_2026-06-06.md
    comingSoon: true,
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
    // Showroom only (browser-only, no backend) — hidden from the practitioner
    // threshold until real streaming tooling exists. Reversible.
    comingSoon: true,
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
    label: 'Session Studio',
    icon: Mic,
    href: '/studio/session-room',
    category: 'tools',
    description: 'Live session companion with recording, transcript, and MAIA',
    alwaysOn: false,
    mode: 'both',
  },

  // ── Collaboration ──
  {
    slug: 'teams',
    label: 'Co-lab',
    icon: Users,
    href: '/team',
    category: 'collaboration',
    description: 'Co-lab collaboration and delegation',
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
    // Showroom only (no backend) — hidden from the practitioner threshold
    // until real integrations exist. Reversible.
    comingSoon: true,
  },
  {
    slug: 'vision-studio',
    label: 'Vision Studio',
    icon: Compass,
    href: '/maia/vision-studio',
    category: 'tools',
    description: 'Developmental field — vision, legacy, and long arc',
    alwaysOn: false,
    mode: 'both',
    // Un-gated 2026-07 (beta): consent threshold shipped; per-thread shareWithPractitioner
    // defaults private; routes are functional. Founder/practitioner-scoped via nav audience gate.
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
  generalist: ['clients', 'portal', 'sessions', 'scheduling', 'booking', 'calendar', 'tasks', 'teams', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'vault', 'vision-studio', 'soul_portraits'],
  astrology: ['clients', 'portal', 'sessions', 'scheduling', 'booking', 'calendar', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'vault', 'soul_portraits'],
  therapy: ['clients', 'portal', 'sessions', 'scheduling', 'booking', 'caseload', 'calendar', 'teams', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'vault', 'comms', 'soul_portraits'],
  clinician: ['clients', 'portal', 'sessions', 'scheduling', 'booking', 'caseload', 'calendar', 'teams', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'vault', 'comms', 'soul_portraits'],
  bodywork: ['clients', 'portal', 'sessions', 'scheduling', 'booking', 'calendar', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'services', 'soul_portraits'],
  groups: ['clients', 'portal', 'groups', 'sessions', 'scheduling', 'booking', 'calendar', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'comms', 'marketing', 'soul_portraits'],
  consultant: ['clients', 'portal', 'sessions', 'scheduling', 'booking', 'calendar', 'tasks', 'decisions', 'changes', 'maia', 'maia-guidance', 'materials', 'programs', 'comms', 'teams', 'soul_portraits'],
  personal: ['decisions', 'changes', 'maia', 'vault', 'threshold', 'tools', 'tasks', 'calendar', 'vision-studio'],
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

  // Hide modules with no working backend yet (e.g. Vault) regardless of source.
  modules = modules.filter(m => !m.comingSoon);

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
