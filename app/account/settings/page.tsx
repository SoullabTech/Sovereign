import { AccountSettings } from '@/components/account/AccountSettings';

export const metadata = {
  title: 'Account Settings | MAIA',
  description: 'Configure your default preferences for MAIA sessions',
};

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f1419] via-[#1a1f2e] to-[#16213e] overflow-y-auto">
      <AccountSettings />
    </main>
  );
}
