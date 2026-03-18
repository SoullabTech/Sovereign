'use client';

/**
 * NostrMessagingSection
 *
 * Settings section for sovereign messaging.
 * Three-tab layout once registered: Identity | Messages | Channels
 *
 * Tabs:
 *   Identity  — Key management, export, reset
 *   Messages  — NIP-17 encrypted direct messages
 *   Channels  — NIP-29 community channels (cohort, practitioners, retreat, alumni)
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { NostrIdentitySetup } from './NostrIdentitySetup';
import { NostrIdentityCard } from './NostrIdentityCard';
import { NostrMessenger } from './NostrMessenger';
import { NostrChannels } from './NostrChannels';
import { NostrChannelThread } from './NostrChannelThread';
import { apiFetch } from '@/lib/http/apiBase';
import type { SoullabChannel } from '@/lib/nostr/channels';

// ─── Types ────────────────────────────────────────────────────────────────────

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

type Tab = 'identity' | 'messages' | 'channels';

// ─── Component ────────────────────────────────────────────────────────────────

export function NostrMessagingSection({ memberId }: Props) {
  const [identity, setIdentity] = useState<NostrIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('identity');
  const [activeChannel, setActiveChannel] = useState<SoullabChannel | null>(null);

  async function loadIdentity() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/nostr/identity');
      if (res.ok) {
        const data = await res.json();
        setIdentity(data);
      }
    } catch {
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

  // Active channel thread takes over the panel
  if (tab === 'channels' && activeChannel) {
    return (
      <NostrChannelThread
        memberId={memberId}
        myPubkey={identity.pubkey!}
        channel={activeChannel}
        onBack={() => setActiveChannel(null)}
      />
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'messages', label: 'Messages' },
    { id: 'channels', label: 'Channels' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-stone-800/50 rounded-lg">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setActiveChannel(null);
            }}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-stone-700 text-white'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            {t.label}
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

      {/* Channels tab */}
      {tab === 'channels' && (
        <NostrChannels
          memberId={memberId}
          myPubkey={identity.pubkey!}
          onOpenChannel={ch => setActiveChannel(ch)}
        />
      )}
    </div>
  );
}
