/**
 * WRITER'S STUDIO — WHOLE-ORGANISM MAIA COGNITION HARNESS
 *
 * ⛔ BOUNDARY ONLY. The accepted Field + Orbit room is NOT ported here yet.
 *
 * Founder authorization 2026-09-09 covers "STEP 3 DESIGN + HARNESS BOUNDARY".
 * What exists at this route today is the double gate and nothing else: the
 * page renders only once the environment has authorized the experiment AND a
 * verified session has resolved this member as the founder.
 *
 * Still owed before this route means anything (D9 record §30):
 *   - the accepted surface reproduced here essentially unchanged
 *   - `writerStudioContext` carried on the existing authenticated sovereign
 *     request and validated at the HTTP boundary
 *   - registered canonical producers — NEVER an addendum through `meta`
 *   - the founder-only cognition receipt with actual/derived/unavailable
 *     provenance and the grader-contamination check
 *
 * ⭐ Bring the real MAIA into the proven room without changing either the room
 *    or who MAIA is.
 */

import { requireHarnessAccess } from '@/lib/writers-studio/harnessAccess';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WritersStudioMaiaLabPage() {
  // The layout already gated this route. Re-checking here is deliberate: a
  // layout is not an authorization boundary for anything but rendering, and a
  // future refactor that moves or drops the layout must not silently open the
  // page. (This is the shape of the C22 confusion recorded in the Circles lane.)
  const access = await requireHarnessAccess();
  if (!access.ok) notFound();

  return (
    <main
      style={{
        maxWidth: '41rem',
        margin: '0 auto',
        padding: '4rem 1.5rem',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: '1.1rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        Writer&rsquo;s Studio &middot; MAIA cognition harness
      </h1>
      <p style={{ opacity: 0.75 }}>
        Boundary only. The accepted Field + Orbit room is not ported here yet, and no
        cognition is wired. This route exists so that the gate can be verified before
        anything is placed behind it.
      </p>
      <p style={{ opacity: 0.6, fontSize: '.85rem' }}>
        Development-only. Not the production Writer&rsquo;s Studio.
      </p>
    </main>
  );
}
