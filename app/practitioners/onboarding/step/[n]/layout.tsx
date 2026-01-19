export async function generateStaticParams() {
  return [{ n: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
