"use client";

/**
 * TEST SAGE/TEAL INTERFACE
 * Direct test of the beautiful welcome experience
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function TestSagePage() {
  const [name, setName] = useState("");
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsEntering(true);
    // Just for testing - don't actually navigate
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sage-Teal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#80CBC4]/50 via-[#4DB6AC]/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#26A69A]/25 via-transparent to-transparent" />

      {/* Amber particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-400/40 rounded-full shadow-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-lg mx-auto text-center">
          {/* Holoflower */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="relative w-32 h-32 mx-auto mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 z-10"
            >
              <Image
                src="/holoflower-sacred.svg"
                alt="MAIA"
                fill
                className="object-contain opacity-90"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3)) drop-shadow(0 2px 4px rgba(217, 119, 6, 0.2))'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Welcome Form */}
          <form onSubmit={handleEnter} className="space-y-10">
            <div className="space-y-6">
              <p className="text-[#00695C]/90 text-sm font-light tracking-widest uppercase">
                Welcome to Soullab
              </p>
              <div
                className="bg-gradient-to-br from-[#80CBC4]/20 via-[#4DB6AC]/15 to-[#26A69A]/10 backdrop-blur-sm border border-[#80CBC4]/30 rounded-lg p-5 shadow-lg shadow-[#4DB6AC]/30 relative hover:shadow-2xl transition-shadow duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.18) 50%, rgba(217, 119, 6, 0.2) 100%)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transition: 'box-shadow 0.3s ease',
                  borderRadius: '12px'
                }}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="relative w-full text-center text-4xl font-light tracking-wide text-[#8B5A2B] placeholder:text-[#8B5A2B]/60 outline-none border-0 focus:outline-none"
                  style={{
                    background: 'transparent !important',
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                    fontFamily: 'Georgia, "Times New Roman", Times, serif'
                  }}
                  disabled={isEntering}
                  autoFocus
                />
              </div>

              {/* Begin Button */}
              <AnimatePresence>
                {name.trim() && (
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    disabled={isEntering}
                    className="mt-6 text-[#004D40] font-light tracking-[0.3em] text-sm uppercase hover:text-[#00695C] transition-colors duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEntering ? "Entering..." : "Begin"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}