'use client';

/**
 * /reflections — the member's reflections. The only address they have.
 *
 * FOUNDER RULING 2026-09-04: Reflections was TAKEN OUT of Lab Tools and put in
 * the House. Not mirrored — moved. app/labtools/reflections/ is deleted.
 *
 * Why: reflections are member-owned content (/api/capsules is
 * requireMemberId()-scoped, every capsule is the member's own Keep), while
 * /labtools is instrumentation — hard-gated by requireFounder() and ruled out
 * of the House (houseDispositions → labtools: intentionally_withheld). Member
 * content living inside a founder namespace is what made members meet a 403 on
 * their own reflections.
 *
 * ⛔ Do NOT reintroduce a /labtools/reflections address. One place.
 */

import ReflectionsFeed from '@/components/reflections/ReflectionsFeed';

export default function ReflectionsPage() {
  return <ReflectionsFeed />;
}
