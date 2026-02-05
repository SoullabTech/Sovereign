import { AccountSettings } from '@/components/account/AccountSettings';

export const metadata = {
  title: 'Account Settings | MAIA',
  description: 'Configure your default preferences for MAIA sessions',
};

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] overflow-y-auto">
      <AccountSettings />
    </main>
  );
}
