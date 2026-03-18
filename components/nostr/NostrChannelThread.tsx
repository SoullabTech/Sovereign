'use client';

/**
 * NostrChannelThread
 *
 * Channel conversation view.
 * Plaintext messages (no E2E encryption — channels are community spaces).
 * Shows sender names resolved via the contacts API.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, AlertTriangle, Hash, ShieldCheck, User } from 'lucide-react';
import { loadPrivkey, privkeyMatchesPubkey } from '@/lib/nostr/crypto';
import { postChannelMessage, fetchChannelHistory, subscribeToChannel } from '@/lib/nostr/channels';
import type { ChannelMessage, SoullabChannel } from '@/lib/nostr/channels';
import { truncateNpub } from '@/lib/nostr/utils';
import { apiFetch } from '@/lib/http/apiBase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactInfo {
  pubkey: string;
  name: string;
  npub: string;
  isPractitioner: boolean;
}

interface Props {
  memberId: string;
  myPubkey: string;
  channel: SoullabChannel;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NostrChannelThread({ memberId, myPubkey, channel, onBack }: Props) {
  const [privkey] = useState<string | null>(() => {
    const raw = loadPrivkey(memberId);
    return raw && privkeyMatchesPubkey(raw, myPubkey) ? raw : null;
  });

  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [contacts, setContacts] = useState<Map<string, ContactInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const loadedContacts = useRef(new Set<string>());

  // ─── Contact resolution ───────────────────────────────────────────────────

  const loadContacts = useCallback(async (pubkeys: string[]) => {
    const unknown = pubkeys.filter(pk => !loadedContacts.current.has(pk));
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
    } catch { /* non-critical */ }
  }, []);

  // ─── Add message (dedup) ──────────────────────────────────────────────────

  const addMessage = useCallback((msg: ChannelMessage) => {
    setMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev;
      return [...prev, msg].sort((a, b) => a.createdAt - b.createdAt);
    });
    loadContacts([msg.senderPubkey]);
  }, [loadContacts]);

  // ─── Load history + subscribe ──────────────────────────────────────────────

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function init() {
      setLoading(true);
      try {
        const history = await fetchChannelHistory(channel.id, { limit: 100 });
        setMessages(history);
        const pubkeys = [...new Set(history.map(m => m.senderPubkey))];
        await loadContacts(pubkeys);
      } finally {
        setLoading(false);
      }

      unsub = subscribeToChannel(channel.id, (msg) => {
        if (msg.channelId === channel.id) addMessage(msg);
      });
    }

    init();
    return () => { unsub?.(); };
  }, [channel.id, addMessage, loadContacts]);

  // ─── Scroll to bottom ─────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send ─────────────────────────────────────────────────────────────────

  async function handleSend() {
    if (!privkey || !input.trim() || sending) return;
    const text = input.trim();
    setSendError('');
    setInput('');
    setSending(true);

    try {
      await postChannelMessage(privkey, channel.id, text);
      // Optimistic update
      addMessage({
        id: `pending_${Date.now()}`,
        channelId: channel.id,
        senderPubkey: myPubkey,
        content: text,
        createdAt: Math.floor(Date.now() / 1000),
      });
    } catch {
      setSendError('Failed to send. Check your connection to the relay.');
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-stone-700/40 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Hash className="w-5 h-5 text-violet-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white">{channel.name}</span>
          {channel.about && (
            <p className="text-xs text-stone-500 truncate">{channel.about}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex items-center justify-center flex-1 py-8">
          <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto space-y-1 pb-2"
          style={{ maxHeight: '320px', minHeight: '100px' }}
        >
          {messages.length === 0 ? (
            <p className="text-xs text-stone-600 text-center py-6">
              No messages yet — be the first to say something.
            </p>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderPubkey === myPubkey;
              const contact = contacts.get(msg.senderPubkey);
              const senderName =
                contact?.name ??
                (contact?.npub ? truncateNpub(contact.npub) : `${msg.senderPubkey.slice(0, 8)}…`);
              const showSender = i === 0 || messages[i - 1].senderPubkey !== msg.senderPubkey;

              return (
                <div key={msg.id} className={`${showSender ? 'mt-3' : 'mt-0.5'}`}>
                  {showSender && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <div className="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                        {contact?.isPractitioner
                          ? <ShieldCheck className="w-3 h-3 text-violet-400" />
                          : <User className="w-3 h-3 text-stone-400" />
                        }
                      </div>
                      <span className={`text-xs font-medium ${isMe ? 'text-violet-300' : 'text-stone-300'}`}>
                        {isMe ? 'You' : senderName}
                      </span>
                      {contact?.isPractitioner && !isMe && (
                        <span className="text-xs text-violet-500">· Practitioner</span>
                      )}
                      <span className="text-xs text-stone-600 ml-auto">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-stone-200 px-7 leading-relaxed break-words">
                    {msg.content}
                  </p>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Error */}
      {sendError && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 bg-red-900/20 rounded-lg mb-2 flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {sendError}
        </div>
      )}

      {/* Compose */}
      {!privkey ? (
        <p className="text-xs text-stone-500 text-center py-3 flex-shrink-0">
          Restore your private key to post messages.
        </p>
      ) : (
        <div className="flex gap-2 pt-3 border-t border-stone-700/40 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message #${channel.id}…`}
            disabled={sending}
            className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-violet-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

function formatTime(unixTs: number): string {
  const d = new Date(unixTs * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
