// @ts-nocheck
// Oracle Conversation - Voice-synchronized sacred dialogue
// 🔄 MOBILE-FIRST DEPLOYMENT - Oct 2 12:15PM - Compact input, hidden overlays, fixed scroll
// 🔖 BUILD_STAMP: 2026-06-02_ios_playback_watchdog
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X, Copy, BookOpen, Clock, Mic, MicOff, Volume2, VolumeX, MessageCircle, Eye, EyeOff, CornerUpLeft, Send, Phone, Loader2, CheckCircle, Users, Bookmark } from 'lucide-react';
// import { SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from './ui/SimplifiedOrganicVoice'; // REPLACED with Whisper
// import { WhisperVoiceRecognition } from './ui/WhisperVoiceRecognition'; // REPLACED with ContinuousConversation (uses browser Web Speech API)
import { ContinuousConversation, ContinuousConversationRef } from './voice/ContinuousConversation';
import { getContinuityBuffer } from '@/lib/voice/conversationContinuityBuffer';
import { VoiceHUD } from './voice/VoiceHUD';
import { VoiceInteractionBar } from './voice/VoiceInteractionBar';
import { isCaptureStalled, CAPTURE_STALL_MS } from '@/lib/voice/captureHeartbeat';
import { useStreamingVoice, type StreamingVoicePlaybackSignal } from '@/hooks/useStreamingVoice';
// Phase 1.5B — Conversational Keep affordance (sidecar, feature-flagged; client flag default-off)
import { KeepAffordance, type KeepIntent } from '@/components/psyche/KeepAffordance';
const CONVERSATIONAL_KEEP_ENABLED =
  process.env.NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED === 'true';
// TEMPORARILY DISABLED - causing ReferenceError crash
// import { usePWAVoiceStateMachine, type PWAVoiceState } from '@/hooks/usePWAVoiceStateMachine';
// RelationalTelemetryPanel removed - dev-only component
import { useAssistantName } from '@/hooks/useAssistantName';
import { SacredHoloflower } from './sacred/SacredHoloflower';
import { RhythmHoloflower } from './liquid/RhythmHoloflower';
import { VoiceDebugOverlay } from './voice/VoiceDebugOverlay';
import { pushVoiceDebug } from '@/lib/voice/voiceDebugBus';
import { canProgrammaticallyFocus } from '@/lib/ui/programmaticFocus';
// 🔁 Recovery seam (Pattern A) — honest delivery state for member turns.
import { markFailed, markRetrying, clearDelivery, stripDelivery, type DeliveryStatus, type DeliveryFailureReason } from '@/lib/maia/deliveryStatus';
import { ConversationalRhythm, type RhythmMetrics } from '@/lib/liquid/ConversationalRhythm';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import AdaptiveVoiceMicButton from './ui/AdaptiveVoiceMicButton';
import { detectVoiceCommand, isOnlyModeSwitch, getModeConfirmation, detectMaiaCommands, getMaiaCommandConfirmation } from '@/lib/voice/VoiceCommandDetector';
import type { MaiaCommand } from '@/lib/voice/VoiceCommandDetector';
import {
  matchVoiceCommand,
  applySettingsDelta,
  getModeSystemPrompt,
  detectCrisis,
  DEFAULT_MODE_STATE,
  DEFAULT_SCRIBE_SESSION,
  type ModeState,
  type VoiceCommandResult,
  type CrisisOverride,
  type ScribeSessionState,
} from '@/lib/voice/voiceCommands';
import { QuickModeToggle } from './ui/QuickModeToggle';
// import MaiaChatInterface from './chat/MaiaChatInterface'; // File doesn't exist
import { EmergencyChatInterface } from './ui/EmergencyChatInterface';
import { SimpleVoiceMic } from './ui/SimpleVoiceMic';
import { OrganicVoiceMaia } from './ui/OrganicVoiceMaia';
// import { VoiceActivatedMaia as SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from './ui/VoiceActivatedMaiaFixed'; // File doesn't exist
import { AgentCustomizer } from './oracle/AgentCustomizer';
import { MaiaSettingsPanel } from './MaiaSettingsPanel';
import { MaiaFeedbackWidget } from './maia/MaiaFeedbackWidget';
import { StateCard, type StateCardDisplayMode } from './maia/StateCard';
import { SourceHalo } from './ain/SourceHalo';
import { CouncilInsightPanel } from './ain/CouncilInsightPanel';
import { FieldStateIndicator } from './ain/FieldStateIndicator';
// TranslateMessageButton removed from per-message use — will return as session-level WisdomLensDrawer
import { PatternChips, PatternDrawer, type PatternMeta } from './memory';
import { ToolRevealSheet } from './wisdom/ToolRevealSheet';
import { AstrologyHandoffCard } from '@/components/astrology/AstrologyHandoffCard';
import { SacredPassageBlock } from '@/components/wisdom/SacredPassageBlock';
import type { EncounterResult } from '@/lib/wisdom/sacredTexts/SacredEncounterService';
import type { SacredPassage } from '@/lib/wisdom/sacredTexts/types';
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
import { apiUrl, apiFetch, getValidMemberId } from '@/lib/http/apiBase';
import { VOICE_TIMING } from '@/lib/voice/voiceTiming';
import useSession from '@/lib/hooks/useSession';
import { ShareToCircleModal } from '@/components/circles/ShareToCircleModal';
import { useOfferToCircle } from '@/lib/circles/useOfferToCircle';
import { useVoiceSession } from '@/hooks/useVoiceSession';

/**
 * Detect Safari PWA environment for PWA-specific voice handling
 * PWA needs different voice state machine than iOS native
 */
function isSafariPWA(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isSafari =
    /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as any).standalone === true;
  return isSafari && isStandalone;
}

/**
 * Safe base64 to ArrayBuffer decoder that handles large strings
 * atob() can fail on large base64 strings in some environments
 */
function base64ToArrayBuffer(b64: string): ArrayBuffer {
  // Remove whitespace/newlines (some implementations insert them)
  const clean = b64.replace(/\s/g, '');

  // Convert in slices to avoid atob() exploding on large strings
  const sliceSize = 1024 * 1024; // 1MB base64 chunks (safe)
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < clean.length; offset += sliceSize) {
    const chunk = clean.slice(offset, offset + sliceSize);
    const binaryString = atob(chunk);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    byteArrays.push(bytes);
  }

  const totalLen = byteArrays.reduce((sum, a) => sum + a.length, 0);
  const merged = new Uint8Array(totalLen);
  let pos = 0;
  for (const a of byteArrays) {
    merged.set(a, pos);
    pos += a.length;
  }

  return merged.buffer;
}

/**
 * iOS hang guard — race any awaited promise against a hard timeout so a
 * silently-stalled native bridge (CapacitorHttp, AudioContext, etc.) can never
 * trap the UI in "thinking" forever. Always rejects on timeout so the caller's
 * catch/finally runs and UI state releases.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = 'operation'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

import { isProbablyOnline, generatePresenceFallback } from '@/lib/offline/presenceFallback';
import { VoiceState } from '@/lib/voice/voice-capture';
import { VoiceController } from '@/lib/voice/AudioSessionManager';
import { getAudioContext as getSharedAudioContext, ensureAudioReady } from '@/lib/voice/ios-audio-session';
// import { useMaiaVoice } from '@/hooks/useMaiaVoice'; // OLD TTS SYSTEM - replaced with WebRTC
// REMOVED OPENAI HIJACKING - MAIA speaks FROM THE BETWEEN at /api/between/chat
// REMOVED FORMANT VOICE ENGINE - MAIA now speaks with OpenAI Alloy voice
// import { getMaiaVoiceEngine, voiceStateManager, type Element } from '@/lib/voice';
import type { Element } from '@/lib/voice';
// import { useMAIASDK } from '@/hooks/useMAIASDK-simple'; // Fallback option (if needed)
// import { useMAIAHybrid as useMAIASDK } from '@/hooks/useMAIAHybrid'; // Hybrid (removed - we want full dynamics always)
import { cleanMessage, cleanMessageForVoice, formatMessageForDisplay } from '@/lib/cleanMessage';
import { getAccountSettings } from '@/lib/settings/accountSettings';
import { getAgentConfig, AgentConfig } from '@/lib/agent-config';
import { toast } from 'react-hot-toast';
import { voiceLock } from '@/lib/services/VoiceLock';
import { trackEvent } from '@/lib/analytics/track';
import { saveConversationMemory, getOracleAgentId } from '@/lib/services/memoryService';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';
import { useRouter } from 'next/navigation';
import type { MaiaPlaceContext } from '@/lib/maia/presence/place';
// REMOVED: Supabase persistence - now using sovereign PostgreSQL via /api/conversation/turns
// import { saveMessages as saveMessagesToSupabase, getMessagesBySession } from '@/lib/services/conversationStorageService';
import { generateGreeting, generateOnboardingGreeting, resolveDisplayName } from '@/lib/services/greetingService';
import { BrandedWelcome } from './BrandedWelcome';
import { userTracker } from '@/lib/tracking/userActivityTracker';
import { getCounselFramework, getScribeLens, setCounselFramework, setScribeLens, getMentorStance } from '@/lib/consciousness/therapeuticFrameworks';
import type { IntegrityResult, LensConsent } from '@/lib/consciousness/integrityCheck';
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
import { consumeMaiaSeed, setReturnPath, getReturnPath, clearReturnPath, type ConsumedSeed } from '@/lib/maia/seedPrompt';
import { generateWelcomeGreeting } from '@/lib/maia/welcomeGreeting';
import { ELDER_COUNCIL_TRADITIONS, type WisdomTradition } from '@/lib/consciousness/ElderCouncilService';
import { ConversationStylePreference } from '@/lib/preferences/conversation-style-preference';
import { detectJournalCommand } from '@/lib/services/conversationEssenceExtractor';
import { useFieldProtocolIntegration } from '@/hooks/useFieldProtocolIntegration';
import { useDemoEventListener } from '@/hooks/useDemoEventListener';
import { BookPlus } from 'lucide-react';
// Reflection Capsules - "Capture the Spirit"
import CaptureSpiritPanel from '@/components/capsules/CaptureSpiritPanel';
import CaptureSuggestionChip from '@/components/capsules/CaptureSuggestionChip';
import RelationalDoorway from '@/components/maia/RelationalDoorway';
import WorldDoorway from '@/components/maia/WorldDoorway';
import { useFeatureFlags } from '@/lib/utils/feature-flags-client';
import { MaiaArrivalField } from './maia/MaiaArrivalField';
import type { MaiaUiAction } from '@/lib/types/ai';
import { detectIntent, getIntentRoute, buildUiAction } from '@/lib/consciousness/intentRouter';
import { detectKeepIntent } from '@/lib/consciousness/keepIntent';
import { detectCaptureTrigger } from '@/lib/capsules/types';
import type { CapsuleDTO } from '@/lib/capsules/types';
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
// 🌱 YOUTH DEVELOPMENTAL TIER - age-based constraints and session limits
import { computeTierFromAge, getTierConfig, isYouthTier, type DevelopmentalTier } from '@/lib/youth/ageTierEngine';

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

// ============================================================================
// Welcome Greeting Helpers (Track 1: personalized greetings)
// ============================================================================

type WelcomeMemberStyleProfile =
  | 'warm'
  | 'direct'
  | 'playful'
  | 'mystic'
  | 'minimal'
  | 'professional';

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function coerceStyleProfile(input: unknown): WelcomeMemberStyleProfile | undefined {
  const s = (typeof input === 'string' ? input : '').toLowerCase().trim();
  if (!s) return undefined;

  // Permissive matching for whatever is already stored
  if (['warm', 'gentle', 'soft', 'kind'].includes(s)) return 'warm';
  if (['direct', 'clear', 'straight', 'concise'].includes(s)) return 'direct';
  if (['playful', 'fun', 'light'].includes(s)) return 'playful';
  if (['mystic', 'mythic', 'symbolic', 'poetic'].includes(s)) return 'mystic';
  if (['minimal', 'short', 'brief'].includes(s)) return 'minimal';
  if (['professional', 'clinical', 'coach'].includes(s)) return 'professional';

  return undefined;
}

function pickLastConversationTheme(opts: {
  lastUserText?: string;
  lastAssistantText?: string;
}): string | undefined {
  const text = `${opts.lastUserText ?? ''}\n${opts.lastAssistantText ?? ''}`.toLowerCase();
  if (!text.trim()) return undefined;

  // Simple keyword-based theme detection (no new system, just heuristic)
  if (text.includes('dream')) return 'dreams';
  if (text.includes('shadow') || text.includes('trigger') || text.includes('projection')) return 'shadow work';
  if (text.includes('relationship') || text.includes('partner') || text.includes('marriage')) return 'relationships';
  if (text.includes('journal')) return 'journaling';
  if (text.includes('iching') || text.includes('i ching') || text.includes('hexagram')) return 'I Ching';
  if (text.includes('tarot')) return 'tarot';
  if (text.includes('astrology') || text.includes('natal') || text.includes('transit')) return 'astrology';
  if (text.includes('work') || text.includes('business') || text.includes('client')) return 'work';
  if (text.includes('anxiety') || text.includes('anxious') || text.includes('worried')) return 'anxiety';
  if (text.includes('grief') || text.includes('loss') || text.includes('death')) return 'grief';
  if (text.includes('decision') || text.includes('choice') || text.includes('stuck')) return 'decision-making';

  return undefined;
}

// Performance: Cap conversation history to prevent UI lag and API bloat
const MAX_DISPLAY_MESSAGES = 100; // Keep last 100 messages in UI state
const MAX_API_HISTORY = 100; // Send last 100 messages (~50 exchanges) to API. Raised from 30 to extend depth before MAIA hits the wall and confabulates about her own architecture. Paired with the "Memory Posture" instruction in buildSacredAttendingPrompt — when the gap is hit, she asks rather than fabricates.

// Helper to cap messages array when adding new messages
// Includes dedupe to prevent retry/resume double-inclusion
type MsgWithId = { id?: string | null; role?: string; text?: string; content?: string };

function appendMessageCapped<T extends MsgWithId>(
  prev: T[],
  newMsg: T,
  maxMessages: number = MAX_DISPLAY_MESSAGES
): T[] {
  // Dedupe by id (prevents retry with same id)
  if (newMsg?.id && prev.some(m => m?.id === newMsg.id)) {
    return prev;
  }

  // Fallback: prevent immediate duplicate (same role + text/content)
  const last = prev[prev.length - 1];
  const newText = newMsg?.text || newMsg?.content;
  const lastText = last?.text || last?.content;
  if (last && last.role === newMsg?.role && lastText === newText && newText) {
    return prev;
  }

  const updated = [...prev, newMsg];
  return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
}

// Helper to truncate conversation history for API calls
// Merges historical messages (from previous sessions) with current session messages
function truncateHistoryForAPI(
  currentMessages: ConversationMessage[],
  historicalMessages: ConversationMessage[] = [],
  maxMessages: number = MAX_API_HISTORY
): Array<{ role: string; content: string }> {
  // Merge historical context with current session, prioritizing recent messages
  // Deduplicate by message ID to avoid repeating the same content
  const seenIds = new Set<string>();
  const allMessages: ConversationMessage[] = [];

  // Add historical messages first
  for (const msg of historicalMessages) {
    if (msg.id && !seenIds.has(msg.id)) {
      seenIds.add(msg.id);
      allMessages.push(msg);
    }
  }

  // Add current session messages (may override/update historical)
  for (const msg of currentMessages) {
    if (msg.id && !seenIds.has(msg.id)) {
      seenIds.add(msg.id);
      allMessages.push(msg);
    } else if (!msg.id) {
      // Messages without ID always added
      allMessages.push(msg);
    }
  }

  // Take most recent messages up to limit
  const recent = allMessages.slice(-maxMessages);
  return recent.map(msg => ({
    role: msg.role === 'oracle' ? 'assistant' : 'user',
    content: msg.text || msg.content || ''
  }));
}

// Scribe session context for discussion mode
interface ScribeSessionContext {
  id: string;
  title: string;
  container: 'solo' | 'witness' | 'practitioner';
  summary: {
    short?: string;
    long?: string;
    themes?: string[];
  } | null;
  duration: number;
  markerCount: number;
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
  voice?: string; // Sovereign voice identity (maia_core, maia_warm, atlas, etc.)
  voiceSpeed?: number; // TTS speed (0.25 - 4.0, default 0.95)
  voiceModel?: string; // Sovereign voice model
  voiceVolume?: number; // Voice playback volume (0.0 - 1.0)
  onVoiceChange?: (voice: string) => void; // Notify parent of voice changes
  initialMode?: 'normal' | 'patient' | 'session'; // Control mode from parent
  onModeChange?: (mode: 'normal' | 'patient' | 'session') => void; // Notify parent of mode changes
  initialShowChatInterface?: boolean; // Control voice/text mode from parent
  onShowChatInterfaceChange?: (show: boolean) => void; // Notify parent of voice/text changes
  showSessionSelector?: boolean; // Control session selector from parent (header button)
  onCloseSessionSelector?: () => void; // Notify parent to close session selector
  onSessionActiveChange?: (active: boolean) => void; // Notify parent of session active state
  onMessageAdded?: (message: ConversationMessage) => void;
  /**
   * Fires the moment the member's own words are committed to the conversation —
   * spoken or typed, treated identically. This is expression, NOT activation:
   * opening the mic or the chat panel does not fire it. Called on every member
   * turn; consumers that care about the first one must be idempotent.
   *
   * Fired at the message-commit points, deliberately NOT at the entry of
   * handleTextMessage / handleVoiceTranscript. Those entries sit above their
   * guards, so firing there would count MAIA's own voice returning through the
   * mic, empty transcripts, duplicates, and bare mode commands as the member
   * having spoken. Keep this call below the guards.
   */
  onMemberExpression?: () => void;
  /**
   * #736: the non-writing exit from Arrival. Fired on "I'm ready" — the
   * member crossing the threshold WITHOUT authoring speech (MaiaArrivalField's
   * own onActivate contract). Upstream this is deliberately NOT markArrived:
   * activation is not expression (ruling, 2026-07-22), so the parent clears
   * only session-temporary arrival state (crossArrivalWithoutSpeech), which
   * flips shouldRenderArrival false without writing the durable first-crossing
   * marker — a member who crosses without speaking still meets the ceremony
   * next visit.
   *
   * Without this, "I'm ready" only set local hasActivated — which the render
   * gate ignores while shouldRenderArrival is true — so the affordance fired,
   * set its state, and the z-[90] layer stayed mounted. The deliberate-return
   * guard (`shouldRenderArrival ||`) stays intact.
   */
  onArrivalCrossed?: () => void;
  /**
   * Whether the Arrival composition is ACTUALLY rendering for this member right
   * now — a first-time member who has never crossed, or a member who invoked a
   * deliberate return from The House. Computed once in app/maia/page.tsx and
   * passed down; this component never recomputes it.
   *
   * ⚠️ Do NOT substitute `featureFlags.arrivalEntry` here. That flag is default-ON
   * for everyone, so keying the renderer to it showed the first-visit ceremony to
   * RETURNING members on every fresh session — the "first visit only" ruling never
   * actually held — while also suppressing their transcript greeting. Arrival must
   * depend on whether this member should meet it, not on whether it is enabled.
   */
  shouldRenderArrival?: boolean;
  onSessionEnd?: (reason?: string) => void;
  initialAction?: string; // Action to trigger on mount (e.g., 'choose-guide', 'show-current-elder')
  // Scribe session discussion mode
  scribeSessionId?: string; // ID of scribe session to discuss
  scribeSessionContext?: ScribeSessionContext; // Context for scoped discussion
  // Studio surface mode
  surface?: 'maia' | 'studio'; // Which surface MAIA is running on
  studioContext?: {
    surface: 'studio';
    clientId?: string;
    pathname?: string;
  };
  // Field presence regulation — when true, oracle applies the Field calibration arc
  fieldMode?: boolean;
  // Field energy state — client-tracked, passed to oracle for constraint enforcement
  fieldEnergyState?: 'arrival' | 'settling' | 'presence';
  // Ask MAIA — orientation + Knowledge Field stance (controlled from parent)
  askMode?: boolean;
  onAskModeChange?: (active: boolean) => void;
  // 🚪 PLACE — facts-only current-room context (House Presence, 2026-07-17).
  // Travels ONLY inside a message the member sends; never transmitted on
  // route change, and never derived from behavior. See lib/maia/presence/place.ts.
  placeContext?: MaiaPlaceContext;
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
  // 🔁 Recovery seam (Pattern A) — delivery state of a member turn. LIVE state only;
  // stripped before persistence (see lib/maia/deliveryStatus.ts). The bubble already
  // represents authorship; this records whether delivery completed.
  deliveryStatus?: DeliveryStatus;
  failureReason?: DeliveryFailureReason;
  // Phase 1.5B — attached keep affordance for this message (null when absent)
  keepIntent?: KeepIntent | null;
  // 🌀 INTEGRITY CHECK: Pass 3 pipeline result for lens switching UI
  integrity?: IntegrityResult;
  lensSwitchOptions?: {
    stay: string;
    switch: string;
    blend: string;
    switchTo: string;
  } | null;
  // 🌀 STATE VECTOR: Consciousness state reading for this turn
  stateVector?: any;
  // 🌿 PRACTICE: Recommended practice from state vector routing
  practiceRecommendation?: any;
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
    // 🧱 F1 durable turn acceptance: stable id for the exchange this member turn
    // belongs to. Minted client-side at submit, sent to the serving boundary so
    // the utterance can be persisted at acceptance, and reused by the later pair
    // write so it dedupes rather than duplicating.
    exchangeId?: string;
    [key: string]: unknown;
  };
  // 🚪 AIN: Knowledge Gate source well weighting for this turn
  ainState?: {
    sourceMix: Array<{ source: string; weight: number; notes?: string }>;
    awarenessLevel: number;
    awarenessConfidence: number;
    awarenessDescription?: string;
  } | null;
  // 🏛️ AIN: Consultation council results for this turn
  consultation?: {
    council: string;
    insights: string[];
    tensions: string[];
    recommendation: string;
    framingsUsed: string[];
    emergenceRating: 'recombination' | 'synthesis' | 'breakthrough';
    framingWeights?: Record<string, number> | null;
  } | null;
  // 🌌 ASTROLOGY HANDOFF: Structured transition into the Cosmic Blueprint
  astrologyHandoff?: import('@/lib/astrology/astrologyHandoff').AstrologyHandoff | null;
  // 📖 SACRED ENCOUNTER: Optional passage surfaced by encounter layer
  sacredEncounter?: EncounterResult | null;
  // 🚪 RELATIONAL ROUTING: intent-driven doorway
  intent?: import('@/lib/types/ai').MaiaIntent;
  uiAction?: import('@/lib/types/ai').MaiaUiAction;
  // 🌀 SUGGESTED ACTIONS: behavioral loop invitations from oracle
  suggestedActions?: Array<{
    id: string;
    label: string;
    priority: number;
    elementalResonance?: string;
    kind?: 'tool' | 'reflection' | 'practice' | 'relational';
    route?: string;
    feltLanguage?: string;
    silent?: boolean;
  }>;
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
  voice = 'maia_core',
  voiceSpeed = 0.95,
  voiceModel = 'maia_core',
  voiceVolume = 1.0,
  onVoiceChange,
  initialMode = 'normal',
  onModeChange,
  initialShowChatInterface = false,
  onShowChatInterfaceChange,
  showSessionSelector = false,
  onCloseSessionSelector,
  onSessionActiveChange,
  onMessageAdded,
  onMemberExpression,
  onArrivalCrossed,
  shouldRenderArrival = false,
  onSessionEnd,
  initialAction,
  scribeSessionId,
  scribeSessionContext,
  surface,
  studioContext,
  fieldMode,
  fieldEnergyState,
  askMode: askModeProp,
  onAskModeChange: onAskModeChangeProp,
  placeContext,
}) => {
  // Client router — doorway navigation must be client-side so the canonical
  // MaiaPresence provider (and this conversation, when it is the global
  // instance) survives the move. Full-document loads are the teardown the
  // House Presence correction removes.
  const router = useRouter();
  // Build telemetry — observability without ambient claim.
  // Console log always runs (inspectable). Visible strip only on explicit opt-in:
  //   ?debug=build (or ?debug=1) | localStorage.maia_debug_build='1' | window.__maiaShowBuildStamp()
  useEffect(() => {
    console.log('🔖 MAIA BUILD STAMP: 2026-01-31_pwa_voice_v3');
    console.log('🎙️ PWA Voice State Machine: ENABLED');
    console.log('🔍 isSafariPWA():', isSafariPWA());
    if (typeof window === 'undefined') return;

    const renderStamp = () => {
      if (document.getElementById('build-stamp-v3')) return;
      const stamp = document.createElement('div');
      stamp.id = 'build-stamp-v3';
      stamp.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#10b981;color:white;padding:4px;text-align:center;font-size:12px;z-index:99999;font-family:monospace;';
      stamp.textContent = `BUILD v3 | PWA: ${isSafariPWA()} | ${new Date().toLocaleTimeString()}`;
      document.body.appendChild(stamp);
      setTimeout(() => stamp.remove(), 10000);
    };

    const params = new URLSearchParams(window.location.search);
    const optedIn =
      params.get('debug') === 'build' ||
      params.get('debug') === '1' ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('maia_debug_build') === '1');

    if (optedIn) renderStamp();
    (window as any).__maiaShowBuildStamp = renderStamp;
  }, []);

  // Circle sharing
  const circleOffer = useOfferToCircle();

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

  // Studio SMS send modal state
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsModalTo, setSmsModalTo] = useState('');
  const [smsModalBody, setSmsModalBody] = useState('');
  const [smsModalSending, setSmsModalSending] = useState(false);
  const [smsModalResult, setSmsModalResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [smsModalError, setSmsModalError] = useState('');

  // Studio SMS send handler
  const openSmsModal = useCallback((messageText: string) => {
    // Extract draft SMS body — look for common patterns MAIA uses
    // Patterns: "DRAFT SMS: ...", "--- DRAFT SMS:", or just use full text
    let body = messageText;
    const draftMatch = messageText.match(/(?:DRAFT\s*SMS|SMS\s*Draft)[:\s]*(.+?)(?:---|Status:|Ready to send|You'll need to|$)/is);
    if (draftMatch) {
      body = draftMatch[1].trim();
    }
    setSmsModalBody(body);
    setSmsModalTo('');
    setSmsModalSending(false);
    setSmsModalResult('idle');
    setSmsModalError('');

    // If clientId is available, try to prefill phone
    if (studioContext?.clientId) {
      apiFetch(`/api/studio/clients/${studioContext.clientId}`)
        .then(r => r.json())
        .then(data => {
          if (data?.phone) setSmsModalTo(data.phone);
        })
        .catch(() => { /* no prefill */ });
    }

    setSmsModalOpen(true);
  }, [studioContext?.clientId]);

  const handleSendSms = useCallback(async () => {
    if (!smsModalTo.trim() || !smsModalBody.trim()) {
      setSmsModalError('Phone number and message are required');
      return;
    }
    setSmsModalSending(true);
    setSmsModalError('');
    try {
      const response = await apiFetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsModalTo.trim(),
          message: smsModalBody.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSmsModalResult('success');
        setTimeout(() => setSmsModalOpen(false), 1500);
      } else {
        setSmsModalError(data.error || 'Failed to send SMS');
        setSmsModalResult('error');
      }
    } catch (err) {
      setSmsModalError(err instanceof Error ? err.message : 'Network error');
      setSmsModalResult('error');
    } finally {
      setSmsModalSending(false);
    }
  }, [smsModalTo, smsModalBody]);

  // 🌀 LENS CONSENT: Pending consent for next message (Stay/Switch/Blend ritual)
  const [pendingLensConsent, setPendingLensConsent] = useState<{
    consent: LensConsent;
    switchTo?: string;
  } | null>(null);

  // Voice/audio state
  const [isListening, setIsListening] = useState(false);
  const [isActivating, setIsActivating] = useState(false); // True while waiting for mic to confirm
  const [isResponding, setIsResponding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Transient submit-error banner shown above ModernTextInput. Set by the
  // error paths around the canonical /api/sovereign/app/maia/list fetch so a
  // cleared input is never visually indistinguishable from a successful send.
  // Cleared by next keystroke (via onClearSubmitError) or by the auto-fade
  // timer below.
  const [inputSubmitError, setInputSubmitError] = useState<string | null>(null);

  // Auto-fade the submit-error banner after a short window so it doesn't linger.
  useEffect(() => {
    if (!inputSubmitError) return;
    const t = setTimeout(() => setInputSubmitError(null), 10000);
    return () => clearTimeout(t);
  }, [inputSubmitError]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIOSAudioEnabled, setIsIOSAudioEnabled] = useState(false);
  const [needsIOSAudioPermission, setNeedsIOSAudioPermission] = useState(false);
  const [isMicrophonePaused, setIsMicrophonePaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted - user must tap holoflower to activate
  const [isHandsFreeMode, setIsHandsFreeMode] = useState(true); // UI state mirror for hands-free toggle — default ON for natural conversation
  const hasShownVoiceReentryToastRef = useRef(false); // Show once per session on re-enter voice

  // Phase 1.5B — Conversational Keep runtime state (per-session, not persisted)
  // Refs avoid re-renders on offer-state changes. Read by request body wiring (2D),
  // updated when KeepAffordance.onResolved fires (2F).
  const sessionOfferCountRef = useRef<number>(0);
  const lastOfferTurnRef = useRef<number | undefined>(undefined);
  const conversationTurnRef = useRef<number>(0);

  const [voiceAmplitude, setVoiceAmplitude] = useState(0);
  const [userVoiceState, setUserVoiceState] = useState<VoiceState | null>(null);

  // ── Capture heartbeat ────────────────────────────────────────────────
  // `isListening` says capture was REQUESTED and believed to have started. It
  // does not say audio is still arriving, so a mic that dies underneath keeps
  // a green "listening" dot pulsing while the member talks into nothing —
  // "I can't tell when it is no longer hearing me". Both capture paths call
  // `onAudioLevelChange` continuously while frames are being delivered, so the
  // arrival of those calls is the evidence. See lib/voice/captureHeartbeat.ts.
  const lastAudioFrameAtRef = useRef(0);
  const captureArmedAtRef = useRef(0);
  const [captureStalled, setCaptureStalled] = useState(false);

  // Derived UI voice state for VoiceInteractionBar
  const voiceInteractionState: import('./voice/VoiceInteractionBar').VoiceInteractionState =
    (isProcessing || isResponding) ? 'thinking' :
    isAudioPlaying ? 'speaking' :
    isListening ? 'listening' :
    isActivating ? 'recovering' :
    'idle';

  // 🎤 PWA VOICE STATE MACHINE: Separate, first-class voice loop for Safari PWA
  // This provides confirmed transitions only - no "hopeful" state changes
  // TEMPORARILY DISABLED to debug crash
  const [isPwaVoice] = useState(false); // TEMP: was () => isSafariPWA()

  // 🎤 PWA VOICE STUB - must be defined immediately after isPwaVoice
  // to prevent minifier hoisting issues (ReferenceError crash)
  const pwaVoice = {
    state: 'IDLE' as const,
    isListening: false,
    isMuted: true,
    isThinkingOrSpeaking: false,
    isArming: false,
    isMicWaking: false,
    isHandoff: false,
    isError: false,
    isDisplayingText: false,
    needsTapToEnableAudio: false,
    audioPlayingConfirmed: () => {},
    audioEnded: () => {},
    ttsFailedOrSkipped: (_reason?: string) => {},
    userWantsToStart: async () => {},
    userWantsToStop: () => {},
    clearAudioTimeout: () => {},
    startHandoffTimer: () => {},
    startDisplayTextTimer: () => {},
    transition: () => {},
    micConfirmed: () => {},
    micStopped: () => {},
  };

  // Voice settings from account preferences (applies to TTS and MAIA behavior)
  // Lazy initializer loads from localStorage immediately to avoid flash of default values
  const [voiceSettings, setVoiceSettings] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        voice: 'maia_core',
        speed: 1.0,
        model: 'maia_core',
        prosodyRange: 1 as 0 | 1 | 2 | 3 | 4,
        archetype: 'AUTO' as string,
        conversationMode: 'her' as string,
        memoryDepth: 'moderate' as 'minimal' | 'moderate' | 'deep',
      };
    }
    const settings = getAccountSettings();
    // Migrate legacy vendor voice names to sovereign identities
    const LEGACY_VOICE_MAP: Record<string, string> = {
      alloy: 'maia_core', shimmer: 'maia_warm', nova: 'maia_clear',
      echo: 'atlas', onyx: 'atlas_deep', fable: 'maia_clear',
    };
    const rawVoice = settings.voice.openaiVoice;
    return {
      voice: LEGACY_VOICE_MAP[rawVoice] ?? rawVoice ?? 'maia_core',
      speed: settings.voice.speed,
      model: settings.voice.model || 'maia_core',
      prosodyRange: (settings.voice.prosodyRange ?? 1) as 0 | 1 | 2 | 3 | 4,
      archetype: settings.archetype || 'AUTO',
      conversationMode: settings.conversationMode || 'her',
      memoryDepth: settings.memory?.depth || 'moderate',
    };
  });

  // Member's preferred name for MAIA (bonding affordance)
  const assistantName = useAssistantName();
  // Admin-only diagnostics: SourceHalo, StateCard, level badges
  const { isAdmin: showDiagnostics } = useSession();
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
  const [interimTranscript, setInterimTranscript] = useState('');

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

  // 🌊 STREAMING VOICE MODE: Server-side sentence TTS for natural flow
  // When enabled, uses Sesame/ElevenLabs streaming instead of OpenAI TTS
  // TEMP: Force-enabled for testing relational stack
  const [streamingVoiceMode, setStreamingVoiceMode] = useState(() => {
    // Force true for testing - revert after validation
    return true;
    // Original:
    // if (typeof window !== 'undefined') {
    //   const saved = localStorage.getItem('maia_streaming_voice');
    //   return saved === 'true';
    // }
    // return false;
  });

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [oracleAgentId, setOracleAgentId] = useState<string | null>(null);
  const [explorerId, setExplorerId] = useState<string>(''); // Stable cross-session identity
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState<number>(0);
  // ✨ CAPTURE THE SPIRIT: Reflection Capsules
  const [showCapturePanel, setShowCapturePanel] = useState(false);
  const [showCaptureSuggestion, setShowCaptureSuggestion] = useState(false);
  const [captureSuggestionDismissed, setCaptureSuggestionDismissed] = useState(false);
  // The Keep draft currently on screen. Until the member confirms, this is an
  // UNSAVED preview: distilled server-side, held in memory here, with no row
  // behind it and no `id`. `capturedCapsule.id` is therefore only meaningful
  // once capsulePersisted is true.
  const [capturedCapsule, setCapturedCapsule] = useState<CapsuleDTO | null>(null);
  // KEEP AUTHORITY CONTRACT (Kelly ruling 2026-08-28): OPEN = zero persistence,
  // PREPARE = ephemeral, CONFIRM = persistence. This flag is the boundary
  // between the second and the third: false means nothing has been written and
  // closing the panel leaves no trace.
  const [capsulePersisted, setCapsulePersisted] = useState(false);
  // The panel's "Bring into the Lab" saves edits and then promotes, both inside
  // one tick — React state has not re-rendered in between, so the second step
  // would read a stale `capturedCapsule.id` (undefined, on a first confirm).
  // This ref carries the id across that boundary synchronously.
  const persistedCapsuleIdRef = useRef<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // 🚪 RELATIONAL ROUTING: intent-driven doorways
  const { flags: featureFlags } = useFeatureFlags();
  const [doorwayDismissedAt, setDoorwayDismissedAt] = useState<number | null>(null);
  const [lastDoorwayTimestamp, setLastDoorwayTimestamp] = useState(0);

  // 🛑 LIMITS FEEDBACK: Tier-based usage boundaries (dignity, not punishment)
  const [limitsBanner, setLimitsBanner] = useState<null | { message: string; nudgeType?: string; tier?: string }>(null);
  const [limitsBlock, setLimitsBlock] = useState<null | { message: string; tier?: string }>(null);

  // 🎯 WELCOME SCREEN: Show branded greeting until user activates (taps holoflower)
  // This is separate from messages - history can be restored but greeting shows until activation
  const [hasActivated, setHasActivated] = useState(false);

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

  // ==========================================================================
  // 🧵 VOICE CONTINUITY BUFFER — Sanctuary gate + restore-after-interruption
  // ==========================================================================
  // A local, tab-scoped copy of the conversation so a broken capture path
  // cannot cost the member their own words. It is NOT memory: nothing here is
  // transmitted, enters a prompt, or forms a pattern. See
  // lib/voice/conversationContinuityBuffer.ts.
  //
  // Sanctuary's boundary is absolute, so this is a purge and not merely a
  // pause: entering Sanctuary destroys the buffered tail of the conversation
  // that preceded it, synchronously.
  useEffect(() => {
    try { getContinuityBuffer().setEnabled(!isSanctuary); } catch { /* best-effort */ }
  }, [isSanctuary]);

  // On mount, hand back any utterance that was spoken but never sent — the
  // case where the session dropped, or the tab was refreshed, before the
  // member could submit. Restored as an editable draft, never auto-sent.
  const continuityRestoredRef = useRef(false);
  useEffect(() => {
    if (continuityRestoredRef.current || isSanctuary) return;
    continuityRestoredRef.current = true;
    try {
      const pending = getContinuityBuffer().getPending();
      if (!pending?.text) return;
      setDraftMessage((prev) => (prev.trim() ? prev : pending.text));
      getContinuityBuffer().clearPending();
      toast('Restored what you had said but not yet sent.', { duration: 7000, icon: '🧵' });
      console.log(`🧵 [continuity] Restored ${pending.text.length} unsent chars from a prior session`);
    } catch { /* best-effort */ }
  }, [isSanctuary]);

  // 📌 "Keep this moment" — member-marked episodic moments (slice 2, 2026-07-13).
  // Keyed by message.id. Presence of an entry means that message is currently
  // kept; episodeId is required to undo. Absolute Sanctuary boundary: this
  // gesture must never render, and its handlers must never fire, while
  // isSanctuary is true (see render guard + handleKeepMoment/handleUnmarkMoment).
  const [keptMoments, setKeptMoments] = useState<Record<string, { episodeId: string }>>({});

  // 🛑 INTERRUPT SETTINGS: Voice barge-in behavior (default OFF for beta)
  const [interruptEnabled, setInterruptEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          // Only enable if explicitly set to true (default false)
          return settings.interrupt?.enabled === true;
        }
      } catch (e) {
        console.warn('[Interrupt] Failed to load initial state:', e);
      }
    }
    return true; // Default ON - natural conversation allows interruptions
  });

  const [interruptDebounceMs, setInterruptDebounceMs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          const sensitivity = settings.interrupt?.sensitivity || 'normal';
          return sensitivity === 'low' ? 300 : sensitivity === 'high' ? 150 : 200;
        }
      } catch (e) {
        console.warn('[Interrupt] Failed to load debounce:', e);
      }
    }
    return 200; // Default 200ms (normal)
  });

  // Threshold multiplier: higher = less sensitive (requires louder speech to trigger)
  const [interruptThresholdMultiplier, setInterruptThresholdMultiplier] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          const sensitivity = settings.interrupt?.sensitivity || 'normal';
          return sensitivity === 'low' ? 1.35 : sensitivity === 'high' ? 1.1 : 1.2;
        }
      } catch (e) {
        console.warn('[Interrupt] Failed to load threshold multiplier:', e);
      }
    }
    return 1.2; // Default 1.2x (normal)
  });

  // 🎭 MAIA MODE STATE: Talk/Care/Scribe relational modes with sub-modes
  // This controls MAIA's relational stance, not just conversation style
  const [maiaMode, setMaiaMode] = useState<ModeState>(DEFAULT_MODE_STATE);

  // 📚 ASK MAIA: Orientation + Knowledge Field stance (single-turn, resets after response)
  // Controlled from parent (MaiaShell rail) or local state (composer chip)
  const [askModeLocal, setAskModeLocal] = useState(false);
  const askMode = askModeProp ?? askModeLocal;
  const setAskMode = onAskModeChangeProp ?? setAskModeLocal;

  // Track last voice command result for acknowledgment handling
  const lastVoiceCommandRef = useRef<VoiceCommandResult | null>(null);

  // 🚨 CRISIS OVERRIDE: Safety boundary that interrupts any mode
  // This takes precedence over all other voice commands and mode states
  const crisisStateRef = useRef<CrisisOverride | null>(null);

  // 💡 IDEA FIELD: Track dismissed/saved idea fingerprints to avoid re-suggesting
  const ideaDismissedRef = useRef<Set<string>>(new Set());
  // 💡 IDEA FIELD: Rate limiter — max 1 toast per 30 seconds to avoid feeling extractive
  const ideaLastShownRef = useRef<number>(0);

  // 📝 SCRIBE SESSION STATE: Track active scribe/witness sessions
  const [scribeSession, setScribeSession] = useState<ScribeSessionState>(DEFAULT_SCRIBE_SESSION);

  // Scribe API handlers
  const startScribeSession = useCallback(async (container: 'solo' | 'witness' | 'practitioner') => {
    try {
      const res = await apiFetch('/api/scribe/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container }),
      });
      const data = await res.json();
      if (data.success) {
        setScribeSession({
          isActive: true,
          isPaused: false,
          isAside: false,
          container,
          sessionId: data.session.id,
          consentConfirmed: false,
          transcriptEnabled: false,
          sealed: true,
        });
        console.log(`📝 [SCRIBE] Session started: ${data.session.id} (${container})`);
        return data;
      }
      console.error('[SCRIBE] Start failed:', data.error);
      return null;
    } catch (error) {
      console.error('[SCRIBE] Start error:', error);
      return null;
    }
  }, []);

  const confirmScribeConsent = useCallback(async (confirmed: boolean) => {
    if (!scribeSession.sessionId) return null;
    try {
      const res = await apiFetch('/api/scribe/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: scribeSession.sessionId,
          confirmed,
          method: 'voice',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScribeSession(prev => ({
          ...prev,
          consentConfirmed: confirmed,
          isActive: confirmed, // If declined, session is no longer active
        }));
        return data;
      }
      return null;
    } catch (error) {
      console.error('[SCRIBE] Consent error:', error);
      return null;
    }
  }, [scribeSession.sessionId]);

  const pauseScribeSession = useCallback(async (pause: boolean) => {
    if (!scribeSession.sessionId) return null;
    try {
      const res = await apiFetch('/api/scribe/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: scribeSession.sessionId,
          action: pause ? 'pause' : 'resume',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScribeSession(prev => ({ ...prev, isPaused: pause }));
        return data;
      }
      return null;
    } catch (error) {
      console.error('[SCRIBE] Pause error:', error);
      return null;
    }
  }, [scribeSession.sessionId]);

  const markScribeMoment = useCallback(async (markerType?: string, note?: string) => {
    if (!scribeSession.sessionId || !scribeSession.consentConfirmed) return null;
    try {
      const res = await apiFetch('/api/scribe/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: scribeSession.sessionId,
          markerType,
          note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        console.log(`📌 [SCRIBE] Marked: ${markerType || 'moment'}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[SCRIBE] Mark error:', error);
      return null;
    }
  }, [scribeSession.sessionId, scribeSession.consentConfirmed]);

  const stopScribeSession = useCallback(async () => {
    if (!scribeSession.sessionId) return null;
    try {
      const res = await apiFetch('/api/scribe/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: scribeSession.sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setScribeSession(DEFAULT_SCRIBE_SESSION);
        console.log(`✅ [SCRIBE] Session stopped: ${scribeSession.sessionId}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[SCRIBE] Stop error:', error);
      return null;
    }
  }, [scribeSession.sessionId]);

  // Toggle transcript enabled/disabled
  const setTranscriptEnabled = useCallback(async (enabled: boolean) => {
    if (!scribeSession.sessionId) return null;
    try {
      const res = await apiFetch(`/api/scribe/sessions/${scribeSession.sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptEnabled: enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setScribeSession(prev => ({ ...prev, transcriptEnabled: enabled }));
        console.log(`📝 [SCRIBE] Transcript ${enabled ? 'enabled' : 'disabled'}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[SCRIBE] Transcript toggle error:', error);
      return null;
    }
  }, [scribeSession.sessionId]);

  // Toggle aside mode (private consultation without recording)
  const toggleScribeAside = useCallback((enterAside: boolean) => {
    if (!scribeSession.isActive) return;
    setScribeSession(prev => ({ ...prev, isAside: enterAside }));
    console.log(`📝 [SCRIBE] Aside mode ${enterAside ? 'entered' : 'exited'} - ${enterAside ? 'NOT recording' : 'now recording'}`);
  }, [scribeSession.isActive]);

  // Append transcript entry (only when transcript enabled + consent confirmed + not in aside)
  const appendTranscriptEntry = useCallback(async (content: string, speaker: 'self' | 'other' | 'maia' = 'self') => {
    if (!scribeSession.sessionId) return;
    if (!scribeSession.isActive || !scribeSession.consentConfirmed) return;
    if (!scribeSession.transcriptEnabled) return;
    if (scribeSession.isPaused) return;
    if (scribeSession.isAside) return; // Skip recording during aside (private consultation)

    const trimmed = (content || '').trim();
    if (!trimmed || trimmed.length < 5) return; // Skip very short utterances

    try {
      await apiFetch('/api/scribe/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: scribeSession.sessionId,
          speaker,
          content: trimmed,
          spokenAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('[SCRIBE] Append transcript error:', error);
    }
  }, [scribeSession.sessionId, scribeSession.isActive, scribeSession.consentConfirmed, scribeSession.transcriptEnabled, scribeSession.isPaused, scribeSession.isAside]);

  // Listen for settings changes from QuickSettingsSheet (sanctuary + interrupt)
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent<{
      sanctuary?: boolean;
      interrupt?: { enabled?: boolean; sensitivity?: 'low' | 'normal' | 'high' };
    }>) => {
      // Handle sanctuary mode
      if (typeof event.detail?.sanctuary === 'boolean') {
        setIsSanctuary(event.detail.sanctuary);
        console.log(`🛡️ [Sanctuary] Mode ${event.detail.sanctuary ? 'ENABLED' : 'disabled'}`);
      }

      // Handle interrupt settings
      if (event.detail?.interrupt) {
        if (typeof event.detail.interrupt.enabled === 'boolean') {
          setInterruptEnabled(event.detail.interrupt.enabled);
          console.log(`🛑 [Interrupt] ${event.detail.interrupt.enabled ? 'ENABLED' : 'disabled'}`);
        }
        if (event.detail.interrupt.sensitivity) {
          const sensitivity = event.detail.interrupt.sensitivity;
          const debounce = sensitivity === 'low' ? 300 : sensitivity === 'high' ? 150 : 200;
          const multiplier = sensitivity === 'low' ? 1.35 : sensitivity === 'high' ? 1.1 : 1.2;
          setInterruptDebounceMs(debounce);
          setInterruptThresholdMultiplier(multiplier);
          console.log(`🛑 [Interrupt] Sensitivity: ${sensitivity} (${debounce}ms, ${multiplier}x threshold)`);
        }
      }
    };

    window.addEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  // Listen for streaming voice mode changes from QuickSettingsSheet
  useEffect(() => {
    const handleStreamingVoiceChange = (event: CustomEvent<{ enabled: boolean }>) => {
      setStreamingVoiceMode(event.detail.enabled);
      console.log(`🌊 [StreamingVoice] Mode ${event.detail.enabled ? 'ENABLED' : 'disabled'}`);
    };

    window.addEventListener('maia-streaming-voice-changed', handleStreamingVoiceChange as EventListener);
    return () => {
      window.removeEventListener('maia-streaming-voice-changed', handleStreamingVoiceChange as EventListener);
    };
  }, []);

  // 🎯 DEBUG: Track greeting condition state
  useEffect(() => {
    // Greeting shows when: not activated AND not processing AND not responding
    const shouldShowGreeting = !hasActivated && !isProcessing && !isResponding;

    console.log('🎯 [GREETING DEBUG] Condition check:', {
      hasActivated,
      isProcessing,
      isResponding,
      shouldShowGreeting,
      totalMessages: messages.length,
    });
  }, [hasActivated, messages, isProcessing, isResponding]);

  // 🧭 Navigation teardown: set a flag when this component unmounts due to client-side routing.
  // React cleanup runs on client-side nav but NOT on F5/hard refresh — this lets
  // loadConversationHistory distinguish "navigation return" from "fresh page load".
  useEffect(() => {
    return () => {
      sessionStorage.setItem('maia_nav_teardown', 'true');
    };
  }, []);

  // 🆕 Listen for "New Conversation" action from QuickSettingsSheet
  useEffect(() => {
    const handleNewConversation = () => {
      console.log('🆕 [New Conversation] Clearing history and resetting to welcome');
      // Clear messages (UI display)
      setMessages([]);
      lastSyncedCountRef.current = 0; // fresh thread — resync from the start
      // Clear historical messages (API context) - truly fresh start
      historicalMessagesRef.current = [];
      // Reset activation state to show welcome screen
      setHasActivated(false);
      // Reset session-restored flag so the welcome greeting can show for the new conversation
      sessionRestoredRef.current = false;
      // Clear navigation flag so next mount doesn't restore the cleared conversation
      sessionStorage.removeItem('maia_nav_teardown');
      // Clear localStorage for current session
      if (typeof window !== 'undefined' && sessionId) {
        const storageKey = `maia_conversation_${sessionId}`;
        localStorage.removeItem(storageKey);
        console.log(`🆕 [New Conversation] Cleared localStorage: ${storageKey}`);
      }
    };

    window.addEventListener('maia-new-conversation', handleNewConversation);
    return () => {
      window.removeEventListener('maia-new-conversation', handleNewConversation);
    };
  }, [sessionId]);

  // 🧭 THERAPEUTIC FRAMEWORK: Selected in Counsel mode (Jungian, Somatic, CBT, IFS, etc.)
  // Now handled by lib/consciousness/therapeuticFrameworks.ts
  // Framework selection is mode-specific and accessed via FrameworkSelector component

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

  // Return loop state - for "Return to Guide/Academy" after seeded sessions
  const [returnPath, setReturnPathState] = useState<{ path: string; label?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      return getReturnPath();
    }
    return null;
  });
  const [userCheckinState, setUserCheckinState] = useState<{ state: EmotionalState; intensity: number } | null>(null);
  const [enableVocabularyTooltips, setEnableVocabularyTooltips] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maia.vocabularyTooltips');
      // Default to true for new users (null means never set)
      // Existing users who explicitly turned it off will have 'false'
      return stored === null ? true : stored === 'true';
    }
    return true;
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
  const [fieldWisdomPresent, setFieldWisdomPresent] = useState(false);
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
  const [youthMaxSessionMinutes, setYouthMaxSessionMinutes] = useState<number | undefined>();
  const [youthTierLabel, setYouthTierLabel] = useState<string | undefined>();

  // Calculate user age and determine if teen
  const userAge = propUserAge || (userBirthDate ? calculateAge(userBirthDate) : null);

  // Refs for mutable values (must be before hooks that use them)
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingMessageTextRef = useRef<string>('');
  const lastMaiaResponseRef = useRef<string>('');
  const lastUserMessageRef = useRef<string>('');
  // 💾 Historical messages for API context - separate from UI display
  // UI stays clean on load, but MAIA has access to conversation history for context
  const historicalMessagesRef = useRef<ConversationMessage[]>([]);
  // 🔄 Track whether messages were restored from storage (prevents greeting from overwriting)
  const sessionRestoredRef = useRef(false);
  const pausedResponseRef = useRef<string | null>(null); // For voice-pause/resume
  const voiceMicRef = useRef<ContinuousConversationRef>(null);

  // 🔊 Voice seam: Use the clean interface instead of reaching into voiceMicRef internals
  const voiceSession = useVoiceSession(voiceMicRef, isAudioPlaying || isMicrophonePaused, isProcessing);

  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const iosWarmedAudioRef = useRef<HTMLAudioElement | null>(null); // Pre-warmed audio element for iOS Safari
  const isProcessingRef = useRef(false);
  const isRespondingRef = useRef(false);
  const isAudioPlayingRef = useRef(false);
  // 🎙️ CONSENT BOUNDARY (fix/typed-turn-no-mic-rearm): modality of the last sent turn.
  // Voice turn → the mic may re-arm after the response; typed turn → it must NOT
  // (typed input is not microphone re-consent). Ref, not state — the mic-restart paths
  // run in setTimeout/requestAnimationFrame where a state value would be a stale
  // closure (see the note at ~line 2558).
  const lastSendWasVoiceRef = useRef(true);

  // ♿ PHOTOSENSITIVITY GUARD — respect the OS reduced-motion setting.
  // The holoflower glows are the largest animated areas on this surface; when
  // the member has asked the system for less motion, amplitude reactivity is
  // switched off entirely rather than merely slowed. Live-updating (not a
  // one-shot read) so toggling the OS setting takes effect without a reload.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  // 🌌 AURORA ENVELOPE (accessibility-critical — see WCAG 2.3.1)
  //
  // Raw `voiceAmplitude` tracks speech at syllable rate (~4–8 Hz). Binding a
  // large glowing area's opacity straight to it produced a sharp field pulse
  // that flashed several times per second — a photosensitive-seizure risk, not
  // a style preference. This envelope low-passes it into an aurora: a slow
  // swell that never resolves into a countable beat.
  //
  // ── Rhythm: breath underneath, speech on top ──────────────────────────
  // Founder ruling 2026-08-13: *"A slow 4–8 second breathing envelope
  // underneath very gently smoothed speech energy."* The field's BRIGHTNESS
  // belongs to the breath alone; speech energy only widens and moves the light
  // (see the aurora blocks in the render — amplitude drives breadth and drift,
  // never opacity). That separation is what makes the field read as a presence
  // accompanying speech rather than an audio visualizer performing each
  // syllable: MAIA does not have to light up per word to be present.
  //
  // Periods share no common multiple, so the three layers never re-align into a
  // countable beat — the eye reads drift, not pulse.
  //
  // ⛔ HARD LIMIT — offered rhythm, never applied rhythm. The field may hold a
  // steady, honest rhythm the member is free to entrain to or ignore. It may
  // NOT detect the member's arousal, breath, or speech tempo and then shift its
  // own rate to *lead* their state somewhere. A fixed rhythm is an invitation;
  // an adaptive rhythm that locks onto a person and paces-and-leads them is
  // covert state induction, which the non-manipulation and no-attachment-capture
  // vows forbid outright. So: these constants are CONSTANT. Speech energy may
  // modulate breadth (so the member can see who is speaking); it must never
  // modulate PERIOD. Any future proposal to make the rhythm adaptive is a canon
  // question for the founder, not an implementation detail.
  const AURORA_BREATH_S = 7;    // breathing core — the ruled 4–8s envelope
  const AURORA_MID_S = 11;      // non-harmonic with BREATH — no common beat
  const AURORA_VEIL_S = 17;     // non-harmonic with both — slowest wander
  //
  // Asymmetric attack/release is what makes it read as aurora rather than
  // metronome — it rises gently and falls even more slowly, so the light
  // spreads and lingers instead of snapping back between syllables. Deliberately
  // slow on both edges ("very gently smoothed"): this envelope is meant to track
  // the *presence* of speech, not its waveform.
  // rAF-driven so the decay keeps running after amplitude updates stop.
  const [auroraLevel, setAuroraLevel] = useState(0);
  const auroraTargetRef = useRef(0);
  useEffect(() => { auroraTargetRef.current = voiceAmplitude; }, [voiceAmplitude]);
  useEffect(() => {
    if (prefersReducedMotion) { setAuroraLevel(0); return; }
    let raf = 0;
    let current = 0;
    const ATTACK = 0.020;  // per-frame approach when rising  (~0.8s to 63%)
    const RELEASE = 0.008; // per-frame approach when falling (~2.1s to 63%)
    const tick = () => {
      const target = auroraTargetRef.current;
      const k = target > current ? ATTACK : RELEASE;
      current += (target - current) * k;
      // Quantize to 1/100 so React re-renders only on perceptible change.
      setAuroraLevel(Math.round(current * 100) / 100);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);




  // ⛑️ P0 — truthful acknowledgement of an explicit Speak act.
  //
  // GOVERNING RULE (founder ruling 2026-08-13): elapsed time may QUALIFY
  // uncertainty; it may not manufacture failure or success. So this state has
  // no timer->failed transition. `failed` is set ONLY by an authoritative
  // failure event (a caught exception from the activation operation).
  // Elapsed time only softens the wording from "Preparing" to "Still preparing".
  //
  // Presentation-only: it never gates audio and never re-implements the mic
  // path. `isListening` remains authoritative for whether voice is actually live.
  type MicRequestState = 'idle' | 'pending' | 'failed';
  const [micRequestState, setMicRequestState] = useState<MicRequestState>('idle');
  const [micPreparingLong, setMicPreparingLong] = useState(false);

  // Confirmation by the real event: listening actually started.
  useEffect(() => {
    if (isListening) { setMicRequestState('idle'); setMicPreparingLong(false); }
  }, [isListening]);

  // Elapsed time qualifies the wait. It does NOT conclude failure.
  useEffect(() => {
    if (micRequestState !== 'pending') { setMicPreparingLong(false); return; }
    const t = setTimeout(() => setMicPreparingLong(true), 6000);
    return () => clearTimeout(t);
  }, [micRequestState]);

  const isMicrophonePausedRef = useRef(false);
  const lastVoiceErrorRef = useRef<number>(0);
  const lastProcessedTranscriptRef = useRef<{ text: string; timestamp: number } | null>(null);
  const lastAudioCallbackUpdateRef = useRef<number>(0); // Throttle audio level callbacks
  const onMessageAddedRef = useRef(onMessageAdded); // Store callback in ref to avoid infinite loop
  const onMemberExpressionRef = useRef(onMemberExpression); // Ref so firing sites don't take a dep on the callback
  const activatingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Safety timeout for stuck activating state
  const handleCaptureSpiritRef = useRef<(() => void) | null>(null); // Ref for capture spirit handler (for event dispatch)
  const didConsumeSeedRef = useRef(false); // One-shot guard for seed prompt consumption
  const handleTextMessageRef = useRef<((text: string) => void) | null>(null); // Ref for seed prompt injection
  const pendingSeedRef = useRef<ConsumedSeed | null>(null); // Store full seed until handler is ready
  // 🌉 RELATIONAL CONTEXT BRIDGE: Session-persistent (NOT one-shot).
  // Set on /relationships/[id] handoff. Rides every oracle POST in this session
  // until the user leaves /maia or a new explicit handoff arrives.
  // Override rule: latest explicit handoff always wins.
  // See: memory/project_relational_context_bridge.md
  const sessionRelationshipContextId = useRef<string | null>(null);

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

  // Keep onMemberExpression ref updated
  useEffect(() => {
    onMemberExpressionRef.current = onMemberExpression;
  }, [onMemberExpression]);

  // Dynamic holoflower size based on window width
  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerWidth <= 768 ? 40 : 350;
      setHoloflowerSize(newSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==================== SEED PROMPT CONSUMER ====================
  // One-shot consumption of seed prompts from Guide/Academy "Take to MAIA" buttons
  // Uses ref guard to ensure we only process once, even with StrictMode double-mount
  // Now supports rich payloads with source tracking for return-loop functionality
  useEffect(() => {
    if (didConsumeSeedRef.current) return;
    didConsumeSeedRef.current = true;

    const seed = consumeMaiaSeed();
    if (seed) {
      console.log('🌱 [SEED] Consumed seed from', seed.source || 'unknown source', ':', seed.prompt.slice(0, 50) + '...');

      // If seed has return path, store it for the spiral return
      if (seed.returnTo) {
        setReturnPath(seed.returnTo, seed.sourceLabel);
        setReturnPathState({ path: seed.returnTo, label: seed.sourceLabel });
        console.log('🔄 [SEED] Return path set:', seed.returnTo, seed.sourceLabel ? `(${seed.sourceLabel})` : '');
      }

      // 🌉 RELATIONAL BRIDGE: If this seed came from /relationships/[id],
      // hold the contextId for the entire session. Latest explicit handoff
      // always overrides prior session context (the override rule).
      if (seed.source === 'relationships:thread' && seed.contextId) {
        sessionRelationshipContextId.current = seed.contextId;
        console.log('🌉 [RELATIONAL BRIDGE] Held for session:', seed.contextId);
      }

      // Store full seed in ref - will be processed by the effect below when handleTextMessage is ready
      pendingSeedRef.current = seed;
    }
  }, []);

  // Store handleTextMessage ref for seed injection (updated after handleTextMessage is defined)
  // This effect is defined early but the actual ref assignment happens later via another effect

  // ==================== RECORDING STATE CALLBACK ====================
  // Sync isListening state from ContinuousConversation to parent
  // This is the SOURCE OF TRUTH for whether mic is actually live
  const handleRecordingStateChange = useCallback((isRecording: boolean) => {
    console.log('📡 Recording state changed:', isRecording, '(this is mic truth)');
    // Clear any pending activating timeout - mic has responded
    if (activatingTimeoutRef.current) {
      clearTimeout(activatingTimeoutRef.current);
      activatingTimeoutRef.current = null;
    }
    setIsActivating(false); // Clear activating state - we now know the truth
    setIsListening(isRecording);
    // Capture-heartbeat bookkeeping. Arming resets the frame clock so the
    // grace window in `isCaptureStalled` is measured from THIS arm, and the
    // stall flag is cleared on every transition so a stall from a previous
    // cycle can never outlive the mic that produced it.
    if (isRecording) {
      captureArmedAtRef.current = Date.now();
      lastAudioFrameAtRef.current = 0;
    } else {
      captureArmedAtRef.current = 0;
    }
    setCaptureStalled(false);
    if (isRecording) {
      console.log('✅ Mic is LIVE - orange dot should be visible');
      // 🎯 Mark as activated when user starts listening - hides welcome screen
      setHasActivated(true);
      setIsMuted(false); // Sync isMuted with actual mic state

      // 🎤 PWA STATE MACHINE: Signal confirmed mic start
      // This is the ONLY place we should transition to LISTENING state
      if (isPwaVoice) {
        pwaVoice.micConfirmed();
      }
    } else {
      // Mic stopped - sync isMuted so holoflower tap will START (not stop)
      // Without this, isMuted stays false after a silence timeout, and the
      // next holoflower tap calls stopListening instead of startListening.
      setIsMuted(true);
      if (isPwaVoice) {
        pwaVoice.micStopped();
      }
    }
  }, [isPwaVoice, pwaVoice]);

  // ==================== AUDIO LEVEL CALLBACK (THROTTLED) ====================
  // Prevent infinite render loop by throttling setState calls
  const handleAudioLevelChange = useCallback((amplitude: number, isSpeaking: boolean) => {
    const now = Date.now();
    // Recorded BEFORE the throttle: this is the capture-liveness heartbeat, and
    // sampling it at 10fps would make the stall verdict depend on a UI
    // smoothing decision rather than on whether audio is actually arriving.
    lastAudioFrameAtRef.current = now;
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

  // 🛑 BARGE-IN INTERRUPT HANDLER - Moved after useStreamingVoice hook (see ~line 1880)

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

      // Resume if suspended or interrupted (iOS can be in either state)
      if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
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

  const maiaSpeak = useCallback(async (text: string, elementHint?: Element, ttsInstructions?: string) => {
    if (!text || typeof window === 'undefined') return;

    // Check if we need to show audio permission prompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS && !audioContextRef.current) {
      console.log('📱 [iOS] Borrowing shared AudioContext from ios-audio-session');
      try {
        // Use the shared context — already unlocked via first gesture
        audioContextRef.current = getSharedAudioContext();
      } catch (e) {
        console.error('❌ Failed to get shared AudioContext:', e);
      }
    }

    // Ensure the shared AudioContext is running before playback
    if (isIOS) {
      try {
        await ensureAudioReady();
        console.log('✅ [iOS] Shared AudioContext ensured ready');
      } catch (e) {
        console.warn('⚠️ [iOS] ensureAudioReady failed:', e);
      }
    }

    try {
      console.log(`🎵 Speaking with OpenAI ${voiceSettings.voice}:`, text.substring(0, 100));

      // 🌊 LIQUID AI - Track MAIA response for rhythm turn-taking latency
      rhythmTrackerRef.current?.onMAIAResponse();

      setIsResponding(true);

      // 🔥 iOS Safari Fix: Use Web Audio API decodeAudioData instead of HTMLAudioElement
      // HTMLAudioElement.play() requires a user gesture for EACH element on iOS
      // But AudioContext.decodeAudioData() works once the context is unlocked
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      // Check if we're in Capacitor (CapacitorHttp doesn't handle binary blobs correctly)
      const isCapacitor = typeof window !== 'undefined' &&
                          (window as any).Capacitor?.isNativePlatform?.();

      // 🔊 iOS Audio Session: Prepare for speaking (configures iOS audio session for playback)
      // This is CRITICAL - without it, audio won't play through speakers on iOS
      if (isCapacitor) {
        console.log('📱 [iOS] Preparing audio session for speaking...');
        try {
          const prepared = await withTimeout(
            VoiceController.prepareForSpeaking(),
            5000,
            'iOS audio session prepare'
          );
          if (!prepared) {
            console.error('❌ [iOS] Failed to prepare audio session for speaking');
            try {
              await withTimeout(VoiceController.logDiagnostics(), 2000, 'iOS audio diagnostics');
            } catch (diagErr) {
              console.warn('⚠️ [iOS] logDiagnostics timed out:', diagErr);
            }
            // Continue anyway - might still work
          } else {
            console.log('✅ [iOS] Audio session ready for speaking');
          }
        } catch (prepErr) {
          console.warn('⚠️ [iOS] prepareForSpeaking timed out — continuing:', prepErr);
        }
      }

      let audioBlob: Blob | null = null;
      let arrayBuffer: ArrayBuffer | null = null;

      // For Capacitor: Use native HTTP plugin directly to get binary data
      // The fetch polyfill returns empty blobs for binary responses
      if (isCapacitor) {
        console.log('📱 [iOS] Using Capacitor native HTTP for TTS binary fetch');
        const memberId = getValidMemberId();
        const ttsUrl = apiUrl('/api/voice/openai-tts');

        // Dynamic import to avoid loading Capacitor on non-native platforms
        const { CapacitorHttp } = await import('@capacitor/core');
        // 🛡️ Hard timeout — CapacitorHttp can silently hang on iOS network
        // wedges, trapping isResponding=true forever. Always fail closed.
        const nativeResponse = await withTimeout(
          CapacitorHttp.post({
            url: ttsUrl,
            headers: {
              'Content-Type': 'application/json',
              ...(memberId ? { 'x-member-id': memberId } : {}),
            },
            data: {
              text: text,
              voice: voiceSettings.voice,
              speed: voiceSettings.speed,
              model: ttsInstructions ? 'gpt-4o-mini-tts' : voiceSettings.model,
              ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
            },
            responseType: 'arraybuffer',
          }),
          30000,
          'iOS TTS request'
        );

        // Detailed logging to diagnose what we received
        console.log('📱 [TTS] status:', nativeResponse.status);
        console.log('📱 [TTS] headers:', JSON.stringify(nativeResponse.headers));

        if (nativeResponse.status !== 200) {
          console.error('📱 [TTS] Request failed with status:', nativeResponse.status);
          throw new Error('Failed to generate speech');
        }

        // CapacitorHttp can return data in multiple formats depending on version/platform
        const data: any = nativeResponse.data;
        console.log('📱 [TTS] data typeof:', typeof data);
        console.log('📱 [TTS] data isArray:', Array.isArray(data));

        if (typeof data === 'string') {
          console.log('📱 [TTS] base64 length:', data.length);
          console.log('📱 [TTS] base64 head:', data.slice(0, 32));
        }

        // 1) Already an ArrayBuffer
        if (data instanceof ArrayBuffer) {
          arrayBuffer = data;
          console.log('📱 [TTS] Data is ArrayBuffer, size:', arrayBuffer.byteLength);
        }
        // 2) Uint8Array
        else if (data instanceof Uint8Array) {
          arrayBuffer = data.buffer;
          console.log('📱 [TTS] Data is Uint8Array, size:', arrayBuffer.byteLength);
        }
        // 3) Base64 string (most common on iOS) - use safe chunked decoder
        else if (typeof data === 'string' && data.length > 0) {
          console.log('📱 [TTS] Decoding base64 string with safe chunked decoder...');
          try {
            arrayBuffer = base64ToArrayBuffer(data);
            console.log('📱 [TTS] Base64 decoded successfully, size:', arrayBuffer.byteLength);
          } catch (decodeErr) {
            console.error('📱 [TTS] Base64 decode failed:', decodeErr);
            throw new Error('Failed to decode audio data');
          }
        }
        // 4) Some platforms return { data: number[] }
        else if (data && Array.isArray(data.data)) {
          console.log('📱 [TTS] Data is { data: number[] }, length:', data.data.length);
          arrayBuffer = new Uint8Array(data.data).buffer;
        }
        else {
          console.error('📱 [TTS] Unexpected data shape:', typeof data, data);
          throw new Error('Unexpected audio response format');
        }

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('No audio data received from TTS');
        }

        // Validate it looks like audio data (MP3 starts with ID3 or 0xFF)
        const head = new Uint8Array(arrayBuffer.slice(0, 16));
        console.log('📱 [TTS] first bytes:', Array.from(head));
        const isMP3 = (head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) || head[0] === 0xff;
        if (!isMP3) {
          console.warn('📱 [TTS] Data does not look like MP3; first bytes might be JSON error');
          // Try to decode as text to see if it's an error message
          try {
            const textDecoder = new TextDecoder();
            const possibleError = textDecoder.decode(arrayBuffer.slice(0, 200));
            console.warn('📱 [TTS] Possible error payload:', possibleError);
          } catch {}
        }
        console.log(`📱 [TTS] ArrayBuffer ready, size: ${arrayBuffer.byteLength}, looksLikeMP3: ${isMP3}`);
      } else {
        // Non-Capacitor: Use standard fetch
        const response = await apiFetch('/api/voice/openai-tts', {
          method: 'POST',
          body: JSON.stringify({
            text: text,
            voice: voiceSettings.voice,
            speed: voiceSettings.speed,
            model: ttsInstructions ? 'gpt-4o-mini-tts' : voiceSettings.model,
            ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }

        audioBlob = await response.blob();
        console.log(`🎵 Audio blob received: type=${audioBlob.type}, size=${audioBlob.size}`);

        // Validate we got audio data, not an error response
        if (audioBlob.type.includes('json') || audioBlob.size < 1000) {
          const errorText = await audioBlob.text();
          console.error('❌ [TTS] Got error response instead of audio:', errorText.slice(0, 300));
          toast.error('Voice generation failed');
          throw new Error('TTS returned error: ' + errorText.slice(0, 100));
        }
      }

      // Log which playback path we're taking
      const isIOSSafari = isIOS && !isCapacitor;
      console.log('🔍 [TTS] Playback path check:', { isIOS, isCapacitor, isIOSSafari, hasAudioContext: !!audioContextRef.current });

      // iOS Safari (PWA/browser): Use Web Audio API directly - more reliable than HTMLAudioElement
      if (isIOSSafari && audioBlob && audioContextRef.current) {
        console.log('📱 [iOS Safari] Using Web Audio API (decodeAudioData) for playback');
        console.log('📱 [iOS Safari] Blob type:', audioBlob.type, 'size:', audioBlob.size);

        try {
          // Ensure AudioContext is running (check both suspended and interrupted)
          if (audioContextRef.current.state === 'suspended' || audioContextRef.current.state === 'interrupted') {
            console.log(`📱 [iOS Safari] AudioContext ${audioContextRef.current.state}, resuming...`);
            await audioContextRef.current.resume();
            console.log('📱 [iOS Safari] AudioContext state:', audioContextRef.current.state);
          }

          // Convert blob to ArrayBuffer
          const arrayBuffer = await audioBlob.arrayBuffer();
          console.log('📱 [iOS Safari] ArrayBuffer size:', arrayBuffer.byteLength);

          // Decode the audio
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice(0));
          console.log('📱 [iOS Safari] Decoded! Duration:', audioBuffer.duration, 'sampleRate:', audioBuffer.sampleRate);

          // Create source
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;

          // Create gain node for volume
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = 1.0;

          // Connect: source -> gain -> destination
          source.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);

          console.log('📱 [iOS Safari] Audio graph ready, starting playback...');
          setIsAudioPlaying(true);

          // Play using Web Audio API
          await new Promise<void>((resolve, reject) => {
            const duration = audioBuffer.duration;
            const playbackTimeout = setTimeout(() => {
              console.error('❌ [iOS Safari] Playback timeout');
              setIsAudioPlaying(false);
              setVoiceAmplitude(0);
              reject(new Error('Playback timeout'));
            }, (duration + 30) * 1000);

            source.onended = () => {
              console.log('🔇 [iOS Safari] Web Audio playback complete');
              clearTimeout(playbackTimeout);
              setIsAudioPlaying(false);
              setVoiceAmplitude(0);
              resolve();
            };

            // Amplitude simulation
            const amplitudeInterval = setInterval(() => {
              setVoiceAmplitude(0.3 + Math.random() * 0.4);
            }, 100);

            // Start playback
            source.start(0);
            console.log('▶️ [iOS Safari] Web Audio playback started!');

            // Clean up amplitude simulation when done
            source.onended = () => {
              clearInterval(amplitudeInterval);
              clearTimeout(playbackTimeout);
              setIsAudioPlaying(false);
              setVoiceAmplitude(0);
              console.log('🔇 [iOS Safari] Playback complete');
              resolve();
            };
          });

          setIsResponding(false);
          return;

        } catch (webAudioErr: any) {
          console.error('❌ [iOS Safari] Web Audio API failed:', webAudioErr.message);
          toast.error('Voice playback failed', { duration: 4000 });
          // Fall through to generic Web Audio API path
        }
      }

      // Web Audio API path (Capacitor native iOS or fallback)
      if (isIOS && audioContextRef.current) {
        console.log('📱 [iOS] Using Web Audio API for playback');

        // Ensure AudioContext is running (handle both 'suspended' and 'interrupted' states)
        if (audioContextRef.current.state === 'suspended' || audioContextRef.current.state === 'interrupted') {
          console.log(`📱 [iOS] AudioContext ${audioContextRef.current.state}, resuming...`);
          await audioContextRef.current.resume();
          console.log('📱 [iOS] AudioContext state after resume:', audioContextRef.current.state);
        }

        // Get ArrayBuffer if we don't have it yet (fallback from HTMLAudioElement failure)
        if (!arrayBuffer && audioBlob) {
          arrayBuffer = await audioBlob.arrayBuffer();
        }

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('No audio data to decode');
        }

        console.log(`📱 [iOS] ArrayBuffer size: ${arrayBuffer.byteLength}`);

        // Validate we have actual audio data (MP3 starts with 0xFF 0xFB or ID3)
        const header = new Uint8Array(arrayBuffer.slice(0, 4));
        const headerHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`📱 [iOS] Audio header bytes: ${headerHex}`);

        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        const duration = audioBuffer.duration;
        console.log(`✅ [iOS] Audio decoded, duration: ${duration.toFixed(1)}s`);

        // Create source and connect to analyser for visualization
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;

        // Create GainNode for volume control (iOS sometimes needs explicit gain)
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 1.0; // Full volume

        // Create analyser for visualization
        if (!audioAnalyserRef.current) {
          audioAnalyserRef.current = audioContextRef.current.createAnalyser();
          audioAnalyserRef.current.fftSize = 256;
          audioAnalyserRef.current.smoothingTimeConstant = 0.8;
        }

        // Audio chain: source -> gain -> analyser -> destination
        source.connect(gainNode);
        gainNode.connect(audioAnalyserRef.current);
        audioAnalyserRef.current.connect(audioContextRef.current.destination);

        // iOS diagnostic logging
        console.log('🔊 [iOS] Audio graph connected:', {
          contextState: audioContextRef.current.state,
          sampleRate: audioContextRef.current.sampleRate,
          destination: audioContextRef.current.destination.numberOfInputs,
          gainValue: gainNode.gain.value,
        });

        // Start amplitude reading loop
        const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
        let animationId: number | null = null;

        const readAmplitude = () => {
          if (!audioAnalyserRef.current) return;
          audioAnalyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length / 255;
          const scaledAmplitude = Math.min(1, average * 2.5);
          setVoiceAmplitude(scaledAmplitude);
          animationId = requestAnimationFrame(readAmplitude);
        };

        // Play with promise
        await new Promise<void>((resolve, reject) => {
          const playbackTimeout = setTimeout(() => {
            console.error(`❌ [iOS] Playback timeout after ${duration + 30}s`);
            if (animationId) cancelAnimationFrame(animationId);
            setVoiceAmplitude(0);
            reject(new Error('Audio playback timeout'));
          }, (duration + 30) * 1000);

          source.onended = () => {
            console.log(`🔇 [iOS] MAIA finished speaking - ${duration.toFixed(1)}s`);
            clearTimeout(playbackTimeout);
            if (animationId) cancelAnimationFrame(animationId);
            setVoiceAmplitude(0);
            resolve();
          };

          // Catch any errors during playback
          source.onerror = (e) => {
            console.error('❌ [iOS] Audio source error:', e);
            clearTimeout(playbackTimeout);
            if (animationId) cancelAnimationFrame(animationId);
            setVoiceAmplitude(0);
            toast.error('Audio playback error - check mute switch', { duration: 4000 });
            reject(new Error('Audio source error'));
          };

          // Start playback - ensure AudioContext is running
          const startPlayback = () => {
            console.log('🎵 [iOS] Starting playback, context state:', audioContextRef.current?.state);
            setIsAudioPlaying(true);
            readAmplitude();
            source.start(0);
            console.log('▶️ [iOS] Audio started playing via Web Audio API');
            console.log('📱 [iOS] If no sound: check iPhone silent switch (left side of device)');
          };

          // iOS AudioContext can be 'suspended' OR 'interrupted' - both need resume()
          const contextState = audioContextRef.current?.state;
          if (contextState === 'suspended' || contextState === 'interrupted') {
            console.warn(`⚠️ [iOS] AudioContext is ${contextState}, forcing resume...`);
            audioContextRef.current.resume().then(() => {
              console.log('✅ [iOS] AudioContext resumed, now state:', audioContextRef.current?.state);
              startPlayback();
            }).catch((e) => {
              console.error('❌ [iOS] Failed to resume AudioContext:', e);
              toast.error('Cannot play audio - tap screen first', { duration: 3000 });
              startPlayback(); // Try anyway
            });
          } else {
            startPlayback();
          }

          // After 2 seconds, check if audio is actually producing output
          setTimeout(() => {
            if (audioAnalyserRef.current && animationId) {
              const checkData = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
              audioAnalyserRef.current.getByteFrequencyData(checkData);
              const hasOutput = checkData.some(v => v > 0);
              if (!hasOutput) {
                console.warn('⚠️ [iOS] No audio output detected - check mute switch or volume');
                toast('No audio output - check mute switch & volume', { icon: '🔇', duration: 4000 });
              } else {
                console.log('✅ [iOS] Audio output confirmed');
              }
            }
          }, 2000);
        });

      } else {
        // Non-iOS: Use HTMLAudioElement (works fine on desktop browsers)
        if (!audioBlob) {
          throw new Error('No audio blob available for playback');
        }
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          let hasStarted = false;
          let startTimeoutId: NodeJS.Timeout | null = null;
          let playbackTimeoutId: NodeJS.Timeout | null = null;

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
            const playbackTimeout = (audio.duration + 30) * 1000;
            playbackTimeoutId = setTimeout(() => {
              console.error(`❌ [AUDIO] Playback timeout! Audio at ${audio.currentTime.toFixed(1)}s of ${audio.duration.toFixed(1)}s`);
              audio.pause();
              stopAudioAnalysis();
              URL.revokeObjectURL(audioUrl);
              reject(new Error(`Audio playback timeout after ${playbackTimeout/1000}s`));
            }, playbackTimeout);
          };

          audio.onplay = () => {
            console.log('▶️ Audio started playing');
            hasStarted = true;
            if (startTimeoutId) clearTimeout(startTimeoutId);
            setIsAudioPlaying(true);
            startAudioAnalysis(audio);
          };

          audio.onpause = () => {
            if (!audio.ended) {
              console.warn(`⚠️ [AUDIO] Paused at ${audio.currentTime.toFixed(1)}s of ${audio.duration.toFixed(1)}s`);
            }
          };

          audio.onended = () => {
            console.log(`🔇 MAIA finished speaking - ${audio.currentTime.toFixed(1)}s of ${audio.duration.toFixed(1)}s`);
            stopAudioAnalysis();
            URL.revokeObjectURL(audioUrl);
            if (startTimeoutId) clearTimeout(startTimeoutId);
            if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
            resolve();
          };

          audio.onerror = (e) => {
            console.error('❌ Audio playback error:', e);
            stopAudioAnalysis();
            setIsResponding(false);
            setIsAudioPlaying(false);
            setIsMicrophonePaused(false);
            URL.revokeObjectURL(audioUrl);
            if (startTimeoutId) clearTimeout(startTimeoutId);
            if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
            reject(new Error('Audio playback failed'));
          };

          audio.play().catch(err => {
            console.error('❌ Audio.play() failed:', err);
            stopAudioAnalysis();
            if (startTimeoutId) clearTimeout(startTimeoutId);
            if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
            reject(err);
          });
        });
      }

      // 🔥 CRITICAL: Reset states after successful audio playback (both iOS and non-iOS paths)
      // Without this, the app gets stuck thinking audio is playing and won't resume listening
      console.log('✅ Audio playback completed successfully, resetting states');
      setIsAudioPlaying(false);
      setIsResponding(false);

    } catch (err) {
      console.error('❌ OpenAI TTS error (no fallback - OpenAI TTS only):', err);
      // Show user-visible error for debugging
      toast.error('Voice playback failed - check iPhone mute switch & volume', { duration: 5000 });
    } finally {
      // 🛡️ Guaranteed UI release — no matter what awaited leg hung, threw,
      // or timed out above, "thinking" must not stay hostage. This is the
      // single bottleneck through which every speak attempt must exit.
      stopAudioAnalysis();
      setIsResponding(false);
      setIsAudioPlaying(false);
    }
  }, [startAudioAnalysis, stopAudioAnalysis, voiceSettings]);

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

  // 🎬 DEMO ORCHESTRATION - Listen for demo events to trigger UI during manifesto
  useDemoEventListener({
    onShowCapture: () => {
      console.log('🎬 [Demo] Triggering Capture panel');
      setShowCapturePanel(true);
    },
    onShowBreakthrough: () => {
      console.log('🎬 [Demo] Triggering Capture suggestion (breakthrough)');
      setShowCaptureSuggestion(true);
    },
    onShowPatternOffering: (data) => {
      console.log('🎬 [Demo] Triggering Capture suggestion (pattern)', data);
      setShowCaptureSuggestion(true);
    },
    onHideAll: () => {
      console.log('🎬 [Demo] Hiding all demo popups');
      setShowCapturePanel(false);
      setShowCaptureSuggestion(false);
    },
    onPulseHoloflower: () => {
      console.log('🎬 [Demo] Pulsing holoflower');
      // Could trigger a holoflower animation state change here
    },
  });

  // Scribe Mode - Derived aliases for compatibility with UI components
  const isScribing = scribeSession.isActive;
  const startScribing = useCallback(() => startScribeSession('witness'), [startScribeSession]);
  const stopScribing = stopScribeSession;
  const recordVoiceTranscript = useCallback((text: string) => appendTranscriptEntry(text, 'self'), [appendTranscriptEntry]);
  const recordConsultation = useCallback((speaker: 'user' | 'oracle', text: string) => {
    appendTranscriptEntry(text, speaker === 'oracle' ? 'maia' : 'self');
  }, [appendTranscriptEntry]);
  const generateSynopsis = useCallback(async () => null, []);
  const downloadScribeTranscript = useCallback(() => {
    console.log('[SCRIBE] Download not yet implemented - use Sessions Library');
  }, []);
  const getTranscriptForReview = useCallback((): string | null => {
    if (!scribeSession.sessionId) return null;
    return `[Transcript for session ${scribeSession.sessionId} - visit /sessions for full review]`;
  }, [scribeSession.sessionId]);

  // 🌊 STREAMING VOICE: Server-side sentence TTS for natural conversational flow
  const [streamingResponseComplete, setStreamingResponseComplete] = useState(false);

  // Load voice settings from account preferences on mount and listen for changes
  useEffect(() => {
    const loadVoiceSettings = () => {
      const settings = getAccountSettings();
      const LEGACY_MAP: Record<string, string> = { alloy: 'maia_core', shimmer: 'maia_warm', nova: 'maia_clear', echo: 'atlas', onyx: 'atlas_deep', fable: 'maia_clear' };
      setVoiceSettings({
        voice: LEGACY_MAP[settings.voice.openaiVoice] ?? settings.voice.openaiVoice ?? 'maia_core',
        speed: settings.voice.speed,
        model: settings.voice.model || 'maia_core',
        prosodyRange: settings.voice.prosodyRange ?? 1,
        archetype: settings.archetype || 'AUTO',
        conversationMode: settings.conversationMode || 'her',
        memoryDepth: settings.memory?.depth || 'moderate',
      });
    };

    loadVoiceSettings();

    // Listen for settings changes (from MAIA Settings panel or AccountSettings)
    const handleSettingsChange = () => loadVoiceSettings();
    window.addEventListener('maia-account-settings-changed', handleSettingsChange);
    window.addEventListener('maia-settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('maia-account-settings-changed', handleSettingsChange);
      window.removeEventListener('maia-settings-changed', handleSettingsChange);
    };
  }, []);

  // PWA playback signal handler - routes audio events to PWA state machine
  const handlePlaybackSignal = useCallback((signal: StreamingVoicePlaybackSignal) => {
    if (!isPwaVoice) return;

    if (signal.type === 'AUDIO_PLAYING_CONFIRMED') {
      pwaVoice.audioPlayingConfirmed();
    } else if (signal.type === 'AUDIO_ENDED') {
      pwaVoice.audioEnded();
    } else if (signal.type === 'AUDIO_BLOCKED' || signal.type === 'AUDIO_FAILED') {
      pwaVoice.ttsFailedOrSkipped(signal.reason);
    }
  }, [isPwaVoice, pwaVoice]);

  // 🎤 PWA EFFECTIVE FLAGS: Use PWA state machine values on Safari PWA, original values otherwise
  // This allows UI components to use a single set of flags regardless of platform
  const effectiveIsListening = isPwaVoice ? pwaVoice.isListening : isListening;
  const effectiveIsResponding = isPwaVoice ? pwaVoice.isThinkingOrSpeaking : isResponding;
  const effectiveIsMuted = isPwaVoice ? pwaVoice.isMuted : isMuted;

  const {
    isStreaming: isStreamingVoice,
    isPlaying: isStreamingPlaying,
    currentText: streamingCurrentText,
    fullResponse: streamingFullResponse,
    sendMessage: sendStreamingMessage,
    stop: stopStreamingVoice,
    error: streamingVoiceError,
    lastMoveOutcome,
    unlockAudio: unlockStreamingAudio,
  } = useStreamingVoice({
    voice: voiceSettings.voice,
    speed: voiceSettings.speed,
    model: voiceSettings.model,
    prosodyRange: voiceSettings.prosodyRange,
    volume: voiceVolume,
    assistantName,  // Member's preferred name for MAIA
    archetype: voiceSettings.archetype,
    conversationMode: voiceSettings.conversationMode,
    memoryDepth: voiceSettings.memoryDepth,
    element: undefined, // Will be set dynamically per message
    // 🎤 PWA PLAYBACK SIGNALS: Route audio events to PWA state machine
    onPlaybackSignal: handlePlaybackSignal,
    // 🛑 LIMITS BLOCK: Show modal when voice limit hit (429 + blocked)
    onLimitsBlock: (data) => {
      console.log('[StreamingVoice] Voice limit reached:', data.message);
      setLimitsBlock({
        message: data.message,
        tier: data.tier,
      });
      // Reset voice state so user isn't stuck
      setIsProcessing(false);
      setIsResponding(false);
      setIsAudioPlaying(false);
      setIsMicrophonePaused(false);
      setIsListening(false);
      isProcessingRef.current = false;
      isRespondingRef.current = false;
      isAudioPlayingRef.current = false;
      isMicrophonePausedRef.current = false;
    },
    onTextChunk: (text, index) => {
      console.log(`🌊 [StreamingVoice] Text chunk ${index}:`, text.substring(0, 50) + '...');
      setMaiaResponseText(text);
    },
    onComplete: (fullResponse, relational) => {
      const audioChunks = relational?.audioChunksReceived ?? 0;
      console.log(`✅ [StreamingVoice] Text stream complete (${audioChunks} audio chunks)`);

      // 🚨 CRITICAL: TTS FAILURE RECOVERY
      // If no audio chunks were received, TTS completely failed - don't wait for audio that won't come
      if (audioChunks === 0) {
        console.warn('⚠️ [StreamingVoice] TTS FAILED - no audio received. Resetting speaking state immediately.');
        // Reset ALL processing/speaking states so mic isn't blocked forever
        setIsProcessing(false);
        isProcessingRef.current = false;
        setIsResponding(false);
        setIsAudioPlaying(false);
        setIsMicrophonePaused(false);
        isRespondingRef.current = false;
        isAudioPlayingRef.current = false;
        isMicrophonePausedRef.current = false;
        // Still add message for text display
        const oracleMessage: ConversationMessage = {
          id: `msg-${Date.now()}`,
          role: 'oracle',
          text: fullResponse,
          timestamp: new Date(),
          source: 'stream',
          suggestedActions: relational?.suggestedActions,
        };
        setMessages(prev => appendMessageCapped(prev, oracleMessage));
        setMaiaResponseText('');
        setStreamingResponseComplete(true);
        // Resume mic after short delay
        setTimeout(() => {
          if (voiceSession.state.capabilities.canStartListening) {
            console.log('🎤 [StreamingVoice] Resuming mic after TTS failure');
            setIsMuted(false);
            if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('stream_failure_recovery');
          }
        }, 500);
        return;
      }

      // Normal path: audio chunks received, waiting for playback to finish
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'oracle',
        text: fullResponse,
        timestamp: new Date(),
        source: 'stream',
        suggestedActions: relational?.suggestedActions,
      };
      setMessages(prev => appendMessageCapped(prev, oracleMessage));
      setMaiaResponseText('');
      // Mark that text stream is complete - mic will resume when audio finishes
      setStreamingResponseComplete(true);

      // 💡 IDEA FIELD: Surface idea candidates from voice streaming path
      const voiceIdeaCandidate = relational?.ideaCandidate;
      const ideaCooldownMs = 30_000;
      const timeSinceLastIdea = Date.now() - ideaLastShownRef.current;
      if (
        voiceIdeaCandidate &&
        !ideaDismissedRef.current.has(voiceIdeaCandidate.fingerprint) &&
        timeSinceLastIdea >= ideaCooldownMs
      ) {
        ideaDismissedRef.current.add(voiceIdeaCandidate.fingerprint);
        ideaLastShownRef.current = Date.now();

        toast(
          (t: { id: string }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '260px' }}>
              <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 500 }}>
                {voiceIdeaCandidate.title}
              </div>
              <div style={{ fontSize: '11px', color: '#a8a29e', lineHeight: '1.4' }}>
                {voiceIdeaCandidate.summary.slice(0, 120)}{voiceIdeaCandidate.summary.length > 120 ? '...' : ''}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    fetch('/api/ideas/capture', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: voiceIdeaCandidate.title,
                        description: voiceIdeaCandidate.summary,
                        sourceText: voiceIdeaCandidate.sourceText,
                        confidence: voiceIdeaCandidate.confidence,
                        conversationId: sessionId,
                      }),
                    }).catch(() => {});
                    toast.dismiss(t.id);
                    toast('Idea saved', { icon: '💡', duration: 2000, style: { background: '#1c1917', color: '#fbbf24', fontSize: '12px' } });
                  }}
                  style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Save
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{ background: 'transparent', color: '#78716c', border: '1px solid rgba(120, 113, 108, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ),
          {
            duration: 10000,
            icon: '💡',
            style: {
              background: '#1c1917',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '12px',
              padding: '12px',
            },
          }
        );
        console.log(`💡 [idea-field] Voice candidate surfaced: "${voiceIdeaCandidate.title}" (${voiceIdeaCandidate.confidence})`);
      }
    },
    onError: (error) => {
      // 🔥 FORCE RECOVERY: Called by useStreamingVoice when audio pipeline fails
      // Must clear ALL speaking state including refs so mic can resume
      console.error('❌ [StreamingVoice] Error - forcing full recovery:', error);
      setIsResponding(false);
      setIsAudioPlaying(false);
      setIsMicrophonePaused(false);
      setStreamingResponseComplete(false);
      // Clear refs too - these are what actually block the mic
      isRespondingRef.current = false;
      isAudioPlayingRef.current = false;
      isMicrophonePausedRef.current = false;
      // Resume mic after short delay
      setTimeout(() => {
        const isHandsFree = voiceMicRef.current?.isHandsFree ?? true;
        if (voiceSession.state.capabilities.canStartListening && streamingVoiceMode && isHandsFree) {
          console.log('🎤 [StreamingVoice] Resuming mic after force recovery');
          setIsMuted(false);
          if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('streaming_force_recovery');
        }
      }, 500);
    }
  });

  // 🌊 STREAMING VOICE: Sync isAudioPlaying with actual playback state
  // isStreamingPlaying comes from useStreamingVoice and is true ONLY when
  // audio is actually playing through the Audio element — not during LLM
  // processing or TTS generation. This prevents the watchdog from firing
  // during the TTS generation gap (can be 60+ seconds with Kokoro).
  useEffect(() => {
    if (isStreamingPlaying && streamingVoiceMode) {
      isAudioPlayingRef.current = true;
      setIsAudioPlaying(true);
    }
  }, [isStreamingPlaying, streamingVoiceMode]);

  // 🌊 STREAMING VOICE: Resume mic when audio playback finishes
  const prevStreamingPlayingRef = useRef(isStreamingPlaying);
  const prevStreamingCompleteRef = useRef(streamingResponseComplete);
  useEffect(() => {
    console.log('🔍 [StreamingVoice] State check:', {
      prevPlaying: prevStreamingPlayingRef.current,
      nowPlaying: isStreamingPlaying,
      responseComplete: streamingResponseComplete,
      prevComplete: prevStreamingCompleteRef.current
    });

    // Helper to restart mic after MAIA finishes speaking
    // 🎙️ POLICY: Only auto-restart if ContinuousConversation is in hands-free mode
    // Otherwise just clear the speaking state and let user tap to speak (push-to-talk default)
    const restartMicWithRetry = () => {
      console.log('🎤 [StreamingVoice] Audio finished - clearing speaking state');
      setIsResponding(false);
      setIsAudioPlaying(false);
      setIsMicrophonePaused(false);
      setStreamingResponseComplete(false);

      // Check if hands-free is active via the ContinuousConversation ref
      // Default true: hands-free is the intended default (see line 7079 comment)
      const isHandsFree = voiceMicRef.current?.isHandsFree ?? true;

      if (!isHandsFree) {
        // Push-to-talk (default): Just clear state, user taps mic to speak again
        console.log('🎤 [StreamingVoice] Push-to-talk mode - mic idle, ready for user tap');
        setIsListening(false);
        return;
      }

      // Hands-free mode: Try to restart mic (single attempt, not a retry loop)
      // ContinuousConversation's own authority guard handles rejection if not ready.
      // 🔥 FIX: Don't gate on voiceSession.state.capabilities — it's a stale closure
      // from the render where isAudioPlaying was still true. Call startListening directly
      // and let CC's authority guard decide.
      //
      // NOTE: Chat visibility used to gate this (`!showChatInterface`); removed because
      // voice intent (streamingVoiceMode + isHandsFree, checked above) is the correct
      // lifecycle authority. Chat visibility is a presentation concern, not a voice
      // lifecycle concern. See: continuous talk-mode parity goal.
      if (streamingVoiceMode) {
        console.log('🎤 [StreamingVoice] Hands-free mode - requesting mic restart');
        setIsListening(true);
        setIsActivating(false);

        setTimeout(() => {
          if (streamingVoiceMode) {
            setIsMuted(false);
            console.log('🎤 [StreamingVoice] Calling startListening after 300ms');
            if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('streaming_response_complete');
          }
        }, 300);
      }
    };

    // Case 1: Audio was playing and just stopped, response is complete
    if (prevStreamingPlayingRef.current && !isStreamingPlaying && streamingResponseComplete) {
      restartMicWithRetry();
    }
    // Case 2: Response just completed and audio is already not playing (TTS was fast or failed)
    else if (!prevStreamingCompleteRef.current && streamingResponseComplete && !isStreamingPlaying) {
      console.log('🎤 [StreamingVoice] Response complete, audio already done - resuming mic');
      // Small delay to ensure any pending audio state has settled
      setTimeout(restartMicWithRetry, 500);
    }

    prevStreamingPlayingRef.current = isStreamingPlaying;
    prevStreamingCompleteRef.current = streamingResponseComplete;
  }, [isStreamingPlaying, streamingResponseComplete, showChatInterface, streamingVoiceMode]);

  // 🛑 BARGE-IN INTERRUPT HANDLER - Called when user speaks while MAIA is speaking
  // NOTE: Must be defined AFTER useStreamingVoice hook which provides stopStreamingVoice
  // CRITICAL: Must reset ALL state flags that contribute to isSpeaking condition
  const handleVoiceInterrupt = useCallback(() => {
    console.log('🛑 [INTERRUPT] User barge-in detected - stopping MAIA immediately');

    // Stop MAIA's voice stream and playback (hard cut)
    stopStreamingVoice();

    // 🔥 CRITICAL: Reset ALL state flags that could keep "speaking" true
    // isSpeaking = {isAudioPlaying || isMicrophonePaused} - BOTH must be false
    isAudioPlayingRef.current = false;
    isRespondingRef.current = false;
    isMicrophonePausedRef.current = false;

    setIsResponding(false);
    setIsAudioPlaying(false);
    setIsMicrophonePaused(false);

    // Flip to listening immediately (user is speaking)
    setIsListening(true);
    setIsActivating(false);

    // Brief visual feedback
    toast('✋ Interrupted', { duration: 1000 });
  }, [stopStreamingVoice]);

  // 🛡️ VOICE WATCHDOG - Automatic recovery from stuck states
  // Two-tier timeout:
  //   - AUDIO tier (90s): If isAudioPlaying is true but no audio progress
  //     for 90s, audio pipeline is broken. Kokoro TTS can take 60+ seconds
  //     for long responses, so 15s was far too aggressive.
  //   - PROCESSING tier (120s): If isResponding/isMicrophonePaused but NOT
  //     isAudioPlaying for 120s, the LLM or TTS generation is stuck.
  const voiceWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioProgressRef = useRef<number>(Date.now());
  // Ref so interval callback always sees current text-streaming state (avoids stale closure)
  const isStreamingVoiceRef_wd = useRef(isStreamingVoice);
  useEffect(() => { isStreamingVoiceRef_wd.current = isStreamingVoice; }, [isStreamingVoice]);

  // 🔥 FIX: Reset progress timer at TURN START so idle time before this turn doesn't count.
  // Without this, lastAudioProgressRef holds the mount timestamp. After long idle (50+ min),
  // timeSinceProgress is already huge — the watchdog fires within the first check of a new
  // turn before TTS audio can realistically arrive (~4s observed). This caused a split-brain
  // state where the watchdog reset mid-turn and audio then arrived into a broken state machine.
  const prevMicPausedForWatchdogRef = useRef(false);
  useEffect(() => {
    if (isMicrophonePaused && !prevMicPausedForWatchdogRef.current) {
      lastAudioProgressRef.current = Date.now();
      console.log('[voice:watchdog] Turn start - reset progress timer');
    }
    prevMicPausedForWatchdogRef.current = isMicrophonePaused;
  }, [isMicrophonePaused]);

  useEffect(() => {
    // Only run watchdog in voice mode
    // NOTE: Chat visibility removed from gate — voice intent (streamingVoiceMode)
    // is the correct authority. Watchdog must guard voice lifecycle regardless of
    // whether chat is visible or hidden.
    if (!streamingVoiceMode) {
      if (voiceWatchdogRef.current) {
        clearInterval(voiceWatchdogRef.current);
        voiceWatchdogRef.current = null;
      }
      return;
    }

    // Update last audio progress when audio is actually playing
    if (isAudioPlaying) {
      lastAudioProgressRef.current = Date.now();
    }

    const AUDIO_STUCK_TIMEOUT_MS = 90000;    // 90s — audio playing but no progress
    const PROCESSING_STUCK_TIMEOUT_MS = 120000; // 120s — waiting for TTS/LLM
    const WATCHDOG_CHECK_MS = 5000;            // Check every 5 seconds

    if (!voiceWatchdogRef.current) {
      voiceWatchdogRef.current = setInterval(() => {
        const audioPlaying = isAudioPlayingRef.current;
        const processingOrPaused = isRespondingRef.current || isMicrophonePausedRef.current;
        const timeSinceProgress = Date.now() - lastAudioProgressRef.current;

        // Tier 1: Audio is "playing" but no progress for 90s — pipeline broken
        if (audioPlaying && timeSinceProgress > AUDIO_STUCK_TIMEOUT_MS) {
          console.warn('🐕 [WATCHDOG] Audio stuck for', Math.round(timeSinceProgress/1000), 's - forcing reset');
          forceWatchdogReset('audio_stuck');
          return;
        }

        // Tier 2: Processing/paused but no audio started — LLM/TTS stuck
        if (processingOrPaused && !audioPlaying && timeSinceProgress > PROCESSING_STUCK_TIMEOUT_MS) {
          // If text is still streaming, the LLM is healthy — TTS is just slow.
          // Defer instead of force-resetting to avoid corrupting a healthy turn.
          if (isStreamingVoiceRef_wd.current) {
            console.log('[voice:watchdog:deferred] Text still streaming - TTS pending, extending window', {
              timeSinceProgressMs: Math.round(timeSinceProgress),
            });
            lastAudioProgressRef.current = Date.now();
            return;
          }
          console.warn('🐕 [WATCHDOG] Processing stuck for', Math.round(timeSinceProgress/1000), 's (no audio ever arrived) - forcing reset', {
            isTextStreaming: isStreamingVoiceRef_wd.current,
          });
          forceWatchdogReset('processing_stuck');
          return;
        }
      }, WATCHDOG_CHECK_MS);
    }

    function forceWatchdogReset(reason: string) {
      // Force reset all voice state
      isAudioPlayingRef.current = false;
      isRespondingRef.current = false;
      isMicrophonePausedRef.current = false;

      setIsAudioPlaying(false);
      setIsResponding(false);
      setIsMicrophonePaused(false);
      setIsListening(true);
      setIsActivating(false);

      // Reset the progress timer
      lastAudioProgressRef.current = Date.now();

      // Actually restart the mic
      if (voiceSession.state.capabilities.canStartListening) {
        console.log(`🐕 [WATCHDOG] Force-restarting microphone (${reason})...`);
        if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('watchdog_recovery');
      }

      toast('⚠️ Voice recovered', { duration: 2000 });
    }

    return () => {
      if (voiceWatchdogRef.current) {
        clearInterval(voiceWatchdogRef.current);
        voiceWatchdogRef.current = null;
      }
    };
  }, [streamingVoiceMode, showChatInterface, isAudioPlaying]);

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

  // 💾 SOVEREIGN CONVERSATION PERSISTENCE: Load history and restore the thread.
  //
  // CONTINUITY INVARIANT (load-bearing — do not "optimize" back into flag-gated restore):
  //   The thread cannot disappear in order to preserve the thread.
  //
  // If real messages exist for this session+user, the UI restores them — regardless of how
  // the user arrived (SPA navigation, browser back, deeplink, refresh, new tab). Restoration
  // is NOT gated by the `maia_nav_teardown` sessionStorage flag any more — that gate made
  // return-path dependent, so a capture surface or world doorway could silently destroy the
  // thread it was invited to honor.
  //
  // Welcome overlay reaches its correct condition through `loadedMessages.length === 0`,
  // which is produced by explicit new-session actions (handleStartSession,
  // handleStartNewSession) that clear localStorage. Fresh starts are deliberate, not accidental.
  //
  // The seam on restore must be invisible: no "restored your session" notice, no welcome
  // header, no scroll reset.
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId || !userId) return;

    const loadConversationHistory = async () => {
      const storageKey = `maia_conversation_${sessionId}`;
      let loadedMessages: ConversationMessage[] = [];

      // Step 1: Try localStorage first (instant load for same device)
      const localStored = localStorage.getItem(storageKey);
      if (localStored) {
        try {
          const parsedMessages = JSON.parse(localStored);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            loadedMessages = parsedMessages;
            console.log(`💾 [localStorage] Loaded ${loadedMessages.length} messages for MAIA context (UI starts fresh)`);
          }
        } catch (error) {
          console.error('💾 [localStorage] Failed to parse stored messages:', error);
          localStorage.removeItem(storageKey);
        }
      }

      // Step 2: Check PostgreSQL for more recent/complete history
      try {
        const response = await apiFetch(`/api/conversation/turns?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages && data.messages.length > 0) {
            // Convert PostgreSQL format
            const pgMessages: ConversationMessage[] = data.messages.map((m: any) => ({
              id: m.id || `pg-${Date.now()}-${Math.random()}`,
              role: m.role === 'assistant' ? 'oracle' : m.role,
              text: m.content,
              timestamp: new Date(m.createdAt),
              source: 'restored'
            }));

            // Use PostgreSQL if it has more messages
            if (pgMessages.length > loadedMessages.length) {
              loadedMessages = pgMessages;
              console.log(`💾 [PostgreSQL] Loaded ${pgMessages.length} messages for MAIA context`);
              // Sync to localStorage for faster next load
              localStorage.setItem(storageKey, JSON.stringify(pgMessages.slice(-50)));
            }
          }
        }
      } catch (error) {
        console.error('💾 [PostgreSQL] Failed to load messages:', error);
      }

      // Consume the legacy teardown flag if present so it doesn't accumulate in sessionStorage.
      // The flag is no longer used to gate restoration — see CONTINUITY INVARIANT header above.
      // Setter sites elsewhere in this file are now no-ops; cleanup of those is a follow-up.
      sessionStorage.removeItem('maia_nav_teardown');

      // Always populate historicalRef so MAIA has full context regardless of display mode
      historicalMessagesRef.current = loadedMessages;

      if (loadedMessages.length > 0) {
        const hasRealMessages = loadedMessages.some(m => !m.id?.startsWith('greeting-'));

        if (hasRealMessages) {
          // Restore the thread. Invisible seam — no welcome overlay, no "restored" notice.
          sessionRestoredRef.current = true;
          setHasActivated(true);
          setMessages(loadedMessages);
          // Mark the restored thread as ALREADY synced. Without this the sync
          // effect starts from 0, treats the whole restored transcript as new,
          // and re-POSTs it to /api/conversation/turns on every mount — the
          // insert has no idempotency key, so the stored thread grew on every
          // refresh and came back multiplied on the next restore.
          lastSyncedCountRef.current = loadedMessages.length;
          console.log(`💾 [Context] Restored ${loadedMessages.length} messages to UI`);
        } else {
          console.log(`💾 [Context] Only greeting messages found — UI starts fresh`);
        }
      } else {
        console.log(`💾 [Context] No previous messages for this session`);
      }
    };

    loadConversationHistory();
  }, [sessionId, userId]);

  // 💾 SOVEREIGN PERSISTENCE: Save to localStorage (instant) + PostgreSQL (async sync)
  // Track last synced message count to avoid duplicate saves
  const lastSyncedCountRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId || !userId || messages.length === 0) return;

    const storageKey = `maia_conversation_${sessionId}`;

    // Keep only the most recent 50 messages to avoid localStorage bloat.
    // 🔁 Recovery seam: strip delivery markers — they are live UI state only
    // (Kelly ruling 2026-07-24: preserved "as long as conversation state remains
    // mounted"), so a reload can't resurrect a stuck "Sending…" or stale marker.
    const messagesToStore = stripDelivery(messages.slice(-50));

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

    // STEP 2: Save to PostgreSQL asynchronously (for sovereign cross-device sync)
    // Save when we have new messages (check if count increased by at least 2 = one exchange)
    const messageCount = messages.length;
    const shouldSyncToPostgres = messageCount >= lastSyncedCountRef.current + 2;

    if (shouldSyncToPostgres) {
      // Find the new messages since last sync
      const newMessages = messages.slice(lastSyncedCountRef.current);

      // Look for user-oracle pairs to save
      for (let i = 0; i < newMessages.length - 1; i++) {
        const msg = newMessages[i];
        const nextMsg = newMessages[i + 1];

        // Save user + oracle exchange pairs
        if (msg.role === 'user' && (nextMsg.role === 'oracle' || nextMsg.role === 'assistant')) {
          // Non-blocking async save
          apiFetch('/api/conversation/turns', {
            method: 'POST',
            body: JSON.stringify({
              userMessage: msg.text,
              assistantMessage: nextMsg.text,
              userId,
              sessionId,
              isSanctuary,
              // 🧱 F1: when this pair came from the sovereign path, the server already
              // wrote both halves durably under this id — reusing it makes this write
              // an idempotent no-op rather than a second exchange. Pairs from other
              // paths carry no id and behave exactly as before.
              exchangeId: msg.metadata?.exchangeId,
            }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log(`💾 [PostgreSQL] Synced exchange to sovereign database`);
              }
            })
            .catch(err => console.error('💾 [PostgreSQL] Sync failed (non-blocking):', err));

          i++; // Skip the oracle message we just paired
        }
      }

      lastSyncedCountRef.current = messageCount;
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

    // 🎯 DEBUG: Log initial greeting state on mount
    console.log('🎯 [GREETING DEBUG] Component MOUNTED - initial state:', {
      messagesLength: 0, // Always starts empty before restoration
      isProcessing: false,
      isResponding: false,
      note: 'Messages will be restored from localStorage next'
    });

    // Initialize stable explorer ID for cross-session memory
    const stableId = getOrCreateExplorerId();
    setExplorerId(stableId);
    console.log('🧠 [Identity] Explorer ID initialized:', stableId);

    trackEvent('session_start', { userId: userId || 'anonymous', sessionId });

    // AUTO-START FIX: Borrow the shared AudioContext from ios-audio-session
    // (already unlocked via first-gesture handler, single instance per session)
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = getSharedAudioContext();
        console.log('✅ Shared AudioContext initialized on mount, state:', audioContextRef.current.state);
      } catch (err) {
        console.warn('⚠️ Could not get shared AudioContext on mount:', err);
      }
    }

    // Track real user activity
    const trackingUserId = userId || `anon_${sessionId}`;
    const trackingUserName = userName || 'Anonymous User';
    userTracker.trackUserRegistration(trackingUserId, trackingUserName);

    // Detect iOS for audio requirements (includes iPads in desktop mode)
    const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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

    // iOS Audio Permission - Show on iOS devices only (not desktop Safari)
    // This is required for TTS playback on iOS Safari/Chrome/PWA
    if (isIOS && !isIOSAudioEnabled) {
      setNeedsIOSAudioPermission(true);
      console.log('📱 iOS detected - audio permission prompt shown', { isIOS, isIOSSafari });
    }

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

      // 🌱 Compute developmental tier for age-appropriate constraints
      const tier = computeTierFromAge(userAge);
      const tierConfig = getTierConfig(tier);
      console.log(`🌱 Developmental tier: ${tier} (${tierConfig.label}), max session: ${tierConfig.maxSessionMinutes}min`);
      setYouthMaxSessionMinutes(tierConfig.maxSessionMinutes);
      setYouthTierLabel(tierConfig.label);

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
    const computedDaysSinceLastVisit = lastSessionDate
      ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Store in state for welcome screen
    setDaysSinceLastVisit(computedDaysSinceLastVisit);

    // Check if returning user
    setIsReturningUser(!isFirstVisit && computedDaysSinceLastVisit > 0);

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
            lastSeenDays: computedDaysSinceLastVisit,
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
      // 🎯 Use resolveDisplayName() to get actual name from localStorage
      // This avoids race condition where userName prop hasn't been updated yet
      const resolvedName = resolveDisplayName();
      console.log('🎯 [GREETING] Resolved display name:', resolvedName);

      if (shouldAskOnboarding) {
        // Remove flag after checking
        sessionStorage.removeItem('maia_should_ask_onboarding');

        // Generate onboarding question greeting instead of standard greeting
        greetingData = await generateOnboardingGreeting({
          userName: resolvedName,
          userId: userId,
          isFirstVisit,
          partnerContext: onboardingContext?.partnerContext || 'general'
        });
      } else {
        greetingData = await generateGreeting({
          userName: resolvedName,
          userId: userId, // Pass userId for soul-level recognition
          isFirstVisit,
          daysSinceLastVisit: computedDaysSinceLastVisit,
          daysActive: computedDaysSinceLastVisit > 0 ? 7 : 1,
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

      // Only initialize with greeting if messages weren't already restored from storage
      // (prevents the greeting from overwriting an existing conversation on same-session navigation)
      //
      // ARRIVAL OWNS THE CEREMONIAL GREETING — but only when Arrival is actually
      // on screen. When the arrival composition is the entry surface it has
      // already greeted the member by name, above the jewel. Seeding the same
      // greeting into the transcript made MAIA appear to greet twice — once
      // ceremonially, then again as a chat turn the instant the field cleared.
      //
      // This guard reads `shouldRenderArrival`, NOT `featureFlags.arrivalEntry`.
      // The flag is default-ON for every member; only a first-time member or one
      // returning deliberately from The House actually meets Arrival. Keying the
      // suppression to the flag silenced the transcript greeting for returning
      // members, whose surface is the greeting — it is the only welcome they get.
      if (!sessionRestoredRef.current && !shouldRenderArrival) {
        setMessages([greetingMessage]);
      }
      localStorage.setItem('lastSessionDate', new Date().toISOString());
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 🔊 AUDIO UNLOCK RECOVERY: Listen for failed playback attempts from StreamingAudioQueue
  // When all retry attempts fail (iOS NotAllowedError/AbortError), the queue dispatches
  // 'maya-audio-unlock-needed'. We show a tap-to-unlock UI so the user can re-enable audio
  // with a gesture, preventing the silent-freeze bug in listening mode.
  useEffect(() => {
    const handleAudioUnlockNeeded = () => {
      console.warn('⚠️ [OracleConversation] Audio unlock needed - streaming playback failed');
      setShowAudioUnlockUI(true);
      // Reset voice state so the app doesn't appear frozen
      setIsAudioPlaying(false);
      setIsResponding(false);
      setIsMicrophonePaused(false);
      isProcessingRef.current = false;
      isRespondingRef.current = false;
      isAudioPlayingRef.current = false;
      isMicrophonePausedRef.current = false;
      toast('Audio playback interrupted — tap to re-enable', {
        icon: '🔇',
        duration: 5000,
        position: 'top-center',
      });
    };

    window.addEventListener('maya-audio-unlock-needed', handleAudioUnlockNeeded);
    return () => {
      window.removeEventListener('maya-audio-unlock-needed', handleAudioUnlockNeeded);
    };
  }, []);

  // ---- TEMPORARY DIAGNOSTIC (Issue 1 follow-up, #731) ----
  // #731 shipped the re-settle mechanism below and it did NOT resolve the
  // reported gap on physical device (Safari and Chrome-for-iOS, repeated
  // across separate windows). Rather than guess a second fix from more
  // screenshots, this prints a short rolling log of the actual viewport
  // and scroll numbers directly on screen, gated behind ?debugScroll=1 so
  // it never renders for members. Remove once the real failing transition
  // is captured with numbers instead of inferred from a gap in a photo.
  const scrollDebugEnabled =
    typeof window !== 'undefined' && window.location.search.includes('debugScroll');
  const [scrollDebugLog, setScrollDebugLog] = useState<string[]>([]);
  const scrollDebugStartRef = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : 0
  );
  const scrollDebugLastPushRef = useRef(0);
  const transcriptScrollElRef = useRef<HTMLDivElement>(null);

  const pushScrollDebug = (label: string, opts: { throttle?: boolean } = {}) => {
    if (!scrollDebugEnabled) return;
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    if (opts.throttle && now - scrollDebugLastPushRef.current < 150) return;
    scrollDebugLastPushRef.current = now;
    const t = Math.round(now - scrollDebugStartRef.current);
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    const el = transcriptScrollElRef.current;
    const gap = el ? el.scrollHeight - el.scrollTop - el.clientHeight : null;
    const line =
      `+${t}ms ${label} | vv(top=${vv ? Math.round(vv.offsetTop) : '?'},h=${vv ? Math.round(vv.height) : '?'}) ` +
      `box(st=${el ? Math.round(el.scrollTop) : '?'},sh=${el ? Math.round(el.scrollHeight) : '?'},` +
      `ch=${el ? Math.round(el.clientHeight) : '?'},gap=${gap !== null ? Math.round(gap) : '?'}) ` +
      `nearBottom=${wasNearBottomRef.current}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- diagnostic only, intentionally reads refs
    setScrollDebugLog(prev => [line, ...prev].slice(0, 10));
  };

  // MOBILE BOTTOM-ANCHOR RESERVE (Issue 1, third mechanism — independent of
  // the scroll-resettle guard (#739/#741) and the bottom-anchor layout
  // itself (#740)).
  //
  // #740 correctly bottom-anchors short conversations, but its trailing
  // `pb-48`/`md:pb-60` (192px/240px) is a founder rule (commit fbf7a7295,
  // 2026-07-23: "the conversation must never end inside the footer's
  // airspace") sized for a long thread scrolled to its true end. Once
  // `justify-end` also owns the short-conversation case, that same reserve
  // becomes an unconditional gap between the newest message and the
  // composer even when there's no long thread to protect against — not a
  // bug, a rule applied to a case it wasn't sized for.
  //
  // FIX: the reserve is conditional, not constant. Long/overflowing
  // content keeps the full founder reserve at the natural scroll end.
  // Short/non-overflowing content gets a small breathing gap instead. The
  // reserve moves from wrapper padding (always applied) to a trailing flex
  // child rendered only when earned (see the JSX below).
  //
  // CRITICAL: `contentOverflows` is measured against INTRINSIC content
  // height — the messages alone, via `messageContentIntrinsicRef`, which
  // never includes the reserve div. Measuring against a container whose
  // own scrollHeight already contains the reserve would let the reserve
  // prove its own necessity (reserve adds height -> now "overflows" ->
  // reserve stays applied -> ...) or flip-flop at the boundary.
  const OVERFLOW_EPSILON_PX = 4;
  const [contentOverflows, setContentOverflows] = useState(false);
  const messageContentIntrinsicRef = useRef<HTMLDivElement>(null);

  const recomputeContentOverflow = () => {
    const intrinsic = messageContentIntrinsicRef.current;
    const viewport = transcriptScrollElRef.current;
    if (!intrinsic || !viewport) return;
    const overflows = intrinsic.scrollHeight > viewport.clientHeight + OVERFLOW_EPSILON_PX;
    setContentOverflows(prev => (prev === overflows ? prev : overflows));
  };

  // Re-observe whenever the transcript mounts/unmounts (messages.length
  // flips 0<->positive) — the observer then tracks all further height
  // changes to the SAME node (new turns, streaming text growing in place
  // without changing the `messages` array reference, images loading)
  // without needing to reattach on every message.
  useEffect(() => {
    const intrinsic = messageContentIntrinsicRef.current;
    if (!intrinsic || typeof ResizeObserver === 'undefined') {
      recomputeContentOverflow();
      return;
    }
    const observer = new ResizeObserver(() => recomputeContentOverflow());
    observer.observe(intrinsic);
    recomputeContentOverflow();
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length > 0]);

  // TRANSCRIPT ⇄ COMPOSER CLEARANCE (founder direction 2026-07-28: "the text
  // field needs to be expanded as much as possible").
  //
  // The transcript container ends at a FIXED 220px (voice) / 260px (chat)
  // above the viewport bottom (#703 made that clearance authoritative).
  // Device measurement (House diagnosis, 2026-07-26/27) showed the composer
  // stack occupies substantially less than that band, so the difference
  // rendered as a permanent empty belt between the newest message and the
  // composer — on a phone-height viewport, a large share of the possible
  // reading window.
  //
  // The clearance is now DERIVED from the live composer's measured top
  // edge: the transcript ends TRANSCRIPT_COMPOSER_GAP_PX above whatever the
  // composer actually is (voice bar or chat input, either mode, any
  // device), and the two can no longer drift apart as controls change. The
  // old fixed values remain only as the pre-measurement fallback.
  //
  // Ruled constraint preserved: NO visualViewport and NO dvh units in this
  // geometry — getBoundingClientRect() and window.innerHeight are
  // layout-viewport reads, the same coordinate space the fixed containers
  // position in.
  const TRANSCRIPT_COMPOSER_GAP_PX = 12;
  const [composerClearancePx, setComposerClearancePx] = useState<number | null>(null);
  const chatComposerRef = useRef<HTMLDivElement>(null);
  const voiceBarWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The voice bar mounts as the first child of its visibility wrapper
    // (the wrapper has zero layout footprint — the bar is position:fixed),
    // so the wrapper ref is a stable attach point that doesn't require
    // threading a forwardRef through VoiceInteractionBar.
    const el = showChatInterface
      ? chatComposerRef.current
      : (voiceBarWrapRef.current?.firstElementChild as HTMLElement | null);
    if (!el) {
      setComposerClearancePx(null);
      return;
    }
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return; // not laid out yet
      const clearance =
        Math.round(window.innerHeight - rect.top) + TRANSCRIPT_COMPOSER_GAP_PX;
      // Sanity band: a keyboard-displaced or mid-transition composer must
      // not collapse the transcript to nothing (clearance approaching the
      // viewport height) or go negative — outside the band, keep the last
      // good value rather than adopt a transient one.
      if (clearance <= 0 || clearance > window.innerHeight * 0.6) return;
      setComposerClearancePx(prev => (prev === clearance ? prev : clearance));
    };
    measure();
    const composerObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    composerObserver?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      composerObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
    // The composer subtrees these refs point at mount/unmount with each of
    // these flags, so each must re-run the attach.
  }, [showChatInterface, isMounted, voiceEnabled, shouldRenderArrival]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    recomputeContentOverflow();
    pushScrollDebug(`messages-effect(count=${messages.length}, smooth)`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Re-settle the transcript after keyboard-driven viewport changes.
  //
  // BUG: the effect above only re-runs on `messages` changes. If a reply
  // streams in while the keyboard is open, it settles against that
  // moment's (keyboard-constrained) container height. When the keyboard
  // later closes, `bottom: 260px` (line ~8165) resolves against the taller
  // closed-keyboard viewport and the container grows — but nothing re-runs
  // the scroll, so the old "bottom" position is now short of the real
  // bottom, stranding the reply near the top with dead space beneath it.
  // This is a stale-scroll correction, not another keyboard-offset fix —
  // the `bottom: 260px` geometry itself is untouched.
  //
  // GUARD, corrected after device evidence (2026-07-24): the first version
  // of this guard tracked only a boolean ("was the member near the bottom
  // last time onScroll fired"), with no expiry. Device logs showed this
  // boolean going false once — from a single scroll-up — and then staying
  // false for 5+ minutes across THREE separate keyboard open/close cycles,
  // silently skipping every one of them. A "measure fresh instead of
  // trusting the stale ref" fix would NOT have helped: the container's own
  // geometry (scrollTop/scrollHeight/clientHeight) doesn't change when the
  // keyboard opens or closes — only visualViewport does — so a fresh read
  // at resize time reaches the exact same "not near bottom" verdict the
  // stale ref already had. The real question isn't stale-vs-fresh
  // geometry; it's whether an old scroll-away should stay authoritative
  // forever. It shouldn't: a DELIBERATE, RECENT scroll-up (reading back
  // through history) must still be respected — but it must not become a
  // permanent veto on every future keyboard transition, indefinitely,
  // regardless of how much time or how many keyboard cycles pass.
  //
  // So this now tracks two independent things: current position
  // (`wasNearBottomRef`, via onScroll, unchanged) and *when the member
  // last actually touched the scroll surface themselves*
  // (`lastUserScrollAtRef`, via touchstart/wheel — NOT the `scroll` event
  // itself, since our own `scrollIntoView` calls also fire `scroll` and
  // must not be mistaken for member intent). A scroll-away only blocks
  // correction while it's both currently away from bottom AND recent.
  const wasNearBottomRef = useRef(true);
  const NEAR_BOTTOM_THRESHOLD_PX = 60;
  const lastUserScrollAtRef = useRef(0);
  // Heuristic, not a proven-optimal value: long enough to cover "member is
  // actively reading back through history while typing," short enough that
  // an old scroll-away from minutes ago stops blocking new replies from
  // settling correctly. Tune if device evidence calls for it.
  const RECENT_USER_SCROLL_MS = 10_000;

  // DIAGNOSTIC MARKER (2026-07-24 follow-up, physical-device defect).
  // Device evidence showed `scrollAwayMs=1784921085077` — a raw
  // `Date.now()` value, proving `lastUserScrollAtRef` never left its
  // default `0` on physical iOS. Every resize check therefore read
  // "infinitely stale," and the recent-scroll-away branch was
  // unreachable: not a verified guard, a defective one. No `SKIPPED` line
  // ever appeared in that device session.
  //
  // This marker must appear in the debug log for a gesture to be
  // trusted — if a later SKIPPED/RESETTLED line has no preceding
  // USER-SCROLL-INTENT line, the timestamp still isn't being set. Logs
  // `event.target` (where the gesture actually started) against
  // `transcriptScrollElRef.current` (the element onScroll/box() geometry
  // is read from) — structurally these are the same JSX node here, so
  // `sameElement` should read `true`; if it doesn't, that's the wrapper/
  // nested-scroll-owner mismatch to chase. `pointerdown` is the primary
  // mobile signal (fires on contact, before Safari's own gesture/momentum
  // recognition can intervene); `touchstart`/`wheel` remain as a
  // cross-check and the desktop/trackpad path respectively.
  const markUserScrollIntent = (source: string, target: EventTarget | null) => {
    lastUserScrollAtRef.current = Date.now();
    if (!scrollDebugEnabled) return;
    const refEl = transcriptScrollElRef.current;
    const targetEl = target instanceof HTMLElement ? target : null;
    const sameElement = targetEl === refEl;
    const targetGeom = targetEl
      ? `st=${Math.round(targetEl.scrollTop)},sh=${Math.round(targetEl.scrollHeight)},ch=${Math.round(targetEl.clientHeight)}`
      : 'no-target';
    const refGeom = refEl
      ? `st=${Math.round(refEl.scrollTop)},sh=${Math.round(refEl.scrollHeight)},ch=${Math.round(refEl.clientHeight)}`
      : 'no-ref';
    pushScrollDebug(
      `USER-SCROLL-INTENT(${source}, sameElement=${sameElement}) | target(${targetGeom}) ref(${refGeom})`
    );
  };

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;

    let pendingFrame: number | null = null;

    const resettle = () => {
      pendingFrame = null;
      const scrollAwayMs = Date.now() - lastUserScrollAtRef.current;
      const recentDeliberateScrollAway = !wasNearBottomRef.current && scrollAwayMs < RECENT_USER_SCROLL_MS;
      if (recentDeliberateScrollAway) {
        pushScrollDebug(`vv-resize-SKIPPED(recent-user-scroll-away, ${scrollAwayMs}ms)`);
        return;
      }
      // behavior: 'auto', not 'smooth' — this fires alongside the keyboard's
      // own show/hide animation, and a competing smooth scroll produces
      // visible bounce. Smooth stays reserved for genuinely new messages.
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      pushScrollDebug(`vv-resize-RESETTLED(auto, scrollAwayMs=${scrollAwayMs})`);
    };

    const handleViewportResize = () => {
      pushScrollDebug('vv-resize-fired');
      // The keyboard opening/closing changes the SCROLL VIEWPORT's own
      // clientHeight, which is one of contentOverflow's two inputs — a
      // conversation that fit before the keyboard opened may no longer
      // fit (or vice versa) purely from that height change, independent
      // of any message content change.
      recomputeContentOverflow();
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      pendingFrame = requestAnimationFrame(resettle);
    };

    vv.addEventListener('resize', handleViewportResize);
    return () => {
      vv.removeEventListener('resize', handleViewportResize);
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the derived composer clearance changes, the transcript container's
  // height changes with it — re-settle to the newest message so the reply
  // doesn't strand mid-thread, unless the member is deliberately reading
  // back through history (same intent signal the vv re-settle respects).
  useEffect(() => {
    if (composerClearancePx == null) return;
    if (!wasNearBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    pushScrollDebug(`clearance-resettle(${composerClearancePx}px)`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composerClearancePx]);

  // Poll the capture heartbeat while we believe we are listening.
  //
  // A poll rather than a timeout because the question is "have frames stopped",
  // and the absence of an event cannot itself schedule anything. The interval
  // exists only while listening, so an idle app does no work.
  useEffect(() => {
    if (!isListening) {
      setCaptureStalled(false);
      return;
    }
    const tick = () => {
      const stalled = isCaptureStalled({
        now: Date.now(),
        lastFrameAt: lastAudioFrameAtRef.current,
        listening: true,
        armedAt: captureArmedAtRef.current,
      });
      setCaptureStalled(prev => {
        if (prev === stalled) return prev;
        if (stalled) {
          console.warn(
            `🔇 [capture] No audio frames for ${CAPTURE_STALL_MS}ms while listening — surfacing mic-not-responding`
          );
        }
        return stalled;
      });
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isListening]);

  // Smooth audio level changes for accessibility (prevents flashing from sudden spikes)
  useEffect(() => {
    const smoothingFactor = 0.3; // Lower = smoother, slower response
    setSmoothedAudioLevel(prev => prev * (1 - smoothingFactor) + voiceAudioLevel * smoothingFactor);
  }, [voiceAudioLevel]);

  // REMOVED: Old formant voice engine state subscription
  // Voice amplitude is now controlled directly by OpenAI Alloy TTS in maiaSpeak()
  // and by audio level monitoring in handleAudioLevelChange()

  // Detect capture trigger for "Capture the Spirit" suggestion
  useEffect(() => {
    if (messages.length < 4) return; // Need some conversation depth
    if (showCaptureSuggestion || captureSuggestionDismissed || showCapturePanel) return;

    // Check last MAIA message for capture triggers
    const lastMaiaMessage = [...messages].reverse().find(msg => msg.role === 'oracle');
    if (lastMaiaMessage) {
      const content = lastMaiaMessage.text || lastMaiaMessage.content || '';
      if (detectCaptureTrigger(content)) {
        console.log('✨ [Capsule] Capture trigger detected, showing suggestion');
        setShowCaptureSuggestion(true);
      }
    }
  }, [messages, showCaptureSuggestion, captureSuggestionDismissed, showCapturePanel]);

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

  // Listen for conversation style preference changes (agentConfig only)
  // Voice settings (setVoiceSettings) are handled by the maia-account-settings-changed
  // listener above — do NOT duplicate that logic here to avoid feedback loops.
  useEffect(() => {
    const handleStorageChange = () => {
      const savedVoice = localStorage.getItem('selected_voice');
      const newConfig = getAgentConfig(savedVoice || undefined);
      setAgentConfig(newConfig);
      console.log('🎭 Agent config updated:', newConfig.voice);
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

      setMessages(prev => appendMessageCapped(prev, acknowledgmentMessage));
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

  // 🚫 AUTO-START DISABLED - User must click holoflower to initiate voice
  // This prevents the "blinking listening" issue and gives users control over when to speak
  // Voice is started via handleHoloflowerClick() when user clicks the holoflower

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

        // 🔥 FIX: Hard timeout of 45s even if isAudioPlaying is true
        // No MAIA response should take 45+ seconds. If isAudioPlaying is stuck true
        // without actually playing audio, we need to force reset.
        const isHardTimeout = timeSinceActivation >= 45000;

        // If audio is still playing AND we haven't hit hard timeout, states SHOULD be active
        if (currentIsAudioPlaying && !isHardTimeout) {
          console.log(`✅ [${sessionId}] Audio still playing - states are working correctly, no recovery needed`);
          return;
        }

        // Hard timeout triggered - audio state is stuck
        if (currentIsAudioPlaying && isHardTimeout) {
          console.warn(`🚨 [${sessionId}] HARD TIMEOUT: isAudioPlaying stuck true for ${Math.round(timeSinceActivation/1000)}s - forcing reset!`);
          resetAllStates();
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
          setMessages(prev => appendMessageCapped(prev, errorMessage));
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
  // Desktop only — see lib/ui/programmaticFocus.ts. Ungated, this would reopen
  // the defect after MAIA's first reply: the first tap works on a fresh launch,
  // then the refocus leaves the field falsely focused and no later tap raises
  // the keyboard. (Ruled in scope, Kelly 2026-08-01.)
  useEffect(() => {
    if (!canProgrammaticallyFocus()) return;
    if (showChatInterface && !isProcessing && !isResponding && textInputRef.current) {
      // Check if already focused to prevent iOS keyboard issues
      if (document.activeElement !== textInputRef.current) {
        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [showChatInterface, isProcessing, isResponding]); // isResponding covers text mode response completion

  // ── iOS PWA keyboard inset — COMPATIBILITY FALLBACK ONLY ───────────────────
  // The real fix is `interactiveWidget: 'resizes-content'` (app/layout.tsx),
  // which shrinks the layout viewport so the fixed composer rides above the
  // keyboard. Where that is not honoured the layout viewport stays full height
  // and the composer is left behind the keys, so we measure the covered gap and
  // lift the composer by exactly that much.
  //
  // Self-neutralising by construction: when resizes-content IS honoured,
  // innerHeight shrinks in step with visualViewport.height, the computed inset
  // is 0, and this writes nothing. It is never a second positioning system
  // competing with the first.
  //
  // Written to a CSS custom property rather than React state deliberately —
  // state would re-render the entire conversation on every keyboard resize event.
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : undefined;
    if (!vv) return;

    const root = document.documentElement;
    let frame = 0;
    let applied = -1;

    const apply = () => {
      frame = 0;
      // While the member is pinch-zoomed the visual viewport is smaller for
      // reasons that have nothing to do with the keyboard. Zoom is a supported
      // accessibility path (maximumScale: 5) — leave positioning to the browser.
      const zoomed = vv.scale > 1.01;
      const gap = window.innerHeight - (vv.height + vv.offsetTop);
      const next = !zoomed && gap > 1 ? Math.round(gap) : 0;
      if (next === applied) return; // no write → no style recalculation
      applied = next;
      root.style.setProperty('--composer-keyboard-inset', `${next}px`);
    };

    // Coalesce bursts of resize/scroll events into a single write per frame.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
      root.style.removeProperty('--composer-keyboard-inset');
    };
  }, []);

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

  // Listen for Lab Actions dispatched from page.tsx
  useEffect(() => {
    const handleLabAction = (e: Event) => {
      const ce = e as CustomEvent<{ action: string }>;
      const action = ce.detail?.action;
      if (!action) return;

      console.log('🔬 [LabAction] Received from page:', action);

      // Route to appropriate handler
      if (action === 'open-prompt-picker') {
        console.log('🔬 [LabAction] Opening prompt picker');
        setShowPromptPicker(true);
        return;
      }

      if (action === 'show-session-arc') {
        console.log('🔬 [LabAction] Show session arc - handled by FloatingSessionIndicator');
        // Session arc is displayed via the FloatingSessionIndicator component
        return;
      }

      if (action === 'show-session-synthesis') {
        console.log('🔬 [LabAction] Generating session synthesis');
        if (messages.length > 0) {
          setSessionSynthesisData({
            patterns: ['Pattern detection in progress...'],
            invitation: 'Continue exploring what emerged in this conversation.',
            savedToMemory: !isSanctuary,
            durationMinutes: sessionTimer?.getElapsedMinutes?.() || undefined
          });
          setShowSessionSynthesis(true);
        }
        return;
      }

      if (action === 'session-recap') {
        console.log('🔬 [LabAction] Generating session recap');
        if (messages.length > 0) {
          setSessionRecapData({
            duration: sessionTimer?.getElapsedMinutes?.() || Math.floor(messages.length / 2),
            messageCount: messages.length,
            themes: ['Self-reflection', 'Growth'],
            elements: {
              fire: 0.3,
              water: 0.5,
              earth: 0.4,
              air: 0.6,
              aether: 0.2
            },
            invitation: 'Continue reflecting on what emerged today.'
          });
          setShowSessionRecap(true);
        }
        return;
      }

      if (action === 'daily-checkin') {
        console.log('🔬 [LabAction] Opening daily check-in');
        setShowDailyCheckin(true);
        return;
      }

      if (action === 'element-discovery') {
        console.log('🔬 [LabAction] Opening element discovery');
        setShowElementDiscovery(true);
        return;
      }

      if (action === 'toggle-vocabulary-tooltips') {
        const newValue = !enableVocabularyTooltips;
        setEnableVocabularyTooltips(newValue);
        localStorage.setItem('maia.vocabularyTooltips', String(newValue));
        console.log('🔬 [LabAction] Vocabulary tooltips:', newValue);
        return;
      }

      if (action === 'choose-guide') {
        console.log('🔬 [LabAction] Opening wisdom council');
        setShowWisdomCouncil(true);
        return;
      }

      if (action === 'capture-spirit') {
        // Defer to allow state to settle after drawer close
        setTimeout(() => {
          if (handleCaptureSpiritRef.current) {
            handleCaptureSpiritRef.current();
          } else {
            console.error('❌ [LabAction] handleCaptureSpirit not available');
          }
        }, 100);
        return;
      }

      console.log('🔬 [LabAction] Unhandled action:', action);
    };

    window.addEventListener('labAction', handleLabAction as EventListener);
    return () => window.removeEventListener('labAction', handleLabAction as EventListener);
  }, [messages.length, isSanctuary, sessionTimer, enableVocabularyTooltips]);

  // Listen for Inner Lands "Talk to MAIA" events
  useEffect(() => {
    const handleInnerLandsAskMaia = (e: Event) => {
      const ce = e as CustomEvent<{ content: string }>;
      const content = ce.detail?.content || '';
      if (!content) return;

      console.log('🗺️ [InnerLands→MAIA] Received:', content);

      // Parse the structured context from Inner Lands
      let text: string;
      try {
        const ctx = JSON.parse(content);
        const { land, encounter } = ctx;

        // Format as a rich primer that gives MAIA full context
        text = `[Inner Lands: ${land.name}]

I'm at "${encounter.title}" — ${land.tagline.toLowerCase()}.

The setup: "${encounter.setup}"

The question it asks: "${encounter.prompt}"

---

MAIA, you said about this place: "${land.maiaQuote}"

I'm not sure what I'm noticing yet.`;
      } catch {
        // Fallback for old string format
        text = `[Inner Lands] ${content}

Not sure what I'm supposed to notice here.`;
      }

      // 1) Fill the composer immediately
      setComposerDraft(text);

      // 2) Show chat interface
      setShowChatInterface(true);

      // 3) Auto-send after UI settles
      setTimeout(() => {
        handleTextMessage(text);
        setComposerDraft('');
      }, 150);
    };

    window.addEventListener('innerLandsAskMaia', handleInnerLandsAskMaia as EventListener);
    return () => window.removeEventListener('innerLandsAskMaia', handleInnerLandsAskMaia as EventListener);
  }, []);

  // Handle domain prompt MAIA contact events
  useEffect(() => {
    const handleDomainAskMaia = (event: CustomEvent<{ content: string }>) => {
      const { content } = event.detail;

      // Build the context message for MAIA
      const text = `[Academy Domain]

${content}

---

I'm not sure what I'm feeling yet.`;

      // 1) Fill the composer immediately
      setComposerDraft(text);

      // 2) Show chat interface
      setShowChatInterface(true);

      // 3) Auto-send after UI settles
      setTimeout(() => {
        handleTextMessage(text);
        setComposerDraft('');
      }, 150);
    };

    window.addEventListener('domainAskMaia', handleDomainAskMaia as EventListener);
    return () => window.removeEventListener('domainAskMaia', handleDomainAskMaia as EventListener);
  }, []);

  // Update motion state based on voice activity
  // NOTE: isListening is controlled by handleRecordingStateChange (from ContinuousConversation)
  // and the holoflower click handler. DO NOT set isListening here based on userVoiceState
  // because that would hide the visualizer when the mic is listening but user hasn't spoken yet.
  useEffect(() => {
    if (userVoiceState?.isSpeaking) {
      setCurrentMotionState('listening');
    }
    // Don't set isListening to false here - that's controlled by the recording state
  }, [userVoiceState]);

  // Note: Voice amplitude is now driven by real-time audio analysis in startAudioAnalysis()

  // iOS PWA: Resume AudioContext on visibility change and user interaction
  // CRITICAL: Must check for BOTH 'suspended' AND 'interrupted' states!
  // iOS puts AudioContext in 'interrupted' state when audio session is taken by another source
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && audioContextRef.current) {
        const state = audioContextRef.current.state;
        if (state === 'suspended' || state === 'interrupted') {
          console.log(`📱 App returned to foreground, AudioContext ${state}, resuming...`);
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
      if (audioContextRef.current) {
        const state = audioContextRef.current.state;
        if (state === 'suspended' || state === 'interrupted') {
          try {
            await audioContextRef.current.resume();
            console.log(`✅ AudioContext resumed on user interaction (was ${state})`);
          } catch (error) {
            console.warn('Could not resume AudioContext:', error);
          }
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

  // 📱 iOS INTERRUPTION ROUTING — phone calls, Siri, BT route changes, backgrounding
  // Routes Capacitor app state events into ContinuousConversation's interruption handlers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Capacitor App plugin for background/foreground
    let appStateCleanup: (() => void) | undefined;
    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('appStateChange', (state: { isActive: boolean }) => {
          if (!state.isActive) {
            // App backgrounded — treat as interruption
            console.log('📱 [AppState] App backgrounded — sending interruption start');
            voiceMicRef.current?.onInterruptionStart?.();
          } else {
            // App foregrounded — interruption ended
            console.log('📱 [AppState] App foregrounded — sending interruption end');
            voiceMicRef.current?.onInterruptionEnd?.();
          }
        });
        appStateCleanup = () => listener.remove();
      } catch {
        // Not on Capacitor — no-op
      }
    })();

    // Browser visibilitychange fallback (handles PWA backgrounding on Safari)
    const handleVisibilityInterrupt = () => {
      if (document.visibilityState === 'hidden') {
        voiceMicRef.current?.onInterruptionStart?.();
      } else {
        voiceMicRef.current?.onInterruptionEnd?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityInterrupt);

    return () => {
      appStateCleanup?.();
      document.removeEventListener('visibilitychange', handleVisibilityInterrupt);
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
      // Use or initialize the shared AudioContext (single instance per session)
      if (!audioContextRef.current && typeof window !== 'undefined') {
        audioContextRef.current = getSharedAudioContext();
        console.log('📱 Shared AudioContext obtained for iOS audio enable, state:', audioContextRef.current.state);
      }

      // Ensure the shared context is running
      if (audioContextRef.current) {
        await ensureAudioReady();
        console.log('🎵 Shared AudioContext ensured ready, state:', audioContextRef.current.state);
      }

      // iOS Safari needs a user gesture to unlock audio
      // CRITICAL: Create and warm up a reusable Audio element that we'll use for TTS
      let audioUnlocked = false;

      // Approach 1: Create a REUSABLE audio element for iOS (key fix!)
      // iOS Safari requires using the SAME audio element that was "unlocked" via user gesture
      try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isIOS) {
          console.log('📱 [iOS] Creating warmed audio element for later TTS use');

          // Create the audio element we'll reuse for TTS
          const warmedAudio = new Audio();
          warmedAudio.setAttribute('playsinline', '');
          warmedAudio.setAttribute('webkit-playsinline', '');
          (warmedAudio as any).playsInline = true;
          warmedAudio.preload = 'auto';
          warmedAudio.volume = 1.0;

          // Play a tiny silent sound to "unlock" this specific element
          warmedAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA';

          await warmedAudio.play();
          warmedAudio.pause();
          warmedAudio.currentTime = 0;

          // Store for later use in TTS playback
          iosWarmedAudioRef.current = warmedAudio;
          audioUnlocked = true;
          console.log('✅ [iOS] Warmed audio element ready for TTS reuse');
        } else {
          // Non-iOS: just play silent audio normally
          const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA');
          silentAudio.volume = 0.001;
          silentAudio.setAttribute('playsinline', '');
          await silentAudio.play();
          audioUnlocked = true;
          console.log('✅ Silent MP3 audio played successfully');
        }
      } catch (audioError) {
        console.warn('Silent audio play failed:', audioError);
      }

      // Approach 2: Create subsonic oscillator as fallback (MUST be inaudible)
      if (!audioUnlocked && audioContextRef.current) {
        try {
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          gainNode.gain.value = 0.0001; // Effectively silent
          oscillator.frequency.value = 1; // 1Hz — subsonic, below human hearing
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.1);
          audioUnlocked = true;
          console.log('✅ Subsonic oscillator used for audio unlock');
        } catch (oscError) {
          console.warn('Oscillator method failed:', oscError);
        }
      }

      // Voice mic will be initialized automatically when needed

      setAudioEnabled(true);
      setIsIOSAudioEnabled(true);
      setAudioUnlocked(true); // Critical for Safari TTS
      setNeedsIOSAudioPermission(false);
      console.log('✅ Audio enabled successfully - AudioContext state:', audioContextRef.current?.state);

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
  // ✨ Capture the Spirit - Create Reflection Capsule from conversation
  const handleCaptureSpirit = useCallback(async () => {
    console.log('✨ [Capsule] handleCaptureSpirit called', { userId, messageCount: messages.length });

    // 🛡️ SANCTUARY ABSOLUTE BOUNDARY — guard at the source, not at the button.
    // Opening this panel is NOT a neutral, reversible act: the flow POSTs the
    // last 16 turns to /api/capsules/from-chat-window, which distills them and
    // calls createCapsule() — an INSERT INTO reflection_capsules that lands
    // BEFORE the member confirms anything in the panel. So "the panel opens for
    // the member to choose" is true of the UI and false of the substrate.
    //
    // The `!isSanctuary` render guard on the persistent bookmark hid the
    // BUTTON, but four other callers reach this handler and none of them
    // checked Sanctuary: the `open_reflection` doorway card
    // (handleDoorwayAction), the SacredLabDrawer `capture-spirit` action, the
    // `labAction` window event, and detectJournalCommand() on typed input
    // ("capture this", "journal this", …). Any of those would have written
    // Sanctuary content to disk.
    //
    // CLAUDE.md Sanctuary invariant 6 is absolute: nothing from a Sanctuary
    // session may be saved, extracted, inferred, or converted into long-term
    // memory "under any circumstances, including by user request during the
    // session." That makes this a refusal, not a confirmation prompt — there is
    // no consent gesture available inside Sanctuary that could authorize it.
    if (isSanctuary) {
      pushVoiceDebug('Capture refused · Sanctuary');
      toast.error('Sanctuary — this conversation is not being kept');
      console.warn('🛡️ [Capsule] Capture refused: Sanctuary session');
      return;
    }

    if (!userId) {
      // Surface WHY Capture "did not open" to the on-device trace, not just console.
      pushVoiceDebug('Capture blocked · member:n (userId not resolved)');
      toast.error('Please sign in to capture reflections');
      console.error('❌ [Capsule] No userId provided');
      return;
    }

    if (messages.length < 2) {
      // Capture the Spirit summarizes a conversation — there is nothing to
      // capture at Arrival / fresh launch. This guard is why the panel "does not
      // open" there; it is expected, not an auth failure.
      pushVoiceDebug('Capture blocked · no conversation yet');
      toast.error('Have a conversation first before capturing');
      console.error('❌ [Capsule] Not enough messages:', messages.length);
      return;
    }

    setShowCapturePanel(true);
    setIsCapturing(true);
    setCaptureError(null);
    setCapturedCapsule(null);
    setCapsulePersisted(false);
    persistedCapsuleIdRef.current = null;

    try {
      // Convert messages to the format expected by the capsule API
      const conversationMessages = messages.slice(-16).map(msg => ({
        role: msg.role === 'oracle' ? 'assistant' as const : 'user' as const,
        content: msg.text || msg.content || '',
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp?.toISOString?.() || new Date().toISOString(),
      }));

      console.log('📤 [Capsule] Sending request to /api/capsules/from-chat-window', {
        messageCount: conversationMessages.length,
      });

      const response = await apiFetch('/api/capsules/from-chat-window', {
        method: 'POST',
        body: JSON.stringify({
          messages: conversationMessages,
          windowSize: 16,
          tags: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.details || 'Failed to capture spirit');
      }

      const data = await response.json();
      console.log('✅ [Capsule] Keep draft prepared (nothing persisted):', data);

      // The route returns { draft } and no longer returns { capsule }: opening
      // Keep writes nothing, so there is no row and no id to hold. Reading
      // data.capsule here would be undefined — deliberately, so a regression to
      // write-on-open surfaces as a broken panel rather than a silent save.
      setCapturedCapsule(data.draft);
      setCapsulePersisted(false);

      // Track the OPENING, not a keep. Nothing was kept by this event, and the
      // name says so — `spirit_captured` fired on open would misreport the
      // member's consent gesture in every downstream count.
      trackEvent('keep_panel_opened', {
        userId,
        sessionId,
        messageCount: messages.length,
        persisted: false,
      });
    } catch (error: any) {
      console.error('❌ [Capsule] Error capturing spirit:', error);
      setCaptureError(error.message || 'Failed to capture. Please try again.');
    } finally {
      setIsCapturing(false);
      setShowCaptureSuggestion(false);
      setCaptureSuggestionDismissed(true);
    }
    // isSanctuary is a dependency, not an incidental read: handleCaptureSpiritRef
    // is what the doorway / labAction callers invoke, so a stale closure here
    // would let a capture fire against a Sanctuary session entered after the
    // last memoization.
  }, [userId, messages, sessionId, isSanctuary]);

  // Keep ref updated for event dispatch
  useEffect(() => {
    handleCaptureSpiritRef.current = handleCaptureSpirit;
  }, [handleCaptureSpirit]);

  // 🚪 RELATIONAL ROUTING: Doorway action handler
  // House Presence (2026-07-17): doorways use the client router, not
  // window.location.href — a full-document load tore down the entire React
  // tree (including the canonical MaiaPresence provider). Client navigation
  // keeps the relationship mounted; the room takes the screen, MAIA remains.
  const handleDoorwayAction = useCallback((action: MaiaUiAction) => {
    setLastDoorwayTimestamp(Date.now());
    setDoorwayDismissedAt(Date.now());
    switch (action.type) {
      case 'open_journal':
        router.push('/journal');
        break;
      case 'open_reflection':
        // Use existing capture spirit flow
        if (handleCaptureSpiritRef.current) {
          handleCaptureSpiritRef.current();
        }
        break;
      case 'open_ideas':
        router.push('/maia/ideas');
        break;
      case 'open_decisions':
        router.push('/studio/decisions');
        break;
      case 'open_changes':
        router.push('/studio/changes');
        break;
      // 🌐 WORLD DOORWAYS: Experiential spaces
      case 'enter_patterns':
        router.push('/worlds/patterns');
        break;
      case 'enter_journey':
        router.push('/worlds/journey');
        break;
    }
  }, [router]);

  // Update captured capsule (quick edits)
  // CONFIRM KEEP — the member's governing gesture, and the first moment anything
  // is written. Before this runs, the panel has been showing an unsaved preview.
  //
  // Two paths, one boundary: the first confirm CREATES the row from the draft the
  // member actually reviewed (POST /api/capsules); later edits PATCH the row that
  // now exists. What gets written is what they saw — nothing is re-distilled
  // between the preview they approved and the row on disk.
  const handleUpdateCapsule = useCallback(async (updates: Partial<CapsuleDTO>) => {
    if (!capturedCapsule) return;

    // 🛡️ Sanctuary cannot reach here — the panel is refused at
    // handleCaptureSpirit — but the write seam guards itself rather than
    // trusting that the only door stayed locked.
    if (isSanctuary) {
      console.warn('🛡️ [Capsule] Confirm refused: Sanctuary session');
      return;
    }

    try {
      if (!capsulePersisted) {
        const merged = { ...capturedCapsule, ...updates };
        const response = await apiFetch('/api/capsules', {
          method: 'POST',
          body: JSON.stringify({
            sourceType: 'chat',
            sourceId: sessionId || null,
            title: merged.title,
            summary: merged.summary,
            goldLines: merged.goldLines,
            decisions: merged.decisions,
            nextSteps: merged.nextSteps,
            practices: merged.practices,
            patterns: merged.patterns,
            signals: merged.signals,
            tags: merged.tags,
            sourceExcerpt: merged.sourceExcerpt,
            draft: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to keep this');
        }

        const data = await response.json();
        setCapturedCapsule(data.capsule);
        setCapsulePersisted(true);
        persistedCapsuleIdRef.current = data.capsule.id;
        trackEvent('keep_confirmed', { userId, sessionId, capsuleId: data.capsule.id });
        toast.success('Kept');
        return;
      }

      const response = await apiFetch(`/api/capsules/${capturedCapsule.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const data = await response.json();
      setCapturedCapsule(data.capsule);
      toast.success('Changes saved');
    } catch (error: any) {
      console.error('Failed to save capsule:', error);
      toast.error('Failed to save changes');
    }
  }, [capturedCapsule, capsulePersisted, isSanctuary, sessionId, userId]);

  // Bring capsule into the lab (mark as non-draft)
  const handleBringCapsuleIntoLab = useCallback(async () => {
    if (!capturedCapsule) return;

    // Promotion acts on a row, so it requires a confirmed Keep. The panel runs
    // its save first, which is what creates that row; read the id from the ref
    // rather than from state, which has not re-rendered yet within this tick.
    const capsuleId = persistedCapsuleIdRef.current ?? capturedCapsule.id;
    if (!capsuleId) {
      console.warn('⚠️ [Capsule] Bring into Lab with no confirmed Keep — nothing to promote');
      toast.error('Keep this first, then bring it into the Lab');
      return;
    }

    try {
      const response = await apiFetch(`/api/capsules/${capsuleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ draft: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      const data = await response.json();
      setCapturedCapsule(data.capsule);

      toast.success(
        <div>
          <div className="font-semibold">Brought into the Lab</div>
          <div className="text-sm text-white/70">View in Reflections anytime</div>
        </div>,
        { duration: 4000 }
      );

      setShowCapturePanel(false);
    } catch (error: any) {
      console.error('Failed to bring into lab:', error);
      toast.error('Failed to save. Please try again.');
    }
  }, [capturedCapsule]);

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
      const speaker = msg.role === 'user' ? (userName || 'You') : assistantName;
      const text = (msg.text ?? msg.content ?? '').replace(/\*[^*]*\*/g, '').trim();
      return `${speaker}:\n${text}\n`;
    }).join('\n---\n\n');

    const header = `${assistantName} Conversation - ${timestamp}\n${'='.repeat(40)}\n\n`;
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
        background: 'rgb(18, 24, 51)', // maia-navy-850
        color: 'rgb(245, 158, 11)', // maia-spice-500
        border: '1px solid rgba(245, 158, 11, 0.2)', // maia-spice-500/20
      },
    });
  }, [messages, userName]);

  // Handle text messages from chat interface - MUST be defined before handleVoiceTranscript
  const handleTextMessage = useCallback(async (text: string, attachments?: File[], retryOf?: string) => {
    console.log('📝 Text message received:', { text, isProcessing, isAudioPlaying, isResponding });

    // 🎯 Mark as activated when user sends a message - hides welcome screen
    setHasActivated(true);

    // 🎙️ CONSENT BOUNDARY (fix/typed-turn-no-mic-rearm): typed turn — the mic must NOT
    // auto-re-arm after MAIA's response. Typed input is not voice re-consent.
    lastSendWasVoiceRef.current = false;

    if (detectJournalCommand(text)) {
      await handleCaptureSpirit();
      return;
    }

    // 🎯 MAIA COMMAND DETECTION: mode/lens/style switching
    // Commands change state BEFORE the message is processed.
    // Command phrases are stripped from the text so they don't become therapeutic content.
    const { commands: maiaCommands, cleanedText: commandCleanedText, onlyCommands } = detectMaiaCommands(text);

    if (maiaCommands.length > 0) {
      for (const cmd of maiaCommands) {
        if (cmd.type === 'mode') {
          // Map MaiaMode → ListeningMode
          const newListeningMode =
            cmd.mode === 'talk' ? 'normal' as const :
            cmd.mode === 'care' ? 'patient' as const :
            cmd.mode === 'scribe' ? 'session' as const :
            cmd.mode === 'sanctuary' ? 'normal' as const : // Sanctuary uses talk mode + sanctuary flag
            'normal' as const;
          setListeningMode(newListeningMode);

          // Sanctuary flag
          if (cmd.mode === 'sanctuary') setIsSanctuary(true);
          else setIsSanctuary(false);

          console.log(`🔄 [Command] Mode → ${cmd.mode} (listeningMode: ${newListeningMode})`);
        }

        if (cmd.type === 'lens') {
          setCounselFramework(cmd.lens);
          console.log(`🔄 [Command] Lens → ${cmd.lens}`);
        }

        if (cmd.type === 'style') {
          localStorage.setItem('conversation_mode', cmd.style);
          window.dispatchEvent(new Event('conversationStyleChanged'));
          console.log(`🔄 [Command] Style → ${cmd.style}`);
        }
      }

      // Show confirmation toast
      const confirmation = getMaiaCommandConfirmation(maiaCommands);
      if (confirmation) {
        toast.success(confirmation);
      }

      // If the message was ONLY commands, acknowledge and return — don't send to API
      if (onlyCommands) {
        console.log('✅ [Command] Command-only message, no content to process');
        return;
      }

      // Otherwise, continue with the cleaned text (commands stripped)
      text = commandCleanedText;
    }

    // IMMEDIATELY stop microphone to prevent Maia from hearing herself
    if (voiceSession.state.capabilities.canStopListening) {
      voiceSession.methods.stopListening();
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

    // 🔁 RECOVERY SEAM (Pattern A): a resend reuses the member's existing turn —
    // no second bubble, no re-authored duplicate. The member already completed the
    // act of sending; only delivery failed. `targetMessageId` is the turn we track.
    const targetMessageId = retryOf ?? `msg-${Date.now()}`;
    // Only set on a fresh send (undefined on resend — the turn already exists in
    // `messages`). Declared here, not inside the else block below, because
    // nextMessagesForApi (built further down) needs it regardless of branch —
    // a block-scoped const there is invisible outside the if/else and throws
    // ReferenceError on every send, retry or not.
    let userMessage: ConversationMessage | undefined;

    // 🧱 F1 durable turn acceptance (audit 2026-08-10): mint ONE exchange id per
    // member turn and carry it everywhere this turn is written. The server makes
    // the utterance durable at acceptance under this id; the client's later pair
    // write reuses it, so ON CONFLICT (exchange_id, seq) collapses the second
    // write instead of creating a duplicate exchange.
    //
    // A resend deliberately REUSES the original id — the member is retrying one
    // utterance, not authoring a new one, so it must not become two rows.
    const turnExchangeId: string =
      (retryOf ? messages.find(m => m.id === retryOf)?.metadata?.exchangeId : undefined) ||
      (typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`);

    if (retryOf) {
      // Resend of an already-authored turn: mark it in-flight, append nothing.
      setMessages(prev => markRetrying(prev, retryOf));
    } else {
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
      userMessage = {
        id: targetMessageId,
        role: 'user',
        text: cleanedText,
        timestamp: new Date(),
        source: 'user',
        // Carried so the later pair write can reuse the same exchange (see above).
        metadata: { exchangeId: turnExchangeId },
      };
      setMessages(prev => appendMessageCapped(prev, userMessage!));
      onMessageAddedRef.current?.(userMessage);
      // The member has spoken. Typed turns and non-streaming voice turns both land here.
      onMemberExpressionRef.current?.();
    }

    // On a resend these once-per-turn side-effects already fired on the first
    // attempt; re-running would double-save to memory / re-record the consultation.
    if (!retryOf) {
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
        setMessages(prev => appendMessageCapped(prev, blockingMessage));
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

        // Show visible crisis resource card in chat
        const crisisResourceMessage: ConversationMessage = {
          id: `crisis-resources-${Date.now()}`,
          role: 'oracle',
          text: '---\n' +
            '**You don\'t have to handle this alone.**\n\n' +
            'Right now, you can reach someone who gets it:\n\n' +
            '**988 Suicide & Crisis Lifeline** \u2014 Call or text 988 (24/7)\n\n' +
            '**Crisis Text Line** \u2014 Text HOME to 741741 (24/7)\n\n' +
            '**Trevor Project** (LGBTQ+) \u2014 Call 1-866-488-7386 or text START to 678678\n\n' +
            (safetyCheck.isED ? '**NEDA Helpline** \u2014 Call 1-800-931-2237 or text NEDA to 741741\n\n' : '') +
            'If someone is hurting you, tell a trusted adult. You can also call **Childhelp** at 1-800-422-4453.\n\n' +
            '*I\'m still here. We can keep talking.*\n' +
            '---',
          timestamp: new Date(),
          source: 'system'
        };
        setMessages(prev => appendMessageCapped(prev, crisisResourceMessage));
        onMessageAddedRef.current?.(crisisResourceMessage);

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

      // If scaffolding suggestions available, show them in chat
      if (!supportResponse.crisisMode && supportResponse.scaffoldSuggestions && supportResponse.scaffoldSuggestions.length > 0) {
        console.log('🌟 [TEEN SUPPORT] Scaffolding suggestions:', supportResponse.scaffoldSuggestions);
        // Show scaffold suggestions as a gentle system message
        const scaffoldText = supportResponse.scaffoldSuggestions
          .map(s => `\u2022 ${s}`)
          .join('\n');
        const scaffoldMessage: ConversationMessage = {
          id: `scaffold-${Date.now()}`,
          role: 'oracle',
          text: `*Some things that might help right now:*\n\n${scaffoldText}`,
          timestamp: new Date(),
          source: 'system'
        };
        setMessages(prev => appendMessageCapped(prev, scaffoldMessage));
        onMessageAddedRef.current?.(scaffoldMessage);
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

      // Build local array that includes the new user message (state update is async).
      // On a resend userMessage is undefined — the turn already exists in `messages`
      // (it was appended on the original attempt), so there's nothing to append here.
      const nextMessagesForApi = userMessage
        ? appendMessageCapped(messages, userMessage, MAX_DISPLAY_MESSAGES)
        : messages;

      // MAIA speaks through sovereign API - working consciousness system
      // apiUrl() wraps the endpoint for iOS/Capacitor builds to point to production server
      const fullApiUrl = apiUrl(apiEndpoint);

      // [ios-debug] Hard truth logger - catch exactly what iOS is doing
      console.log('[ios-debug] sending →', {
        url: fullApiUrl,
        endpoint: apiEndpoint,
        isNative: typeof window !== 'undefined' ? (window as any).Capacitor?.isNativePlatform?.() : 'unknown',
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      });

      // OFFLINE FALLBACK: Check if we're probably offline before attempting server call
      if (!isProbablyOnline()) {
        console.log('[OracleConversation] Offline detected - using presence fallback');
        const fallbackText = generatePresenceFallback({
          userText: cleanedText,
          mode: realtimeMode === 'counsel' ? 'support' : 'clarity',
          preferredName: userName || undefined,
        });

        // Add the fallback response as an oracle message
        const fallbackMessage: ConversationMessage = {
          id: `fallback-${Date.now()}`,
          role: 'oracle',
          text: fallbackText,
          timestamp: new Date().toISOString(),
          element: 'aether',
          metadata: { isFallback: true, reason: 'offline' },
        };

        setMessages(prev => appendMessageCapped(prev, fallbackMessage, MAX_DISPLAY_MESSAGES));
        setIsResponding(false);
        setMaiaResponseText(fallbackText);

        // Speak the fallback if voice is enabled
        if (!showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat) {
          handleSpeakMessage(fallbackText, `fallback-${Date.now()}`);
        }
        return;
      }

      let response: Response;
      try {
        // apiFetch() adds x-member-id header for Capacitor apps (cookies don't work cross-origin)
        response = await apiFetch(apiEndpoint, {
          method: 'POST',
          body: JSON.stringify({
          message: cleanedText,
          userId: userId || 'anonymous',
          userName: userName || 'Friend',
          sessionId,
          // 🧱 F1: lets the serving boundary persist this utterance at acceptance
          // under an id the client can later dedupe against.
          exchangeId: turnExchangeId,
          localHour: new Date().getHours(), // Client's local time for correct greetings
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

          // 🎭 MAIA RELATIONAL MODE: Talk/Care/Scribe with sub-modes
          // This shapes MAIA's system prompt for relational attunement
          // 🚨 Crisis override takes precedence over all modes
          maiaMode: crisisStateRef.current?.detected ? {
            mode: 'care',
            subMode: 'crisis',
            crisisLevel: crisisStateRef.current.level,
            systemPromptModifier: crisisStateRef.current.systemPrompt || getModeSystemPrompt(maiaMode),
          } : maiaMode.mode !== 'talk' ? {
            mode: maiaMode.mode,
            subMode: maiaMode.mode === 'care' ? maiaMode.careSubMode : undefined,
            reflectionLens: maiaMode.mode === 'scribe' ? maiaMode.scribeReflectionLens : undefined,
            systemPromptModifier: getModeSystemPrompt(maiaMode),
          } : undefined,

          // 🧭 THERAPEUTIC FRAMEWORK: Mode-specific lens
          // If user consented to switch, use the new framework; otherwise use current
          therapeuticFramework: pendingLensConsent?.consent === 'switch' && pendingLensConsent?.switchTo
            ? pendingLensConsent.switchTo
            : (realtimeMode === 'counsel' ? getCounselFramework() : undefined),
          reflectionLens: realtimeMode === 'scribe' ? getScribeLens() : undefined,

          // 🎓 MENTOR STANCE: Practitioner supervision mode (Care only)
          mentorStance: realtimeMode === 'counsel' ? getMentorStance() : false,

          // 🌉 RELATIONAL BRIDGE: Session-persistent contextId from /relationships/[id] handoff
          ...(sessionRelationshipContextId.current && {
            relationshipContextId: sessionRelationshipContextId.current,
          }),

          // 🌀 LENS CONSENT: User's choice from Stay/Switch/Blend ritual (if any)
          lensConsent: pendingLensConsent?.consent || null,

          // 📚 ASK MAIA: Orientation + Knowledge Field stance
          askMode: askMode || undefined,

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
          conversationHistory: truncateHistoryForAPI(nextMessagesForApi, historicalMessagesRef.current),
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
          } : undefined,

          // 🌟 ASTROLOGICAL CONTEXT: User's birth data for personalized cosmic insights
          birthData: (() => {
            if (typeof window === 'undefined') return undefined;
            try {
              const stored = localStorage.getItem('beta_user');
              if (!stored) return undefined;
              const user = JSON.parse(stored);
              return user.birthData || undefined;
            } catch {
              return undefined;
            }
          })(),

          // 📝 SCRIBE SESSION DISCUSSION: Context for scoped session discussions
          // When discussing a past Scribe/Witness session, MAIA has access to the summary and themes
          scribeSessionDiscussion: scribeSessionId && scribeSessionContext ? {
            sessionId: scribeSessionId,
            title: scribeSessionContext.title,
            container: scribeSessionContext.container,
            summary: scribeSessionContext.summary,
            duration: scribeSessionContext.duration,
            markerCount: scribeSessionContext.markerCount,
          } : undefined,

          // 🏢 STUDIO SURFACE: When running inside Soullab Studio
          surface: surface ?? 'maia',
          studioContext: studioContext ?? undefined,

          // 🚪 PLACE — facts-only current-room context. Sent ONLY here, inside
          // a message the member chose to send. Route changes transmit nothing.
          place: placeContext ?? undefined,

          // Field presence regulation — signals oracle to apply regulation arc
          fieldMode: fieldMode ?? false,
          fieldEnergyState: fieldEnergyState ?? 'arrival',
        }),
        signal: controller.signal
      });
      } catch (fetchError) {
        // Network-level errors (CORS, network unreachable, etc.)
        // NETWORK ERROR FALLBACK: Use presence mode instead of failing
        console.log('[OracleConversation] Network error - using presence fallback:', fetchError);
        // Surface a small banner above the input so the user isn't left with
        // a cleared input and a presence-fallback reply that visually mimics MAIA.
        setInputSubmitError("Network unreachable — replying in presence mode. Try again when back online.");
        // 🔁 Recovery seam: the turn didn't reach MAIA — mark it not-delivered so the
        // member can Resend. (C1 presence-mode fallback below is intentionally untouched.)
        setMessages(prev => markFailed(prev, targetMessageId, 'network'));
        const fallbackText = generatePresenceFallback({
          userText: cleanedText,
          mode: realtimeMode === 'counsel' ? 'support' : 'clarity',
          preferredName: userName || undefined,
        });

        // Add the fallback response as an oracle message
        const fallbackMessage: ConversationMessage = {
          id: `fallback-${Date.now()}`,
          role: 'oracle',
          text: fallbackText,
          timestamp: new Date().toISOString(),
          element: 'aether',
          metadata: { isFallback: true, reason: 'network_error' },
        };

        setMessages(prev => appendMessageCapped(prev, fallbackMessage, MAX_DISPLAY_MESSAGES));
        setIsResponding(false);
        setMaiaResponseText(fallbackText);

        // Speak the fallback if voice is enabled
        if (!showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat) {
          handleSpeakMessage(fallbackText, `fallback-${Date.now()}`);
        }
        return;
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 🛑 LIMITS ENFORCEMENT: Check for tier-based usage block (429)
        if (response.status === 429) {
          const errData = await response.json().catch(() => null);
          if (errData?.blocked) {
            console.log('[OracleConversation] Usage limit reached:', errData.message);
            setLimitsBlock({
              message: errData.message ?? "You've reached a limit for this tier.",
              tier: errData.tier,
            });
            setIsResponding(false);
            return; // Don't show fallback - show limits UI instead
          }
        }

        // 🚧 MAINTENANCE MODE: Show pause message when system is in maintenance
        if (response.status === 503) {
          const errData = await response.json().catch(() => null);
          // Log actual error body (response.text() below would return "(no body)" since body already consumed)
          console.error('[fetch] 503 error details:', errData);
          if (errData?.error === 'MAINTENANCE_MODE') {
            console.log('[OracleConversation] Maintenance mode active:', errData.message);
            setInputSubmitError("MAIA is in maintenance mode. Your message hasn't been sent.");
            // 🔁 Recovery seam: not delivered — offer Resend once maintenance clears.
            setMessages(prev => markFailed(prev, targetMessageId, 'maintenance'));
            const maintenanceMessage: ConversationMessage = {
              id: `maintenance-${Date.now()}`,
              role: 'oracle',
              text: errData.message || 'MAIA is taking a brief pause. Back soon.',
              timestamp: new Date().toISOString(),
              element: 'aether',
              metadata: { isMaintenance: true },
            };
            setMessages(prev => appendMessageCapped(prev, maintenanceMessage, MAX_DISPLAY_MESSAGES));
            setIsProcessing(false);
            setIsResponding(false);
            setMaiaResponseText(maintenanceMessage.text);
            return;
          }
        }

        const errorText = await response.text().catch(() => '(no body)');
        console.error('[fetch] non-OK response:', response.status, errorText);

        // SERVER ERROR FALLBACK: Use presence mode instead of showing error
        console.log('[OracleConversation] Server error - using presence fallback');
        setInputSubmitError(`Server returned ${response.status}. Replying in presence mode — try again.`);
        // 🔁 Recovery seam: not delivered — mark for Resend, or 'auth' for a real 401
        // response so the bubble offers "Sign in to continue" instead of a bare Resend
        // (a resend without signing in would just 401 again). Response.ok being false
        // for a 401 never throws, so the outer catch's message-string 401 check never
        // sees this case — it has to be tagged here. (C1 fallback below untouched.)
        setMessages(prev => markFailed(prev, targetMessageId, response.status === 401 ? 'auth' : 'server'));
        const fallbackText = generatePresenceFallback({
          userText: cleanedText,
          mode: realtimeMode === 'counsel' ? 'support' : 'clarity',
          preferredName: userName || undefined,
        });

        const fallbackMessage: ConversationMessage = {
          id: `fallback-${Date.now()}`,
          role: 'oracle',
          text: fallbackText,
          timestamp: new Date().toISOString(),
          element: 'aether',
          metadata: { isFallback: true, reason: 'server_error', status: response.status },
        };

        setMessages(prev => appendMessageCapped(prev, fallbackMessage, MAX_DISPLAY_MESSAGES));
        setIsResponding(false);
        setMaiaResponseText(fallbackText);

        if (!showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat) {
          handleSpeakMessage(fallbackText, `fallback-${Date.now()}`);
        }
        return;
      }

      // 🔁 Recovery seam: server accepted this turn — clear the in-flight retry marker.
      // clearDelivery acts ONLY on a 'retrying' turn (ownership contract in the helper),
      // so a first send is a no-op and a late resolver can never erase a newer attempt's
      // 'failed' marker.
      setMessages(prev => clearDelivery(prev, targetMessageId));

      // Check if streaming response (voice mode)
      const isVoiceMode = !showChatInterface;
      const contentType = response.headers.get('content-type');
      const isStreaming = contentType?.includes('text/event-stream');

      console.log('📡 Response type:', { isVoiceMode, contentType, isStreaming });

      let responseText: string;
      let responseData: any = {};
      let element = 'aether'; // Default element, will be updated from metadata if available
      let spokenTextForVoice: string = ''; // CI-shaped TTS text (falls back to responseText)
      let ttsInstructionsForVoice: string = ''; // MAIA vocal intent for OpenAI TTS
      let opusAxioms: any = undefined; // Opus Axioms evaluation results
      let turnId: number | undefined = undefined; // Turn ID for feedback tracking
      // 🌀 INTEGRITY CHECK: Pass 3 result for lens switching UI
      let integrity: IntegrityResult | undefined = undefined;
      let lensSwitchOptions: ConversationMessage['lensSwitchOptions'] = null;

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
        const { StreamingAudioQueue, splitIntoSentences, mergeShortSentences, generateAudioChunk } =
          await import('@/lib/voice/StreamingAudioQueue');
        // Per-chunk prosody from PFI — element-aware, position-aware instructions
        const { deriveChunkProsodyLegacy } = await import('@/lib/voice/prosodyFromPFI');

        // Initialize audio queue for voice mode
        const shouldStreamAudio = !showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat;
        let audioQueue: InstanceType<typeof StreamingAudioQueue> | null = null;
        // ECHO SUPPRESSION: Define cooldown for streaming audio path
        const streamingCooldownMs = 200; // Brief breathing space — reduced for more natural turn handoff

        if (shouldStreamAudio) {
          console.log('🎵 [STREAM] Initializing streaming audio queue...');
          // Set audio playing TRUE at start - only goes false when COMPLETE
          setIsAudioPlaying(true);
          setIsMicrophonePaused(true);

          // 🔓 iOS FIX: Dispatch voice start to trigger iOS audio keep-alive
          // This ensures the AudioContext stays active across all response chunks
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('maya-voice-start'));
            console.log('🔓 [STREAM] Dispatched maya-voice-start for iOS audio keep-alive');
          }

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
              // PR 15 diagnostic: prove the OracleConversation-side onComplete callback
              // actually runs on Android. If we see this marker, the state-clearing chain
              // ran and any remaining "thinking" stuck-state is downstream of here. If we
              // never see it (despite seeing the inner "🎬 onComplete firing"), the
              // callback bridge between StreamingAudioQueue and OracleConversation is dead
              // on Android — very unlikely but worth ruling out.
              pushVoiceDebug('🧹 OC.onComplete entered → clearing state');
              // 🔥 CRITICAL FIX: Reset isProcessing HERE, not just in retry loop
              // Without this, the next transcript is ignored with "Already processing"
              setIsProcessing(false);
              isProcessingRef.current = false;
              setIsResponding(false);
              // ✅ Set isAudioPlaying FALSE now - audio ended, visualizer shows user color
              setIsAudioPlaying(false);
              pushVoiceDebug('🧹 state cleared (processing/responding/audio)');
              // 🔥 isMicrophonePaused stays TRUE to block mic during cooldown
              // (ContinuousConversation checks: isSpeaking={isAudioPlaying || isMicrophonePaused})

              // 🔓 iOS FIX: Dispatch voice end to allow keep-alive to manage context
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('maya-voice-end'));
                console.log('🔓 [STREAM] Dispatched maya-voice-end');
              }

              // Resume mic after cooldown — single clean attempt, no retry loop
              // 🎙️ POLICY: ContinuousConversation owns restart logic (handsFree gating + backoff)
              // OracleConversation just clears the blocking state and lets CC decide
              console.log(`⏳ [STREAM] Cooldown ${streamingCooldownMs}ms (mic paused)...`);
              setTimeout(() => {
                setIsMicrophonePaused(false);
                isMicrophonePausedRef.current = false;
                console.log('🎤 [STREAM] Microphone unpaused - ready for next input');

                // Check if hands-free is active
                const isHandsFree = voiceMicRef.current?.isHandsFree ?? false;

                if (isHandsFree) {
                  // Hands-free: single restart attempt after React flush
                  // 🔥 FIX: Don't gate on voiceSession.state.capabilities (stale closure).
                  // Use refs for current state, let CC authority guard handle the rest.
                  requestAnimationFrame(() => {
                    if (!isProcessingRef.current && !isRespondingRef.current && !isAudioPlayingRef.current && !isMicrophonePausedRef.current) {
                      setIsMuted(false);
                      console.log('🎤 [STREAM] Hands-free: requesting mic restart');
                      if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('hands_free_stream_restart');
                    }
                  });
                } else {
                  // Push-to-talk (default): just clear state, user taps when ready
                  console.log('🎤 [STREAM] Push-to-talk mode - mic idle, ready for user tap');
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
        // ⚠️ Observability-only (NOT a guard): detects a PERSISTENT finalize stall —
        // streamEnded with pendingTTSCount frozen >0 — the residual hole the per-chunk
        // playback watchdog cannot see (every chunk's onended fired, but
        // markStreamingComplete is never reached). Armed on entry to the pending state,
        // fires the overlay marker only if STILL stuck after a grace window, cleared on
        // successful finalize / error. Lets a field session EXCLUDE this path, not just
        // confirm the primary one. Transient pending is normal, so a raw per-call marker
        // would false-positive on healthy turns and could never close "exclusivity".
        let finalizeStallTimer: ReturnType<typeof setTimeout> | null = null;
        let finalizePromiseResolve: (() => void) | null = null;
        const finalizePromise = new Promise<void>(resolve => {
          finalizePromiseResolve = resolve;
        });

        // Helper to check if we can finalize
        const checkFinalize = () => {
          if (streamEnded && pendingTTSCount === 0 && audioQueue) {
            if (finalizeStallTimer) { clearTimeout(finalizeStallTimer); finalizeStallTimer = null; }
            console.log('✅ [STREAM] All TTS complete - NOW marking streaming complete');
            audioQueue.markStreamingComplete();
            finalizePromiseResolve?.();
          } else if (streamEnded) {
            console.log(`⏳ [STREAM] Stream ended but ${pendingTTSCount} TTS requests still pending...`);
            // Transient pending is normal (last chunk still generating). Only a
            // PERSISTENT stall is the residual finalize hole — arm once on entry and
            // emit the overlay marker if we are STILL pending after the grace window.
            if (!finalizeStallTimer) {
              finalizeStallTimer = setTimeout(() => {
                finalizeStallTimer = null;
                if (streamEnded && pendingTTSCount > 0) {
                  pushVoiceDebug(`⚠️ finalize stall: pendingTTSCount did not reach 0 (${pendingTTSCount} pending)`);
                }
              }, 15000);
            }
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
                    instructions: ttsInstructionsForVoice,
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
                        const rawSentences = splitIntoSentences(partialSentence);
                        // Merge adjacent short sentences to reduce TTS API calls and stitching seams.
                        // e.g. "Yes. I see." becomes one chunk instead of two.
                        const _rawBatch = rawSentences.slice(0, -1);
                        const completeSentences = mergeShortSentences(_rawBatch, 160);
                        // Tell the queue how many raw sentences were collapsed this batch.
                        // Feeds [pfi.voice] chunks_merged_count — if always 0, threshold is too high.
                        if (audioQueue && _rawBatch.length > completeSentences.length) {
                          audioQueue.noteMergedCount(_rawBatch.length - completeSentences.length);
                        }

                        // Process merged complete sentences
                        for (let _ci = 0; _ci < completeSentences.length; _ci++) {
                          const sentence = completeSentences[_ci];
                          if (sentence) {
                            console.log('🎤 [STREAM] Complete sentence, generating audio:', sentence.substring(0, 50));

                            // Per-chunk prosody from PFI: element + position-aware instructions.
                            // isFirstChunk/isLastChunk are relative to this SSE batch.
                            const chunkTTSInstructions = deriveChunkProsodyLegacy({
                              chunkText: sentence,
                              baseTTSInstructions: ttsInstructionsForVoice || '',
                              element: (element || 'aether') as any,
                              isFirstChunk: _ci === 0,
                              isLastChunk: _ci === completeSentences.length - 1,
                            });

                            // 🔥 FIX: Track this pending TTS request
                            pendingTTSCount++;
                            console.log(`📤 [STREAM] TTS request started (pending: ${pendingTTSCount})`);

                            // 🔥 FIX: Generate audio with retry logic for transient failures
                            const generateWithRetry = async (text: string, retries: number = 2): Promise<HTMLAudioElement | null> => {
                              for (let attempt = 1; attempt <= retries; attempt++) {
                                try {
                                  return await generateAudioChunk(text, {
                                    agentVoice: 'maya',
                                    element,
                                    instructions: chunkTTSInstructions,
                                  });
                                } catch (err) {
                                  console.warn(`⚠️ [STREAM] TTS attempt ${attempt}/${retries} failed:`, err);
                                  if (attempt < retries) {
                                    await new Promise(r => setTimeout(r, 300 * attempt)); // Exponential backoff
                                  }
                                }
                              }
                              return null;
                            };

                            // Generate and queue audio asynchronously (don't await - let it run in background)
                            generateWithRetry(sentence).then(audio => {
                              if (audio) {
                                audioQueue!.enqueue({
                                  audio,
                                  text: sentence,
                                  element,
                                });
                                console.log(`📥 [STREAM] TTS request completed (pending: ${pendingTTSCount - 1})`);
                              } else {
                                console.error(`❌ [STREAM] TTS failed after all retries for: "${sentence.substring(0, 30)}..."`);
                              }
                              // 🔥 FIX: TTS completed (success or permanent failure)
                              pendingTTSCount--;
                              checkFinalize();
                            }).catch(err => {
                              // This shouldn't happen as generateWithRetry catches errors, but just in case
                              console.error('❌ [STREAM] Unexpected TTS error:', err);
                              pendingTTSCount--;
                              checkFinalize();
                            });
                          }
                        }

                        // Keep the last raw sentence (might be incomplete — not merged)
                        partialSentence = rawSentences[rawSentences.length - 1] || '';
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
          spokenTextForVoice = responseText; // Streaming has no CI shaping
          console.log(`✅ [STREAM] Complete response received (${fullText.length} chars)`);

        } catch (streamError) {
          console.error('❌ [STREAM] Error reading stream:', streamError);
          // Clean up audio queue on error
          if (finalizeStallTimer) { clearTimeout(finalizeStallTimer); finalizeStallTimer = null; }
          if (audioQueue) {
            audioQueue.stop();
          }
          throw streamError;
        }

      } else {
        // Handle JSON response (text mode - includes metadata)
        responseData = await response.json();
        console.log('✅ THE BETWEEN response data:', responseData);

        // 🛑 LIMITS NUDGE: Check for soft cap warnings (non-blocking)
        if (responseData?.metadata?.limitNudge?.message) {
          setLimitsBanner({
            message: responseData.metadata.limitNudge.message,
            nudgeType: responseData.metadata.limitNudge.nudgeType,
            tier: responseData.metadata.tier,
          });
        }

        // Use normalized response for consistent field access
        const normalized = normalizeAIResponse(responseData);
        responseText = cleanMessage(normalized?.text || responseData.response || responseData.message || 'I\'m here. What wants your attention?');

        // MAIA Central: extract CI-shaped spoken text and vocal intent (if oracle/conversation route)
        spokenTextForVoice = responseData.spokenText || responseText;
        ttsInstructionsForVoice = responseData.ttsInstructions || '';

        // Extract opusAxioms and turnId for Gold Seal feature
        opusAxioms = responseData.opusAxioms;
        turnId = responseData.turnId;
        if (opusAxioms) {
          console.log(`🜔 Opus Axioms received: ${opusAxioms.isGold ? 'GOLD' : 'Standard'} | ${opusAxioms.passed}/8 passed`);
        }

        // 🌀 INTEGRITY CHECK: Extract Pass 3 result for lens switching UI
        integrity = responseData.integrity as IntegrityResult | undefined;
        lensSwitchOptions = responseData.lensSwitchOptions as ConversationMessage['lensSwitchOptions'];
        if (integrity?.decision === 'offer_switch') {
          console.log(`🌀 [INTEGRITY] Lens switch offered: ${JSON.stringify(lensSwitchOptions)}`);
        }

        // 💡 IDEA FIELD: Surface idea candidates as non-intrusive toasts
        // Sovereignty: MAIA suggests, user decides. Only saved on explicit confirmation.
        // Rate limit: max 1 toast per 30s to avoid feeling extractive
        const ideaCooldownMs = 30_000;
        const timeSinceLastIdea = Date.now() - ideaLastShownRef.current;
        if (
          responseData.ideaCandidate &&
          !ideaDismissedRef.current.has(responseData.ideaCandidate.fingerprint) &&
          timeSinceLastIdea >= ideaCooldownMs
        ) {
          const candidate = responseData.ideaCandidate;
          ideaDismissedRef.current.add(candidate.fingerprint); // Prevent re-suggestion regardless
          ideaLastShownRef.current = Date.now();

          toast(
            (t: { id: string }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '260px' }}>
                <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 500 }}>
                  {candidate.title}
                </div>
                <div style={{ fontSize: '11px', color: '#a8a29e', lineHeight: '1.4' }}>
                  {candidate.summary.slice(0, 120)}{candidate.summary.length > 120 ? '...' : ''}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      fetch('/api/ideas/capture', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: candidate.title,
                          description: candidate.summary,
                          sourceText: candidate.sourceText,
                          confidence: candidate.confidence,
                          conversationId: sessionId,
                        }),
                      }).catch(() => {});
                      toast.dismiss(t.id);
                      toast('Idea saved', { icon: '💡', duration: 2000, style: { background: '#1c1917', color: '#fbbf24', fontSize: '12px' } });
                    }}
                    style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{ background: 'transparent', color: '#78716c', border: '1px solid rgba(120, 113, 108, 0.3)', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ),
            {
              duration: 10000,
              icon: '💡',
              style: {
                background: '#1c1917',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '12px',
                padding: '12px',
              },
            }
          );

          console.log(`💡 [idea-field] Candidate surfaced: "${candidate.title}" (${candidate.confidence})`);
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
        // 🌀 INTEGRITY CHECK: Pass 3 result for lens switching UI
        integrity,
        lensSwitchOptions,
        // 🌀 STATE VECTOR: Consciousness state reading for this turn
        stateVector: responseData.stateVector || null,
        // 🌿 PRACTICE: Recommended practice from state vector routing
        practiceRecommendation: responseData.practiceRecommendation || null,
        // 🚪 AIN Knowledge Gate: source mix + awareness state
        ainState: responseData.ainState || null,
        metadata: {
          wisdomRouting: wisdomRouting ? {
            activated: wisdomRouting.activated,
            tool: wisdomRouting.tool,
            meta: wisdomRouting.meta
          } : undefined
        },
        // 🚪 AIN: Knowledge Gate source well weighting
        ainState: responseData.ainState || null,
        // 🏛️ AIN: Consultation council results
        consultation: responseData.consultation || null,
        // 🌌 ASTROLOGY HANDOFF: Structured threshold transition into the Cosmic Blueprint
        astrologyHandoff: responseData.astrologyHandoff || null,
        // 📖 SACRED ENCOUNTER: passage surfaced by encounter layer (rendered separately)
        sacredEncounter: responseData.sacredEncounter ?? null,
        // 🚪 RELATIONAL ROUTING: intent-driven doorway
        intent: responseData.intent || undefined,
        uiAction: responseData.uiAction || undefined,
        // 🌀 SUGGESTED ACTIONS: behavioral loop invitations (between/chat top-level OR oracle spiralogic)
        suggestedActions: responseData.suggestedActions || responseData.spiralogic?.suggestedActions || undefined,
      };

      // 🔖 KEEP-INTENT-01 — the member asked to keep something, or asked for Keep
      // itself. Recognized HERE, after the reply exists, and deliberately not in
      // handleTextMessage next to detectJournalCommand(): that detector returns
      // before the message is sent, so MAIA goes silent. "Can we keep this?" is
      // relational speech addressed to her; the interface must not make her mute
      // because it recognized an affordance. The turn is untouched by this block.
      //
      // Three layers, held apart (Kelly ruling 2026-08-28):
      //   UNDERSTAND — detectKeepIntent(), pure, writes nothing
      //   FACILITATE — surface or open the member-controlled Keep gesture
      //   COMMIT     — only the member's confirmation in the panel persists
      // Opening Keep is now a zero-persistence act (KEEP-OPEN-NONPERSISTENT-01),
      // which is what makes the explicit-command branch below safe to wire.
      const keepIntent = detectKeepIntent(cleanedText);
      if (keepIntent.kind) {
        if (isSanctuary) {
          // No doorway, no panel, no capsule. MAIA answers in words — the
          // platform map tells her Keep is unavailable in Sanctuary and that
          // this absence is the boundary working, not a fault.
          console.log('🛡️ [Keep] intent recognized but refused · Sanctuary', {
            kind: keepIntent.kind,
          });
        } else if (keepIntent.kind === 'open_keep') {
          // Explicit House command. MAIA operates the interface; she does not
          // exercise the member's consent authority by doing so — the panel
          // opens holding an unsaved preview and nothing is written until the
          // member confirms.
          console.log('🔖 [Keep] explicit open command', { matched: keepIntent.matched });
          handleCaptureSpiritRef.current?.();
        } else if (!oracleMessage.uiAction || oracleMessage.uiAction.type === 'none') {
          // The member wants to hold onto this material. Surface the existing
          // member-controlled doorway rather than opening anything: they decide.
          const action = buildUiAction(getIntentRoute('reflection_mark'), 1);
          if (action.type !== 'none') {
            oracleMessage.intent = 'reflection_mark';
            // Override the ambient lead-in. The pooled ones ("Something
            // important just happened.") are MAIA asserting significance she
            // detected; here the member said it themselves, and echoing their
            // ask back as her own observation would misreport who noticed.
            oracleMessage.uiAction = { ...action, leadIn: 'You asked to keep this.' };
            console.log('🔖 [Keep] doorway attached', { matched: keepIntent.matched });
          }
        }
      }

      // 🚪 CLIENT-SIDE INTENT DETECTION (fallback when server doesn't provide uiAction)
      if (!oracleMessage.uiAction || oracleMessage.uiAction.type === 'none') {
        const detection = detectIntent({ userInput: cleanedText, maiaResponse: oracleMessage.text || '' });
        console.log('[World] intent-check', { userInput: cleanedText.slice(0, 60), intent: detection.intent, confidence: detection.confidence });
        if (detection.intent !== 'unknown' && detection.confidence > 0) {
          const route = getIntentRoute(detection.intent);
          const action = buildUiAction(route, detection.confidence);
          if (action.type !== 'none') {
            oracleMessage.intent = detection.intent;
            oracleMessage.uiAction = action;
            console.log('[World] doorway-attached', { intent: detection.intent, actionType: action.type, isWorldDoorway: action.isWorldDoorway });
          }
        }
      }

      // 🚪 RELATIONAL ROUTING: Reset doorway dismissal for new turn
      const effectiveUiAction = oracleMessage.uiAction;
      if (effectiveUiAction && effectiveUiAction.type !== 'none') {
        setDoorwayDismissedAt(null);
      }

      // 🌀 AIN: Track field wisdom presence at conversation level
      if (responseData.fieldState?.wisdomPresent) {
        setFieldWisdomPresent(true);
      }

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
        setMessages(prev => appendMessageCapped(prev, oracleMessage));
        onMessageAddedRef.current?.(oracleMessage);

        // 📚 ASK MAIA: Single-turn reset — return to relational default after response
        if (askMode) {
          setAskMode(false);
          console.log('[Ask MAIA] Single-turn reset — returning to relational stance');
        }

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
      const usedStreamingAudio = isStreaming && !showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat;
      // 🔊 MODALITY INDEPENDENCE (founder ruling 2026-08-13): member INPUT modality
      // and MAIA OUTPUT modality are orthogonal. All four cells must be real:
      //   type + silent · type + spoken · speak + silent · speak + spoken
      // The 4th cell (speak + silent) did NOT exist: voice mode forced audible
      // output because these gates tested only `!showChatInterface`, ignoring the
      // member's explicit `enableVoiceInChat` choice. A member who turned MAIA's
      // voice OFF and then tapped Speak got unexpected audio — their stated
      // preference silently overridden by a mode switch. Safe by default:
      // `enableVoiceInChat` defaults to TRUE, so voice mode stays audible unless
      // the member turned it off.
      const shouldSpeak = !usedStreamingAudio && enableVoiceInChat && (!showChatInterface || (showChatInterface && voiceEnabled && maiaReady));

      // If we used streaming audio, add message to history now (will show if "Show Text" is enabled)
      if (usedStreamingAudio && isInVoiceMode) {
        setMessages(prev => appendMessageCapped(prev, oracleMessage));
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
        // Use CI-shaped spokenText if available (MAIA Central), otherwise fall back to responseText
        const cleanVoiceText = cleanMessageForVoice(spokenTextForVoice || responseText);
        console.log('🧹 Cleaned for voice:', cleanVoiceText);

        // ECHO SUPPRESSION: Define cooldown OUTSIDE try block so finally can access it
        const cooldownMs = 0; // Instant - demo mode with headphones

        try {
          // Start speaking immediately
          const startSpeakTime = Date.now();
          console.log('⏱️ Starting speech at:', startSpeakTime);

          // Speak the cleaned response
          // Pass element hint to select appropriate elemental voice
          // 🔥 FIX: No character-based timeout here! maiaSpeak now uses
          // the ACTUAL audio duration from metadata for its timeout,
          // which is much more reliable than estimating from text length.
          await maiaSpeak(cleanVoiceText, element as Element, ttsInstructionsForVoice);

          const speakDuration = Date.now() - startSpeakTime;
          console.log(`🔇 Maia finished speaking after ${speakDuration}ms (${cleanVoiceText.length} chars)`);

          // ECHO SUPPRESSION: Extended cooldown to prevent audio tail from being recorded
          setEchoSuppressUntil(Date.now() + cooldownMs);
          console.log(`🛡️ Echo suppression active for ${cooldownMs}ms`);

          // In Voice mode, show text after speaking completes
          if (isInVoiceMode && showVoiceText) {
            setMessages(prev => appendMessageCapped(prev, oracleMessage));
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
            setMessages(prev => appendMessageCapped(prev, oracleMessage));
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

            // 🔥 FIX: Force React to flush state updates before attempting mic restart
            // Using requestAnimationFrame ensures we're after the React render cycle
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // 🔥 FIX: React state updates are ASYNC! Use retry loop to ensure state has propagated.
                const attemptMicRestart = (attempt: number) => {
                  if (attempt > 8) {
                    console.log('⚠️ [NON-STREAM] Mic restart failed after 8 attempts - forcing state reset');
                    // 🔥 RECOVERY: Force reset all blocking states and try one more time
                    setIsProcessing(false);
                    setIsResponding(false);
                    setIsAudioPlaying(false);
                    setIsMicrophonePaused(false);
                    isProcessingRef.current = false;
                    isRespondingRef.current = false;
                    isAudioPlayingRef.current = false;
                    isMicrophonePausedRef.current = false;
                    // Final attempt after forced reset
                    setTimeout(() => {
                      if (voiceSession.state.capabilities.canStartListening) {
                        console.log('🎤 [NON-STREAM] Final attempt after state reset...');
                        setIsMuted(false);
                        if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('non_stream_final_reset');
                      }
                    }, 500);
                    return;
                  }

                  if (voiceSession.state.capabilities.canStartListening) {
                    // Check ALL blocking conditions including mic pause and audio states
                    const canRestart = !isProcessingRef.current &&
                                       !isRespondingRef.current &&
                                       !isAudioPlayingRef.current &&
                                       !isMicrophonePausedRef.current;

                    console.log(`🔍 [NON-STREAM] Mic restart check (attempt ${attempt}): proc=${isProcessingRef.current}, resp=${isRespondingRef.current}, audio=${isAudioPlayingRef.current}, micPause=${isMicrophonePausedRef.current}`);

                    if (canRestart) {
                      console.log(`🎤 [NON-STREAM] Attempting mic restart (attempt ${attempt})...`);
                      if (lastSendWasVoiceRef.current) voiceSession.methods.startListening('non_stream_restart_attempt');
                      // Verify mic actually started after a brief delay
                      setTimeout(() => {
                        if (voiceSession.state.phase === 'listening') {
                          console.log('✅ [NON-STREAM] Microphone auto-resumed successfully');
                        } else {
                          console.log(`⚠️ [NON-STREAM] Mic didn't start on attempt ${attempt}, retrying...`);
                          if (attempt < 8) {
                            setTimeout(() => attemptMicRestart(attempt + 1), 400);
                          }
                        }
                      }, 150);
                    } else {
                      console.log(`⏸️ [NON-STREAM] Attempt ${attempt} blocked, retrying in 300ms...`);
                      setTimeout(() => attemptMicRestart(attempt + 1), 300);
                    }
                  } else {
                    console.log('⏸️ [NON-STREAM] No voice mic available - not in voice mode');
                  }
                };

                // Start first attempt immediately after React render cycle
                attemptMicRestart(1);
              });
            });
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

      // 🔥 CRITICAL: Reset voice state on error - no audio will play, so unblock mic immediately
      // Without this, voice mode stays stuck in "responding" state forever after 401/errors
      setIsResponding(false);
      setIsAudioPlaying(false);
      setIsMicrophonePaused(false);
      console.log('🔇 [ERROR RECOVERY] Reset voice state after API error');

      // Provide specific error messages based on error type
      let errorText = 'I apologize, I\'m having trouble connecting right now. Could you say that again?';
      if (error.name === 'AbortError') {
        console.error('🚨 API request timed out - connection may be slow');
        errorText = 'I\'m having trouble responding - your connection might be slow. Try asking again in a moment.';
      } else if (error.message?.includes('fetch')) {
        console.error('🚨 Network error - cannot reach server');
        errorText = 'I can\'t connect right now. Check your internet connection and try again.';
      } else if (error.message?.includes('401')) {
        console.error('🚨 Authentication required - user not signed in');
        errorText = 'You need to sign in to continue our conversation.';
      }

      // 🔁 Recovery seam: the turn didn't reach MAIA. Mark it not-delivered; a 401
      // gets an honest "Sign in to continue" path in the bubble footer, everything
      // else gets Resend. The member's words stay exactly where they authored them.
      setMessages(prev => markFailed(prev, targetMessageId, error?.message?.includes('401') ? 'auth' : 'error'));

      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'oracle',
        text: errorText,
        timestamp: new Date(),
        motionState: 'idle',
        source: 'system'
      };
      setMessages(prev => appendMessageCapped(prev, errorMessage));
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

      // 🌀 LENS CONSENT: Clear pending consent after message is processed
      // The consent was applied to this request, so reset for next message
      if (pendingLensConsent) {
        setPendingLensConsent(null);
        console.log('🌀 [LENS CONSENT] Cleared pending consent after processing');
      }

      // Only reset isResponding for text mode - voice mode handles this in onComplete
      if (!isVoiceStreaming) {
        setIsResponding(false);
        console.log('🔇 [TEXT MODE] Reset isResponding=false');
      } else {
        console.log('🔊 [VOICE MODE] Keeping isResponding - audio queue will reset when complete');
      }

      setCurrentMotionState('idle');
    }
  }, [isProcessing, isAudioPlaying, isResponding, sessionId, userId, onMessageAdded, agentConfig, messages.length, showChatInterface, voiceEnabled, maiaReady, maiaMode, pendingLensConsent, isSanctuary]);

  // 🔁 RECOVERY SEAM (Pattern A) — guarded resend of a not-delivered turn.
  // Reuses the member's existing bubble (retryOf); never creates a second turn.
  // The ref guards against concurrent duplicate retries from rapid taps — the
  // visible "Sending…" state disables the control, this makes it correct under races.
  const retryingIdsRef = useRef<Set<string>>(new Set());
  const handleResend = useCallback((messageId: string) => {
    if (retryingIdsRef.current.has(messageId)) return; // a retry is already in flight
    const target = messages.find(m => m.id === messageId);
    const payload = target?.text ?? '';
    if (!payload.trim()) return;
    retryingIdsRef.current.add(messageId);
    Promise.resolve(handleTextMessage(payload, undefined, messageId))
      .finally(() => { retryingIdsRef.current.delete(messageId); });
  }, [messages, handleTextMessage]);

  // ==================== SEED PROMPT PROCESSOR ====================
  // Process pending seed prompt once handleTextMessage is available
  // This runs after handleTextMessage is defined and sends any pending seed
  useEffect(() => {
    // Store ref for potential future use
    handleTextMessageRef.current = handleTextMessage;

    // Process any pending seed (from Guide/Academy "Take to MAIA" buttons)
    if (pendingSeedRef.current) {
      const seed = pendingSeedRef.current;
      pendingSeedRef.current = null; // Clear to prevent re-processing
      console.log('🌱 [SEED] Sending seed to handleTextMessage:', seed.prompt.slice(0, 50) + '...');

      // Clear previous conversation for fresh start with seeded prompt
      setMessages([]);
      lastSyncedCountRef.current = 0; // fresh thread — resync from the start
      historicalMessagesRef.current = []; // Clear API context too
      if (typeof window !== 'undefined' && sessionId) {
        const storageKey = `maia_conversation_${sessionId}`;
        localStorage.removeItem(storageKey);
        console.log('🌱 [SEED] Cleared conversation for fresh start');
      }
      setHasActivated(true); // Skip welcome screen

      // Small delay to ensure component is fully mounted and ready
      setTimeout(() => {
        handleTextMessage(seed.prompt);
      }, 100);
    }
  }, [handleTextMessage, sessionId]);

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    console.log('🎤 handleVoiceTranscript called with:', transcript);
    setInterimTranscript(''); // Clear interim display on final submit
    const t = transcript?.trim();
    if (!t) {
      console.log('⚠️ Empty transcript, returning');
      return;
    }

    // 🎤 PWA STATE MACHINE: Signal transcript received → transition to THINKING
    if (isPwaVoice) {
      pwaVoice.transcriptReceived(t);
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
    // Window extended to 30s to survive the full MAIA response cycle
    // (LLM generation + TTS + audio playback can take 10-20s)
    const now = Date.now();
    if (lastProcessedTranscriptRef.current) {
      const { text: lastText, timestamp: lastTime } = lastProcessedTranscriptRef.current;
      const timeSinceLastProcess = now - lastTime;

      // If same transcript within 30 seconds, it's a duplicate
      // (covers the full MAIA response cycle: LLM + TTS + playback + mic restart)
      if (lastText === t && timeSinceLastProcess < 30_000) {
        console.warn(`⚠️ Duplicate transcript detected (${timeSinceLastProcess}ms ago), ignoring:`, t);
        return;
      }
    }

    // Mark this transcript as processed
    lastProcessedTranscriptRef.current = { text: t, timestamp: now };

    // 🎙️ CONSENT BOUNDARY (fix/typed-turn-no-mic-rearm): accepted voice turn — the mic
    // may re-arm after the response. Set AFTER the feedback/duplicate guards so a
    // transcript rejected during a typed turn cannot flip this back to voice.
    lastSendWasVoiceRef.current = true;

    // 🌊 LIQUID AI - Track speech end with transcript for rhythm analysis
    rhythmTrackerRef.current?.onSpeechEnd(t);

    // 🚨 CRISIS DETECTION - Safety override that takes precedence over ALL modes
    // This runs FIRST before any voice command matching
    const crisisCheck = detectCrisis(t);
    if (crisisCheck.detected) {
      console.log(`🚨 [CRISIS] Level ${crisisCheck.level} detected:`, crisisCheck.trigger);
      crisisStateRef.current = crisisCheck;

      // Stop any ongoing MAIA speech immediately
      stopStreamingVoice();
      isAudioPlayingRef.current = false;
      setIsAudioPlaying(false);

      // Override mode to care (crisis is a hard override)
      setMaiaMode(prev => ({
        ...prev,
        mode: 'care',
        careSubMode: 'presence', // Crisis uses presence as base
      }));

      // Speak the crisis response script line by line
      if (crisisCheck.responseScript && maiaReady && maiaSpeak && !isMuted) {
        for (const line of crisisCheck.responseScript) {
          await maiaSpeak(line);
          // Small pause between lines for pacing
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      // The conversation will continue with crisis system prompt active
      // Don't return - let the message go through with crisis context
      // This allows MAIA to continue the safety conversation
    }

    // 🎭 COMPREHENSIVE VOICE COMMAND DETECTION (Talk/Care/Scribe modes, settings, actions)
    const voiceCmd = matchVoiceCommand(t);
    if (voiceCmd.matched) {
      console.log(`🎙️ [VoiceCommand] Matched: ${voiceCmd.command}`);
      lastVoiceCommandRef.current = voiceCmd;

      // Apply mode changes (Talk/Care/Scribe)
      if (voiceCmd.modeChange) {
        setMaiaMode(prev => ({
          ...prev,
          ...voiceCmd.modeChange,
        }));
        console.log(`🎭 [Mode] Switching to:`, voiceCmd.modeChange);
      }

      // Apply settings delta (speed, prosody, sanctuary, etc.)
      if (voiceCmd.settingsDelta) {
        try {
          const saved = localStorage.getItem('maia_settings');
          const currentSettings = saved ? JSON.parse(saved) : {};
          const newSettings = applySettingsDelta(currentSettings, voiceCmd.settingsDelta);
          localStorage.setItem('maia_settings', JSON.stringify(newSettings));
          window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: newSettings }));
          console.log(`⚙️ [Settings] Applied delta:`, voiceCmd.settingsDelta);

          // Update local voice settings state if speed/prosody changed
          if (voiceCmd.settingsDelta.speed !== undefined || voiceCmd.settingsDelta.speedDelta !== undefined) {
            setVoiceSettings(prev => ({
              ...prev,
              speed: newSettings.voice?.speed ?? prev.speed,
            }));
          }
          if (voiceCmd.settingsDelta.prosodyRange !== undefined || voiceCmd.settingsDelta.prosodyDelta !== undefined) {
            setVoiceSettings(prev => ({
              ...prev,
              prosodyRange: newSettings.voice?.prosodyRange ?? prev.prosodyRange,
            }));
          }

          // Handle sanctuary toggle
          if (voiceCmd.settingsDelta.sanctuary !== undefined) {
            setIsSanctuary(voiceCmd.settingsDelta.sanctuary);
          }

          // Handle interrupt settings
          if (voiceCmd.settingsDelta.interruptEnabled !== undefined) {
            setInterruptEnabled(voiceCmd.settingsDelta.interruptEnabled);
          }
        } catch (e) {
          console.error('[VoiceCommand] Failed to apply settings delta:', e);
        }
      }

      // Handle actions
      if (voiceCmd.action === 'pause') {
        // Stop any ongoing speech
        stopStreamingVoice();
        isAudioPlayingRef.current = false;
        setIsAudioPlaying(false);
      } else if (voiceCmd.action === 'capture') {
        // Trigger capture panel
        setShowCapturePanel(true);
      }

      // 📝 Handle Scribe actions
      if (voiceCmd.scribeAction) {
        const { type, container, markerType, markerNote } = voiceCmd.scribeAction;

        if (type === 'start' && container) {
          const result = await startScribeSession(container);
          if (result) {
            // Acknowledgment will be spoken by the normal handler below
            console.log(`📝 [SCRIBE] Started ${container} session, awaiting consent`);
          }
        } else if (type === 'pause') {
          await pauseScribeSession(true);
        } else if (type === 'resume') {
          await pauseScribeSession(false);
        } else if (type === 'stop') {
          const result = await stopScribeSession();
          if (result) {
            console.log(`📝 [SCRIBE] Session saved with ${result.session?.markerCount || 0} markers`);
          }
        } else if (type === 'mark') {
          await markScribeMoment(markerType, markerNote);
        } else if (type === 'aside') {
          // Toggle aside mode for private consultation without recording
          if (scribeSession.isActive && scribeSession.consentConfirmed) {
            toggleScribeAside(!scribeSession.isAside);
            console.log(`📝 [SCRIBE] Aside ${!scribeSession.isAside ? 'entered' : 'exited'}`);
          }
        } else if (type === 'consent-yes') {
          // Confirm consent for witness/couples mode
          if (scribeSession.isActive && !scribeSession.consentConfirmed) {
            await confirmScribeConsent(true);
            console.log(`📝 [SCRIBE] Consent confirmed, now witnessing`);
          }
        } else if (type === 'consent-no') {
          // Decline consent - mark declined in API and reset state
          if (scribeSession.isActive) {
            await confirmScribeConsent(false); // Mark as declined in DB
            setScribeSession(DEFAULT_SCRIBE_SESSION); // Reset local state
            console.log(`📝 [SCRIBE] Consent declined, session cancelled`);
          }
        } else if (type === 'transcript-on') {
          // Enable full transcript
          if (scribeSession.isActive) {
            await setTranscriptEnabled(true);
          }
        } else if (type === 'transcript-off') {
          // Disable transcript (summary only)
          if (scribeSession.isActive) {
            await setTranscriptEnabled(false);
          }
        }
      }

      // 📓 Handle Journal actions
      if (voiceCmd.journalAction) {
        const { type, title } = voiceCmd.journalAction;
        if (type === 'save') {
          // Save recent conversation to journal
          const recentMessages = messages.slice(-5); // Last 5 messages
          const content = recentMessages.map(m => `${m.role === 'user' ? 'You' : 'MAIA'}: ${m.text}`).join('\n\n');
          try {
            await apiFetch('/api/journal/quick', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content,
                type: 'reflection',
                source: 'voice_command',
              }),
            });
            toast.success('Saved to journal');
          } catch (err) {
            console.error('[Journal] Save error:', err);
            toast.error('Failed to save to journal');
          }
        } else if (type === 'dream') {
          // Save to dream journal
          const recentMessages = messages.slice(-5);
          const content = recentMessages.map(m => `${m.role === 'user' ? 'You' : 'MAIA'}: ${m.text}`).join('\n\n');
          try {
            await apiFetch('/api/journal/quick', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content,
                type: 'dream',
                source: 'voice_command',
              }),
            });
            toast.success('Saved to dream journal');
          } catch (err) {
            console.error('[Journal] Dream save error:', err);
            toast.error('Failed to save to dream journal');
          }
        } else if (type === 'title' && title) {
          // Update most recent journal entry title
          console.log(`[Journal] Would update title to: ${title}`);
          toast.success(`Title: "${title}"`);
        }
      }

      // 🌟 Handle Astrology actions
      if (voiceCmd.astrologyAction) {
        const { type } = voiceCmd.astrologyAction;
        if (type === 'transits') {
          // Fetch today's transits and speak them
          try {
            const res = await apiFetch('/api/astrology/transits/today');
            const data = await res.json();
            if (data.summary && maiaSpeak && maiaReady) {
              await maiaSpeak(data.summary);
            }
          } catch (err) {
            console.error('[Astrology] Transits error:', err);
            if (maiaSpeak && maiaReady) {
              await maiaSpeak("I couldn't fetch the transits right now. Let's try again later.");
            }
          }
        } else if (type === 'personal') {
          // Fetch personal transits based on birth chart
          try {
            const res = await apiFetch('/api/astrology/transits/personal');
            const data = await res.json();
            if (data.summary && maiaSpeak && maiaReady) {
              await maiaSpeak(data.summary);
            }
          } catch (err) {
            console.error('[Astrology] Personal transits error:', err);
            if (maiaSpeak && maiaReady) {
              await maiaSpeak("I need your birth chart data to share personal transits. Have you set that up?");
            }
          }
        }
      }

      // 📝 Handle Enhanced Scribe actions (partial summary, action items)
      if (voiceCmd.scribePartialAction) {
        const { type, minutes } = voiceCmd.scribePartialAction;
        if (type === 'summarize' && scribeSession.isActive && scribeSession.sessionId) {
          try {
            const res = await apiFetch('/api/scribe/partial-summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: scribeSession.sessionId,
                minutes: minutes || 5,
              }),
            });
            const data = await res.json();
            if (data.summary && maiaSpeak && maiaReady) {
              await maiaSpeak(data.summary);
            }
          } catch (err) {
            console.error('[Scribe] Partial summary error:', err);
            toast.error('Failed to generate summary');
          }
        } else if (type === 'action-capture' && scribeSession.isActive && scribeSession.sessionId) {
          try {
            const res = await apiFetch('/api/scribe/action-items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: scribeSession.sessionId,
              }),
            });
            const data = await res.json();
            if (data.actionItems?.length > 0 && maiaSpeak && maiaReady) {
              const itemsText = data.actionItems.map((item: string, i: number) => `${i + 1}. ${item}`).join('. ');
              await maiaSpeak(`Here are the action items: ${itemsText}`);
            } else if (maiaSpeak && maiaReady) {
              await maiaSpeak("I didn't find any clear action items in this session.");
            }
          } catch (err) {
            console.error('[Scribe] Action items error:', err);
            toast.error('Failed to extract action items');
          }
        }
      }

      // 🔇 Handle Voice Control (pause/resume MAIA speech)
      if (voiceCmd.action === 'voice-pause') {
        // Stop any ongoing speech and save for potential resume
        pausedResponseRef.current = lastMaiaResponseRef.current;
        stopStreamingVoice();
        isAudioPlayingRef.current = false;
        setIsAudioPlaying(false);
        console.log('🔇 [VoiceControl] MAIA speech paused');
      } else if (voiceCmd.action === 'voice-resume') {
        // Resume paused speech if available
        if (pausedResponseRef.current && maiaSpeak && maiaReady) {
          console.log('🔊 [VoiceControl] Resuming MAIA speech');
          await maiaSpeak(pausedResponseRef.current);
          pausedResponseRef.current = null;
        }
      }

      // Handle Presence Bell and Repair for Third Chair
      if (voiceCmd.action === 'presence-bell') {
        // Mark as softening moment
        if (scribeSession.isActive && scribeSession.consentConfirmed) {
          await markScribeMoment('softening', 'Presence bell invoked');
        }
      } else if (voiceCmd.action === 'repair') {
        // Mark as repair attempt
        if (scribeSession.isActive && scribeSession.consentConfirmed) {
          await markScribeMoment('repair', 'Repair prompt invoked');
        }
      }

      // Handle acknowledgment
      if (voiceCmd.acknowledgment !== 'silent' && voiceCmd.acknowledgmentText) {
        if (voiceCmd.acknowledgment === 'brief' || voiceCmd.acknowledgment === 'conversational') {
          // Speak the acknowledgment
          if (maiaReady && maiaSpeak && !isMuted) {
            await maiaSpeak(voiceCmd.acknowledgmentText);
          }
          toast.success(voiceCmd.acknowledgmentText, { duration: 2000 });
        } else if (voiceCmd.acknowledgment === 'chime') {
          // Just show toast (could add audio chime later)
          toast(voiceCmd.acknowledgmentText || 'Acknowledged', { duration: 1500 });
        }

        // If this was a pure command (no additional content), return
        // Check if transcript was just the command by seeing if it matched fully
        const isStandaloneCommand = t.length < 50; // Simple heuristic - commands are short
        if (isStandaloneCommand && !voiceCmd.action?.includes('reflect')) {
          return;
        }
      }
    }

    // 📝 TRANSCRIPT CAPTURE: Append user speech to transcript if scribe session is active
    // Skip control commands (scribe-*, voice-*, journal-*, astrology-*, presence-bell, repair, reflect)
    const isControlCommand = voiceCmd.matched && (
      voiceCmd.action?.startsWith('scribe-') ||
      voiceCmd.action?.startsWith('voice-') ||
      voiceCmd.action?.startsWith('journal-') ||
      voiceCmd.action?.startsWith('astrology-') ||
      voiceCmd.action === 'presence-bell' ||
      voiceCmd.action === 'repair' ||
      voiceCmd.action === 'reflect'
    );
    if (!isControlCommand) {
      await appendTranscriptEntry(t, 'self');
    }

    // 🎯 MAIA COMMAND DETECTION: mode/lens/style switching (voice path)
    // Uses the same unified detector as the text path.
    const voiceMaiaResult = detectMaiaCommands(t);
    if (voiceMaiaResult.commands.length > 0) {
      for (const cmd of voiceMaiaResult.commands) {
        if (cmd.type === 'mode') {
          const newListeningMode =
            cmd.mode === 'talk' ? 'normal' as const :
            cmd.mode === 'care' ? 'patient' as const :
            cmd.mode === 'scribe' ? 'session' as const :
            cmd.mode === 'sanctuary' ? 'normal' as const :
            'normal' as const;
          setListeningMode(newListeningMode);
          if (cmd.mode === 'sanctuary') setIsSanctuary(true);
          else setIsSanctuary(false);
          console.log(`🔄 [Voice Command] Mode → ${cmd.mode}`);
        }
        if (cmd.type === 'lens') {
          setCounselFramework(cmd.lens);
          console.log(`🔄 [Voice Command] Lens → ${cmd.lens}`);
        }
        if (cmd.type === 'style') {
          localStorage.setItem('conversation_mode', cmd.style);
          window.dispatchEvent(new Event('conversationStyleChanged'));
          console.log(`🔄 [Voice Command] Style → ${cmd.style}`);
        }
      }

      const confirmation = getMaiaCommandConfirmation(voiceMaiaResult.commands);

      // Command-only: acknowledge and return
      if (voiceMaiaResult.onlyCommands) {
        console.log('✅ [Voice Command] Command-only, no content to process');
        if (confirmation && maiaReady && maiaSpeak && !isMuted) {
          await maiaSpeak(confirmation);
        }
        if (confirmation) toast.success(confirmation);
        return;
      }

      // Command + content: show confirmation, continue with cleaned text
      if (confirmation) toast.success(confirmation);
      transcript = voiceMaiaResult.cleanedText;
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

    // 📝 SCRIBE MODE: Record passively without MAIA response (unless in aside mode)
    if (isScribing && !scribeSession.isAside) {
      console.log('📝 [Scribe Mode] Recording voice transcript passively:', cleanedText.substring(0, 50) + '...');
      recordVoiceTranscript(cleanedText);
      return; // Don't trigger MAIA response when witnessing
    }

    // 💬 ASIDE MODE: Private consultation with MAIA (not recorded)
    if (isScribing && scribeSession.isAside) {
      console.log('💬 [Aside Mode] Private consultation (not recorded):', cleanedText.substring(0, 50) + '...');
      // Continue to process and get MAIA response, but don't record
    }

    try {
      // ⛔ VOICE-CANONICAL-CONVERGENCE-02 — THE DIVERGENT COGNITION EXIT IS GONE.
      //
      // A `streamingVoiceMode && !showChatInterface` branch used to sit here. It
      // called `sendStreamingMessage(...)` and RETURNED — before
      // `handleTextMessage` below — sending the turn to
      // `/api/voice/stream-conversation`. That route operates its own Claude
      // service, memory bundle, relational stack, prompt machinery and TTS: zero
      // references to `getMaiaResponse`, `maiaService`, `buildMaiaWisePrompt` or
      // `finalizeMemberFacingText`. It was not a thinner call into canonical
      // cognition. It was a SECOND MIND.
      //
      // ⛔ And it was the DEFAULT. `streamingVoiceMode` is hard-initialised true
      // (see its useState), so the ordinary spoken turn took the divergent exit
      // while typed turns took the canonical one. Spoken and typed MAIA were
      // different systems.
      //
      // ⛔ REMOVED STRUCTURALLY, NOT DEFAULTED OFF. Flipping the flag would have
      // made the defect dormant rather than impossible: any override could
      // restore a second cognition path. There is now exactly one
      // response-producing cognition exit from this function, and restoring a
      // second requires editing this code and breaking the positive gate in
      // `__tests__/voice-non-degradation.test.ts`.
      //
      // ⛔ THE STREAMING IMPLEMENTATION IS UNTOUCHED AND UNDELETED.
      // `sendStreamingMessage`, `useStreamingVoice`, the SSE protocol and the
      // route all remain exactly as they are — evidence, and the starting point
      // for a separately authorized transport-extraction unit. Only voice's
      // reachability into it is removed.
      //
      // ⚠️ THE COST, RECORDED RATHER THAN DISCOVERED. Canonical voice sacrifices
      // token-streaming latency for single-cognition convergence. MAIA still
      // speaks — the canonical path returns audio via `includeAudio: true` — but
      // first sound now waits for the canonical response to complete instead of
      // beginning mid-generation. That is the price of one mind, and it was
      // ruled worth paying.
      //
      // ⛔ WHY STREAMING COULD NOT SIMPLY BE DEMOTED TO TRANSPORT. Streaming's
      // value is emitting tokens AS the model generates them. Once canonical
      // cognition must complete first, there is nothing left to stream — only
      // chunked TTS of a finished text, which is a different feature. The route
      // also emits `silence` (MAIA deliberately not answering) and
      // `move_outcome`; both are cognition decisions a transport layer cannot
      // author.

      // ✅ STANDARD FLOW: Browser STT → /api/between/chat → Browser TTS
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
      setMessages(prev => appendMessageCapped(prev, errorMessage));
      onMessageAddedRef.current?.(errorMessage);

      // Reset states on error / timeout (was already here; preserved for clarity)
      setIsResponding(false);
    } finally {
      // 🛡️ Guaranteed isProcessing release. Safe to clear unconditionally —
      // it gates the "thinking" indicator but not audio playback. isResponding
      // is intentionally NOT cleared here on the happy path: the streaming
      // audio queue's onComplete owns that transition so the visualizer doesn't
      // cut out mid-speech. On throw/timeout the catch block above clears it.
      setIsProcessing(false);
    }
  }, [handleTextMessage, isProcessing, isResponding, isAudioPlaying, messages, echoSuppressUntil, maiaReady, isMuted, sessionId, userId, oracleAgentId, onMessageAdded, maiaSpeak, stopStreamingVoice, startScribeSession, pauseScribeSession, stopScribeSession, markScribeMoment, confirmScribeConsent, setTranscriptEnabled, appendTranscriptEntry, scribeSession]);

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
      const response = await apiFetch('/api/obsidian/save-conversation', {
        method: 'POST',
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

      console.log(`🎵 Speaking with OpenAI ${voiceSettings.voice}:`, cleanText.substring(0, 100));

      // Call OpenAI TTS with voice settings from account preferences
      const response = await apiFetch('/api/voice/openai-tts', {
        method: 'POST',
        body: JSON.stringify({
          text: cleanText,
          voice: voiceSettings.voice,
          speed: voiceSettings.speed,
          model: voiceSettings.model
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.volume = voiceVolume;
      audioRef.current = audio;

      audio.onended = () => {
        setCurrentlySpeakingId(undefined);
        setIsResponding(false);
        setIsAudioPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('❌ OpenAI TTS error (no fallback - OpenAI TTS only):', error);
      // NO browser TTS fallback - we only use OpenAI TTS
      // If OpenAI fails, stay silent rather than use robotic browser voice
      toast.error('Voice unavailable');
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

    // Mute the microphone - user emergency stop
    setIsMuted(true);
    voiceSession.methods.stopListening(); // 🔥 FIX: User-initiated emergency stop

    // Reset all states
    setIsResponding(false);
    setIsAudioPlaying(false);
    setIsMicrophonePaused(true);
    setCurrentlySpeakingId(undefined);

    console.log('🛑 All MAIA systems stopped (emergency stop)');
  }, []);

  // ⏰ Session Timer Handlers
  const handleStartSession = useCallback((durationMinutes: number) => {
    console.log(`⏰ Starting ${durationMinutes}-minute session with temporal container`);

    // 🧹 Clear previous conversation when starting a new session
    console.log('🧹 Clearing previous conversation for fresh session start');
    setMessages([]);
    lastSyncedCountRef.current = 0; // fresh thread — resync from the start
    historicalMessagesRef.current = []; // Clear API context too
    sessionRestoredRef.current = false; // Allow greeting to run for fresh session
    sessionStorage.removeItem('maia_nav_teardown'); // Don't restore on next navigation
    setHasActivated(false); // Reset to show welcome/greeting
    // Clear localStorage for previous conversation
    if (typeof window !== 'undefined' && sessionId) {
      const storageKey = `maia_conversation_${sessionId}`;
      localStorage.removeItem(storageKey);
      console.log(`🧹 Cleared localStorage: ${storageKey}`);
    }

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
    // 🧹 Clear previous conversation messages
    setMessages([]);
    lastSyncedCountRef.current = 0; // fresh thread — resync from the start
    historicalMessagesRef.current = []; // Clear API context too
    sessionRestoredRef.current = false; // Allow greeting to run for fresh session
    sessionStorage.removeItem('maia_nav_teardown'); // Don't restore on next navigation
    setHasActivated(false);
    if (typeof window !== 'undefined' && sessionId) {
      const storageKey = `maia_conversation_${sessionId}`;
      localStorage.removeItem(storageKey);
    }
    // Note: User will click header button to open session selector
  }, [sessionId]);

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

    // Finalize session: Sanctuary purge or Continuity summary pipeline
    // Uses apiFetch for iOS/Capacitor compatibility (x-member-id header)
    const memberId = getValidMemberId();
    if (memberId && sessionId) {
      apiFetch('/api/sovereign/session/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          sessionId,
          isSanctuary,
          endedAt: new Date().toISOString(),
        }),
      }).catch(err =>
        console.warn('Session finalize failed (non-blocking):', err)
      );
    }
  }, [onSessionActiveChange, sessionId, isSanctuary]);

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
    // GEOMETRY INVARIANT (#703): this shell must NOT be the containing block for
    // its position:fixed descendants. `bg-soul-background` animates `filter`
    // (hearthlight), and a non-`none` filter makes an element the containing
    // block for every fixed descendant — same rule as `transform`. The shell is
    // min-h-screen (100vh) but starts 48px below the viewport top, so its box
    // overhangs the bottom by 48px; "fixed" children then resolved against
    // 48…100vh+48 instead of the viewport. Measured: composer `bottom: 44px`
    // landed at 100vh + 4, i.e. 4px below the visible bottom, on every device.
    // The breathing moves to a background layer that owns nothing positioned.
    // `relative` is safe here: position:relative does not establish a containing
    // block for fixed descendants — only transform/filter/perspective/contain do.
    <div className="oracle-conversation relative min-h-screen overflow-hidden">
      <div className="bg-soul-background absolute inset-0 pointer-events-none" aria-hidden="true" />
      {/* iOS Audio Enable Button - Required for TTS on iOS Safari */}
      {needsIOSAudioPermission && (
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

      {/* 🔊 Audio Unlock Recovery UI - Shows when streaming audio fails (iOS NotAllowedError) */}
      {showAudioUnlockUI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-w-sm p-8 text-center">
            <div className="text-4xl mb-4">🔇</div>
            <h3 className="text-lg font-medium text-white mb-2">Audio Interrupted</h3>
            <p className="text-sm text-white/60 mb-6">
              Audio playback was blocked. Tap below to re-enable MAIA&apos;s voice.
            </p>
            <button
              onClick={async () => {
                console.log('🔓 [OracleConversation] User tapping to re-unlock audio');
                setShowAudioUnlockUI(false);
                await enableAudio();
                // Re-unlock the streaming queue as well
                if (currentAudioQueueRef.current) {
                  currentAudioQueueRef.current.setAudioUnlocked(true);
                  try {
                    await currentAudioQueueRef.current.unlockSafariAudio();
                    console.log('✅ [OracleConversation] StreamingAudioQueue re-unlocked');
                  } catch (err) {
                    console.warn('⚠️ [OracleConversation] StreamingAudioQueue re-unlock failed:', err);
                  }
                }
                toast.success('Audio re-enabled', { duration: 2000, position: 'top-center' });
              }}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl
                       shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="text-lg font-medium">Tap to Re-enable Audio</span>
            </button>
            <button
              onClick={() => {
                console.log('⏭️ User dismissing audio unlock prompt');
                setShowAudioUnlockUI(false);
              }}
              className="mt-4 text-white/40 hover:text-white/60 text-sm underline transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Branded Welcome Message - REMOVED for mobile optimization */}

      {/* 🛑 LIMITS BANNER: Soft cap nudge (non-blocking, dismissible) */}
      {limitsBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]">
          <div className="rounded-xl border border-white/10 bg-soul-background/95 backdrop-blur-sm px-4 py-3 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-amber-400/80 text-lg">✦</span>
              <div className="flex-1">
                <p className="text-sm text-white/80">{limitsBanner.message}</p>
              </div>
              <button
                onClick={() => setLimitsBanner(null)}
                className="text-white/40 hover:text-white/60 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛑 LIMITS BLOCK: Hard cap reached (modal overlay) */}
      {limitsBlock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-soul-background p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 text-xl">✦</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white/90 font-medium mb-2">Taking a pause</h3>
                <p className="text-sm text-white/70 mb-4">{limitsBlock.message}</p>
                <button
                  onClick={() => setLimitsBlock(null)}
                  className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white/85 hover:bg-white/15 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claude-like Welcome Greeting - Shows until user activates (taps holoflower)
       *
       * `shouldRenderArrival ||` is load-bearing for the deliberate return. The
       * rest of this gate describes a member who has not yet started talking, so
       * on a first visit it is satisfied anyway. But a member who returns from
       * The House HAS already activated and already has a transcript — without
       * this term the return set every piece of state correctly (the rail
       * receded, the doorway moved) and then rendered nothing, because the one
       * composition it was supposed to open sat inside a branch reserved for
       * people who had never spoken.
       *
       * Arrival still yields the moment the member speaks: markArrived clears
       * arrivalInvoked, which makes shouldRenderArrival false again. */}
      <AnimatePresence>
        {(shouldRenderArrival || (!hasActivated && !isProcessing && !isResponding)) && (() => {
          // Derive memberStyleProfile from beta_user preferences (if stored)
          const betaUser = safeJsonParse<Record<string, unknown>>(
            typeof window !== 'undefined' ? localStorage.getItem('beta_user') : null
          );
          const memberStyleProfile = coerceStyleProfile(
            betaUser?.memberStyleProfile ??
            betaUser?.styleProfile ??
            (betaUser?.voiceProfile as Record<string, unknown> | undefined)?.styleProfile ??
            (betaUser?.voiceProfile as Record<string, unknown> | undefined)?.tone ??
            (betaUser?.preferences as Record<string, unknown> | undefined)?.tone
          );

          // Derive lastConversationTheme from historical messages (if any)
          const history = historicalMessagesRef.current;
          const lastUserMsg = history.filter(m => m.role === 'user').pop();
          const lastAssistantMsg = history.filter(m => m.role === 'oracle' || m.role === 'assistant').pop();
          const lastConversationTheme = pickLastConversationTheme({
            lastUserText: typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : undefined,
            lastAssistantText: typeof lastAssistantMsg?.content === 'string' ? lastAssistantMsg.content : undefined,
          });

          // Generate personalized welcome greeting (one clean signal)
          const hourLocal = new Date().getHours();
          const welcomeGreeting = generateWelcomeGreeting({
            userName,
            daysSinceLastVisit,
            hourLocal,
            memberStyleProfile,
            lastConversationTheme,
          });

          // Debug log removed - was causing console spam on every re-render
          // To debug greeting logic, use: console.log('[WELCOME GREETING]', { hourLocal, memberStyleProfile, lastConversationTheme, welcomeGreeting });

          // Arrival remodel: render the ONE contained arrival composition
          // instead of the scattered greeting overlay. This returns early by
          // design — the legacy z-40 overlay below is never mounted while the
          // arrival field is active, so exactly one Arrival renderer exists at a
          // time rather than a composed field layered over the legacy arrival
          // still running underneath it.
          //
          // Gated on shouldRenderArrival, the same value that drives greeting
          // suppression above, so the renderer and the suppression can never
          // disagree about whether Arrival is on screen.
          if (shouldRenderArrival) {
            return (
              <MaiaArrivalField
                greeting={welcomeGreeting.greeting}
                subtext={welcomeGreeting.subtext}
                userInitial={(userName || 'K').trim().charAt(0).toUpperCase()}
                onSend={(text) => handleTextMessage(text)}
                onActivate={() => {
                  // #736: hasActivated alone cannot exit — the gate above is a
                  // disjunction and ignores it while shouldRenderArrival is
                  // true. onArrivalCrossed clears the parent's session-scoped
                  // arrival state so the non-writing crossing actually
                  // dismisses Arrival (without writing the durable marker —
                  // activation is not expression).
                  setHasActivated(true);
                  onArrivalCrossed?.();
                }}
                onOpenHouse={() => window.dispatchEvent(new CustomEvent('openMaiaHouse'))}
                onKeep={() => window.dispatchEvent(new CustomEvent('labAction', { detail: { action: 'capture-spirit' } }))}
              />
            );
          }

          return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-5 px-4 w-full max-w-2xl pointer-events-auto">
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
                    src="/logo_flower 2.png"
                    alt="MAIA"
                    className="w-14 h-14 md:w-16 md:h-16 object-contain"
                  />
                </motion.div>

                {/* Greeting Text - Quieter confidence, not hero announcement */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-light text-maia-spice-500"
                  style={{
                    fontFamily: 'Spectral, Georgia, serif',
                    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {welcomeGreeting.greeting}
                </motion.h1>
              </div>

              {/* Welcome Invitation - one clean signal, context-aware */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full text-center"
              >
                <p
                  className="text-maia-ink-60 text-lg md:text-xl"
                  style={{ fontFamily: 'Spectral, Georgia, serif' }}
                >
                  {welcomeGreeting.subtext}
                </p>
              </motion.div>
            </div>
          </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Scribe Mode Recording Indicator - Red when witnessing, Blue when aside */}
      <AnimatePresence>
        {isScribing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-below-nav"
          >
            <div className={`backdrop-blur-xl rounded-2xl px-4 py-3 border shadow-2xl transition-colors duration-300 ${
              scribeSession.isAside
                ? 'bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-blue-400/50'
                : scribeSession.isPaused
                  ? 'bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border-amber-400/50'
                  : 'bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-400/50'
            }`}>
              <div className="flex items-center gap-3">
                {/* Recording indicator light */}
                <motion.div
                  animate={scribeSession.isPaused || scribeSession.isAside ? {} : {
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    scribeSession.isAside
                      ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]'
                      : scribeSession.isPaused
                        ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                        : 'bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.9)]'
                  }`}
                />

                {/* Status text */}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    scribeSession.isAside ? 'text-blue-300' : scribeSession.isPaused ? 'text-amber-300' : 'text-red-300'
                  }`}>
                    {scribeSession.isAside
                      ? '💬 Aside Mode'
                      : scribeSession.isPaused
                        ? '⏸️ Paused'
                        : scribeSession.container === 'solo'
                          ? '🧘 1st Chair • Solo'
                          : scribeSession.container === 'witness'
                            ? '👁️ 2nd Chair • Witness'
                            : '📋 3rd Chair • Practitioner'}
                  </div>
                  <div className={`text-xs ${
                    scribeSession.isAside ? 'text-blue-400/70' : scribeSession.isPaused ? 'text-amber-400/70' : 'text-red-400/70'
                  }`}>
                    {scribeSession.isAside
                      ? 'Private consultation • Not recording'
                      : scribeSession.isPaused
                        ? 'Session paused • Say "resume scribe"'
                        : scribeSession.container === 'solo'
                          ? 'Self-study • journaling'
                          : scribeSession.container === 'witness'
                            ? 'Observing • not responding'
                            : 'Session notes • skill tracking'}
                  </div>
                </div>

                {/* Aside toggle button */}
                <button
                  onClick={() => toggleScribeAside(!scribeSession.isAside)}
                  className={`p-2 rounded-lg transition-colors ${
                    scribeSession.isAside
                      ? 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-200'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                  title={scribeSession.isAside ? 'Return to witnessing' : 'Enter aside mode (private consultation)'}
                >
                  {scribeSession.isAside ? <Eye className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                </button>
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

      {/* 🔖 KEEP — always-visible, conversation-level action flanking the jewel.
          Keep is a primary MAIA verb; the per-message "Keep this moment"
          affordance is hover-only and therefore undiscoverable on mobile, where
          hover does not exist. This persistent bookmark opens the EXISTING Keep
          capture flow (handleCaptureSpirit → /api/capsules/from-chat-window →
          CaptureSpiritPanel) — NO second persistence model, and nothing is saved
          on tap (the panel opens for the member to choose). Placed in the top
          "identity + global utilities" zone, not above/inside the composer.
          Hidden in Sanctuary: handleCaptureSpirit does not itself guard
          isSanctuary, so we refuse to even OFFER Keep during a Sanctuary session
          (defense-in-depth, mirroring the inline keep and the CLAUDE.md Sanctuary
          absolute boundary). 44x44 touch target; visible glyph is smaller.

          Rendered as the exact COMPLEMENT of the arrival/greeting block above
          (same shouldRenderArrival / !hasActivated condition): that composition
          renders its OWN Keep affordance, so showing ours simultaneously would
          put two bookmarks on screen at once. The rule is NOT "one Keep in
          every state" — it is: a Keep exists wherever there is something to
          keep. The arrival composition carries its own Keep pre-activation;
          this bookmark covers the live conversation (the very surface Kelly
          flagged as missing it); and the returning-member pre-activation
          welcome state (legacy greeting, hasActivated=false,
          shouldRenderArrival=false) has NO Keep anywhere, by design — nothing
          exists to capture yet (the capture flow itself requires ≥2 messages). */}
      {!isSanctuary &&
        !(shouldRenderArrival || (!hasActivated && !isProcessing && !isResponding)) && (
        <div
          className="fixed left-4 md:left-20 z-below-nav"
          style={{ top: 'max(env(safe-area-inset-top, 0px) + 2rem, 7rem)' }}
        >
          <button
            type="button"
            onClick={handleCaptureSpirit}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-maia-spice-400/60 backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-maia-spice-400"
            title="Keep something from this conversation"
            aria-label="Keep something from this conversation"
          >
            <Bookmark className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* 🧠 TRANSFORMATIONAL PRESENCE - NLP-Informed State Container */}
      {/* Breathing entrainment, color transitions, field expansion based on state */}
      {/* NO cognitive UI - the experience itself induces the transformation */}
      <div className="fixed top-16 sm:top-14 left-1/2 -translate-x-1/2 z-[25]">
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
              // PR 10 diagnostic: first marker in the voice trace.
              // If this never appears in the on-screen overlay when the user
              // taps the holoflower, the click event isn't reaching here at
              // all (event wiring / pointer-events / overlay z-index issue).
              pushVoiceDebug('🎯 holoflower tap');
              console.log('🌸 Holoflower clicked!', { voiceMicRef: !!voiceMicRef.current, isListening, isMuted, isPwaVoice, pwaState: isPwaVoice ? pwaVoice.state : 'N/A' });

              // 🎤 PWA STATE MACHINE PATH: For Safari PWA, delegate to state machine
              // PWA uses isMuted as source of truth (user intent), not isListening (technical state)
              if (isPwaVoice) {
                if (pwaVoice.isMuted) {
                  // User wants to start speaking
                  await pwaVoice.userWantsToStart();
                } else {
                  // User wants to stop
                  pwaVoice.userWantsToStop();
                  setIsMuted(true);
                  setIsListening(false);
                }
                return; // PWA flow handled entirely by state machine
              }

              // === NON-PWA PATH (iOS native / other browsers) ===

              // 🔥 iOS FIX: Warm audio element SYNCHRONOUSLY before any await
              // iOS Safari requires audio element creation + play in the SAME synchronous event handler
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
              if (isIOS && !iosWarmedAudioRef.current) {
                console.log('📱 [iOS] SYNC warming audio element on click');
                try {
                  const audio = new Audio();
                  audio.setAttribute('playsinline', '');
                  audio.setAttribute('webkit-playsinline', '');
                  (audio as any).playsInline = true;
                  audio.volume = 1.0;
                  audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA';
                  // MUST call play() synchronously in the click handler
                  audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    console.log('✅ [iOS] Audio element warmed and ready');
                  }).catch(err => {
                    console.warn('⚠️ [iOS] Warm play failed:', err);
                  });
                  iosWarmedAudioRef.current = audio;
                } catch (err) {
                  console.warn('⚠️ [iOS] Failed to create warmed audio:', err);
                }
              }

              // Enable audio context (can be async now that audio element is warmed)
              await enableAudio();

              // 🔥 iOS Safari: Unlock the streaming voice audio element
              // This MUST be called from user gesture for TTS to work on iOS
              try {
                await unlockStreamingAudio();
                console.log('✅ [iOS] Streaming audio unlocked');
              } catch (err) {
                console.warn('⚠️ [iOS] Streaming audio unlock failed:', err);
              }

              // 🔥 FIX: Use isMuted as source of truth for toggle - isListening can desync on iOS
              // isMuted=true means user wants to be muted → tap means START listening
              // isMuted=false means user is actively listening → tap means STOP listening
              if (voiceMicRef.current) {
                if (isMuted) {
                  // TAP-TO-INTERRUPT: If MAIA is speaking, stop her and start listening
                  let isInterrupt = false;
                  if (isAudioPlayingRef.current || isRespondingRef.current) {
                    console.log('🛑 [INTERRUPT] User tapped while MAIA speaking - stopping playback');
                    isInterrupt = true;

                    // Stop MAIA's voice stream and playback
                    stopStreamingVoice();

                    // Reset state flags immediately
                    isAudioPlayingRef.current = false;
                    isRespondingRef.current = false;
                    setIsResponding(false);
                    setIsAudioPlaying(false);

                    // Brief visual feedback
                    toast('✋ Interrupted', { duration: 1000 });

                    // Small delay to let audio cleanup complete before starting mic
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                  // Start listening
                  console.log('[voice] startListening called', {
                    isMuted,
                    isListening,
                    showChatInterface,
                    hasVoiceMicRef: !!voiceMicRef.current,
                    hasVoiceSession: !!voiceSession,
                    isInterrupt,
                  });
                  toast('🎤 Activating voice...', { duration: 2000 });
                  // 📋 Once-per-session micro-toast: remind user of tap-to-talk default
                  if (!hasShownVoiceReentryToastRef.current) {
                    hasShownVoiceReentryToastRef.current = true;
                    setTimeout(() => {
                      toast('👆 Tap-to-talk · hands-free resets when you mute', { duration: 3000 });
                    }, 2200); // Show after "Activating voice" toast fades
                  }
                  setIsMuted(false);
                  setIsActivating(true); // Show "Activating..." - NOT "Listening" yet!
                  // NOTE: isListening will be set by handleRecordingStateChange when mic is actually live

                  // 🛡️ SAFETY TIMEOUT: Clear activating state if mic doesn't confirm within 5 seconds
                  if (activatingTimeoutRef.current) {
                    clearTimeout(activatingTimeoutRef.current);
                  }
                  activatingTimeoutRef.current = setTimeout(() => {
                    console.warn('⚠️ [voice] Mic activation timeout - clearing stuck state');
                    setIsActivating(false);
                    setIsMuted(true);
                    activatingTimeoutRef.current = null;
                    toast.error('🎤 Mic failed to start. Tap again to retry.', { duration: 3000 });
                  }, 5000);

                  // Use setTimeout to ensure state is set before starting mic (user gesture pattern)
                  // 🔥 FIX: Pass interrupt flag when interrupting MAIA
                  try {
                    await voiceSession.methods.startListening(isInterrupt ? 'user_interrupt' : 'user_gesture');
                    console.log('[voice] startListening resolved OK');
                    // Don't set isListening here - handleRecordingStateChange will do it when mic is confirmed
                  } catch (error: any) {
                    // Clear safety timeout since we're handling the error
                    if (activatingTimeoutRef.current) {
                      clearTimeout(activatingTimeoutRef.current);
                      activatingTimeoutRef.current = null;
                    }
                    const name = error?.name || 'UnknownError';
                    const msg = error?.message || String(error);
                    console.error('[voice] startListening FAILED', name, msg, error);

                    // IMPORTANT: do NOT switch to text automatically.
                    // Keep the user in voice mode and show what to do.
                    setIsActivating(false);
                    setIsListening(false);
                    setIsMuted(true);

                    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
                      toast.error('🎤 Microphone blocked. Click lock icon → Site settings → Microphone: Allow, then refresh.', { duration: 8000 });
                      return;
                    }

                    if (name === 'NotFoundError') {
                      toast.error('🎤 No mic detected. Chrome may be set to a disconnected device. Check chrome://settings/content/microphone', { duration: 8000 });
                      return;
                    }

                    if (msg === 'VOICE_UNAVAILABLE') {
                      toast.error('🎤 Voice unavailable. Check browser compatibility (Chrome/Safari recommended).', { duration: 5000 });
                      return;
                    }

                    if (msg === 'MICROPHONE_UNAVAILABLE') {
                      toast.error('🎤 No mic devices found. Check macOS System Settings → Privacy → Microphone → Chrome ON', { duration: 8000 });
                      return;
                    }

                    toast.error(`🎤 Voice failed: ${name} - ${msg}`, { duration: 5000 });
                  }
                } else {
                  // Stop listening - user explicitly exiting voice mode
                  console.log('🔇 Stopping voice via holoflower (USER EXIT MODE)...');
                  setIsMuted(true);
                  // Note: isHandsFreeMode stays true (default) — ContinuousConversation refs reinitialize on remount
                  voiceSession.methods.stopListening(); // 🔥 FIX: User-initiated exit
                  console.log('✅ Voice stopped successfully (user exit mode)');
                }
              } else {
                console.warn('⚠️ Voice ref not available');
                toast.error('⚠️ Voice component not mounted!');
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

            {/* Holoflower Image - Two layers with golden ratio */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              {/* Outer layer - 90% */}
              <img
                src="/holoflower.png"
                alt="Holoflower outer layer"
                className="object-contain absolute"
                style={{
                  width: `${holoflowerSize * 0.90}px`,
                  height: `${holoflowerSize * 0.90}px`,
                  opacity: 0.4,
                }}
              />
              {/* Inner layer - 90% / φ ≈ 55.6% */}
              <img
                src="/holoflower.png"
                alt="Holoflower inner layer"
                className="object-contain absolute"
                style={{
                  width: `${holoflowerSize * 0.556}px`,
                  height: `${holoflowerSize * 0.556}px`,
                  opacity: 0.7,
                }}
              />
              {/* White center dot - covers dark center */}
              <div
                className="absolute rounded-full"
                style={{
                  width: `${holoflowerSize * 0.12}px`,
                  height: `${holoflowerSize * 0.12}px`,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 60%, transparent 100%)',
                }}
              />
            </div>

            {/* 💜 ULTRAVIOLET GLOW - When ready/listening (responds to user voice amplitude) */}
            <AnimatePresence>
              {!isResponding && !isAudioPlaying && !isProcessing && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 🌌 AURORA — member speaking / MAIA listening.
                      Ultraviolet identity preserved: this is how the member
                      knows the field is theirs, distinct from MAIA's teal.
                      Softened by the same discipline as the teal aurora.

                      Two defects removed here, not one:
                      (1) all three layers drove opacity from raw
                          `voiceAmplitude` through 40–60ms transitions
                          (0.7→1.0, 0.75→1.0, 0.8→1.0) — syllable-rate
                          large-area flashing, past WCAG 2.3.1;
                      (2) `voiceAmplitude > 0.1 ? undefined : [...]` handed
                          control back and forth between Framer's animation
                          and the inline style every time amplitude crossed
                          0.1 — so speech hovering near the threshold caused
                          repeated abrupt swaps, a flicker source all on its
                          own, independent of (1). Coupling is now continuous:
                          one envelope, no threshold, no handoff. */}

                  {/* ── SAFETY MECHANICS ONLY — palette/atmosphere HELD ────
                      Colors, sizes, blur, gradients and geometry are UNCHANGED
                      from the original field. The identity/atmosphere redesign
                      (member = ultraviolet; MAIA = deep indigo opening into soft
                      silver-grey luminosity, pre-dawn/mineral rather than "lit
                      up"; gold reserved for rare semantic or sacred emphasis)
                      is HELD design work with its own ruling, pending trace #4.
                      It must not land silently through a safety repair.

                      Fixed here, and only this:
                      (1) opacity no longer derives from raw `voiceAmplitude`.
                          Speech modulates at 4–8 Hz; bound to opacity through a
                          30–70ms transition on a large glowing area that is
                          luminance flashing past the WCAG 2.3.1 three-per-second
                          threshold — a seizure risk, not a style preference.
                          Brightness is now a slow fixed breath; amplitude
                          touches scale (breadth) only.
                      (2) the `voiceAmplitude > 0.1 ? undefined : [...]` ternary
                          is gone. It swapped animation ownership between Framer
                          and the inline style whenever amplitude crossed 0.1, so
                          speech hovering near the threshold flickered on its own
                          — a defect independent of (1).
                      (3) scale reads `auroraLevel` (the slewed rAF envelope)
                          through a long transition, so a hard amplitude step
                          arrives as a swell, never a snap.
                      (4) prefers-reduced-motion stills the reactivity while
                          KEEPING the field visible — the who-is-speaking signal
                          is never removed, only held still. */}

                  {/* Outermost diffuse ultraviolet field - ambient glow */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: '500px',
                      height: '500px',
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(139, 92, 246, 0.15) 60%, transparent 100%)',
                      filter: 'blur(40px)',
                      transform: `scale(${1 + auroraLevel * 0.10})`,
                      transition: 'transform 1.6s ease-out',
                    }}
                    animate={prefersReducedMotion ? { opacity: 0.75 } : {
                      opacity: [0.7, 0.85, 0.7],
                    }}
                    transition={prefersReducedMotion ? { duration: 0.4 } : {
                      duration: AURORA_BREATH_S,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Outer ultraviolet ring - voice reactive (breadth only) */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: '380px',
                      height: '380px',
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(139, 92, 246, 0.5) 40%, rgba(167, 139, 250, 0.25) 70%, transparent 100%)',
                      filter: 'blur(25px)',
                      transform: `scale(${1 + auroraLevel * 0.14})`,
                      transition: 'transform 1.6s ease-out',
                    }}
                    animate={prefersReducedMotion ? { opacity: 0.85 } : {
                      opacity: [0.75, 0.95, 0.75],
                    }}
                    transition={prefersReducedMotion ? { duration: 0.4 } : {
                      duration: AURORA_MID_S,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Inner ultraviolet glow - most reactive (breadth only) */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: '240px',
                      height: '240px',
                      background: 'radial-gradient(circle, rgba(167, 139, 250, 0.85) 0%, rgba(139, 92, 246, 0.5) 50%, transparent 70%)',
                      filter: 'blur(18px)',
                      transform: `scale(${1 + auroraLevel * 0.20})`,
                      transition: 'transform 1.6s ease-out',
                    }}
                    animate={prefersReducedMotion ? { opacity: 0.9 } : {
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={prefersReducedMotion ? { duration: 0.4 } : {
                      duration: AURORA_VEIL_S,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🩵 AETHEREAL TEAL GLOW - When MAIA is speaking */}
            <AnimatePresence>
              {(isResponding || isAudioPlaying) && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 🌌 AURORA — MAIA speaking.
                      The teal/green identity is load-bearing: it is how the
                      member tells MAIA's voice from their own (ultraviolet).
                      That signal is unchanged. What changed is its DELIVERY.

                      Previously a single 200px disc drove opacity 0.6→1.0
                      straight from raw `voiceAmplitude` through a 50ms
                      transition. Because speech amplitude modulates at
                      syllable rate (~4–8 Hz), that produced a large-area
                      luminance flash several times per second — over the
                      WCAG 2.3.1 three-flashes-per-second threshold, i.e. a
                      photosensitive-seizure risk rather than a style choice.

                      Now: three soft layers, each drifting on its own
                      NON-HARMONIC period (9s / 13s / 17s). Because the
                      periods share no common multiple, the layers never
                      re-align into a countable beat — the eye reads drift,
                      not pulse. Amplitude still modulates the light, but
                      gently (≤0.16 opacity) and slewed over ~800ms via the
                      aurora envelope, so no flash can form. Lateral x/y
                      travel gives the ribbon movement aurora actually has;
                      the offset hues (teal · emerald · cyan) cross-fade at
                      different rates, reading as slow hue travel without
                      animating a gradient string. */}

                  {/* ── SAFETY MECHANICS ONLY — palette/atmosphere HELD ────
                      Colors, sizes, blur, gradients and geometry are UNCHANGED
                      from the original field. The identity/atmosphere redesign
                      (member = ultraviolet; MAIA = deep indigo opening into soft
                      silver-grey luminosity, pre-dawn/mineral rather than "lit
                      up"; gold reserved for rare semantic or sacred emphasis)
                      is HELD design work with its own ruling, pending trace #4.
                      It must not land silently through a safety repair.

                      Fixed here, and only this:
                      (1) opacity no longer derives from raw `voiceAmplitude`.
                          Speech modulates at 4–8 Hz; bound to opacity through a
                          30–70ms transition on a large glowing area that is
                          luminance flashing past the WCAG 2.3.1 three-per-second
                          threshold — a seizure risk, not a style preference.
                          Brightness is now a slow fixed breath; amplitude
                          touches scale (breadth) only.
                      (2) the `voiceAmplitude > 0.1 ? undefined : [...]` ternary
                          is gone. It swapped animation ownership between Framer
                          and the inline style whenever amplitude crossed 0.1, so
                          speech hovering near the threshold flickered on its own
                          — a defect independent of (1).
                      (3) scale reads `auroraLevel` (the slewed rAF envelope)
                          through a long transition, so a hard amplitude step
                          arrives as a swell, never a snap.
                      (4) prefers-reduced-motion stills the reactivity while
                          KEEPING the field visible — the who-is-speaking signal
                          is never removed, only held still. */}

                  {/* Outer aethereal ring */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: '320px',
                      height: '320px',
                      background: 'radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, rgba(94, 234, 212, 0.25) 40%, rgba(45, 212, 191, 0.1) 70%, transparent 100%)',
                      filter: 'blur(20px)',
                    }}
                    animate={prefersReducedMotion ? { opacity: 0.65, scale: 1 } : {
                      scale: [1, 1.06, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={prefersReducedMotion ? { duration: 0.4 } : {
                      duration: AURORA_BREATH_S,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Inner aethereal glow - voice reactive (breadth only) */}
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: '200px',
                      height: '200px',
                      background: 'radial-gradient(circle, rgba(94, 234, 212, 0.6) 0%, rgba(20, 184, 166, 0.35) 50%, transparent 70%)',
                      filter: 'blur(15px)',
                      transform: `scale(${1 + auroraLevel * 0.16})`,
                      transition: 'transform 1.6s ease-out',
                    }}
                    animate={prefersReducedMotion ? { opacity: 0.7 } : {
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={prefersReducedMotion ? { duration: 0.4 } : {
                      duration: AURORA_MID_S,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
                    transform: `scale(${1 + auroraLevel * 0.6})`,
                    opacity: 0.5 + auroraLevel * 0.15,
                    transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                    transform: `scale(${1 + auroraLevel * 0.8})`,
                    opacity: 0.4 + auroraLevel * 0.15,
                    transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                    transform: `scale(${1 + auroraLevel * 1.0})`,
                    opacity: 0.35 + auroraLevel * 0.15,
                    transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                    transform: `scale(${1 + auroraLevel * 0.5})`,
                    opacity: 0.6 + auroraLevel * 0.15,
                    transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                      transform: `scale(${1 + auroraLevel * (0.3 + i * 0.15)})`,
                      opacity: 0.3 + auroraLevel * 0.15,
                      transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                    transform: `scale(${1 + auroraLevel * 0.5})`,
                    opacity: 0.4 + auroraLevel * 0.15,
                    transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                    transform: `scale(${1 + auroraLevel * 0.8})`,
                    opacity: 0.5 + auroraLevel * 0.15,
                    transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
                  }}
                />
              </motion.div>
            )}

            {/* Voice state display moved to VoiceInteractionBar (fixed bottom zone) */}

            {/* OLD BUTTON REMOVED - Holoflower itself is now clickable */}
          </div>
        </div>

        {/* Tap to Speak / Listening label - below holoflower */}
        {!isResponding && !isAudioPlaying && !isProcessing && (
          <div className="pointer-events-none text-center w-full" style={{ marginTop: 8 }}>
            <span
              className="text-amber-200/85 text-xs font-medium tracking-widest uppercase"
              style={{
                letterSpacing: '0.16em',
                textShadow: '0 0 12px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35)',
              }}
            >
              {micRequestState === 'failed'
                ? 'Tap to try again'
                : micRequestState === 'pending'
                ? (micPreparingLong ? 'Still preparing\u2026' : 'Preparing to listen\u2026')
                : isListening
                ? 'Listening'
                : 'Tap to Speak'}
            </span>
          </div>
        )}
      </motion.div>
        </TransformationalPresence>
      </div>

      {/* 🐛 PR 10 diagnostic overlay — auto-renders only on Capacitor native.
          Surfaces the voice debug bus contents so a tester can screenshot
          the trace when voice fails. Remove once Android voice is stable. */}
      <VoiceDebugOverlay />

      {/* 🔧 SCROLL DEBUG STRIP — temporary, Issue 1 follow-up (#731).
          ?debugScroll=1 only; never renders for members. Prints the real
          visualViewport/scroll numbers so a physical-device screenshot
          carries evidence, not a guess about timing. Remove once the
          actual failing transition is captured with numbers.

          PORTALED to document.body — NOT rendered in place. This div sits
          inside an ancestor (`.flex-1.relative.z-10.overflow-hidden`) that
          establishes its own stacking context at z-10. `position: fixed`
          escapes the LAYOUT containing block (still positions correctly
          against the real viewport) but does NOT escape the STACKING
          CONTEXT chain — z-index is still resolved against the nearest
          positioned ancestor with a z-index, so no z-index value inside
          that z-10 layer, however high, can out-paint a sibling z-90 layer
          (Arrival) at the root. Confirmed live: without the portal this
          strip was correctly positioned (top:52, right rect, opacity:1,
          visibility:visible) but was still invisible on screen, painted
          UNDER Arrival's z-90 overlay. Portaling to document.body renders
          it as a root-level sibling instead, where z-index: 99999 is
          finally compared against Arrival's z-90 directly. Worth noting
          for #735 — the same trap likely affects real (non-debug) content
          in this z-10 layer, not just this diagnostic. */}
      {scrollDebugEnabled && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 52,
            left: 4,
            right: 4,
            zIndex: 99999,
            fontSize: 9,
            lineHeight: 1.35,
            fontFamily: 'monospace',
            color: '#5eead4',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 6,
            padding: '4px 6px',
            maxHeight: 130,
            overflow: 'hidden',
            pointerEvents: 'none',
            wordBreak: 'break-all',
          }}
        >
          {scrollDebugLog.length === 0 && <div>debugScroll active — waiting for events…</div>}
          {scrollDebugLog.map((line, i) => (
            <div key={i} style={{ opacity: 1 - i * 0.08 }}>{line}</div>
          ))}
        </div>,
        document.body
      )}

      {/* 🔧 PWA DEBUG STRIP - Shows state machine state on Safari PWA (remove after debugging) */}
      {isPwaVoice && (
        <div
          style={{
            position: 'fixed',
            bottom: 8,
            left: 8,
            fontSize: 10,
            zIndex: 99999,
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.7)',
            color: '#10b981',
            borderRadius: 6,
            fontFamily: 'monospace',
            maxWidth: '180px'
          }}
        >
          <div>PWA ✅ v2</div>
          <div>State: {pwaVoice.state}</div>
          <div style={{ fontSize: 9, color: '#6b7280' }}>
            {pwaVoice.isListening && '🎤 '}
            {pwaVoice.isThinkingOrSpeaking && '💭 '}
            {pwaVoice.isMuted && '🔇 '}
            {pwaVoice.isError && '❌ '}
            {pwaVoice.needsTapToEnableAudio && '👆 TAP'}
          </div>
        </div>
      )}

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
      {/* pointer-events-none so holoflower clicks pass through */}
      {(showChatInterface || (!showChatInterface && showVoiceText)) && messages.length > 0 && (
        <div
          className="fixed inset-0 z-20 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 21, 19, 0.75) 0%, rgba(28, 22, 20, 0.65) 50%, rgba(26, 21, 19, 0.75) 100%)',
            backdropFilter: 'blur(1.5px) saturate(0.85) brightness(0.75)',
            WebkitBackdropFilter: 'blur(1.5px) saturate(0.85) brightness(0.75)'
          }}
        />
      )}

      {/* Message flow - Star Wars crawl: text flows from beneath holoflower */}
      {(showChatInterface || (!showChatInterface && showVoiceText)) && messages.length > 0 && (
        <div className={`fixed top-44 sm:top-52 md:top-60 lg:top-64 z-30 transition-all duration-500 left-[60px] right-1 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 ${
          showChatInterface
            ? 'sm:w-[calc(100%-1.5rem)] md:w-[720px] lg:w-[820px] xl:w-[880px] opacity-100'
            : 'sm:w-[calc(100%-1.5rem)] md:w-[640px] lg:w-[700px] opacity-70'
        }`}
             style={{
               // GEOMETRY INVARIANT (#703): this box is defined by its CLEARANCES,
               // not by a computed height. It begins below the jewel (the `top-44`
               // class) and ends above the composer (`bottom` here). Height follows.
               //
               // It used to set top AND height AND bottom. With all three specified
               // on a fixed element, CSS ignores `bottom` — so the composer
               // clearance never applied, and the two disagreed: at 932px, top+bottom
               // implies 496px while `calc(100vh - 300px)` gave 632px. The measured
               // result was a 57px overlap of the transcript by the composer, on
               // every device, because 100vh cancels out of both expressions.
               //
               // Dropping height/maxHeight makes the clearance authoritative and
               // correct at any viewport height without arithmetic to keep in sync.
               //
               // The clearance value itself is now MEASURED from the live
               // composer's top edge (composerClearancePx above) instead of the
               // former fixed 220px/260px band, which was roughly twice the
               // composer's real height and rendered as permanent dead space
               // below the newest message. The fixed values survive only as the
               // pre-measurement fallback for the first paint.
               bottom: composerClearancePx != null
                 ? `${composerClearancePx}px`
                 : (showChatInterface ? '260px' : '220px'),
               overflow: 'hidden',
               // TOP FADE (device walk 2026-07-28): the container's top clip
               // line sits exactly in the orb-label zone ("TAP TO SPEAK" /
               // "LISTENING"), so scrolled text used to slice hard through the
               // label (measured in the WebKit harness; matches the member
               // screenshots). Text now dissolves over the first 64px instead
               // of being cut — purely visual, no geometry change.
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 64px)',
               maskImage: 'linear-gradient(to bottom, transparent 0, black 64px)'
             }}>
          {/* 🌀 AIN: Collective field indicator */}
          {fieldWisdomPresent && (
            <div className="flex justify-end pr-4 pb-1">
              <FieldStateIndicator wisdomPresent={fieldWisdomPresent} />
            </div>
          )}
          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide"
               ref={transcriptScrollElRef}
               style={{
                 scrollBehavior: 'smooth',
                 WebkitOverflowScrolling: 'touch',
                 overscrollBehavior: 'contain',
                 touchAction: 'pan-y'
               }}
               onScroll={(e) => {
                 // Continuously tracks proximity to bottom so the
                 // visualViewport-resize re-settle effect above knows the
                 // member's intent going into a keyboard-driven resize,
                 // not just the geometry after it.
                 const el = e.currentTarget;
                 wasNearBottomRef.current =
                   el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_THRESHOLD_PX;
                 pushScrollDebug('onScroll', { throttle: true });
               }}
               onPointerDown={(e) => {
                 // Primary mobile signal — fires on contact, before
                 // Safari's own gesture/momentum recognition can
                 // intervene. touchstart below is a cross-check, not
                 // the sole source, after device evidence showed the
                 // recency timestamp never being set in practice.
                 markUserScrollIntent('pointerdown', e.target);
               }}
               onTouchStart={(e) => {
                 // Recency marker for a GENUINE member gesture, distinct
                 // from the `scroll` event above — which also fires for
                 // our own programmatic `scrollIntoView` calls and would
                 // otherwise make every auto-correction look like fresh
                 // member intent to scroll away.
                 markUserScrollIntent('touchstart', e.target);
               }}
               onWheel={(e) => {
                 // Desktop/trackpad equivalent of the two above.
                 markUserScrollIntent('wheel', e.target);
               }}>
            <AnimatePresence>
              {/* Top padding on the list below clears the jewel. The holoflower
                  is an overlay occupying roughly the first 224px of this field,
                  so without it the first turn started underneath: the speaker
                  label landed at y=192, printing over the flower and through the
                  "Tap to Speak" caption. Measured, not guessed — the flower's
                  box is 112..224 on a 375px surface.

                  Padding rather than a margin on the first message, so later
                  turns still scroll up behind the jewel as they should; only the
                  resting position of the transcript changes. */}
              {messages.length > 0 && (
                <div
                  className="pt-[10.5rem] md:pt-[12rem] min-h-full flex flex-col justify-end md:block md:min-h-0"
                  /* MOBILE BOTTOM-ANCHOR (Issue 1, second mechanism — independent of
                     the scroll-resettle guard fix). Even a perfectly-working
                     scroll-to-bottom cannot move content down when
                     scrollHeight <= clientHeight — there is no scroll range.
                     A short reply then just sits at its natural top-anchored
                     position, which reads fine on a tall desktop viewport but
                     as "stuck near the top with a gap before the composer" on
                     a keyboard-shrunk mobile one.

                     min-height (not height): a flex column with
                     justify-content:flex-end and a FIXED height can hide
                     overflowing content at the top once messages exceed the
                     available space (a known flex/overflow interaction). With
                     min-height, once content grows past 100% the box simply
                     grows past it too — there's no leftover space left to push
                     to the top, so normal document order and normal
                     overflow-y:auto scrolling on the parent container take
                     over exactly as before. Desktop explicitly reverts to
                     plain block flow (md:block md:min-h-0) — this only
                     changes behavior below the md breakpoint.

                     The trailing reserve used to live here as pb-48/md:pb-60
                     padding, applied unconditionally. It now lives as a
                     conditional flex child below (see contentOverflows) —
                     padding on THIS element would sit outside the flex
                     content box, permanently reserved regardless of overflow
                     state; a flex child participates in what justify-end
                     actually packs, so a short conversation's small reserve
                     sits right after the last message, not stacked on top of
                     a second, larger reserve it doesn't need. */
                >
                <div ref={messageContentIntrinsicRef} className="space-y-3">
                {/* Show all messages with proper scrolling - filter out greeting messages (shown in centered UI instead) */}
                {messages
                  .filter(m => !m.id?.startsWith('greeting-'))
                  .map((message, index) => {
                    const handleCopyMessage = async () => {
                      const textToCopy = (message.text ?? message.content ?? '').replace(/\*[^*]*\*/g, '').replace(/\([^)]*\)/gi, '').trim();
                      try {
                        await navigator.clipboard.writeText(textToCopy);
                        toast.success('Message copied!', {
                          duration: 2000,
                          position: 'bottom-center',
                          style: {
                            background: 'rgb(18, 24, 51)', // maia-navy-850
                            color: 'rgb(245, 158, 11)', // maia-spice-500
                            border: '1px solid rgba(245, 158, 11, 0.2)', // maia-spice-500/20
                          },
                        });
                      } catch {
                        toast.error('Failed to copy', {
                          duration: 2000,
                          position: 'bottom-center',
                        });
                      }
                    };

                    // 📌 "Keep this moment" — member-authored words only. Absolute
                    // Sanctuary boundary: independently refuse here even though the
                    // render guard below already hides the affordance in Sanctuary —
                    // defense-in-depth per CLAUDE.md.
                    const handleKeepMoment = async (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (isSanctuary) return;
                      if (keptMoments[message.id]) return;
                      const verbatimText = message.text ?? message.content ?? '';
                      if (!verbatimText) return;
                      // Auth-race guard (native device walk 2026-07-27): the mark route
                      // requires an authenticated member. Firing before identity resolves
                      // on a fresh native load returns a 401 that reads to the member as a
                      // hard failure. If the member id isn't resolved yet, say so honestly
                      // instead of sending a doomed request; the trace records member:n.
                      if (!getValidMemberId()) {
                        pushVoiceDebug('Keep blocked · member:n (identity not resolved)');
                        toast.error('Still signing you in — try Keep again in a moment', { duration: 2500, position: 'bottom-center' });
                        return;
                      }
                      try {
                        const res = await apiFetch('/api/sovereign/episodes/mark', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            verbatimText,
                            sourceSessionId: sessionId,
                          }),
                        });
                        if (!res.ok) {
                          // 401 is an auth failure, not a generic save error — say which.
                          toast.error(res.status === 401 ? 'Sign-in needed to keep this moment' : 'Could not keep this moment', { duration: 2500, position: 'bottom-center' });
                          return;
                        }
                        const data = await res.json();
                        setKeptMoments(prev => ({ ...prev, [message.id]: { episodeId: data.episode.episodeId } }));
                      } catch {
                        toast.error('Could not keep this moment', { duration: 2000, position: 'bottom-center' });
                      }
                    };

                    const handleUnmarkMoment = async (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (isSanctuary) return;
                      const kept = keptMoments[message.id];
                      if (!kept) return;
                      try {
                        const res = await apiFetch(
                          `/api/sovereign/episodes/mark?episodeId=${encodeURIComponent(kept.episodeId)}`,
                          { method: 'DELETE' },
                        );
                        if (!res.ok) {
                          toast.error('Could not undo', { duration: 2000, position: 'bottom-center' });
                          return;
                        }
                        setKeptMoments(prev => {
                          const next = { ...prev };
                          delete next[message.id];
                          return next;
                        });
                      } catch {
                        toast.error('Could not undo', { duration: 2000, position: 'bottom-center' });
                      }
                    };

                    return (
                    <motion.div
                      key={message.id?.trim() || `msg-${message.role}-${typeof message.timestamp === 'string' ? message.timestamp : (message.timestamp?.toISOString?.() ?? 'no-ts')}-${index}`}
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
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {/* Only MAIA is named. A member does not need to be told
                              their own name above their own words — with both
                              labelled, "Demo Practitioner / hello" carried more
                              chrome than message, and a long display name wrapped
                              to two lines above a one-word turn.

                              Naming one voice is enough to tell two apart: labelled
                              is MAIA, unlabelled is you. Alignment no longer carries
                              speaker (both turns share a column), so the label does
                              — which is why MAIA's stays. */}
                          {message.role !== 'user' && (
                            <div className="text-xs text-dune-sand opacity-80" style={{ fontFamily: 'Spectral, Georgia, serif', letterSpacing: '0.05em' }}>
                              {assistantName}
                            </div>
                          )}
                          {/* 🚪 AIN: Knowledge Gate source well indicator (admin-only, suppressed in Sanctuary) */}
                          {showDiagnostics && message.role === 'oracle' && !isSanctuary && message.ainState && (
                            <SourceHalo
                              sourceMix={message.ainState.sourceMix}
                              awarenessLevel={message.ainState.awarenessLevel}
                              awarenessDescription={message.ainState.awarenessDescription}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs
                                      opacity-0 group-hover:opacity-100 group-active:opacity-100
                                      touch-manipulation transition-opacity">
                          {message.role === 'oracle' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const text = (message.text ?? message.content ?? '').replace(/\*[^*]*\*/g, '').replace(/\([^)]*\)/gi, '').trim();
                                const title = text.split(/[.!?\n]/)[0]?.slice(0, 120) || 'MAIA reflection';
                                const summary = text.slice(0, 300);
                                circleOffer.offerToCircle('maia_reflection', message.turnId || message.id || `msg-${index}`, title, summary);
                              }}
                              className="flex items-center gap-1 text-amber-400/60 hover:text-amber-400 transition-colors"
                            >
                              <Users className="w-3 h-3" />
                              <span>Offer</span>
                            </button>
                          )}
                          {/* 📌 Keep this moment — member-authored messages only, sovereign
                              placement covers only what the member placed. Never rendered
                              during a Sanctuary session (absolute boundary, CLAUDE.md). */}
                          {message.role === 'user' && !isSanctuary && (
                            keptMoments[message.id] ? (
                              <div className="flex items-center gap-1.5 text-emerald-400/80">
                                <CheckCircle className="w-3 h-3" />
                                <span>Kept.</span>
                                <button
                                  onClick={handleUnmarkMoment}
                                  className="underline decoration-dotted hover:text-emerald-300 transition-colors"
                                >
                                  Undo
                                </button>
                                {/* Quiet door to the member's own review of what they
                                    kept — same entry grammar as the anchor page's
                                    "earlier". Holding language only (copy guard). */}
                                <span aria-hidden className="text-emerald-400/40">·</span>
                                <a
                                  href="/maia/moments"
                                  className="underline decoration-dotted hover:text-emerald-300 transition-colors"
                                >
                                  Your moments
                                </a>
                              </div>
                            ) : (
                              <button
                                onClick={handleKeepMoment}
                                className="flex items-center gap-1 text-maia-spice-400/60 hover:text-maia-spice-400 transition-colors"
                                aria-label="Keep this moment — saves your exact words"
                              >
                                <Bookmark className="w-3 h-3" />
                                <span>Keep this moment</span>
                              </button>
                            )
                          )}
                          <div className="flex items-center gap-1 text-maia-spice-400">
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-wrap break-words text-dune-amber" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                        {message.role === 'oracle' ? (
                          <FormattedMessage
                            text={message.text}
                            enableVocabularyTooltips={enableVocabularyTooltips}
                          />
                        ) : (
                          message.text
                        )}
                      </div>

                      {/* 🔁 Recovery seam (Pattern A) — honest delivery state for the
                          member's own turn. The turn stays exactly where it was authored;
                          only its delivery is in question. The C1 presence-mode fallback
                          is intentionally left untouched and may still appear above. */}
                      {message.role === 'user' && message.deliveryStatus === 'retrying' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-dune-sand/60">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Sending…</span>
                        </div>
                      )}
                      {message.role === 'user' && message.deliveryStatus === 'failed' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-dune-sand/70">
                          <span className="text-amber-500/70">Not delivered</span>
                          <span aria-hidden className="text-dune-sand/30">·</span>
                          {message.failureReason === 'auth' ? (
                            <a
                              href="/signin"
                              onClick={(e) => e.stopPropagation()}
                              className="underline decoration-dotted text-maia-spice-400/80 hover:text-maia-spice-400 transition-colors"
                            >
                              Sign in to continue
                            </a>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleResend(message.id); }}
                              className="inline-flex items-center gap-1 underline decoration-dotted text-maia-spice-400/80 hover:text-maia-spice-400 transition-colors"
                              aria-label="Resend this message"
                            >
                              <CornerUpLeft className="w-3 h-3" />
                              Resend
                            </button>
                          )}
                        </div>
                      )}

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

                      {/* 🌀 STATE CARD: Consciousness state reading (admin-only diagnostic) */}
                      {/* Care = full (element + kairos + movement + practice) */}
                      {/* Talk = light (kairos + movement only — phenomenological, not prescriptive) */}
                      {/* Scribe = structural (full data, framed as session metadata) */}
                      {showDiagnostics && message.role === 'oracle' && message.stateVector && (
                        <div className="mt-3">
                          <StateCard
                            stateVector={message.stateVector}
                            practice={message.practiceRecommendation}
                            displayMode={
                              maiaMode.mode === 'care' ? 'full' :
                              maiaMode.mode === 'scribe' ? 'structural' :
                              'light'
                            }
                          />
                        </div>
                      )}

                      {/* Wisdom Translation — removed from per-message rendering.
                         TODO: Reintroduce as session-level action or long-press context option.
                         Component preserved at: wisdom/TranslateMessageButton.tsx */}

                      {/* Studio Actions — Send as SMS (studio surface only) */}
                      {message.role === 'oracle' && surface === 'studio' && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => openSmsModal(message.text ?? message.content ?? '')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full
                                     bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                                     hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Send as SMS
                          </button>
                        </div>
                      )}

                      {/* 🏛️ AIN: Council consultation results panel */}
                      {message.role === 'oracle' && message.consultation && (
                        <CouncilInsightPanel consultation={message.consultation} />
                      )}

                      {/* 🌌 ASTROLOGY HANDOFF: Threshold card into the Cosmic Blueprint */}
                      {message.role === 'oracle' && message.astrologyHandoff && (
                        <AstrologyHandoffCard handoff={message.astrologyHandoff} />
                      )}

                      {/* 📖 SACRED ENCOUNTER: Passage rendered below MAIA's response, visually distinct */}
                      {message.role === 'oracle' && message.sacredEncounter && (
                        <div className="mt-4">
                          {message.sacredEncounter.introduction && (
                            <p className="text-sm text-stone-400/80 italic mb-3">
                              {message.sacredEncounter.introduction}
                            </p>
                          )}
                          <SacredPassageBlock
                            passage={message.sacredEncounter.passage}
                            showDisclaimer={message.sacredEncounter.showDisclaimer !== false}
                            disclaimerText={message.sacredEncounter.disclaimer?.short}
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

                      {/* 🌀 LENS SWITCH RITUAL: Stay/Switch/Blend buttons when integrity triggers offer_switch */}
                      {message.role === 'oracle' && message.integrity?.decision === 'offer_switch' && message.lensSwitchOptions && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setPendingLensConsent({ consent: 'stay' });
                              console.log('🌀 [LENS CONSENT] User chose: Stay');
                            }}
                            className="px-3 py-1.5 text-xs rounded-full bg-dune-sand/20 text-dune-amber
                                     hover:bg-dune-sand/30 transition-colors border border-dune-amber/30"
                            style={{ fontFamily: 'Spectral, Georgia, serif' }}
                          >
                            {message.lensSwitchOptions.stay}
                          </button>
                          <button
                            onClick={() => {
                              setPendingLensConsent({
                                consent: 'switch',
                                switchTo: message.lensSwitchOptions?.switchTo
                              });
                              console.log('🌀 [LENS CONSENT] User chose: Switch to', message.lensSwitchOptions?.switchTo);
                            }}
                            className="px-3 py-1.5 text-xs rounded-full bg-maia-spice-400/20 text-maia-spice-300
                                     hover:bg-maia-spice-400/30 transition-colors border border-maia-spice-400/30"
                            style={{ fontFamily: 'Spectral, Georgia, serif' }}
                          >
                            {message.lensSwitchOptions.switch}
                          </button>
                          <button
                            onClick={() => {
                              setPendingLensConsent({ consent: 'blend' });
                              console.log('🌀 [LENS CONSENT] User chose: Blend');
                            }}
                            className="px-3 py-1.5 text-xs rounded-full bg-soul-textSecondary/10 text-soul-textSecondary
                                     hover:bg-soul-textSecondary/20 transition-colors border border-soul-textSecondary/30"
                            style={{ fontFamily: 'Spectral, Georgia, serif' }}
                          >
                            {message.lensSwitchOptions.blend}
                          </button>
                        </div>
                      )}
                    </motion.div>
                    );
                  })}
                  {/* 🚪 RELATIONAL ROUTING: Intent-driven doorway after last oracle message */}
                  {(() => {
                    const lastMsg = messages[messages.length - 1];
                    const dismissedRecently = doorwayDismissedAt && (Date.now() - doorwayDismissedAt < 15000);
                    const shouldShow = featureFlags.relationalRouting
                      && lastMsg?.role === 'oracle'
                      && lastMsg?.uiAction
                      && lastMsg.uiAction.type !== 'none'
                      && !dismissedRecently
                      && (Date.now() - lastDoorwayTimestamp > 15000);
                    // Process doorways (journal, ideas, decisions, changes)
                    if (shouldShow && !lastMsg.uiAction!.isWorldDoorway) {
                      return (
                        <RelationalDoorway
                          action={lastMsg.uiAction!}
                          onSelect={handleDoorwayAction}
                          onDismiss={() => {
                            setDoorwayDismissedAt(Date.now());
                            setLastDoorwayTimestamp(Date.now());
                          }}
                          visible={true}
                        />
                      );
                    }
                    return null;
                  })()}
                  {/* 🌐 WORLD DOORWAYS: Experiential spaces (patterns, journey) */}
                  {/* NOTE: "depth" was removed 2026-04-09. Invalid world paths redirect to /maia via app/worlds/[...slug]/page.tsx */}
                  {(() => {
                    const lastMsg = messages[messages.length - 1];
                    const dismissedRecently = doorwayDismissedAt && (Date.now() - doorwayDismissedAt < 15000);
                    const shouldShow = featureFlags.worldDoorways
                      && lastMsg?.role === 'oracle'
                      && lastMsg?.uiAction
                      && lastMsg.uiAction.isWorldDoorway
                      && !dismissedRecently
                      && (Date.now() - lastDoorwayTimestamp > 15000);
                    return shouldShow ? (
                      <WorldDoorway
                        action={lastMsg.uiAction!}
                        onSelect={handleDoorwayAction}
                        onDismiss={() => {
                          setDoorwayDismissedAt(Date.now());
                          setLastDoorwayTimestamp(Date.now());
                        }}
                        visible={true}
                      />
                    ) : null;
                  })()}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
                {/* Trailing reserve — conditional, not the old constant pb-48/
                    md:pb-60. Long/overflowing content (scrolled to its true
                    end) keeps the full founder reserve (commit fbf7a7295:
                    "the conversation must never end inside the footer's
                    airspace"). Short/non-overflowing content — where
                    justify-end above is already doing the bottom-anchoring —
                    gets a small breathing gap instead, so the newest message
                    settles close to the composer rather than carrying a
                    reserve sized for a scroll distance that doesn't exist
                    here. Desktop keeps md:h-60 in both branches: it reverts
                    to plain block flow (md:block above) where this fix does
                    not apply, so its spacing is intentionally unchanged
                    either way. */}
                <div
                  aria-hidden="true"
                  /* MOBILE READING WINDOW (device walk 2026-07-28): the h-48
                     overflow reserve was sized for desktop but consumed 192px
                     of a ~278px phone viewport — 69% of the reading window —
                     forcing the newest text up against the orb label and
                     leaving the measured dead-space void beneath every reply.
                     WebKit harness (scratchpad replica, iPhone 17 Pro):
                     newest-line clearance 192px -> 24px, visible lines ~3 ->
                     ~11. Mobile now always uses the small reserve; desktop
                     (md:h-60, both branches identical before and after) is
                     untouched. The contentOverflows machinery stays: the
                     measurement still guards scroll re-settles elsewhere. */
                  className="h-6 md:h-60 shrink-0"
                />
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

          {/* Text Display Toggle for Voice Mode - uses safe-area for iOS notch/Dynamic Island */}
          {!showChatInterface && (
            <div
              className="fixed right-4 md:right-8 z-50"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 6rem)' }}
            >
              <button
                onClick={() => setShowVoiceText(!showVoiceText)}
                /* An icon, not a labelled utility. Softening the pill helped
                   but the words still read as application chrome in a surface
                   where everything else is architectural — it was the one
                   element that announced "app" rather than "place". The eye
                   went MAIA, Hide Text, conversation: a toggle ahead of the
                   thing it toggles.

                   The name lives in title/aria rather than on screen, the way
                   the House doorway carries its own. 44x44 so it stays reachable
                   at the size it now occupies visually. */
                className="flex h-11 w-11 items-center justify-center rounded-full
                         text-white/25 hover:text-white/70 transition-colors"
                title={showVoiceText ? 'Hide the transcript' : 'Show the transcript'}
                aria-label={showVoiceText ? 'Hide the transcript' : 'Show the transcript'}
                aria-pressed={showVoiceText}
              >
                {showVoiceText
                  ? <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  : <Eye className="h-4 w-4" strokeWidth={1.75} />}
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
                          transform: `scale(${1 + auroraLevel * 0.6})`,
                          opacity: 0.4 + auroraLevel * 0.15,
                          transition: 'transform 1.6s ease-out, opacity 1.2s ease-out',
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
                  title={enableVoiceInChat ? 'MAIA will speak aloud — tap to go text-only' : 'MAIA is text-only — tap to enable her voice'}
                  aria-pressed={enableVoiceInChat}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  {/* "MAIA voice", not "Voice" — the same bare word is also
                      used (correctly, for a different thing) on the input-
                      mode switch beside the composer. Two controls both
                      just saying "Voice" is exactly the ambiguity this
                      wording fix exists to remove; naming whose voice
                      applies everywhere the state is exposed, desktop
                      included, not only on the new mobile control. */}
                  <span>MAIA voice: {enableVoiceInChat ? 'On' : 'Off'}</span>
                </button>
              </div>

              {/* Compact text input area - mobile-first, fixed at bottom

                  #735 — single composer ownership. While Arrival owns the
                  viewport (z-[90], its own composer), this underlying row is
                  mounted but unreachable: elementFromPoint at its controls
                  resolves to Arrival, so it reads as a false affordance
                  through Arrival's translucent field. `invisible`
                  (visibility:hidden) removes it from painting, hit-testing,
                  focus order and the accessibility tree WITHOUT unmounting —
                  the draft lives in parent state (draftMessage) but unmount/
                  remount would still churn focus + effects. Keyed on
                  shouldRenderArrival ONLY, never the legacy-greeting branch:
                  during the z-40 welcome overlay this composer is exactly how
                  the member starts typing. Do NOT fix by raising z-index —
                  Arrival owns the threshold; two live composers is the bug. */}
              {showChatInterface && (
              <div ref={chatComposerRef} className={`fixed left-14 right-0 sm:inset-x-0 z-below-nav ${shouldRenderArrival ? 'invisible' : ''}`} /* 4rem, not 2.5rem: the composer used to end ~8px above the SOULLAB
                   lockup, close enough that the eye grouped the signature with the
                   input controls. The extra ~24px lets the composer close as one
                   complete object and leaves SOULLAB reading as the page's quiet
                   footer rather than another button in the row. */
                style={{ bottom: 'calc(2.75rem + env(safe-area-inset-bottom, 0px) + var(--composer-keyboard-inset, 0px))' }}>
                {/* Modern text input area */}
                <div className="bg-soul-surface/90 px-2 py-3 pb-2 border-t border-soul-border/40 backdrop-blur-xl">
                  {/* The composer row no longer carries an "Ask MAIA" chip.
                      RULING (Kelly, 2026-07-23): remove the label and let MAIA
                      decide. The whole surface is already MAIA; a control naming
                      the actor rather than the behaviour, sitting directly above
                      "What's on your mind?", asked the member to answer a
                      question the interface never posed.

                      What this does and does not change:
                      - The Knowledge Field still surfaces on its own. The
                        inference path in app/api/oracle/conversation/route.ts
                        injects it whenever hasKnowledgeDomainSignal() fires.
                      - The ORIENTATION STANCE ("direct answer first, no
                        reflective preamble") is now unreachable from the member
                        surface, because askMode is what invoked it and nothing
                        sets askMode any more.

                      The stance was deliberately NOT wired to the inference in
                      its place. detectKnowledgeDomains() is substring keyword
                      matching, not intent classification — good enough to decide
                      "should knowledge be available" (additive), unfit to decide
                      "should MAIA drop the reflective stance" (subtractive, and
                      wrong at exactly the wrong moment: "I've been sitting with
                      a lot of grief" contains domain keywords). Restoring a
                      direct-answer mode wants a stance-capable signal first, and
                      a name describing the behaviour rather than the actor.

                      askMode plumbing is left intact and inert on purpose: it
                      documents the capability and keeps restoration a one-file
                      change. It is not dead code by accident. */}
                  <div className="flex items-center gap-2 px-2 pb-2">
                    {/* Input-mode switch — relocated from the top bar (founder
                        ruling, 2026-07-23). It is contextual to input, not global
                        identity, so it belongs beside the composer it governs and
                        inside the thumb zone rather than ~780px away at the top of
                        a phone screen. Vacating the top-right cluster is also what
                        gives the centred MAIA wordmark room on mobile.

                        Deliberately icon-first and secondary: this row also
                        carries tools, the dictation mic and the bug reporter.
                        It must not become a second pill competing with the
                        composer, so it is borderless and low-contrast until
                        hovered.

                        NOT the same control as the mic to its right: this changes
                        the interaction MODE; the mic dictates into the field. And
                        not placed in ModernTextInput — that component is shared,
                        and other surfaces have no mode to switch.

                        The return path already exists: in voice mode
                        VoiceInteractionBar renders a 44x44 keyboard toggle. */}
                    <div className="ml-auto flex items-center gap-1">
                      {/* Voice-RESPONSE mute — separate control from the
                          input-mode switch to its right, and easy to
                          conflate with it: this one decides whether MAIA's
                          reply includes spoken audio; the input-mode switch
                          decides whether the member is speaking or typing.
                          Same enableVoiceInChat state a hidden desktop-only
                          pill in MaiaTopBar and a ModernTextInput tools-menu
                          item already read/write (mobile-audit correction,
                          2026-07-24 — this control was previously reachable
                          on mobile ONLY by opening the "+" tools menu, which
                          can't show current state at a glance). Placed here,
                          not in the top bar, for the same reason the
                          input-mode switch moved here: it acts on the
                          composer, so it belongs beside the composer —
                          "Keep this cluster to identity and global
                          utilities" (top-bar comment, unchanged by this). */}
                      <button
                        onClick={() => {
                          const newValue = !enableVoiceInChat;
                          setEnableVoiceInChat(newValue);
                          localStorage.setItem('enableVoiceInChat', JSON.stringify(newValue));
                          console.log('🔊 Voice responses toggled:', newValue ? 'ON' : 'OFF');
                        }}
                        className={`md:hidden flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors ${
                          enableVoiceInChat
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-white/30 hover:text-white/50'
                        }`}
                        title={enableVoiceInChat ? 'MAIA will speak aloud — tap to go text-only' : 'MAIA is text-only — tap to enable her voice'}
                        aria-label={enableVoiceInChat ? 'Disable voice responses' : 'Enable voice responses'}
                        aria-pressed={enableVoiceInChat}
                      >
                        {enableVoiceInChat ? (
                          <Volume2 className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <VolumeX className="h-4 w-4" strokeWidth={2} />
                        )}
                        {/* Explicit text, not icon-only — a glanceable icon
                            alone still asks the member to remember what it
                            means. "MAIA voice", not "Voice", for the same
                            de-conflation reason as the desktop pill below:
                            this is a different question from the "Speak"
                            button immediately to the right of it. */}
                        <span>MAIA voice: {enableVoiceInChat ? 'On' : 'Off'}</span>
                      </button>
                      {/* Input-mode switch, renamed from the bare, ambiguous
                          "Voice" to "Speak" — a verb naming the action this
                          button performs (switch to speaking), so it can no
                          longer be misread as the "MAIA voice" control
                          immediately to its left. Icon/onClick/behavior
                          unchanged. */}
                      <button
                        onClick={() => {
                          // 🎙️ ATOMIC TRANSITION (P0 — speak-button-arms-mic).
                          // This previously did ONLY `setShowChatInterface(false)`,
                          // moving the visible UI into voice mode while leaving
                          // `lastSendWasVoiceRef` at whatever the last turn set.
                          // After a TYPED turn that ref is deliberately false (the
                          // consent boundary in `handleTextMessage`: typed input is
                          // not voice re-consent), and every auto-restart path is
                          // gated `if (lastSendWasVoiceRef.current)`. Net effect:
                          // member taps "Speak", the voice field appears, and the
                          // mic is never armed. It looked intermittent only because
                          // it still worked when the member had not yet typed.
                          //
                          // The consent boundary is NOT weakened — it is honored
                          // more precisely: tapping "Speak" IS an explicit member
                          // gesture to speak, so this handler is the right place to
                          // record voice consent. Auto-re-arm after a typed turn
                          // stays prohibited; only this deliberate tap re-arms.
                          //
                          // Mirrors the already-working audio-enable sequence
                          // (UI -> unmute -> enableAudio -> startListening) so both
                          // entry points into voice mode leave identical state.
                          setShowChatInterface(false);
                          setIsMuted(false);
                          lastSendWasVoiceRef.current = true;
                          setMicRequestState('pending');
                          enableAudio().then(() => {
                            setTimeout(async () => {
                              if (voiceSession.state.capabilities.canStartListening) {
                                await voiceSession.methods.startListening('speak_button_gesture');
                                console.log('🎤 [mode] Speak tapped — mic armed');
                              } else {
                                // NOT a failure. `canStartListening` is
                                // `phase === 'idle' && !error && !isSpeaking && !isProcessing`
                                // (hooks/useVoiceSession.ts), so it is transiently false
                                // whenever MAIA is still speaking/processing or the session
                                // has not reached idle. That is "not ready yet", not
                                // "cannot" — and `failed` may only mean an event has
                                // ESTABLISHED that activation failed.
                                //
                                // The one authoritative signal here is the session's own
                                // recoverable-error phase; everything else stays `pending`,
                                // where elapsed time will soften the wording instead of
                                // concluding failure.
                                const sessionError = voiceSession.state.error;
                                console.warn('🎤 [mode] Speak tapped but canStartListening=false', {
                                  phase: voiceSession.state.phase,
                                  hasError: !!sessionError,
                                });
                                if (sessionError) setMicRequestState('failed');
                              }
                            }, 100);
                          }).catch((err) => {
                            // Authoritative failure event — the only route to 'failed'.
                            console.warn('🎤 [mode] Speak tap: enableAudio failed', err);
                            setMicRequestState('failed');
                          });
                        }}
                        className="flex min-h-[32px] items-center gap-1.5 rounded-full px-2 text-xs font-medium text-white/30 transition-colors hover:text-white/60"
                        title="Speak instead of typing"
                        aria-label="Switch to speaking"
                      >
                        <Mic className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>Speak</span>
                      </button>
                    </div>
                  </div>
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
                    submitError={inputSubmitError}
                    onClearSubmitError={() => setInputSubmitError(null)}
                  />
                </div>
              </div>
              )}
            </>
          ) : null}


          {/* ✨ Capture the Spirit Suggestion - only show after activation */}
          <CaptureSuggestionChip
            isVisible={showCaptureSuggestion && !showCapturePanel && hasActivated}
            onCapture={handleCaptureSpirit}
            onDismiss={() => {
              setShowCaptureSuggestion(false);
              setCaptureSuggestionDismissed(true);
              console.log('✨ [Capsule] User dismissed capture suggestion');
            }}
          />
        </>
      )}

      {/* ✨ Capture the Spirit Panel */}
      <CaptureSpiritPanel
        isOpen={showCapturePanel}
        onClose={() => setShowCapturePanel(false)}
        capsule={capturedCapsule}
        isLoading={isCapturing}
        error={captureError}
        onSave={handleUpdateCapsule}
        onBringIntoLab={handleBringCapsuleIntoLab}
        onViewInLab={() => {
          // Only a confirmed Keep has a page to view. An unsaved preview has no
          // row and no route — navigating on its absent id would 404 and read
          // to the member as data loss.
          const capsuleId = persistedCapsuleIdRef.current ?? capturedCapsule?.id;
          if (!capsuleId) {
            toast.error('Keep this first, then you can view it in the Lab');
            return;
          }
          setShowCapturePanel(false);
          router.push(`/labtools/reflections/${capsuleId}`);
        }}
      />

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



      {/* Escape hatch — TOP LEVEL, deliberately.
          This was nested inside {voiceEnabled && ( {!showChatInterface && ( ...
          several levels deep, which meant it shared the fate of the very region
          it exists to recover: when that subtree did not render, a member was
          left with a transcript and NO way to speak or type at all. A control
          whose job is to restore input cannot be gated by the same condition
          that removed it.

          Rendered whenever the full composer is absent, regardless of voice
          availability, so there is always one route back to text. */}
      {!showChatInterface && (
        <div
          /* #735: hidden (not unmounted) while Arrival owns the viewport.
             This does not strand anyone — the escape hatch exists for "the
             composer subtree didn't render", and during Arrival the member
             HAS a composer: Arrival's own. Beneath the z-[90] field this
             button is unreachable anyway; showing it is a false affordance.

             pointer-events-none is load-bearing, not cosmetic. This wrapper spans
             the full viewport width so its single pill can be centred, but only
             the pill is meant to be touchable. Without it the strip claims a
             44px-tall full-width hit surface at z-below-nav and swallows clicks
             aimed at anything beneath it — which is how the capsule review panel's
             primary action became unclickable while looking perfectly normal on
             screen (2026-08-02, Correction 3 feature walk, halted at F4/F5).
             The child already declares `pointer-events-auto`; that declaration
             only means anything once the parent opts out. */
          className={`pointer-events-none fixed left-0 right-0 z-below-nav flex justify-center ${shouldRenderArrival ? 'invisible' : ''}`}
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={() => setShowChatInterface(true)}
            className="pointer-events-auto flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
            title="Switch to text — type to MAIA instead of speaking"
            aria-label="Switch to text mode"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            <span>Text</span>
          </button>
        </div>
      )}

      {/* Unified Voice Interaction Bar — state display, transcript, keyboard

          #735: wrapped, not conditionally unmounted, while Arrival owns the
          viewport. VoiceInteractionBar keeps its slide-out text draft in LOCAL
          state (textValue) — unmounting would destroy an in-progress draft if
          the member invokes Return to Arrival mid-thought. visibility:hidden
          inherits into the bar's fixed-position root, removing it from
          painting, hit-testing, focus and the accessibility tree while React
          state survives. The wrapper itself has zero layout footprint (the
          child is position:fixed). */}
      {isMounted && voiceEnabled && !showChatInterface && (
        <div ref={voiceBarWrapRef} className={shouldRenderArrival ? 'invisible' : undefined}>
        <VoiceInteractionBar
          voiceState={voiceInteractionState}
          interimTranscript={interimTranscript}
          captureStalled={captureStalled}
          onStop={() => {
            streamVoice.stop();
            voiceSession.methods.stopListening();
            setIsListening(false);
          }}
          onInterrupt={handleVoiceInterrupt}
          onTextSubmit={(text) => handleTextMessage(text)}
        />
        </div>
      )}

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
            className="modal-content fixed bottom-24 left-16 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[90%] max-w-md z-[85] bg-gradient-to-b from-maia-navy-850/98 to-maia-navy-900/98 backdrop-blur-xl border border-maia-spice-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="p-5">
              <h3 className="text-base font-semibold text-maia-spice-500 mb-2">MAIA&apos;s Voice</h3>
              <p className="text-sm text-stone-300 mb-3">
                Voice adapts to MAIA&apos;s elemental state &mdash; fire, water, earth, air, aether.
                Fine-tune pace, warmth, and energy in Settings &rarr; Voice.
              </p>
              <button
                onClick={() => setShowVoiceMenu(false)}
                className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Quick Settings Sheet - Advanced voice and personality controls */}
      <QuickSettingsSheet
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />

      {/* Voice HUD - DISABLED - Removed per user request
      <VoiceHUD
        isVisible={streamingVoiceMode && !showChatInterface && hasActivated}
        onInterrupt={handleVoiceInterrupt}
        isMaiaSpeaking={isAudioPlaying || isResponding}
      />
      */}

      {/* 🧭 Therapeutic Framework Selector - Mode-specific (Counsel/Scribe)
          Now handled by FrameworkSelector component, accessed contextually */}

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
            onInterimTranscript={(t) => setInterimTranscript(t)}
            onRecordingStateChange={handleRecordingStateChange}
            onAudioLevelChange={handleAudioLevelChange}
            onInterrupt={handleVoiceInterrupt}
            interruptEnabled={interruptEnabled}
            interruptDebounceMs={interruptDebounceMs}
            interruptThresholdMultiplier={interruptThresholdMultiplier}
            isProcessing={isResponding}
            isSpeaking={isAudioPlaying || isMicrophonePaused}
            autoStart={false}
            silenceThreshold={
              listeningMode === 'session' ? VOICE_TIMING.WEB_SILENCE_SCRIBE_MS :
              listeningMode === 'patient' ? VOICE_TIMING.WEB_SILENCE_CARE_MS :
              VOICE_TIMING.WEB_SILENCE_TALK_MS
            }
            persistentListening={listeningMode === 'session' || listeningMode === 'patient'}
            onHandsFreeFallback={() => {
              setIsHandsFreeMode(false);
              toast('Hands-free paused — tap to talk', { duration: 2500 });
              console.log('🔄 [HandsFree] Auto-fallback to push-to-talk (backoff exhausted)');
            }}
            onVoiceStatus={({ level, cause, userMessage, recoverable }) => {
              // ContinuousConversation is mounted inside `sr-only`, so its own
              // status line and error banner are invisible. This is the only
              // surface where a voice failure actually reaches the member —
              // which is why a dead mic used to look exactly like a live one.
              console.warn(`🎙️ [voice-status] ${level} ${cause} (recoverable=${recoverable})`);
              if (level === 'info') return; // expected stand-down: don't interrupt
              // Truthful UI: listening is over, so stop showing it as running.
              setIsHandsFreeMode(false);
              setIsListening(false);
              toast(userMessage, { duration: 9000, icon: '🎙️' });
            }}
            onTranscriptSalvage={({ text, cause }) => {
              // What the member said is the member's. A failure in our capture
              // layer is not a licence to discard it. It returns as an editable
              // draft — never auto-sent, because MAIA does not submit words the
              // member did not choose to send.
              console.log(`💾 [salvage] Restoring ${text.length} chars after ${cause}`);
              setShowChatInterface(true);
              setDraftMessage((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
            }}
            onVoiceUnavailable={({ reason, userMessage }) => {
              // Bounded recovery from ContinuousConversation: a known platform
              // failure mode was observed and the restart loop was stopped.
              // Switch to text mode so the text input becomes the obvious
              // primary affordance, and surface the message Kelly drafted
              // for the relational tone. Single-fire; the callback only
              // triggers once per session per the child's noSpeechFallbackFiredRef.
              console.warn('🛑 [OracleConversation] onVoiceUnavailable:', reason);
              setIsHandsFreeMode(false);
              setShowChatInterface(true);
              toast(userMessage, { duration: 10000 });
            }}
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
          router.push(path);
          setShowLabDrawer(false);
        }}
        onAction={async (action) => {
          console.log('[OracleConversation] onAction called:', action);
          // Soul Prompts & Session actions
          if (action === 'open-prompt-picker') {
            console.log('[OracleConversation] Opening prompt picker');
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
          // ✨ Capture the Spirit action
          if (action === 'capture-spirit') {
            setShowLabDrawer(false);
            handleCaptureSpirit();
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
              // Turn mic OFF - user explicitly toggling off
              setIsMuted(true);
              voiceSession.methods.stopListening(); // 🔥 FIX: User-initiated exit
              console.log('🔇 Microphone OFF (user toggle)');
            } else {
              // Turn mic ON - but only if MAIA isn't speaking
              if (isAudioPlayingRef.current) {
                console.log('⏸️ Cannot turn mic ON - MAIA is speaking');
                return;
              }

              // 🔥 iOS FIX: Warm audio element SYNCHRONOUSLY
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
              if (isIOS && !iosWarmedAudioRef.current) {
                console.log('📱 [iOS] SYNC warming audio on toggle-microphone');
                try {
                  const audio = new Audio();
                  audio.setAttribute('playsinline', '');
                  audio.volume = 1.0;
                  audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA';
                  audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    console.log('✅ [iOS] Audio warmed via toggle-microphone');
                  }).catch(() => {});
                  iosWarmedAudioRef.current = audio;
                } catch (err) {
                  console.warn('⚠️ [iOS] Warm failed:', err);
                }
              }

              setShowChatInterface(false);
              setIsMuted(false);
              enableAudio().then(() => {
                setTimeout(async () => {
                  if (voiceSession.state.capabilities.canStartListening) {
                    await voiceSession.methods.startListening('audio_enable_resume');
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
              // Start scribing (default to witness for backwards compatibility)
              startScribeSession?.('witness');
              toast.success('Scribe Mode activated - 2nd Chair Witness');
              setShowLabDrawer(false);
            }
            return;
          }

          // 📝 SCRIBE MODE: Start with specific chair perspective
          if (action === 'scribe-solo') {
            startScribeSession?.('solo');
            toast.success('🧘 1st Chair Solo - Self-study & journaling');
            setShowLabDrawer(false);
            return;
          }
          if (action === 'scribe-witness') {
            startScribeSession?.('witness');
            toast.success('👁️ 2nd Chair Witness - Observing session');
            setShowLabDrawer(false);
            return;
          }
          if (action === 'scribe-practitioner') {
            startScribeSession?.('practitioner');
            toast.success('📋 3rd Chair Practitioner - Session notes');
            setShowLabDrawer(false);
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
        scribeChair={scribeSession.container}
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
        defaultDuration={youthMaxSessionMinutes || 50}
        maxDuration={isTeenUser ? youthMaxSessionMinutes : undefined}
        tierLabel={isTeenUser ? youthTierLabel : undefined}
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
          memberId={getValidMemberId() || undefined}
        />
      )}

      {/* Soul Prompt Picker Modal */}
      <PromptPicker
        isOpen={showPromptPicker}
        onClose={() => setShowPromptPicker(false)}
        onSelectPrompt={(promptText) => {
          // Clear previous conversation for fresh start with new prompt
          setMessages([]);
          lastSyncedCountRef.current = 0; // fresh thread — resync from the start
          historicalMessagesRef.current = []; // Clear API context too
          if (typeof window !== 'undefined' && sessionId) {
            const storageKey = `maia_conversation_${sessionId}`;
            localStorage.removeItem(storageKey);
            console.log('🌟 [SoulPrompt] Cleared conversation for fresh start');
          }

          // Frame as a reflection invitation so MAIA guides the user through it
          const framedPrompt = `I'd like to sit with this question: ${promptText}`;
          setDraftMessage(framedPrompt);
          setComposerDraft(framedPrompt);
          setShowPromptPicker(false);
          setHasActivated(true); // Skip welcome screen

          // Focus the text input — desktop only. A tap started this handler, but
          // the deferred call breaks the gesture chain, so iOS treats it as
          // programmatic focus: field focused, keyboard closed, next tap dead.
          // See lib/ui/programmaticFocus.ts.
          if (canProgrammaticallyFocus()) {
            setTimeout(() => {
              textInputRef.current?.focus?.();
            }, 100);
          }
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
          // Desktop only — deferred focus breaks the gesture chain on iOS.
          // See lib/ui/programmaticFocus.ts.
          if (canProgrammaticallyFocus()) setTimeout(() => textInputRef.current?.focus?.(), 100);
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
          // Desktop only — deferred focus breaks the gesture chain on iOS.
          // See lib/ui/programmaticFocus.ts.
          if (canProgrammaticallyFocus()) setTimeout(() => textInputRef.current?.focus?.(), 100);
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

      {/* Return Path Pill - shows when user came from Guide/Academy via seed prompt */}
      {returnPath && !showLabDrawer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-16 z-[85] flex items-center gap-1 px-3 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-100 text-[13px] font-medium backdrop-blur-sm shadow-lg"
        >
          <button
            onClick={() => {
              clearReturnPath();
              setReturnPathState(null);
              router.push(returnPath.path);
            }}
            className="flex items-center gap-2 px-1.5 py-0.5 hover:opacity-90 transition-opacity"
          >
            <CornerUpLeft className="w-4 h-4" />
            <span>Return to {returnPath.label || 'Guide'}</span>
          </button>

          <button
            aria-label="Dismiss return"
            onClick={() => {
              // Clear both state and storage - user chose not to return
              clearReturnPath();
              setReturnPathState(null);
            }}
            className="ml-1 p-1 rounded-full text-amber-100/60 hover:text-amber-100 hover:bg-amber-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Floating Session Indicator - shows when session is active */}
      {sessionTimer && sessionTimer.isActive?.() && !showLabDrawer && (
        <FloatingSessionIndicator
          phase={sessionTimer.getCurrentPhase?.() as any || 'exploration'}
          elapsedMinutes={sessionTimer.getElapsedMinutes?.() || 0}
          totalMinutes={sessionTimer.getDurationMinutes?.() || 60}
          onClick={() => setShowLabDrawer(true)}
        />
      )}

      {/* Studio SMS Send Modal */}
      <AnimatePresence>
        {smsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setSmsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  Send SMS
                </h3>
                <button
                  onClick={() => setSmsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {smsModalError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {smsModalError}
                  </div>
                )}

                {smsModalResult === 'success' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    SMS sent successfully
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    To (Phone Number)
                  </label>
                  <input
                    type="tel"
                    value={smsModalTo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSmsModalTo(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={smsModalBody}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSmsModalBody(e.target.value)}
                    placeholder="Message text..."
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                  <div className="text-xs text-slate-500 mt-1 text-right">
                    {smsModalBody.length} characters
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setSmsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSms}
                  disabled={smsModalSending || smsModalResult === 'success'}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg
                           hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {smsModalSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : smsModalResult === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send SMS
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareToCircleModal
        open={circleOffer.open}
        onClose={() => circleOffer.setOpen(false)}
        artifactType={circleOffer.artifact.type}
        artifactRef={circleOffer.artifact.ref}
        defaultTitle={circleOffer.artifact.title}
        defaultSummary={circleOffer.artifact.summary}
      />
    </div>
  );
};

export default OracleConversation;
