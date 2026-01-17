import { AccountSettings } from '@/components/account/AccountSettings';

export const metadata = {
  title: 'Account Settings | MAIA',
  description: 'Configure your default preferences for MAIA sessions',
};

export default function AccountSettingsPage() {
  return (
    <main className="min-h-screen bg-maia-navy-900 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-maia-navy-700/10 via-transparent to-maia-navy-700/10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-maia-navy-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-maia-spice-500/5 rounded-full blur-3xl pointer-events-none" />
      <AccountSettings />
    </main>
  );
}
