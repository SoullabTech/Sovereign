'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  DollarSign,
  Star,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Package,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Service {
  id: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  category: string | null;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  includes: string[];
  slug: string | null;
  isBookable: boolean;
  confirmationInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  isFeatured: boolean;
  includes: string[];
  slug: string;
  isBookable: boolean;
  confirmationInstructions: string;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
];

const CATEGORY_OPTIONS = [
  'Consultation',
  'Reading',
  'Coaching',
  'Healing',
  'Workshop',
  'Course',
  'Package',
  'Other',
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    durationMinutes: 60,
    priceCents: 0,
    isActive: true,
    isFeatured: false,
    includes: [],
    slug: '',
    isBookable: true,
    confirmationInstructions: '',
  });
  const [newInclude, setNewInclude] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [includeInactive]);

  async function fetchServices() {
    try {
      const res = await apiFetch(`/api/studio/services?includeInactive=${includeInactive}`);
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }

  function openNewForm() {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      longDescription: '',
      category: '',
      durationMinutes: 60,
      priceCents: 0,
      isActive: true,
      isFeatured: false,
      includes: [],
      slug: '',
      isBookable: true,
      confirmationInstructions: '',
    });
    setNewInclude('');
    setError(null);
    setShowForm(true);
  }

  function openEditForm(service: Service) {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      longDescription: service.longDescription || '',
      category: service.category || '',
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      isActive: service.isActive,
      isFeatured: service.isFeatured,
      includes: service.includes || [],
      slug: service.slug || '',
      isBookable: service.isBookable ?? true,
      confirmationInstructions: service.confirmationInstructions || '',
    });
    setNewInclude('');
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingService(null);
    setError(null);
  }

  function addInclude() {
    if (newInclude.trim() && !formData.includes.includes(newInclude.trim())) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, newInclude.trim()],
      }));
      setNewInclude('');
    }
  }

  function removeInclude(item: string) {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter(i => i !== item),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...(editingService ? { id: editingService.id } : {}),
        name: formData.name,
        description: formData.description || null,
        longDescription: formData.longDescription || null,
        category: formData.category || null,
        durationMinutes: formData.durationMinutes,
        priceCents: formData.priceCents,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        includes: formData.includes,
      };

      const res = await apiFetch('/api/studio/services', {
        method: editingService ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
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

  async function handleDelete(service: Service) {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return;

    try {
      const res = await apiFetch(`/api/studio/services?id=${service.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      const data = await res.json();
      if (data.softDeleted) {
        alert(data.message);
      }

      await fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function toggleActive(service: Service) {
    try {
      const res = await apiFetch('/api/studio/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update');
      await fetchServices();
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  }

  async function toggleFeatured(service: Service) {
    try {
      const res = await apiFetch('/api/studio/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, isFeatured: !service.isFeatured }),
      });

      if (!res.ok) throw new Error('Failed to update');
      await fetchServices();
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
    return `${hours}h ${mins}m`;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-amber-400" />
            Services
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your session types, pricing, and availability
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={e => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
          />
          Show inactive services
        </label>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-16 bg-[#1e1e38] rounded-xl border border-slate-800/50">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No services yet</p>
          <button
            onClick={openNewForm}
            className="text-amber-400 hover:text-amber-300"
          >
            Create your first service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-[#1e1e38] rounded-xl border border-slate-800/50 p-4
                ${!service.isActive ? 'opacity-60' : ''} /* Intentional: state indicator, not text dimming */
              `}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle (visual only for now) */}
                <div className="pt-1 text-slate-600 cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-white truncate">
                      {service.name}
                    </h3>
                    {service.isFeatured && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        <Star className="w-3 h-3" fill="currentColor" />
                        Featured
                      </span>
                    )}
                    {!service.isActive && (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  {service.description && (
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {formatDuration(service.durationMinutes)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(service.priceCents)}
                    </span>
                    {service.category && (
                      <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                        {service.category}
                      </span>
                    )}
                  </div>

                  {service.includes && service.includes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {service.includes.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded"
                        >
                          {item}
                        </span>
                      ))}
                      {service.includes.length > 3 && (
                        <span className="px-2 py-0.5 text-slate-500 text-xs">
                          +{service.includes.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(service)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isFeatured
                        ? 'text-amber-400 bg-amber-500/20'
                        : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                    }`}
                    title={service.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className="w-4 h-4" fill={service.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => toggleActive(service)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isActive
                        ? 'text-emerald-400 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                    }`}
                    title={service.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(service)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1e1e38] rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingService ? 'Edit Service' : 'New Service'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Natal Chart Reading"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select category...</option>
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Duration & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Duration
                    </label>
                    <select
                      value={formData.durationMinutes}
                      onChange={e => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    >
                      {DURATION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.priceCents / 100}
                      onChange={e => setFormData(prev => ({ ...prev, priceCents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    placeholder="Brief description shown in listings..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={e => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                    rows={4}
                    placeholder="Detailed description for the service page..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* What's Included */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    What&apos;s Included
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newInclude}
                      onChange={e => setNewInclude(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInclude();
                        }
                      }}
                      placeholder="e.g., 60-minute session"
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={addInclude}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.includes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.includes.map((item, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-lg"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeInclude(item)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking Settings */}
                <div className="space-y-3 border-t border-slate-700 pt-4">
                  <div className="text-sm font-medium text-slate-300">Booking</div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Booking slug
                      <span className="text-slate-600 ml-1">(for direct links)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">/portal/.../book/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                        placeholder="auto-generated from name"
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Confirmation instructions</label>
                    <textarea
                      value={formData.confirmationInstructions}
                      onChange={e => setFormData(prev => ({ ...prev, confirmationInstructions: e.target.value }))}
                      placeholder="Instructions shown to client after booking (e.g., preparation steps, what to bring)"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-300">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-300">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBookable}
                      onChange={e => setFormData(prev => ({ ...prev, isBookable: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-300">Publicly bookable</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.name.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-medium rounded-lg transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingService ? 'Save Changes' : 'Create Service'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
