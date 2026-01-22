export async function generateStaticParams() {
  return [{ slug: 'default' }, { slug: 'loralee' }];
}

export const dynamicParams = true;

import PortalAdminClientLayout from './PortalAdminClientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalAdminClientLayout>{children}</PortalAdminClientLayout>;
}
