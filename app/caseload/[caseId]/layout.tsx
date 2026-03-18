// Generate static params for static export
export function generateStaticParams() {
  return [{ caseId: 'default' }];
}

export default function CaseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
