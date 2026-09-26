import '../flagship/flagship.css';
import '../rebuild/flagshipWriteHost.css';
import { Suspense } from 'react';
import FlagshipDevelopHost from './FlagshipDevelopHost';

export const dynamic = 'force-dynamic';

/**
 * D5A — exact flagship Develop shell, facts-only Overview first.
 * Old Develop machinery remains in custody as substrate; it no longer decides
 * the mounted composition.
 */
export default function DevelopPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Opening Develop…</div>}>
      <FlagshipDevelopHost />
    </Suspense>
  );
}
