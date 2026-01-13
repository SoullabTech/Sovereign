'use client';

/**
 * Elemental Alchemy Audiobook
 *
 * Full audiobook experience with chapter navigation and read-along text.
 * Accessible at elementalalchemy.soullab.life
 */

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  folder: string;
  audioFile: string;
  duration?: string;
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
      setCurrentTime(formatTime(audio.currentTime));
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
  }, [currentChapter]);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-purple-500/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-purple-300/60 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Lab</span>
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-purple-200/60">Audiobook</span>
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
          <div className="w-48 h-48 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
            <div className="text-6xl">🔥</div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-light text-white mb-2">
            Elemental Alchemy
          </h1>
          <p className="text-purple-300/60 text-lg">
            A Journey Through the Elements of Consciousness
          </p>
          <p className="text-purple-300/40 text-sm mt-2">
            Written by Ryan Rosh Angelo
          </p>
        </motion.div>

        {/* Now Playing Card */}
        {currentChapter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-900/30 to-amber-900/20 rounded-2xl p-6 mb-8 border border-purple-500/20"
          >
            <div className="text-xs text-amber-400/60 uppercase tracking-wider mb-2">
              Now Playing
            </div>
            <h2 className="text-xl text-white mb-4">{currentChapter.title}</h2>

            {/* Progress Bar */}
            <div
              className="h-2 bg-slate-800 rounded-full cursor-pointer mb-3 overflow-hidden"
              onClick={seekTo}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-xs text-purple-300/40 mb-4">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={skipPrevious}
                className="p-2 text-purple-300/60 hover:text-purple-300 transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-4 bg-amber-500 hover:bg-amber-400 rounded-full text-slate-900 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>

              <button
                onClick={skipNext}
                className="p-2 text-purple-300/60 hover:text-purple-300 transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <button
                onClick={toggleMute}
                className="p-2 text-purple-300/60 hover:text-purple-300 transition-colors ml-4"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Chapter List */}
        <div className="mb-8">
          <button
            onClick={() => setShowAllChapters(!showAllChapters)}
            className="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/10 mb-4"
          >
            <span className="text-purple-200">
              {chapters.length} Chapters • ~8 hours
            </span>
            {showAllChapters ? (
              <ChevronUp className="w-5 h-5 text-purple-300/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-300/60" />
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
                        ? 'bg-purple-900/40 border border-purple-500/30'
                        : 'bg-slate-900/30 border border-transparent hover:bg-slate-900/50 hover:border-purple-500/10'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentChapter?.id === chapter.id && isPlaying
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-800 text-purple-300/60'
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
                          : 'text-purple-200/80'
                      }`}>
                        {chapter.title}
                      </div>
                      {chapter.duration && (
                        <div className="flex items-center gap-1 text-xs text-purple-300/40 mt-1">
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
        <div className="text-center text-purple-300/30 text-sm py-8 border-t border-purple-500/10">
          <p>Narrated with care. Best experienced with headphones.</p>
          <p className="mt-2">Part of the Soullab Consciousness Library</p>
        </div>
      </main>
    </div>
  );
}
