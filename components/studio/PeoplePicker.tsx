'use client';

/**
 * PeoplePicker — select participants from the canonical Studio People directory.
 *
 * Backed by /api/studio/people. A Person carries multiple roles (client, colleague, mentor,
 * guest, …) and may or may not have a linked MAIA account — this picker doesn't care which:
 * the practitioner just searches and adds anyone. New invitees can be added by email on the
 * spot (created as a Person with the guest role; deduped by email, so no duplicate identities).
 *
 * Reused by the meeting-create modal and the Groups "Add member" modal.
 */

import { useEffect, useRef, useState } from 'react';
import { Search, X, UserPlus, Check, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

export interface PersonRef {
  id: string;
  name: string;
  email: string | null;
  roles?: string[];
  accountStatus?: 'linked' | 'none';
  isClient?: boolean;
}

export function PeoplePicker({
  value,
  onChange,
  placeholder = 'Search people…',
}: {
  value: PersonRef[];
  onChange: (people: PersonRef[]) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<PersonRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestError, setGuestError] = useState('');
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced directory search.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = q.trim();
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/studio/people?q=${encodeURIComponent(term)}&limit=20`);
        const data = await res.json();
        setResults(Array.isArray(data.people) ? data.people : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const selectedIds = new Set(value.map((p) => p.id));

  const toggle = (p: PersonRef) => {
    if (selectedIds.has(p.id)) onChange(value.filter((x) => x.id !== p.id));
    else onChange([...value, p]);
  };

  const remove = (id: string) => onChange(value.filter((x) => x.id !== id));

  const addGuest = async () => {
    const name = guestName.trim();
    const email = guestEmail.trim();
    setGuestError('');
    if (!name || !email) {
      setGuestError('Name and email are both required');
      return;
    }
    setAdding(true);
    try {
      const res = await apiFetch('/api/studio/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, roles: ['guest'] }),
      });
      const data = await res.json();
      if (data.error) {
        setGuestError(data.error);
        return;
      }
      const person: PersonRef = data.person;
      if (!selectedIds.has(person.id)) onChange([...value, person]);
      setGuestName('');
      setGuestEmail('');
      setShowGuest(false);
    } catch {
      setGuestError('Failed to add');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs"
            >
              {p.name}
              <button type="button" onClick={() => remove(p.id)} className="hover:text-white" aria-label={`Remove ${p.name}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-[#16162a] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
        />
      </div>

      {/* Results */}
      <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-700/40 divide-y divide-slate-700/30">
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
          </div>
        )}
        {!loading && results.length === 0 && (
          <div className="px-3 py-2 text-xs text-slate-500">No people found. Add someone by email below.</div>
        )}
        {results.map((p) => {
          const selected = selectedIds.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-sm text-white truncate">{p.name}</span>
                <span className="block text-xs text-slate-500 truncate">{p.email || 'no email'}</span>
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                {(p.roles || []).slice(0, 2).map((r) => (
                  <span
                    key={r}
                    className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-400"
                  >
                    {r}
                  </span>
                ))}
                {selected && <Check className="w-4 h-4 text-amber-400" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add by email */}
      {!showGuest ? (
        <button
          type="button"
          onClick={() => setShowGuest(true)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add someone by email
        </button>
      ) : (
        <div className="space-y-2 rounded-lg border border-slate-700/40 p-3">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 bg-[#16162a] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
          />
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 bg-[#16162a] border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-sm"
          />
          {guestError && <div className="text-xs text-red-400">{guestError}</div>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addGuest}
              disabled={adding}
              className="flex-1 py-2 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowGuest(false);
                setGuestError('');
              }}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PeoplePicker;
