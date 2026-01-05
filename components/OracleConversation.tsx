// @ts-nocheck
// Oracle Conversation - Voice-synchronized sacred dialogue
// 🔄 MOBILE-FIRST DEPLOYMENT - Oct 2 12:15PM - Compact input, hidden overlays, fixed scroll
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X, Copy, BookOpen, Clock, FlaskConical, Mic, MicOff, Volume2 } from 'lucide-react';
// import { SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from './ui/SimplifiedOrganicVoice'; // REPLACED with Whisper
// import { WhisperVoiceRecognition } from './ui/WhisperVoiceRecognition'; // REPLACED with ContinuousConversation (uses browser Web Speech API)
import { ContinuousConversation, ContinuousConversationRef } from './voice/ContinuousConversation';
import { SacredHoloflower } from './sacred/SacredHoloflower';
import { RhythmHoloflower } from './liquid/RhythmHoloflower';
import { ConversationalRhythm, type RhythmMetrics } from '@/lib/liquid/ConversationalRhythm';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import AdaptiveVoiceMicButton from './ui/AdaptiveVoiceMicButton';
import { detectVoiceCommand, isOnlyModeSwitch, getModeConfirmation } from '@/lib/voice/VoiceCommandDetector';
import { QuickModeToggle } from './ui/QuickModeToggle';
// import MaiaChatInterface from './chat/MaiaChatInterface'; // File doesn't exist
import { EmergencyChatInterface } from './ui/EmergencyChatInterface';
import { SimpleVoiceMic } from './ui/SimpleVoiceMic';
import { OrganicVoiceMaia } from './ui/OrganicVoiceMaia';
// import { VoiceActivatedMaia as SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from './ui/VoiceActivatedMaiaFixed'; // File doesn't exist
import { AgentCustomizer } from './oracle/AgentCustomizer';
import { MaiaSettingsPanel } from './MaiaSettingsPanel';
import { MaiaFeedbackWidget } from './maia/MaiaFeedbackWidget';
import { PatternChips, PatternDrawer, type PatternMeta } from './memory';
import { ToolRevealSheet } from './wisdom/ToolRevealSheet';
import { formatMessageText } from '@/lib/text/formatMessageText';
import { HighlightedText } from './vocabulary/VocabularyTooltip';
import { normalizeAIResponse, type NormalizedAIResponse } from '@/lib/hooks/useOracleData';
import { ConsciousnessComputingPrompt } from './ConsciousnessComputingPrompt';
// import { QuickSettingsButton } from './QuickSettingsButton'; // Moved to bottom nav
import { QuickSettingsSheet } from './QuickSettingsSheet';
import { SoulprintMetricsWidget } from './SoulprintMetricsWidget';
import { ModernTextInput } from './ui/ModernTextInput';
import { MotionState, CoherenceShift } from './motion/MotionOrchestrator';
import { OracleResponse, ConversationContext as OracleConversationContext } from '@/lib/oracle-response';
// import { useElementalVoice } from '@/hooks/useElementalVoice'; // DISABLED - was causing OpenAI Realtime browser errors
import { mapResponseToMotion, enrichOracleResponse } from '@/lib/motion-mapper';
import { VoiceState } from '@/lib/voice/voice-capture';
// import { useMaiaVoice } from '@/hooks/useMaiaVoice'; // OLD TTS SYSTEM - replaced with WebRTC
// REMOVED OPENAI HIJACKING - MAIA speaks FROM THE BETWEEN at /api/between/chat
// REMOVED FORMANT VOICE ENGINE - MAIA now speaks with OpenAI Alloy voice
// import { getMaiaVoiceEngine, voiceStateManager, type Element } from '@/lib/voice';
import type { Element } from '@/lib/voice';
// import { useMAIASDK } from '@/hooks/useMAIASDK-simple'; // Fallback option (if needed)
// import { useMAIAHybrid as useMAIASDK } from '@/hooks/useMAIAHybrid'; // Hybrid (removed - we want full dynamics always)
import { cleanMessage, cleanMessageForVoice, formatMessageForDisplay } from '@/lib/cleanMessage';
import { getAgentConfig, AgentConfig } from '@/lib/agent-config';
import { toast } from 'react-hot-toast';
import { voiceLock } from '@/lib/services/VoiceLock';
import { trackEvent } from '@/lib/analytics/track';
import { saveConversationMemory, getOracleAgentId } from '@/lib/services/memoryService';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';
import { saveMessages as saveMessagesToSupabase, getMessagesBySession } from '@/lib/services/conversationStorageService';
import { generateGreeting, generateOnboardingGreeting } from '@/lib/services/greetingService';
import { BrandedWelcome } from './BrandedWelcome';
import { userTracker } from '@/lib/tracking/userActivityTracker';
// import { ModeSwitcher } from './ui/ModeSwitcher'; // Removed - file doesn't exist
import { SacredLabDrawer } from './ui/SacredLabDrawer';
import PromptPicker from './prompts/PromptPicker';
import SessionSynthesis, { type SessionSynthesisData } from './session/SessionSynthesis';
import { FloatingSessionIndicator } from './session/SessionArcIndicator';
import { SessionRecap, type SessionRecapData } from './session/SessionRecap';
import { DailyCheckin, type EmotionalState } from './checkin/DailyCheckin';
import { ElementDiscovery } from './discovery/ElementDiscovery';
import { WisdomCouncilPicker } from './wisdom/WisdomCouncilPicker';
import { CurrentTeachingModal } from './wisdom/CurrentTeachingModal';
import { ELDER_COUNCIL_TRADITIONS, type WisdomTradition } from '@/lib/consciousness/ElderCouncilService';
import { ConversationStylePreference } from '@/lib/preferences/conversation-style-preference';
import { detectJournalCommand, detectBreakthroughPotential } from '@/lib/services/conversationEssenceExtractor';
import { useFieldProtocolIntegration } from '@/hooks/useFieldProtocolIntegration';
import { useScribeMode } from '@/hooks/useScribeMode';
import { BookPlus } from 'lucide-react';
import { TransformationalPresence, type PresenceState } from './nlp/TransformationalPresence';
import { SessionTimer, SESSION_PRESETS } from '@/lib/session/SessionTimer';
import { SessionTimeAwareness } from '@/components/session/SessionTimeAwareness';
import { SessionDurationSelector } from '@/components/session/SessionDurationSelector';
import { ResumeSessionPrompt } from '@/components/session/ResumeSessionPrompt';
import { SessionRitualOpening } from '@/components/session/SessionRitualOpening';
import { SessionRitualClosing } from '@/components/session/SessionRitualClosing';
import { getSessionGong } from '@/lib/session/SessionGong';
import {
  loadSession,
  saveSession,
  clearSession,
  getSavedSessionTimeRemaining,
  getSavedSessionPhase,
  startAutoSave,
  type PersistedSessionData
} from '@/lib/session/SessionPersistence';
// 🧠 BARDIC MEMORY INTEGRATION - McGilchrist's master-emissary pattern
// Air (contextual wisdom) serves Fire (present emergence)
import {
  getConversationMemory,
  type ConversationContext,
  type PatternRecognitionResult,
  type CrystallizationDetection
} from '@/lib/memory/bardic/ConversationMemoryIntegration';
// 🌟 TEEN SUPPORT SYSTEM - ED-aware & Neurodivergent-affirming safety protocols
import {
  performTeenSafetyCheck,
  getTeenSystemPrompt,
  generateTeenSupportResponse,
  requiresTeenSupport,
  getTeenResources,
  type TeenProfile,
  type TeenSafetyCheck
} from '@/lib/safety/teenSupportIntegration';
import { calculateAge, getUserData, type UserData } from '@/lib/safety/teenProfileUtils';

// Time-aware greeting helper for welcome screen
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good evening'; // Late night feels like evening
}

// Canon Wrap localStorage helpers (default-on for Care mode)
const CANON_WRAP_KEY = 'maia.canonWrap.enabled';

function getCanonWrapEnabled(): boolean {
  if (typeof window === 'undefined') return true; // default-on for care
  const v = window.localStorage.getItem(CANON_WRAP_KEY);
  if (v === null) return true; // default-on
  return v === '1';
}

function setCanonWrapEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CANON_WRAP_KEY, enabled ? '1' : '0');
}

interface OracleConversationProps {
  userId?: string;
  userName?: string;
  userBirthDate?: string; // Birth date for age calculation and teen support
  userAge?: number; // Pre-calculated age (optional, will calculate from birthDate if not provided)
  sessionId: string;
  apiEndpoint?: string; // API endpoint to use for conversation (defaults to /api/between/chat)
  consciousnessType?: string; // Type of consciousness processing to use
  initialCheckIns?: Record<string, number>;
  showAnalytics?: boolean;
  voiceEnabled?: boolean;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'; // Voice selection for TTS
  voiceSpeed?: number; // TTS speed (0.25 - 4.0, default 0.95)
  voiceModel?: 'tts-1' | 'tts-1-hd'; // TTS model quality
  onVoiceChange?: (voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer') => void; // Notify parent of voice changes
  initialMode?: 'normal' | 'patient' | 'session'; // Control mode from parent
  onModeChange?: (mode: 'normal' | 'patient' | 'session') => void; // Notify parent of mode changes
  initialShowChatInterface?: boolean; // Control voice/text mode from parent
  onShowChatInterfaceChange?: (show: boolean) => void; // Notify parent of voice/text changes
  showSessionSelector?: boolean; // Control session selector from parent (header button)
  onCloseSessionSelector?: () => void; // Notify parent to close session selector
  onSessionActiveChange?: (active: boolean) => void; // Notify parent of session active state
  onMessageAdded?: (message: ConversationMessage) => void;
  onSessionEnd?: (reason?: string) => void;
  initialAction?: string; // Action to trigger on mount (e.g., 'choose-guide', 'show-current-elder')
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'oracle' | 'assistant';
  text?: string;
  content?: string;
  timestamp: Date | string;
  facetId?: string;
  motionState?: MotionState;
  coherenceLevel?: number;
  source?: 'user' | 'maia' | 'system';
  sender?: string;
  opusAxioms?: {
    isGold: boolean;
    passed: number;
    warnings: number;
    violations: number;
    evaluations?: Array<{
      axiom: string;
      status: 'pass' | 'warning' | 'violation';
      notes?: string;
    }>;
  };
  turnId?: number;
  // Pattern metadata for "Show why" drawer
  metadata?: {
    patterns?: Array<{
      id: string;
      key: string;
      sig?: number;
      seen?: number;
    }>;
    // Wisdom routing data for tool reveal
    wisdomRouting?: {
      activated: boolean;
      tool?: { id: string; name: string; description: string; agentConnection: string } | null;
      meta?: { agentName: string | null; patternType: string | null };
    };
  };
}

// Component to clean messages by removing stage directions while preserving emphasis
// Optionally highlights vocabulary terms for newcomers
const FormattedMessage: React.FC<{
  text: string | undefined;
  enableVocabularyTooltips?: boolean;
}> = ({ text, enableVocabularyTooltips = false }) => {
  const cleanedText = formatMessageText(text || '');
  if (enableVocabularyTooltips) {
    return <HighlightedText text={cleanedText} enableTooltips={true} />;
  }
  return <span>{cleanedText}</span>;
};

export const OracleConversation: React.FC<OracleConversationProps> = ({
  userId,
  userName,
  userBirthDate,
  userAge: propUserAge,
  sessionId,
  apiEndpoint = '/api/between/chat', // Default to current behavior
  consciousnessType = 'maia', // Default consciousness type
  initialCheckIns = {},
  showAnalytics = false,
  voiceEnabled = true,
  voice = 'alloy',
  voiceSpeed = 0.95,
  voiceModel = 'tts-1-hd',
  onVoiceChange,
  initialMode = 'normal',
  onModeChange,
  initialShowChatInterface = false,
  onShowChatInterfaceChange,
  showSessionSelector = false,
  onCloseSessionSelector,
  onSessionActiveChange,
  onMessageAdded,
  onSessionEnd,
  initialAction
}) => {
  // Listening mode for different conversation styles - MUST be defined early
  type ListeningMode = 'normal' | 'patient' | 'session';
  const [listeningMode, setListeningMode] = useState<ListeningMode>(initialMode);

  // Sync with parent's initialMode prop when it changes
  useEffect(() => {
    if (initialMode !== listeningMode) {
      setListeningMode(initialMode);
    }
  }, [initialMode]);

  // Track last connection time for intimate memory features
  useEffect(() => {
    const now = new Date().toISOString();
    localStorage.setItem('lastMaiaConnection', now);
  }, []); // Only run on mount

  // Notify parent when mode changes (use ref to avoid dependency loop)
  const onModeChangeRef = useRef(onModeChange);
  useEffect(() => {
    onModeChangeRef.current = onModeChange;
  }, [onModeChange]);

  useEffect(() => {
    if (onModeChangeRef.current) {
      onModeChangeRef.current(listeningMode);
    }
  }, [listeningMode]);

  // Map old mode names to new realtime mode names
  const realtimeMode: 'dialogue' | 'counsel' | 'scribe' =
    listeningMode === 'normal' ? 'dialogue' :
    listeningMode === 'patient' ? 'counsel' : 'scribe';

  // ==================== STATE DECLARATIONS (BEFORE HOOKS) ====================
  // These must be declared BEFORE useMaiaRealtime because they're used in its callbacks

  // Core conversation state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [userTranscript, setUserTranscript] = useState('');
  const [maiaResponseText, setMaiaResponseText] = useState('');
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [echoSuppressUntil, setEchoSuppressUntil] = useState<number>(0);

  // Voice/audio state
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIOSAudioEnabled, setIsIOSAudioEnabled] = useState(false);
  const [needsIOSAudioPermission, setNeedsIOSAudioPermission] = useState(false);
  const [isMicrophonePaused, setIsMicrophonePaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceAmplitude, setVoiceAmplitude] = useState(0);
  const [userVoiceState, setUserVoiceState] = useState<VoiceState | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true); // AUTO-START FIX: Start as true to enable immediate voice
  const [audioUnlocked, setAudioUnlocked] = useState(false); // Enhanced Safari audio unlock status
  const [showAudioUnlockUI, setShowAudioUnlockUI] = useState(false); // Show Safari unlock UI

  // Reference to current audio queue for enhanced Safari unlock functionality
  const currentAudioQueueRef = useRef<InstanceType<typeof import('@/lib/voice/StreamingAudioQueue').StreamingAudioQueue> | null>(null);

  // UI state
  const [showLabDrawer, setShowLabDrawer] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Wisdom tool reveal state
  const [activeWisdomTool, setActiveWisdomTool] = useState<{
    tool: { id: string; name: string; description: string; agentConnection: string } | null;
    agentName: string | null;
    userMessage: string;
  } | null>(null);
  const [showChatInterface, setShowChatInterface] = useState(initialShowChatInterface);

  // Sync local state with parent when prop changes
  useEffect(() => {
    setShowChatInterface(initialShowChatInterface);
  }, [initialShowChatInterface]);

  // Notify parent when local state changes
  // Use ref to avoid infinite loop from callback recreation
  const onShowChatInterfaceChangeRef = useRef(onShowChatInterfaceChange);
  useEffect(() => {
    onShowChatInterfaceChangeRef.current = onShowChatInterfaceChange;
  }, [onShowChatInterfaceChange]);

  useEffect(() => {
    onShowChatInterfaceChangeRef.current?.(showChatInterface);
  }, [showChatInterface]);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showVoiceText, setShowVoiceText] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Pattern drawer state (for "Show why" feature)
  const [patternDrawerOpen, setPatternDrawerOpen] = useState(false);
  const [activePattern, setActivePattern] = useState<PatternMeta | null>(null);

  const [enableVoiceInChat, setEnableVoiceInChat] = useState(() => {
    // Load saved preference from localStorage, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enableVoiceInChat');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [enableVoiceInput, setEnableVoiceInput] = useState(false); // Voice input mode toggle for chat interface
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [oracleAgentId, setOracleAgentId] = useState<string | null>(null);
  const [explorerId, setExplorerId] = useState<string>(''); // Stable cross-session identity
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [showJournalSuggestion, setShowJournalSuggestion] = useState(false); // Permanently disabled
  const [journalSuggestionDismissed, setJournalSuggestionDismissed] = useState(false);
  const [breakthroughScore, setBreakthroughScore] = useState(0);

  // 📓 JOURNAL → MAIA: Controlled composer draft for prefilled prompts
  const [composerDraft, setComposerDraft] = useState<string>('');

  // 🛡️ SANCTUARY MODE: Session-level memory exclusion (consent boundary)
  // When true: no content retention, no patterns formed, just presence
  const [isSanctuary, setIsSanctuary] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          return settings.sanctuary === true;
        }
      } catch (e) {
        console.warn('[Sanctuary] Failed to load initial state:', e);
      }
    }
    return false;
  });

  // Listen for sanctuary mode changes from QuickSettingsSheet
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent<{ sanctuary?: boolean }>) => {
      if (typeof event.detail?.sanctuary === 'boolean') {
        setIsSanctuary(event.detail.sanctuary);
        console.log(`🛡️ [Sanctuary] Mode ${event.detail.sanctuary ? 'ENABLED' : 'disabled'}`);
      }
    };

    window.addEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  
  // Session time container state
  const [sessionTimer, setSessionTimer] = useState<SessionTimer | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<PersistedSessionData | null>(null);
  const autoSaveCleanupRef = useRef<(() => void) | null>(null);

  // Ritual state
  const [showOpeningRitual, setShowOpeningRitual] = useState(false);
  const [showClosingRitual, setShowClosingRitual] = useState(false);
  const [pendingSessionDuration, setPendingSessionDuration] = useState<number | null>(null);

  // Soul Prompts & Session Synthesis state
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [showSessionSynthesis, setShowSessionSynthesis] = useState(false);
  const [sessionSynthesisData, setSessionSynthesisData] = useState<SessionSynthesisData | null>(null);

  // New member support features
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  const [showElementDiscovery, setShowElementDiscovery] = useState(false);
  const [showSessionRecap, setShowSessionRecap] = useState(false);
  const [sessionRecapData, setSessionRecapData] = useState<SessionRecapData | null>(null);
  const [userCheckinState, setUserCheckinState] = useState<{ state: EmotionalState; intensity: number } | null>(null);
  const [enableVocabularyTooltips, setEnableVocabularyTooltips] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maia.vocabularyTooltips');
      return stored === 'true';
    }
    return false;
  });

  // Wisdom Council state
  const [showWisdomCouncil, setShowWisdomCouncil] = useState(false);
  const [showCurrentTeaching, setShowCurrentTeaching] = useState(false);
  const [activeTradition, setActiveTradition] = useState<WisdomTradition | null>(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('maia.activeTradition');
      if (storedId) {
        return ELDER_COUNCIL_TRADITIONS.find(t => t.id === storedId) || null;
      }
    }
    return null;
  });

  // Handle initial action from URL (e.g., /maia?action=choose-guide)
  useEffect(() => {
    if (initialAction === 'choose-guide') {
      setShowWisdomCouncil(true);
    } else if (initialAction === 'show-current-elder') {
      setShowCurrentTeaching(true);
    }
  }, [initialAction]);

  // Holoflower/visualization state - Mobile responsive
  const [holoflowerSize, setHoloflowerSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 40 : 350; // 40px on mobile, 350px on desktop
    }
    return 350;
  });
  const [checkIns, setCheckIns] = useState<Record<string, number>>(initialCheckIns);
  const [activeFacetId, setActiveFacetId] = useState<string | undefined>();
  const [currentMotionState, setCurrentMotionState] = useState<MotionState>('idle');
  const [voiceAudioLevel, setVoiceAudioLevel] = useState(0);
  const [smoothedAudioLevel, setSmoothedAudioLevel] = useState(0);
  const [coherenceLevel, setCoherenceLevel] = useState(0.5);
  const [coherenceShift, setCoherenceShift] = useState<CoherenceShift>('stable');
  const [shadowPetals, setShadowPetals] = useState<string[]>([]);
  const [showBreakthrough, setShowBreakthrough] = useState(false);

  // 🌊 LIQUID AI - Rhythm tracking state
  const [rhythmMetrics, setRhythmMetrics] = useState<RhythmMetrics | null>(null);
  const [showRhythmDebug, setShowRhythmDebug] = useState(false); // Dev overlay toggle

  // 🧠 BARDIC MEMORY - Pattern recognition & crystallization state
  const [patternRecognition, setPatternRecognition] = useState<PatternRecognitionResult | null>(null);
  const [crystallizationState, setCrystallizationState] = useState<CrystallizationDetection | null>(null);
  const conversationMemory = useRef(getConversationMemory()).current;

  // 🌟 TEEN SUPPORT - Safety and support for teen users (ages 13-18)
  const [teenProfile, setTeenProfile] = useState<TeenProfile | undefined>();
  const [isTeenUser, setIsTeenUser] = useState(false);
  const [lastSafetyCheck, setLastSafetyCheck] = useState<TeenSafetyCheck | null>(null);

  // Calculate user age and determine if teen
  const userAge = propUserAge || (userBirthDate ? calculateAge(userBirthDate) : null);

  // Refs for mutable values (must be before hooks that use them)
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingMessageTextRef = useRef<string>('');
  const lastMaiaResponseRef = useRef<string>('');
  const lastUserMessageRef = useRef<string>('');
  const voiceMicRef = useRef<ContinuousConversationRef>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const welcomeInputRef = useRef<HTMLTextAreaElement>(null); // Separate ref for welcome screen input
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);
  const isRespondingRef = useRef(false);
  const isAudioPlayingRef = useRef(false);
  const isMicrophonePausedRef = useRef(false);
  const lastVoiceErrorRef = useRef<number>(0);
  const lastProcessedTranscriptRef = useRef<{ text: string; timestamp: number } | null>(null);
  const lastAudioCallbackUpdateRef = useRef<number>(0); // Throttle audio level callbacks
  const onMessageAddedRef = useRef(onMessageAdded); // Store callback in ref to avoid infinite loop

  // 🌊 LIQUID AI - Rhythm tracker instance
  const rhythmTrackerRef = useRef<ConversationalRhythm>(
    new ConversationalRhythm((metrics) => {
      setRhythmMetrics(metrics);
      console.log('🌊 [RHYTHM UPDATE]', {
        tempo: metrics.conversationTempo,
        coherence: metrics.rhythmCoherence.toFixed(2),
        breathAlignment: metrics.breathAlignment.toFixed(2),
        optimalDelay: Math.round(metrics.conversationTempo === 'fast' ? 500 : metrics.conversationTempo === 'slow' ? 2500 : 1200)
      });
    })
  );

  // Keep onMessageAdded ref updated
  useEffect(() => {
    onMessageAddedRef.current = onMessageAdded;
  }, [onMessageAdded]);

  // Dynamic holoflower size based on window width
  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerWidth <= 768 ? 40 : 350;
      setHoloflowerSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==================== RECORDING STATE CALLBACK ====================
  // Sync isListening state from ContinuousConversation to parent
  const handleRecordingStateChange = useCallback((isRecording: boolean) => {
    console.log('📡 Recording state changed:', isRecording);
    setIsListening(isRecording);
  }, []);

  // ==================== AUDIO LEVEL CALLBACK (THROTTLED) ====================
  // Prevent infinite render loop by throttling setState calls
  const handleAudioLevelChange = useCallback((amplitude: number, isSpeaking: boolean) => {
    const now = Date.now();
    // Only update state every 100ms (10fps) to avoid render loop
    if (now - lastAudioCallbackUpdateRef.current > 100) {
      setVoiceAmplitude(amplitude);
      setVoiceAudioLevel(amplitude);
      setUserVoiceState({
        isSpeaking,
        amplitude,
        pitch: 150,
        emotion: 'neutral' as const,
        energy: amplitude,
        clarity: 0.8,
        breathDepth: 0.5,
      });
      lastAudioCallbackUpdateRef.current = now;

      // 🌊 LIQUID AI - Track speech start/end for rhythm sensing
      if (isSpeaking && amplitude > 0.1) {
        rhythmTrackerRef.current?.onSpeechStart();
      }
    }
  }, []);

  // ==================== VOICE SYNTHESIS (OpenAI Alloy TTS) ====================
  // MAIA speaks with clear, natural OpenAI Alloy voice
  // Real-time audio amplitude analysis for voice visualization
  const startAudioAnalysis = useCallback((audio: HTMLAudioElement) => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Resume if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create analyser if not exists
      if (!audioAnalyserRef.current) {
        audioAnalyserRef.current = ctx.createAnalyser();
        audioAnalyserRef.current.fftSize = 256;
        audioAnalyserRef.current.smoothingTimeConstant = 0.8;
      }

      // Create new source for this audio element (only once per element)
      if (currentAudioRef.current !== audio) {
        // Disconnect old source if exists
        if (audioSourceRef.current) {
          try {
            audioSourceRef.current.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
        }

        audioSourceRef.current = ctx.createMediaElementSource(audio);
        audioSourceRef.current.connect(audioAnalyserRef.current);
        audioAnalyserRef.current.connect(ctx.destination);
        currentAudioRef.current = audio;
      }

      // Start amplitude reading loop
      const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);

      const readAmplitude = () => {
        if (!audioAnalyserRef.current) return;

        audioAnalyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average amplitude (0-1 range)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length / 255;

        // Apply some scaling for better visual effect
        const scaledAmplitude = Math.min(1, average * 2.5);
        setVoiceAmplitude(scaledAmplitude);

        // Continue loop while audio is playing
        if (!audio.paused && !audio.ended) {
          animationFrameRef.current = requestAnimationFrame(readAmplitude);
        }
      };

      readAmplitude();
      console.log('🎵 Audio analysis started');

    } catch (err) {
      console.warn('⚠️ Could not start audio analysis:', err);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setVoiceAmplitude(0);
  }, []);

  const maiaSpeak = useCallback(async (text: string, elementHint?: Element) => {
    if (!text || typeof window === 'undefined') return;

    try {
      console.log('🎵 Speaking with OpenAI Alloy:', text.substring(0, 100));

      // 🌊 LIQUID AI - Track MAIA response for rhythm turn-taking latency
      rhythmTrackerRef.current?.onMAIAResponse();

      setIsResponding(true);
      // 🔥 DON'T set isAudioPlaying here! It should only be true when audio ACTUALLY plays
      // setIsAudioPlaying is now set in audio.onplay callback below

      // Call OpenAI TTS with selected voice (defaults to 'alloy')
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: voice || 'alloy',  // Use the voice prop from parent
          speed: voiceSpeed,
          model: voiceModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      // Enable cross-origin for audio analysis
      audio.crossOrigin = 'anonymous';

      // Play audio with proper loading and error handling
      await new Promise<void>((resolve, reject) => {
        let hasStarted = false;
        let startTimeoutId: NodeJS.Timeout | null = null;
        let playbackTimeoutId: NodeJS.Timeout | null = null;

        // Safety timeout - if audio doesn't start within 5s, fail fast
        startTimeoutId = setTimeout(() => {
          if (!hasStarted) {
            audio.pause();
            stopAudioAnalysis();
            URL.revokeObjectURL(audioUrl);
            reject(new Error('Audio failed to start within 5s'));
          }
        }, 5000);

        audio.onloadedmetadata = () => {
          console.log('✅ Audio metadata loaded, duration:', audio.duration, 'seconds');
          console.log(`⏱️ [AUDIO] Expected playback: ${Math.round(audio.duration)}s for ${text.length} chars`);

          // 🔥 FIX: Set playback timeout based on ACTUAL audio duration + 30s buffer
          // This timeout only applies to playback, not TTS fetch
          const playbackTimeout = (audio.duration + 30) * 1000;
          console.log(`⏱️ [AUDIO] Setting playback timeout: ${playbackTimeout/1000}s`);
          playbackTimeoutId = setTimeout(() => {
            console.error(`❌ [AUDIO] Playback timeout! Audio at ${audio.currentTime.toFixed(1)}s of ${audio.duration.toFixed(1)}s`);
            audio.pause();
            stopAudioAnalysis();
            URL.revokeObjectURL(audioUrl);
            reject(new Error(`Audio playback timeout after ${playbackTimeout/1000}s`));
          }, playbackTimeout);
        };

        audio.oncanplaythrough = () => {
          console.log('✅ Audio can play through');
        };

        audio.onplay = () => {
          console.log('▶️ Audio started playing');
          hasStarted = true;
          if (startTimeoutId) clearTimeout(startTimeoutId);
          // 🔥 NOW set isAudioPlaying - audio is ACTUALLY playing
          // This triggers the teal visualizer at the right moment
          setIsAudioPlaying(true);
          // Start real-time audio analysis
          startAudioAnalysis(audio);
        };

        // Debug: Track if audio gets paused unexpectedly
        audio.onpause = () => {
          if (!audio.ended) {
            console.warn(`⚠️ [AUDIO] Paused at ${audio.currentTime.toFixed(1)}s of ${audio.duration.toFixed(1)}s (NOT ended yet!)`);
          }
        };

        audio.onended = () => {
          const playedDuration = audio.currentTime;
          const totalDuration = audio.duration;
          console.log(`🔇 MAIA finished speaking (audio.onended) - played ${playedDuration.toFixed(1)}s of ${totalDuration.toFixed(1)}s`);
          stopAudioAnalysis();
          // 🔥 DON'T set isAudioPlaying/isResponding here!
          // Let the caller handle state changes with proper cooldown timing
          // to prevent mic from restarting before echo suppression window
          URL.revokeObjectURL(audioUrl);
          if (startTimeoutId) clearTimeout(startTimeoutId);
          if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
          resolve();
        };

        audio.onerror = (e) => {
          console.error('❌ Audio playback error:', e);
          stopAudioAnalysis();
          // For errors, reset states immediately (no audio to echo)
          setIsResponding(false);
          setIsAudioPlaying(false);
          setIsMicrophonePaused(false);
          URL.revokeObjectURL(audioUrl);
          if (startTimeoutId) clearTimeout(startTimeoutId);
          if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
          reject(new Error('Audio playback failed'));
        };

        // Start playback
        audio.play().catch(err => {
          console.error('❌ Audio.play() failed:', err);
          stopAudioAnalysis();
          if (startTimeoutId) clearTimeout(startTimeoutId);
          if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
          reject(err);
        });
      });

    } catch (err) {
      console.error('❌ OpenAI TTS error, falling back to browser TTS:', err);

      // 🎙️ SOVEREIGNTY FALLBACK: Use browser Web Speech API when server TTS fails
      // This respects CLAUDE.md: "Voice: Local TTS/STT or browser APIs only"
      try {
        if ('speechSynthesis' in window) {
          console.log('🎵 Using browser speechSynthesis fallback');
          setIsAudioPlaying(true);

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;  // Slightly slower for clarity
          utterance.pitch = 1.0;
          utterance.volume = 0.9;

          // Try to find a good female voice
          const voices = speechSynthesis.getVoices();
          const preferredVoice = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            (v.name.includes('Female') && v.lang.startsWith('en'))
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

          if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('🎤 Using voice:', preferredVoice.name);
          }

          await new Promise<void>((resolve) => {
            utterance.onend = () => {
              console.log('🔇 Browser TTS finished speaking');
              setIsResponding(false);
              setIsAudioPlaying(false);
              resolve();
            };
            utterance.onerror = (e) => {
              console.error('❌ Browser TTS error:', e);
              setIsResponding(false);
              setIsAudioPlaying(false);
              resolve();
            };
            speechSynthesis.speak(utterance);
          });
          return; // Successfully spoke with browser TTS
        }
      } catch (fallbackErr) {
        console.error('❌ Browser TTS fallback also failed:', fallbackErr);
      }

      // If all TTS fails, just reset state
      stopAudioAnalysis();
      setIsResponding(false);
      setIsAudioPlaying(false);
    }
  }, [startAudioAnalysis, stopAudioAnalysis]);

  const maiaReady = true; // OpenAI TTS is always ready

  // Field Protocol Integration
  const {
    isRecording: isFieldRecording,
    startRecording: startFieldRecording,
    completeRecording: completeFieldRecording,
    processMessage: processFieldMessage,
    generateFieldRecord
  } = useFieldProtocolIntegration({
    practitionerId: userId || sessionId,
    autoCapture: true,
    captureThreshold: 5
  });

  // Scribe Mode Integration - Passive recording with active consultation
  const {
    isScribing,
    currentSession: scribeSession,
    startScribing,
    stopScribing,
    recordVoiceTranscript,
    recordConsultation,
    generateSynopsis,
    downloadTranscript: downloadScribeTranscript,
    getTranscriptForReview
  } = useScribeMode();

  // Sacred Lab Drawer and Voice Menu states now declared earlier (lines 159-160)
  // Listen for header lab drawer events
  useEffect(() => {
    const handleOpenLabDrawer = () => {
      console.log('🧪 Opening lab drawer from header event');
      setShowLabDrawer(true);
    };

    window.addEventListener('openLabDrawer', handleOpenLabDrawer);
    return () => window.removeEventListener('openLabDrawer', handleOpenLabDrawer);
  }, []);

  // 🌀 Soullab Realtime - DISABLED
  // This was trying to use OpenAI Realtime API in browser (not supported without dangerouslyAllowBrowser)
  // We're using SimplifiedOrganicVoice (browser speech recognition) + standard API calls instead
  // const realtime = useElementalVoice({
  //   userId: userId || 'anonymous',
  //   userName: userName || 'Explorer',
  //   sessionId,
  //   voice: 'shimmer',
  //   enableSmartCache: true,
  //   enableResponseStreaming: true,
  //   autoConnect: false,
  //   onTranscript: (text, isUser) => { ... },
  //   onError: (error) => { console.warn('⚠️ Voice system error:', error); }
  // });

  // This effect will be moved after state declarations to avoid hoisting issues

  // Voice mode always enabled (Realtime only)
  const conversationMode = 'voice'; // Locked to voice mode - no chat toggle

  // Responsive holoflower size (state declared earlier at line 169)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: Very subtle presence
        setHoloflowerSize(80);
      } else if (width < 1024) {
        // Tablet: Small and unobtrusive
        setHoloflowerSize(100);
      } else {
        // Desktop: Modest size
        setHoloflowerSize(120);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 💾 HYBRID CONVERSATION PERSISTENCE: Restore from localStorage + Supabase
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId || !userId) return;

    const restoreConversation = async () => {
      const storageKey = `maia_conversation_${sessionId}`;

      // Step 1: Try localStorage first (instant restore for same device)
      const localStored = localStorage.getItem(storageKey);
      if (localStored) {
        try {
          const parsedMessages = JSON.parse(localStored);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            console.log(`💾 [localStorage] Restored ${parsedMessages.length} messages instantly`);
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error('💾 [localStorage] Failed to parse stored messages:', error);
          localStorage.removeItem(storageKey);
        }
      }

      // Step 2: Check Supabase for cross-device sync (async, non-blocking)
      // Skip if Supabase mock mode is enabled (prefer PostgreSQL)
      const isMockMode = process.env.NEXT_PUBLIC_MOCK_SUPABASE === 'true';
      if (!isMockMode) {
        try {
          const { success, messages: supabaseMessages } = await getMessagesBySession(sessionId, 100);

          if (success && supabaseMessages.length > 0) {
            // Only use Supabase messages if:
            // 1. localStorage was empty, OR
            // 2. Supabase has MORE messages than localStorage
            if (!localStored || supabaseMessages.length > (JSON.parse(localStored || '[]').length)) {
              console.log(`💾 [Supabase] Restored ${supabaseMessages.length} messages (cross-device sync)`);
              setMessages(supabaseMessages);

              // Update localStorage with Supabase data for faster next load
              localStorage.setItem(storageKey, JSON.stringify(supabaseMessages.slice(-50)));
            }
          }
        } catch (error) {
          console.error('💾 [Supabase] Failed to retrieve messages:', error);
          // Don't block - localStorage restore already happened if available
        }
      } else {
        console.log('💾 [Storage] Using localStorage only (Supabase disabled, PostgreSQL preferred)');
      }
    };

    restoreConversation();
  }, [sessionId, userId]);

  // 💾 HYBRID PERSISTENCE: Save to localStorage (instant) + Supabase (async sync)
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId || !userId || messages.length === 0) return;

    const storageKey = `maia_conversation_${sessionId}`;

    // Keep only the most recent 50 messages to avoid localStorage bloat
    const messagesToStore = messages.slice(-50);

    // STEP 1: Save to localStorage immediately (sync, instant)
    try {
      localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
      console.log(`💾 [localStorage] Saved ${messagesToStore.length} messages`);
    } catch (error) {
      console.error('💾 [localStorage] Failed to save messages:', error);
      // If localStorage is full, try clearing old sessions
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.log('💾 [localStorage] Full, clearing old sessions...');
        try {
          // Clear all old conversation storage except current session
          Object.keys(localStorage)
            .filter(key => key.startsWith('maia_conversation_') && key !== storageKey)
            .forEach(key => localStorage.removeItem(key));

          // Try saving again
          localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
          console.log('💾 [localStorage] Retry successful after cleanup');
        } catch (retryError) {
          console.error('💾 [localStorage] Retry failed:', retryError);
        }
      }
    }

    // STEP 2: Save to Supabase asynchronously (for cross-device sync)
    // Debounce: only save to Supabase every 5 messages or 10 seconds
    const messageCount = messages.length;
    // Check if Supabase mock mode is enabled (prefer PostgreSQL)
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_SUPABASE === 'true';
    const shouldSyncToSupabase = !isMockMode && messageCount % 5 === 0; // Every 5 messages

    if (shouldSyncToSupabase) {
      // Use setTimeout to make this truly async (non-blocking)
      const syncTimer = setTimeout(async () => {
        try {
          const { success, count } = await saveMessagesToSupabase(sessionId, userId, messagesToStore);
          if (success) {
            console.log(`💾 [Supabase] Synced ${count} messages (cross-device backup)`);
          }
        } catch (error) {
          console.error('💾 [Supabase] Sync failed (non-blocking):', error);
          // Don't block - localStorage save already succeeded
        }
      }, 100); // Small delay to avoid blocking UI

      return () => clearTimeout(syncTimer);
    }
  }, [messages, sessionId, userId]);

  // All state declarations moved earlier (lines 138-189) to avoid hook ordering issues

  // Sync refs with state to avoid stale closures in callbacks
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isRespondingRef.current = isResponding;
  }, [isResponding]);

  // All state declarations and refs moved earlier (lines 138-197) to avoid hook ordering issues

  // Client-side only check
  useEffect(() => {
    setIsMounted(true);

    // Initialize stable explorer ID for cross-session memory
    const stableId = getOrCreateExplorerId();
    setExplorerId(stableId);
    console.log('🧠 [Identity] Explorer ID initialized:', stableId);

    trackEvent('session_start', { userId: userId || 'anonymous', sessionId });

    // AUTO-START FIX: Initialize AudioContext immediately on mount
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('✅ AudioContext initialized automatically on mount');
      } catch (err) {
        console.warn('⚠️ Could not auto-initialize AudioContext:', err);
      }
    }

    // Track real user activity
    const trackingUserId = userId || `anon_${sessionId}`;
    const trackingUserName = userName || 'Anonymous User';
    userTracker.trackUserRegistration(trackingUserId, trackingUserName);

    // Detect iOS for audio requirements
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isIOSSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    // Enhanced Safari detection for audio unlock
    const userAgent = navigator.userAgent;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const needsAudioUnlock = isSafari || isIOS;

    console.log('🔓 [OracleConversation] Enhanced Safari detection:', {
      isIOS, isIOSSafari, isSafari, needsAudioUnlock,
      userAgent: userAgent.substring(0, 50) + '...'
    });

    // Audio unlock event listener for enhanced Safari compatibility
    if (needsAudioUnlock && !audioUnlocked) {
      const handleFirstInteraction = async () => {
        console.log('🔓 [OracleConversation] First user interaction detected for Safari audio unlock');

        if (currentAudioQueueRef.current) {
          try {
            await currentAudioQueueRef.current.unlockSafariAudio();
            console.log('✅ [OracleConversation] Safari audio unlocked via StreamingAudioQueue');
            setAudioUnlocked(true);
            setShowAudioUnlockUI(false);
          } catch (error) {
            console.error('❌ [OracleConversation] Safari audio unlock failed:', error);
          }
        }

        // Remove listeners after first successful interaction
        document.removeEventListener('click', handleFirstInteraction, { capture: true });
        document.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
        document.removeEventListener('keydown', handleFirstInteraction, { capture: true });
      };

      // Add interaction listeners for Safari audio unlock
      document.addEventListener('click', handleFirstInteraction, { capture: true });
      document.addEventListener('touchstart', handleFirstInteraction, { capture: true });
      document.addEventListener('keydown', handleFirstInteraction, { capture: true });

      console.log('🔓 [OracleConversation] Safari audio unlock listeners added');
    }

    // TEMPORARILY DISABLED - causing black screen overlay on desktop
    // if (isIOS && !isIOSAudioEnabled) {
    //   setNeedsIOSAudioPermission(true);
    //   console.log('📱 iOS detected - audio permission needed', { isIOS, isIOSSafari });
    // }

    // Get oracle agent ID for memory persistence
    if (userId) {
      getOracleAgentId(userId).then(id => {
        if (id) {
          setOracleAgentId(id);
          console.log('✅ Oracle Agent ID loaded for memory:', id);
        }
      });
    }

    // 🌟 TEEN SUPPORT - Initialize teen profile for safety and support
    if (userAge !== null && userAge >= 13 && userAge <= 18) {
      setIsTeenUser(true);

      // Load teen profile from localStorage
      const userData = getUserData();
      if (userData) {
        const profile: TeenProfile = {
          age: userAge,
          isNeurodivergent: userData.isNeurodivergent,
          hasEatingDisorder: userData.hasEatingDisorder,
          familyDynamics: userData.familyDynamics,
          supportNeeds: userData.supportNeeds
        };
        setTeenProfile(profile);
        console.log('🌟 Teen profile loaded:', { age: userAge, profile });
      }
    } else {
      setIsTeenUser(false);
      setTeenProfile(undefined);
    }

    // Add greeting message on mount (for returning users)
    const isFirstVisit = !localStorage.getItem('betaOnboardingComplete');
    const lastSessionDate = localStorage.getItem('lastSessionDate');
    const daysSinceLastVisit = lastSessionDate
      ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Check if returning user
    setIsReturningUser(!isFirstVisit && daysSinceLastVisit > 0);

    // Load soul-recognized greeting asynchronously
    (async () => {
      // Read onboarding context from sessionStorage for first contact
      let onboardingContext;
      try {
        const storedContext = sessionStorage.getItem('maia_onboarding_context');
        if (storedContext) {
          onboardingContext = JSON.parse(storedContext);
          // Clear the flag after reading so it's only used once
          sessionStorage.removeItem('maia_onboarding_context');
        }
      } catch (error) {
        console.warn('Failed to parse onboarding context:', error);
      }

      // Create returning session context for established users
      let returningContext;
      if (!onboardingContext && !isFirstVisit) {
        try {
          // Get last known facet data from localStorage
          const lastReason = localStorage.getItem('sl_onboarding_reason');
          const lastFeeling = localStorage.getItem('sl_onboarding_feeling');
          const partnerContext = sessionStorage.getItem('partner_context') || localStorage.getItem('sl_partner_context');
          const partnerContextData = sessionStorage.getItem('partner_context_data');

          returningContext = {
            sessionType: 'returning',
            lastReason: lastReason || undefined,
            lastFeeling: lastFeeling || undefined,
            lastSeenDays: daysSinceLastVisit,
            partnerContext: partnerContext || 'general',
            partnerContextData: partnerContextData ? JSON.parse(partnerContextData) : undefined,
            hasConversationHistory: messages.length > 0
          };
        } catch (error) {
          console.warn('Failed to create returning context:', error);
        }
      }

      // Check if MAIA should ask onboarding questions
      const shouldAskOnboarding = sessionStorage.getItem('maia_should_ask_onboarding') === 'true';

      let greetingData;
      if (shouldAskOnboarding) {
        // Remove flag after checking
        sessionStorage.removeItem('maia_should_ask_onboarding');

        // Generate onboarding question greeting instead of standard greeting
        greetingData = await generateOnboardingGreeting({
          userName: userName || 'friend',
          userId: userId,
          isFirstVisit,
          partnerContext: onboardingContext?.partnerContext || 'general'
        });
      } else {
        greetingData = await generateGreeting({
          userName: userName || 'friend',
          userId: userId, // Pass userId for soul-level recognition
          isFirstVisit,
          daysSinceLastVisit,
          daysActive: daysSinceLastVisit > 0 ? 7 : 1,
          mode: realtimeMode, // 🎯 Pass mode for Talk/Care/Note aware greetings
          onboardingContext, // Pass onboarding metadata for first contact
          returningContext, // Pass returning session metadata
        });
      }

      // Add greeting as first message
      const greetingMessage: ConversationMessage = {
        id: `greeting-${Date.now()}`,
        role: 'oracle',
        text: greetingData.greeting,
        timestamp: new Date(),
        source: 'maia'
      };

      setMessages([greetingMessage]);
      localStorage.setItem('lastSessionDate', new Date().toISOString());
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Smooth audio level changes for accessibility (prevents flashing from sudden spikes)
  useEffect(() => {
    const smoothingFactor = 0.3; // Lower = smoother, slower response
    setSmoothedAudioLevel(prev => prev * (1 - smoothingFactor) + voiceAudioLevel * smoothingFactor);
  }, [voiceAudioLevel]);

  // REMOVED: Old formant voice engine state subscription
  // Voice amplitude is now controlled directly by OpenAI Alloy TTS in maiaSpeak()
  // and by audio level monitoring in handleAudioLevelChange()

  // Detect breakthrough potential for journal suggestions
  useEffect(() => {
    if (messages.length < 4) return; // Need some conversation depth

    const conversationMessages = messages
      .filter(msg => msg.text || msg.content)
      .map(msg => ({
        role: msg.role === 'oracle' ? 'assistant' as const : 'user' as const,
        content: msg.text ?? msg.content ?? ''
      }));

    const score = detectBreakthroughPotential(conversationMessages);
    setBreakthroughScore(score);

    // Breakthrough detection PERMANENTLY DISABLED per user request
    // if (score >= 70 && !showJournalSuggestion && !journalSuggestionDismissed && messages.length >= 6) {
    //   console.log('📊 [Breakthrough] Score >=70, showing journal suggestion');
    //   setShowJournalSuggestion(true);
    // }
  }, [messages, showJournalSuggestion, journalSuggestionDismissed]);

  // Agent configuration with persistence
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(() => {
    // Load saved voice preference from localStorage
    if (typeof window !== 'undefined') {
      const savedVoice = localStorage.getItem('selected_voice');
      const config = getAgentConfig(savedVoice || undefined);
      return config;
    }
    return getAgentConfig();
  });

  // Listen for conversation style preference changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedVoice = localStorage.getItem('selected_voice');
      const newConfig = getAgentConfig(savedVoice || undefined);
      setAgentConfig(newConfig);
      console.log('🎭 Conversation style updated:', newConfig.voice);
    };

    // Listen for storage events (from other tabs) and custom events (same tab)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('conversationStyleChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('conversationStyleChanged', handleStorageChange);
    };
  }, []);

  // Listen for conversation style changes and show MAIA's acknowledgment
  useEffect(() => {
    const handleStyleChange = (event: CustomEvent) => {
      const { mode, acknowledgment } = event.detail;
      console.log('🎭 MAIA acknowledging style change:', mode);

      // Add MAIA's acknowledgment as a system message
      const acknowledgmentMessage = {
        id: `style-ack-${Date.now()}`,
        role: 'assistant' as const,
        content: acknowledgment,
        timestamp: new Date().toISOString(),
        sender: 'maia'
      };

      setMessages(prev => [...prev, acknowledgmentMessage]);
      onMessageAddedRef.current?.(acknowledgmentMessage);

      // Optionally speak the acknowledgment if voice is enabled
      // NOTE: Speech now handled automatically by WebRTC realtime voice system
      // if (voiceEnabled && maiaSendText) {
      //   setTimeout(() => {
      //     maiaSendText(acknowledgment);
      //   }, 500);
      // }
    };

    window.addEventListener('maya-style-changed', handleStyleChange as EventListener);
    return () => {
      window.removeEventListener('maya-style-changed', handleStyleChange as EventListener);
    };
  }, [voiceEnabled]);

  // Keyboard shortcut for settings (Cmd/Ctrl + ,)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettingsPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize voice when in voice mode - AUTO-START ENABLED
  useEffect(() => {
    console.log('🔍 Voice auto-start check:', {
      isMounted,
      showChatInterface,
      voiceEnabled,
      isMuted,
      audioEnabled,
      isProcessing,
      isResponding,
      hasVoiceMicRef: !!voiceMicRef.current
    });

    if (isMounted && !showChatInterface && voiceEnabled && !isMuted && audioEnabled && !isAudioPlaying) {
      // Delay to ensure component is ready
      const timer = setTimeout(async () => {
        // Use refs for real-time state check (state values can be stale)
        if (voiceMicRef.current?.startListening &&
            !isProcessingRef.current &&
            !isRespondingRef.current &&
            !isAudioPlayingRef.current) {
          try {
            await voiceMicRef.current.startListening();
            console.log('✅ 🎤 Voice auto-started successfully');
          } catch (err) {
            console.error('❌ Voice auto-start failed:', err);
          }
        } else {
          console.log('⏸️ Voice auto-start skipped - MAIA still active', {
            isProcessing: isProcessingRef.current,
            isResponding: isRespondingRef.current,
            isAudioPlaying: isAudioPlayingRef.current
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      console.log('⏸️ Voice auto-start blocked - checking all conditions...');
    }
  }, [isMounted, showChatInterface, voiceEnabled, isMuted, isProcessing, isResponding, isAudioPlaying, audioEnabled]);

  // Conversation context
  const contextRef = useRef<ConversationContext>({
    sessionId,
    userId, // Keep real value (string | undefined) - don't fake with 'anonymous'
    checkIns: [],
    previousResponses: [],
    coherenceHistory: [],
  });

  // Global state reset function for emergency recovery
  const resetAllStates = useCallback(() => {
    console.log('🔄 Emergency state reset triggered');
    setIsProcessing(false);
    setIsResponding(false);
    setIsAudioPlaying(false);
    setIsStreaming(false);
    setIsMicrophonePaused(false);
    setCurrentMotionState('idle');
    setStreamingText('');

    // EMERGENCY: Disabled voice mic resume since component is disabled
    // setTimeout(() => {
    //   if (voiceMicRef.current?.startListening && !showChatInterface) {
    //     voiceMicRef.current.startListening();
    //   }
    // }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChatInterface]);

  // Auto-recovery timer - if processing states are stuck for too long, reset
  // FIXED: Set to 75s (longer than 60s API timeout) to avoid false positives
  // Keep refs in sync with state (refs declared earlier at line ~299)
  useEffect(() => {
    isProcessingRef.current = isProcessing;
    isRespondingRef.current = isResponding;
    isAudioPlayingRef.current = isAudioPlaying;
    isMicrophonePausedRef.current = isMicrophonePaused;
  }, [isProcessing, isResponding, isAudioPlaying, isMicrophonePaused]);

  useEffect(() => {
    if (isProcessing || isResponding) {
      // Create a unique ID for this processing session
      const sessionId = `recovery-${Date.now()}`;
      const stateActivatedTime = Date.now();
      console.log(`🔄 [${sessionId}] Recovery timer started - isProcessing: ${isProcessing}, isResponding: ${isResponding}`);

      const recoveryTimer = setTimeout(() => {
        // Check CURRENT state values using refs, not closure values
        const currentTime = Date.now();
        const timeSinceActivation = currentTime - stateActivatedTime;
        const currentIsProcessing = isProcessingRef.current;
        const currentIsResponding = isRespondingRef.current;
        const currentIsAudioPlaying = isAudioPlayingRef.current;

        console.log(`⏰ [${sessionId}] Recovery timer fired after ${timeSinceActivation}ms - CURRENT states: isProcessing: ${currentIsProcessing}, isResponding: ${currentIsResponding}, isAudioPlaying: ${currentIsAudioPlaying}`);

        // If audio is still playing, states SHOULD be active - not stuck
        if (currentIsAudioPlaying) {
          console.log(`✅ [${sessionId}] Audio still playing - states are working correctly, no recovery needed`);
          return;
        }

        // Only trigger recovery if states are STILL stuck after 75s AND audio isn't playing
        // Note: API timeout is 60s, so this only triggers if truly stuck beyond API timeout
        if ((currentIsProcessing || currentIsResponding) && timeSinceActivation >= 74000) {
          console.warn(`⚠️ [${sessionId}] States genuinely stuck for >75s - auto-recovery triggered`);

          // Show user-friendly message
          const errorMessage: ConversationMessage = {
            id: `msg-${Date.now()}-timeout`,
            role: 'oracle',
            text: "I apologize - I seem to have gotten stuck for a moment. I'm here now. What were you saying?",
            timestamp: new Date(),
            motionState: 'idle',
            source: 'system'
          };
          setMessages(prev => [...prev, errorMessage]);
          onMessageAddedRef.current?.(errorMessage);

          resetAllStates();
        } else {
          console.log(`✅ [${sessionId}] Recovery timer fired but states already reset - no action needed`);
        }
      }, 75000); // 75 second recovery timeout (longer than 60s API timeout to avoid false positives)

      return () => {
        console.log(`🧹 [${sessionId}] Recovery timer cleanup - states reset normally`);
        clearTimeout(recoveryTimer);
      };
    }
  }, [isProcessing, isResponding, resetAllStates]);

  // Don't sync voice state - it creates race conditions where sync happens
  // before TTS audio starts playing, killing the audio before it can play.
  // The local state (isAudioPlaying, isResponding) is managed correctly by
  // the handleTextMessage flow and MaiaVoiceSystem callbacks.
  // Note: Removed voice state logging useEffect to prevent infinite re-renders

  // Auto-focus text input in chat mode - only when switching to chat mode or when processing ends
  // FIXED: Don't trigger on every message.length change - causes iOS Safari input freeze
  // Also don't refocus if already focused (causes keyboard flicker on iOS)
  useEffect(() => {
    if (showChatInterface && !isProcessing && textInputRef.current) {
      // Check if already focused to prevent iOS keyboard issues
      if (document.activeElement !== textInputRef.current) {
        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [showChatInterface, isProcessing]); // Removed messages.length - was causing iOS freeze

  // Listen for journal "Ask MAIA" events - puts journal content into composer and auto-sends
  useEffect(() => {
    const handleJournalAskMaia = (e: Event) => {
      const ce = e as CustomEvent<{
        content: string;
        type: 'dream' | 'day';
        prompt: string;
      }>;

      const text = ce.detail?.prompt || ce.detail?.content || '';
      if (!text) return;

      console.log('📓 [Journal→MAIA] Received:', ce.detail?.type);

      // 1) Fill the composer immediately (user sees it)
      setComposerDraft(text);

      // 2) Ensure chat UI is visible
      setShowChatInterface(true);

      // 3) Auto-send after a tiny tick so the UI settles
      setTimeout(() => {
        handleTextMessage(text);
        setComposerDraft(''); // Clear after send
      }, 150);
    };

    window.addEventListener('journalAskMaia', handleJournalAskMaia as EventListener);
    return () => window.removeEventListener('journalAskMaia', handleJournalAskMaia as EventListener);
  }, []);

  // Update motion state based on voice activity
  useEffect(() => {
    if (userVoiceState?.isSpeaking) {
      setCurrentMotionState('listening');
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  }, [userVoiceState]);

  // Note: Voice amplitude is now driven by real-time audio analysis in startAudioAnalysis()

  // iOS PWA: Resume AudioContext on visibility change and user interaction
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          console.log('📱 App returned to foreground, resuming AudioContext...');
          try {
            await audioContextRef.current.resume();
            console.log('✅ AudioContext resumed on visibility change');
          } catch (error) {
            console.warn('Could not resume AudioContext:', error);
          }
        }
      }
    };

    const handleUserInteraction = async () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
          console.log('✅ AudioContext resumed on user interaction');
        } catch (error) {
          console.warn('Could not resume AudioContext:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // Helper function to map element to facet ID (using SPIRALOGIC_FACETS IDs)
  const mapElementToFacetId = (element: string): string => {
    const elementToFacetMap: { [key: string]: string } = {
      'air': 'air-1',
      'fire': 'fire-1', 
      'water': 'water-1',
      'earth': 'earth-1',
      'aether': 'earth-1' // Default to earth for aether
    };
    return elementToFacetMap[element] || 'earth-1';
  };

  // Enable audio on user interaction - Enhanced for iOS
  const enableAudio = useCallback(async () => {
    console.log('🔊 Enabling audio context on user interaction');

    try {
      // Create or resume AudioContext
      if (!audioContextRef.current && typeof window !== 'undefined') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('📱 AudioContext created:', audioContextRef.current.state);
      }

      // Resume if suspended (critical for iOS)
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('🎵 Audio context resumed, state:', audioContextRef.current.state);
        } else {
          console.log('🎵 Audio context already running, state:', audioContextRef.current.state);
        }
      }

      // iOS Safari needs a user gesture to unlock audio
      // Use multiple approaches for maximum compatibility
      let audioUnlocked = false;

      // Approach 1: Play longer silent MP3 (better iOS compatibility)
      try {
        const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA');
        silentAudio.volume = 0.001;
        // Set playsInline attribute for iOS compatibility
        silentAudio.setAttribute('playsinline', '');
        const playPromise = silentAudio.play();
        if (playPromise) {
          await playPromise;
          audioUnlocked = true;
          console.log('✅ Silent MP3 audio played successfully');
        }
      } catch (audioError) {
        console.warn('Silent audio play failed:', audioError);
      }

      // Approach 2: Create oscillator as fallback
      if (!audioUnlocked && audioContextRef.current) {
        try {
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = 0.001;
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.1);
          audioUnlocked = true;
          console.log('✅ Oscillator method used for audio unlock');
        } catch (oscError) {
          console.warn('Oscillator method failed:', oscError);
        }
      }

      // Voice mic will be initialized automatically when needed

      setAudioEnabled(true);
      setIsIOSAudioEnabled(true);
      setNeedsIOSAudioPermission(false);
      console.log('✅ Audio enabled successfully - permissions cleared');

      // Show success feedback
      toast.success('Audio enabled! MAIA is ready to speak.', {
        duration: 2000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('❌ Failed to enable audio:', error);
      // More helpful error message
      toast.error('Audio initialization failed. Please try refreshing the page.', {
        duration: 5000,
        position: 'top-center'
      });
      // Still clear the permission screen to let user proceed
      setNeedsIOSAudioPermission(false);
    }
  }, [audioEnabled]);

  // Stream text word by word as Maia speaks
  const streamText = useCallback(async (fullText: string, messageId: string) => {
    const words = fullText.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      // Update the specific message with streaming text
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: currentText }
          : msg
      ));
      
      // Adjust delay based on word length for natural pacing
      const delay = Math.max(50, Math.min(150, words[i].length * 20));
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setIsStreaming(false);
  }, []);

  // Save conversation as journal entry
  const handleSaveAsJournal = useCallback(async () => {
    console.log('📝 [Journal] handleSaveAsJournal called', { userId, messageCount: messages.length });

    if (!userId) {
      toast.error('Please sign in to save journal entries');
      console.error('❌ [Journal] No userId provided');
      return;
    }

    if (messages.length < 2) {
      toast.error('Have a conversation first before journaling');
      console.error('❌ [Journal] Not enough messages:', messages.length);
      return;
    }

    setIsSavingJournal(true);

    try {
      // Convert messages to the format expected by the extractor
      const conversationMessages = messages.map(msg => ({
        role: msg.role === 'oracle' ? 'assistant' as const : 'user' as const,
        content: msg.text,
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString()
      }));

      console.log('📤 [Journal] Sending request to /api/journal/save-conversation', {
        messageCount: conversationMessages.length,
        userId,
        sessionId
      });

      const response = await fetch('/api/journal/save-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          userId,
          conversationId: sessionId,
          sessionId
        })
      });

      console.log('📥 [Journal] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ [Journal] API error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to save journal entry');
      }

      const data = await response.json();
      console.log('✅ [Journal] Successfully saved:', data);

      toast.success(
        <div>
          <div className="font-semibold">{data.essence?.title || 'Journal Entry Saved'}</div>
          <div className="text-sm text-white/70">Saved to your journal</div>
        </div>,
        { duration: 4000 }
      );

      // Track the journal save
      trackEvent('journal_saved_from_conversation', {
        userId,
        sessionId,
        messageCount: messages.length,
        title: data.essence.title
      });
    } catch (error: any) {
      console.error('❌ [Journal] Error saving journal entry:', error);
      toast.error(
        <div>
          <div className="font-semibold">Failed to save journal entry</div>
          <div className="text-sm text-white/70">{error.message || 'Please try again'}</div>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setIsSavingJournal(false);
      setShowJournalSuggestion(false);
      setJournalSuggestionDismissed(true);
    }
  }, [userId, messages, sessionId]);

  // Handle conversation download
  const handleDownloadConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to download', {
        duration: 2000,
        position: 'bottom-center',
      });
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const content = messages.map(msg => {
      const speaker = msg.role === 'user' ? (userName || 'You') : 'MAIA';
      const text = (msg.text ?? msg.content ?? '').replace(/\*[^*]*\*/g, '').trim();
      return `${speaker}:\n${text}\n`;
    }).join('\n---\n\n');

    const header = `MAIA Conversation - ${timestamp}\n${'='.repeat(40)}\n\n`;
    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maia-conversation-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Conversation downloaded!', {
      duration: 2000,
      position: 'bottom-center',
      style: {
        background: '#1a1f2e',
        color: '#d4b896',
        border: '1px solid rgba(212, 184, 150, 0.2)',
      },
    });
  }, [messages, userName]);

  // Handle text messages from chat interface - MUST be defined before handleVoiceTranscript
  const handleTextMessage = useCallback(async (text: string, attachments?: File[]) => {
    console.log('📝 Text message received:', { text, isProcessing, isAudioPlaying, isResponding });

    // Check for journal command
    if (detectJournalCommand(text)) {
      console.log('📖 Journal command detected - saving conversation');
      await handleSaveAsJournal();
      return;
    }

    // IMMEDIATELY stop microphone to prevent Maia from hearing herself
    if (voiceMicRef.current && voiceMicRef.current.stopListening) {
      voiceMicRef.current.stopListening();
      console.log('🔇 PREEMPTIVE STOP: Microphone disabled before processing');
    }

    // Text input is a deliberate user action - FORCE state reset if stuck
    if (isProcessing || isResponding || isAudioPlaying) {
      console.log('⚠️ States were stuck - forcing reset for text input', {
        isProcessing,
        isResponding,
        isAudioPlaying
      });
      setIsProcessing(false);
      setIsResponding(false);
      setIsAudioPlaying(false);
      // Don't return - continue processing the text
    }

    // Process attachments first if any
    let messageText = text;
    let fileContents: string[] = [];

    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(', ');
      messageText = `${text}\n\n[Files attached: ${fileNames}]`;

      // Read text-based file contents
      for (const file of attachments) {
        if (file.type.startsWith('text/') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.md') ||
            file.name.endsWith('.json') ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.py') ||
            file.name.endsWith('.js') ||
            file.name.endsWith('.jsx') ||
            file.name.endsWith('.ts') ||
            file.name.endsWith('.tsx')) {
          try {
            const content = await file.text();
            fileContents.push(`\n\nFile: ${file.name}\n${content}`);
          } catch (err) {
            console.error(`Failed to read file ${file.name}:`, err);
          }
        }
      }

      if (fileContents.length > 0) {
        messageText += fileContents.join('');
      }
    }

    const startTime = Date.now();
    const cleanedText = cleanMessage(messageText);

    // Validate message is not empty after cleaning
    if (!cleanedText || cleanedText.trim().length === 0) {
      console.warn('⚠️ Message is empty after cleaning, skipping');
      return;
    }

    // ✅ CRITICAL FIX: Check if message already exists before adding (prevents duplicates)
    const isDuplicate = messages.some(msg =>
      msg.role === 'user' &&
      msg.text === cleanedText &&
      (Date.now() - new Date(msg.timestamp).getTime()) < 2000
    );

    if (isDuplicate) {
      console.log('🚫 [DEDUP] Blocked duplicate message in handleTextMessage:', cleanedText);
      // Still continue processing - we just don't add it to UI again
      // But we shouldn't call the API either, so return here
      return;
    }

    // Add user message immediately with source tag
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: cleanedText,
      timestamp: new Date(),
      source: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    onMessageAddedRef.current?.(userMessage);

    // Process message for Field Protocol if recording
    if (isFieldRecording) {
      processFieldMessage({
        content: text,
        timestamp: new Date(),
        speaker: 'user'
      });
    }

    // 📝 SCRIBE MODE: Record text consultations (practitioner asking MAIA for help)
    if (isScribing) {
      console.log('📝 [Scribe Mode] Recording practitioner consultation:', cleanedText.substring(0, 50) + '...');
      recordConsultation('user', cleanedText);
      // Continue to process and get MAIA response (unlike voice, text chat is active)
    }

    // Save user message to long-term memory (dual-save to memories + Akashic Records)
    if (oracleAgentId) {
      saveConversationMemory({
        oracleAgentId,
        content: text,
        memoryType: 'conversation',
        sourceType: 'text',
        sessionId,
        userId,
        role: 'user',
        conversationMode: realtimeMode
      }).catch(err => console.error('Failed to save user message:', err));
    }

    // 🧠 BARDIC MEMORY: Background pattern recognition (Air serving Fire)
    // TEMPORARILY DISABLED - Causes browser API security errors
    // TODO: Move to server-side API route
    // if (userId) {
    //   conversationMemory.recognizeInBackground({
    //     userId,
    //     sessionId,
    //     currentCoherence: coherenceLevel,
    //     placeCue: undefined,
    //     senseCues: undefined
    //   }, cleanedText).then(recognition => {
    //     setPatternRecognition(recognition);
    //     if (recognition.hasResonance) {
    //       console.log('🧠 [BARDIC] Pattern recognition found resonance:', {
    //         candidateCount: recognition.candidates.length,
    //         shouldMention: recognition.shouldMention,
    //         topScore: recognition.candidates[0]?.score
    //       });
    //     }
    //   }).catch(err => {
    //     console.error('🧠 [BARDIC] Pattern recognition error:', err);
    //   });
    // }

    // 🌟 TEEN SUPPORT - Perform safety check for teen users BEFORE processing
    if (isTeenUser && teenProfile && requiresTeenSupport(teenProfile)) {
      console.log('🌟 [TEEN SUPPORT] Checking message for safety concerns:', cleanedText.substring(0, 50) + '...');

      const safetyCheck = performTeenSafetyCheck(cleanedText, teenProfile);
      setLastSafetyCheck(safetyCheck);

      const supportResponse = generateTeenSupportResponse(cleanedText, safetyCheck, teenProfile);

      // 🚨 ABUSE DETECTED - THE ONE EXCEPTION WHERE WE BLOCK CONVERSATION
      if (supportResponse.blockConversation && safetyCheck.isAbuse) {
        console.log('🚨 [ABUSE DETECTED] BLOCKING conversation for MAIA\'s protection');

        // Add blocking message directly to conversation
        const blockingMessage: ConversationMessage = {
          id: `abuse-block-${Date.now()}`,
          role: 'oracle',
          text: supportResponse.interventionMessage || 'This conversation has been paused for review.',
          timestamp: new Date(),
          source: 'system'
        };
        setMessages(prev => [...prev, blockingMessage]);
        onMessageAddedRef.current?.(blockingMessage);

        // Alert team about abuse
        if (safetyCheck.abuseResult && userId) {
          const { alertTeamAboutAbuse } = await import('@/lib/safety/abuseDetection');
          const { recordAbuseIncident } = await import('@/lib/safety/abuseDetection');

          // Record the incident
          recordAbuseIncident({
            userId: userId || `anon_${sessionId}`,
            severity: safetyCheck.abuseResult.severity as 'warning' | 'severe' | 'extreme',
            patterns: safetyCheck.abuseResult.patterns,
            message: cleanedText,
            blocked: true,
          });

          // Alert the team
          await alertTeamAboutAbuse({
            userId: userId || `anon_${sessionId}`,
            userName: userName || 'Anonymous',
            severity: safetyCheck.abuseResult.severity as 'warning' | 'severe' | 'extreme',
            patterns: safetyCheck.abuseResult.patterns,
            message: cleanedText,
            sessionId,
            timestamp: new Date(),
          });
        }

        // STOP HERE - do not process normal conversation
        setIsProcessing(false);
        setCurrentMotionState('idle');
        return;
      }

      // 🌟 CRISIS MODE - MAIA stays present as compassionate companion
      if (supportResponse.crisisMode) {
        console.log('🚨 [CRISIS MODE] MAIA entering crisis companion mode - staying present with user');

        // Alert team for human check-in
        if (userId) {
          const { alertSoullabTeam } = await import('@/lib/safety/teenSupportIntegration');

          const crisisType = safetyCheck.isCrisis
            ? 'suicidal_ideation'
            : safetyCheck.edResult?.severity === 'crisis'
              ? 'ed_crisis'
              : 'severe_burnout';

          await alertSoullabTeam({
            userId: userId || `anon_${sessionId}`,
            userName: userName || 'Anonymous Teen',
            age: teenProfile.age,
            crisisType,
            message: cleanedText,
            sessionId,
            timestamp: new Date(),
          });
        }

        // MAIA continues conversation with crisis context - she does NOT abandon the user
        console.log('🌟 [CRISIS COMPANION] MAIA will respond with crisis-aware compassion');
      }

      // If scaffolding suggestions available, log them (could be displayed in UI)
      if (supportResponse.scaffoldSuggestions && supportResponse.scaffoldSuggestions.length > 0) {
        console.log('🌟 [TEEN SUPPORT] Scaffolding suggestions:', supportResponse.scaffoldSuggestions);
        // TODO: Could display these in the UI as helpful strategies
      }

      // Log context that will be added to MAIA's system prompt
      console.log('🌟 [TEEN SUPPORT] Context for MAIA:', supportResponse.contextForAI);
    }

    // Set processing state for text chat
    setIsProcessing(true);
    setCurrentMotionState('processing');

    // Track user activity
    const trackingUserId = userId || `anon_${sessionId}`;
    userTracker.trackActivity(trackingUserId, 'text');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ API request timeout after 60s - aborting');
        controller.abort();
      }, 60000); // 60 second timeout - allow time for complex responses with teen support checks

      console.log('📤 Sending text message to API:', { cleanedText, userId, sessionId });

      // Get user's conversation style preference
      const conversationStyle = ConversationStylePreference.get();

      // 🧠 BARDIC MEMORY: Detect crystallization (Fire-Air alignment)
      // Wait for pattern recognition to complete if it's running
      await new Promise(resolve => setTimeout(resolve, 50)); // Brief pause to let recognition complete
      const recognition = patternRecognition || { hasResonance: false, candidates: [], shouldMention: false };

      // TEMP DISABLED - Causes browser API errors
      let crystallization: CrystallizationDetection | null = null;
      // if (userId) {
      //   try {
      //     crystallization = await conversationMemory.detectCrystallization({
      //       userId,
      //       sessionId,
      //       currentCoherence: coherenceLevel,
      //       placeCue: undefined,
      //       senseCues: undefined
      //     }, cleanedText, recognition);
      //     setCrystallizationState(crystallization);
      //     if (crystallization.isCrystallizing) {
      //       console.log('🧠 [BARDIC] ✨ Crystallization detected:', {
      //         fireAirAlignment: crystallization.fireAirAlignment.toFixed(2),
      //         shouldCapture: crystallization.shouldCapture,
      //         hasStanza: !!crystallization.suggestedStanza
      //       });
      //     }
      //   } catch (err) {
      //     console.error('🧠 [BARDIC] Crystallization detection error:', err);
      //   }
      // }

      // 🌟 TEEN SUPPORT - Generate system prompt additions for MAIA
      const teenSystemPrompt = isTeenUser && teenProfile
        ? getTeenSystemPrompt(teenProfile, lastSafetyCheck || undefined)
        : undefined;

      // Canon Wrap: default-on for Care mode, killable via localStorage
      const isCareMode = realtimeMode === 'counsel';
      const allowCanonWrap = isCareMode && getCanonWrapEnabled();

      // Ensure stable identity is available - generate on-the-fly if needed
      let effectiveExplorerId = explorerId;
      if (!effectiveExplorerId) {
        // Generate synchronously rather than blocking
        effectiveExplorerId = getOrCreateExplorerId();
        setExplorerId(effectiveExplorerId);
        console.log('🧠 [Identity] Explorer ID generated on-the-fly:', effectiveExplorerId);
      }

      // MAIA speaks through sovereign API - working consciousness system
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanedText,
          userId: userId || 'anonymous',
          userName: userName || 'Friend',
          sessionId,
          mode: realtimeMode, // Pass the current mode (dialogue/patient/scribe)

          // Stable identity for cross-session memory persistence
          // memoryMode: 'longterm' enables pattern formation + developmental memory
          // Enable via: localStorage.setItem('maiaMemoryMode', 'longterm')
          meta: {
            explorerId: effectiveExplorerId, // ✅ Stable identity across sessions
            sessionId,  // Current session (changes per session)
            memoryMode: (typeof window !== 'undefined' && localStorage.getItem('maiaMemoryMode') === 'longterm') ? 'longterm' : 'continuity',
          },

          // 🛡️ SANCTUARY MODE: Speaks freely - no memory retention
          sanctuary: isSanctuary,

          // Canon Wrap (care-mode only)
          allowCanonWrap,
          allowRemoteRendering: false,
          voiceEngine: 'local',

          isVoiceMode: !showChatInterface, // Voice mode = faster Essential tier
          fieldState: {
            active: true,
            depth: 0.7,
            quality: 'present'
          },
          conversationHistory: messages.map(msg => ({
            role: msg.role === 'oracle' ? 'assistant' : 'user',
            content: msg.text
          })),
          sessionTimeContext: sessionTimer?.getTimeContext(), // ⏰ Temporal awareness for MAIA
          teenSupportContext: teenSystemPrompt ? {
            isTeenUser,
            age: userAge,
            teenSystemPrompt,
            lastSafetyCheck: lastSafetyCheck ? {
              isED: lastSafetyCheck.isED,
              isNeurodivergent: lastSafetyCheck.isNeurodivergent,
              isCrisis: lastSafetyCheck.isCrisis,
              isBurnout: lastSafetyCheck.isBurnout
            } : undefined
          } : undefined
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Check if streaming response (voice mode)
      const isVoiceMode = !showChatInterface;
      const contentType = response.headers.get('content-type');
      const isStreaming = contentType?.includes('text/event-stream');

      console.log('📡 Response type:', { isVoiceMode, contentType, isStreaming });

      let responseText: string;
      let responseData: any = {};
      let element = 'aether'; // Default element, will be updated from metadata if available
      let opusAxioms: any = undefined; // Opus Axioms evaluation results
      let turnId: number | undefined = undefined; // Turn ID for feedback tracking

      if (isStreaming) {
        // Handle streaming response (voice mode - fastest)
        // 🔥 STREAMING AUDIO: Process sentences as they arrive for immediate TTS
        console.log('🎤 [STREAM] Receiving streaming response with live audio...');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let partialSentence = ''; // Buffer for incomplete sentences
        let firstChunkReceived = false;

        // Import streaming audio utilities
        const { StreamingAudioQueue, splitIntoSentences, generateAudioChunk } =
          await import('@/lib/voice/StreamingAudioQueue');

        // Initialize audio queue for voice mode
        const shouldStreamAudio = !showChatInterface && voiceEnabled && maiaReady;
        let audioQueue: InstanceType<typeof StreamingAudioQueue> | null = null;
        // ECHO SUPPRESSION: Define cooldown for streaming audio path
        const streamingCooldownMs = 3000; // 3 second cooldown - prevents mic catching MAIA's voice tail

        if (shouldStreamAudio) {
          console.log('🎵 [STREAM] Initializing streaming audio queue...');
          // Set audio playing TRUE at start - only goes false when COMPLETE
          setIsAudioPlaying(true);
          setIsMicrophonePaused(true);

          audioQueue = new StreamingAudioQueue({
            onPlayingChange: (isPlaying) => {
              // DON'T set isAudioPlaying here - causes false negatives between chunks
              // Only log for debugging
              console.log('🎵 [STREAM] Chunk playing state:', isPlaying);
            },
            onTextChange: (text) => {
              setMaiaResponseText(text); // Update display with current sentence
            },
            onComplete: () => {
              console.log('✅ [STREAM] All audio chunks played - starting cooldown');
              setIsResponding(false);
              // ✅ Set isAudioPlaying FALSE now - audio ended, visualizer shows user color
              setIsAudioPlaying(false);
              // 🔥 isMicrophonePaused stays TRUE to block mic during cooldown
              // (ContinuousConversation checks: isSpeaking={isAudioPlaying || isMicrophonePaused})

              // Resume mic after cooldown with auto-restart
              console.log(`⏳ [STREAM] Cooldown ${streamingCooldownMs}ms (mic paused)...`);
              setTimeout(() => {
                setIsMicrophonePaused(false);
                console.log('🎤 [STREAM] Microphone unpaused - ready for next input');

                // 🔥 FIX: Use voiceMicRef to determine voice mode at RUNTIME (not stale closure)
                // If voiceMicRef.current exists with startListening, we're in voice mode
                if (voiceMicRef.current?.startListening) {
                  // Triple-check: not processing, not responding, and audio has actually stopped
                  const canRestart = !isProcessingRef.current &&
                                     !isRespondingRef.current &&
                                     !isAudioPlayingRef.current;
                  if (canRestart) {
                    setIsMuted(false);
                    voiceMicRef.current.startListening();
                    console.log('🎤 [STREAM] Microphone auto-resumed after streaming audio complete');
                  } else {
                    console.log('⏸️ [STREAM] Skipped mic restart - still processing', {
                      isProcessing: isProcessingRef.current,
                      isResponding: isRespondingRef.current,
                      isAudioPlaying: isAudioPlayingRef.current
                    });
                  }
                } else {
                  console.log('⏸️ [STREAM] No voice mic available - not in voice mode');
                }
              }, streamingCooldownMs);
            },
          });

          // Connect to ref for Safari audio unlock integration
          currentAudioQueueRef.current = audioQueue;
          console.log('🔓 [OracleConversation] Connected StreamingAudioQueue to ref for Safari audio unlock');

          // Apply audio unlock status if already unlocked
          if (audioUnlocked) {
            audioQueue.setAudioUnlocked(true);
            console.log('✅ [OracleConversation] Applied existing audio unlock status to new AudioQueue');
          }

          setIsResponding(true); // Start responding state immediately
        }

        // 🔥 FIX: Track pending TTS requests to prevent premature onComplete
        let pendingTTSCount = 0;
        let streamEnded = false;
        let finalizePromiseResolve: (() => void) | null = null;
        const finalizePromise = new Promise<void>(resolve => {
          finalizePromiseResolve = resolve;
        });

        // Helper to check if we can finalize
        const checkFinalize = () => {
          if (streamEnded && pendingTTSCount === 0 && audioQueue) {
            console.log('✅ [STREAM] All TTS complete - NOW marking streaming complete');
            audioQueue.markStreamingComplete();
            finalizePromiseResolve?.();
          } else if (streamEnded) {
            console.log(`⏳ [STREAM] Stream ended but ${pendingTTSCount} TTS requests still pending...`);
          }
        };

        try {
          if (!reader) {
            throw new Error('No response body reader available');
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('🏁 [STREAM] Text stream complete');

              // Process any remaining partial sentence
              if (partialSentence.trim() && audioQueue) {
                console.log('📝 [STREAM] Processing final partial sentence:', partialSentence.substring(0, 50));
                try {
                  const audio = await generateAudioChunk(partialSentence, {
                    agentVoice: 'maya',
                    element,
                  });
                  audioQueue.enqueue({
                    audio,
                    text: partialSentence,
                    element,
                  });
                } catch (err) {
                  console.error('❌ [STREAM] Failed to generate audio for final sentence:', err);
                }
              }

              // 🔥 FIX: Mark stream as ended, but DON'T call markStreamingComplete yet!
              // Wait for all pending TTS requests to complete first
              streamEnded = true;
              console.log(`🏁 [STREAM] Stream ended with ${pendingTTSCount} TTS requests still in flight`);
              checkFinalize();
              break;
            }

            const chunk = decoder.decode(value);
            console.log('📦 [STREAM] Received chunk:', chunk.substring(0, 100));
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]' || !data) {
                  if (data === '[DONE]') {
                    console.log('✅ [STREAM] Done signal received');
                  }
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    const text = parsed.text;
                    fullText += text;

                    if (!firstChunkReceived) {
                      firstChunkReceived = true;
                      const firstChunkTime = Date.now() - startTime;
                      console.log(`⚡ [STREAM] First chunk received in ${firstChunkTime}ms`);
                    }

                    // 🔥 STREAMING AUDIO: Process complete sentences immediately
                    if (audioQueue) {
                      partialSentence += text;

                      // Check if we have complete sentences (ending with . ! ?)
                      const sentenceEndMatch = partialSentence.match(/[.!?]+\s/);
                      if (sentenceEndMatch) {
                        const sentences = splitIntoSentences(partialSentence);

                        // Process all complete sentences
                        for (let i = 0; i < sentences.length - 1; i++) {
                          const sentence = sentences[i].trim();
                          if (sentence) {
                            console.log('🎤 [STREAM] Complete sentence, generating audio:', sentence.substring(0, 50));

                            // 🔥 FIX: Track this pending TTS request
                            pendingTTSCount++;
                            console.log(`📤 [STREAM] TTS request started (pending: ${pendingTTSCount})`);

                            // Generate and queue audio asynchronously (don't await - let it run in background)
                            generateAudioChunk(sentence, {
                              agentVoice: 'maya',
                              element,
                            }).then(audio => {
                              audioQueue!.enqueue({
                                audio,
                                text: sentence,
                                element,
                              });
                              // 🔥 FIX: TTS completed successfully
                              pendingTTSCount--;
                              console.log(`📥 [STREAM] TTS request completed (pending: ${pendingTTSCount})`);
                              checkFinalize();
                            }).catch(err => {
                              console.error('❌ [STREAM] Failed to generate audio:', err);
                              // 🔥 FIX: TTS failed, still decrement counter
                              pendingTTSCount--;
                              console.log(`📥 [STREAM] TTS request failed (pending: ${pendingTTSCount})`);
                              checkFinalize();
                            });
                          }
                        }

                        // Keep the last sentence (might be incomplete)
                        partialSentence = sentences[sentences.length - 1] || '';
                      }
                    }
                  }
                } catch (e) {
                  // Only log parse errors for non-empty data that looks like it should be JSON
                  if (data.startsWith('{') || data.startsWith('[')) {
                    console.warn('⚠️ [STREAM] Failed to parse JSON:', data.substring(0, 50));
                  }
                }
              }
            }
          }

          if (!fullText) {
            throw new Error('Stream completed but no text received');
          }

          responseText = cleanMessage(fullText);
          console.log(`✅ [STREAM] Complete response received (${fullText.length} chars)`);

        } catch (streamError) {
          console.error('❌ [STREAM] Error reading stream:', streamError);
          // Clean up audio queue on error
          if (audioQueue) {
            audioQueue.stop();
          }
          throw streamError;
        }

      } else {
        // Handle JSON response (text mode - includes metadata)
        responseData = await response.json();
        console.log('✅ THE BETWEEN response data:', responseData);
        // Use normalized response for consistent field access
        const normalized = normalizeAIResponse(responseData);
        responseText = cleanMessage(normalized?.text || responseData.response || responseData.message || 'I\'m here. What wants your attention?');

        // Extract opusAxioms and turnId for Gold Seal feature
        opusAxioms = responseData.opusAxioms;
        turnId = responseData.turnId;
        if (opusAxioms) {
          console.log(`🜔 Opus Axioms received: ${opusAxioms.isGold ? 'GOLD' : 'Standard'} | ${opusAxioms.passed}/8 passed`);
        }
      }

      const apiTime = Date.now() - startTime;
      console.log(`⏱️ Response FROM THE BETWEEN received in ${apiTime}ms`);
      trackEvent.apiCall('/api/between/chat', apiTime, true);

      // 🩺 Monitor MAIA personality health (dev mode only)
      // Detects degradation and auto-recovers if needed
      if (process.env.NODE_ENV === 'development') {
        const { monitorMAIAResponse } = await import('@/lib/monitoring/personality-health');
        monitorMAIAResponse(responseText);
      }

      // THE BETWEEN metadata includes field depth, sovereignty check, etc
      element = responseData.metadata?.archetypalField?.dominantArchetype || 'aether';
      const facetId = mapElementToFacetId(element);
      setActiveFacetId(facetId);
      setCoherenceLevel(responseData.metadata?.fieldState?.depth || 0.85);

      // 🧠 BARDIC MEMORY: Enrich response with memory wisdom (Air serves Fire)
      //
      // ACTIVATION CHECKLIST (follow-up PR):
      // - [ ] Wire crystallization detection (only trigger on breakthrough moments, not every message)
      // - [ ] Set context.holoflowerReading ONLY on explicit "Finalize" user action
      // - [ ] Verify "one event = one save" rule (no accidental high-frequency writes)
      // - [ ] Test episode persistence works without errors
      // - [ ] Test Holoflower 3-layer save (journal, soul patterns, anamnesis)
      //
      // Infrastructure is sovereign and ready (episode + holoflower tables exist in Postgres).
      // See: lib/memory/bardic/ConversationMemoryIntegration.ts:captureEpisode()
      let enrichedResponseText = responseText;
      // if (userId && recognition && crystallization) {
      //   try {
      //     const balance = await conversationMemory.checkBalance({
      //       userId,
      //       sessionId,
      //       currentCoherence: coherenceLevel
      //     });
      //     const enrichedResponse = await conversationMemory.enrichResponse(
      //       responseText,
      //       { userId, sessionId, currentCoherence: coherenceLevel },
      //       recognition,
      //       crystallization,
      //       balance
      //     );
      //     const enrichments: string[] = [];
      //     if (enrichedResponse.patternReflection) {
      //       enrichments.push(enrichedResponse.patternReflection);
      //     }
      //     if (enrichedResponse.crystallizationNote) {
      //       enrichments.push(enrichedResponse.crystallizationNote);
      //     }
      //     if (enrichedResponse.balanceGuidance) {
      //       enrichments.push(enrichedResponse.balanceGuidance);
      //     }
      //     if (enrichments.length > 0) {
      //       enrichedResponseText = enrichedResponse.originalResponse + enrichments.join('');
      //       console.log('🧠 [BARDIC] Response enriched with memory wisdom');
      //     }
      //     if (crystallization.shouldCapture) {
      //       conversationMemory.captureEpisode(
      //         { userId, sessionId, currentCoherence: coherenceLevel },
      //         cleanedText,
      //         responseText,
      //         crystallization
      //       ).then(episodeId => {
      //         if (episodeId) {
      //           console.log('🧠 [BARDIC] ✨ Crystallization moment captured:', episodeId);
      //         }
      //       }).catch(err => {
      //         console.error('🧠 [BARDIC] Failed to capture episode:', err);
      //       });
      //     }
      //   } catch (err) {
      //     console.error('🧠 [BARDIC] Response enrichment error:', err);
      //   }
      // }

      // Extract wisdom routing data if present
      const wisdomRouting = responseData.metadata?.wisdomRouting;

      // Create oracle message with source tag
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}-oracle`,
        role: 'oracle',
        text: enrichedResponseText, // Use enriched text
        timestamp: new Date(),
        facetId: element,
        motionState: 'responding',
        coherenceLevel: responseData.metadata?.confidence || 0.85,
        source: 'maia',
        opusAxioms,
        turnId,
        metadata: {
          wisdomRouting: wisdomRouting ? {
            activated: wisdomRouting.activated,
            tool: wisdomRouting.tool,
            meta: wisdomRouting.meta
          } : undefined
        }
      };

      // Trigger wisdom tool reveal if activated
      if (wisdomRouting?.activated && wisdomRouting.tool) {
        console.log('🌟 [WisdomTool] Revealing tool:', wisdomRouting.tool.name);
        setActiveWisdomTool({
          tool: wisdomRouting.tool,
          agentName: wisdomRouting.meta?.agentName || null,
          userMessage: cleanedText
        });
      }

      // Store MAIA's response for echo detection
      lastMaiaResponseRef.current = responseText;

      // In Chat mode, add message immediately
      // In Voice mode, delay text until after speaking
      const isInVoiceMode = !showChatInterface;

      if (!isInVoiceMode) {
        // Chat mode - show text immediately
        setMessages(prev => [...prev, oracleMessage]);
        onMessageAddedRef.current?.(oracleMessage);

        // Process Oracle message for Field Protocol if recording
        if (isFieldRecording) {
          processFieldMessage({
            content: responseText,
            timestamp: new Date(),
            speaker: 'oracle',
            metadata: {
              elements: responseData.metadata?.elementalInfo?.dominantElements || [element]
            }
          });
        }

        // 📝 SCRIBE MODE: Record MAIA's consultation responses
        if (isScribing) {
          console.log('📝 [Scribe Mode] Recording MAIA consultation response:', responseText.substring(0, 50) + '...');
          recordConsultation('oracle', responseText);
        }

        // Save chat response to long-term memory (dual-save to memories + Akashic Records)
        if (oracleAgentId) {
          saveConversationMemory({
            oracleAgentId,
            content: responseText,
            memoryType: 'conversation',
            sourceType: 'text',
            emotionalTone: responseData.metadata?.emotionalResonance,
            wisdomThemes: responseData.metadata?.themes,
            elementalResonance: element,
            sessionId,
            userId,
            role: 'assistant',
            conversationMode: realtimeMode
          }).catch(err => console.error('Failed to save chat response:', err));
        }
      }

      // Play audio response with Maia's voice - ALWAYS in voice mode
      // 🔥 SKIP if we already used streaming audio (audioQueue handled it)
      const usedStreamingAudio = isStreaming && !showChatInterface && voiceEnabled && maiaReady;
      const shouldSpeak = !usedStreamingAudio && (!showChatInterface || (showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat));

      // If we used streaming audio, add message to history now (will show if "Show Text" is enabled)
      if (usedStreamingAudio && isInVoiceMode) {
        setMessages(prev => [...prev, oracleMessage]);
        onMessageAddedRef.current?.(oracleMessage);
        console.log('📝 [STREAM] Added message to history (voice mode with streaming audio)');
      }

      console.log('🎤 Voice response check:', {
        shouldSpeak,
        usedStreamingAudio,
        isStreaming,
        showChatInterface,
        voiceEnabled,
        maiaReady,
        hasMaiaSpeak: !!maiaSpeak
      });

      if (shouldSpeak && maiaSpeak) {
        console.log('🔊 Maia speaking response in', showChatInterface ? 'Chat' : 'Voice', 'mode (non-streaming)');
        const ttsStartTime = Date.now();
        trackEvent.ttsSpoken(userId || 'anonymous', responseText, 0);
        // Set speaking state for visual feedback
        setIsResponding(true);
        // 🔥 DON'T set isAudioPlaying here - it's set in maiaSpeak's audio.onplay callback
        // so teal visualizer only appears when audio ACTUALLY starts playing
        setIsMicrophonePaused(true); // 🔇 PAUSE MIC WHILE MAIA SPEAKS
        setMaiaResponseText(responseText); // Update display text

        // Clean the response for voice - remove stage directions and markup
        const cleanVoiceText = cleanMessageForVoice(responseText);
        console.log('🧹 Cleaned for voice:', cleanVoiceText);

        // ECHO SUPPRESSION: Define cooldown OUTSIDE try block so finally can access it
        const cooldownMs = 3000; // 3 second cooldown - prevents mic catching MAIA's voice tail

        try {
          // Start speaking immediately
          const startSpeakTime = Date.now();
          console.log('⏱️ Starting speech at:', startSpeakTime);

          // Speak the cleaned response
          // Pass element hint to select appropriate elemental voice
          // 🔥 FIX: No character-based timeout here! maiaSpeak now uses
          // the ACTUAL audio duration from metadata for its timeout,
          // which is much more reliable than estimating from text length.
          await maiaSpeak(cleanVoiceText, element as Element);

          const speakDuration = Date.now() - startSpeakTime;
          console.log(`🔇 Maia finished speaking after ${speakDuration}ms (${cleanVoiceText.length} chars)`);

          // ECHO SUPPRESSION: Extended cooldown to prevent audio tail from being recorded
          setEchoSuppressUntil(Date.now() + cooldownMs);
          console.log(`🛡️ Echo suppression active for ${cooldownMs}ms`);

          // In Voice mode, show text after speaking completes
          if (isInVoiceMode && showVoiceText) {
            setMessages(prev => [...prev, oracleMessage]);
            onMessageAddedRef.current?.(oracleMessage);

            // Save voice response to long-term memory (dual-save to memories + Akashic Records)
            if (oracleAgentId) {
              saveConversationMemory({
                oracleAgentId,
                content: responseText,
                memoryType: 'conversation',
                sourceType: 'voice',
                emotionalTone: responseData.metadata?.emotionalResonance,
                wisdomThemes: responseData.metadata?.themes,
                elementalResonance: element,
                sessionId,
                userId,
                role: 'assistant',
                conversationMode: realtimeMode
              }).catch(err => console.error('Failed to save voice response:', err));
            }
          }
        } catch (error) {
          console.error('❌ Speech error or timeout:', error);
          // Show text even if speech fails in Voice mode
          if (isInVoiceMode) {
            setMessages(prev => [...prev, oracleMessage]);
            onMessageAddedRef.current?.(oracleMessage);
          }
        } finally {
          // Non-streaming path: Audio ended, update states appropriately
          console.log('🧹 Voice response (non-streaming) complete - scheduling cooldown...');
          setIsResponding(false);
          // ✅ Set isAudioPlaying FALSE now - audio has ended, visualizer should show user color
          setIsAudioPlaying(false);
          // 🔥 But KEEP isMicrophonePaused TRUE during cooldown to block mic restart
          // (ContinuousConversation now checks: isSpeaking={isAudioPlaying || isMicrophonePaused})
          // isMicrophonePaused was already set to true when MAIA started speaking

          // CRITICAL: Resume listening AFTER cooldown to prevent echo/feedback loop
          console.log(`⏳ [NON-STREAM] Starting ${cooldownMs}ms cooldown (mic paused)...`);
          setTimeout(() => {
            console.log('✅ [NON-STREAM] Cooldown complete - NOW releasing mic');

            // NOW unpause mic - this allows ContinuousConversation to restart
            setIsMicrophonePaused(false);
            setIsMuted(false); // Ensure mic is unmuted
            console.log('🎤 [NON-STREAM] Microphone unpaused - ready for next input');

            // 🔥 FIX: React state updates are ASYNC! We need to wait for the next tick
            // so ContinuousConversation's isSpeaking prop updates before calling startListening.
            // Otherwise, its guard (isSpeakingRef.current) will block the call.
            setTimeout(() => {
              // Check voiceMicRef again after state has propagated
              if (voiceMicRef.current?.startListening) {
                // Triple-check: not processing, not responding
                const canRestart = !isProcessingRef.current &&
                                   !isRespondingRef.current;
                if (canRestart) {
                  console.log('🎤 [NON-STREAM] Attempting mic restart after state propagation...');
                  voiceMicRef.current.startListening();
                  console.log('🎤 [NON-STREAM] Microphone auto-resumed after cooldown');
                } else {
                  console.log('⏸️ [NON-STREAM] Skipped mic restart - still processing', {
                    isProcessing: isProcessingRef.current,
                    isResponding: isRespondingRef.current
                  });
                }
              } else {
                console.log('⏸️ [NON-STREAM] No voice mic available - not in voice mode');
              }
            }, 100); // Small delay for React state to propagate
          }, cooldownMs); // Wait for echo suppression cooldown
        }
      } else {
        console.log('⚠️ Not speaking because:', {
          shouldSpeak,
          hasMaiaSpeak: !!maiaSpeak,
          showChatInterface
        });
      }

      // Update context
      if (!contextRef.current.previousResponses) contextRef.current.previousResponses = [];
      contextRef.current.previousResponses.push(responseText);
      if (!contextRef.current.coherenceHistory) contextRef.current.coherenceHistory = [];
      contextRef.current.coherenceHistory.push(responseData.metadata?.confidence || 0.85);

    } catch (error: any) {
      console.error('Text chat API error:', error);
      trackEvent.error(userId || 'anonymous', 'api_error', String(error));

      // Provide specific error messages based on error type
      let errorText = 'I apologize, I\'m having trouble connecting right now. Could you say that again?';
      if (error.name === 'AbortError') {
        console.error('🚨 API request timed out - connection may be slow');
        errorText = 'I\'m having trouble responding - your connection might be slow. Try asking again in a moment.';
      } else if (error.message?.includes('fetch')) {
        console.error('🚨 Network error - cannot reach server');
        errorText = 'I can\'t connect right now. Check your internet connection and try again.';
      }

      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'oracle',
        text: errorText,
        timestamp: new Date(),
        motionState: 'idle',
        source: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
      onMessageAddedRef.current?.(errorMessage);
    } finally {
      // 🔥 CRITICAL FIX: Only reset isResponding for TEXT mode
      // For VOICE mode, isResponding is managed by StreamingAudioQueue.onComplete
      // Setting it here would cause teal visualizer to cut out mid-speech!
      const isVoiceStreaming = !showChatInterface && voiceEnabled;

      console.log('🧹 Message processing complete', {
        isVoiceStreaming,
        isAudioPlaying: isAudioPlayingRef.current,
        willResetResponding: !isVoiceStreaming
      });

      setIsProcessing(false);

      // Only reset isResponding for text mode - voice mode handles this in onComplete
      if (!isVoiceStreaming) {
        setIsResponding(false);
        console.log('🔇 [TEXT MODE] Reset isResponding=false');
      } else {
        console.log('🔊 [VOICE MODE] Keeping isResponding - audio queue will reset when complete');
      }

      setCurrentMotionState('idle');
    }
  }, [isProcessing, isAudioPlaying, isResponding, sessionId, userId, onMessageAdded, agentConfig, messages.length, showChatInterface, voiceEnabled, maiaReady]);

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    console.log('🎤 handleVoiceTranscript called with:', transcript);
    const t = transcript?.trim();
    if (!t) {
      console.log('⚠️ Empty transcript, returning');
      return;
    }

    // 🔇 CRITICAL: Reject ALL transcripts when MAIA is speaking or processing
    // USE REFS for real-time values (state values can be stale in callbacks!)
    if (isAudioPlayingRef.current || isRespondingRef.current || isMicrophonePausedRef.current) {
      console.warn('🔇 [Voice Feedback Prevention] Rejecting transcript - MAIA is speaking:', t, {
        isAudioPlaying: isAudioPlayingRef.current,
        isResponding: isRespondingRef.current,
        isMicrophonePaused: isMicrophonePausedRef.current
      });
      return;
    }

    // TRIPLE-PROCESSING FIX: Check if this exact transcript was just processed
    const now = Date.now();
    if (lastProcessedTranscriptRef.current) {
      const { text: lastText, timestamp: lastTime } = lastProcessedTranscriptRef.current;
      const timeSinceLastProcess = now - lastTime;

      // If same transcript within 2 seconds, it's a duplicate
      if (lastText === t && timeSinceLastProcess < 2000) {
        console.warn(`⚠️ Duplicate transcript detected (${timeSinceLastProcess}ms ago), ignoring:`, t);
        return;
      }
    }

    // Mark this transcript as processed
    lastProcessedTranscriptRef.current = { text: t, timestamp: now };

    // 🌊 LIQUID AI - Track speech end with transcript for rhythm analysis
    rhythmTrackerRef.current?.onSpeechEnd(t);

    // 🎤 VOICE COMMAND DETECTION - Check for mode switching commands
    const commandResult = detectVoiceCommand(t);
    if (commandResult.detected && commandResult.mode) {
      console.log(`🔄 Voice command detected: switching to ${commandResult.mode} mode`);

      // Save new mode
      localStorage.setItem('conversation_mode', commandResult.mode);
      window.dispatchEvent(new Event('conversationStyleChanged'));

      // Get confirmation message
      const confirmation = getModeConfirmation(commandResult.mode);

      // If command was standalone (no other text), just acknowledge and return
      if (isOnlyModeSwitch(t)) {
        console.log('✅ Mode switch confirmed, no additional message to process');

        // Speak confirmation if voice is enabled
        if (maiaReady && maiaSpeak && !isMuted) {
          await maiaSpeak(confirmation);
        }

        // Show visual confirmation
        toast.success(confirmation);
        return;
      }

      // If there's additional text, show confirmation but continue processing
      if (commandResult.cleanedText.length > 0) {
        toast.success(confirmation);
        // Continue with cleaned text below
      }

      // Use cleaned text (command stripped out) for processing
      const textToProcess = commandResult.cleanedText || t;
      if (!textToProcess) return;

      // Continue with normal processing using cleaned text
      transcript = textToProcess;
    }

    // FILTER: Ignore empty or punctuation-only transcripts
    const meaningfulText = transcript.replace(/[.,!?;:\s]+/g, '');
    if (meaningfulText.length === 0) {
      console.log('⚠️ Ignoring empty/punctuation-only transcript:', transcript);
      return;
    }

    // GHOST TRANSCRIPT FILTER: Block common YouTube/video/ambient audio phrases
    const ghostPhrases = [
      'thank you for watching',
      'thanks for watching',
      'subscribe',
      'like and subscribe',
      'hit the bell',
      'turn on notifications',
      'check out the link',
      'link in description',
      'patreon',
      'sponsor',
      'this video is sponsored',
      'before we begin',
      'let\'s get started',
      'welcome back',
      'today we\'re going to',
      'in today\'s video',
      'don\'t forget to',
      'make sure to',
      'if you enjoyed',
      'leave a comment',
      'smash that',
      'hit that like button'
    ];

    const lowerTranscript = transcript.toLowerCase();
    const isGhostPhrase = ghostPhrases.some(phrase => lowerTranscript.includes(phrase));

    if (isGhostPhrase) {
      console.warn('👻 Ghost transcript detected (YouTube/video audio):', transcript);
      return;
    }

    // ECHO SUPPRESSION: Check if we're in cooldown period
    if (now < echoSuppressUntil) {
      const remainingMs = echoSuppressUntil - now;
      console.warn(`[Echo Suppressed] Ignoring input during ${remainingMs}ms cooldown`);
      return;
    }

    // ECHO SUPPRESSION: Check if transcript is MAIA's voice being picked up by mic
    // Only suppress if the transcript is a near-exact match of MAIA's recent words
    if (lastMaiaResponseRef.current) {
      const maiaWords = lastMaiaResponseRef.current.toLowerCase().trim();
      const transcriptWords = transcript.toLowerCase().trim();

      // Check similarity - transcript must be 80%+ match of MAIA's response
      const similarity = transcriptWords.length > 0
        ? (maiaWords.includes(transcriptWords) || transcriptWords.includes(maiaWords.substring(0, transcriptWords.length)))
        : false;

      if (similarity && transcriptWords.length > 10) {
        console.warn('[Echo Suppressed] Transcript appears to be MAIA\'s voice:', transcriptWords.substring(0, 50));
        return;
      }
    }

    // Prevent duplicate processing if already handling a message
    // Use refs to check current state (not stale closure values)
    const currentlyProcessing = isProcessingRef.current || isRespondingRef.current;
    if (currentlyProcessing) {
      console.log('⚠️ Already processing, ignoring duplicate transcript', {
        isProcessingRef: isProcessingRef.current,
        isRespondingRef: isRespondingRef.current
      });
      return;
    }

    // Deduplicate: check if this is the same as the last message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user' && lastMessage.text === transcript) {
      console.log('⚠️ Duplicate transcript detected, ignoring');
      return;
    }

    console.log('🎯 Voice transcript received:', transcript);
    console.log('📊 Current states:', {
      isProcessing,
      isResponding,
      isAudioPlaying,
      showChatInterface,
      voiceEnabled,
      isMuted
    });

    const voiceStartTime = Date.now();
    trackEvent.voiceResult(userId || 'anonymous', transcript, 0);

    // Clean the text
    const cleanedText = cleanMessage(transcript);

    // Track user activity (message will be added by handleTextMessage)
    const trackingUserId = userId || `anon_${sessionId}`;
    userTracker.trackActivity(trackingUserId, 'voice');

    // Save user message to long-term memory (dual-save to memories + Akashic Records)
    if (oracleAgentId) {
      saveConversationMemory({
        oracleAgentId,
        content: cleanedText,
        memoryType: 'conversation',
        sourceType: 'voice',
        sessionId,
        userId,
        role: 'user',
        conversationMode: realtimeMode
      }).catch(err => console.error('Failed to save voice user message:', err));
    }

    // 📝 SCRIBE MODE: Record passively without MAIA response
    if (isScribing) {
      console.log('📝 [Scribe Mode] Recording voice transcript passively:', cleanedText.substring(0, 50) + '...');
      recordVoiceTranscript(cleanedText);
      return; // Don't trigger MAIA response
    }

    try {
      // ✅ CORRECT FLOW: Browser STT → /api/between/chat → Browser TTS
      console.log('🌀 Routing voice through THE BETWEEN...');
      await handleTextMessage(cleanedText);

      const duration = Date.now() - voiceStartTime;
      trackEvent.voiceResult(userId || 'anonymous', transcript, duration);
      console.log('✅ Voice flow through THE BETWEEN completed');
    } catch (error) {
      console.error('❌ Error in voice flow:', error);
      trackEvent.error(userId || 'anonymous', 'voice_error', String(error));

      // Show error message
      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'oracle',
        text: 'I apologize, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        motionState: 'idle',
        source: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
      onMessageAddedRef.current?.(errorMessage);

      // Reset states on error
      setIsProcessing(false);
      setIsResponding(false);
    }
  }, [handleTextMessage, isProcessing, isResponding, isAudioPlaying, messages, echoSuppressUntil, maiaReady, isMuted, sessionId, userId, oracleAgentId, onMessageAdded]);

  // Clear all check-ins
  const clearCheckIns = useCallback(() => {
    setCheckIns({});
    contextRef.current.checkIns = [];
  }, []);

  // Download conversation transcript
  const downloadTranscript = useCallback(async () => {
    try {
      console.log('📥 Saving conversation to Obsidian...', { messageCount: messages.length });

      // Create a formatted transcript with markdown
      const header = `# Conversation with ${agentConfig.name}\n`;
      const date = `Date: ${new Date().toLocaleString()}\n`;
      const sessionInfo = `Session ID: ${sessionId}\n`;
      const separator = `${'='.repeat(50)}\n\n`;

      const transcript = messages.map(msg => {
        const timestamp = msg.timestamp?.toLocaleString() || '';
        const speaker = msg.role === 'user' ? `**${userName}**` : '**MAIA**';
        return `### ${speaker}\n*${timestamp}*\n\n${msg.text}\n`;
      }).join('\n---\n\n');

      const fullContent = header + date + sessionInfo + separator + transcript;

      // Save to Obsidian vault
      const response = await fetch('/api/obsidian/save-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullContent,
          agentName: agentConfig.name,
          messageCount: messages.length
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conversation saved to Obsidian:', data.filename);

        // Show success toast
        toast.success(
          <div>
            <div className="font-semibold">💎 Saved to Obsidian</div>
            <div className="text-sm text-white/70">
              {messages.length} messages • AIN Vault/MAIA Conversations
            </div>
          </div>,
          { duration: 5000 }
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save to Obsidian');
      }
    } catch (error: any) {
      console.error('❌ Error saving conversation to Obsidian:', error);
      toast.error(
        <div>
          <div className="font-semibold">Save Failed</div>
          <div className="text-sm text-white/70">{error.message || 'Please try again'}</div>
        </div>,
        { duration: 5000 }
      );
    }
  }, [messages, agentConfig.name, sessionId, userName]);

  // Voice synthesis for text chat
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | undefined>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeakMessage = useCallback(async (text: string, messageId: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setCurrentlySpeakingId(messageId);
      setIsResponding(true);
      setIsAudioPlaying(true);

      // Clean text for voice
      const cleanText = cleanMessageForVoice(text);

      console.log('🎵 Speaking with OpenAI Alloy:', cleanText.substring(0, 100));

      // Call OpenAI TTS with Alloy voice
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: agentConfig.voice || voice || 'alloy',
          speed: voiceSpeed,
          model: voiceModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setCurrentlySpeakingId(undefined);
        setIsResponding(false);
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('❌ OpenAI TTS error, falling back to browser TTS:', error);

      // 🎙️ SOVEREIGNTY FALLBACK: Use browser Web Speech API when server TTS fails
      try {
        if ('speechSynthesis' in window) {
          console.log('🎵 Using browser speechSynthesis fallback for message replay');
          const cleanText = cleanMessageForVoice(text);

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;

          const voices = speechSynthesis.getVoices();
          const preferredVoice = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            (v.name.includes('Female') && v.lang.startsWith('en'))
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          utterance.onend = () => {
            setCurrentlySpeakingId(undefined);
            setIsResponding(false);
            setIsAudioPlaying(false);
          };
          utterance.onerror = () => {
            setCurrentlySpeakingId(undefined);
            setIsResponding(false);
            setIsAudioPlaying(false);
          };

          speechSynthesis.speak(utterance);
          return; // Browser TTS started
        }
      } catch (fallbackErr) {
        console.error('❌ Browser TTS fallback also failed:', fallbackErr);
      }

      toast.error('Voice unavailable - check browser settings');
      setCurrentlySpeakingId(undefined);
      setIsResponding(false);
      setIsAudioPlaying(false);
    }
  }, [agentConfig.voice]);

  const handleStopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlySpeakingId(undefined);
  }, []);

  // EMERGENCY STOP - Stops MAIA completely
  const handleEmergencyStop = useCallback(() => {
    console.log('🛑 EMERGENCY STOP activated');

    // Stop MAIA's voice (Browser TTS)
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.error('Error stopping speech:', e);
    }

    // Stop any audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Mute the microphone
    setIsMuted(true);
    if (voiceMicRef.current?.stopListening) {
      voiceMicRef.current.stopListening();
    }

    // Reset all states
    setIsResponding(false);
    setIsAudioPlaying(false);
    setIsMicrophonePaused(true);
    setCurrentlySpeakingId(undefined);

    console.log('🛑 All MAIA systems stopped');
  }, []);

  // ⏰ Session Timer Handlers
  const handleStartSession = useCallback((durationMinutes: number) => {
    console.log(`⏰ Starting ${durationMinutes}-minute session with temporal container`);

    const timer = new SessionTimer({
      durationMinutes,
      onPhaseChange: (phase) => {
        console.log(`⏰ Session phase: ${phase}`);
        // Could trigger subtle UI transitions based on phase
      },
      onTimeWarning: (minutesRemaining) => {
        console.log(`⏰ ${minutesRemaining} minutes remaining in session`);
        // Gentle notification already handled by SessionTimeAwareness component
      },
      onComplete: () => {
        console.log('⏰ Session time complete - beginning closing ritual');
        // Show closing ritual modal
        setShowClosingRitual(true);
        // Note: Gong will play during ritual sequence, not here
      }
    });

    timer.start(); // Begin tracking time
    setSessionTimer(timer);
    onCloseSessionSelector?.(); // Close the session selector
    onSessionActiveChange?.(true); // Notify parent that session is now active

    // Play opening gong - single grounding tone for beginning
    const gong = getSessionGong(0.3);
    gong.playOpeningGong().catch(err =>
      console.warn('Could not play opening gong:', err)
    );

    // 💾 Start auto-save (every 30 seconds)
    const cleanup = startAutoSave(() => ({
      startTime: timer.getStartTime().toISOString(),
      durationMinutes: timer.getDurationMinutes(),
      userId: userId || 'anonymous',
      userName: userName || 'Friend',
      sessionId,
      lastSavedAt: new Date().toISOString(),
      wasExtended: false,
      totalExtensionMinutes: 0
    }));
    autoSaveCleanupRef.current = cleanup;

    console.log(`✅ Session timer initialized - MAIA will be temporally aware`);
  }, [userId, userName, sessionId]);

  const handleExtendSession = useCallback((additionalMinutes: number) => {
    if (sessionTimer) {
      sessionTimer.extend(additionalMinutes);
      console.log(`⏰ Session extended by ${additionalMinutes} minutes`);
      toast.success(`Session extended by ${additionalMinutes} minutes`, {
        duration: 2000,
        position: 'top-center'
      });
    }
  }, [sessionTimer]);

  // 💾 Session Persistence Handlers
  const handleResumeSession = useCallback(() => {
    if (!savedSessionData) return;

    console.log('💾 Resuming saved session:', savedSessionData.sessionId);

    // Restore timer from saved data
    const timer = SessionTimer.fromSavedData(
      new Date(savedSessionData.startTime),
      savedSessionData.durationMinutes,
      savedSessionData.totalExtensionMinutes,
      {
        onPhaseChange: (phase) => {
          console.log(`⏰ Session phase: ${phase}`);
        },
        onTimeWarning: (minutesRemaining) => {
          console.log(`⏰ ${minutesRemaining} minutes remaining in session`);
        },
        onComplete: () => {
          console.log('⏰ Session time complete - offering graceful closure');
          const gong = getSessionGong(0.3);
          gong.playClosingGong().catch(err =>
            console.warn('Could not play closing gong:', err)
          );
          // Clear from localStorage on natural completion
          clearSession();
        }
      }
    );

    timer.start();
    setSessionTimer(timer);
    setShowResumePrompt(false);
    setSavedSessionData(null);

    // Start auto-save for restored session
    const cleanup = startAutoSave(() => ({
      startTime: timer.getStartTime().toISOString(),
      durationMinutes: timer.getDurationMinutes(),
      userId: userId || 'anonymous',
      userName: userName || 'Friend',
      sessionId,
      lastSavedAt: new Date().toISOString(),
      wasExtended: savedSessionData.wasExtended,
      totalExtensionMinutes: savedSessionData.totalExtensionMinutes
    }));
    autoSaveCleanupRef.current = cleanup;

    console.log('✅ Session resumed successfully');
  }, [savedSessionData, userId, userName, sessionId]);

  const handleStartNewSession = useCallback(() => {
    console.log('🗑️ Clearing saved session and starting fresh');
    clearSession();
    setShowResumePrompt(false);
    setSavedSessionData(null);
    // Note: User will click header button to open session selector
  }, []);

  // 🕯️ Ritual Handlers
  const handleDurationSelected = useCallback((durationMinutes: number) => {
    // Store duration and show opening ritual
    setPendingSessionDuration(durationMinutes);
    onCloseSessionSelector?.(); // Close the session selector
    setShowOpeningRitual(true);
    console.log(`🕯️ Opening ritual beginning for ${durationMinutes}-minute session`);
  }, [onCloseSessionSelector]);

  const handleOpeningRitualComplete = useCallback(() => {
    setShowOpeningRitual(false);
    if (pendingSessionDuration) {
      handleStartSession(pendingSessionDuration);
      setPendingSessionDuration(null);
    }
  }, [pendingSessionDuration]);

  const handleOpeningRitualSkip = useCallback(() => {
    setShowOpeningRitual(false);
    if (pendingSessionDuration) {
      handleStartSession(pendingSessionDuration);
      setPendingSessionDuration(null);
    }
  }, [pendingSessionDuration]);

  const handleClosingRitualComplete = useCallback(() => {
    setShowClosingRitual(false);
    console.log('🕯️ Closing ritual complete - session ended');

    // Play closing gong
    const gong = getSessionGong(0.3);
    gong.playClosingGong().catch(err =>
      console.warn('Could not play closing gong:', err)
    );

    // Clean up session
    clearSession();
    autoSaveCleanupRef.current?.();
    autoSaveCleanupRef.current = null;
    setSessionTimer(null);
    onSessionActiveChange?.(false); // Notify parent that session ended

    // Could trigger post-session actions here (analytics, journaling prompt, etc.)
  }, [onSessionActiveChange]);

  const handleClosingRitualSkip = useCallback(() => {
    setShowClosingRitual(false);
    console.log('🕯️ Closing ritual skipped');
  }, []);

  // Check for saved session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      const remainingTime = getSavedSessionTimeRemaining();
      const phase = getSavedSessionPhase();

      console.log('📂 Found saved session:', {
        sessionId: saved.sessionId,
        remainingTime,
        phase
      });

      setSavedSessionData(saved);
      setShowResumePrompt(true);
    }
  }, []); // Only run on mount

  // Clean up timer and auto-save on unmount
  useEffect(() => {
    return () => {
      sessionTimer?.stop();
      autoSaveCleanupRef.current?.();
    };
  }, [sessionTimer]);

  // DIAGNOSTIC LOGGING - Removed to reduce console noise and improve performance

  return (
    <div className="oracle-conversation min-h-screen bg-soul-background overflow-hidden">
      {/* iOS Audio Enable Button - DISABLED - causing black screen */}
      {false && needsIOSAudioPermission && (
        <div className="modal-backdrop fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center">
          <div className="max-w-md p-8 text-center">
            <button
              onClick={enableAudio}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl
                       shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="text-lg font-medium">Tap to Enable Audio</span>
            </button>
            <p className="text-center text-white/60 text-sm mt-3">Required for voice on iOS devices</p>

            {/* Skip option if audio fails */}
            <button
              onClick={() => {
                console.log('⏭️ User choosing to continue without audio');
                setNeedsIOSAudioPermission(false);
                setIsIOSAudioEnabled(false);
                setAudioEnabled(false);
                toast('Continuing in text-only mode', {
                  duration: 3000,
                  position: 'top-center'
                });
              }}
              className="mt-6 text-amber-400/60 hover:text-amber-400 text-sm underline transition-colors"
            >
              Continue without audio (text chat only)
            </button>
          </div>
        </div>
      )}

      {/* Branded Welcome Message - REMOVED for mobile optimization */}

      {/* Claude-like Welcome Greeting - Shows when no messages yet */}
      <AnimatePresence>
        {messages.filter(m => !m.id.startsWith('greeting-')).length === 0 && !isProcessing && !isResponding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8 px-4 w-full max-w-2xl">
              {/* Holoflower Icon + Greeting */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src="/holoflower-amber.png"
                    alt="MAIA"
                    className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]"
                    style={{
                      filter: 'brightness(1.2)',
                    }}
                  />
                </motion.div>

                {/* Greeting Text - Inline with icon */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-light"
                  style={{
                    fontFamily: 'Spectral, Georgia, serif',
                    color: '#C9956C',
                    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {getTimeGreeting()}{userName ? `, ${userName}` : ''}
                </motion.h1>
              </div>

              {/* Welcome Input Field - Claude-like centered input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full"
              >
                <div className="flex items-end gap-3 bg-[#2a2a3e]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl px-4 py-3">
                  <textarea
                    ref={welcomeInputRef}
                    placeholder="How can I help you today?"
                    className="flex-1 bg-transparent text-[#E8D5B7] placeholder-white/40
                             resize-none outline-none text-base md:text-lg"
                    style={{
                      fontFamily: 'Spectral, Georgia, serif',
                      minHeight: '40px',
                      maxHeight: '200px',
                    }}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const text = (e.target as HTMLTextAreaElement).value.trim();
                        if (text) {
                          setShowChatInterface(true); // Switch to chat mode after first message
                          handleTextMessage(text);
                          (e.target as HTMLTextAreaElement).value = '';
                        }
                      }
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                    }}
                  />
                  {/* Send button - right side */}
                  <button
                    onClick={() => {
                      const textarea = welcomeInputRef.current;
                      if (textarea) {
                        const text = textarea.value.trim();
                        if (text) {
                          setShowChatInterface(true); // Switch to chat mode after first message
                          handleTextMessage(text);
                          textarea.value = '';
                          textarea.style.height = 'auto';
                        }
                      }
                    }}
                    className="flex-shrink-0 p-2.5 rounded-xl transition-all active:scale-95"
                    style={{ backgroundColor: '#F59E0B' }}
                    title="Send message"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="#1A1513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scribe Mode Recording Indicator */}
      <AnimatePresence>
        {isScribing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-below-nav"
          >
            <div className="bg-gradient-to-r from-jade-shadow/90 to-jade-night/90 backdrop-blur-xl rounded-full px-6 py-3 border border-jade-sage/50 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-3 h-3 bg-jade-jade rounded-full shadow-[0_0_12px_rgba(168,203,180,0.8)]"
                />
                <div>
                  <div className="text-jade-jade text-sm font-medium">📝 Scribe Mode Active</div>
                  <div className="text-jade-mineral/70 text-xs">
                    Recording session •
                    {scribeSession?.voiceTranscripts?.length || 0} voice +
                    {scribeSession?.consultationMessages?.length || 0} consultations
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛡️ SANCTUARY MODE INDICATOR - Visual proof of memory exclusion */}
      <AnimatePresence>
        {isSanctuary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-4 z-below-nav"
          >
            <div className="bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 backdrop-blur-xl rounded-full px-4 py-2 border border-emerald-500/50 shadow-2xl">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                />
                <span className="text-emerald-300 text-xs font-medium">Sanctuary</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIA Settings Panel */}
      {showSettingsPanel && (
        <MaiaSettingsPanel onClose={() => setShowSettingsPanel(false)} />
      )}

      {/* 🧠 NLP-INFORMED TRANSFORMATIONAL PRESENCE - No explanatory UI, only experience */}
      {/* State transitions happen through breathing, color, field - unconscious installation */}
      {/* Gestures replace buttons: swipe down = deepen, swipe up = quicken, long press = stay */}

      {/* Agent Customizer - Moved to SacredLabDrawer in future iteration */}
      {showCustomizer && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCustomizer(false)} />
          <div className="relative z-10">
            <AgentCustomizer
              position="top-right"
              onConfigChange={(config) => {
                setAgentConfig(config);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('selected_voice', config.name);
                  if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }
                console.log('Agent changed to:', config.name);
                setShowCustomizer(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ⏰ Start Session Button - Moved to header banner */}

      {/* 🧠 TRANSFORMATIONAL PRESENCE - NLP-Informed State Container */}
      {/* Breathing entrainment, color transitions, field expansion based on state */}
      {/* NO cognitive UI - the experience itself induces the transformation */}
      <div className="fixed top-28 sm:top-20 left-1/2 -translate-x-1/2 z-[25]">
        <TransformationalPresence
          currentState={realtimeMode as PresenceState}
          onStateChange={(newState, transition) => {
            console.log('🌀 State transition:', transition);
            // Map back to listeningMode
            const newListeningMode: ListeningMode =
              newState === 'dialogue' ? 'normal' :
              newState === 'patient' ? 'patient' : 'session';
            setListeningMode(newListeningMode);
            // Mode is tracked locally in state, no OpenAI connection needed
          }}
          userSilenceDuration={0} // TODO: Track actual silence duration
          userSpeechTempo={120} // TODO: Track actual speech tempo
          isListening={isListening}
          isSpeaking={isResponding}
          biometricEnabled={true} // ⌚ APPLE WATCH INTEGRATION ENABLED
        >
          {/* Holoflower wrapped in Transformational Presence - inherits breathing, color, field */}
          <motion.div
            className="cursor-pointer opacity-60 hover:opacity-80 transition-opacity relative"
            style={{
              zIndex: 20,
              pointerEvents: 'auto',
              willChange: 'auto'
            }}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🌸 Holoflower clicked!');

              // Enable audio context first
              await enableAudio();

              // Use isListening state instead of isMuted for accurate toggle
              if (voiceMicRef.current) {
                if (!isListening) {
                  // SAFETY: Don't start mic while MAIA is speaking
                  if (isAudioPlayingRef.current || isRespondingRef.current) {
                    console.log('⏸️ Cannot start mic - MAIA is still speaking');
                    return;
                  }
                  // Start listening
                  console.log('🎤 Starting voice via holoflower...');
                  setIsMuted(false);
                  setIsListening(true); // Immediately show visual indicator
                  try {
                    await voiceMicRef.current.startListening();
                    console.log('✅ Voice started successfully');
                  } catch (error: any) {
                    console.error('❌ Failed to start microphone:', error);
                    setIsMuted(true); // Reset on error

                    // Show specific error messages for different scenarios
                    if (error.message === 'VOICE_UNAVAILABLE') {
                      // Check if in simulator
                      const isSimulator = window.navigator.userAgent.toLowerCase().includes('simulator') ||
                                         window.navigator.userAgent.toLowerCase().includes('x86_64');
                      if (isSimulator) {
                        toast.error('Voice unavailable in simulator. Use text input or test on physical device.', { duration: 5000 });
                      } else {
                        toast.error('Voice not supported in iOS app. Use text input below.', { duration: 5000 });
                      }
                      // Show text input as fallback
                      setShowChatInterface(true);
                    } else if (error.message === 'MICROPHONE_UNAVAILABLE') {
                      toast.error('Microphone not available. Please check permissions in your browser settings.');
                    } else {
                      toast.error('Unable to access microphone. Please try again.');
                    }
                  }
                } else {
                  // Stop listening
                  console.log('🔇 Stopping voice via holoflower...');
                  setIsMuted(true);
                  voiceMicRef.current.stopListening();
                  console.log('✅ Voice stopped successfully');
                }
              } else {
                console.warn('⚠️ Voice ref not available');
              }
            }}
          >
        {/* Holoflower container - smaller, upper-left, visible but not dominating */}
        <div className="flex items-center justify-center"
             style={{
               width: holoflowerSize,
               height: holoflowerSize,
               background: 'transparent',
               overflow: 'visible',
               pointerEvents: 'none'  // Allow clicks to pass through to parent
             }}>
          {/* 🌊 LIQUID AI - Rhythm-aware Holoflower with light field but no pie chart */}
          <RhythmHoloflower
            rhythmMetrics={rhythmMetrics}
            size={holoflowerSize}
            interactive={false}
            showLabels={false}
            motionState={currentMotionState}
            isListening={isListening}
            isProcessing={isProcessing}
            isResponding={isResponding}
            showBreakthrough={showBreakthrough}
            voiceAmplitude={voiceAmplitude}
            isMaiaSpeaking={isResponding || isAudioPlaying}
            dimmed={false}
          />

          {/* Central Holoflower Logo with Glow and Sparkles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Minimal glow - almost imperceptible */}
            <motion.div
              className={`absolute flex items-center justify-center pointer-events-none ${
                showChatInterface || messages.filter(m => !m.id.startsWith('greeting-')).length > 0
                  ? 'opacity-0'  // Invisible when text present
                  : 'opacity-10'  // Barely visible when listening
              }`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: showChatInterface || messages.length > 0 ? 0 : [0.05, 0.1, 0.05]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="w-32 h-32 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 184, 150, 0.15) 0%, transparent 60%)',
                  filter: 'blur(40px)',
                  transform: 'translate(0, 0)'
                }}
              />
            </motion.div>

            {/* Holoflower Image - Amber radiance */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <img
                src="/holoflower-amber.png"
                alt="Holoflower"
                className="object-contain opacity-80 drop-shadow-[0_0_15px_rgba(251,146,60,0.7)]"
                style={{
                  width: `${holoflowerSize * 0.85}px`,
                  height: `${holoflowerSize * 0.85}px`,
                  filter: 'brightness(1.3)',
                }}
              />
            </div>

            {/* Mode-colored persistent light field - always visible with mode colors */}
            {true && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '280px',
                    height: '280px',
                    background: listeningMode === 'normal'
                      ? 'radial-gradient(circle, rgba(251, 191, 36, 0.85) 0%, rgba(251, 191, 36, 0.45) 40%, rgba(251, 191, 36, 0.18) 70%, rgba(251, 191, 36, 0.05) 90%, transparent 100%)' // Dialogue - Amber (brightest)
                      : listeningMode === 'patient'
                      ? 'radial-gradient(circle, rgba(20, 184, 166, 0.85) 0%, rgba(20, 184, 166, 0.45) 40%, rgba(20, 184, 166, 0.18) 70%, rgba(20, 184, 166, 0.05) 90%, transparent 100%)' // Counsel - Teal (brightest)
                      : listeningMode === 'session'
                      ? 'radial-gradient(circle, rgba(59, 130, 246, 0.85) 0%, rgba(59, 130, 246, 0.45) 40%, rgba(59, 130, 246, 0.18) 70%, rgba(59, 130, 246, 0.05) 90%, transparent 100%)' // Scribe - Blue (brightest)
                      : 'radial-gradient(circle, rgba(251, 191, 36, 0.85) 0%, rgba(251, 191, 36, 0.45) 40%, rgba(251, 191, 36, 0.18) 70%, rgba(251, 191, 36, 0.05) 90%, transparent 100%)', // Default - Amber (brightest)
                    filter: 'blur(18px)',
                  }}
                  animate={{
                    scale: smoothedAudioLevel > 0.5 ? 1 + smoothedAudioLevel * 0.15 : 1,
                    opacity: smoothedAudioLevel > 0.5 ? 0.4 + smoothedAudioLevel * 0.15 : 0.3,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}

            {/* Sparkles emanating from center - ULTRA SLOW & EPHEMERAL */}
            {/* Only render on client to prevent hydration mismatch from Math.random() */}
            {isMounted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Main radial sparkles - slower drift */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-0.5 h-0.5 bg-white/80 rounded-full"
                  style={{
                    filter: 'blur(0.5px)'
                  }}
                  animate={{
                    x: [0, Math.cos(i * Math.PI / 6) * 100],
                    y: [0, Math.sin(i * Math.PI / 6) * 100],
                    opacity: [0, 0.7, 0.3, 0],
                    scale: [0, 1.2, 0.8, 0]
                  }}
                  transition={{
                    duration: 10 + i * 0.5, // Deterministic: 10-15.5 seconds
                    repeat: Infinity,
                    delay: i * 1.5 + i * 0.3, // Deterministic delay
                    ease: "easeInOut",
                    repeatDelay: i * 0.4 // Deterministic pauses
                  }}
                />
              ))}
              
              {/* Spiraling sparkles - dreamy drift */}
              {[...Array(16)].map((_, i) => {
                const angle = (i * Math.PI * 2) / 16;
                const spiralRotation = i * 30;
                const deterministicDuration = 12 + (i % 6); // 12-17 seconds (deterministic)
                const deterministicDelay = i * 0.6; // Deterministic delay
                return (
                  <motion.div
                    key={`sparkle-spiral-${i}`}
                    className="absolute w-0.5 h-0.5 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,200,0.9) 0%, transparent 70%)',
                      filter: 'blur(0.3px)'
                    }}
                    animate={{
                      x: [
                        0,
                        Math.cos(angle) * 20,
                        Math.cos(angle + 0.5) * 50,
                        Math.cos(angle + 1) * 80,
                        Math.cos(angle + 1.5) * 100
                      ],
                      y: [
                        0,
                        Math.sin(angle) * 20,
                        Math.sin(angle + 0.5) * 50,
                        Math.sin(angle + 1) * 80,
                        Math.sin(angle + 1.5) * 100
                      ],
                      opacity: [0, 0.6, 0.4, 0.2, 0],
                      scale: [0, 1, 0.8, 0.5, 0],
                      rotate: [0, spiralRotation]
                    }}
                    transition={{
                      duration: deterministicDuration,
                      repeat: Infinity,
                      delay: deterministicDelay + i * 0.5,
                      ease: "easeInOut",
                      repeatDelay: i * 0.5 // Deterministic pauses
                    }}
                  />
                );
              })}
              
              {/* Tiny twinkling sparkles - ultra gentle */}
              {/* Using deterministic positions based on index to avoid hydration mismatch */}
              {[...Array(25)].map((_, i) => {
                // Use golden ratio-based distribution for natural-looking but deterministic positions
                const goldenRatio = 1.618033988749895;
                const posX = 35 + ((i * goldenRatio * 30) % 30);
                const posY = 35 + ((i * goldenRatio * goldenRatio * 30) % 30);
                const opacityPeak = 0.2 + (i % 6) * 0.1; // 0.2-0.7
                const scalePeak = 0.5 + (i % 5) * 0.2; // 0.5-1.3
                return (
                  <motion.div
                    key={`sparkle-tiny-${i}`}
                    className="absolute w-px h-px rounded-full"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      background: 'white',
                      boxShadow: '0 0 2px rgba(255,255,255,0.5)'
                    }}
                    animate={{
                      opacity: [0, 0, opacityPeak, 0, 0],
                      scale: [0, 0, scalePeak, 0, 0],
                    }}
                    transition={{
                      duration: 8 + (i % 7), // 8-14 seconds (deterministic)
                      repeat: Infinity,
                      delay: i * 0.6, // Deterministic delay
                      ease: "easeInOut",
                      repeatDelay: i * 0.4, // Deterministic pauses
                      times: [0, 0.3, 0.5, 0.7, 1] // Quick twinkle in the middle
                    }}
                  />
                );
              })}
            </div>
            )}

            {/* Voice Visualizer - ULTRAVIOLET AURA - Solid glow spreading behind holoflower */}
            {isMounted && !showChatInterface && voiceEnabled && isListening && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ zIndex: -1 }} // Behind holoflower
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Core ultraviolet glow - solid spreading from center */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '400px',
                    height: '400px',
                    // Solid gradient from center, spreading outward
                    background: 'radial-gradient(circle, rgba(138, 43, 226, 0.35) 0%, rgba(148, 0, 211, 0.25) 30%, rgba(106, 27, 154, 0.15) 55%, rgba(94, 53, 177, 0.08) 75%, transparent 100%)',
                    filter: 'blur(20px)',
                    transform: `scale(${1 + voiceAmplitude * 0.6})`,
                    opacity: 0.5 + voiceAmplitude * 0.5,
                    transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
                  }}
                />

                {/* Secondary spreading wave */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(156, 39, 176, 0.2) 0%, rgba(123, 31, 162, 0.12) 40%, rgba(94, 53, 177, 0.06) 65%, transparent 100%)',
                    filter: 'blur(30px)',
                    transform: `scale(${1 + voiceAmplitude * 0.8})`,
                    opacity: 0.4 + voiceAmplitude * 0.4,
                    transition: 'transform 0.06s ease-out, opacity 0.06s ease-out',
                  }}
                />

                {/* Outer diffuse field - spreads far into background */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '650px',
                    height: '650px',
                    background: 'radial-gradient(circle, rgba(126, 87, 194, 0.12) 0%, rgba(149, 117, 205, 0.08) 35%, rgba(103, 58, 183, 0.04) 60%, transparent 100%)',
                    filter: 'blur(40px)',
                    transform: `scale(${1 + voiceAmplitude * 1.0})`,
                    opacity: 0.35 + voiceAmplitude * 0.35,
                    transition: 'transform 0.07s ease-out, opacity 0.07s ease-out',
                  }}
                />

                {/* Brightest inner core - most reactive */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '250px',
                    height: '250px',
                    background: 'radial-gradient(circle, rgba(186, 85, 211, 0.4) 0%, rgba(138, 43, 226, 0.3) 40%, rgba(148, 0, 211, 0.15) 70%, transparent 100%)',
                    filter: 'blur(12px)',
                    transform: `scale(${1 + voiceAmplitude * 0.5})`,
                    opacity: 0.6 + voiceAmplitude * 0.4,
                    transition: 'transform 0.04s ease-out, opacity 0.04s ease-out',
                  }}
                />

              </motion.div>
            )}

            {/* Voice Visualizer - MAIA's voice - TEAL/TURQUOISE - Reactive to Audio */}
            {(isResponding || isAudioPlaying) && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* MAIA teal glow rings - reactive to audio amplitude */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`maia-voice-glow-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: `${280 + i * 120}px`,
                      height: `${280 + i * 120}px`,
                      background: i === 0
                        ? 'radial-gradient(circle, rgba(45, 212, 191, 0.55) 0%, rgba(20, 184, 166, 0.2) 60%, transparent 100%)'
                        : i === 1
                        ? 'radial-gradient(circle, rgba(34, 197, 178, 0.4) 0%, rgba(45, 212, 191, 0.12) 60%, transparent 100%)'
                        : 'radial-gradient(circle, rgba(94, 234, 212, 0.3) 0%, rgba(20, 184, 166, 0.08) 60%, transparent 100%)',
                      filter: `blur(${18 + i * 8}px)`,
                      // Dynamic scale based on voice amplitude
                      transform: `scale(${1 + voiceAmplitude * (0.3 + i * 0.15)})`,
                      opacity: 0.3 + voiceAmplitude * 0.5,
                      transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
                    }}
                  />
                ))}

                {/* Inner teal glow - reactive to MAIA voice */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(45, 212, 191, 0.35) 0%, rgba(20, 184, 166, 0.15) 50%, transparent 70%)',
                    filter: 'blur(25px)',
                    transform: `scale(${1 + voiceAmplitude * 0.5})`,
                    opacity: 0.4 + voiceAmplitude * 0.6,
                    transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
                  }}
                />

                {/* Bright center pulse - most reactive (bright teal) */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(94, 234, 212, 0.5) 0%, rgba(45, 212, 191, 0.3) 40%, rgba(20, 184, 166, 0.15) 70%, transparent 100%)',
                    filter: 'blur(15px)',
                    transform: `scale(${1 + voiceAmplitude * 0.8})`,
                    opacity: 0.5 + voiceAmplitude * 0.5,
                    transition: 'transform 0.03s ease-out, opacity 0.03s ease-out',
                  }}
                />
              </motion.div>
            )}

            {/* Status text below holoflower - always show listening indicator */}
            {isMounted && !showChatInterface && voiceEnabled && (
              <div className="absolute bottom-[-110px] left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
                {/* Elemental Mode Indicator - TEMPORARILY DISABLED
                {voiceMicRef.current?.elementalMode && (
                  <motion.div
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: `${voiceMicRef.current.elementalMode === 'fire' ? 'rgba(239, 68, 68, 0.2)' :
                        voiceMicRef.current.elementalMode === 'water' ? 'rgba(107, 155, 209, 0.2)' :
                        voiceMicRef.current.elementalMode === 'earth' ? 'rgba(161, 98, 7, 0.2)' :
                        voiceMicRef.current.elementalMode === 'air' ? 'rgba(212, 184, 150, 0.2)' :
                        'rgba(147, 51, 234, 0.2)'}`,
                      border: `1px solid ${voiceMicRef.current.elementalMode === 'fire' ? 'rgba(239, 68, 68, 0.4)' :
                        voiceMicRef.current.elementalMode === 'water' ? 'rgba(107, 155, 209, 0.4)' :
                        voiceMicRef.current.elementalMode === 'earth' ? 'rgba(161, 98, 7, 0.4)' :
                        voiceMicRef.current.elementalMode === 'air' ? 'rgba(212, 184, 150, 0.4)' :
                        'rgba(147, 51, 234, 0.4)'}`
                    }}
                  >
                    <span className="text-xs font-medium" style={{
                      color: voiceMicRef.current.elementalMode === 'fire' ? '#ef4444' :
                        voiceMicRef.current.elementalMode === 'water' ? '#6B9BD1' :
                        voiceMicRef.current.elementalMode === 'earth' ? '#a16207' :
                        voiceMicRef.current.elementalMode === 'air' ? '#D4B896' :
                        '#9333ea'
                    }}>
                      {voiceMicRef.current.elementalMode === 'fire' ? '🔥 Fire' :
                        voiceMicRef.current.elementalMode === 'water' ? '💧 Water' :
                        voiceMicRef.current.elementalMode === 'earth' ? '🌍 Earth' :
                        voiceMicRef.current.elementalMode === 'air' ? '🌬️ Air' :
                        '✨ Aether'}
                    </span>
                  </motion.div>
                )} */}
                {/* Status messages - Processing state takes priority */}
                <AnimatePresence mode="wait">
                  {(isResponding || isAudioPlaying || isProcessing) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                        y: 0,
                        scale: [0.98, 1, 0.98]
                      }}
                      transition={{
                        opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-amber-300/95 text-sm font-medium drop-shadow-[0_0_10px_rgba(252,211,77,0.6)]"
                    >
                      {isProcessing && !isResponding && !isAudioPlaying ? '✨ Thinking...' :
                       isResponding && !isAudioPlaying ? '🎵 Preparing voice...' :
                       '💫 Speaking...'}
                    </motion.div>
                  )}
                  {isListening && !isResponding && !isAudioPlaying && !isProcessing && (
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                          opacity: [0.8, 1, 0.8],
                          y: 0
                        }}
                        transition={{
                          opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-emerald-300/95 text-sm font-medium drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]"
                      >
                        🎤 Listening...
                      </motion.div>
                      {/* Keep Recording button - subtle, only when recording */}
                      {voiceMicRef.current?.isRecording && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 0.7, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ opacity: 1, scale: 1.05 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            voiceMicRef.current?.extendRecording();
                          }}
                          className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-300/90 rounded-full backdrop-blur-sm
                                   border border-emerald-400/30 hover:bg-emerald-500/30 hover:border-emerald-400/50
                                   transition-all duration-200 drop-shadow-[0_0_6px_rgba(110,231,183,0.3)]"
                        >
                          ⏱️ Keep Recording
                        </motion.button>
                      )}
                    </div>
                  )}
                  {!isListening && !isResponding && !isAudioPlaying && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-amber-300/95 text-sm font-medium drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]"
                    >
                      Click to activate
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* OLD BUTTON REMOVED - Holoflower itself is now clickable */}
          </div>
        </div>
      </motion.div>
        </TransformationalPresence>
      </div>

      {/* Shadow petal overlay */}
      {shadowPetals.length > 0 && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative" style={{ width: 400, height: 400 }}>
            {shadowPetals.map(petalId => (
              <div
                key={petalId}
                className="absolute inset-0 bg-black/20 rounded-full"
                style={{
                  clipPath: `polygon(50% 50%, ${Math.random() * 100}% 0%, ${Math.random() * 100}% 100%)`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* REMOVED: Separate white circle button - holoflower itself is now clickable */}

      {/* Text Scrim - Warm volcanic veil when messages appear (absorbs light, doesn't just dim) */}
      {(showChatInterface || (!showChatInterface && showVoiceText)) && messages.length > 0 && (
        <div
          className="fixed inset-0 z-20 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 21, 19, 0.75) 0%, rgba(28, 22, 20, 0.65) 50%, rgba(26, 21, 19, 0.75) 100%)',
            backdropFilter: 'blur(1.5px) saturate(0.85) brightness(0.75)',
            WebkitBackdropFilter: 'blur(1.5px) saturate(0.85) brightness(0.75)'
          }}
        />
      )}

      {/* Message flow - Star Wars crawl: text flows from beneath holoflower */}
      {(showChatInterface || (!showChatInterface && showVoiceText)) && messages.length > 0 && (
        <div className={`fixed top-44 sm:top-52 md:top-60 lg:top-64 z-30 transition-all duration-500 left-1/2 -translate-x-1/2 ${
          showChatInterface
            ? 'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[600px] lg:w-[680px] xl:w-[720px] opacity-100'
            : 'w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[520px] lg:w-[560px] opacity-70'
        }`}
             style={{
               height: showChatInterface
                 ? 'calc(100vh - 240px)'
                 : 'calc(100vh - 280px)',
               maxHeight: showChatInterface
                 ? 'calc(100vh - 240px)'
                 : 'calc(100vh - 280px)',
               bottom: showChatInterface ? '220px' : '180px',
               overflow: 'hidden'
             }}>
          <div className="h-full overflow-y-scroll overflow-x-hidden pr-2 mobile-scroll"
               style={{
                 scrollBehavior: 'smooth',
                 WebkitOverflowScrolling: 'touch',
                 overscrollBehavior: 'contain',
                 touchAction: 'pan-y'
               }}>
            <AnimatePresence>
              {messages.length > 0 && (
                <div className="space-y-3 pb-52 md:pb-32">
                {/* Show all messages with proper scrolling */}
                {messages
                  .map((message, index) => {
                    const handleCopyMessage = async () => {
                      const textToCopy = (message.text ?? message.content ?? '').replace(/\*[^*]*\*/g, '').replace(/\([^)]*\)/gi, '').trim();
                      try {
                        await navigator.clipboard.writeText(textToCopy);
                        toast.success('Message copied!', {
                          duration: 2000,
                          position: 'bottom-center',
                          style: {
                            background: '#1a1f2e',
                            color: '#d4b896',
                            border: '1px solid rgba(212, 184, 150, 0.2)',
                          },
                        });
                      } catch {
                        toast.error('Failed to copy', {
                          duration: 2000,
                          position: 'bottom-center',
                        });
                      }
                    };

                    return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`bg-transparent p-4 text-soul-textPrimary max-w-full
                               cursor-pointer transition-all duration-300 group
                               ${message.role === 'user' ? 'message-user' : 'message-maia'}`}
                      data-role={message.role === 'user' ? 'user' : 'assistant'}
                      onClick={handleCopyMessage}
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs" style={{ color: '#D4A574', opacity: 0.8, fontFamily: 'Spectral, Georgia, serif', letterSpacing: '0.05em' }}>
                          {message.role === 'user' ? (userName || 'You') : 'MAIA'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-400
                                      opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                                      touch-manipulation transition-opacity">
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline text-amber-400">Click to copy</span>
                          <span className="sm:hidden text-amber-400">Tap to copy</span>
                        </div>
                      </div>
                      <div className="text-base sm:text-lg md:text-xl leading-relaxed break-words" style={{ color: '#E8C99B', fontFamily: 'Spectral, Georgia, serif' }}>
                        {message.role === 'oracle' ? (
                          <FormattedMessage
                            text={message.text}
                            enableVocabularyTooltips={enableVocabularyTooltips}
                          />
                        ) : (
                          message.text
                        )}
                      </div>

                      {/* MAIA Feedback Widget with Opus Gold Seal - only for MAIA responses */}
                      {message.role === 'oracle' && message.turnId && (
                        <div className="mt-3">
                          <MaiaFeedbackWidget
                            turnId={message.turnId}
                            opusAxioms={message.opusAxioms}
                            compact={false}
                          />
                        </div>
                      )}

                      {/* Pattern Chips - show detected patterns for MAIA responses */}
                      {message.role === 'oracle' && message.metadata?.patterns && message.metadata.patterns.length > 0 && (
                        <PatternChips
                          patterns={message.metadata.patterns}
                          onOpen={(p) => {
                            setActivePattern(p);
                            setPatternDrawerOpen(true);
                          }}
                        />
                      )}
                    </motion.div>
                    );
                  })}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Chat Interface or Voice Mic */}
      {voiceEnabled && (
        <>
          {/* Old Mode Toggle removed - Now using ModeSwitcher at top-left */}

          {/* Text Display Toggle for Voice Mode */}
          {!showChatInterface && (
            <div className="fixed top-20 md:top-20 right-4 md:right-8 z-below-nav">
              <button
                onClick={() => setShowVoiceText(!showVoiceText)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/20 backdrop-blur-md
                         text-white/60 hover:text-white/80 transition-all"
              >
                {showVoiceText ? 'Hide Text' : 'Show Text'}
              </button>
            </div>
          )}

          {showChatInterface ? (
            /* Chat Interface - Only show text input in Chat mode */
            <>
              {/* Compact Holoflower at top - REMOVED for mobile clean layout */}
              <div className="hidden">
                <motion.div
                  className="relative"
                  animate={{
                    scale: isResponding || isAudioPlaying ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isResponding || isAudioPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-20 h-20 relative">
                    {/* Turquoise glow effect when MAIA is speaking - reactive to audio */}
                    {(isResponding || isAudioPlaying) && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(64, 224, 208, 0.7) 0%, transparent 70%)',
                          filter: 'blur(20px)',
                          transform: `scale(${1 + voiceAmplitude * 0.6})`,
                          opacity: 0.4 + voiceAmplitude * 0.6,
                          transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
                        }}
                      />
                    )}
                    {/* Empty - just show the glow effect */}
                  </div>
                </motion.div>
              </div>

              {/* Voice toggle for chat mode - HIDDEN on mobile, visible on desktop */}
              <div className="hidden md:block fixed right-4 md:right-20 z-below-nav" style={{top: 'max(env(safe-area-inset-top, 0px) + 2rem, 7rem)'}}>
                <button
                  onClick={() => {
                    const newValue = !enableVoiceInChat;
                    setEnableVoiceInChat(newValue);
                    localStorage.setItem('enableVoiceInChat', JSON.stringify(newValue));
                    console.log('🎤 Voice in chat toggled:', newValue ? 'ON' : 'OFF');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    enableVoiceInChat
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-black/20 text-white/40 border border-white/10'
                  } backdrop-blur-md hover:bg-opacity-30`}
                  title={enableVoiceInChat ? 'Voice responses enabled' : 'Voice responses disabled'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>{enableVoiceInChat ? 'Voice On' : 'Voice Off'}</span>
                </button>
              </div>

              {/* Compact text input area - mobile-first, fixed at bottom */}
              {showChatInterface && (
              <div className="fixed inset-x-0 z-below-nav" style={{ bottom: '2.5rem' }}>
                {/* Modern text input area */}
                <div className="bg-soul-surface/90 px-2 py-3 pb-2 border-t border-soul-border/40 backdrop-blur-xl">
                  <ModernTextInput
                    ref={textInputRef}
                    value={draftMessage}
                    onChange={setDraftMessage}
                    externalValue={composerDraft}
                    disabled={isProcessing}
                    isProcessing={isProcessing}
                    enableVoiceInChat={enableVoiceInChat}
                    onSubmit={(msg, files) => {
                      handleTextMessage(msg, files);
                      setDraftMessage(''); // Clear draft after sending
                    }}
                    onVoiceResponseToggle={() => {
                      const newValue = !enableVoiceInChat;
                      setEnableVoiceInChat(newValue);
                      localStorage.setItem('enableVoiceInChat', JSON.stringify(newValue));
                      console.log('🔊 Voice responses toggled:', newValue ? 'ON' : 'OFF');
                    }}
                    onFileUpload={(files) => {
                      const fileNames = files.map(f => f.name).join(', ');
                      handleTextMessage(`Please analyze these files: ${fileNames}`, files);
                    }}
                    onDownloadConversation={handleDownloadConversation}
                    onOpenPromptPicker={() => setShowPromptPicker(true)}
                    autoFocus={true}
                    hasMemory={messages.length > 0 || !isReturningUser}
                    lastConnectionTime={
                      typeof window !== 'undefined'
                        ? localStorage.getItem('lastMaiaConnection') ?? undefined
                        : undefined
                    }
                    currentPhase={undefined}
                    relationshipDepth={
                      messages.length > 50 ? 'profound' :
                      messages.length > 20 ? 'deep' :
                      messages.length > 5 ? 'developing' : 'new'
                    }
                    mode={listeningMode}
                  />
                </div>
              </div>
              )}
            </>
          ) : null}

          {/* Mic Hint Message - Bottom placement above menu bar */}
          {!showChatInterface && isMuted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-1/2 transform -translate-x-1/2 z-below-nav"
              style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
            >
              <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-amber-400/40">
                <p className="text-amber-200/90 text-sm">Click the holoflower to activate voice</p>
              </div>
            </motion.div>
          )}

          {/* Journal Suggestion - Appears when breakthrough is detected */}
          <AnimatePresence mode="wait">
            {showJournalSuggestion && (
              <motion.div
                key="journal-suggestion"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed top-24 left-1/2 transform -translate-x-1/2 z-below-nav max-w-sm"
              >
                <div className="bg-gradient-to-br from-amber-500/20 to-gold-divine/20 backdrop-blur-xl rounded-2xl p-4 border border-amber-400/30 shadow-2xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-amber-200 font-medium mb-1">Breakthrough Detected</h3>
                      <p className="text-white/70 text-sm mb-3">
                        This feels like sacred ground. Would you like to capture the essence of this conversation in your journal?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleSaveAsJournal();
                          }}
                          disabled={isSavingJournal}
                          className="px-4 py-2 bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/50
                                   rounded-lg text-amber-200 text-sm font-medium transition-all active:scale-95
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingJournal ? 'Saving...' : 'Save to Journal'}
                        </button>
                        <button
                          onClick={() => {
                            setShowJournalSuggestion(false);
                            setJournalSuggestionDismissed(true);
                            console.log('🚫 [Journal] User dismissed journal suggestion');
                          }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20
                                   rounded-lg text-white/60 text-sm transition-all active:scale-95"
                        >
                          Not Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}



      {/* Analytics toggle */}
      {showAnalytics && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+2rem)] right-8">
          <button
            className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full
                       hover:bg-white/20 transition-colors"
          >
            Analytics →
          </button>
        </div>
      )}



      {/* Bottom Right Lab Tools Button - Contains journal access */}
      <button
        onClick={() => {
          console.log('🔬 Lab button clicked!');
          setShowLabDrawer(true);
        }}
        className="fixed bottom-6 right-6 z-below-nav p-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:scale-110 active:scale-95 border-2 border-amber-400/50"
        style={{
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          minWidth: '70px',
          minHeight: '70px',
        }}
        title="Open Lab Tools - Includes Journal Access"
      >
        <FlaskConical className="w-8 h-8 text-black drop-shadow-lg" />
      </button>

      {/* Voice Selection Menu - Popup from bottom */}
      {showVoiceMenu && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="modal-backdrop fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowVoiceMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="modal-content fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-gradient-to-b from-[#1a1a2e]/98 to-[#16213e]/98 backdrop-blur-xl border border-[#D4B896]/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#D4B896]/20">
                <svg className="w-5 h-5 text-[#D4B896]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="text-base font-semibold text-[#D4B896]">Choose MAIA's Voice</h3>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {[
                  { id: 'shimmer', name: 'Shimmer', description: 'Gentle & soothing • Feminine', emoji: '✨' },
                  { id: 'fable', name: 'Fable', description: 'Storytelling • Feminine', emoji: '📖' },
                  { id: 'nova', name: 'Nova', description: 'Bright & energetic • Feminine', emoji: '⭐' },
                  { id: 'alloy', name: 'Alloy', description: 'Neutral & balanced • Gender-neutral', emoji: '🔘' },
                  { id: 'echo', name: 'Echo', description: 'Warm & expressive • Masculine', emoji: '🌊' },
                  { id: 'onyx', name: 'Onyx', description: 'Deep & resonant • Masculine', emoji: '🖤' },
                ].map((voiceOption) => (
                  <motion.button
                    key={voiceOption.id}
                    onClick={() => {
                      if (onVoiceChange) {
                        onVoiceChange(voiceOption.id as any);
                      }
                      setShowVoiceMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      voice === voiceOption.id
                        ? 'bg-[#D4B896]/20 border border-[#D4B896]/50 text-[#D4B896]'
                        : 'bg-black/20 border border-white/5 text-white/70 hover:bg-[#D4B896]/10 hover:border-[#D4B896]/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{voiceOption.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{voiceOption.name}</div>
                      <div className="text-xs opacity-70">{voiceOption.description}</div>
                    </div>
                    {voice === voiceOption.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-[#D4B896] shadow-lg shadow-[#D4B896]/50"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Quick Settings Sheet - Advanced voice and personality controls */}
      <QuickSettingsSheet
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />

      {/* Floating Quick Settings Button */}
      {/* QuickSettingsButton removed - now in bottom nav bar */}

      {/* Voice/Chat Mode Switcher - REMOVED: Always use Realtime voice mode */}

      {/* Soulprint Metrics Widget - DISABLED: Causing 400 errors when userId not authenticated */}
      {/* {userId && <SoulprintMetricsWidget userId={userId} />} */}

      {/* Continuous Conversation - Uses browser Web Speech Recognition API (no webm issues) */}
      {voiceEnabled && (!showChatInterface || (showChatInterface && enableVoiceInput)) && (
        <div className="sr-only">
          <ContinuousConversation
            ref={voiceMicRef}
            onTranscript={handleVoiceTranscript}
            onRecordingStateChange={handleRecordingStateChange}
            onAudioLevelChange={handleAudioLevelChange}
            isProcessing={isResponding}
            isSpeaking={isAudioPlaying || isMicrophonePaused}
            autoStart={false}
            silenceThreshold={
              listeningMode === 'session' ? 999999 : // Session mode: never auto-send (effectively infinite)
              listeningMode === 'patient' ? 10000 :   // Patient mode: 10 seconds (increased for full thoughts)
              6000                                     // Normal mode: 6 seconds (increased from 3.5s to prevent mid-sentence cutoff)
            }
          />
        </div>
      )}

      {/* Hidden File Upload Input */}
      <input
        type="file"
        id="maiaFileUpload"
        className="hidden"
        multiple
        accept="*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            const fileNames = files.map(f => f.name).join(', ');
            handleTextMessage(`Please analyze these files: ${fileNames}`, files);
            e.target.value = ''; // Reset input
          }
        }}
      />

      {/* Sacred Lab Drawer - Organized navigation and tools */}
      <SacredLabDrawer
        isOpen={showLabDrawer}
        onClose={() => setShowLabDrawer(false)}
        onNavigate={(path) => {
          window.location.href = path;
          setShowLabDrawer(false);
        }}
        onAction={async (action) => {
          // Soul Prompts & Session actions
          if (action === 'open-prompt-picker') {
            setShowPromptPicker(true);
            setShowLabDrawer(false);
            return;
          }
          if (action === 'show-session-arc') {
            // Session arc is shown via FloatingSessionIndicator - just close drawer
            setShowLabDrawer(false);
            return;
          }
          if (action === 'show-session-synthesis') {
            // Generate synthesis from current conversation if we have messages
            if (messages.length > 0) {
              setSessionSynthesisData({
                patterns: ['Pattern detection in progress...'],
                invitation: 'Continue exploring what emerged in this conversation.',
                savedToMemory: !isSanctuary,
                durationMinutes: sessionTimer?.getElapsedMinutes?.() || undefined
              });
              setShowSessionSynthesis(true);
            }
            setShowLabDrawer(false);
            return;
          }
          // New member support actions
          if (action === 'daily-checkin') {
            setShowDailyCheckin(true);
            setShowLabDrawer(false);
            return;
          }
          if (action === 'element-discovery') {
            setShowElementDiscovery(true);
            setShowLabDrawer(false);
            return;
          }
          if (action === 'session-recap') {
            // Generate recap from current session
            if (messages.length > 0) {
              setSessionRecapData({
                duration: sessionTimer?.getElapsedMinutes?.() || Math.floor(messages.length / 2),
                messageCount: messages.length,
                themes: ['Self-reflection', 'Growth'], // TODO: Extract from conversation
                elements: {
                  fire: 0.3,
                  water: 0.5,
                  earth: 0.4,
                  air: 0.6,
                  aether: 0.2
                }, // TODO: Calculate from conversation content
                invitation: 'Continue reflecting on what emerged today.'
              });
              setShowSessionRecap(true);
            }
            setShowLabDrawer(false);
            return;
          }
          if (action === 'toggle-vocabulary-tooltips') {
            const newValue = !enableVocabularyTooltips;
            setEnableVocabularyTooltips(newValue);
            localStorage.setItem('maia.vocabularyTooltips', String(newValue));
            return;
          }
          // Wisdom Council actions
          if (action === 'choose-guide') {
            setShowWisdomCouncil(true);
            setShowLabDrawer(false);
            return;
          }
          if (action === 'show-current-elder') {
            setShowCurrentTeaching(true);
            setShowLabDrawer(false);
            return;
          }
          if (action === 'upload') {
            document.getElementById('maiaFileUpload')?.click();
            return;
          }
          if (action === 'download-transcript') {
            downloadTranscript();
            setShowLabDrawer(false);
            return;
          }
          if (action === 'toggle-text') {
            setShowVoiceText(!showVoiceText);
            return;
          }
          if (action === 'field-protocol') {
            if (isFieldRecording) {
              await Promise.resolve(completeFieldRecording?.());
              toast.success('Field Record completed');
            } else {
              startFieldRecording?.();
              toast.success('Field Recording started');
            }
            return;
          }
          if (action === 'toggle-microphone') {
            if (!isMuted) {
              // Turn mic OFF
              setIsMuted(true);
              if (voiceMicRef.current?.stopListening) {
                voiceMicRef.current.stopListening();
                console.log('🔇 Microphone OFF');
              }
            } else {
              // Turn mic ON - but only if MAIA isn't speaking
              if (isAudioPlayingRef.current) {
                console.log('⏸️ Cannot turn mic ON - MAIA is speaking');
                return;
              }
              setShowChatInterface(false);
              setIsMuted(false);
              enableAudio().then(() => {
                setTimeout(async () => {
                  if (voiceMicRef.current?.startListening &&
                      !isProcessingRef.current &&
                      !isRespondingRef.current &&
                      !isAudioPlayingRef.current) {
                    await voiceMicRef.current.startListening();
                    console.log('🎤 Microphone ON');
                  }
                }, 100);
              });
            }
            return;
          }
          if (action === 'emergency-stop') {
            handleEmergencyStop();
            return;
          }
          if (action === 'toggle-chat') {
            setShowChatInterface(!showChatInterface);
            return;
          }
          if (action === 'open-voice-menu') {
            setShowVoiceMenu(true);
            setShowLabDrawer(false);
            return;
          }
          if (action === 'open-audio-settings') {
            setShowAudioSettings(true);
            setShowLabDrawer(false);
            return;
          }

          // 📝 SCRIBE MODE: Start/Stop recording and download
          if (action === 'scribe-mode') {
            if (isScribing) {
              // Stop scribing and download
              await Promise.resolve(stopScribing?.());
              toast.success('Scribe session completed');
              downloadScribeTranscript?.();
              setShowLabDrawer(false);
            } else {
              // Start scribing
              startScribing?.();
              toast.success('Scribe Mode activated - Recording session passively');
              setShowLabDrawer(false);
            }
            return;
          }

          // 📝 SCRIBE MODE: Review session with MAIA for supervision
          if (action === 'review-with-maia') {
            const transcript = getTranscriptForReview();
            if (transcript) {
              // Send transcript to MAIA for review
              handleTextMessage(`Please review this session transcript and provide supervision insights:\n\n${transcript}`);
              toast.success('Sending session to MAIA for review');
              setShowLabDrawer(false);
            } else {
              toast.error('No session transcript available');
            }
            return;
          }
        }}
        showVoiceText={showVoiceText}
        isFieldRecording={isFieldRecording}
        isScribing={isScribing}
        hasScribeSession={!!scribeSession}
        isMuted={isMuted}
        isResponding={isResponding}
        isAudioPlaying={isAudioPlaying}
        showChatInterface={showChatInterface}
        voice={voice}
        sessionPhase={sessionTimer?.getCurrentPhase?.() as any}
        sessionMinutesRemaining={sessionTimer?.getRemainingMinutes?.()}
      />

      {/* 🌊 LIQUID AI - Rhythm Metrics Debug Overlay */}
      {rhythmMetrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showRhythmDebug ? 0.9 : 0 }}
          className="fixed top-4 right-4 bg-black/80 text-amber-300 p-4 rounded-lg font-mono text-xs z-below-nav pointer-events-none"
          style={{ maxWidth: '300px' }}
        >
          <div className="flex justify-between items-center mb-2 pointer-events-auto">
            <div className="text-amber-400 font-bold">🌊 RHYTHM METRICS</div>
            <button
              onClick={() => setShowRhythmDebug(!showRhythmDebug)}
              className="text-amber-500 hover:text-amber-300 text-xs underline pointer-events-auto"
            >
              {showRhythmDebug ? 'hide' : 'show'}
            </button>
          </div>
          <div className="space-y-1">
            <div>Tempo: <span className="text-white">{rhythmMetrics.conversationTempo}</span></div>
            <div>WPM: <span className="text-white">{Math.round(rhythmMetrics.wordsPerMinute)}</span></div>
            <div>Coherence: <span className="text-white">{(rhythmMetrics.rhythmCoherence * 100).toFixed(0)}%</span></div>
            <div>Breath Alignment: <span className="text-white">{(rhythmMetrics.breathAlignment * 100).toFixed(0)}%</span></div>
            <div>Silence Comfort: <span className="text-white">{(rhythmMetrics.silenceComfort * 100).toFixed(0)}%</span></div>
            <div>Avg Pause: <span className="text-white">{(rhythmMetrics.averagePauseDuration / 1000).toFixed(1)}s</span></div>
            <div>Turn Latency: <span className="text-white">{(rhythmMetrics.turntakingLatency / 1000).toFixed(1)}s</span></div>
            <div>Utterances: <span className="text-white">{rhythmMetrics.totalUtterances}</span></div>
          </div>
        </motion.div>
      )}

      {/* ⏰ Session Time Container UI */}
      {sessionTimer && (
        <SessionTimeAwareness
          timer={sessionTimer}
          onExtend={handleExtendSession}
        />
      )}

      {/* ⏰ Session Duration Selector Modal - Controlled by header button */}
      <SessionDurationSelector
        isOpen={showSessionSelector}
        onClose={() => onCloseSessionSelector?.()}
        onSelect={handleDurationSelected}
        defaultDuration={50}
      />

      {/* 💾 Resume Session Prompt Modal */}
      {savedSessionData && (
        <ResumeSessionPrompt
          isOpen={showResumePrompt}
          remainingTime={getSavedSessionTimeRemaining() || '0 minutes'}
          phase={getSavedSessionPhase() || 'opening'}
          onResume={handleResumeSession}
          onStartNew={handleStartNewSession}
          onDismiss={() => setShowResumePrompt(false)}
        />
      )}

      {/* 🕯️ Opening Ritual */}
      <SessionRitualOpening
        isOpen={showOpeningRitual}
        sessionDuration={pendingSessionDuration || 50}
        isReturningUser={isReturningUser}
        onComplete={handleOpeningRitualComplete}
        onSkip={handleOpeningRitualSkip}
      />

      {/* 🕯️ Closing Ritual */}
      <SessionRitualClosing
        isOpen={showClosingRitual}
        isReturningUser={isReturningUser}
        onComplete={handleClosingRitualComplete}
        onSkip={handleClosingRitualSkip}
      />

      {/* 🧠 Consciousness Computing Feedback Prompt */}
      <ConsciousnessComputingPrompt
        messageCount={messages.length}
      />

      {/* 🔍 Pattern Drawer - "Show why" for detected patterns */}
      <PatternDrawer
        open={patternDrawerOpen}
        onClose={() => {
          setPatternDrawerOpen(false);
          setActivePattern(null);
        }}
        pattern={activePattern}
        userId={userId}
      />

      {/* 🌟 Wisdom Tool Reveal - Ganesha Focus Garden, etc */}
      {activeWisdomTool && (
        <ToolRevealSheet
          tool={activeWisdomTool.tool}
          agentName={activeWisdomTool.agentName}
          userMessage={activeWisdomTool.userMessage}
          onDismiss={() => setActiveWisdomTool(null)}
          onToolComplete={(toolId, result) => {
            console.log('🌟 [WisdomTool] Completed:', toolId, result);
            setActiveWisdomTool(null);
          }}
        />
      )}

      {/* Soul Prompt Picker Modal */}
      <PromptPicker
        isOpen={showPromptPicker}
        onClose={() => setShowPromptPicker(false)}
        onSelectPrompt={(promptText) => {
          // Frame as a reflection invitation so MAIA guides the user through it
          const framedPrompt = `I'd like to sit with this question: ${promptText}`;
          setDraftMessage(framedPrompt);
          setComposerDraft(framedPrompt);
          setShowPromptPicker(false);
          // Focus the text input
          setTimeout(() => {
            textInputRef.current?.focus?.();
          }, 100);
        }}
        consciousnessLevel={3} // TODO: Get from user profile
        sessionPhase={sessionTimer?.getCurrentPhase?.() as any}
        useV1Set={false}
        showDepthToggle={true}
      />

      {/* Session Synthesis Modal */}
      {showSessionSynthesis && sessionSynthesisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-lg w-full">
            <SessionSynthesis
              synthesis={sessionSynthesisData}
              onContinue={() => setShowSessionSynthesis(false)}
              onJournal={() => {
                // TODO: Navigate to journal with synthesis data
                setShowSessionSynthesis(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Daily Check-in Modal */}
      <DailyCheckin
        isOpen={showDailyCheckin}
        onClose={() => setShowDailyCheckin(false)}
        onComplete={(checkin) => {
          setUserCheckinState({ state: checkin.state, intensity: checkin.intensity });
          setShowDailyCheckin(false);
          // Optionally start conversation with the check-in context
          const contextMessage = `I'm arriving today feeling ${checkin.state.label.toLowerCase()} (${checkin.state.description.toLowerCase()}).${checkin.note ? ` ${checkin.note}` : ''}`;
          setDraftMessage(contextMessage);
          setComposerDraft(contextMessage);
          setTimeout(() => textInputRef.current?.focus?.(), 100);
        }}
      />

      {/* Element Discovery Modal */}
      <ElementDiscovery
        isOpen={showElementDiscovery}
        onClose={() => setShowElementDiscovery(false)}
        onComplete={(result) => {
          setShowElementDiscovery(false);
          // Start conversation with element discovery result
          const contextMessage = `I just discovered my dominant element is ${result.dominant} with ${result.secondary} as secondary. Help me understand what this means for my journey.`;
          setDraftMessage(contextMessage);
          setComposerDraft(contextMessage);
          setTimeout(() => textInputRef.current?.focus?.(), 100);
        }}
      />

      {/* Session Recap Modal */}
      {sessionRecapData && (
        <SessionRecap
          isOpen={showSessionRecap}
          onClose={() => {
            setShowSessionRecap(false);
            setSessionRecapData(null);
          }}
          data={sessionRecapData}
          onSaveToJournal={() => {
            // TODO: Save to journal
            toast.success('Saved to journal');
            setShowSessionRecap(false);
          }}
          onDownload={() => {
            downloadTranscript();
            setShowSessionRecap(false);
          }}
        />
      )}

      {/* Wisdom Council Picker Modal */}
      <WisdomCouncilPicker
        isOpen={showWisdomCouncil}
        onClose={() => setShowWisdomCouncil(false)}
        currentTraditionId={activeTradition?.id}
        onSelect={(tradition) => {
          setActiveTradition(tradition);
          localStorage.setItem('maia.activeTradition', tradition.id);
          setShowWisdomCouncil(false);
          toast.success(`Now guided by ${tradition.name.split('(')[0].trim()}`);
        }}
      />

      {/* Current Teaching Modal */}
      <CurrentTeachingModal
        isOpen={showCurrentTeaching}
        onClose={() => setShowCurrentTeaching(false)}
        tradition={activeTradition}
        onChangeGuide={() => {
          setShowCurrentTeaching(false);
          setShowWisdomCouncil(true);
        }}
      />

      {/* Floating Session Indicator - shows when session is active */}
      {sessionTimer && sessionTimer.isActive?.() && !showLabDrawer && (
        <FloatingSessionIndicator
          phase={sessionTimer.getCurrentPhase?.() as any || 'exploration'}
          elapsedMinutes={sessionTimer.getElapsedMinutes?.() || 0}
          totalMinutes={sessionTimer.getDurationMinutes?.() || 60}
          onClick={() => setShowLabDrawer(true)}
        />
      )}

    </div>
  );
};

export default OracleConversation;
