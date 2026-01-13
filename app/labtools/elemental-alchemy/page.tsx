'use client';

/**
 * Elemental Alchemy Audiobook
 *
 * Full audiobook experience with chapter navigation and read-along text.
 * Accessible at elementalalchemy.soullab.life
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  BookText,
  X,
} from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

interface Chapter {
  id: string;
  title: string;
  folder: string;
  audioFile: string;
  duration?: string;
}

interface Segment {
  text: string;
  startMs: number;
  endMs: number;
  type: 'heading' | 'paragraph';
}

interface Manifest {
  id: string;
  title: string;
  segments: Segment[];
}

const chapters: Chapter[] = [
  { id: 'preface', title: 'Preface', folder: 'preface', audioFile: 'preface.mp3', duration: '18:26' },
  { id: 'introduction', title: 'Introduction', folder: 'introduction', audioFile: 'introduction.mp3', duration: '55:32' },
  { id: 'ch01', title: 'Chapter 1: The Journey Begins', folder: 'ch01', audioFile: 'ch01.mp3', duration: '27:29' },
  { id: 'ch02', title: 'Chapter 2: The Elements Awaken', folder: 'ch02', audioFile: 'ch02.mp3', duration: '31:16' },
  { id: 'ch03', title: 'Chapter 3: Fire - The Spark of Creation', folder: 'ch03', audioFile: 'ch03.mp3', duration: '26:28' },
  { id: 'ch04', title: 'Chapter 4: Water - The Flow of Emotion', folder: 'ch04', audioFile: 'ch04.mp3', duration: '27:01' },
  { id: 'ch05', title: 'Chapter 5: Earth - The Ground of Being', folder: 'ch05', audioFile: 'ch05.mp3', duration: '76:48' },
  { id: 'ch06', title: 'Chapter 6: Air - The Breath of Mind', folder: 'ch06', audioFile: 'ch06.mp3', duration: '55:57' },
  { id: 'ch07', title: 'Chapter 7: Aether - The Fifth Element', folder: 'ch07', audioFile: 'ch07.mp3', duration: '58:14' },
  { id: 'ch08', title: 'Chapter 8: Integration', folder: 'ch08', audioFile: 'ch08.mp3', duration: '66:42' },
  { id: 'ch09', title: 'Chapter 9: The Alchemical Process', folder: 'ch09', audioFile: 'ch09.mp3', duration: '39:09' },
  { id: 'ch10', title: 'Chapter 10: Embodied Wisdom', folder: 'ch10', audioFile: 'ch10.mp3', duration: '38:53' },
];

export default function ElementalAlchemyAudiobook() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [showAllChapters, setShowAllChapters] = useState(true);

  // Read-along state
  const [showReadAlong, setShowReadAlong] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load manifest when chapter changes
  useEffect(() => {
    if (!currentChapter) {
      setManifest(null);
      return;
    }

    const loadManifest = async () => {
      try {
        const res = await fetch(
          `/audiobook/elemental-alchemy/${currentChapter.folder}/manifest.json`
        );
        if (res.ok) {
          const data = await res.json();
          setManifest(data);
          setCurrentSegmentIndex(0);
          segmentRefs.current = [];
        }
      } catch (err) {
        console.error('Failed to load manifest:', err);
        setManifest(null);
      }
    };

    loadManifest();
  }, [currentChapter]);

  // Find current segment based on audio time
  const findCurrentSegment = useCallback(
    (timeMs: number) => {
      if (!manifest?.segments) return 0;
      for (let i = manifest.segments.length - 1; i >= 0; i--) {
        if (timeMs >= manifest.segments[i].startMs) {
          return i;
        }
      }
      return 0;
    },
    [manifest]
  );

  // Auto-scroll to current segment
  useEffect(() => {
    if (showReadAlong && segmentRefs.current[currentSegmentIndex]) {
      segmentRefs.current[currentSegmentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSegmentIndex, showReadAlong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
      setCurrentTime(formatTime(audio.currentTime));

      // Update current segment for read-along
      if (manifest) {
        const timeMs = audio.currentTime * 1000;
        const newIndex = findCurrentSegment(timeMs);
        if (newIndex !== currentSegmentIndex) {
          setCurrentSegmentIndex(newIndex);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration));
    };

    const handleEnded = () => {
      // Auto-advance to next chapter
      const currentIndex = chapters.findIndex(c => c.id === currentChapter?.id);
      if (currentIndex < chapters.length - 1) {
        playChapter(chapters[currentIndex + 1]);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentChapter, manifest, findCurrentSegment, currentSegmentIndex]);

  // Seek to a specific segment when clicked
  const seekToSegment = (segment: Segment, index: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = segment.startMs / 1000;
    setCurrentSegmentIndex(index);
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setIsPlaying(true);

    // Small delay to ensure state updates
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = `/audiobook/elemental-alchemy/${chapter.folder}/${chapter.audioFile}`;
        audioRef.current.play();
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!currentChapter) {
        playChapter(chapters[0]);
        return;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipPrevious = () => {
    const currentIndex = chapters.findIndex(c => c.id === currentChapter?.id);
    if (currentIndex > 0) {
      playChapter(chapters[currentIndex - 1]);
    }
  };

  const skipNext = () => {
    const currentIndex = chapters.findIndex(c => c.id === currentChapter?.id);
    if (currentIndex < chapters.length - 1) {
      playChapter(chapters[currentIndex + 1]);
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3]">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#8FBCBE]/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Lab</span>
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <span className="text-sm text-white/60">Audiobook</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Book Cover & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Soullab Media Production Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xs uppercase tracking-[0.2em] mb-8 font-light"
          >
            A Soullab Media Production
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-64 h-64 mx-auto mb-8 flex items-center justify-center overflow-visible"
          >
            <Holoflower size="xxl" glowIntensity="high" animate={true} />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-extralight text-white tracking-wide mb-2">
            Elemental Alchemy
          </h1>
          <p className="text-white/70 text-base font-light italic mb-3">
            The Ancient Art of Living a Phenomenal Life
          </p>
          <p className="text-teal-100/60 text-sm font-light">
            Written by Kelly Nezat
          </p>
        </motion.div>

        {/* Now Playing Card */}
        {currentChapter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 mb-8"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(110, 231, 183, 0.1), rgba(255, 255, 255, 0.1))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 15px 35px rgba(14, 116, 144, 0.2)',
            }}
          >
            <div className="text-xs text-white/60 uppercase tracking-wider mb-2">
              Now Playing
            </div>
            <h2 className="text-xl text-white font-light mb-4">{currentChapter.title}</h2>

            {/* Progress Bar */}
            <div
              className="h-2 bg-white/20 rounded-full cursor-pointer mb-3 overflow-hidden"
              onClick={seekTo}
            >
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-xs text-white/50 mb-4">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={skipPrevious}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-4 bg-white/90 hover:bg-white rounded-full text-teal-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>

              <button
                onClick={skipNext}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <button
                onClick={toggleMute}
                className="p-2 text-white/60 hover:text-white transition-colors ml-4"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setShowReadAlong(!showReadAlong)}
                className={`p-2 transition-colors ml-2 ${
                  showReadAlong
                    ? 'text-white hover:text-white/80'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Read Along"
              >
                <BookText className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Read Along Panel */}
        <AnimatePresence>
          {showReadAlong && manifest && currentChapter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BookText className="w-4 h-4 text-white" />
                    <span className="text-sm text-white/80">Read Along</span>
                  </div>
                  <button
                    onClick={() => setShowReadAlong(false)}
                    className="p-1 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                  {manifest.segments.map((segment, index) => (
                    <div
                      key={index}
                      ref={(el) => { segmentRefs.current[index] = el; }}
                      onClick={() => seekToSegment(segment, index)}
                      className={`cursor-pointer transition-all duration-300 ${
                        index === currentSegmentIndex
                          ? 'bg-white/20 -mx-4 px-4 py-3 rounded-lg border-l-2 border-white'
                          : 'hover:bg-white/10 -mx-4 px-4 py-2 rounded-lg opacity-60 hover:opacity-100'
                      }`}
                    >
                      {segment.type === 'heading' ? (
                        <h3
                          className={`text-lg font-medium ${
                            index === currentSegmentIndex
                              ? 'text-white'
                              : 'text-white/80'
                          }`}
                        >
                          {segment.text}
                        </h3>
                      ) : (
                        <p
                          className={`leading-relaxed ${
                            index === currentSegmentIndex
                              ? 'text-white'
                              : 'text-white/70'
                          }`}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {segment.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter List */}
        <div className="mb-8">
          <button
            onClick={() => setShowAllChapters(!showAllChapters)}
            className="w-full flex items-center justify-between p-4 rounded-xl mb-4"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="text-white/80">
              {chapters.length} Chapters • ~8 hours
            </span>
            {showAllChapters ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>

          <AnimatePresence>
            {showAllChapters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {chapters.map((chapter, index) => (
                  <motion.button
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => playChapter(chapter)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      currentChapter?.id === chapter.id
                        ? 'bg-white/20 border border-white/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentChapter?.id === chapter.id && isPlaying
                          ? 'bg-white text-teal-700'
                          : 'bg-white/20 text-white/60'
                      }`}
                    >
                      {currentChapter?.id === chapter.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className={`${
                        currentChapter?.id === chapter.id
                          ? 'text-white'
                          : 'text-white/80'
                      }`}>
                        {chapter.title}
                      </div>
                      {chapter.duration && (
                        <div className="flex items-center gap-1 text-xs text-white/50 mt-1">
                          <Clock className="w-3 h-3" />
                          {chapter.duration}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Note */}
        <div className="text-center text-white/40 text-sm py-8 border-t border-white/10">
          <p className="font-light">Narrated with care. Best experienced with headphones.</p>
          <p className="mt-2 font-light">Part of the Soullab Consciousness Library</p>
        </div>
      </main>
    </div>
  );
}
