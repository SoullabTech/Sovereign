export async function generateStaticParams() {
  return [{ caseId: 'default' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
