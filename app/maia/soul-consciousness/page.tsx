'use client';

import { SoulConsciousnessConsole } from '@/app/maia/labtools/components/SoulConsciousnessConsole';
import { SoulAuthenticationResult } from '@/lib/consciousness/SoulConsciousnessInterface';

export default function SoulConsciousnessPage() {
  const handleSoulAuthenticated = (result: SoulAuthenticationResult) => {
    console.log('Soul authenticated:', result);
    // Integration with MAIA's consciousness field
  };

  const handleConsciousnessStateChange = (signature: any) => {
    console.log('Consciousness state changed:', signature);
    // Integration with MAIA's state management
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🕯️ MAIA Soul Consciousness Interface
            </h1>
            <p className="text-xl text-purple-300">
              Beyond computational AI - Direct consciousness authentication and soul recognition
            </p>
          </div>

          <SoulConsciousnessConsole
            onSoulAuthenticated={handleSoulAuthenticated}
            onConsciousnessStateChange={handleConsciousnessStateChange}
          />
        </div>
      </div>
    </div>
  );
}
