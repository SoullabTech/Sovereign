'use client';

/**
 * Admin Video Publisher
 *
 * Simple paste-and-publish workflow:
 * 1. Generate script in Explainer Scripts tool
 * 2. Produce video in HeyGen
 * 3. Paste URL here and publish
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Video,
  Loader2,
  Trash2,
  Edit2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Save,
  X,
  ExternalLink,
  Check,
} from 'lucide-react';

interface MemberVideo {
  id: string;
  title: string;
  description: string | null;
  heygen_url: string;
  thumbnail_url: string | null;
  tags: string[];
  visibility: 'member' | 'practitioner' | 'admin';
  is_featured: boolean;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
}

export default function AdminVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<MemberVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminSecret, setAdminSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    heygen_url: '',
    thumbnail_url: '',
    tags: '',
    visibility: 'member' as 'member' | 'practitioner' | 'admin',
    is_featured: false,
    duration_seconds: '',
    sort_order: '0',
  });
  const [saving, setSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('labtools_admin_secret');
    if (stored) {
      setAdminSecret(stored);
      fetchVideos(stored);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchVideos(secret: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/library/videos?adminSecret=${encodeURIComponent(secret)}`);
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          localStorage.removeItem('labtools_admin_secret');
          throw new Error('Invalid admin secret');
        }
        throw new Error('Failed to load videos');
      }
      const data = await res.json();
      setVideos(data.videos || []);
      setAuthenticated(true);
      localStorage.setItem('labtools_admin_secret', secret);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    fetchVideos(adminSecret);
  }

  function resetForm() {
    setForm({
      title: '',
      description: '',
      heygen_url: '',
      thumbnail_url: '',
      tags: '',
      visibility: 'member',
      is_featured: false,
      duration_seconds: '',
      sort_order: '0',
    });
    setEditingId(null);
  }

  function openEdit(video: MemberVideo) {
    setForm({
      title: video.title,
      description: video.description || '',
      heygen_url: video.heygen_url,
      thumbnail_url: video.thumbnail_url || '',
      tags: video.tags.join(', '),
      visibility: video.visibility,
      is_featured: video.is_featured,
      duration_seconds: video.duration_seconds?.toString() || '',
      sort_order: video.sort_order.toString(),
    });
    setEditingId(video.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        adminSecret,
        title: form.title.trim(),
        description: form.description.trim() || null,
        heygen_url: form.heygen_url.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        visibility: form.visibility,
        is_featured: form.is_featured,
        duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
        sort_order: parseInt(form.sort_order) || 0,
      };

      const url = editingId
        ? `/api/admin/library/videos/${editingId}`
        : '/api/admin/library/videos';

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save video');
      }

      // Refresh list
      await fetchVideos(adminSecret);
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video?')) return;

    try {
      const res = await fetch(
        `/api/admin/library/videos/${id}?adminSecret=${encodeURIComponent(adminSecret)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      await fetchVideos(adminSecret);
    } catch (e: any) {
      setError(e.message);
    }
  }

  // Auth form
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
        <div className="max-w-md mx-auto px-6 py-20">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab
          </button>

          <div className="text-center mb-8">
            <Video className="w-12 h-12 text-[#D4B896] mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white">Video Publisher</h1>
            <p className="text-white/50 text-sm mt-2">Admin access required</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10
                       text-white placeholder:text-white/30 text-sm
                       focus:outline-none focus:border-[#D4B896]/40"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !adminSecret}
              className="w-full px-6 py-3 rounded-xl bg-[#D4B896]/20 border border-[#D4B896]/30
                       text-[#D4B896] font-medium text-sm
                       hover:bg-[#D4B896]/30 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-[#D4B896]/20 border border-[#D4B896]/30
                     text-[#D4B896] text-sm font-medium
                     hover:bg-[#D4B896]/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Video Publisher</h1>
          <p className="text-white/50 text-sm mt-1">
            Publish videos to the Soullab Guides library
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Video List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4B896] animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No videos published yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#D4B896] text-sm hover:underline"
            >
              Add your first video
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                layout
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]
                         hover:bg-white/[0.04] transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-[#D4B896]/10 to-[#D4B896]/5 flex items-center justify-center shrink-0 overflow-hidden">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-6 h-6 text-[#D4B896]/40" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white truncate">{video.title}</h3>
                    {video.is_featured && <Star className="w-3 h-3 text-[#D4B896] shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span className={`px-1.5 py-0.5 rounded ${
                      video.visibility === 'admin' ? 'bg-red-500/20 text-red-400' :
                      video.visibility === 'practitioner' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {video.visibility}
                    </span>
                    {video.tags.slice(0, 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={video.heygen_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    title="Open video"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openEdit(video)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl
                       bg-gradient-to-br from-[#1a1f2e] to-[#0f1419]
                       border border-white/10 shadow-2xl"
            >
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {editingId ? 'Edit Video' : 'Add Video'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      Title <span className="text-[#D4B896]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                               text-white placeholder:text-white/30 text-sm
                               focus:outline-none focus:border-[#D4B896]/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      HeyGen URL <span className="text-[#D4B896]">*</span>
                    </label>
                    <input
                      type="url"
                      value={form.heygen_url}
                      onChange={(e) => setForm({ ...form, heygen_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                               text-white placeholder:text-white/30 text-sm
                               focus:outline-none focus:border-[#D4B896]/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                               text-white placeholder:text-white/30 text-sm resize-none
                               focus:outline-none focus:border-[#D4B896]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      value={form.thumbnail_url}
                      onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                               text-white placeholder:text-white/30 text-sm
                               focus:outline-none focus:border-[#D4B896]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      Tags <span className="text-white/40">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="maia, getting-started, basics"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                               text-white placeholder:text-white/30 text-sm
                               focus:outline-none focus:border-[#D4B896]/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Visibility</label>
                      <select
                        value={form.visibility}
                        onChange={(e) => setForm({ ...form, visibility: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                                 text-white text-sm
                                 focus:outline-none focus:border-[#D4B896]/40"
                      >
                        <option value="member">Member (all)</option>
                        <option value="practitioner">Practitioner</option>
                        <option value="admin">Admin only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-1">Duration (sec)</label>
                      <input
                        type="number"
                        value={form.duration_seconds}
                        onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })}
                        placeholder="90"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                                 text-white placeholder:text-white/30 text-sm
                                 focus:outline-none focus:border-[#D4B896]/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10
                                 text-white text-sm
                                 focus:outline-none focus:border-[#D4B896]/40"
                      />
                    </div>

                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_featured}
                          onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                          className="w-4 h-4 rounded border-white/20 bg-black/30 text-[#D4B896]
                                   focus:ring-[#D4B896]/40"
                        />
                        <span className="text-sm text-white/70">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10
                             text-white/70 text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-[#D4B896]/20 border border-[#D4B896]/30
                             text-[#D4B896] text-sm font-medium
                             hover:bg-[#D4B896]/30 disabled:opacity-50 transition-all
                             flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingId ? 'Update' : 'Publish'}
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
