/** C1C1-D4 · a host that infers the editorial flag from a 404 probe. ⛔ Disposable. */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/http/apiBase';
export function FlagProbeHost() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    void apiFetch('/api/writers-studio/editorial/thread?threadId=probe').then((r) => setEnabled(r.status !== 404));
  }, []);
  return <div data-inferred-flag={String(enabled)} />;
}
