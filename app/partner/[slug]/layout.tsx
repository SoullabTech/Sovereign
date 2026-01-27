// Required for Capacitor static export with dynamic routes
export async function generateStaticParams() {
  return [
    { slug: 'prelude' },
    { slug: 'soullab' }
  ];
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
