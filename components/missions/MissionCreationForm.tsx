'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Trash2, Target } from 'lucide-react';
import { Mission, MissionStatus } from '@/lib/story/types';

interface MissionCreationFormProps {
  onSuccess: (mission: Mission) => void;
  onCancel: () => void;
  initialData?: Partial<Mission>;
}

interface MilestoneInput {
  title: string;
  notes?: string;
}

const HOUSE_MEANINGS = {
  1: '🌱 Identity & New Beginnings',
  2: '🏡 Values & Resources',
  3: '💬 Communication & Learning',
  4: '🏠 Home & Roots',
  5: '🎨 Creativity & Joy',
  6: '⚡ Service & Daily Work',
  7: '🤝 Partnerships & Relationships',
  8: '🔄 Transformation & Depth',
  9: '🌟 Wisdom & Expansion',
  10: '👑 Career & Legacy',
  11: '🌐 Community & Vision',
  12: '✨ Spirituality & Transcendence'
};

const STATUS_OPTIONS: { value: MissionStatus; label: string; description: string }[] = [
  { value: 'emerging', label: 'Emerging', description: 'Vision forming, not yet active' },
  { value: 'active', label: 'Active', description: 'Currently working on this mission' },
  { value: 'urgent', label: 'Urgent', description: 'Time-sensitive or high priority' },
  { value: 'completed', label: 'Completed', description: 'Mission accomplished!' }
];

const PLANET_OPTIONS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
];

export default function MissionCreationForm({ onSuccess, onCancel, initialData }: MissionCreationFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    house: initialData?.house || 1,
    status: initialData?.status || 'emerging' as MissionStatus,
    relatedPlanets: initialData?.relatedPlanets || [],
    relatedSign: initialData?.relatedSign || '',
    targetDate: initialData?.targetDate ? initialData.targetDate.toISOString().split('T')[0] : '',
    transitContext: {
      activatingPlanet: initialData?.transitContext?.activatingPlanet || '',
      transitDescription: initialData?.transitContext?.transitDescription || ''
    }
  });

  const [milestones, setMilestones] = useState<MilestoneInput[]>(
    initialData?.milestones?.map(m => ({ title: m.title, notes: m.notes })) ||
    [{ title: '', notes: '' }]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Mission title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Mission description is required');
      }

      // Filter out empty milestones
      const validMilestones = milestones.filter(m => m.title.trim());

      const missionData = {
        ...formData,
        relatedPlanets: formData.relatedPlanets,
        targetDate: formData.targetDate || undefined,
        transitContext: formData.transitContext.activatingPlanet ? formData.transitContext : undefined,
        milestones: validMilestones
      };

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create mission');
      }

      const result = await response.json();
      onSuccess(result.mission);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', notes: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: 'title' | 'notes', value: string) => {
    const updated = milestones.map((milestone, i) =>
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setMilestones(updated);
  };

  const togglePlanet = (planet: string) => {
    const current = formData.relatedPlanets || [];
    const updated = current.includes(planet)
      ? current.filter(p => p !== planet)
      : [...current, planet];
    setFormData({ ...formData, relatedPlanets: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-jade-jade" />
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {initialData ? 'Edit Mission' : 'Create New Mission'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Mission Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Build Consciousness Platform"
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this mission means to you and what you're creating..."
            rows={3}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
            required
          />
        </div>

        {/* House & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              House (Life Area) *
            </label>
            <select
              value={formData.house}
              onChange={(e) => setFormData({ ...formData, house: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
            >
              {Object.entries(HOUSE_MEANINGS).map(([house, meaning]) => (
                <option key={house} value={house}>
                  House {house}: {meaning}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as MissionStatus })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Related Planets */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Related Planets (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {PLANET_OPTIONS.map((planet) => (
              <button
                key={planet}
                type="button"
                onClick={() => togglePlanet(planet)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.relatedPlanets?.includes(planet)
                    ? 'bg-jade-jade text-jade-abyss'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {planet}
              </button>
            ))}
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
          />
        </div>

        {/* Transit Context */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Astrological Context (Optional)
          </label>
          <input
            type="text"
            value={formData.transitContext.activatingPlanet}
            onChange={(e) => setFormData({
              ...formData,
              transitContext: { ...formData.transitContext, activatingPlanet: e.target.value }
            })}
            placeholder="e.g., Saturn in Pisces"
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
          />
          <input
            type="text"
            value={formData.transitContext.transitDescription}
            onChange={(e) => setFormData({
              ...formData,
              transitContext: { ...formData.transitContext, transitDescription: e.target.value }
            })}
            placeholder="Describe the astrological significance..."
            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-jade-jade focus:border-transparent"
          />
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Milestones
            </label>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-jade-jade text-jade-abyss rounded-lg hover:shadow-lg hover:shadow-jade-jade/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    placeholder={`Milestone ${index + 1}`}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-jade-jade focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={milestone.notes || ''}
                    onChange={(e) => updateMilestone(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-jade-jade focus:border-transparent"
                  />
                </div>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-jade-jade text-jade-abyss rounded-full font-semibold hover:shadow-lg hover:shadow-jade-jade/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-jade-abyss/30 border-t-jade-abyss rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {initialData ? 'Update Mission' : 'Create Mission'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-full font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}