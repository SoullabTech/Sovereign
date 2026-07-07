/**
 * Studio Navigation Config — Separate workspace shell
 *
 * Studio is a distinct environment from MAIA with different posture:
 *   MAIA = presence, reflection, emergence
 *   Studio = execution, structure, output
 *
 * Studio has its own layout shell and should never be merged into MAIA.
 */

import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Megaphone,
  Camera,
  Code,
  Bot,
  Briefcase,
  UserCircle,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export interface StudioNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  category: StudioCategory;
}

export type StudioCategory =
  | 'overview'
  | 'clients'
  | 'content'
  | 'tools'
  | 'settings';

export const STUDIO_NAV_ITEMS: StudioNavItem[] = [
  // Overview
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/studio', category: 'overview' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, route: '/studio/metrics', category: 'overview' },

  // Clients
  { id: 'clients', label: 'Clients', icon: Users, route: '/studio/clients', category: 'clients' },
  { id: 'caseload', label: 'Caseload', icon: FolderOpen, route: '/studio/caseload', category: 'clients' },
  { id: 'groups', label: 'Groups', icon: Users, route: '/studio/groups', category: 'clients' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, route: '/studio/calendar', category: 'clients' },
  { id: 'comms', label: 'Messages', icon: MessageSquare, route: '/studio/comms', category: 'clients' },

  // Content
  { id: 'changes', label: 'Changes', icon: FileText, route: '/studio/changes', category: 'content' },
  { id: 'decisions', label: 'Decisions', icon: FileText, route: '/studio/decisions', category: 'content' },
  { id: 'case-studies', label: 'Case Studies', icon: FileText, route: '/studio/case-studies', category: 'content' },
  { id: 'soul-portraits', label: 'Soul Portraits', icon: Sparkles, route: '/studio/soul-portraits', category: 'content' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, route: '/studio/marketing', category: 'content' },
  { id: 'media', label: 'Media', icon: Camera, route: '/studio/media', category: 'content' },

  // Tools
  { id: 'maia-consult', label: 'MAIA Consult', icon: Briefcase, route: '/studio/maia', category: 'tools' },
  { id: 'agents', label: 'Agents', icon: Bot, route: '/studio/agents', category: 'tools' },
  { id: 'code', label: 'Code', icon: Code, route: '/studio/code', category: 'tools' },
  { id: 'create', label: 'Create', icon: FileText, route: '/studio/create', category: 'tools' },

  // Settings
  { id: 'account', label: 'Account', icon: UserCircle, route: '/studio/account', category: 'settings' },
];

/** Get studio nav items grouped by category */
export function getStudioNavByCategory(): Record<StudioCategory, StudioNavItem[]> {
  const grouped: Record<StudioCategory, StudioNavItem[]> = {
    overview: [],
    clients: [],
    content: [],
    tools: [],
    settings: [],
  };
  for (const item of STUDIO_NAV_ITEMS) {
    grouped[item.category].push(item);
  }
  return grouped;
}

/** Return-to-MAIA route (used in Studio header) */
export const RETURN_TO_MAIA_ROUTE = '/maia';
