"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Globe, Sparkles, Settings, Waveform, Loader2, BookOpen, Tags, Brain } from 'lucide-react';
import { useMayaStream } from '@/hooks/useMayaStream';
import VoiceRecorder from './VoiceRecorder';
import ProsodyDebugOverlay from './ProsodyDebugOverlay';
import RecallDebugOverlay from './RecallDebugOverlay';
import JournalTagSelector from './JournalTagSelector';

interface MaiaInputBarProps {
  userId: string;
  userName?: string;
  trustLevel?: number;
  isFirstSession?: boolean;
  onMessageSent?: (message: string, isJournal?: boolean) => void;
  showDebugPanel?: boolean;
  onDebugToggle?: () => void;
  defaultElement?: string;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  pipelineDebug?: any;
}

export default function MaiaInputBar({
  userId,
  userName = "friend",
  trustLevel = 0.3,
  isFirstSession = false,
  onMessageSent,
  showDebugPanel = false,
  onDebugToggle,
  defaultElement = "auto",
  language = "en-US",
  onLanguageChange,
  pipelineDebug
}: MaiaInputBarProps) {
  const [message, setMessage] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(defaultElement);
  const [showElementSelector, setShowElementSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showJournalTags, setShowJournalTags] = useState(false);
  const [journalTags, setJournalTags] = useState<Array<{id: string, label: string, color?: string}>>([]);
  const [showRecallDebug, setShowRecallDebug] = useState(false);
  const [recallMemories, setRecallMemories] = useState<any[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { stream, isStreaming, stopStream } = useMaiaStream();

  // Update recall memories when pipelineDebug changes
  useEffect(() => {
    if (pipelineDebug?.metadata?.semanticRecallDebug) {
      setRecallMemories(pipelineDebug.metadata.semanticRecallDebug);
    }
  }, [pipelineDebug]);

  // Adaptive greeting system based on trust and session state
  const getAdaptiveGreeting = () => {
    if (isFirstSession || trustLevel < 0.4) {
      // Light, informal, safe entry
      return `✨ Hi ${userName}, how's it going today?`;
    } else if (trustLevel < 0.7) {
      // Moves into emotional language naturally
      return `🌊 Hi ${userName}, how are you feeling today?`;
    } else {
      // Context-aware with elemental awareness
      const elementEmoji = selectedElement === 'fire' ? '🔥' : 
                          selectedElement === 'water' ? '💧' :
                          selectedElement === 'earth' ? '🌍' :
                          selectedElement === 'air' ? '💨' : '✨';
      return `${elementEmoji} Welcome back, ${userName}. You've been carrying ${selectedElement} energy lately — want to share where you're at?`;
    }
  };

  // Element options for the dropdown
  const elements = [
    { value: "auto", label: "Auto-Detect", icon: "🔮", color: "text-amber-400" },
    { value: "fire", label: "Fire", icon: "🔥", color: "text-red-400" },
    { value: "water", label: "Water", icon: "💧", color: "text-blue-400" },
    { value: "earth", label: "Earth", icon: "🌍", color: "text-green-400" },
    { value: "air", label: "Air", icon: "💨", color: "text-yellow-400" },
    { value: "aether", label: "Aether", icon: "✨", color: "text-amber-400" }
  ];

  // Language options
  const languages = [
    { value: "en-US", label: "English", flag: "🇺🇸" },
    { value: "es-ES", label: "Español", flag: "🇪🇸" },
    { value: "fr-FR", label: "Français", flag: "🇫🇷" },
    { value: "de-DE", label: "Deutsch", flag: "🇩🇪" },
    { value: "it-IT", label: "Italiano", flag: "🇮🇹" }
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Handle sending message
  const handleSend = async (isJournal = false) => {
    if (!message.trim() || isStreaming) return;
    
    const messageToSend = message.trim();
    const tagsToSend = isJournal ? journalTags.map(tag => tag.label) : [];
    
    setMessage("");
    if (isJournal) {
      setJournalTags([]); // Clear tags after journaling
      setShowJournalTags(false);
    }
    
    try {
      await stream({
        userText: messageToSend,
        element: selectedElement,
        userId: userId,
        lang: language,
        journal: isJournal,
        tags: tagsToSend, // Include tags for journal entries
        phase: pipelineDebug?.phase // Include current phase for context
      });
      
      onMessageSent?.(messageToSend, isJournal);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle voice transcription
  const handleVoiceTranscribed = ({ transcript }: { transcript: string; audioUrl?: string }) => {
    if (transcript.trim()) {
      setMessage(transcript);
      setIsVoiceMode(false);
      // Auto-send voice messages
      setTimeout(async () => {
        try {
          await stream({
            userText: transcript,
            element: selectedElement,
            userId: userId,
            lang: language
          });
          
          onMessageSent?.(transcript);
          setMessage("");
        } catch (error) {
          console.error('Failed to send voice message:', error);
        }
      }, 100);
    }
  };

  // Trigger Maia&apos;s welcome ritual
  const triggerWelcomeRitual = async () => {
    try {
      await stream({
        userText: "__MAIA_WELCOME_RITUAL__",
        element: "aether",
        userId: userId,
        lang: language
      });
    } catch (error) {
      console.error('Failed to trigger welcome ritual:', error);
    }
  };

  // Handle action button clicks
  const handleActionClick = async (action: string, prompt: string) => {
    try {
      await stream({
        userText: prompt,
        element: selectedElement,
        userId: userId,
        lang: language
      });
      
      onMessageSent?.(prompt);
    } catch (error) {
      console.error(`Failed to trigger ${action} action:`, error);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter or Cmd+Enter for journal entry
        handleSend(true);
      } else {
        // Regular Enter for normal message
        handleSend(false);
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Adaptive Greeting */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif text-white mb-4">
          {getAdaptiveGreeting()}
        </h2>
        
        {/* Claude-style Action Buttons */}
        <div className="flex justify-center flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleActionClick('reflect', 'Help me reflect on something important in my life right now')}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-white transition-colors flex items-center gap-2 text-sm"
            disabled={isStreaming}
          >
            🔮 Reflect
          </button>
          <button
            onClick={() => handleActionClick('learn', 'I want to learn something new and meaningful today')}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-white transition-colors flex items-center gap-2 text-sm"
            disabled={isStreaming}
          >
            📚 Learn
          </button>
          <button
            onClick={() => handleActionClick('create', 'I want to create something that expresses who I am')}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-white transition-colors flex items-center gap-2 text-sm"
            disabled={isStreaming}
          >
            🛠 Create
          </button>
          <button
            onClick={() => handleActionClick('life', 'I need guidance with something happening in my life')}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-white transition-colors flex items-center gap-2 text-sm"
            disabled={isStreaming}
          >
            🌱 Life Stuff
          </button>
          <button
            onClick={() => handleActionClick('search', 'Help me explore and discover new perspectives')}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-white transition-colors flex items-center gap-2 text-sm"
            disabled={isStreaming}
          >
            🔍 Explore
          </button>
        </div>
      </div>

      {/* Voice Recording Overlay */}
      {isVoiceMode && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700">
            <VoiceRecorder
              userId={userId}
              onTranscribed={handleVoiceTranscribed}
              autoSend={false}
              maxDuration={60}
              strictMode={false}
              autoStartSession={false}
            />
            <div className="mt-3 text-center">
              <button
                onClick={() => setIsVoiceMode(false)}
                className="text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Tag Selector */}
      {showJournalTags && (
        <div className="mb-3 p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
          <JournalTagSelector
            tags={journalTags}
            onTagsChange={setJournalTags}
            element={pipelineDebug?.element || selectedElement}
            phase={pipelineDebug?.phase}
            className="w-full"
          />
        </div>
      )}

      {/* Main Input Bar */}
      <div className="flex items-end w-full bg-[#0D101B] border border-gray-700 rounded-2xl p-2 relative">
        {/* Left-side controls */}
        <div className="flex items-center gap-2 px-2 pb-2">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              className="text-gray-400 hover:text-white cursor-pointer transition-colors"
              title="Language Selector"
            >
              <Globe size={20} />
            </button>
            
            {showLanguageSelector && (
              <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-40 min-w-32">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      onLanguageChange?.(lang.value);
                      setShowLanguageSelector(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      language === lang.value ? 'bg-slate-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Maia's Welcome Ritual Trigger - Hidden when typing or streaming */}
          {!isInputFocused && !message && !isStreaming && (
            <button
              onClick={triggerWelcomeRitual}
              className="text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
              title="Start Maia's Welcome Ritual"
            >
              <Sparkles size={20} />
            </button>
          )}
        </div>

        {/* Input field */}
        <div className="flex-1 px-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Message Elemental Oracle 2.0..."
            className="w-full bg-transparent outline-none resize-none text-white text-sm placeholder-gray-500 min-h-[40px] max-h-[120px] py-2"
            style={{ height: '40px' }}
            disabled={isStreaming || isVoiceMode}
          />
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-3 px-2 pb-2">
          {/* Voice Recording Toggle */}
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`transition-colors ${
              isVoiceMode 
                ? 'text-red-400 hover:text-red-300' 
                : 'text-gray-400 hover:text-white'
            }`}
            title={isVoiceMode ? "Cancel Voice Recording" : "Start Voice Recording"}
            disabled={isStreaming}
          >
            {isVoiceMode ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Prosody Debug Toggle */}
          <button
            onClick={onDebugToggle}
            className={`transition-colors ${
              showDebugPanel
                ? 'text-green-400 hover:text-green-300'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Prosody Debug Overlay"
          >
            <Waveform size={20} />
          </button>

          {/* Semantic Recall - Braintrust Feature - Hidden when typing or streaming */}
          {!isInputFocused && !message && !isStreaming && (
            <button
              onClick={() => setShowRecallDebug(!showRecallDebug)}
              className={`transition-colors ${
                showRecallDebug
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Toggle Semantic Recall"
            >
              <Brain size={20} />
            </button>
          )}

          {/* Journal Button with Tag Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowJournalTags(!showJournalTags)}
              disabled={isStreaming || isVoiceMode}
              className={`transition-colors ${
                showJournalTags 
                  ? 'text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-300'
              } ${journalTags.length > 0 ? 'relative' : ''}`}
              title="Add journal tags"
            >
              <Tags size={18} />
              {journalTags.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {journalTags.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => handleSend(true)}
              disabled={!message.trim() || isStreaming || isVoiceMode}
              className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Save as Journal Entry"
            >
              <BookOpen size={20} />
            </button>
          </div>

          {/* Element Selector */}
          <div className="relative">
            <button
              onClick={() => setShowElementSelector(!showElementSelector)}
              className="text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
              title={`Current Element: ${elements.find(e => e.value === selectedElement)?.label || 'Auto'}`}
            >
              <span className="text-base">
                {elements.find(e => e.value === selectedElement)?.icon || '🔮'}
              </span>
            </button>
            
            {showElementSelector && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-40 min-w-40">
                {elements.map((element) => (
                  <button
                    key={element.value}
                    onClick={() => {
                      setSelectedElement(element.value);
                      setShowElementSelector(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedElement === element.value ? 'bg-slate-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span>{element.icon}</span>
                    <span className={`text-sm ${element.color}`}>{element.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend(false)}
            disabled={!message.trim() || isStreaming || isVoiceMode}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Click-outside handlers */}
      {showElementSelector && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowElementSelector(false)}
        />
      )}
      
      {showLanguageSelector && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowLanguageSelector(false)}
        />
      )}
      
      {/* Prosody Debug Overlay */}
      {showDebugPanel && (
        <ProsodyDebugOverlay
          element={pipelineDebug?.element || selectedElement}
          mirrorLine={pipelineDebug?.mirrorLine || "Matching user energy with empathetic tone"}
          balanceLine={pipelineDebug?.balanceLine || "Applying contextual balance"}
          phase={pipelineDebug?.phase || "balance"}
          shaped={pipelineDebug?.shaped}
          raw={pipelineDebug?.raw}
          debugData={pipelineDebug}
          greetingContext={{
            sessionType: isFirstSession ? 'first_session' : (trustLevel > 0.7 ? 'context_aware' : 'returning_user'),
            userName: userName,
            rememberedElement: selectedElement !== 'auto' ? selectedElement : undefined,
            adaptiveGreeting: getAdaptiveGreeting()
          }}
          onClose={() => onDebugToggle?.()}
        />
      )}

      {/* Semantic Recall Debug Overlay */}
      <RecallDebugOverlay
        memories={recallMemories}
        visible={showRecallDebug}
        onClose={() => setShowRecallDebug(false)}
      />
    </div>
  );
}