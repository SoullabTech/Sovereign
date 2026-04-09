'use client';

import { useEffect, useState } from 'react';
import { User, Edit2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { formatRelativeTime } from './lastUpdated';

interface Profile {
  id: string;
  name: string;
  business_name: string | null;
  tagline: string | null;
  bio: string | null;
  slug: string;
  updated_at: string | null;
}

export function ProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');

  async function fetchProfile() {
    try {
      const res = await apiFetch('/api/studio/profile');
      if (!res.ok) {
        setError('Failed to load profile');
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  function openEdit() {
    if (!profile) return;
    setName(profile.name || '');
    setBusinessName(profile.business_name || '');
    setTagline(profile.tagline || '');
    setBio(profile.bio || '');
    setEditing(true);
    setError(null);
  }

  function closeEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/studio/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          business_name: businessName.trim() || null,
          tagline: tagline.trim() || null,
          bio: bio.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      const data = await res.json();
      setProfile(data.profile);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const updatedLabel = formatRelativeTime(profile?.updated_at);

  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#1e1e38] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Profile</h2>
            {updatedLabel && (
              <p className="text-xs text-slate-500">Last updated {updatedLabel}</p>
            )}
          </div>
        </div>
        {!editing && !loading && profile && (
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
        </div>
      ) : error && !profile ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : !profile ? (
        <p className="text-sm text-slate-400">No profile data available.</p>
      ) : editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Business name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="A short phrase shown below your name"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              placeholder="A short description shown on your booking page"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={closeEdit}
              disabled={saving}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-500">Name: </span>
            <span className="text-white">{profile.name}</span>
          </div>
          {profile.business_name && (
            <div>
              <span className="text-slate-500">Business: </span>
              <span className="text-white">{profile.business_name}</span>
            </div>
          )}
          {profile.tagline && (
            <div>
              <span className="text-slate-500">Tagline: </span>
              <span className="text-slate-200">{profile.tagline}</span>
            </div>
          )}
          {profile.bio && (
            <div>
              <span className="text-slate-500">Bio: </span>
              <span className="text-slate-200">{profile.bio}</span>
            </div>
          )}
          {!profile.tagline && !profile.bio && (
            <p className="text-xs text-slate-500 italic">
              Add a tagline and bio to personalize your booking page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
