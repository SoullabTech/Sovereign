/**
 * MAIA VOICE MODES - Interactive Conversation Demo
 * Phase 4.5A: Three-Voice Conversation System
 *
 * Demonstrates Talk, Care, and Note modes with live endpoint integration.
 */

import ConversationClient from './ConversationClient';

export const metadata = {
  title: 'MAIA Voice Modes | Conversation Demo',
  description: 'Experience MAIA\'s three distinct conversation modes: Talk (Dialogue), Care (Counsel), Note (Scribe)',
};

export default function ConversationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            MAIA Voice Modes
          </h1>
          <p className="text-violet-300 text-lg">
            Three distinct ways of being present in conversation
          </p>
        </header>

        <ConversationClient />

        <footer className="mt-8 text-center text-sm text-violet-400">
          <p>Phase 4.5A: Voice Mode Endpoints • Built with sovereignty-compliant routing</p>
        </footer>
      </div>
    </div>
  );
}
