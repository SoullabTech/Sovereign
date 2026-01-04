// Required for Capacitor static export with dynamic routes
export async function generateStaticParams() {
  return [
    { slug: ['welcome'] },
    { slug: ['getting-started'] }
  ];
}

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
