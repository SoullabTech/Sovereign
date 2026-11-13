import { normalizeReturnDestination } from '@/lib/auth/returnDestination';

/**
 * Where the FAQ step continues to. Sign-up hands a new member to `/faq?next=<return place>`, and `/onboarding` honours
 * `next` on completion; this keeps the FAQ from dropping it in between (2026-11-13: a member invited to the college
 * essay path finished sign-up on Home instead of the path).
 *
 * Only a safe same-origin place is carried, validated by the same rule sign-in uses. Anything else, or nothing, opens
 * onboarding exactly as before.
 */
export function onboardingAfterFaq(next: string | null | undefined): string {
  if (typeof next !== 'string' || next.trim() === '') return '/onboarding';
  const safe = normalizeReturnDestination(next, '/home');
  // normalizeReturnDestination falls back to /home for an unsafe place; carry /home only when it was asked for.
  if (safe === '/home' && next.trim() !== '/home') return '/onboarding';
  return `/onboarding?next=${encodeURIComponent(safe)}`;
}
