// Required for Capacitor static export with dynamic routes
export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function PreludeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
