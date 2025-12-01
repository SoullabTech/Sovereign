'use client';

/**
 * Advanced Dream Journal Interface
 * Voice-to-text recording with real-time archetypal analysis and visualization
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Save,
  Sparkles,
  Moon,
  Sun,
  Brain,
  Heart,
  Zap,
  Eye,
  Clock,
  Calendar,
  Target,
  Layers,
  Pause,
  Play,
  Square,
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react';
import SleepPatternTracker from '../sleep/SleepPatternTracker';

interface DreamEntry {
  content: string;
  timestamp: Date;
  type: string;
  lucidityLevel: number;
  vividnessScore: number;
  emotionalIntensity: number;
  sleepQuality: number;
  timeInBed?: number;
  wakeTime?: string;
  moonPhase?: string;
  circadianPhase?: string;
  location?: string;
}

interface ArchetypalAnalysis {
  archetypes: string[];
  archetypeStrengths: { [key: string]: number };
  dominantArchetype: string;
  shadowAspects: string[];
  wisdomEmergence?: {
    bodyActivation: { [key: string]: boolean };
    languageShift: boolean;
    emergenceLevel: number;
  };
  elementalPatterns?: {
    dominant: string;
    secondary: string;
    balance: { [key: string]: number };
  };
  recommendations: string[];
}

export default function DreamJournalInterface() {
  const [activeTab, setActiveTab] = useState<'journal' | 'sleep'>('journal');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dreamEntry, setDreamEntry] = useState<Partial<DreamEntry>>({
    content: '',
    timestamp: new Date(),
    type: 'regular',
    lucidityLevel: 0,
    vividnessScore: 5,
    emotionalIntensity: 5,
    sleepQuality: 5,
    timeInBed: 8,
    moonPhase: 'waxing',
    circadianPhase: 'morning'
  });
  const [analysis, setAnalysis] = useState<ArchetypalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<any>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDreamEntry(prev => ({ ...prev, content: transcript }));
      };

      recognition.current.onend = () => {
        if (isRecording && !isPaused) {
          recognition.current.start();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = () => {
    if (voiceSupported && recognition.current) {
      setIsRecording(true);
      setRecordingTime(0);
      recognition.current.start();
    }
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
    if (recognition.current) {
      if (isPaused) {
        recognition.current.start();
      } else {
        recognition.current.stop();
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  const analyzeDream = async () => {
    if (!dreamEntry.content || dreamEntry.content.length < 10) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/dreams/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: dreamEntry.content,
          analysisType: 'comprehensive'
        })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveDream = async () => {
    try {
      const response = await fetch('/api/dreams/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dreamEntry,
          dreamSymbols: [],
          emotionalTone: { primary: 'neutral', intensity: dreamEntry.emotionalIntensity || 5 },
          archetypes: analysis?.archetypes || [],
          wisdomEmergenceSignals: analysis?.wisdomEmergence
        })
      });

      const data = await response.json();
      if (data.success) {
        // Reset form
        setDreamEntry({
          content: '',
          timestamp: new Date(),
          type: 'regular',
          lucidityLevel: 0,
          vividnessScore: 5,
          emotionalIntensity: 5,
          sleepQuality: 5
        });
        setAnalysis(null);

        alert('Dream saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save dream. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getArchetypeColor = (archetype: string) => {
    const colors: { [key: string]: string } = {
      hero: 'text-amber-400',
      shadow: 'text-purple-600',
      anima: 'text-pink-400',
      animus: 'text-blue-400',
      wise_old_man: 'text-green-400',
      wise_old_woman: 'text-emerald-400',
      mother: 'text-rose-400',
      father: 'text-indigo-400',
      child: 'text-yellow-400',
      magician: 'text-violet-400',
      ruler: 'text-red-500',
      rebel: 'text-orange-500',
      lover: 'text-pink-500',
      creator: 'text-purple-500',
      destroyer: 'text-gray-600',
      caregiver: 'text-green-500',
      seeker: 'text-cyan-400',
      sage: 'text-blue-600',
      trickster: 'text-yellow-600'
    };
    return colors[archetype] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">Dream & Sleep Integration</h1>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-lg text-slate-300">
            Comprehensive dream analysis and sleep pattern tracking with real-time biometric integration
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center mt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-indigo-500/30">
              <motion.button
                onClick={() => setActiveTab('journal')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'journal'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Brain className="w-4 h-4" />
                Dream Journal
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('sleep')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'sleep'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart3 className="w-4 h-4" />
                Sleep Analytics
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'journal' ? (
          // Dream Journal Content
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Recording Panel */}
            <div className="lg:col-span-2 space-y-6">

            {/* Voice Recording Controls */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-indigo-500/30 p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Recording
                </h3>
                <div className="text-sm text-slate-300">
                  {formatTime(recordingTime)}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                {!isRecording ? (
                  <motion.button
                    onClick={startRecording}
                    disabled={!voiceSupported}
                    className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={pauseRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </motion.button>
                    <motion.button
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </motion.button>
                  </div>
                )}
              </div>

              {isRecording && (
                <motion.div
                  className="flex items-center justify-center gap-2 text-red-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">
                    {isPaused ? 'Recording Paused' : 'Recording...'}
                  </span>
                </motion.div>
              )}

              {!voiceSupported && (
                <div className="text-center text-amber-400 text-sm">
                  Voice recording not supported in this browser. Please type your dream below.
                </div>
              )}
            </motion.div>

            {/* Dream Content */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-indigo-500/30 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Dream Content</h3>
                <div className="text-sm text-slate-300">
                  {dreamEntry.content?.length || 0} characters
                </div>
              </div>

              <textarea
                value={dreamEntry.content}
                onChange={(e) => setDreamEntry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your dream in detail... (voice recording will appear here automatically)"
                className="w-full h-40 bg-white/5 border border-slate-500/30 rounded-lg p-4 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
              />

              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={analyzeDream}
                  disabled={!dreamEntry.content || dreamEntry.content.length < 10 || isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Dream'}
                </motion.button>

                <motion.button
                  onClick={saveDream}
                  disabled={!dreamEntry.content || dreamEntry.content.length < 10}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Save Dream
                </motion.button>
              </div>
            </motion.div>

            {/* Basic Dream Metrics */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-indigo-500/30 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Dream Metrics</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dream Type
                  </label>
                  <select
                    value={dreamEntry.type}
                    onChange={(e) => setDreamEntry(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-white/5 border border-slate-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value="regular">Regular Dream</option>
                    <option value="lucid">Lucid Dream</option>
                    <option value="nightmare">Nightmare</option>
                    <option value="recurring">Recurring Dream</option>
                    <option value="prophetic">Prophetic Dream</option>
                    <option value="healing">Healing Dream</option>
                    <option value="shadow_work">Shadow Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lucidity Level: {dreamEntry.lucidityLevel}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={dreamEntry.lucidityLevel}
                    onChange={(e) => setDreamEntry(prev => ({ ...prev, lucidityLevel: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Vividness: {dreamEntry.vividnessScore}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dreamEntry.vividnessScore}
                    onChange={(e) => setDreamEntry(prev => ({ ...prev, vividnessScore: parseInt(e.target.value) }))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Emotional Intensity: {dreamEntry.emotionalIntensity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dreamEntry.emotionalIntensity}
                    onChange={(e) => setDreamEntry(prev => ({ ...prev, emotionalIntensity: parseInt(e.target.value) }))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              <motion.button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
              >
                <Layers className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </motion.button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Sleep Quality: {dreamEntry.sleepQuality}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={dreamEntry.sleepQuality}
                        onChange={(e) => setDreamEntry(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
                        className="w-full accent-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Time in Bed (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        step="0.5"
                        value={dreamEntry.timeInBed}
                        onChange={(e) => setDreamEntry(prev => ({ ...prev, timeInBed: parseFloat(e.target.value) }))}
                        className="w-full bg-white/5 border border-slate-500/30 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Wake Time
                      </label>
                      <input
                        type="time"
                        value={dreamEntry.wakeTime}
                        onChange={(e) => setDreamEntry(prev => ({ ...prev, wakeTime: e.target.value }))}
                        className="w-full bg-white/5 border border-slate-500/30 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Moon Phase
                      </label>
                      <select
                        value={dreamEntry.moonPhase}
                        onChange={(e) => setDreamEntry(prev => ({ ...prev, moonPhase: e.target.value }))}
                        className="w-full bg-white/5 border border-slate-500/30 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-400"
                      >
                        <option value="new">New Moon</option>
                        <option value="waxing_crescent">Waxing Crescent</option>
                        <option value="first_quarter">First Quarter</option>
                        <option value="waxing_gibbous">Waxing Gibbous</option>
                        <option value="full">Full Moon</option>
                        <option value="waning_gibbous">Waning Gibbous</option>
                        <option value="third_quarter">Third Quarter</option>
                        <option value="waning_crescent">Waning Crescent</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Analysis Results Panel */}
          <div className="space-y-6">

            {/* Archetypal Analysis */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Archetypal Analysis
              </h3>

              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-purple-300 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Analyzing archetypal patterns...</p>
                  </div>
                </div>
              )}

              {analysis?.archetypes && analysis.archetypes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-purple-200 mb-2">Primary Archetypes</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.archetypes.slice(0, 3).map(archetype => (
                        <motion.span
                          key={archetype}
                          className={`px-3 py-1 rounded-full text-xs font-medium bg-white/10 ${getArchetypeColor(archetype)}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {archetype.replace('_', ' ')}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {analysis.dominantArchetype && (
                    <div>
                      <h4 className="font-medium text-purple-200 mb-2">Dominant Energy</h4>
                      <div className={`text-lg font-semibold ${getArchetypeColor(analysis.dominantArchetype)}`}>
                        {analysis.dominantArchetype.replace('_', ' ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!analysis && !isAnalyzing && (
                <div className="text-center text-slate-400 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Record and analyze your dream to see archetypal patterns</p>
                </div>
              )}
            </motion.div>

            {/* Wisdom Emergence */}
            {analysis?.wisdomEmergence && (
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-amber-500/30 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Wisdom Emergence
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200">Emergence Level</span>
                    <span className="text-amber-400 font-medium">
                      {Math.round(analysis.wisdomEmergence.emergenceLevel * 100)}%
                    </span>
                  </div>

                  {analysis.wisdomEmergence.bodyActivation && Object.keys(analysis.wisdomEmergence.bodyActivation).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-200 mb-2">Body Activation</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(analysis.wisdomEmergence.bodyActivation).map(([center, active]) => (
                          <div key={center} className={`flex items-center gap-2 ${active ? 'text-amber-300' : 'text-slate-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${active ? 'bg-amber-400' : 'bg-slate-600'}`} />
                            {center}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.wisdomEmergence.languageShift && (
                    <div className="flex items-center gap-2 text-amber-300">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">Language shift detected</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Elemental Patterns */}
            {analysis?.elementalPatterns && (
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-cyan-500/30 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Elemental Patterns
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-cyan-200 mb-2">Dominant Element</div>
                    <div className="text-cyan-300 font-medium">
                      {analysis.elementalPatterns.dominant}
                    </div>
                  </div>

                  {analysis.elementalPatterns.secondary && (
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Secondary Element</div>
                      <div className="text-cyan-400">
                        {analysis.elementalPatterns.secondary}
                      </div>
                    </div>
                  )}

                  {analysis.elementalPatterns.balance && (
                    <div>
                      <div className="text-sm text-cyan-200 mb-2">Elemental Balance</div>
                      <div className="space-y-1">
                        {Object.entries(analysis.elementalPatterns.balance).map(([element, balance]) => (
                          <div key={element} className="flex justify-between text-xs">
                            <span className="text-slate-300">{element}</span>
                            <span className="text-cyan-300">{Math.round(balance * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            {analysis?.recommendations && analysis.recommendations.length > 0 && (
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-green-500/30 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-400" />
                  Integration Guidance
                </h3>

                <div className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      className="text-sm text-green-200 flex items-start gap-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <span className="text-green-400 mt-1">•</span>
                      {rec}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
        ) : (
          // Sleep Analytics Content
          <SleepPatternTracker />
        )}
      </div>
    </div>
  );
}