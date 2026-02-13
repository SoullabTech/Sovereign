'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVideoLibraryPage() {
  const router = useRouter();
  const [adminSecret, setAdminSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if we're already authenticated
  useEffect(() => {
    const storedSecret = localStorage.getItem('soullab_admin_secret');
    if (storedSecret) {
      setAdminSecret(storedSecret);
      authenticate(storedSecret);
    }
  }, []);

  async function authenticate(secret: string) {
    // In a real implementation, you'd verify this against a proper admin secret
    // For now, we'll just check if it's not empty
    if (secret.trim()) {
      setAuthenticated(true);
      localStorage.setItem('soullab_admin_secret', secret);
    } else {
      setError('Admin secret required');
    }
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    authenticate(adminSecret);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.target as HTMLFormElement);
    const title = form.get('title') as string;
    const description = form.get('description') as string;
    const heygenUrl = form.get('heygen_url') as string;
    const tags = form.get('tags') as string;
    const visibility = form.get('visibility') as string;
    const isFeatured = form.get('is_featured') === 'on';

    if (!title || !heygenUrl) {
      setError('Title and HeyGen URL are required');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        heygen_url: heygenUrl.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        visibility: visibility || 'member',
        is_featured: isFeatured,
      };

      const res = await fetch('/api/admin/library/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          adminSecret: adminSecret
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save video');
      }

      setSuccess(true);
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Video Publisher</h1>
            <p className="text-gray-400">Enter admin credentials to publish videos</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Secret
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin secret"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-bold text-white">Publish Video</h1>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Add New Video</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter video description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                HeyGen URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="heygen_url"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://app.heygen.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="maia, getting-started, basics"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibility
                </label>
                <select
                  name="visibility"
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Member (all)</option>
                  <option value="practitioner">Practitioner</option>
                  <option value="admin">Admin only</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-400 text-sm p-3 bg-green-900/20 rounded-lg">
                Video published successfully!
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Video'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-gray-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Generate your script in the Explainer Scripts tool</li>
            <li>Create your video in HeyGen</li>
            <li>Paste the HeyGen URL in the form above</li>
            <li>Click "Publish Video"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}