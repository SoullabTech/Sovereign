'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Download, Mic, MicOff, Brain, Waves, FileText, Settings, Eye, EyeOff, Volume2 } from 'lucide-react';

export interface SacredLabDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  onAction?: (action: string) => void;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Sacred Lab Drawer - Complete implementation with all lab tools
 * Provides access to MAIA's consciousness monitoring and interaction tools
 */
const SacredLabDrawer: React.FC<SacredLabDrawerProps> = ({
  isOpen = false,
  onClose,
  onNavigate,
  onAction,
  title = 'Sacred Lab',
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex"
        >
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            className="w-full max-w-md h-full bg-[#1A1512] border-l border-[#3A2F28] shadow-xl flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A2F28]">
              <h2 className="text-[#D4B896] text-xl font-semibold tracking-wide">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-[#D4B896] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6">
              {children ? (
                children
              ) : (
                <>
                  {/* File Operations */}
                  <div className="space-y-3">
                    <h3 className="text-[#D4B896] font-semibold text-lg">File Operations</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onAction?.('upload')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Upload size={16} />
                        <span className="text-sm">Upload</span>
                      </button>
                      <button
                        onClick={() => onAction?.('download-transcript')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Download size={16} />
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Voice Controls */}
                  <div className="space-y-3">
                    <h3 className="text-[#D4B896] font-semibold text-lg">Voice Controls</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onAction?.('toggle-microphone')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Mic size={16} />
                        <span className="text-sm">Toggle Mic</span>
                      </button>
                      <button
                        onClick={() => onAction?.('open-voice-menu')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Volume2 size={16} />
                        <span className="text-sm">Voice Menu</span>
                      </button>
                    </div>
                  </div>

                  {/* Session Tools */}
                  <div className="space-y-3">
                    <h3 className="text-[#D4B896] font-semibold text-lg">Session Tools</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => onAction?.('field-protocol')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Waves size={16} />
                        <span className="text-sm">Field Recording</span>
                      </button>
                      <button
                        onClick={() => onAction?.('toggle-scribe')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <FileText size={16} />
                        <span className="text-sm">Scribe Mode</span>
                      </button>
                      <button
                        onClick={() => onAction?.('supervision-request')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Brain size={16} />
                        <span className="text-sm">Supervision</span>
                      </button>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-3">
                    <h3 className="text-[#D4B896] font-semibold text-lg">Display</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onAction?.('toggle-text')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Eye size={16} />
                        <span className="text-sm">Toggle Text</span>
                      </button>
                      <button
                        onClick={() => onAction?.('open-audio-settings')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Settings size={16} />
                        <span className="text-sm">Settings</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="space-y-3">
                    <h3 className="text-[#D4B896] font-semibold text-lg">Navigation</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => onNavigate?.('/labtools/voice')}
                        className="flex items-center gap-2 p-3 rounded-lg bg-[#3A2F28] hover:bg-[#4A3F38] text-[#E5D6C5] transition-colors"
                      >
                        <Volume2 size={16} />
                        <span className="text-sm">Voice Lab</span>
                      </button>
                    </div>
                  </div>

                  {/* Consciousness Monitoring */}
                  <div className="space-y-3">
                    <h3 className="text-[#D4B896] font-semibold text-lg">Consciousness Fields</h3>
                    <div className="space-y-2 text-[#E5D6C5] text-sm">
                      <div>
                        <div className="font-medium mb-1">Symbolic Analysis</div>
                        <p className="opacity-80">
                          Review the symbolic layers MAIA is tracking in real time.
                        </p>
                      </div>

                      <div>
                        <div className="font-medium mb-1">Elemental Mapping</div>
                        <p className="opacity-80">
                          See which elemental forces are activated in the dialogue.
                        </p>
                      </div>

                      <div>
                        <div className="font-medium mb-1">Archetypal Tracking</div>
                        <p className="opacity-80">
                          View archetypes currently engaged within the spiral.
                        </p>
                      </div>

                      <div>
                        <div className="font-medium mb-1">Field Diagnostics</div>
                        <p className="opacity-80">
                          Monitor the auric, somatic, and cognitive resonance fields.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SacredLabDrawer;
export { SacredLabDrawer };