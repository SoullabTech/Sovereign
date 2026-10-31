/**
 * HOUSE-ENTRANCE-01 — what the learn-and-try Pro Studio page may say the full
 * studio holds. Derived from MODULE_DEFINITIONS (the single source of truth for
 * Studio modules) so the page cannot drift from the product, and stripped to
 * plain label + description so no icon, href or capability reaches the page.
 *
 * Practice-mode modules only, never a module flagged `comingSoon`, and only the
 * practice-facing set below (failure test: remove every unbuilt layer and the page
 * must still be true). Left out on purpose: generic navigation (MAIA, Settings),
 * developer/media tooling (Code Sessions, Media Studio, Session Room), surfaces
 * whose release state this page cannot vouch for (Threshold, Soul Portraits), and
 * Vision Studio, which is its own place in the House. Reviewable by the founder.
 */
import { MODULE_DEFINITIONS, type ModuleCategory, type ModuleSlug } from '@/lib/studio/moduleDefinitions';

export interface LearnAndTryItem { label: string; description: string }
export interface LearnAndTryGroup { title: string; items: LearnAndTryItem[] }

export const LEARN_AND_TRY_SLUGS: readonly ModuleSlug[] = [
  'command_center', 'clients', 'maia-guidance', 'materials', 'programs', 'groups', 'portal',
  'sessions', 'caseload', 'services', 'calendar', 'scheduling', 'booking', 'tasks', 'comms', 'teams',
];

const CATEGORY_ORDER: ModuleCategory[] = ['core', 'clients', 'operations', 'tools', 'collaboration'];

const CATEGORY_TITLE: Record<ModuleCategory, string> = {
  core: 'Your home base',
  clients: 'The people you work with',
  operations: 'Running a practice',
  tools: 'Tools',
  collaboration: 'Working with others',
};

export function learnAndTryGroups(): LearnAndTryGroup[] {
  return CATEGORY_ORDER.flatMap((category) => {
    const items = MODULE_DEFINITIONS
      .filter((m) => m.category === category && !m.comingSoon && (m.mode === 'practice' || m.mode === 'both') && LEARN_AND_TRY_SLUGS.includes(m.slug))
      .map((m) => ({ label: m.label, description: m.description }));
    return items.length ? [{ title: CATEGORY_TITLE[category], items }] : [];
  });
}
