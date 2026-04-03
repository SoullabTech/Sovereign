'use client';

/**
 * NOSTR PUBLISH MODAL
 *
 * Consent preview before publishing to Nostr.
 * Shows exactly what will be published, to which relay,
 * with signature and anonymity options.
 *
 * This is a member choosing to let something leave the sanctuary.
 * It should feel deliberate.
 */

import { useState } from 'react';
import { Radio, X, Loader2, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { publishAsMember } from '@/lib/nostr/memberPublish';
import type { PublishContentType, SignatureMode, PublishResult } from '@/lib/nostr/memberPublish';
import { SOULLAB_RELAY_URL } from '@/lib/nostr/utils';

interface NostrPublishModalProps {
  memberId: string;
  content: string;
  contentType: PublishContentType;
  onClose: () => void;
  onPublished?: (result: PublishResult) => void;
}

const CONTENT_TYPE_LABELS: Record<PublishContentType, string> = {
  reflection: 'Reflection',
  journal: 'Journal Entry',
  field_note: 'Field Note',
  insight: 'Insight',
};

export function NostrPublishModal({
  memberId,
  content,
  contentType,
  onClose,
  onPublished,
}: NostrPublishModalProps) {
  const [anonymous, setAnonymous] = useState(false);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('member');
  const [tags, setTags] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);

      const extraTags = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const publishResult = await publishAsMember({
        memberId,
        content,
        contentType,
        signatureMode,
        anonymous,
        tags: extraTags.length > 0 ? extraTags : undefined,
      });

      setResult(publishResult);
      onPublished?.(publishResult);

      // Record the publish server-side (fire-and-forget)
      fetch('/api/nostr/publish/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: publishResult.eventId,
          contentType,
          signatureMode,
          relayUrl: publishResult.relayUrl,
          publishedAt: new Date(publishResult.publishedAt * 1000).toISOString(),
          anonymous,
        }),
      }).catch(() => {}); // non-blocking
    } catch (err: any) {
      setError(err.message ?? 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  // Preview of content (truncated for display)
  const preview = content.length > 500 ? content.slice(0, 500) + '...' : content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-stone-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-medium text-stone-200">
              {result ? 'Released' : 'Release to Nostr'}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success state */}
        {result && (
          <div className="p-6 space-y-4 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <div>
              <p className="text-sm text-stone-200 mb-1">Released to your relay</p>
              <p className="text-[10px] text-stone-500 font-mono break-all">
                Event: {result.eventId.slice(0, 16)}...
              </p>
              <p className="text-[10px] text-stone-600 mt-1">
                {result.relayUrl}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-stone-300 bg-stone-800 hover:bg-stone-700
                         rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Consent form */}
        {!result && (
          <div className="p-4 space-y-4">
            {/* Content type badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-violet-600/20 text-violet-300 rounded-full">
                {CONTENT_TYPE_LABELS[contentType]}
              </span>
              <span className="text-[10px] text-stone-600">
                → {SOULLAB_RELAY_URL}
              </span>
            </div>

            {/* Content preview */}
            <div className="p-3 bg-black/30 rounded-lg border border-white/5 max-h-48 overflow-y-auto">
              <p className="text-xs text-stone-300 whitespace-pre-wrap leading-relaxed">
                {preview}
              </p>
            </div>

            {/* Signature choice */}
            <div className="space-y-2">
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">Signed by</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSignatureMode('member')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-colors ${
                    signatureMode === 'member'
                      ? 'border-violet-500/50 bg-violet-600/20 text-violet-200'
                      : 'border-white/10 bg-white/5 text-stone-400 hover:text-stone-300'
                  }`}
                >
                  <Shield className="w-3 h-3 inline mr-1" />
                  Publish as you
                </button>
                <button
                  onClick={() => setSignatureMode('maia_delegation')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs border transition-colors ${
                    signatureMode === 'maia_delegation'
                      ? 'border-amber-500/50 bg-amber-600/20 text-amber-200'
                      : 'border-white/10 bg-white/5 text-stone-400 hover:text-stone-300'
                  }`}
                >
                  <Radio className="w-3 h-3 inline mr-1" />
                  MAIA reflection
                </button>
              </div>
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                {anonymous ? <EyeOff className="w-3.5 h-3.5 text-stone-400" /> : <Eye className="w-3.5 h-3.5 text-stone-400" />}
                <span className="text-xs text-stone-300">Anonymous</span>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  anonymous ? 'bg-violet-600' : 'bg-stone-700'
                }`}
                onClick={() => setAnonymous(!anonymous)}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    anonymous ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </label>

            {/* Optional tags */}
            <div>
              <label className="block text-[10px] text-stone-500 mb-1">Tags (optional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="spiralogic, awareness, practice"
                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg
                           text-stone-300 text-xs placeholder-stone-600
                           focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-sm text-stone-400 bg-stone-800/50
                           hover:bg-stone-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 px-3 py-2 text-sm text-violet-100 bg-violet-600/30
                           hover:bg-violet-600/50 rounded-lg transition-colors
                           disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Radio className="w-3 h-3" />}
                Release
              </button>
            </div>

            {/* Sovereignty note */}
            <p className="text-[10px] text-stone-600 text-center">
              This will be published publicly to your relay. This action cannot be undone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NostrPublishModal;
