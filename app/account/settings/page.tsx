import { AccountSettings } from '@/components/account/AccountSettings';

export const metadata = {
  title: 'Account Settings | MAIA',
  description: 'Configure your default preferences for MAIA sessions',
};

export default function AccountSettingsPage() {
  // No overflow-y-auto on <main>. It created a scrolling BOX that never
  // actually scrolls — the document/body does the scrolling (measured on the
  // device: body scrollTop 387, main scrollTop 0). position:sticky binds to the
  // nearest ancestor with a scrolling box, so the Settings header was pinned to
  // a container that never moves; it scrolled away with the list and rows
  // reached the iPhone status bar. Without it the header sticks to the
  // document, which is what actually scrolls.
  return (
    <main className="min-h-screen font-sans bg-gradient-to-b from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <AccountSettings />
    </main>
  );
}
