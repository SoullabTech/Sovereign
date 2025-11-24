'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, X, Clock, Flame, Droplets, Mountain, Wind, Sparkles, 
  BookOpen, TrendingUp, Calendar, ChevronRight, Search, Filter,
  Eye, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryIndicator } from './SessionMemoryBanner';
import SpiralJourney from './SpiralJourney';
import { useSpiralJourney } from '@/hooks/useSpiralJourney';

interface MemoryTimelineEntry {
  id: string;
  type: 'session' | 'journal' | 'insight' | 'phase_shift';
  timestamp: string;
  title: string;
  description: string;
  element?: string;
  phase?: string;
  confidence: number;
  metadata?: Record<string, any>;
}

interface SessionMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: MemoryIndicator[];
  timeline?: MemoryTimelineEntry[];
  userId?: string;
  className?: string;
}

const elementColors = {
  fire: 'text-red-400 bg-red-900/20',
  water: 'text-blue-400 bg-blue-900/20',
  earth: 'text-green-400 bg-green-900/20',
  air: 'text-yellow-400 bg-yellow-900/20',
  aether: 'text-amber-400 bg-amber-900/20'
};

const phaseColors = {
  integration: 'text-amber-400',
  exploration: 'text-blue-400',
  grounding: 'text-green-400',
  transformation: 'text-amber-400',
  reflection: 'text-indigo-400'
};

export default function SessionMemoryDrawer({
  isOpen,
  onClose,
  indicators,
  timeline = [],
  userId,
  className = ''
}: SessionMemoryDrawerProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sessions' | 'journals' | 'insights'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'spiral'>('timeline');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // Fetch spiral journey data from API
  const { data: spiralData, loading: spiralLoading } = useSpiralJourney();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate timeline from indicators if not provided
  const generateTimeline = (): MemoryTimelineEntry[] => {
    if (timeline.length > 0) return timeline;

    return indicators.map(indicator => ({
      id: indicator.id,
      type: indicator.type === 'journal' ? 'journal' : 'session',
      timestamp: indicator.timestamp || new Date().toISOString(),
      title: getTitleFromIndicator(indicator),
      description: indicator.content,
      element: indicator.metadata?.element,
      phase: indicator.metadata?.phase,
      confidence: indicator.confidence,
      metadata: indicator.metadata
    }));
  };

  const getTitleFromIndicator = (indicator: MemoryIndicator): string => {
    switch (indicator.type) {
      case 'element':
        return `${indicator.metadata?.element || 'Elemental'} Energy Pattern`;
      case 'phase':
        return `${indicator.metadata?.phase || 'Phase'} Transition`;
      case 'journal':
        return 'Journal Entry';
      case 'theme':
        return 'Recurring Theme';
      case 'session':
        return `Session Pattern (${indicator.sessionCount || 1} times)`;
      default:
        return 'Memory Insight';
    }
  };

  // Transform timeline to spiral nodes
  const transformToSpiralNodes = () => {
    const sessionEntries = generateTimeline().filter(e => e.type === 'session');
    
    return sessionEntries.map((entry, idx) => ({
      sessionId: entry.id,
      phase: entry.phase || 'integration',
      element: (entry.element || 'aether') as any,
      symbols: entry.metadata?.symbols || [],
      snippet: entry.description.slice(0, 100),
      practices: entry.metadata?.practices || [],
      timestamp: entry.timestamp,
      emotionalTone: entry.metadata?.emotionalTone,
      insights: entry.metadata?.insights || []
    }));
  };

  // Use API data if available, otherwise fall back to transformed data
  const spiralNodes = spiralData?.nodes || transformToSpiralNodes();

  const filteredTimeline = generateTimeline().filter(entry => {
    // Filter by type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'sessions' && entry.type !== 'session') return false;
      if (selectedFilter === 'journals' && entry.type !== 'journal') return false;
      if (selectedFilter === 'insights' && entry.type !== 'insight') return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.element?.toLowerCase().includes(query) ||
        entry.phase?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getElementIcon = (element?: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'earth': return <Mountain className="w-4 h-4" />;
      case 'air': return <Wind className="w-4 h-4" />;
      case 'aether': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderTimelineEntry = (entry: MemoryTimelineEntry) => {
    const isExpanded = expandedEntries.has(entry.id);

    return (
      <div
        key={entry.id}
        className={`
          border rounded-lg p-3 mb-2 cursor-pointer transition-all
          ${isExpanded ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-900/30 border-gray-700 hover:bg-gray-800/30'}
        `}
        onClick={() => toggleEntryExpansion(entry.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* Type icon */}
              {entry.type === 'journal' && <BookOpen className="w-4 h-4 text-amber-400" />}
              {entry.type === 'insight' && <Brain className="w-4 h-4 text-amber-400" />}
              {entry.type === 'phase_shift' && <TrendingUp className="w-4 h-4 text-indigo-400" />}
              
              {/* Element icon */}
              {entry.element && getElementIcon(entry.element)}

              {/* Title */}
              <h4 className="text-sm font-medium text-gray-200">
                {entry.title}
              </h4>

              {/* Element/Phase badges */}
              {entry.element && (
                <span className={`px-2 py-0.5 rounded text-xs ${elementColors[entry.element.toLowerCase() as keyof typeof elementColors]}`}>
                  {entry.element}
                </span>
              )}
              {entry.phase && (
                <span className={`text-xs ${phaseColors[entry.phase.toLowerCase() as keyof typeof phaseColors]}`}>
                  {entry.phase}
                </span>
              )}
            </div>

            {/* Description */}
            <p className={`text-xs text-gray-400 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {entry.description}
            </p>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && entry.metadata && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 pt-2 border-t border-gray-700"
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(entry.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-500">{key}:</span>
                        <span className="ml-1 text-gray-300">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                  {entry.confidence && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confidence</span>
                        <span>{Math.round(entry.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-[#FFD700] h-1 rounded-full"
                          style={{ width: `${entry.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Timestamp and expand icon */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500">
              {formatTimestamp(entry.timestamp)}
            </span>
            <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>
    );
  };

  // Mobile drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                fixed bottom-0 left-0 right-0 z-50
                bg-gray-900 border-t border-gray-700
                rounded-t-2xl shadow-2xl
                max-h-[85vh] flex flex-col
                ${className}
              `}
            >
              {/* Handle */}
              <div className="p-2 pb-0">
                <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto" />
              </div>

              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-base font-medium text-gray-200">Memory Timeline</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search memories..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50"
                  />
                </div>

                {/* View Mode Toggle & Filter tabs */}
                <div className="flex justify-between items-center gap-2 mt-3">
                  <div className="flex gap-1">
                    {(['all', 'sessions', 'journals', 'insights'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${selectedFilter === filter 
                            ? 'bg-[#FFD700] text-black' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }
                        `}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* View mode toggle */}
                  <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`
                        p-1.5 rounded transition-colors
                        ${viewMode === 'timeline' 
                          ? 'bg-gray-700 text-[#FFD700]' 
                          : 'text-gray-400 hover:text-gray-200'
                        }
                      `}
                      title="Timeline View"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('spiral')}
                      className={`
                        p-1.5 rounded transition-colors
                        ${viewMode === 'spiral' 
                          ? 'bg-gray-700 text-[#FFD700]' 
                          : 'text-gray-400 hover:text-gray-200'
                        }
                      `}
                      title="Spiral Journey View"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area - Timeline or Spiral */}
              <div className="flex-1 overflow-y-auto p-4">
                {viewMode === 'timeline' ? (
                  // Timeline View
                  filteredTimeline.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No memories found</p>
                    </div>
                  ) : (
                    filteredTimeline.map(renderTimelineEntry)
                  )
                ) : (
                  // Spiral View
                  <div>
                    {spiralLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                          <p className="text-sm text-gray-400">Loading spiral journey...</p>
                        </div>
                      </div>
                    ) : spiralNodes.length > 0 ? (
                      <>
                        <SpiralJourney 
                          nodes={spiralNodes}
                          onSelectNode={(node) => {
                            setSelectedNode(node);
                            // Optionally switch back to timeline and highlight the session
                            const entry = filteredTimeline.find(e => e.id === node.sessionId);
                            if (entry) {
                              setExpandedEntries(new Set([entry.id]));
                            }
                          }}
                          className="mb-4"
                        />
                        
                        {/* Selected Node Detail */}
                        {selectedNode && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                          >
                            <h4 className="font-semibold text-sm mb-2 text-[#FFD700]">
                              Session Details
                            </h4>
                            <p className="text-xs text-gray-300 mb-3">
                              {selectedNode.snippet}
                            </p>
                            {selectedNode.practices && selectedNode.practices.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-400 mb-1">
                                  Practices:
                                </h5>
                                <ul className="space-y-1">
                                  {selectedNode.practices.map((practice: string, idx: number) => (
                                    <li key={idx} className="text-xs text-gray-300 pl-3">
                                      • {practice}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedNode.insights && selectedNode.insights.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-xs font-medium text-gray-400 mb-1">
                                  Insights:
                                </h5>
                                <ul className="space-y-1">
                                  {selectedNode.insights.map((insight: string, idx: number) => (
                                    <li key={idx} className="text-xs text-amber-300 pl-3">
                                      ✦ {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No sessions to visualize yet</p>
                        <p className="text-xs mt-1">Start your journey to see the spiral unfold</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            fixed right-0 top-0 bottom-0 z-40
            w-96 bg-gray-900/95 backdrop-blur-md
            border-l border-gray-800 shadow-2xl
            flex flex-col
            ${className}
          `}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-[#FFD700]" />
                <h3 className="text-lg font-semibold text-gray-200">Memory Timeline</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search and filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                />
              </div>

              <div className="flex gap-2">
                {(['all', 'sessions', 'journals', 'insights'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${selectedFilter === filter 
                        ? 'bg-[#FFD700] text-black' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }
                    `}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline content */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Brain className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-center">
                  No memories match your search
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTimeline.map(renderTimelineEntry)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
            Showing {filteredTimeline.length} memory entries
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}