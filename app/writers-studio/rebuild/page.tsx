import './rebuild.css';
import { Suspense } from 'react';
import FlagshipWriteHost from './FlagshipWriteHost';

export const dynamic = 'force-dynamic';

/** D4R1 witness mount only. Restored immediately after the isolated live walk. */
export default function WriterStudioRebuildPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Opening Writer’s Studio…</div>}>
      <FlagshipWriteHost
        editorialEnabled={process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'}
        reviewDiscussEnabled={process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED === '1'}
      />
    </Suspense>
  );
}
