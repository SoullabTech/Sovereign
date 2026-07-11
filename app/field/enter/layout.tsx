import type { Metadata } from 'next';
import { SECTIONS } from '@/lib/og/ogCard';

// Public field entrance — named card + title (overrides the /field "MAIA Field"
// title with the public Field section copy).
const title = SECTIONS.field.title;
const description = SECTIONS.field.subtitle;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function FieldEnterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
