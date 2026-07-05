'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type Availability = 'active' | 'seasonal' | 'paused';
type Visibility = 'private' | 'relationships' | 'community' | 'public';
type Exchange = 'open_to_conversation' | 'gift' | 'reciprocity' | 'paid';

interface Offering {
  id: string;
  title: string;
  description: string | null;
  availability: Availability;
  visibility: Visibility;
  exchange: Exchange;
  created_at: string;
}

const AVAILABILITY_LABELS: Record<Availability, string> = {
  active: 'Active',
  seasonal: 'Seasonal',
  paused: 'Paused',
};

const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: 'Private',
  relationships: 'Relationships',
  community: 'Community',
  public: 'Public',
};

const EXCHANGE_LABELS: Record<Exchange, string> = {
  open_to_conversation: 'Open to conversation',
  gift: 'Gift',
  reciprocity: 'Reciprocity',
  paid: 'Paid',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  availability: 'active' as Availability,
  visibility: 'private' as Visibility,
  exchange: 'open_to_conversation' as Exchange,
};

export default function OfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/offerings', { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOfferings(Array.isArray(data.offerings) ? data.offerings : []);
    } catch {
      setError('Could not load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (offering: Offering) => {
    setEditingId(offering.id);
    setForm({
      title: offering.title,
      description: offering.description ?? '',
      availability: offering.availability,
      visibility: offering.visibility,
      exchange: offering.exchange,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || saving) return;
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        const res = await apiFetch(`/api/offerings/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        const res = await apiFetch('/api/offerings', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      resetForm();
      await load();
    } catch {
      setError('Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async (offering: Offering) => {
    const nextAvailability: Availability = offering.availability === 'paused' ? 'active' : 'paused';
    try {
      const res = await apiFetch(`/api/offerings/${offering.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ availability: nextAvailability }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch {
      setError('Could not update.');
    }
  };

  const remove = async (offering: Offering) => {
    try {
      const res = await apiFetch(`/api/offerings/${offering.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (editingId === offering.id) resetForm();
      await load();
    } catch {
      setError('Could not remove.');
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-xl font-medium text-stone-700 leading-relaxed mb-2">
          What would you enjoy making available to others at this point in your life?
        </h1>
        <p className="text-[13px] text-stone-500 leading-relaxed mb-12">
          Answer in your own words. Nothing here is ranked, scored, or searched by
          others — this is your own record of what you're willing to make available,
          and to whom.
        </p>

        {loading ? (
          <div className="text-stone-400 text-sm">…</div>
        ) : (
          <>
            {offerings.length > 0 && (
              <div className="space-y-8 mb-14">
                {offerings.map((o) => (
                  <div key={o.id} className="border-b border-stone-200/60 pb-8">
                    <p className="text-[15px] text-stone-800 font-medium mb-1">{o.title}</p>
                    {o.description && (
                      <p className="text-[13px] text-stone-600 leading-relaxed mb-3 whitespace-pre-wrap">
                        {o.description}
                      </p>
                    )}
                    <p className="text-[12px] text-stone-400 mb-4">
                      {AVAILABILITY_LABELS[o.availability]} · {VISIBILITY_LABELS[o.visibility]} ·{' '}
                      {EXCHANGE_LABELS[o.exchange]}
                    </p>
                    <div className="flex items-center gap-4 text-[12px]">
                      <button
                        type="button"
                        onClick={() => startEdit(o)}
                        className="text-stone-500 hover:text-stone-800 underline underline-offset-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePause(o)}
                        className="text-stone-500 hover:text-stone-800 underline underline-offset-2"
                      >
                        {o.availability === 'paused' ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(o)}
                        className="text-stone-500 hover:text-stone-800 underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <h2 className="text-[13px] font-medium text-stone-600 uppercase tracking-wide">
                {editingId ? 'Edit offering' : 'New offering'}
              </h2>

              <div>
                <label className="block text-[12px] text-stone-500 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-[14px] text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[12px] text-stone-500 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="In your own words…"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-[14px] text-stone-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] text-stone-500 mb-1">Availability</label>
                  <select
                    value={form.availability}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, availability: e.target.value as Availability }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-[14px] text-stone-800"
                  >
                    <option value="active">Active</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] text-stone-500 mb-1">Visibility</label>
                  <select
                    value={form.visibility}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, visibility: e.target.value as Visibility }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-[14px] text-stone-800"
                  >
                    <option value="private">Private</option>
                    <option value="relationships">Relationships</option>
                    <option value="community">Community</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] text-stone-500 mb-1">Exchange</label>
                  <select
                    value={form.exchange}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, exchange: e.target.value as Exchange }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-[14px] text-stone-800"
                  >
                    <option value="open_to_conversation">Open to conversation</option>
                    <option value="gift">Gift</option>
                    <option value="reciprocity">Reciprocity</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#5a7a6f] text-white text-[13px] font-medium disabled:opacity-50"
                >
                  {editingId ? 'Save' : 'Add offering'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-[13px] text-stone-500 underline underline-offset-2"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {error && <p className="text-[12px] text-stone-500">{error}</p>}
            </form>
          </>
        )}
      </main>
    </div>
  );
}
