'use client';

/**
 * NostrDMThread
 *
 * Individual encrypted conversation view.
 * Renders messages, a compose bar, and a back button.
 *
 * Encryption: sendDM() wraps message in NIP-17 gift wrap before publishing.
 * The private key is read from localStorage (never transmitted).
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, ShieldCheck, Loader2, AlertTriangle, Lock } from 'lucide-react';
import { loadPrivkey } from '@/lib/nostr/crypto';
import { sendDM, subscribeToDMs } from '@/lib/nostr/dm';
import type { DecryptedDM } from '@/lib/nostr/dm';
import { truncateNpub } from '@/lib/nostr/utils';

interface Props {
  memberId: string;
  myPubkey: string;        // hex
  peerPubkey: string;      // hex
  peerName?: string;
  peerNpub?: string;
  isPeerPractitioner?: boolean;
  messages: DecryptedDM[];
  onNewMessage: (dm: DecryptedDM) => void;
  onBack: () => void;
}

export function NostrDMThread({
  memberId,
  myPubkey,
  peerPubkey,
  peerName,
  peerNpub,
  isPeerPractitioner,
  messages,
  onNewMessage,
  onBack,
}: Props) {
  const [privkey] = useState<string | null>(() => loadPrivkey(memberId));
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe for real-time incoming messages in this thread
  useEffect(() => {
    if (!privkey) return;
    const unsub = subscribeToDMs(privkey, myPubkey, (dm) => {
      // Only surface messages in this thread
      const peer = dm.senderPubkey === myPubkey ? dm.recipientPubkey : dm.senderPubkey;
      if (peer === peerPubkey) onNewMessage(dm);
    });
    return unsub;
  }, [privkey, myPubkey, peerPubkey, onNewMessage]);

  async function handleSend() {
    if (!privkey || !input.trim() || sending) return;
    const text = input.trim();
    setSendError('');
    setInput('');
    setSending(true);

    try {
      await sendDM(privkey, myPubkey, peerPubkey, text);
      // Optimistic update: show sent message immediately
      // The self-copy gift wrap will arrive via subscription and be deduped
      onNewMessage({
        id: `pending_${Date.now()}`,
        senderPubkey: myPubkey,
        recipientPubkey: peerPubkey,
        content: text,
        createdAt: Math.floor(Date.now() / 1000),
        wrapCreatedAt: Math.floor(Date.now() / 1000),
      });
    } catch {
      setSendError('Failed to send. Check your connection to nostr.soullab.life.');
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  const displayName =
    peerName ??
    (peerNpub ? truncateNpub(peerNpub) : `${peerPubkey.slice(0, 12)}…`);

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* Thread header */}
      <div className="flex items-center gap-3 pb-3 mb-3 border-b border-stone-700/40 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
          {isPeerPractitioner
            ? <ShieldCheck className="w-4 h-4 text-violet-400" />
            : <User className="w-4 h-4 text-stone-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{displayName}</span>
            {isPeerPractitioner && (
              <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Practitioner
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Lock className="w-2.5 h-2.5 text-stone-600" />
            <span className="text-xs text-stone-600">End-to-end encrypted</span>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-2" style={{ maxHeight: '300px', minHeight: '100px' }}>
        {messages.length === 0 ? (
          <p className="text-xs text-stone-600 text-center py-6">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderPubkey === myPubkey;
            const showDate = i === 0 || shouldShowDate(messages[i - 1].createdAt, msg.createdAt);

            return (
              <div key={msg.id}>
                {showDate && (
                  <p className="text-center text-xs text-stone-600 py-1">
                    {formatDate(msg.createdAt)}
                  </p>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-violet-700 text-white rounded-tr-sm'
                        : 'bg-stone-800 text-stone-100 rounded-tl-sm'
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-violet-300' : 'text-stone-500'} text-right`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {sendError && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 bg-red-900/20 rounded-lg flex-shrink-0 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {sendError}
        </div>
      )}

      {/* Compose area */}
      {!privkey ? (
        <p className="text-xs text-stone-500 text-center py-3 flex-shrink-0">
          Private key not available on this device.
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
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-violet-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(unixTs: number): string {
  const d = new Date(unixTs * 1000);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

/** Show a date divider when messages are more than 1 hour apart */
function shouldShowDate(prevTs: number, currTs: number): boolean {
  return currTs - prevTs > 3600;
}
