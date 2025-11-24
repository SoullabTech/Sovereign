"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InterimTranscriptDisplayProps {
  interimText: string;
  finalText: string;
  isListening: boolean;
  confidence?: number;
}

export default function InterimTranscriptDisplay({
  interimText,
  finalText,
  isListening,
  confidence = 1.0
}: InterimTranscriptDisplayProps) {
  const [displayText, setDisplayText] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // Update display text and word animation
  useEffect(() => {
    if (finalText) {
      setDisplayText(finalText);
      setWordCount(finalText.split(' ').length);
    } else if (interimText) {
      setDisplayText(interimText);
      setWordCount(interimText.split(' ').length);
    } else {
      setDisplayText("");
      setWordCount(0);
    }
  }, [interimText, finalText]);

  const confidenceColor = confidence >= 0.8 
    ? "#10B981" // green-500
    : confidence >= 0.6 
    ? "#F59E0B" // amber-500  
    : "#EF4444"; // red-500

  return (
    <AnimatePresence>
      {(isListening || displayText) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg mx-auto mt-6"
        >
          {/* Transcript Container */}
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-amber-500/20 p-4">
            
            {/* Status Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    finalText 
                      ? "bg-green-400" 
                      : isListening 
                      ? "bg-amber-400 animate-pulse" 
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-xs text-slate-300 font-mono">
                  {finalText 
                    ? "CAPTURED" 
                    : isListening 
                    ? "LISTENING" 
                    : "READY"}
                </span>
              </div>
              
              {/* Confidence Indicator */}
              {confidence < 1.0 && (
                <div className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-1 rounded-full"
                    style={{ backgroundColor: confidenceColor }}
                  />
                  <span className="text-slate-400">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Live Transcript Text */}
            <div className="min-h-[3rem] flex items-center">
              {displayText ? (
                <motion.div
                  key={displayText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm leading-relaxed ${
                    finalText 
                      ? "text-white" 
                      : "text-amber-100 italic"
                  }`}
                >
                  {displayText.split(' ').map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.2 
                      }}
                      className="mr-1"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              ) : (
                <div className="text-amber-300/60 text-sm animate-pulse">
                  {isListening 
                    ? "Speak now... Maya is listening" 
                    : "Ready to transcribe your voice"}
                </div>
              )}
            </div>

            {/* Word Count & Timing */}
            {displayText && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
                <span className="text-xs text-slate-400">
                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                </span>
                
                {finalText && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-green-400 flex items-center gap-1"
                  >
                    ✓ Complete
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Tesla-style Energy Field (when processing) */}
          {isListening && (
            <div className="absolute inset-0 rounded-xl pointer-events-none">
              <motion.div
                className="absolute inset-0 rounded-xl border border-amber-400/30"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.3)",
                    "0 0 40px rgba(255, 215, 0, 0.5)", 
                    "0 0 20px rgba(255, 215, 0, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}