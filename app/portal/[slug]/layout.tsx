export async function generateStaticParams() {
  return [{ slug: 'default' }];
}

import PortalClientLayout from './PortalClientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalClientLayout>{children}</PortalClientLayout>;
}
