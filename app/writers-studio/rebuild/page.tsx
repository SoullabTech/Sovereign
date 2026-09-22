import '../flagship/flagship.css';
import './flagshipWriteHost.css';
import { Suspense } from 'react';
import FlagshipWriteHost from './FlagshipWriteHost';

/**
 * /writers-studio/rebuild — the flagship Write host (C1B).
 * The legacy `RebuildStudioClient` composition is retained in this directory,
 * unmounted, for the later bounded convergence acts (editorial layer, review).
 */
export default function WriterStudioRebuildPage() {
  return (
    <Suspense fallback={<div className="fs-tokens fsw-state">Opening your Writer’s Studio…</div>}>
      <FlagshipWriteHost />
    </Suspense>
  );
}
