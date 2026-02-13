'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

export default function CreateCirclePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch('/api/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to create circle');
        return;
      }

      router.push(`/commons/circles/${json.circle.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      <div className="mx-auto max-w-xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/commons/circles"
            className="mb-6 inline-flex items-center gap-2 text-sm text-maia-ink-40 transition-colors hover:text-maia-ink-60"
          >
            <ArrowLeft className="h-4 w-4" /> Back to circles
          </Link>

          <h1 className="text-2xl font-semibold text-maia-ink-100">Create a circle</h1>
          <p className="mt-1 text-sm text-maia-ink-60">
            A circle is a shared space for a group you steward. Members choose what to share.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-maia-ink-80">
                Circle name
              </label>
              <input
                id="name"
                type="text"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thursday Group"
                className="mt-1.5 w-full rounded-xl border border-maia-navy-700 bg-maia-navy-850 px-4 py-2.5 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:border-maia-spice-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-maia-ink-80">
                Description <span className="text-maia-ink-40">(optional)</span>
              </label>
              <textarea
                id="description"
                maxLength={600}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this circle for?"
                className="mt-1.5 w-full rounded-xl border border-maia-navy-700 bg-maia-navy-850 px-4 py-2.5 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:border-maia-spice-500/50 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2.5 text-sm font-medium text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create circle'}
            </button>
          </form>

          <p className="mt-6 text-xs text-maia-ink-40">
            You'll become the circle's helper. You can invite members after creating it.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
