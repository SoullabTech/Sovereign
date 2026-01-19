export async function generateStaticParams() {
  return [{ analysisId: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
