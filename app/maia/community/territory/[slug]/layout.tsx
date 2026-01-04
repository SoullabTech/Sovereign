// Required for Capacitor static export with dynamic routes
export async function generateStaticParams() {
  return [
    { slug: 'fire' },
    { slug: 'water' },
    { slug: 'earth' },
    { slug: 'air' }
  ];
}

export default function TerritoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
