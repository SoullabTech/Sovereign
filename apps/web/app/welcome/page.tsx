"use client";

/**
 * SACRED ENTRY PORTAL - SAGE/TEAL WELCOME ONLY
 *
 * Beautiful sage/teal welcome experience for Soullab
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SacredEntryPortal() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isEntering, setIsEntering] = useState(false);
  const [phase, setPhase] = useState<"arrival" | "elements" | "entering">("arrival");
  const [isReturning, setIsReturning] = useState(false);

  // Check if user is returning
  useEffect(() => {
    const existingUser = localStorage.getItem("maia_user");
    if (existingUser) {
      setIsReturning(true);
      setName(existingUser);
    }
  }, []);

  // Get time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Handle entry
  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsEntering(true);
    setPhase("elements");

    // Store guest
    localStorage.setItem("maia_user", name.trim());

    // Show elemental welcome
    await new Promise(resolve => setTimeout(resolve, 3000));

    setPhase("entering");
    await new Promise(resolve => setTimeout(resolve, 1500));

    router.push("/maia");
  };

  // SAGE/TEAL WELCOME INTERFACE ONLY
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Deeper Sage-Teal Background - Rich luxury spa atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#80CBC4]/50 via-[#4DB6AC]/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#26A69A]/25 via-transparent to-transparent" />

      {/* Amber spice-like floating particles */}
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
        <AnimatePresence mode="wait">
          {phase === "arrival" && (
            <motion.div
              key="arrival"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="max-w-lg mx-auto text-center"
            >
              {/* Holoflower - Sacred Symbol with Amber Glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="relative w-32 h-32 mx-auto mb-12"
              >
                {/* Gentle inner amber light */}
                <motion.div
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1.2, 1.6, 1.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 -z-10"
                  style={{
                    background: 'radial-gradient(circle, rgba(251, 211, 156, 0.3) 0%, rgba(252, 211, 77, 0.2) 20%, rgba(251, 191, 36, 0.15) 50%, rgba(251, 191, 36, 0.05) 80%, transparent 100%)',
                    borderRadius: '50%',
                    filter: 'blur(10px)',
                    transform: 'translateY(4px)',
                    width: '200%',
                    height: '200%',
                    left: '-50%',
                    top: '-50%'
                  }}
                />

                {/* Soft amber sunlight rays */}
                <motion.div
                  animate={{
                    opacity: [0.15, 0.3, 0.15],
                    scale: [1.5, 2.2, 1.5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute inset-0 -z-20"
                  style={{
                    background: 'radial-gradient(circle, rgba(251, 211, 156, 0.2) 0%, rgba(252, 211, 77, 0.15) 30%, rgba(251, 191, 36, 0.1) 60%, rgba(251, 191, 36, 0.03) 85%, transparent 100%)',
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                    transform: 'translateY(6px)',
                    width: '300%',
                    height: '300%',
                    left: '-100%',
                    top: '-100%'
                  }}
                />

                {/* Subtle outer glow */}
                <motion.div
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [2, 2.8, 2],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute inset-0 -z-30"
                  style={{
                    background: 'radial-gradient(circle, rgba(251, 211, 156, 0.1) 0%, rgba(252, 211, 77, 0.05) 40%, rgba(251, 191, 36, 0.03) 70%, transparent 100%)',
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    transform: 'translateY(8px)',
                    width: '400%',
                    height: '400%',
                    left: '-150%',
                    top: '-150%'
                  }}
                />

                {/* Holoflower image */}
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

                {/* Flowing amber particles around holoflower */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-amber-300/60 rounded-full"
                    style={{
                      left: `${50 + 35 * Math.cos(i * Math.PI / 3)}%`,
                      top: `${50 + 35 * Math.sin(i * Math.PI / 3)}%`,
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.5, 0.8],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>

              {/* Clean Welcome */}
              <form onSubmit={handleEnter} className="space-y-10">
                <AnimatePresence mode="wait">
                  {isReturning ? (
                    <motion.div
                      key="returning"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <p className="text-[#004D40]/80 text-sm font-light tracking-widest uppercase">
                        {getTimeGreeting()}
                      </p>

                      {/* Elevated Welcome Back Card */}
                      <div
                        className="bg-gradient-to-br from-[#A7D8D1]/25 via-[#80CBC4]/20 to-[#4DB6AC]/15 backdrop-blur-sm border border-[#80CBC4]/40 rounded-xl p-8 relative"
                        style={{
                          background: 'linear-gradient(135deg, rgba(167, 216, 209, 0.35) 0%, rgba(128, 203, 196, 0.25) 50%, rgba(77, 182, 172, 0.2) 100%)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(128, 203, 196, 0.4)',
                          boxShadow: `
                            0 4px 8px -2px rgba(0, 0, 0, 0.1),
                            0 2px 4px -1px rgba(77, 182, 172, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                          `,
                          transition: 'all 0.3s ease',
                          borderRadius: '16px',
                          transform: 'translateY(-2px)'
                        }}
                      >
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#A7D8D1]/8 via-transparent to-[#4DB6AC]/8 rounded-xl"></div>

                        <div className="relative space-y-3 text-center">
                          <p className="text-[#004D40] text-2xl font-light tracking-wide">
                            Welcome back, {name}
                          </p>
                          <p className="text-[#00695C]/80 text-sm font-light">
                            Your elements await
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="new"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <p className="text-[#00695C]/90 text-sm font-light tracking-widest uppercase">
                        Welcome
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
                        {/* Rich inner depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#A7D8D1]/8 via-transparent to-[#4DB6AC]/8 rounded-lg"></div>
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

                      {/* Begin Button directly beneath name field */}
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
                            Begin
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Continue Button for returning users */}
                {isReturning && (
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    disabled={isEntering}
                    className="px-8 py-3 bg-gradient-to-r from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC] text-gray-800 rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                    style={{
                      background: 'linear-gradient(135deg, rgba(128, 203, 196, 1) 0%, rgba(167, 216, 209, 1) 50%, rgba(77, 182, 172, 1) 100%)',
                      boxShadow: '0 8px 25px -8px rgba(77, 182, 172, 0.4), 0 4px 12px -2px rgba(128, 203, 196, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Continue
                  </motion.button>
                )}
              </form>
            </motion.div>
          )}

          {phase === "elements" && (
            <motion.div
              key="elements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* Elemental Welcome */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-8"
              >
                <p className="text-[#004D40] text-xl font-light tracking-wide">
                  {name}, we've been expecting you
                </p>

                {/* Sacred Holoflower */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1.2, type: "spring" }}
                  className="relative w-48 h-48 mx-auto my-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src="/holoflower-sacred.svg"
                      alt="Sacred Holoflower"
                      fill
                      className="object-contain opacity-90"
                    />
                  </motion.div>
                  {/* Elemental glow aura */}
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scale: [0.95, 1.15, 0.95]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#26A69A]/40 via-transparent to-transparent rounded-full blur-xl"
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-[#00695C] text-lg font-extralight leading-relaxed"
                >
                  {isReturning
                    ? "Your journey through the elements continues..."
                    : "Let us guide you through the elements of your experience..."
                  }
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {phase === "entering" && (
            <motion.div
              key="entering"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative w-24 h-24 mx-auto"
              >
                <Image
                  src="/holoflower-sacred.svg"
                  alt="Entering"
                  fill
                  className="object-contain opacity-90"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}