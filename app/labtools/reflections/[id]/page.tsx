'use client';

/**
 * Capsule Detail Page - View/Edit a single Reflection Capsule
 *
 * Uses CapsuleEditor component with warm Soullab aesthetic.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import CapsuleEditor from '@/components/capsules/CapsuleEditor';
import type { CapsuleDTO, CapsuleUpdateInput } from '@/lib/capsules/types';

export default function CapsuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [capsule, setCapsule] = useState<CapsuleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch capsule
  const fetchCapsule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/capsules/${id}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin');
          return;
        }
        if (response.status === 404) {
          setError('Reflection not found');
          return;
        }
        throw new Error('Failed to fetch reflection');
      }

      const data = await response.json();
      setCapsule(data.capsule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCapsule();
  }, [fetchCapsule]);

  // Save changes
  const handleSave = async (patch: CapsuleUpdateInput) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const data = await response.json();
      setCapsule(data.capsule);
    } catch (err) {
      console.error('Failed to save capsule:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Bring into lab
  const handleBringIntoLab = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      const data = await response.json();
      setCapsule(data.capsule);
    } catch (err) {
      console.error('Failed to bring into lab:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Pin/unpin
  const handlePin = async (pinned: boolean) => {
    try {
      const response = await fetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      const data = await response.json();
      setCapsule(data.capsule);
    } catch (err) {
      console.error('Failed to pin capsule:', err);
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/capsules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      router.push('/labtools/reflections');
    } catch (err) {
      console.error('Failed to delete capsule:', err);
      alert('Failed to delete. Please try again.');
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button
            onClick={() => router.push('/labtools/reflections')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reflections</span>
          </button>

          <div className="text-center py-20">
            <p className="text-stone-500 text-[14px]">{error || 'Reflection not found'}</p>
            <button
              onClick={() => router.push('/labtools/reflections')}
              className="mt-4 text-[13px] text-[#5a7a6f] hover:underline"
            >
              Return to Reflections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools/reflections')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reflections</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-[12px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-[11px] text-stone-400 tracking-wide mb-6">
          <span>
            {new Date(capsule.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span>·</span>
          <span className="capitalize">{capsule.sourceType}</span>
        </div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CapsuleEditor
            capsule={capsule}
            onSave={handleSave}
            onBringIntoLab={capsule.draft ? handleBringIntoLab : undefined}
            onPin={handlePin}
            saving={saving}
          />
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-medium text-stone-800 mb-2">Delete this reflection?</h3>
              <p className="text-stone-500 text-[14px] mb-6">
                This cannot be undone. The reflection will be permanently removed.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 text-[13px] tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] tracking-wide transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
