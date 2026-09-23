import '../flagship/flagship.css';
import './flagshipWriteHost.css';
import { Suspense } from 'react';
import FlagshipWriteHost from './FlagshipWriteHost';

/**
 * /writers-studio/rebuild — the flagship Write host (C1B) with the Discuss-only
 * contextual MAIA (C1C1).
 *
 * ⭐ ONE FLAG, ONE AUTHORITY (the canvas route's precedent). The editorial
 * flag is read HERE, once, on the server, and handed down as a boolean. It is
 * presentation state — which surface is drawn — never authorization: every
 * editorial route re-reads the real server flag and refuses independently.
 * ⛔ No `NEXT_PUBLIC_` mirror · ⛔ no client inference from a 404 · ⛔ no
 * feature-status API. `force-dynamic` so a build-time read cannot freeze one
 * deployment's answer into every later one.
 *
 * The legacy `RebuildStudioClient` composition is retained in this directory,
 * unmounted, for the later bounded convergence acts.
 */
export const dynamic = 'force-dynamic';

export default function WriterStudioRebuildPage() {
  return (
    <Suspense fallback={<div className="fs-tokens fsw-state">Opening your Writer’s Studio…</div>}>
      <FlagshipWriteHost
        editorialEnabled={process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'}
        reviewDiscussEnabled={process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED === '1'}
      />
    </Suspense>
  );
}
