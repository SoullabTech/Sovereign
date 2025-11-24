"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SacredTimelineProps {
  userId: string;
  className?: string;
}

interface TimelineEntry {
  id: string;
  entry_type: 'soulprint' | 'journal';
  milestone: string;
  content_preview: string;
  reflection_content?: string;
  created_at: string;
  metadata: any;
}

const milestoneColors = {
  'first-bloom': 'from-pink-500 to-rose-400',
  'pattern-keeper': 'from-amber-500 to-violet-400', 
  'depth-seeker': 'from-blue-500 to-indigo-400',
  'sacred-gardener': 'from-green-500 to-emerald-400',
  'wisdom-keeper': 'from-amber-500 to-yellow-400'
};

const milestoneNames = {
  'first-bloom': '🌱 First Bloom',
  'pattern-keeper': '🌸 Pattern Keeper',
  'depth-seeker': '🌺 Depth Seeker', 
  'sacred-gardener': '🌻 Sacred Gardener',
  'wisdom-keeper': '🌟 Wisdom Keeper'
};

const entryTypeConfig = {
  soulprint: {
    icon: '🌸',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-400/30'
  },
  journal: {
    icon: '📖',
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-400/30'
  }
};

export default function SacredTimeline({ userId, className }: SacredTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSacredTimeline = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/sacred-timeline?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setTimeline(data.timeline);
        } else {
          setError(data.error || 'Failed to load timeline');
        }
      } catch (err) {
        console.error('Timeline loading error:', err);
        setError('Unable to connect to sacred memory');
      } finally {
        setLoading(false);
      }
    };
    
    loadSacredTimeline();
  }, [userId]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <motion.div
          className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center p-8 text-red-400", className)}>
        <p>Unable to load sacred timeline</p>
        <p className="text-sm text-white/60 mt-2">{error}</p>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className={cn("text-center p-8 text-white/60", className)}>
        <p>Your sacred journey begins here</p>
        <p className="text-sm mt-2">Create your first soulprint to see your timeline unfold</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-light text-white/90">Sacred Timeline</h3>
        <p className="text-white/60 text-sm">
          {timeline.filter(e => e.entry_type === 'soulprint').length} soulprints • {timeline.filter(e => e.entry_type === 'journal').length} reflections
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Central axis line */}
        <div className="absolute left-4 w-px bg-gradient-to-b from-amber-400/30 via-green-400/30 to-amber-400/30 h-full" />
        
        {/* Timeline entries */}
        <div className="space-y-6">
          {timeline.map((entry, index) => {
            const typeConfig = entryTypeConfig[entry.entry_type];
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline node */}
                <div className={cn(
                  "absolute left-2 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center text-xs",
                  typeConfig.borderColor,
                  typeConfig.bgColor
                )}>
                  {typeConfig.icon}
                </div>
                
                {/* Entry card */}
                <motion.div
                  className={cn(
                    "bg-black/40 backdrop-blur-lg border rounded-2xl p-6 cursor-pointer",
                    typeConfig.borderColor,
                    "hover:border-white/40 transition-colors"
                  )}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("font-medium", typeConfig.color)}>
                        {entry.entry_type === 'soulprint' ? 
                          (milestoneNames[entry.milestone as keyof typeof milestoneNames] || entry.milestone) :
                          'Sacred Reflection'
                        }
                      </h4>
                    </div>
                    <span className="text-xs text-white/50">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Content preview */}
                  <div className="text-white/80 text-sm mb-3">
                    {entry.entry_type === 'soulprint' ? (
                      <div className="flex items-center gap-4">
                        <span>Coherence: {parseFloat(entry.content_preview) ? Math.round(parseFloat(entry.content_preview) * 100) + '%' : 'N/A'}</span>
                        {entry.metadata?.elemental_balance && (
                          <span className="text-white/60">• Elemental harmony achieved</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="italic text-white/60 mb-2">"{entry.content_preview.substring(0, 60)}..."</p>
                        {entry.reflection_content && (
                          <p className="text-white/80 line-clamp-2">
                            {entry.reflection_content.substring(0, 120)}...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    {entry.entry_type === 'journal' ? (
                      <div className="flex items-center gap-3">
                        <span>{entry.metadata?.word_count || 0} words</span>
                        {entry.metadata?.quality && (
                          <span className="capitalize">• {entry.metadata.quality}</span>
                        )}
                        {entry.metadata?.active_facets?.length > 0 && (
                          <span>• {entry.metadata.active_facets.length} facets active</span>
                        )}
                      </div>
                    ) : (
                      <span>Soulprint captured</span>
                    )}
                    <span className="text-amber-400/70">View details →</span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-black/80 backdrop-blur-lg border border-white/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">{entryTypeConfig[selectedEntry.entry_type].icon}</span>
                  <h3 className="text-2xl font-light text-white">
                    {selectedEntry.entry_type === 'soulprint' ? 
                      (milestoneNames[selectedEntry.milestone as keyof typeof milestoneNames] || selectedEntry.milestone) :
                      'Sacred Reflection'
                    }
                  </h3>
                </div>
                <p className="text-white/60">
                  {new Date(selectedEntry.created_at).toLocaleString()}
                </p>
              </div>

              {/* Content details */}
              <div className="space-y-6">
                {selectedEntry.entry_type === 'soulprint' ? (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Soulprint Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80">Coherence Level</span>
                        <span className="text-amber-400 font-medium">
                          {parseFloat(selectedEntry.content_preview) ? Math.round(parseFloat(selectedEntry.content_preview) * 100) + '%' : 'N/A'}
                        </span>
                      </div>
                      
                      {selectedEntry.metadata?.elemental_balance && (
                        <div>
                          <h5 className="text-white/80 mb-3">Elemental Balance</h5>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(selectedEntry.metadata.elemental_balance).map(([element, value]) => (
                              <div key={element} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-white/70 capitalize">{element}</span>
                                  <span className="text-sm text-white/60">{Math.round(value * 100)}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      element === 'fire' ? 'bg-red-400' :
                                      element === 'water' ? 'bg-blue-400' :
                                      element === 'earth' ? 'bg-green-400' :
                                      element === 'air' ? 'bg-sky-400' :
                                      'bg-amber-400'
                                    )}
                                    style={{ width: `${value * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Journal Reflection</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-400/20 rounded-lg">
                        <h5 className="text-green-400 font-medium mb-2">Prompt</h5>
                        <p className="text-white/80 italic">"{selectedEntry.content_preview}"</p>
                      </div>
                      
                      {selectedEntry.reflection_content && (
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h5 className="text-white/80 font-medium mb-3">Your Reflection</h5>
                          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                            {selectedEntry.reflection_content}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{selectedEntry.metadata?.word_count || 0} words</span>
                        {selectedEntry.metadata?.quality && (
                          <span className="capitalize">• {selectedEntry.metadata.quality} reflection</span>
                        )}
                        {selectedEntry.metadata?.active_facets?.length > 0 && (
                          <span>• {selectedEntry.metadata.active_facets.length} facets active</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Close button */}
                <div className="text-center pt-6">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}