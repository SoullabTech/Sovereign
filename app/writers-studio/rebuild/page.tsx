import './rebuild.css';
import { Suspense } from 'react';
import RebuildStudioClient from './RebuildStudioClient';

export default function WriterStudioRebuildPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Opening Writer’s Studio…</div>}>
      <RebuildStudioClient />
    </Suspense>
  );
}
