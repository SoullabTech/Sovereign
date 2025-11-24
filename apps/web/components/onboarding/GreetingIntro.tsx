'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GreetingIntroProps {
  onNext: () => void;
}

export default function GreetingIntro({ onNext }: GreetingIntroProps) {
  return (
    <>
      <style jsx>{`
        .maya-pulse {
          animation: maya-pulse 2s ease-in-out infinite;
        }
        
        @keyframes maya-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(181, 126, 220, 0.4);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 20px rgba(181, 126, 220, 0);
            transform: scale(1.05);
          }
        }
        
        .breathing-animation {
          animation: breathing 3s ease-in-out infinite;
        }
        
        @keyframes breathing {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.02);
            opacity: 0.9;
          }
        }
      `}</style>
      
      <div className="onboarding-maya bg-neutral-50 min-h-screen flex flex-col items-center justify-center px-8 py-20">
        {/* Maia Avatar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 maya-pulse mx-auto flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Introduction Content */}
        <div className="max-w-2xl mx-auto text-center">
          <motion.h1 
            className="text-4xl font-semibold text-neutral-800 mb-6 breathing-animation"
            style={{ fontFamily: 'Blair, serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            I&apos;m Maia
          </motion.h1>
          
          <motion.div
            className="space-y-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <p 
              className="text-xl text-neutral-700 leading-relaxed max-w-xl mx-auto"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Your companion for reflection and insight. I remember your journey, 
              notice patterns, and offer guidance that grows with you.
            </p>
            
            <motion.p 
              className="text-lg text-neutral-500 max-w-lg mx-auto"
              style={{ fontFamily: 'Lato, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Think of me as a sacred witness to your unfolding.
            </motion.p>
          </motion.div>

          {/* Breathing Indicator */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-12 breathing-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p 
              className="text-sm text-neutral-500"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Breathing with the rhythm of your awareness
            </p>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.button
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-amber-600 to-pink-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          style={{ fontFamily: 'Lato, sans-serif' }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          Continue
        </motion.button>
        
        {/* Subtle background elements */}
        <motion.div
          className="fixed top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-pink-100 opacity-30 -z-10"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="fixed bottom-10 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 opacity-20 -z-10"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
        />
      </div>
    </>
  );
}