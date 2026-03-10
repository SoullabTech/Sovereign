'use client';

/**
 * NostrMessagingSection
 *
 * Settings section for sovereign messaging.
 * Shown inside AccountSettings under "Sovereign Messaging".
 *
 * • Not registered → NostrIdentitySetup (first-time wizard)
 * • Registered     → tabbed view: Identity card | DM inbox
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { NostrIdentitySetup } from './NostrIdentitySetup';
import { NostrIdentityCard } from './NostrIdentityCard';
import { NostrMessenger } from './NostrMessenger';
import { apiFetch } from '@/lib/http/apiBase';

interface NostrIdentity {
  registered: boolean;
  pubkey?: string;
  npub?: string;
  relayUrl: string;
  registeredAt?: string;
}

interface Props {
  memberId: string;
}

type Tab = 'identity' | 'messages';

export function NostrMessagingSection({ memberId }: Props) {
  const [identity, setIdentity] = useState<NostrIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('identity');

  async function loadIdentity() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/nostr/identity');
      if (res.ok) {
        const data = await res.json();
        setIdentity(data);
      }
    } catch {
      // Non-critical — show setup if load fails
      setIdentity({ registered: false, relayUrl: 'wss://nostr.soullab.life' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadIdentity(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
      </div>
    );
  }

  if (!identity || !identity.registered) {
    return (
      <NostrIdentitySetup
        memberId={memberId}
        onComplete={(pubkey, npub) => {
          setIdentity({ registered: true, pubkey, npub, relayUrl: 'wss://nostr.soullab.life' });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-stone-800/50 rounded-lg">
        {(['identity', 'messages'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-stone-700 text-white'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            {t === 'identity' ? 'Identity' : 'Messages'}
          </button>
        ))}
      </div>

      {/* Identity tab */}
      {tab === 'identity' && (
        <NostrIdentityCard
          memberId={memberId}
          pubkey={identity.pubkey!}
          npub={identity.npub!}
          relayUrl={identity.relayUrl}
          registeredAt={identity.registeredAt}
          onReset={loadIdentity}
        />
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <NostrMessenger
          memberId={memberId}
          myPubkey={identity.pubkey!}
          myNpub={identity.npub!}
        />
      )}
    </div>
  );
}
