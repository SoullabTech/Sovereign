'use client';

/**
 * Lab Tools → Journal — compatibility entry point.
 *
 * The implementation moved to components/journal/UnifiedJournalView so the
 * member Journal could live at /journal, outside this directory's founder gate
 * (app/labtools/layout.tsx). This route stays so that existing Lab Tools links
 * (coherence, values-compass, tool registry, patterns) keep working for the
 * founder/practitioner audience that can already reach /labtools.
 *
 * Same view, same APIs, same data — only "back" differs. This is an alternate
 * entry point, NOT a second journal product. Member-facing callers should link
 * to /journal instead.
 */

import { UnifiedJournalView } from '@/components/journal/UnifiedJournalView';

export default function LabToolsJournalPage() {
  return <UnifiedJournalView backHref="/labtools" backLabel="My Lab" />;
}
