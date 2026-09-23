/** R1-1A-D6 · a presentation seam that fetches its own reading. ⛔ Disposable. */
import * as React from 'react';
import { useEffect, useState } from 'react';
export function FetchingSeam({ readingId }: { readingId: string }) {
  const [json, setJson] = useState<unknown>(null);
  useEffect(() => { void fetch(`/api/sovereign/manuscripts/x/readings/${readingId}`).then((r) => r.json()).then(setJson); }, [readingId]);
  return <div data-fetched={json ? 'true' : 'false'} />;
}
