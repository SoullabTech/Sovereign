'use client';

/**
 * NostrMessagingSection
 *
 * Settings section for sovereign messaging.
 * Shown inside AccountSettings under "Sovereign Messaging".
 * Loads current identity from server, then renders setup or identity card.
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { NostrIdentitySetup } from './NostrIdentitySetup';
import { NostrIdentityCard } from './NostrIdentityCard';
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

export function NostrMessagingSection({ memberId }: Props) {
  const [identity, setIdentity] = useState<NostrIdentity | null>(null);
  const [loading, setLoading] = useState(true);

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
    <NostrIdentityCard
      memberId={memberId}
      pubkey={identity.pubkey!}
      npub={identity.npub!}
      relayUrl={identity.relayUrl}
      registeredAt={identity.registeredAt}
      onReset={loadIdentity}
    />
  );
}
