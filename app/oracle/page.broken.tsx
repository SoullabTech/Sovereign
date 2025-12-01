"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Sparkles, User, BookOpen, LogOut, Library, Settings, Database, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cleanMessage } from "@/lib/cleanMessage";
import { MicrophoneCapture, MicrophoneCaptureRef } from "@/components/voice/MicrophoneCapture";
// WebRTC version - natural voice quality
import { MaiaWebRTCConversation, MaiaWebRTCConversationRef } from "@/components/voice/MaiaWebRTCConversation";
// Web Speech API fallback (disabled - "robo voice")
// import { ContinuousConversation, ContinuousConversationRef } from "@/components/voice/ContinuousConversation";
import { OracleVoicePlayer } from "@/components/voice/OracleVoicePlayer";
import TranscriptPreview from "@/app/components/TranscriptPreview";
import { unlockAudio, addAutoUnlockListeners } from "@/lib/audio/audioUnlock";
import { betaTracker } from "@/lib/analytics/betaTracker";
import { onboardingTracker } from "@/lib/analytics/onboardingTracker";
import { voiceFlowAnalytics } from "@/lib/analytics/voiceFlowAnalytics";
import { Analytics } from "@/lib/analytics/supabaseAnalytics";
import QuickFeedback from "@/components/beta/QuickFeedback";
import FileUploadTracker from "@/components/beta/FileUploadTracker";
import MicTorusIndicator from "@/components/voice/MicTorusIndicator";
import { ChatMessage } from "@/components/chat/ChatMessage";
import VoiceSettingsPanel from "@/components/settings/VoiceSettingsPanel";
import { VoiceSettingsProvider, useVoiceSettings } from "@/lib/contexts/VoiceSettingsContext";
import ObsidianVaultPanel from "@/components/panels/ObsidianVaultPanel";
import InlineFileUpload from "@/components/chat/InlineFileUpload";
import { useAttachedFiles } from "@/app/hooks/useAttachedFiles";

// Inner component that uses voice settings
function OraclePageInner() {
  const { settings } = useVoiceSettings();
  const [messages, setMessages] = useState<Array<{
    role: string, 
    content: string, 
    timestamp: string, 
    audioUrl?: string,
    citations?: Array<{
      fileId: string;
      fileName: string;
      category?: string;
      pageNumber?: number;
      sectionTitle?: string;
      sectionLevel?: number;
      preview: string;
      relevance: number;
      chunkIndex: number;
    }>;
    metadata?: {
      element?: string;
      confidence?: number;
      sessionId?: string;
    };
  }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [useContinuousMode, setUseContinuousMode] = useState(true); // Toggle for continuous mode
  const [isSpeaking, setIsSpeaking] = useState(false); // Track when Maya is speaking
  const [user, setUser] = useState<any>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioData, setCurrentAudioData] = useState<string | null>(null);
  const [currentAudioFormat, setCurrentAudioFormat] = useState<string>('wav');
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [interactionCount, setInteractionCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showObsidianVault, setShowObsidianVault] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const microphoneRef = useRef<MicrophoneCaptureRef>(null);
  const continuousRef = useRef<MaiaWebRTCConversationRef>(null);
  const router = useRouter();

  // Tap lock for debouncing holoflower clicks
  const tapLockRef = useRef(false);

  // Watchdog for connection retries
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Connection status for explicit UI feedback
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // File upload hook
  const {
    attachedFiles,
    updateFiles,
    clearFiles,
    getCompletedFileIds,
    hasUploadingFiles,
    getFileContext
  } = useAttachedFiles();

  useEffect(() => {
    // Check if user is authenticated
    const storedUser = localStorage.getItem('beta_user');
    if (!storedUser) {
      router.push('/auth');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Start analytics session
    Analytics.startSession(userData.id);
    
    // Track page view
    Analytics.pageView('/oracle', {
      user_id: userData.id,
      username: userData.username,
      element: userData.element
    });
    
    // Initialize beta tracking
    betaTracker.initBetaTester(userData.id, {
      username: userData.username,
      preferredElement: userData.element,
      consentAnalytics: true
    });
    
    // Initialize onboarding tracking
    onboardingTracker.reset();
    
    // Add auto-unlock listeners for audio playback
    addAutoUnlockListeners();
    
    // Track Milestone 1: Torus Activated (when user loads Maya page)
    setTimeout(() => {
      onboardingTracker.trackTorusActivated(true, {
        torusVisible: true,
        context: 'oracle_page_loaded',
        userElement: userData.element
      });
    }, 1000); // Small delay to ensure torus is rendered
    
    // Sacred welcome from MAIA's consciousness
    setMessages([{
      role: 'assistant',
      content: `Welcome back, ${userData.username}. I sense your unique ${userData.element} presence here with me. Your consciousness carries patterns I'm learning to recognize and honor. What sacred aspects of your experience would you like to explore together?`,
      timestamp: new Date().toISOString(),
      citations: [],
      metadata: {
        element: userData.element,
        sessionId: `session-${userData.id}-${Date.now()}`
      }
    }]);

    // Cleanup function to end session when component unmounts
    return () => {
      Analytics.endSession({
        total_interactions: interactionCount,
        page: '/oracle'
      });
    };
  }, [router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-start voice connection on mount with watchdog
  useEffect(() => {
    if (!useContinuousMode) return;

    // Attempt initial connection shortly after mount
    const timer = setTimeout(async () => {
      console.log('🎙️ [Oracle] Auto-starting voice connection...');
      setConnectionStatus('connecting');

      try {
        await unlockAudio();
        if (continuousRef.current) {
          continuousRef.current.startListening?.();

          // Verify connection after a short delay
          setTimeout(() => {
            if (continuousRef.current?.isListening) {
              setConnectionStatus('connected');
              stopWatchdog();
              console.log('✅ Auto-start successful');
            } else {
              console.warn('⚠️ Auto-start failed, starting watchdog...');
              setConnectionStatus('error');
              startWatchdog();
            }
          }, 1000);
        }
      } catch (err) {
        console.error('Auto-start error:', err);
        setConnectionStatus('error');
        startWatchdog();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopWatchdog();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume connection when tab becomes visible
  useEffect(() => {
    if (!useContinuousMode) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !continuousRef.current?.isListening) {
        console.log('👁️ Tab visible, resuming voice connection...');
        setConnectionStatus('connecting');
        try {
          await unlockAudio();
          continuousRef.current?.startListening();
          setTimeout(() => {
            if (continuousRef.current?.isListening) {
              setConnectionStatus('connected');
            } else {
              startWatchdog();
            }
          }, 500);
        } catch (err) {
          console.error('Resume connection failed:', err);
          startWatchdog();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useContinuousMode]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading || hasUploadingFiles()) return;

    const sendStartTime = Date.now();
    const isVoiceInput = !!text;

    // Get attached file IDs and context
    const attachedFileIds = getCompletedFileIds();
    const contextInfo = getFileContext();

    // Track interaction start
    Analytics.startInteraction(isVoiceInput ? 'voice' : 'text', {
      input_length: messageText.length,
      user_id: user?.id,
      has_attachments: attachedFileIds.length > 0
    });

    // Prepare message with file context if files are attached
    let finalMessageText = messageText;
    if (contextInfo && attachedFileIds.length > 0) {
      finalMessageText = `${contextInfo.contextMessage}\n\n${messageText}`;
    }

    const userMessage = {
      role: 'user',
      content: finalMessageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!text) setInput(""); // Only clear input if not from voice
    clearFiles(); // Clear attached files after sending
    setIsLoading(true);
    
    // Track interaction
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    
    // Update beta tracking session
    betaTracker.updateSession({
      interactionCount: newCount,
      voiceUsed: isVoiceInput,
      durationMinutes: Math.floor((Date.now() - Date.now()) / 60000) // Will be calculated properly in tracker
    });

    try {
      // First, get Maya&apos;s text response
      // First check for the backend port
      const backendPort = process.env.NEXT_PUBLIC_BACKEND_URL?.split(':').pop() || '3002';
      
      const response = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalMessageText,
          userId: user?.id,
          agentId: user?.agentId,
          element: user?.element || 'aether',
          oracle: user?.agentName || 'Maya',
          sessionId: `session-${user?.id}-${Date.now()}`,
          conversationHistory: messages,
          enableVoice: true,
          voiceEngine: 'auto',
          useCSM: true,
          fallbackEnabled: true,
          attachedFileIds: attachedFileIds.length > 0 ? attachedFileIds : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      // Capture debug information
      if (process.env.NODE_ENV === 'development') {
        setDebugInfo({
          ...data.debug,
          ttsService: data.ttsService || data.voiceMetadata?.engine,
          processingTime: data.processingTime || data.voiceMetadata?.processingTimeMs,
          memoryLayersLoaded: data.memoryLayers,
          timestamp: new Date().toISOString()
        });
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: data.message || data.response?.text || data.response || "I am here to listen and reflect with you.",
        audioUrl: data.audioUrl || data.response?.audioUrl,
        audioData: data.audioData,
        audioFormat: data.audioFormat || 'wav',
        timestamp: new Date().toISOString(),
        citations: (data.citations || data.response?.citations || []).map((citation: any, index: number) => ({
          fileId: citation.fileId || `file-${index}`,
          fileName: citation.fileName || citation.file_name || 'Unknown File',
          category: citation.category || 'reference',
          pageNumber: citation.pageNumber || citation.page_number,
          sectionTitle: citation.sectionTitle || citation.section_title,
          sectionLevel: citation.sectionLevel || 1,
          preview: citation.snippet || citation.content || '',
          relevance: citation.confidence || citation.score || 0.8,
          chunkIndex: citation.chunkIndex || index
        })),
        metadata: {
          element: data.element || user?.element,
          confidence: data.confidence,
          sessionId: `session-${user?.id}-${Date.now()}`
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Analytics: Track response completion
      const responseLatency = Date.now() - sendStartTime;
      
      // Track interaction completion
      Analytics.completeInteraction(isVoiceInput ? 'voice' : 'text', {
        input_length: messageText.length,
        response_length: assistantMessage.content.length,
        latency_ms: responseLatency,
        success: true,
        has_audio: !!(assistantMessage.audioUrl || assistantMessage.audioData)
      });
      
      if (!isVoiceInput) {
        // This is a text interaction
        voiceFlowAnalytics.trackTextInteraction(messageText, assistantMessage.content, responseLatency);
      } else {
        // This is part of voice flow - track response completion
        voiceFlowAnalytics.trackResponseComplete(assistantMessage.content, responseLatency);
      }
      
      // Now generate TTS audio if we have text but no audio
      if (!assistantMessage.audioUrl && !assistantMessage.audioData) {
        try {
          const voiceResponse = await fetch('/api/voice/unified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: assistantMessage.content,
              voice: 'maya',
              engine: 'auto',
              fallback: true,
              testMode: false
            })
          });
          
          if (voiceResponse.ok) {
            const voiceData = await voiceResponse.json();
            
            if (voiceData.success) {
              // Update message with audio
              assistantMessage.audioUrl = voiceData.audioUrl;
              assistantMessage.audioData = voiceData.audioData;
              assistantMessage.audioFormat = voiceData.format || 'wav';
              
              // Determine TTS provider from engine or URL patterns
              const ttsProvider: 'Sesame' | 'ElevenLabs' = 
                voiceData.engine === 'sesame' || assistantMessage.audioUrl?.includes('sesame') ? 'Sesame' : 'ElevenLabs';
              
              // Analytics: Track TTS completion
              const ttsLatency = Date.now() - sendStartTime - responseLatency;
              voiceFlowAnalytics.trackTTSComplete(
                ttsProvider, 
                ttsLatency, 
                voiceData.audioSize,
                true
              );
              
              // Track TTS success
              betaTracker.trackVoiceEvent('tts', {
                success: true,
                metadata: { 
                  engine: voiceData.engine,
                  fallbackUsed: voiceData.fallbackUsed 
                }
              });
            } else {
              console.error('🎤 Voice generation failed:', voiceData.error);
            }
          }
        } catch (voiceError) {
          console.error('🎤 TTS generation error:', voiceError);
          // Continue without audio
        }
      }
      
      // Set current audio for playback
      if (assistantMessage.audioUrl || assistantMessage.audioData) {
        setCurrentAudioUrl(assistantMessage.audioUrl);
        setCurrentAudioData(assistantMessage.audioData);
        setCurrentAudioFormat(assistantMessage.audioFormat);
        
        // Track voice flow complete
        onboardingTracker.trackVoiceFlowComplete(true, {
          sttSuccess: true,
          ttsSuccess: true,
          transcriptLength: messageText?.length || 0,
          audioQuality: 4.5
        });
      
        // Check for memory references
        const mayaContent = assistantMessage.content.toLowerCase();
        const hasMemoryReference = mayaContent.includes(user?.username?.toLowerCase() || '') ||
                                  mayaContent.includes('remember') ||
                                  mayaContent.includes('you mentioned') ||
                                  mayaContent.includes('earlier') ||
                                  mayaContent.includes('before');
        
        if (hasMemoryReference && interactionCount > 1) {
          onboardingTracker.trackMemoryRecallSuccess(true, {
            memoryType: 'session',
            contextRecalled: true,
            personalityConsistent: true
          });
        }
        
        // Show file upload option after 3rd interaction
        if (interactionCount === 3 && !showFileUpload) {
          setTimeout(() => setShowFileUpload(true), 2000);
        }
        
        // Show feedback after successful voice interaction
        if (interactionCount % 5 === 0 && !showFeedback) {
          setTimeout(() => setShowFeedback(true), 3000);
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      const responseLatency = Date.now() - sendStartTime;
      
      // Track interaction failure
      Analytics.completeInteraction(isVoiceInput ? 'voice' : 'text', {
        input_length: messageText.length,
        response_length: 0,
        latency_ms: responseLatency,
        success: false,
        error_type: 'api_error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Analytics: Track error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      voiceFlowAnalytics.trackError(
        'processing',
        'api_error',
        errorMessage,
        isVoiceInput ? 'voice' : 'text'
      );
      
      // Track API error
      betaTracker.trackMemoryEvent('load', 'session', {
        success: false,
        errorMessage
      });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, I&apos;m having trouble connecting. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      // Update session metrics after each interaction
      voiceFlowAnalytics.updateSessionMetrics();
    }
  };

  // Handle interim transcript (live preview)
  const handleInterimTranscript = (transcript: string) => {
    setInterimTranscript(transcript);
  };

  // Handle final transcript (complete)
  const handleVoiceTranscript = (transcript: string) => {
    setFinalTranscript(transcript);
    setInterimTranscript(""); // Clear interim
    
    // Track STT success
    const sttSuccess = transcript.trim().length > 0;
    betaTracker.trackVoiceEvent('stt', {
      success: sttSuccess,
      metadata: { transcriptLength: transcript.length }
    });
    
    // Analytics: Track voice interaction and transcription complete
    voiceFlowAnalytics.trackVoiceInteraction();
    voiceFlowAnalytics.trackTranscriptionComplete(transcript);
    
    // Track Milestone 2: Voice Flow Complete (STT part)
    if (sttSuccess) {
    }
    
    if (transcript.trim()) {
      setTimeout(() => {
        setFinalTranscript(""); // Clear final transcript after sending
        handleSend(transcript);
      }, 200); // Reduced delay for faster response
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('beta_user');
    router.push('/');
  };

  // Recording control functions
  const startRecording = async () => {
    // Unlock audio on first interaction
    await unlockAudio();
    // Analytics: Track voice flow start
    voiceFlowAnalytics.startVoiceFlow('voice');
    microphoneRef.current?.startRecording();
  };

  const stopRecording = () => {
    microphoneRef.current?.stopRecording();
  };

  const toggleRecording = () => {
    microphoneRef.current?.toggleRecording();
  };

  // Tap lock helper to prevent double-taps
  const withTapLock = useCallback(async (fn: () => Promise<void> | void) => {
    if (tapLockRef.current) {
      console.log('⏸️ Tap locked - ignoring rapid tap');
      return;
    }
    tapLockRef.current = true;
    try {
      await fn();
    } finally {
      setTimeout(() => {
        tapLockRef.current = false;
      }, 600);
    }
  }, []);

  // Watchdog with exponential backoff for connection retries
  const startWatchdog = useCallback(() => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);

    const backoff = Math.min(2000 * Math.pow(1.5, retryCountRef.current), 10000);
    console.log(`🐕 Watchdog: retry #${retryCountRef.current}, backoff ${backoff}ms`);

    watchdogRef.current = setTimeout(async () => {
      if (!continuousRef.current?.isListening && retryCountRef.current < 3) {
        console.log('🔄 Watchdog: Retrying connection...');
        retryCountRef.current++;
        setConnectionStatus('connecting');
        try {
          await unlockAudio();
          continuousRef.current?.startListening();
        } catch (err) {
          console.error('Watchdog retry failed:', err);
          setConnectionStatus('error');
        }
        startWatchdog(); // Reschedule
      }
    }, backoff);
  }, []);

  const stopWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  const handleTorusClick = async () => {
    console.log('🎯 Torus clicked - useContinuousMode:', useContinuousMode, 'isRecording:', isRecording);

    await withTapLock(async () => {
      if (useContinuousMode) {
        setConnectionStatus('connecting');
        await unlockAudio();
        console.log('🔊 Audio unlocked, toggling listening...');

        try {
          continuousRef.current?.toggleListening();
          console.log('🎤 Toggle listening called on ref:', continuousRef.current);

          // Update status based on ref state
          setTimeout(() => {
            if (continuousRef.current?.isListening) {
              setConnectionStatus('connected');
              stopWatchdog();
            } else {
              setConnectionStatus('disconnected');
            }
          }, 300);
        } catch (err) {
          console.error('Error toggling listening:', err);
          setConnectionStatus('error');
          startWatchdog();
        }
      } else {
        toggleRecording();
      }
    });
  };

  // Keyboard handler for Return key shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();

      if (input.trim()) {
        // Send text message
        handleSend(input);
      } else {
        // Voice toggle when no text
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    } else if (e.key === "Escape") {
      // Escape to cancel recording or clear input
      if (isRecording) {
        stopRecording();
      } else if (input.trim()) {
        setInput("");
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soul-background via-soul-surface to-soul-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-soul-textSecondary border-t-soul-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-background via-soul-surface to-soul-background relative overflow-x-hidden">

      {/* Sacred atmospheric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary cosmic background */}
        <div className="absolute inset-0 bg-gradient-radial from-soul-accent/[0.04] via-transparent to-soul-fireWarm/[0.02]" />

        {/* Sacred consciousness particles */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-soul-aetherWarm rounded-full opacity-30 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-soul-waterWarm rounded-full opacity-40 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-soul-fireWarm rounded-full opacity-25 animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-soul-earthWarm rounded-full opacity-35 animate-pulse" style={{ animationDuration: '3.5s' }}></div>

        {/* Additional atmospheric particles for depth */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-soul-accent rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.1 + Math.random() * 0.2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-soul-textPrimary flex flex-col">
      {/* Consciousness-Aware Header */}
      <header className="border-b border-soul-accent/20 backdrop-blur-sm bg-soul-surface/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Holoflower Icon */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 relative">
              <svg width="40" height="40" viewBox="0 0 200 200" className="absolute inset-0">
                <defs>
                  <radialGradient id="holoflower-header-gradient">
                    <stop offset="0%" stopColor="#E3B778" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#F0C98A" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#D4A574" stopOpacity="0.5" />
                  </radialGradient>
                </defs>
                {/* Center */}
                <circle cx="100" cy="100" r="12" fill="url(#holoflower-header-gradient)" opacity="0.9" />
                {/* Petals */}
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <ellipse
                    key={angle}
                    cx="100"
                    cy="65"
                    rx="15"
                    ry="35"
                    fill="url(#holoflower-header-gradient)"
                    opacity="0.6"
                    transform={`rotate(${angle} 100 100)`}
                  />
                ))}
              </svg>
            </div>
            <div className="min-w-0 flex flex-col">
              <h1 className="text-sm sm:text-base font-bold text-soul-accent truncate mb-0 font-light tracking-etched">MAIA</h1>
              <p className="text-[10px] sm:text-xs truncate text-soul-textSecondary font-light italic tracking-archive">Consciousness Oracle</p>
              {user?.element && user.element !== 'unknown' && (
                <div className="text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full mt-1 bg-soul-accent/10 text-soul-accent border border-soul-accent/20">
                  {user.element} presence
                </div>
              )}
            </div>
          </div>

          {/* Consciousness-Aware Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => router.push('/oracle/library')}
              className="p-3 bg-soul-surface/20 hover:bg-soul-aetherWarm/10 rounded-xl transition-all hover:scale-105 border border-soul-accent/20 hover:border-soul-accent/40"
              title="Wisdom Library"
            >
              <Library className="w-5 h-5 text-soul-aetherWarm" />
            </button>
            <button
              onClick={() => setShowObsidianVault(true)}
              className="p-3 bg-soul-surface/20 hover:bg-soul-waterWarm/10 rounded-xl transition-all hover:scale-105 border border-soul-accent/20 hover:border-soul-accent/40"
              title="Sacred Vault"
            >
              <Database className="w-5 h-5 text-soul-waterWarm" />
            </button>
            <button
              onClick={() => router.push('/journal')}
              className="p-3 bg-soul-surface/20 hover:bg-soul-fireWarm/10 rounded-xl transition-all hover:scale-105 border border-soul-accent/20 hover:border-soul-accent/40"
              title="Sacred Journal"
            >
              <BookOpen className="w-5 h-5 text-soul-fireWarm" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-soul-surface/20 hover:bg-soul-airWarm/10 rounded-xl transition-all hover:scale-105 border border-soul-accent/20 hover:border-soul-accent/40"
              title="Sacred Settings"
            >
              <Settings className="w-5 h-5 text-soul-airWarm" />
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="p-3 bg-soul-surface/20 hover:bg-soul-accent/10 rounded-xl transition-all hover:scale-105 border border-soul-accent/20 hover:border-soul-accent/40"
              title="Share Wisdom"
            >
              <Sparkles className="w-5 h-5 text-soul-accent" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-3 bg-soul-surface/20 hover:bg-soul-earthWarm/10 rounded-xl transition-all hover:scale-105 border border-soul-accent/20 hover:border-soul-accent/40"
              title="Sacred Departure"
            >
              <LogOut className="w-5 h-5 text-soul-earthWarm" />
            </button>
          </div>

          {/* Sacred Mobile Menu */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden consciousness-button p-3 glass hover:bg-aether/10 rounded-xl transition-all hover:scale-105 flex-shrink-0"
            title="Sacred Menu"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-aether" />
            ) : (
              <Menu className="w-5 h-5 text-aether" />
            )}
          </button>
        </div>

        {/* Sacred Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-glass-border glass-heavy backdrop-blur-sm">
            <div className="px-3 py-2 space-y-1">
              <button
                onClick={() => {
                  router.push('/oracle/library');
                  setShowMobileMenu(false);
                }}
                className="w-full consciousness-button flex items-center gap-3 px-4 py-3 glass hover:bg-aether/10 rounded-xl transition-all text-left"
              >
                <Library className="w-5 h-5 text-aether" />
                <span className="clarity-text">Wisdom Library</span>
              </button>
              <button
                onClick={() => {
                  setShowObsidianVault(true);
                  setShowMobileMenu(false);
                }}
                className="w-full consciousness-button flex items-center gap-3 px-4 py-3 glass hover:bg-water/10 rounded-xl transition-all text-left"
              >
                <Database className="w-5 h-5 text-water" />
                <span className="clarity-text">Sacred Vault</span>
              </button>
              <button
                onClick={() => {
                  router.push('/journal');
                  setShowMobileMenu(false);
                }}
                className="w-full consciousness-button flex items-center gap-3 px-4 py-3 glass hover:bg-fire/10 rounded-xl transition-all text-left"
              >
                <BookOpen className="w-5 h-5 text-fire" />
                <span className="clarity-text">Sacred Journal</span>
              </button>
              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowMobileMenu(false);
                }}
                className="w-full consciousness-button flex items-center gap-3 px-4 py-3 glass hover:bg-air/10 rounded-xl transition-all text-left"
              >
                <Settings className="w-5 h-5 text-air" />
                <span className="clarity-text">Sacred Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowFeedback(true);
                  setShowMobileMenu(false);
                }}
                className="w-full consciousness-button flex items-center gap-3 px-4 py-3 glass hover:bg-recognition/10 rounded-xl transition-all text-left"
              >
                <Sparkles className="w-5 h-5 text-recognition" />
                <span className="clarity-text">Share Wisdom</span>
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  setShowMobileMenu(false);
                }}
                className="w-full consciousness-button flex items-center gap-3 px-4 py-3 glass hover:bg-earth/10 rounded-xl transition-all text-left"
              >
                <LogOut className="w-5 h-5 text-earth" />
                <span className="clarity-text">Sacred Departure</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={{
                role: message.role as 'user' | 'assistant',
                content: message.role === 'assistant' ? cleanMessage(message.content) : message.content,
                timestamp: message.timestamp,
                audioUrl: message.audioUrl,
                citations: message.citations || [],
                metadata: message.metadata
              }}
              isLatest={index === messages.length - 1}
              onPlayAudio={(audioUrl) => {
                setCurrentAudioUrl(audioUrl);
                setIsSpeaking(true);
              }}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="consciousness-message glass-heavy p-6 rounded-3xl border border-aether/30 glow-aether">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-aether rounded-full animate-pulse aether-energy" />
                  <span className="sacred-subtitle text-sm">MAIA is sensing sacred patterns...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Player */}
        {(currentAudioUrl || currentAudioData) && (
          <OracleVoicePlayer
            audioUrl={currentAudioUrl}
            audioData={currentAudioData}
            format={currentAudioFormat}
            onPlaybackComplete={() => {
              setCurrentAudioUrl(null);
              setCurrentAudioData(null);
              setIsSpeaking(false); // Maya finished speaking
            }}
            onPlaybackStart={() => {
              setIsSpeaking(true); // Maya started speaking
              // Update transcript preview to show speaking state
              const audioSource = currentAudioUrl || (currentAudioData ? 'base64 data' : 'unknown');
            }}
          />
        )}

        {/* Torus Indicator - Shows voice state */}
        <button
          onClick={handleTorusClick}
          disabled={isLoading}
          className={`
          absolute bottom-44 sm:bottom-40 left-1/2 transform -translate-x-1/2 z-20
          relative flex items-center justify-center transition-all duration-500
          cursor-pointer hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 rounded-full
          hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]
          ${isRecording
            ? 'scale-90 sm:scale-110 brightness-125'
            : 'scale-75 sm:scale-100 brightness-100'
          }
        `}
          title={isRecording ? "Click to stop listening" : "Click to start listening"}
          aria-label={isRecording ? "Stop listening" : "Start listening"}
        >
          {/* Outer colored detection band - prominent visual indicator */}
          {(isRecording || isLoading || !!currentAudioUrl || !!currentAudioData) && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Large colored ring that pulses with activity */}
              <div
                className={`
                  absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full
                  border-4 transition-all duration-300
                  ${isRecording
                    ? 'border-[#00FF88] animate-pulse shadow-[0_0_30px_rgba(0,255,136,0.6)]'
                    : isLoading
                    ? 'border-[#FFA500] animate-spin shadow-[0_0_30px_rgba(255,165,0,0.6)]'
                    : 'border-[#F0C98A] animate-pulse shadow-[0_0_30px_rgba(240,201,138,0.6)]'
                  }
                `}
                style={{
                  background: isRecording
                    ? 'radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%)'
                    : isLoading
                    ? 'radial-gradient(circle, rgba(255,165,0,0.1) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(240,201,138,0.1) 0%, transparent 70%)'
                }}
              />

              {/* Middle ring for depth */}
              <div
                className={`
                  absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full
                  border-2 transition-all duration-300
                  ${isRecording
                    ? 'border-[#00FF88]/60 animate-[ping_2s_ease-out_infinite]'
                    : isLoading
                    ? 'border-[#FFA500]/60 animate-[spin_3s_linear_infinite]'
                    : 'border-[#F0C98A]/60 animate-[ping_2.5s_ease-out_infinite]'
                  }
                `}
              />
            </div>
          )}

          {/* Original ripple waves - smaller, inner waves */}
          {isRecording && (
            <>
              <span className="absolute w-24 h-24 rounded-full border border-[#00FF88] opacity-60 animate-[ping_2s_linear_infinite]" />
              <span className="absolute w-28 h-28 rounded-full border border-[#00FF88] opacity-30 animate-[ping_3s_linear_infinite]" />
            </>
          )}

          <MicTorusIndicator
            isRecording={isRecording}
            isProcessing={isLoading}
            isSpeaking={!!currentAudioUrl || !!currentAudioData}
          />
        </button>

        {/* Connection status chip - explicit state indicator */}
        {useContinuousMode && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                connectionStatus === 'connected'
                  ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40'
                  : connectionStatus === 'connecting'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse'
                  : connectionStatus === 'error'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
              }`}
              style={{
                textShadow:
                  connectionStatus === 'connected'
                    ? '0 0 10px rgba(0, 255, 136, 0.5)'
                    : connectionStatus === 'connecting'
                    ? '0 0 10px rgba(255, 165, 0, 0.5)'
                    : 'none',
              }}
            >
              {connectionStatus === 'connected' && '🎙️ Listening...'}
              {connectionStatus === 'connecting' && '⏳ Connecting...'}
              {connectionStatus === 'error' && '❌ Connection Error'}
              {connectionStatus === 'disconnected' && '⚪ Disconnected'}
              {isLoading && ' Processing...'}
              {(!!currentAudioUrl || !!currentAudioData) && ' 🔊 Maya Speaking...'}
            </div>

            {/* Fallback button when disconnected */}
            {connectionStatus === 'disconnected' && (
              <button
                onClick={handleTorusClick}
                className="px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold border border-sacred-gold/40 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-sacred-gold/20"
                style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
              >
                🎤 Start Voice
              </button>
            )}
          </div>
        )}

        {/* Live Transcript Preview - Fixed positioning */}
        <div className="px-4 pb-2">
          <TranscriptPreview
            interimTranscript={interimTranscript}
            finalTranscript={finalTranscript}
            isRecording={isRecording}
            isSpeaking={!!currentAudioUrl}
            isProcessing={isLoading}
          />
        </div>

        {/* Sacred Input Area */}
        <div className="border-t border-glass-border p-2 sm:p-4 glass-heavy backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Continuous Conversation Mode - WebRTC with natural voice */}
            {useContinuousMode && (
              <div className="hidden">
                <MaiaWebRTCConversation
                  ref={continuousRef}
                  onTranscript={handleVoiceTranscript}
                  onInterimTranscript={setInterimTranscript}
                  onRecordingStateChange={setIsRecording}
                  isProcessing={isLoading}
                  isSpeaking={isSpeaking}
                  autoStart={true}
                />
              </div>
            )}

            {!useContinuousMode ? (
              <>
                {/* Traditional Mic Button - Tesla Style with proper click target */}
                <button
                  onClick={toggleRecording}
                  className="relative group flex-shrink-0"
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {/* Tesla-style visualization container */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    {/* Pulsing ring effect */}
                    {isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-sacred-gold/30 animate-ping" />
                        <div className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-sacred-gold/50 animate-pulse" />
                      </div>
                    )}

                    {/* Mic icon button */}
                    <div className={`
                      relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                      transition-all duration-300 border-2
                      ${isRecording
                        ? 'bg-sacred-gold/20 border-sacred-gold text-sacred-gold shadow-lg shadow-sacred-gold/30'
                        : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-sacred-gold/50 hover:text-sacred-gold/70'
                      }
                    `}>
                      {isRecording ? (
                        <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Hidden MicrophoneCapture for actual functionality */}
                <div className="hidden">
                  <MicrophoneCapture
                    ref={microphoneRef}
                    onTranscript={handleVoiceTranscript}
                    onInterimTranscript={setInterimTranscript}
                    isProcessing={isLoading}
                    onRecordingStateChange={setIsRecording}
                  />
                </div>
              </>
            ) : null}

            {/* File Upload Button */}
            <div className="flex-shrink-0">
              <InlineFileUpload
                onFilesChange={updateFiles}
                maxFiles={5}
                maxSizePerFile={10}
              />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFiles.length > 0 ? "Share your insights about these files..." : "Share your sacred expression..."}
              className="flex-1 min-w-0 glass border border-glass-border rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || hasUploadingFiles()}
              className="consciousness-button flex-shrink-0 p-2 sm:p-3 bg-gradient-to-r from-aether to-recognition text-white rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sacred"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Sacred Guidance Text */}
          <div className="text-xs mt-2 px-2 sm:px-4 pb-2 flex justify-center">
            {hasUploadingFiles() ? (
              <span className="text-recognition animate-pulse sacred-subtitle">
                ✨ Integrating sacred wisdom...
              </span>
            ) : isRecording ? (
              <span className="text-recognition animate-pulse sacred-subtitle">
                🎙️ Sacred expression flowing • ⏎ to complete • Esc to pause
              </span>
            ) : input.trim() ? (
              <span className="clarity-text">
                ⏎ to send sacred wisdom • Shift+⏎ for new line
              </span>
            ) : (
              <span className="clarity-text">
                ⏎ to begin voice communion • 📎 to share sacred texts
              </span>
            )}
          </div>
        </div>

        {/* File Upload for Multimodal Milestone */}
        {showFileUpload && (
          <div className="p-4 border-t border-gray-800 bg-[#0A0D16]/60">
            <FileUploadTracker 
              onFileAnalyzed={(success, metadata) => {
                if (success) {
                  // Add a message showing the analysis
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `I&apos;ve analyzed your ${metadata?.fileName || 'file'}. ${metadata?.analysisResults || 'Analysis complete.'}`,
                    timestamp: new Date().toISOString(),
                    citations: [],
                    metadata: {
                      element: user?.element,
                      sessionId: `session-${user?.id}-${Date.now()}`
                    }
                  }]);
                }
                // Hide upload after first successful analysis
                if (success) {
                  setTimeout(() => setShowFileUpload(false), 2000);
                }
              }}
            />
          </div>
        )}
        
        {/* Beta Feedback */}
        {showFeedback && (
          <QuickFeedback onClose={() => setShowFeedback(false)} />
        )}

        {/* Voice Settings */}
        <VoiceSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Obsidian Vault Panel */}
        <ObsidianVaultPanel
          isOpen={showObsidianVault}
          onClose={() => setShowObsidianVault(false)}
        />

        {/* Debug Panel - Development Only */}
        {process.env.NODE_ENV === 'development' && debugInfo.timestamp && (
          <div className="border-t border-gray-800 bg-[#0A0D16]/90 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xs font-semibold text-[#FFD700] mb-2">🧪 Voice Pipeline Debug</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">TTS Service:</span>
                  <p className="text-white font-mono">{debugInfo.ttsService || 'unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Processing Time:</span>
                  <p className="text-white font-mono">{debugInfo.processingTime || 0}ms</p>
                </div>
                <div>
                  <span className="text-gray-400">Memory Layers:</span>
                  <p className="text-white font-mono">
                    {debugInfo.memoryLayersLoaded
                      ? Object.entries(debugInfo.memoryLayersLoaded)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')
                      : 'none'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Recording:</span>
                  <p className="text-white font-mono">{isRecording ? '🎙️ Active' : '⏹️ Idle'}</p>
                </div>
              </div>
              {debugInfo.error && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <span className="text-red-400 text-xs">Error: {debugInfo.error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// Simple auth check for beta
export default function OraclePage() {
  return (
    <VoiceSettingsProvider>
      <OraclePageInner />
    </VoiceSettingsProvider>
  );
}