'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Trash2, Edit2, Loader2, Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { formatRelativeTime } from './lastUpdated';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  updatedAt: string;
}

interface ServiceFormState {
  id?: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
}

const EMPTY_FORM: ServiceFormState = {
  name: '',
  description: '',
  durationMinutes: 30,
  priceCents: 0,
  isActive: true,
};

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h}h ${m}m`;
}

export function ServicesCard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ServiceFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchServices() {
    try {
      const res = await apiFetch('/api/studio/services?includeInactive=true');
      if (!res.ok) {
        setError('Failed to load services');
        return;
      }
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  function openNewForm() {
    setForm({ ...EMPTY_FORM });
    setError(null);
  }

  function openEditForm(svc: Service) {
    setForm({
      id: svc.id,
      name: svc.name,
      description: svc.description || '',
      durationMinutes: svc.durationMinutes,
      priceCents: svc.priceCents,
      isActive: svc.isActive,
    });
    setError(null);
  }

  function closeForm() {
    setForm(null);
    setError(null);
  }

  async function handleSave() {
    if (!form) return;
    if (!form.name.trim()) {
      setError('Service name is required');
      return;
    }
    if (form.durationMinutes < 15 || form.durationMinutes > 480) {
      setError('Duration must be between 15 and 480 minutes');
      return;
    }
    if (form.priceCents < 0) {
      setError('Price cannot be negative');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const isEdit = Boolean(form.id);
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        durationMinutes: form.durationMinutes,
        priceCents: form.priceCents,
        isActive: form.isActive,
      };
      if (isEdit) payload.id = form.id;

      const res = await apiFetch('/api/studio/services', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save service');
      }
      await fetchServices();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(svc: Service) {
    if (!confirm(`Delete "${svc.name}"? This cannot be undone (services with existing bookings will be marked inactive instead).`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/studio/services?id=${svc.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      await fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  // Most recent update across all services
  const mostRecent = services
    .map((s) => s.updatedAt)
    .filter(Boolean)
    .sort()
    .pop();
  const updatedLabel = formatRelativeTime(mostRecent);

  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#1e1e38] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Services</h2>
            {updatedLabel && (
              <p className="text-xs text-slate-500">Last updated {updatedLabel}</p>
            )}
          </div>
        </div>
        {!form && !loading && (
          <button
            onClick={openNewForm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add service
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {services.length === 0 && !form && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-2">No services yet</p>
              <button
                onClick={openNewForm}
                className="text-sm text-amber-400 hover:text-amber-300"
              >
                + Add your first service
              </button>
            </div>
          )}

          {services.length > 0 && (
            <div className="space-y-2 mb-3">
              {services.map((svc) => {
                const isEditingThis = form?.id === svc.id;
                if (isEditingThis) return null; // Hide row while editing
                return (
                  <div
                    key={svc.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      svc.isActive
                        ? 'border-slate-800 bg-slate-900/40'
                        : 'border-slate-800/60 bg-slate-900/20 opacity-60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {svc.name}
                        </p>
                        {!svc.isActive && (
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDuration(svc.durationMinutes)} &middot; {formatPrice(svc.priceCents)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditForm(svc)}
                        className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(svc)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {form && (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                  {form.id ? 'Edit service' : 'New service'}
                </p>
                <button
                  onClick={closeForm}
                  className="p-1 rounded text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="Free Intro Call"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="Optional short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    step={5}
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.priceCents / 100}
                    onChange={(e) => setForm({ ...form, priceCents: Math.round(Number(e.target.value) * 100) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500"
                />
                Active (visible on booking page)
              </label>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={closeForm}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
