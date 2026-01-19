export async function generateStaticParams() {
  return [{ slug: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
