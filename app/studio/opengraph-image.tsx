import { ImageResponse } from 'next/og';
import { privateCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';

// Inherited by ALL of /studio/* (sessions, session-room, field, fields/[memberId],
// workspaces). These are gated member/practitioner surfaces — the preview must
// reveal nothing. One protected card covers the whole family.
export const alt = 'Protected Soullab space';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    privateCard({
      title: 'Private Studio Workspace',
      subtitle: 'This protected workspace is available only to authorized participants.',
    }),
    { ...OG_SIZE },
  );
}
