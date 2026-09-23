import './rebuild.css';
import { Suspense } from 'react';
import RebuildStudioClient from './RebuildStudioClient';

/**
 * /writers-studio/rebuild — the full manuscript-first Writer's Studio workspace.
 *
 * RESTORATION 2026-09-23
 *
 * The C1B FlagshipWriteHost was a bounded constitutional host used to prove the
 * new Write/Review runtime. Mounting it as the production Studio collapsed the
 * member-facing workspace to that bounded host and hid the fuller composition
 * already present in RebuildStudioClient.
 *
 * Production therefore mounts the complete workspace here again. The newer
 * governed backend remains in place: editorial routes, Review Discuss R2-2,
 * disclosure receipts, durable observation identity and feature flags are not
 * rolled back by this presentation restoration.
 */
export const dynamic = 'force-dynamic';

export default function WriterStudioRebuildPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Opening Writer’s Studio…</div>}>
      <RebuildStudioClient
        reviewDiscussEnabled={process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED === '1'}
      />
    </Suspense>
  );
}
