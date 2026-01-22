export async function generateStaticParams() {
  return [{ slug: 'default' }, { slug: 'loralee' }];
}

export const dynamicParams = true;

import PortalClientLayout from './PortalClientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalClientLayout>{children}</PortalClientLayout>;
}
