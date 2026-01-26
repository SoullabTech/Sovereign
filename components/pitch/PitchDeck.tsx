'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideOpening } from './slides/SlideOpening';
import { SlideProblem } from './slides/SlideProblem';
import { SlideDifference } from './slides/SlideDifference';
import { SlideWhatYouDo } from './slides/SlideWhatYouDo';
import { SlideTrust } from './slides/SlideTrust';
import { SlideWhyMe } from './slides/SlideWhyMe';
import { SlideAsk } from './slides/SlideAsk';
// Appendix slides
import { SlideVision } from './slides/SlideVision';
import { SlideTiersAppendix } from './slides/SlideTiersAppendix';
import { SlideMemberAppendix } from './slides/SlideMemberAppendix';

const slides = [
  // Main deck (7 slides)
  { id: 'opening', component: SlideOpening },
  { id: 'problem', component: SlideProblem },
  { id: 'difference', component: SlideDifference },
  { id: 'what-you-do', component: SlideWhatYouDo },
  { id: 'trust', component: SlideTrust },
  { id: 'why-me', component: SlideWhyMe },
  { id: 'ask', component: SlideAsk },
  // Appendix (3 slides)
  { id: 'appendix-vision', component: SlideVision },
  { id: 'appendix-tiers', component: SlideTiersAppendix },
  { id: 'appendix-member', component: SlideMemberAppendix },
];

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, toggleFullscreen, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1c] via-[#0f1328] to-[#121833] overflow-hidden">
      {/* Slide content */}
      <div className="relative w-full h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <CurrentSlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Progress dots */}
        <div className="flex gap-2 items-center">
          {slides.map((slide, index) => (
            <div key={slide.id} className="flex items-center gap-2">
              {/* Separator before appendix */}
              {index === 7 && (
                <div className="w-px h-3 bg-white/20 mx-1" />
              )}
              <button
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? index >= 7 ? 'bg-purple-400 w-8' : 'bg-amber-400 w-8'
                    : index < currentSlide
                    ? index >= 7 ? 'bg-purple-400/60 w-3' : 'bg-amber-400/60 w-3'
                    : 'bg-white/40 hover:bg-white/60 w-3'
                }`}
                aria-label={`Go to slide ${index + 1}${index >= 7 ? ' (appendix)' : ''}`}
              />
            </div>
          ))}
        </div>

        {/* Slide counter */}
        <div className="text-white/70 text-base font-mono">
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-3 bg-amber-500/80 hover:bg-amber-500 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="fixed top-4 right-4 text-white/50 text-sm font-mono bg-black/30 px-3 py-1 rounded-full">
        ← → navigate · F fullscreen
      </div>
    </div>
  );
}
