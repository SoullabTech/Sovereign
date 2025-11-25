'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, SkipForward, AlertTriangle, X } from 'lucide-react';

interface EscapeHatchProps {
  onPause: () => void;
  onChangeTopic: () => void;
  onTooIntense: () => void;
  isVisible?: boolean;
}

export default function EscapeHatch({
  onPause,
  onChangeTopic,
  onTooIntense,
  isVisible = true
}: EscapeHatchProps) {
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);

  const handlePause = () => {
    setShowBreathingExercise(true);
    onPause();
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-6 bottom-24 z-40"
          >
            <div className="flex flex-col space-y-2">
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/90 transition-all group"
                title="Take a break"
              >
                <Pause className="w-4 h-4 text-blue-400" />
                <span className="text-sm hidden group-hover:inline">I need a break</span>
              </button>

              <button
                onClick={onChangeTopic}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/90 transition-all group"
                title="Change topic"
              >
                <SkipForward className="w-4 h-4 text-green-400" />
                <span className="text-sm hidden group-hover:inline">Change topic</span>
              </button>

              <button
                onClick={onTooIntense}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/90 transition-all group"
                title="Too intense"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm hidden group-hover:inline">Too intense</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathingExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 rounded-2xl p-8 max-w-md w-full mx-4 border border-blue-500/20"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-blue-400">Take a Moment</h3>
                <button
                  onClick={() => setShowBreathingExercise(false)}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300 text-sm">
                  Let's pause together. Follow this breathing pattern to recenter:
                </p>

                <div className="relative h-32 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1.5, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      times: [0, 0.25, 0.75, 1],
                    }}
                    className="absolute w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        times: [0, 0.25, 0.75, 1],
                      }}
                      className="text-blue-400 text-sm font-medium"
                    >
                      <motion.span
                        animate={{
                          opacity: [1, 0, 0, 0, 0, 0, 0, 1],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875],
                        }}
                      >
                        Breathe In
                      </motion.span>
                      <motion.span
                        animate={{
                          opacity: [0, 0, 1, 1, 0, 0, 0, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          times: [0, 0.125, 0.25, 0.5, 0.625, 0.75, 0.875, 1],
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        Hold
                      </motion.span>
                      <motion.span
                        animate={{
                          opacity: [0, 0, 0, 0, 0, 1, 1, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.875, 1],
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        Breathe Out
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  In for 4 • Hold for 4 • Out for 4
                </div>

                <button
                  onClick={() => setShowBreathingExercise(false)}
                  className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                >
                  I'm Ready to Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}