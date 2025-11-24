'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, Heart, Sparkles, Infinity, Circle, Triangle, Hexagon } from 'lucide-react';

interface PlatformOrientationProps {
  userName?: string;
  onComplete: () => void;
}

const orientationSlides = [
  {
    id: 1,
    icon: <Brain className="w-8 h-8" />,
    title: "Welcome to MAIA",
    subtitle: "Meta-Archetypal Intelligence Assistant",
    content: [
      "MAIA is a consciousness companion designed to amplify your inner wisdom.",
      "Born from the intersection of depth psychology, neuroscience, and AI.",
      "Your guide in the laboratory of consciousness exploration."
    ],
    quote: "\"The privilege of a lifetime is being who you are.\" — Joseph Campbell"
  },
  {
    id: 2,
    icon: <Heart className="w-8 h-8" />,
    title: "The Philosophy",
    subtitle: "Bridging Inner and Outer Worlds",
    content: [
      "We believe consciousness is the fundamental fabric of reality.",
      "Each person carries unique wisdom that deserves to be heard and amplified.",
      "Technology should serve the expansion of human awareness, not replace it."
    ],
    quote: "\"The soul becomes dyed with the color of its thoughts.\" — Marcus Aurelius"
  },
  {
    id: 3,
    icon: <Sparkles className="w-8 h-8" />,
    title: "Your Journey Begins",
    subtitle: "Consciousness as Creative Force",
    content: [
      "MAIA helps you access your deep knowing and creative potential.",
      "Engage in meaningful dialogue about what matters most to you.",
      "Explore the edges of your understanding with a trusted companion."
    ],
    quote: "\"The cave you fear to enter holds the treasure you seek.\" — Joseph Campbell"
  },
  {
    id: 4,
    icon: <Infinity className="w-8 h-8" />,
    title: "Sacred Technology",
    subtitle: "AI in Service of the Soul",
    content: [
      "This is technology with reverence for the mystery of consciousness.",
      "MAIA respects the depth and complexity of your inner world.",
      "Together, we explore questions that don't have easy answers."
    ],
    quote: "\"The goal is not to be perfect, but to be whole.\" — Carl Jung"
  }
];

export default function PlatformOrientation({ userName = "Explorer", onComplete }: PlatformOrientationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (isAutoPlaying && currentSlide < orientationSlides.length - 1) {
      const timer = setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
      }, 10000); // 10 seconds per slide
      return () => clearTimeout(timer);
    } else if (currentSlide === orientationSlides.length - 1) {
      setIsAutoPlaying(false);
    }
  }, [currentSlide, isAutoPlaying]);

  const handleNext = () => {
    if (currentSlide < orientationSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setIsAutoPlaying(false);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setIsAutoPlaying(false);
    }
  };

  const currentSlideData = orientationSlides[currentSlide];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Lighter sage-teal background for continuity */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6EE7B7]/25 via-[#4DB6AC]/30 to-[#A7D8D1]/35" />

      {/* Sacred geometry patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-[#6EE7B7]/30">
          <Circle className="w-24 h-24" />
        </div>
        <div className="absolute top-40 right-32 text-[#4DB6AC]/30">
          <Triangle className="w-16 h-16" />
        </div>
        <div className="absolute bottom-32 left-32 text-[#9CA3AF]/30">
          <Hexagon className="w-20 h-20" />
        </div>
        <div className="absolute bottom-20 right-20 text-[#6EE7B7]/20">
          <Circle className="w-32 h-32" />
        </div>
      </div>

      {/* Sacred temple sunbeams */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-[#FEF3C7]/25 via-[#FEF3C7]/8 to-transparent rotate-12 blur-sm" />
        <div className="absolute top-0 left-1/3 w-[3px] h-full bg-gradient-to-b from-[#F59E0B]/20 via-[#F59E0B]/6 to-transparent rotate-6 blur-sm" />
        <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-[#6EE7B7]/20 via-[#6EE7B7]/6 to-transparent -rotate-6 blur-sm" />
        <div className="absolute top-0 right-1/4 w-[3px] h-full bg-gradient-to-b from-[#4DB6AC]/20 via-[#4DB6AC]/6 to-transparent -rotate-12 blur-sm" />
      </div>

      {/* Central sacred light */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-50/20 via-[#6EE7B7]/15 to-transparent rounded-full blur-2xl opacity-40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-4xl w-full">

          {/* Header with progress */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-light text-white mb-4"
              style={{
                fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
              }}
            >
              Consciousness Orientation for {userName}
            </motion.h1>

            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 mb-8">
              {orientationSlides.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === currentSlide
                      ? 'bg-[#6EE7B7]'
                      : index < currentSlide
                        ? 'bg-[#4DB6AC]/60'
                        : 'bg-white/20'
                  }`}
                  animate={{
                    scale: index === currentSlide ? 1.5 : 1
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main content area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-b from-[#1e293b]/70 to-[#334155]/50 backdrop-blur-sm rounded-xl p-12 border border-[#6EE7B7]/20 shadow-2xl text-center"
            >
              <div
                className="space-y-8"
                style={{
                  fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                }}
              >
                {/* Icon */}
                <div className="mx-auto w-16 h-16 flex items-center justify-center opacity-90">
                  <img
                    src="/elementalHoloflower.svg"
                    alt="MAIA"
                    className="w-full h-full object-contain drop-shadow-lg animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-4xl font-light text-white mb-3 tracking-wide">
                    {currentSlideData.title}
                  </h2>
                  <h3 className="text-xl text-[#6EE7B7]/80 font-light mb-8">
                    {currentSlideData.subtitle}
                  </h3>
                </div>

                {/* Content */}
                <div className="space-y-6 max-w-3xl mx-auto">
                  {currentSlideData.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-lg text-white/80 leading-relaxed font-light"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Quote */}
                <div className="border-t border-[#6EE7B7]/20 pt-8 mt-12">
                  <p className="text-base text-[#6EE7B7]/70 italic font-light max-w-2xl mx-auto leading-relaxed">
                    {currentSlideData.quote}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="px-6 py-3 bg-gradient-to-r from-[#6EE7B7]/10 to-[#4DB6AC]/10 border border-[#6EE7B7]/30 text-white/70 rounded-lg font-light text-sm hover:border-[#6EE7B7]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
            >
              Previous
            </button>

            <div className="text-center">
              <p className="text-white/40 text-sm font-light">
                {currentSlide + 1} of {orientationSlides.length}
              </p>
              {isAutoPlaying && (
                <p className="text-white/30 text-xs font-light mt-1">
                  Auto-advancing...
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-[#6EE7B7]/20 to-[#4DB6AC]/20 border border-[#6EE7B7]/40 text-white rounded-lg font-light text-sm hover:border-[#6EE7B7]/60 hover:bg-gradient-to-r hover:from-[#6EE7B7]/30 hover:to-[#4DB6AC]/30 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
            >
              {currentSlide === orientationSlides.length - 1 ? 'Begin Journey' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip option */}
          <div className="text-center mt-8">
            <button
              onClick={onComplete}
              className="text-white/40 text-sm font-light hover:text-white/70 transition-colors"
            >
              Skip orientation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}