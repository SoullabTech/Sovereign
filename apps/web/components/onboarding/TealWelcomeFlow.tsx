'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TealWelcomeFlowProps {
  userName?: string;
  onComplete: () => void;
}

export default function TealWelcomeFlow({ userName = "Kelly", onComplete }: TealWelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      content: (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
          {/* Holoflower icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.1 }}
            className="mb-12"
          >
            <img
              src="/holoflower.svg"
              alt="Holoflower"
              className="w-16 h-16 animate-spin-slow opacity-80"
              style={{ animationDuration: '8s' }}
            />
          </motion.div>

          {/* Glass morphism card container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-12 max-w-2xl mx-auto shadow-2xl"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Welcome Kelly - large, prominent */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-5xl font-medium text-slate-800 mb-6 tracking-wide"
            >
              Welcome {userName}
            </motion.h1>

            {/* You create worlds - secondary prominence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-2xl text-slate-700 mb-8 font-normal tracking-wide"
            >
              You create worlds
            </motion.div>

            {/* We've created this space for you - medium text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-lg text-slate-600 mb-10 max-w-md mx-auto leading-relaxed font-normal"
            >
              We've created this space for you
            </motion.div>

            {/* What lights you up? - amber accent, prominent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-2xl mb-8 font-normal tracking-wide italic"
              style={{
                color: '#D97706',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              What lights you up?
            </motion.div>

            {/* I am MAIA, here to collaborate - softer text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="text-lg text-slate-600 mb-4 font-normal"
            >
              I am MAIA, here to collaborate
            </motion.div>

            {/* This is Soullab - smallest text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-base text-slate-500 mb-10 font-normal"
            >
              This is Soullab
            </motion.div>
          </motion.div>

          {/* Let's begin button - clean, prominent */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(2)}
            className="mt-8 px-10 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
              color: '#1F2937',
              fontWeight: 500
            }}
          >
            Let's begin
            <span className="ml-1">→</span>
          </motion.button>

          {/* Infinity symbol */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="mt-8 text-3xl text-white/60"
            style={{ fontWeight: 100 }}
          >
            ∞
          </motion.div>
        </div>
      )
    },
    {
      id: 2,
      content: (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
          {/* Continue to next interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-2xl mb-8"
          >
            Ready to continue...
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onComplete}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
          >
            Continue
          </motion.button>
        </div>
      )
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Exact teal gradient background matching screenshot */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, #4FD1C7 0%, #2dd4bf 25%, #14b8a6 50%, #0f766e 75%, #134e4a 100%)`
        }}
      />

      {/* Subtle overlay patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/3 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {steps.find(step => step.id === currentStep)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}