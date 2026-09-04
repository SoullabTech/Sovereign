'use client';

/**
 * /labtools/reflections — the founder/lab reflections surface.
 *
 * UNCHANGED IN PURPOSE: instrumentation/diagnostic context, behind the
 * requireFounder() gate in app/labtools/layout.tsx. The member-facing home is
 * /reflections (founder ruling 2026-09-04, Journal precedent) — see
 * app/reflections/page.tsx. Both render the same component over the same
 * member-scoped data; this one is not the member navigation target.
 */

import ReflectionsFeed from '@/components/reflections/ReflectionsFeed';

export default function LabReflectionsPage() {
  return (
    <ReflectionsFeed
      basePath="/labtools/reflections"
      backHref="/labtools"
      backLabel="Back to LabTools"
    />
  );
}
