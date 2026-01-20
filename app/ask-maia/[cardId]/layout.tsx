export async function generateStaticParams() {
  return [{ cardId: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
