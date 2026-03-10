'use client';

/**
 * NostrMessenger
 *
 * DM inbox — shows all threads sorted by most recent message.
 * Loaded inside the "Messages" tab of NostrMessagingSection.
 *
 * Privacy: all decryption happens here (client-side).
 * The private key is read from localStorage once on mount.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Plus, User, ShieldCheck, Loader2, X } from 'lucide-react';
import { loadPrivkey } from '@/lib/nostr/crypto';
import { fetchAllDMs, subscribeToDMs, groupDMsByPeer, getDMPeer } from '@/lib/nostr/dm';
import type { DecryptedDM } from '@/lib/nostr/dm';
import { truncateNpub, isValidPubkeyHex } from '@/lib/nostr/utils';
import { apiFetch } from '@/lib/http/apiBase';
import { NostrDMThread } from './NostrDMThread';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactInfo {
  pubkey: string;
  name: string;
  npub: string;
  isPractitioner: boolean;
}

interface Props {
  memberId: string;
  myPubkey: string; // hex
  myNpub: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NostrMessenger({ memberId, myPubkey, myNpub }: Props) {
  // Private key read once on mount — never changes during session
  const [privkey] = useState<string | null>(() => loadPrivkey(memberId));

  const [threads, setThreads] = useState<Map<string, DecryptedDM[]>>(new Map());
  const [contacts, setContacts] = useState<Map<string, ContactInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  // New DM form state
  const [showNewDM, setShowNewDM] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newRecipientError, setNewRecipientError] = useState('');

  // Track which pubkeys we've already requested from the contacts API
  const loadedContacts = useRef(new Set<string>());

  // ─── Contact resolution ────────────────────────────────────────────────────

  const loadContacts = useCallback(async (peerPubkeys: string[]) => {
    const unknown = peerPubkeys.filter(pk => !loadedContacts.current.has(pk));
    if (unknown.length === 0) return;
    unknown.forEach(pk => loadedContacts.current.add(pk));

    try {
      const res = await apiFetch(`/api/nostr/contacts?pubkeys=${unknown.join(',')}`);
      if (res.ok) {
        const data: ContactInfo[] = await res.json();
        setContacts(prev => {
          const next = new Map(prev);
          for (const c of data) next.set(c.pubkey, c);
          return next;
        });
      }
    } catch {
      // Non-critical — fall back to truncated pubkey display
    }
  }, []);

  // ─── Merge incoming DM ────────────────────────────────────────────────────

  const addDM = useCallback((dm: DecryptedDM) => {
    const peer = getDMPeer(dm, myPubkey);
    if (!peer) return;

    setThreads(prev => {
      const next = new Map(prev);
      const list = [...(next.get(peer) ?? [])];
      // Deduplicate by gift-wrap event ID
      if (!list.find(m => m.id === dm.id)) {
        list.push(dm);
        list.sort((a, b) => a.createdAt - b.createdAt);
      }
      next.set(peer, list);
      return next;
    });
  }, [myPubkey]);

  // ─── Initialise: fetch history + subscribe ────────────────────────────────

  useEffect(() => {
    if (!privkey) {
      setLoading(false);
      return;
    }

    let unsub: (() => void) | null = null;

    async function init() {
      setLoading(true);
      try {
        const dms = await fetchAllDMs(privkey!, myPubkey);
        const grouped = groupDMsByPeer(dms, myPubkey);
        setThreads(grouped);
        await loadContacts(Array.from(grouped.keys()));
      } finally {
        setLoading(false);
      }

      unsub = subscribeToDMs(privkey!, myPubkey, (dm) => {
        addDM(dm);
        const peer = getDMPeer(dm, myPubkey);
        if (peer) loadContacts([peer]);
      });
    }

    init();
    return () => { unsub?.(); };
  }, [myPubkey, privkey, addDM, loadContacts]);

  // ─── New DM ───────────────────────────────────────────────────────────────

  function openNewThread() {
    setNewRecipientError('');
    const recipient = newRecipient.trim().toLowerCase();
    if (!isValidPubkeyHex(recipient)) {
      setNewRecipientError('Enter a valid 64-character hex pubkey (starts with npub? Use the hex form instead)');
      return;
    }
    setShowNewDM(false);
    setNewRecipient('');
    loadContacts([recipient]);
    setActiveThread(recipient);
  }

  // ─── Sorted thread list ───────────────────────────────────────────────────

  const sortedThreads = Array.from(threads.entries()).sort((a, b) => {
    const lastA = a[1][a[1].length - 1]?.createdAt ?? 0;
    const lastB = b[1][b[1].length - 1]?.createdAt ?? 0;
    return lastB - lastA; // Most recent first
  });

  // ─── Guard: no private key ────────────────────────────────────────────────

  if (!privkey) {
    return (
      <div className="py-8 text-center">
        <MessageSquare className="w-8 h-8 mx-auto mb-3 text-stone-600" />
        <p className="text-sm text-stone-400">Private key not found on this device.</p>
        <p className="mt-1 text-xs text-stone-500">
          Open messages on the device where you set up sovereign messaging,
          or import your key via the Identity tab.
        </p>
      </div>
    );
  }

  // ─── Thread detail view ───────────────────────────────────────────────────

  if (activeThread) {
    const contact = contacts.get(activeThread);
    return (
      <NostrDMThread
        memberId={memberId}
        myPubkey={myPubkey}
        peerPubkey={activeThread}
        peerName={contact?.name}
        peerNpub={contact?.npub}
        isPeerPractitioner={contact?.isPractitioner}
        messages={threads.get(activeThread) ?? []}
        onNewMessage={addDM}
        onBack={() => setActiveThread(null)}
      />
    );
  }

  // ─── Inbox view ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-500 uppercase tracking-wider">Inbox</span>
        <button
          onClick={() => setShowNewDM(v => !v)}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          {showNewDM ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showNewDM ? 'Cancel' : 'New message'}
        </button>
      </div>

      {/* New DM form */}
      {showNewDM && (
        <div className="p-3 rounded-lg bg-stone-800/60 border border-stone-700/40 space-y-2">
          <p className="text-xs text-stone-400">
            Recipient hex pubkey — ask them to share it from their Identity tab.
          </p>
          <div className="flex gap-2">
            <input
              value={newRecipient}
              onChange={e => setNewRecipient(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && openNewThread()}
              placeholder="64-character hex pubkey"
              className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={openNewThread}
              className="px-3 py-2 rounded-lg bg-violet-700 hover:bg-violet-600 text-sm text-white font-medium transition-colors"
            >
              Open
            </button>
          </div>
          {newRecipientError && (
            <p className="text-xs text-red-400">{newRecipientError}</p>
          )}
        </div>
      )}

      {/* Thread list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
        </div>
      ) : sortedThreads.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-stone-600" />
          <p className="text-sm text-stone-500">No messages yet</p>
          <p className="text-xs text-stone-600 mt-1">
            Start a conversation using the &ldquo;New message&rdquo; button above.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {sortedThreads.map(([peerPubkey, messages]) => {
            const last = messages[messages.length - 1];
            const contact = contacts.get(peerPubkey);
            const displayName =
              contact?.name ??
              (contact?.npub ? truncateNpub(contact.npub) : `${peerPubkey.slice(0, 12)}…`);
            const isMine = last?.senderPubkey === myPubkey;

            return (
              <button
                key={peerPubkey}
                onClick={() => setActiveThread(peerPubkey)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-800/60 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                  {contact?.isPractitioner
                    ? <ShieldCheck className="w-4 h-4 text-violet-400" />
                    : <User className="w-4 h-4 text-stone-400" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{displayName}</span>
                    {contact?.isPractitioner && (
                      <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Practitioner
                      </span>
                    )}
                  </div>
                  {last && (
                    <p className="text-xs text-stone-500 truncate">
                      {isMine ? 'You: ' : ''}{last.content}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                {last && (
                  <span className="text-xs text-stone-600 flex-shrink-0">
                    {relativeTime(last.createdAt)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(unixTs: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixTs;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
