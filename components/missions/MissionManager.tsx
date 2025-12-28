'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Mission } from '@/lib/story/types';
import MissionCreationForm from './MissionCreationForm';

interface MissionManagerProps {
  onClose: () => void;
  onMissionUpdate?: () => void;
}

const STATUS_COLORS = {
  emerging: 'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  active: 'border-green-300 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  urgent: 'border-red-300 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200',
  completed: 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
};

const STATUS_ICONS = {
  emerging: AlertCircle,
  active: Clock,
  urgent: AlertCircle,
  completed: CheckCircle
};

export default function MissionManager({ onClose, onMissionUpdate }: MissionManagerProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [deletingMission, setDeletingMission] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/missions');

      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }

      const data = await response.json();
      setMissions(data.missions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleCreateSuccess = (newMission: Mission) => {
    setMissions([newMission, ...missions]);
    setShowCreateForm(false);
    onMissionUpdate?.();
  };

  const handleEditSuccess = (updatedMission: Mission) => {
    setMissions(missions.map(m => m.id === updatedMission.id ? updatedMission : m));
    setEditingMission(null);
    onMissionUpdate?.();
  };

  const handleDelete = async (missionId: string) => {
    if (!confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingMission(missionId);
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      setMissions(missions.filter(m => m.id !== missionId));
      onMissionUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mission');
    } finally {
      setDeletingMission(null);
    }
  };

  const toggleMilestone = async (mission: Mission, milestoneIndex: number) => {
    const milestone = mission.milestones[milestoneIndex];
    const updatedMilestone = {
      ...milestone,
      completed: !milestone.completed,
      completedDate: !milestone.completed ? new Date() : undefined
    };

    try {
      const response = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: updatedMilestone.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      // Update local state
      const updatedMilestones = [...mission.milestones];
      updatedMilestones[milestoneIndex] = updatedMilestone;

      const updatedMission = {
        ...mission,
        milestones: updatedMilestones,
        // Update progress based on completed milestones
        progress: Math.round((updatedMilestones.filter(m => m.completed).length / updatedMilestones.length) * 100)
      };

      setMissions(missions.map(m => m.id === mission.id ? updatedMission : m));
      onMissionUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <MissionCreationForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (editingMission) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <MissionCreationForm
          initialData={editingMission}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingMission(null)}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-jade-jade" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Mission Control
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-jade-jade text-jade-abyss rounded-full font-medium hover:shadow-lg hover:shadow-jade-jade/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Mission
            </button>
            <button
              onClick={onClose}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-jade-jade/30 border-t-jade-jade rounded-full animate-spin" />
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              No missions yet
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Create your first mission to start tracking your consciousness journey
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-jade-jade text-jade-abyss rounded-full font-medium hover:shadow-lg hover:shadow-jade-jade/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Your First Mission
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const StatusIcon = STATUS_ICONS[mission.status];

              return (
                <motion.div
                  key={mission.id}
                  layout
                  className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                          {mission.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[mission.status]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          House {mission.house}
                        </span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 mb-3">
                        {mission.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          <span>Progress</span>
                          <span>{mission.progress}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div
                            className="bg-jade-jade h-2 rounded-full transition-all duration-300"
                            style={{ width: `${mission.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones */}
                      {mission.milestones.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                            Milestones ({mission.milestones.filter(m => m.completed).length}/{mission.milestones.length})
                          </h4>
                          <div className="space-y-1">
                            {mission.milestones.slice(0, 3).map((milestone, index) => (
                              <div
                                key={milestone.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <button
                                  onClick={() => toggleMilestone(mission, index)}
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                    milestone.completed
                                      ? 'bg-jade-jade border-jade-jade text-jade-abyss'
                                      : 'border-neutral-300 dark:border-neutral-600 hover:border-jade-jade'
                                  }`}
                                >
                                  {milestone.completed && <CheckCircle className="w-3 h-3" />}
                                </button>
                                <span className={milestone.completed ? 'line-through text-neutral-500' : 'text-neutral-700 dark:text-neutral-300'}>
                                  {milestone.title}
                                </span>
                              </div>
                            ))}
                            {mission.milestones.length > 3 && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-6">
                                +{mission.milestones.length - 3} more milestones
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>Created: {formatDate(mission.createdAt)}</span>
                        {mission.targetDate && (
                          <span>Target: {formatDate(mission.targetDate)}</span>
                        )}
                        {mission.completedDate && (
                          <span>Completed: {formatDate(mission.completedDate)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingMission(mission)}
                        className="p-2 text-neutral-500 hover:text-jade-jade hover:bg-jade-jade/10 rounded-lg transition-colors"
                        title="Edit mission"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mission.id)}
                        disabled={deletingMission === mission.id}
                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete mission"
                      >
                        {deletingMission === mission.id ? (
                          <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}