import './rebuild.css';
import '../flagship/flagship.css';
import './flagshipWriteHost.css';
import { Suspense } from 'react';
import FlagshipWriteHost from './FlagshipWriteHost';

export const dynamic = 'force-dynamic';

/** Roadmap candidate mount: the recovered exact flagship presentation with bounded live ports. */
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
