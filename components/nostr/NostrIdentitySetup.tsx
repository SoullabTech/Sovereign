'use client';

/**
 * NostrIdentitySetup
 *
 * First-time sovereign messaging identity wizard.
 * Generates a Nostr keypair in the browser, prompts the user to back up
 * their private key (nsec), then registers the public key with Soullab.
 *
 * The private key NEVER leaves this component or the browser.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Shield, Download, Check, AlertTriangle, Loader2, Copy } from 'lucide-react';
import { generateKeypair, storePrivkey } from '@/lib/nostr/crypto';
import { truncateNpub } from '@/lib/nostr/utils';
import { apiFetch } from '@/lib/http/apiBase';

interface Props {
  memberId: string;
  onComplete: (pubkey: string, npub: string) => void;
}

type Step = 'explain' | 'generate' | 'backup' | 'confirm' | 'registering' | 'done';

export function NostrIdentitySetup({ memberId, onComplete }: Props) {
  const [step, setStep] = useState<Step>('explain');
  const [keypair, setKeypair] = useState<{ privkeyHex: string; pubkeyHex: string; npub: string; nsec: string } | null>(null);
  const [backedUp, setBackedUp] = useState(false);
  const [copiedNpub, setCopiedNpub] = useState(false);
  const [copiedNsec, setCopiedNsec] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    const kp = generateKeypair();
    setKeypair(kp);
    setStep('backup');
  }

  function copyToClipboard(text: string, which: 'npub' | 'nsec') {
    navigator.clipboard.writeText(text).then(() => {
      if (which === 'npub') { setCopiedNpub(true); setTimeout(() => setCopiedNpub(false), 2000); }
      else { setCopiedNsec(true); setTimeout(() => setCopiedNsec(false), 2000); }
    });
  }

  function downloadNsec() {
    if (!keypair) return;
    const content = `Soullab Sovereign Messaging Key\n\nThis is your private key (nsec). Store it somewhere safe.\nAnyone with this key can sign messages as you.\n\nPrivate key (nsec):\n${keypair.nsec}\n\nPublic key (npub):\n${keypair.npub}\n\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soullab-nostr-key.txt';
    a.click();
    URL.revokeObjectURL(url);
    setBackedUp(true);
  }

  async function handleRegister() {
    if (!keypair) return;
    setStep('registering');
    setError(null);

    try {
      const res = await apiFetch('/api/nostr/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkey: keypair.pubkeyHex }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Registration failed');
      }

      // Store private key locally only after successful server registration
      storePrivkey(memberId, keypair.privkeyHex);
      setStep('done');
      setTimeout(() => onComplete(keypair.pubkeyHex, keypair.npub), 1200);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setStep('backup');
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">

        {/* Step 1: Explain */}
        {step === 'explain' && (
          <motion.div key="explain" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 mt-0.5">
                <Key className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Sovereign Messaging</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Your messaging identity is a cryptographic keypair that belongs to you — not Soullab.
                  You can use it to exchange encrypted messages with practitioners and community members.
                  Even if you leave Soullab, your identity and message history are portable.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {[
                { icon: Shield, label: 'End-to-end encrypted', desc: 'Nobody can read your messages except the intended recipient' },
                { icon: Key, label: 'You own the keys', desc: 'Your private key never leaves your device' },
                { icon: Download, label: 'Portable identity', desc: 'Works with any Nostr-compatible app, including BitChat' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-stone-800/40 border border-stone-700/30">
                  <Icon className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-white font-medium">{label}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('generate')}
              className="w-full py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              Set up sovereign messaging
            </button>
          </motion.div>
        )}

        {/* Step 2: Generate prompt */}
        {step === 'generate' && (
          <motion.div key="generate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 text-center py-4">
            <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20 w-16 h-16 flex items-center justify-center mx-auto">
              <Key className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Generate your keypair</h3>
              <p className="text-sm text-stone-400">
                This happens entirely in your browser. No information leaves your device until you choose to register your public key.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              Generate keys
            </button>
          </motion.div>
        )}

        {/* Step 3: Backup */}
        {step === 'backup' && keypair && (
          <motion.div key="backup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                Back up your private key before continuing. If you lose it, you lose access to your messaging identity. Soullab cannot recover it.
              </p>
            </div>

            {/* Public key */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-500 uppercase tracking-wider">Your public identity (npub)</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-800/60 border border-stone-700/40">
                <code className="text-sm text-violet-300 flex-1 break-all">{keypair.npub}</code>
                <button
                  onClick={() => copyToClipboard(keypair.npub, 'npub')}
                  className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors flex-shrink-0"
                >
                  {copiedNpub ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-stone-500">Share this with people who want to message you.</p>
            </div>

            {/* Private key */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-500 uppercase tracking-wider">Your private key (nsec) — keep secret</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-800/60 border border-red-800/30">
                <code className="text-sm text-red-300 flex-1 break-all">{keypair.nsec}</code>
                <button
                  onClick={() => copyToClipboard(keypair.nsec, 'nsec')}
                  className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-white transition-colors flex-shrink-0"
                >
                  {copiedNsec ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-red-400">Never share this key. Anyone who has it can sign messages as you.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30 text-sm text-red-300">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={downloadNsec}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download backup
              </button>
              <button
                onClick={handleRegister}
                disabled={!backedUp && !copiedNsec}
                className="flex-1 py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {backedUp || copiedNsec ? 'Register identity' : 'Back up first'}
              </button>
            </div>
            {!backedUp && !copiedNsec && (
              <p className="text-xs text-stone-500 text-center">Download or copy your private key to continue.</p>
            )}
          </motion.div>
        )}

        {/* Registering */}
        {step === 'registering' && (
          <motion.div key="registering" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
            <p className="text-stone-400 text-sm">Registering your identity with the relay…</p>
          </motion.div>
        )}

        {/* Done */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-3">
            <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20 w-16 h-16 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Sovereign identity active</h3>
              <p className="text-sm text-stone-400 mt-1">
                {keypair ? truncateNpub(keypair.npub) : ''}
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
