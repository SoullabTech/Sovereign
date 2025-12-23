'use client';

/**
 * Mission Manager Component
 *
 * Manages missions and milestones for archetypal journey tracking
 */

import { useState } from 'react';
import { Mission } from '@/lib/story/types';
import { X, Target, Plus, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MissionManagerProps {
  onClose: () => void;
  initialMissions?: Mission[];
}

export default function MissionManager({ onClose, initialMissions = [] }: MissionManagerProps) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-amber-500/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-100">Mission Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {missions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No missions yet</p>
              <button className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-lg transition-colors flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Mission
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-black/30 border border-amber-500/20 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-amber-100 mb-1">
                        {mission.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{mission.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        mission.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        mission.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {mission.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        House {mission.house}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm text-amber-400 font-medium">
                        {mission.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  {mission.milestones && mission.milestones.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Milestones</h4>
                      {mission.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors"
                        >
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${
                            milestone.completed ? 'text-gray-400 line-through' : 'text-gray-300'
                          }`}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
