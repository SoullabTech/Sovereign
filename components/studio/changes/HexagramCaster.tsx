'use client';

/**
 * HexagramCaster — I Ching Casting Experience
 *
 * Method selector (Yarrow / Coins), cast button, loading state,
 * result display. Option to switch to browser.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Search } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramDisplay from './HexagramDisplay';

interface HexagramCasterProps {
  changeId: string;
  onCast: (result: {
    hexagramNumber: number;
    changingLines: number[];
    relatingHexagramNumber: number | null;
    castingMethod: string;
  }) => void;
}

export default function HexagramCaster({ changeId, onCast }: HexagramCasterProps) {
  const [method, setMethod] = useState<'yarrow' | 'coin'>('coin');
  const [casting, setCasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    hexagramNumber: number;
    changingLines: number[];
    relatingHexagramNumber: number | null;
  } | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);

  async function handleCast() {
    setCasting(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiFetch('/api/iching/cast', {
        method: 'POST',
        body: JSON.stringify({ method }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          hexagramNumber: data.hexagramNumber,
          changingLines: data.changingLines || [],
          relatingHexagramNumber: data.relatingHexagramNumber || null,
        });
        onCast({
          hexagramNumber: data.hexagramNumber,
          changingLines: data.changingLines || [],
          relatingHexagramNumber: data.relatingHexagramNumber || null,
          castingMethod: method,
        });
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        setError(err.error || 'Casting failed');
      }
    } catch {
      setError('Could not reach oracle');
    } finally {
      setCasting(false);
    }
  }

  if (showBrowser) {
    // Parent component should handle browser view
    return null;
  }

  return (
    <div className="space-y-4">
      {!result && (
        <>
          {/* Method Selector */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Casting Method</p>
            <div className="flex gap-2">
              <button
                onClick={() => setMethod('yarrow')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all ${
                  method === 'yarrow'
                    ? 'border-amber-500/50 bg-amber-950/20 text-amber-200'
                    : 'border-slate-800/60 bg-slate-900/30 text-slate-400 hover:border-slate-700/70'
                }`}
              >
                Yarrow Stalks (traditional)
              </button>
              <button
                onClick={() => setMethod('coin')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all ${
                  method === 'coin'
                    ? 'border-amber-500/50 bg-amber-950/20 text-amber-200'
                    : 'border-slate-800/60 bg-slate-900/30 text-slate-400 hover:border-slate-700/70'
                }`}
              >
                Three Coins
              </button>
            </div>
          </div>

          {/* Cast Button */}
          <button
            onClick={handleCast}
            disabled={casting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800/50 text-white rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {casting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Casting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Cast the Hexagram
              </>
            )}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Browse Instead */}
          <div className="text-center">
            <button
              onClick={() => setShowBrowser(true)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              Or browse hexagrams instead
            </button>
          </div>
        </>
      )}

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4"
          >
            <HexagramDisplay
              hexagramNumber={result.hexagramNumber}
              changingLines={result.changingLines}
              relatingHexagramNumber={result.relatingHexagramNumber}
              size="lg"
            />

            {/* Cast Again */}
            <div className="mt-4 pt-4 border-t border-amber-900/20">
              <button
                onClick={() => setResult(null)}
                className="text-xs text-amber-400/70 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Cast again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
