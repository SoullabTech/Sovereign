// Required for Capacitor static export with dynamic routes
export async function generateStaticParams() {
  return [
    { id: 'welcome' },
    { id: 'default' }
  ];
}

export default function CommonsPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
