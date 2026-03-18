'use client';

/**
 * NostrMessenger
 *
 * DM inbox — shows all threads sorted by most recent message.
 * Loaded inside the "Messages" tab of NostrMessagingSection.
 *
 * Key handling:
 *   1. Load from localStorage on mount
 *   2. Validate: derive pubkey from stored key, compare to registered pubkey
 *   3. If missing or mismatched → show nsec import / recovery UI
 *   4. Only then allow messaging
 *
 * Privacy: all decryption happens here (client-side).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Plus, User, ShieldCheck, Loader2, X, Key, AlertTriangle } from 'lucide-react';
import {
  loadPrivkey, storePrivkey,
  privkeyMatchesPubkey, importNsec,
} from '@/lib/nostr/crypto';
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

type KeyState = 'valid' | 'missing' | 'mismatch';

// ─── Component ───────────────────────────────────────────────────────────────

export function NostrMessenger({ memberId, myPubkey, myNpub }: Props) {
  // ─── Key validation ────────────────────────────────────────────────────────

  function resolveKeyState(): { privkey: string | null; state: KeyState } {
    const raw = loadPrivkey(memberId);
    if (!raw) return { privkey: null, state: 'missing' };
    if (!privkeyMatchesPubkey(raw, myPubkey)) return { privkey: null, state: 'mismatch' };
    return { privkey: raw, state: 'valid' };
  }

  const [{ privkey, state: keyState }, setKeyResult] = useState(() => resolveKeyState());

  // ─── Thread state ──────────────────────────────────────────────────────────

  const [threads, setThreads] = useState<Map<string, DecryptedDM[]>>(new Map());
  const [contacts, setContacts] = useState<Map<string, ContactInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  // New DM form
  const [showNewDM, setShowNewDM] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newRecipientError, setNewRecipientError] = useState('');

  // nsec import form
  const [nsecInput, setNsecInput] = useState('');
  const [nsecError, setNsecError] = useState('');
  const [importingKey, setImportingKey] = useState(false);

  const loadedContacts = useRef(new Set<string>());

  // ─── nsec import ──────────────────────────────────────────────────────────

  function handleImportNsec() {
    setNsecError('');
    setImportingKey(true);
    try {
      const kp = importNsec(nsecInput.trim());
      if (!kp) {
        setNsecError('Invalid nsec — check the format (must start with nsec1)');
        return;
      }
      if (kp.pubkeyHex !== myPubkey) {
        setNsecError(
          'This key belongs to a different identity. It does not match the pubkey registered with your account.'
        );
        return;
      }
      storePrivkey(memberId, kp.privkeyHex);
      setNsecInput('');
      setKeyResult({ privkey: kp.privkeyHex, state: 'valid' });
    } finally {
      setImportingKey(false);
    }
  }

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
      if (!list.find(m => m.id === dm.id)) {
        list.push(dm);
        list.sort((a, b) => a.createdAt - b.createdAt);
      }
      next.set(peer, list);
      return next;
    });
  }, [myPubkey]);

  // ─── Initialise on valid key ───────────────────────────────────────────────

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
      setNewRecipientError('Enter a valid 64-character hex pubkey');
      return;
    }
    setShowNewDM(false);
    setNewRecipient('');
    loadContacts([recipient]);
    setActiveThread(recipient);
  }

  const sortedThreads = Array.from(threads.entries()).sort((a, b) => {
    const lastA = a[1][a[1].length - 1]?.createdAt ?? 0;
    const lastB = b[1][b[1].length - 1]?.createdAt ?? 0;
    return lastB - lastA;
  });

  // ─── Key recovery UI ─────────────────────────────────────────────────────

  if (keyState !== 'valid') {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300">
            {keyState === 'missing'
              ? 'Private key not found on this device.'
              : 'Stored key does not match your registered identity.'
            }
            <span className="text-amber-400/70 block mt-0.5 text-xs">
              Import your nsec backup to restore messaging on this device.
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3 h-3" />
            Import private key (nsec)
          </label>
          <textarea
            value={nsecInput}
            onChange={e => setNsecInput(e.target.value)}
            placeholder="nsec1…"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-violet-500 font-mono resize-none"
          />
          {nsecError && <p className="text-xs text-red-400">{nsecError}</p>}
          <button
            onClick={handleImportNsec}
            disabled={!nsecInput.trim() || importingKey}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-sm text-white font-medium transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            Restore key
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Your private key was shown when you first set up messaging.
          If you exported it to a file, open that file and paste the nsec line above.
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
          {newRecipientError && <p className="text-xs text-red-400">{newRecipientError}</p>}
        </div>
      )}

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
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                  {contact?.isPractitioner
                    ? <ShieldCheck className="w-4 h-4 text-violet-400" />
                    : <User className="w-4 h-4 text-stone-400" />
                  }
                </div>
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

function relativeTime(unixTs: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixTs;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
