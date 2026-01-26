import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account | MAIA',
  description: 'Manage your profile, preferences, and data sovereignty',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
