// frontend

export const dynamic = 'force-dynamic';

export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return children directly - no providers, no imports, nothing
  return children;
}