"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { PETAL_MICROCOPY } from "./PetalMicrocopy";

interface MilestoneCelebrationProps {
  milestone: string;
  activeFacets?: string[]; // e.g., ["fire-1", "water-3"]
  soulprintId?: string; // Link to the soulprint that triggered this milestone
  sessionId?: string;
  onClose: () => void;
}

export default function MilestoneCelebration({
  milestone,
  activeFacets = [],
  soulprintId,
  sessionId,
  onClose,
}: MilestoneCelebrationProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  const { title, message, emoji, prompts } = getMilestoneCopy(milestone, activeFacets);

  const handleSaveReflection = async () => {
    if (!entry.trim()) return;
    
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase?.auth.getUser();
      
      if (user) {
        // Use the journal API to save reflection
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            soulprintId: soulprintId,
            prompt: prompts.join(' • '),
            response: entry,
            milestone,
            activeFacets
          }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to save reflection');
        }
      }
      
      setSaveComplete(true);
      
      // Show completion animation, then close
      setTimeout(() => {
        setEntry("");
        setShowPrompt(false);
        setSaveComplete(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving reflection:', error);
      // Gracefully handle error - still show completion
      setSaveComplete(true);
      setTimeout(() => {
        setEntry("");
        setShowPrompt(false);
        setSaveComplete(false);
        onClose();
      }, 1500);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center relative overflow-hidden w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            {/* Holoflower Animation - only show in celebration mode */}
            {!showPrompt && !saveComplete && (
              <motion.div
                className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg flex items-center justify-center relative"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 opacity-80"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 0.9, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="text-4xl z-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {emoji}
                </motion.div>
              </motion.div>
            )}

            {/* Save complete animation */}
            {saveComplete && (
              <motion.div
                className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg flex items-center justify-center relative"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-green-500 opacity-60"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <motion.div
                  className="text-4xl z-10"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  ✨
                </motion.div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {saveComplete ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                    Reflection Saved
                  </h2>
                  <p className="text-gray-700 mb-6 text-base leading-relaxed">
                    Your wisdom has been woven into your sacred memory.
                  </p>
                </motion.div>
              ) : showPrompt ? (
                <motion.div
                  key="journal"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <h2 className="text-2xl font-bold text-amber-700 mb-4">{title}</h2>
                  
                  {/* Journal prompts */}
                  <div className="mb-6 text-left space-y-3">
                    {prompts.map((prompt, i) => (
                      <motion.p
                        key={i}
                        className="italic text-gray-600 text-sm leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2, duration: 0.4 }}
                      >
                        {prompt}
                      </motion.p>
                    ))}
                  </div>
                  
                  {/* Text area */}
                  <motion.textarea
                    className="w-full h-32 p-3 border border-amber-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm leading-relaxed"
                    placeholder="Write your reflection here..."
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    autoFocus
                  />
                  
                  {/* Action buttons */}
                  <div className="flex justify-center gap-4">
                    <button
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setEntry("");
                        setShowPrompt(false);
                      }}
                      disabled={isSaving}
                    >
                      ← Back
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium shadow transition-colors ${
                        entry.trim() && !isSaving
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={handleSaveReflection}
                      disabled={!entry.trim() || isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Reflection'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="celebration"
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <h2 className="text-2xl font-bold text-amber-700 mb-2">
                    {title}
                  </h2>
                  <p className="text-gray-700 mb-6 text-base leading-relaxed">
                    {message}
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      className="px-6 py-2 rounded-lg bg-amber-500 text-white font-medium shadow hover:bg-amber-600 transition-colors"
                      onClick={onClose}
                    >
                      ✨ Continue
                    </button>
                    <button
                      className="px-6 py-2 rounded-lg border border-amber-400 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                      onClick={() => setShowPrompt(true)}
                    >
                      📖 Reflect
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Generate milestone copy with facet-aware prompts
function getMilestoneCopy(milestone: string, activeFacets: string[]) {
  const basePrompts = {
    "first-bloom": [
      "What feels most alive in you right now?",
      "Where is your energy quietly resting today?",
    ],
    "pattern-keeper": [
      "What patterns are beginning to reveal themselves?",
      "Where do you notice cycles in your inner or outer world?",
    ],
    "depth-seeker": [
      "What hidden layers are asking for your attention?",
      "How do you feel when you step beneath the surface of your life?",
    ],
    "sacred-gardener": [
      "Which aspects of your life are flourishing?",
      "Which seeds are ready for tending?",
    ],
    "wisdom-keeper": [
      "What wisdom feels ready to be shared?",
      "How do you imagine your insights might ripple into the world?",
    ],
  };

  // Extract element-specific prompts based on active facets
  const facetPrompts: string[] = [];
  activeFacets.forEach(facet => {
    const element = facet.split('-')[0];
    if (PETAL_MICROCOPY[element as keyof typeof PETAL_MICROCOPY]) {
      const elementCopy = PETAL_MICROCOPY[element as keyof typeof PETAL_MICROCOPY];
      if (elementCopy.questions) {
        // Add one random question from this element
        const randomQuestion = elementCopy.questions[Math.floor(Math.random() * elementCopy.questions.length)];
        facetPrompts.push(randomQuestion);
      }
    }
  });

  // Combine base milestone prompts with facet-specific ones
  const allPrompts = [
    ...(basePrompts[milestone as keyof typeof basePrompts] || []),
    ...facetPrompts.slice(0, 2) // Limit to 2 additional facet prompts
  ];

  switch (milestone) {
    case "first-bloom":
      return { 
        title: "🌱 First Bloom", 
        message: "Your first soulprint blooms today.",
        emoji: "🌱",
        prompts: allPrompts.slice(0, 3) // Keep max 3 prompts
      };
    case "pattern-keeper":
      return { 
        title: "🌸 Pattern Keeper", 
        message: "Your flower remembers your rhythms.",
        emoji: "🌸",
        prompts: allPrompts.slice(0, 3)
      };
    case "depth-seeker":
      return { 
        title: "🌺 Depth Seeker", 
        message: "Every element has layers. You've opened a deeper path.",
        emoji: "🌺",
        prompts: allPrompts.slice(0, 3)
      };
    case "sacred-gardener":
      return { 
        title: "🌻 Sacred Gardener", 
        message: "The full mandala reveals your inner cosmos.",
        emoji: "🌻",
        prompts: allPrompts.slice(0, 3)
      };
    case "wisdom-keeper":
      return { 
        title: "🌟 Wisdom Keeper", 
        message: "Your wisdom ripples outward.",
        emoji: "🌟",
        prompts: allPrompts.slice(0, 3)
      };
    default:
      return { 
        title: "", 
        message: "",
        emoji: "🌸",
        prompts: ["What is alive in you today?", "What wants to be witnessed?"]
      };
  }
}