export async function generateStaticParams() {
  return [{ element: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
