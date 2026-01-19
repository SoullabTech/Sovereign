export async function generateStaticParams() {
  return [{ slug: 'default' }];
}

import PractitionerAdminClientLayout from './PractitionerAdminClientLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PractitionerAdminClientLayout>{children}</PractitionerAdminClientLayout>;
}
