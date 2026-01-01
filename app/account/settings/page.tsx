import { AccountSettings } from '@/components/account/AccountSettings';

export const metadata = {
  title: 'Account Settings | MAIA',
  description: 'Configure your default preferences for MAIA sessions',
};

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a14] to-[#1a1a2e]">
      <AccountSettings />
    </main>
  );
}
