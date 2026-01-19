export async function generateStaticParams() {
  return [{ slug: 'default', id: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
