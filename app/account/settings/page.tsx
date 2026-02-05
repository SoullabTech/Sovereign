import { AccountSettings } from '@/components/account/AccountSettings';

export const metadata = {
  title: 'Account Settings | MAIA',
  description: 'Configure your default preferences for MAIA sessions',
};

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] overflow-y-auto">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 to-transparent pointer-events-none" />
      <AccountSettings />
    </main>
  );
}
