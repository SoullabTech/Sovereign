import type { Metadata } from 'next';

// Gated member workspace (exposes Living Field context). Overrides the inherited
// public "/maia" card + title so a shared link reveals nothing. Page is a Client
// Component, so this server layout carries the metadata.
const title = 'A Private Soullab Space';
const description = 'This protected workspace is available only to its member.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function VisionStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
