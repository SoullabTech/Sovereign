'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Code, Zap, Clock } from 'lucide-react';

interface ShapingDebugPanelProps {
  rawText: string;
  shapedText: string;
  element: string;
  shapingApplied: boolean;
  shapingTime: number;
  shapingTags: string[];
  prosody: any;
  isVisible?: boolean;
}

export const ShapingDebugPanel: React.FC<ShapingDebugPanelProps> = ({
  rawText,
  shapedText,
  element,
  shapingApplied,
  shapingTime,
  shapingTags,
  prosody,
  isVisible = process.env.NODE_ENV === 'development'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const shapingDiff = shapedText.length - rawText.length;
  const hasShapingTags = shapingTags.some(tag => 
    tag.includes('PAUSES:') || tag.includes('EMPHASIS:') || tag.includes('BREATH:')
  );

  return (
    <motion.div
      className="fixed bottom-4 right-4 w-96 bg-black/95 backdrop-blur-md rounded-lg shadow-2xl border border-amber-500/30 text-white font-mono text-xs z-50"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-amber-500/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-amber-300">Sesame CI Shaping</span>
        </div>
        
        <div className="flex items-center gap-2">
          {shapingApplied && (
            <div className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs">EMBODIED</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{shapingTime}ms</span>
          </div>
          
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3">
              
              {/* Status Bar */}
              <div className="flex items-center justify-between p-2 bg-amber-900/20 rounded border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    shapingApplied ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  <span className="text-amber-300 font-semibold">
                    {element.toUpperCase()} Element
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-gray-400">Shaping Delta</div>
                  <div className={`font-semibold ${shapingDiff > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {shapingDiff > 0 ? '+' : ''}{shapingDiff} chars
                  </div>
                </div>
              </div>

              {/* Before/After Text Comparison */}
              <div className="space-y-2">
                <div>
                  <div className="text-gray-400 mb-1 flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    Raw Maya Text:
                  </div>
                  <div className="p-2 bg-gray-800/50 rounded border border-gray-600 text-gray-300 leading-relaxed">
                    "{rawText}"
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-amber-400 font-bold">
                    ⬇ SESAME CI SHAPING ⬇
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Shaped Text:
                  </div>
                  <div className="p-2 bg-amber-900/20 rounded border border-amber-500/30 text-white leading-relaxed">
                    "{highlightShapingTags(shapedText)}"
                  </div>
                </div>
              </div>

              {/* Shaping Tags Analysis */}
              {hasShapingTags && (
                <div>
                  <div className="text-gray-400 mb-2">Prosody Tags Applied:</div>
                  <div className="flex flex-wrap gap-1">
                    {shapingTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs border border-amber-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Elemental Prosody Settings */}
              <div>
                <div className="text-gray-400 mb-2">Elemental Prosody:</div>
                <div className="p-2 bg-gray-800/30 rounded border border-gray-600 space-y-1">
                  {Object.entries(prosody || {}).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key}:</span>
                      <span className="text-white font-medium">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-700">
                <span>Sacred Tech Processing</span>
                <span className="text-amber-400">
                  {shapingApplied ? '✨ Embodied' : '⚠️ Raw'}
                </span>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper function to highlight shaping tags in text
function highlightShapingTags(text: string): React.ReactNode {
  // This is a simplified version - in a real implementation you'd want proper JSX parsing
  return text.replace(/<(pause-\d+ms|emphasis[^>]*|breath[^>]*|pace[^>]*)>/g, 
    '<span style="color: #a855f7; font-weight: bold;">$&</span>'
  );
}