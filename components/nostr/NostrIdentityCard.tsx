'use client';

/**
 * NostrIdentityCard
 *
 * Displays a member's registered Nostr identity.
 * Shows npub, relay URL, and options to export or reset.
 */

import { useState } from 'react';
import { Copy, Check, Download, RefreshCw, Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { nsecFromHex, loadPrivkey, clearPrivkey, generateKeypair, storePrivkey } from '@/lib/nostr/crypto';
import { truncateNpub } from '@/lib/nostr/utils';
import { apiFetch } from '@/lib/http/apiBase';

interface Props {
  memberId: string;
  pubkey: string;
  npub: string;
  relayUrl: string;
  registeredAt?: string;
  onReset: () => void;
}

export function NostrIdentityCard({ memberId, pubkey, npub, relayUrl, registeredAt, onReset }: Props) {
  const [copiedNpub, setCopiedNpub] = useState(false);
  const [showNsec, setShowNsec] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const relayDisplay = relayUrl.replace('wss://', '');

  function copyNpub() {
    navigator.clipboard.writeText(npub).then(() => {
      setCopiedNpub(true);
      setTimeout(() => setCopiedNpub(false), 2000);
    });
  }

  function exportNsec() {
    const privkey = loadPrivkey(memberId);
    if (!privkey) {
      alert('Private key not found on this device. If you set up messaging on another device, the key is stored there.');
      return;
    }
    const nsec = nsecFromHex(privkey);
    const content = `Soullab Sovereign Messaging Key\n\nPrivate key (nsec):\n${nsec}\n\nPublic key (npub):\n${npub}\n\nRelay: ${relayUrl}\n\nExported: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soullab-nostr-key.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReset() {
    setResetting(true);
    try {
      const kp = generateKeypair();
      const res = await apiFetch('/api/nostr/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkey: kp.pubkeyHex }),
      });
      if (!res.ok) throw new Error('Registration failed');
      clearPrivkey(memberId);
      storePrivkey(memberId, kp.privkeyHex);
      setShowResetConfirm(false);
      onReset();
    } catch (err) {
      console.error('Identity reset failed', err);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Identity row */}
      <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/40 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white">Sovereign identity</span>
          <span className="ml-auto text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
        </div>

        {/* npub */}
        <div className="space-y-1">
          <label className="text-xs text-stone-500 uppercase tracking-wider">Public key (npub)</label>
          <div className="flex items-center gap-2">
            <code className="text-sm text-violet-300 flex-1 break-all leading-relaxed">{truncateNpub(npub)}</code>
            <button
              onClick={copyNpub}
              className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors flex-shrink-0"
              title="Copy full npub"
            >
              {copiedNpub ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Relay */}
        <div className="space-y-1">
          <label className="text-xs text-stone-500 uppercase tracking-wider">Relay</label>
          <div className="flex items-center gap-2">
            <code className="text-sm text-stone-300">{relayDisplay}</code>
            <a href={relayUrl.replace('wss://', 'https://')} target="_blank" rel="noopener noreferrer" className="p-1 text-stone-500 hover:text-stone-300">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {registeredAt && (
          <p className="text-xs text-stone-600">
            Registered {new Date(registeredAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Private key export */}
      <div className="space-y-2">
        {!showNsec ? (
          <button
            onClick={() => setShowNsec(true)}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Export private key (nsec)
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-stone-800/60 border border-red-800/30 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">Your private key controls your identity. Never share it.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportNsec}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-sm text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download backup
              </button>
              <button onClick={() => setShowNsec(false)} className="px-3 py-2 text-sm text-stone-400 hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="pt-2 border-t border-stone-700/30">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset messaging identity
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30 space-y-3">
            <p className="text-sm text-red-300">
              This generates a new keypair and replaces your current identity.
              Any existing encrypted messages will no longer be readable.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-sm text-white font-medium transition-colors"
              >
                {resetting ? 'Resetting…' : 'Confirm reset'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-stone-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
