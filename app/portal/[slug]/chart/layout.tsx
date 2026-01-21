export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
