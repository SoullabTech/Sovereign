'use client';

/**
 * /reflections — the member's reflections.
 *
 * The member-facing home for kept reflections, and the House destination
 * (lib/navigation/houseDestinations → id 'reflections').
 *
 * FOUNDER RULING 2026-09-04 (Journal precedent): reflections are member-owned
 * content — /api/capsules is requireMemberId()-scoped — so their ordinary home
 * must not sit inside the founder/instrumentation namespace. /labtools is ruled
 * out of the House (houseDispositions → labtools: intentionally_withheld) and
 * app/labtools/layout.tsx hard-gates on requireFounder(), so every member sent
 * to /labtools/reflections met a 403 screen. Journal was resolved the same way:
 * the House points at /journal, not /labtools/journal.
 *
 * ⛔ Do NOT repoint the House at /labtools/reflections. That surface stays
 * founder/lab-facing; this one is the member navigation target. Same underlying
 * data, two addresses, one component.
 */

import ReflectionsFeed from '@/components/reflections/ReflectionsFeed';

export default function ReflectionsPage() {
  return <ReflectionsFeed basePath="/reflections" backHref="/maia" backLabel="Back to MAIA" />;
}
