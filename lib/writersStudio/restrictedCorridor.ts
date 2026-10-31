/**
 * Paths whose meaning is specifically Writer's Studio and therefore requires
 * the invitation-only Writer grant in addition to ordinary authentication.
 *
 * Shared Press manuscript operations remain outside this classifier. They keep
 * their own member/Work authority and cannot be accidentally reclassified as a
 * paid Writer feature merely because Writer also uses them.
 */
const WRITER_INTROSPECTION = new Set([
  '/api/sovereign/writers-studio/beta-access',
  '/api/sovereign/writers-studio/plan',
]);

const ADVANCED_MANUSCRIPT_ACTIONS = new Set([
  'ask',
  'attention-map',
  'chapter-reviews',
  'develop',
  'developmental-orientation',
  'lineage-chapter',
  'lineage-orientation',
  'lineage-scan',
  'locus',
  'readings',
  'review-discuss',
  'sections',
  'structure',
  'themes',
  'write-state',
]);

function isAdvancedManuscriptPath(pathname: string): boolean {
  const prefix = '/api/sovereign/manuscripts/';
  if (!pathname.startsWith(prefix)) return false;
  const parts = pathname.slice(prefix.length).split('/').filter(Boolean);
  if (parts.length === 1) return parts[0] === 'blank';
  return ADVANCED_MANUSCRIPT_ACTIONS.has(parts[1]);
}

export function isWriterStudioRestrictedPath(pathname: string): boolean {
  if (pathname === '/writers-studio' || pathname.startsWith('/writers-studio/')) {
    return true;
  }

  if (pathname === '/api/writers-studio/local-review' ||
      pathname.startsWith('/api/writers-studio/local-review/')) {
    return false;
  }
  if (pathname === '/api/writers-studio' || pathname.startsWith('/api/writers-studio/')) {
    return true;
  }

  if (WRITER_INTROSPECTION.has(pathname)) return false;
  if (pathname === '/api/sovereign/writers-studio' ||
      pathname.startsWith('/api/sovereign/writers-studio/')) {
    return true;
  }

  return isAdvancedManuscriptPath(pathname);
}
