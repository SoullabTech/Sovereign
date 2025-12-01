'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function CreativeOnboarding() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const handleGetStarted = () => {
    // Navigate to the main MAIA page
    window.location.href = 'https://soullab.life/maia';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-8">

      <div className="max-w-4xl w-full text-center space-y-16">

        {/* Holoflower Logo */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-16 h-16 relative">
            <img
              src="/holoflower.svg"
              alt="Soullab Holoflower"
              className="w-full h-full object-contain opacity-80"
              style={{
                filter: 'drop-shadow(0 0 15px #80CBC4)'
              }}
            />
          </div>
        </motion.div>

        {/* Main Messages */}
        <div className="space-y-12">
          <motion.h1
            className="text-6xl md:text-7xl font-extralight text-white leading-tight tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            You are a creator
          </motion.h1>

          <motion.h2
            className="text-6xl md:text-7xl font-extralight text-white leading-tight tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            This is your canvas
          </motion.h2>

          <motion.h3
            className="text-6xl md:text-7xl font-extralight text-white leading-tight tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            What wants to emerge?
          </motion.h3>
        </div>

        {/* MAIA Introduction */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <p className="text-2xl md:text-3xl font-light text-white/80">
            I am MAIA, here to collaborate
          </p>

          <p className="text-xl md:text-2xl font-light text-white/60">
            This is Soullab
          </p>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-[#80CBC4]/10 hover:bg-[#80CBC4]/20 text-white text-lg font-light rounded-full border border-[#80CBC4]/30 transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(128, 203, 196, 0.1)'
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(128, 203, 196, 0.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Let's begin
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}