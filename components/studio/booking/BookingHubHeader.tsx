'use client';

import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Check, Globe } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Identity {
  slug: string;
  name: string;
}

// Pinned production host — prevents dev/staging confusion when copying the URL.
// Falls back to NEXT_PUBLIC_SITE_URL if set, otherwise soullab.life.
const BOOKING_HOST =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
  'https://soullab.life';

export function BookingHubHeader() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/studio/whoami');
        const data = await res.json();
        if (data.identity) {
          setIdentity({
            slug: data.identity.slug || '',
            name: data.identity.name || 'Practitioner',
          });
        }
      } catch (err) {
        console.error('[BookingHubHeader] whoami load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const bookingUrl = identity?.slug ? `${BOOKING_HOST}/book/${identity.slug}` : '';

  const handleCopy = async () => {
    if (!bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#1e1e38] p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Globe className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Your booking page</p>
          {loading ? (
            <div className="h-6 mt-1 w-48 bg-slate-800 rounded animate-pulse" />
          ) : identity?.slug ? (
            <>
              <p className="text-lg font-medium text-white mt-0.5 truncate">
                {bookingUrl}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                Share this link with anyone who wants to book with {identity.name}.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 mt-1">
              No booking slug set yet. Configure it in Settings to share your public link.
            </p>
          )}
        </div>
        {identity?.slug && !loading && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
