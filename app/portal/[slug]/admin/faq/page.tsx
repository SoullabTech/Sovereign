"use client";

/**
 * FAQ MANAGEMENT PAGE
 *
 * Manage FAQs with categories, drag-drop reordering
 * Quick win for building client trust
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Reorder } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import type { PractitionerFAQ, FAQCategory } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  warning: '#E5A858',
  error: '#D98B8B',
};

const categoryLabels: Record<FAQCategory, string> = {
  about_sessions: 'About Sessions',
  booking_scheduling: 'Booking & Scheduling',
  astrology_questions: 'Astrology Questions',
  payments: 'Payments',
  about_practitioner: 'About Me',
  general: 'General',
};

const categoryOrder: FAQCategory[] = [
  'about_sessions',
  'booking_scheduling',
  'astrology_questions',
  'payments',
  'about_practitioner',
  'general',
];

interface FAQItemProps {
  faq: PractitionerFAQ;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

function FAQItem({ faq, onEdit, onDelete, onTogglePublish }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Reorder.Item
      value={faq}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: colors.nebula,
        border: `1px solid ${faq.is_published ? colors.stardust : colors.warning}40`,
        opacity: faq.is_published ? 1 : 0.7,
      }}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="cursor-grab pt-1" style={{ color: colors.dim }}>
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-1 text-left flex items-center space-x-2"
              >
                <p className="font-medium text-sm" style={{ color: colors.starlight }}>
                  {faq.question}
                </p>
                {expanded ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: colors.dim }} />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: colors.dim }} />
                )}
              </button>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={onTogglePublish}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: faq.is_published ? `${colors.success}20` : `${colors.warning}20`,
                    color: faq.is_published ? colors.success : colors.warning,
                  }}
                  title={faq.is_published ? 'Published' : 'Draft'}
                >
                  {faq.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={onEdit}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: `${colors.stardust}50`, color: colors.muted }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: colors.dim }}>
              {categoryLabels[faq.category]}
            </p>
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pl-7"
          >
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: colors.muted }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </div>
    </Reorder.Item>
  );
}

interface FAQFormData {
  question: string;
  answer: string;
  category: FAQCategory;
  is_published: boolean;
}

export default function FAQManagementPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { practitionerId } = usePractitionerAuth();

  const [faqs, setFaqs] = useState<PractitionerFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingFaq, setEditingFaq] = useState<PractitionerFAQ | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FAQFormData>({
    question: '',
    answer: '',
    category: 'general',
    is_published: true,
  });

  useEffect(() => {
    if (practitionerId) {
      fetchFAQs();
    }
  }, [practitionerId]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/portal/${slug}/faq`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error('[FAQ] Error:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const saveFAQ = async () => {
    try {
      setSaving(true);
      const url = editingFaq
        ? `/api/portal/${slug}/faq/${editingFaq.id}`
        : `/api/portal/${slug}/faq`;
      const method = editingFaq ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          practitionerId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save FAQ');

      await fetchFAQs();
      closeForm();
    } catch (err) {
      console.error('[FAQ] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/portal/${slug}/faq/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practitionerId }),
      });

      if (!response.ok) throw new Error('Failed to delete FAQ');
      await fetchFAQs();
    } catch (err) {
      console.error('[FAQ] Delete error:', err);
    }
  };

  const togglePublish = async (faq: PractitionerFAQ) => {
    try {
      const response = await fetch(`/api/portal/${slug}/faq/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          is_published: !faq.is_published,
        }),
      });

      if (!response.ok) throw new Error('Failed to update FAQ');
      await fetchFAQs();
    } catch (err) {
      console.error('[FAQ] Toggle error:', err);
    }
  };

  const handleReorder = async (category: FAQCategory, newOrder: PractitionerFAQ[]) => {
    // Update local state immediately
    const updatedFaqs = faqs.map(faq => {
      if (faq.category !== category) return faq;
      const newIndex = newOrder.findIndex(f => f.id === faq.id);
      return { ...faq, display_order: newIndex };
    });
    setFaqs(updatedFaqs);

    // Save to server
    try {
      await fetch(`/api/portal/${slug}/faq/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          category,
          order: newOrder.map(f => f.id),
        }),
      });
    } catch (err) {
      console.error('[FAQ] Reorder error:', err);
      fetchFAQs(); // Revert on error
    }
  };

  const openEditForm = (faq: PractitionerFAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
    });
    setShowForm(true);
  };

  const openNewForm = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      is_published: true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      is_published: true,
    });
  };

  // Group FAQs by category
  const faqsByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = faqs
      .filter(f => f.category === category)
      .sort((a, b) => a.display_order - b.display_order);
    return acc;
  }, {} as Record<FAQCategory, PractitionerFAQ[]>);

  // Use portal path for public FAQ link
  const portalUrl = `/portal/${slug}/faq`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-lg animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}40` }}
      >
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.error }} />
        <p style={{ color: colors.error }}>{error}</p>
        <button
          onClick={fetchFAQs}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.gold, color: colors.void }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-display flex items-center space-x-3"
            style={{ color: colors.starlight }}
          >
            <HelpCircle className="w-7 h-7" style={{ color: colors.gold }} />
            <span>FAQ Management</span>
          </h1>
          <p className="mt-1" style={{ color: colors.muted }}>
            {faqs.length} questions · {faqs.filter(f => f.is_published).length} published
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm"
            style={{ backgroundColor: `${colors.stardust}50`, color: colors.muted }}
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public FAQ</span>
          </a>
          <button
            onClick={openNewForm}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: colors.gold, color: colors.void }}
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* FAQ Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={closeForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl p-6"
            style={{ backgroundColor: colors.cosmos, border: `1px solid ${colors.stardust}` }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium" style={{ color: colors.starlight }}>
                {editingFaq ? 'Edit FAQ' : 'New FAQ'}
              </h2>
              <button onClick={closeForm} style={{ color: colors.dim }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: colors.dim }}>
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: colors.nebula,
                    color: colors.starlight,
                    border: `1px solid ${colors.stardust}`,
                  }}
                  placeholder="What question do clients often ask?"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: colors.dim }}>
                  Answer
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                  style={{
                    backgroundColor: colors.nebula,
                    color: colors.starlight,
                    border: `1px solid ${colors.stardust}`,
                  }}
                  placeholder="Your answer..."
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: colors.dim }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FAQCategory })}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: colors.nebula,
                    color: colors.starlight,
                    border: `1px solid ${colors.stardust}`,
                  }}
                >
                  {categoryOrder.map(cat => (
                    <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm" style={{ color: colors.muted }}>
                  Publish immediately
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: colors.muted }}
              >
                Cancel
              </button>
              <button
                onClick={saveFAQ}
                disabled={saving || !formData.question || !formData.answer}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: colors.gold, color: colors.void }}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* FAQ List by Category */}
      {faqs.length > 0 ? (
        <div className="space-y-8">
          {categoryOrder.map(category => {
            const categoryFaqs = faqsByCategory[category];
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
                  {categoryLabels[category]}
                </h3>
                <Reorder.Group
                  values={categoryFaqs}
                  onReorder={(newOrder) => handleReorder(category, newOrder)}
                  className="space-y-2"
                >
                  {categoryFaqs.map(faq => (
                    <FAQItem
                      key={faq.id}
                      faq={faq}
                      onEdit={() => openEditForm(faq)}
                      onDelete={() => deleteFAQ(faq.id)}
                      onTogglePublish={() => togglePublish(faq)}
                    />
                  ))}
                </Reorder.Group>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
          <p className="text-lg mb-2" style={{ color: colors.muted }}>
            No FAQs yet
          </p>
          <p className="text-sm mb-6" style={{ color: colors.dim }}>
            Add frequently asked questions to help clients understand your services
          </p>
          <button
            onClick={openNewForm}
            className="px-6 py-3 rounded-lg font-medium"
            style={{ backgroundColor: colors.gold, color: colors.void }}
          >
            Add Your First FAQ
          </button>
        </div>
      )}
    </div>
  );
}
