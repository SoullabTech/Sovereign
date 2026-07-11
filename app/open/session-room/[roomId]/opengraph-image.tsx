import { ImageResponse } from 'next/og';
import { ogCard, SECTIONS, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Public (middleware bypasses /open/). Named Session Room card — deliberately
// carries NO per-room data (no roomId, no participants, no topic), so a shared
// open-room link is recognizable without revealing anything about the session.
export const alt = 'Soullab Session Room — A Held Space for Guided Work';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Rendered on demand for the web; empty set keeps the iOS static export happy.
export function generateStaticParams() {
  return [];
}

export default function Image() {
  return new ImageResponse(ogCard(SECTIONS['session-room']), { ...OG_SIZE });
}
