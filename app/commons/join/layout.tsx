import type { Metadata } from 'next';

// Public invitation page — named card + title (overrides parent /commons
// protected framing). No per-invite data.
const title = "Soullab Circle — You're Invited";
const description = 'Join a shared field for practice and collaboration.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function CommonsJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
