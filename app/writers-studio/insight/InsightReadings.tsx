'use client';
import { useEffect, useState } from 'react';
import InsightReading from './InsightReading';
import type { InsightPassage } from '@/lib/writersStudio/insightCanvas';

/** Keep visited observation drafts on this page when another observation opens. */
export default function InsightReadings({ manuscriptId, readingId, observationKey, onRevise, busy, refreshKey = 0 }: {
  manuscriptId: string; readingId: string; observationKey: string;
  onRevise?: (passage: InsightPassage, authorNotes?: string) => void; busy?: boolean; refreshKey?: number;
}) {
  const [visited, setVisited] = useState([{ readingId, observationKey }]);
  useEffect(() => {
    setVisited(previous => previous.some(x => x.readingId === readingId && x.observationKey === observationKey)
      ? previous : [...previous, { readingId, observationKey }]);
  }, [readingId, observationKey]);
  return <>{visited.map(item => <div key={item.readingId + ':' + item.observationKey}
    hidden={item.readingId !== readingId || item.observationKey !== observationKey}>
    <InsightReading manuscriptId={manuscriptId} readingId={item.readingId} observationKey={item.observationKey}
      onRevise={onRevise} busy={busy} refreshKey={refreshKey} />
  </div>)}</>;
}
