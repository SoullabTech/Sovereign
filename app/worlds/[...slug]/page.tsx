'use client';

/**
 * Worlds catch-all — redirects invalid world paths back to /maia.
 *
 * Valid world routes (journey, patterns) have their own page.tsx files
 * that Next.js matches before this catch-all fires. Any OTHER /worlds/*
 * path (e.g., /worlds/depth — removed 2026-04-09 by Kelly, or any future
 * stale link) lands here instead of showing the generic 404.
 *
 * This exists because:
 *   - /worlds/depth was planned, partially wired, then deliberately removed
 *   - The WorldDoorway UI comment at OracleConversation.tsx:8207 references
 *     "depth" even though no intent routes to it
 *   - Stale links may exist in browser history, cached UI state, or LLM-
 *     generated response text
 *
 * Redirects to /maia (the main conversation surface) rather than showing a
 * 404 that erodes user trust while the deeper system is working correctly.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorldsCatchAll() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maia');
  }, [router]);

  return null;
}
