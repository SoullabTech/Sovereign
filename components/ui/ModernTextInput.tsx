'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { canProgrammaticallyFocus } from '@/lib/ui/programmaticFocus';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  Image as ImageIcon,
  FileText,
  MoreHorizontal,
  Download,
  Square
} from 'lucide-react';
import { useVoiceInput } from '@/lib/hooks/useVoiceInput';

interface ModernTextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (message: string, files?: File[]) => void;
  onVoiceMessage?: (transcript: string) => void; // Called when voice message completes
  placeholder?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  enableVoiceInput?: boolean;
  /** Whether the empty-input dictation affordance is offered at all. */
  showVoiceInputButton?: boolean;
  enableVoiceInChat?: boolean;
  onVoiceInputToggle?: () => void;
  onVoiceResponseToggle?: () => void;
  onFileUpload?: (files: File[]) => void;
  onDownloadConversation?: () => void;
  onOpenPromptPicker?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
  hasMemory?: boolean;
  lastConnectionTime?: string;
  currentPhase?: string;
  relationshipDepth?: 'new' | 'developing' | 'deep' | 'profound';
  mode?: 'normal' | 'patient' | 'session'; // MAIA mode: normal=dialogue, patient=counsel, session=scribe
  externalValue?: string; // Alias for value (used by OracleConversation)
  /** Transient submit-error banner shown above input. Parent owns the value
   *  and clears it (typically on next keystroke or after a timeout). Surfaces
   *  cases where a submit didn't produce a visible MAIA reply. */
  submitError?: string | null;
  /** Called when the user dismisses or clears the submit error (e.g. by typing). */
  onClearSubmitError?: () => void;
}

export const ModernTextInput = forwardRef<HTMLTextAreaElement, ModernTextInputProps>(({
  value: valueProp,
  onChange,
  onSubmit,
  onVoiceMessage,
  placeholder = "Message MAIA...",
  disabled = false,
  isProcessing = false,
  enableVoiceInput = false,
  showVoiceInputButton = true,
  enableVoiceInChat = false,
  onVoiceInputToggle,
  onVoiceResponseToggle,
  onFileUpload,
  onDownloadConversation,
  onOpenPromptPicker,
  autoFocus = false,
  maxLength: maxLengthProp = 10000,
  hasMemory = false,
  lastConnectionTime,
  currentPhase,
  relationshipDepth = 'new',
  mode = 'normal',
  externalValue,
  submitError,
  onClearSubmitError
}, ref) => {
  // Support both value and externalValue props
  const initialValue = valueProp ?? externalValue ?? '';

  // Scribe/session mode allows unlimited input for full transcript uploads
  const maxLength = mode === 'session' ? undefined : maxLengthProp;
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice input hook - ChatGPT-style voice recording
  const {
    isRecording,
    isTranscribing,
    transcript,
    startRecording,
    stopRecording,
    error: voiceError
  } = useVoiceInput({
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        // Auto-send voice message
        if (onVoiceMessage) {
          onVoiceMessage(text.trim());
        } else {
          onSubmit?.(text.trim());
        }
      }
    },
    onAutoStop: (finalText) => {
      if (finalText.trim()) {
        if (onVoiceMessage) {
          onVoiceMessage(finalText.trim());
        } else {
          onSubmit?.(finalText.trim());
        }
      }
    },
    silenceTimeoutMs: 2000,
    minSpeechLengthChars: 2
  });

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Generate intimate, relationship-aware placeholder
  const getIntimatePlaceholder = () => {
    if (enableVoiceInput) return "Voice input enabled - tap the mic button to speak...";

    if (hasMemory && lastConnectionTime) {
      const timeAgo = getTimeAgo(lastConnectionTime);
      if (relationshipDepth === 'profound') {
        return `Hey, welcome back... it's been ${timeAgo}. What's been on your mind?`;
      } else if (relationshipDepth === 'deep') {
        return `Good to see you again... ${timeAgo} since we talked. How have you been?`;
      } else if (relationshipDepth === 'developing') {
        return `Hi there... it's been ${timeAgo}. What's going on with you?`;
      }
    }

    if (currentPhase) {
      return `How are things going with your ${currentPhase}? What's coming up for you?`;
    }

    if (relationshipDepth === 'new') {
      return "What's on your mind? Let's talk...";
    }

    return placeholder;
  };

  // Helper function to get time ago
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'a moment';
  };

  // Callback ref: assign the textarea node to both the internal ref and the
  // forwarded parent ref. The previous useEffect only copied when the parent
  // ref was already truthy — but it starts null, so the parent ref never got
  // the node and parent-side .focus() (auto-focus after each reply) silently
  // no-op'd.
  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Sync external value (support both valueProp and externalValue)
  useEffect(() => {
    const extVal = valueProp ?? externalValue;
    if (extVal !== undefined && extVal !== value) {
      setValue(extVal);
    }
  }, [valueProp, externalValue, value]);

  // Mount focus — desktop only. See lib/ui/programmaticFocus.ts for why.
  //
  // Applied imperatively rather than via the `autoFocus` attribute because React
  // acts on that attribute at initial mount, before any client-side pointer
  // check could run.
  useEffect(() => {
    if (!autoFocus) return;
    if (!canProgrammaticallyFocus()) return;
    textareaRef.current?.focus();
  }, [autoFocus]);

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px height - expanded for mobile
      textarea.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Allow unlimited input in scribe mode (maxLength undefined)
    if (!maxLength || newValue.length <= maxLength) {
      setValue(newValue);
      onChange?.(newValue);
      // Clear any visible submit-error banner as soon as the user begins typing again.
      if (submitError) onClearSubmitError?.();
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled && !isProcessing && !enableVoiceInput) {
      onSubmit?.(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload?.(files);
      e.target.value = ''; // Reset input
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const canSubmit = value.trim().length > 0 && !disabled && !isProcessing && !enableVoiceInput && !isRecording;
  const showMic = showVoiceInputButton && value.trim().length === 0 && !isRecording && !disabled && !isProcessing;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Tools Dropdown */}
      <AnimatePresence>
        {showTools && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-4 mb-2 z-50"
          >
            <div className="bg-[#1a1f2e]/95 backdrop-blur-xl border border-gold-divine/20 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
              <div className="p-2">
                {/* File Upload */}
                <button
                  onClick={triggerFileUpload}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white/90 font-medium">Upload files</div>
                    <div className="text-white/50 text-xs">Images, PDFs, documents</div>
                  </div>
                </button>

                {/* Soul Prompts */}
                {onOpenPromptPicker && (
                  <button
                    onClick={() => {
                      onOpenPromptPicker();
                      setShowTools(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white/90 font-medium">Soul Prompts</div>
                      <div className="text-white/50 text-xs">Elemental inquiry guides</div>
                    </div>
                  </button>
                )}

                {/* Voice Response Toggle */}
                {onVoiceResponseToggle && (
                  <button
                    onClick={() => {
                      onVoiceResponseToggle();
                      setShowTools(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      enableVoiceInChat ? 'bg-amber-500/20' : 'bg-gray-500/20'
                    }`}>
                      {enableVoiceInChat ?
                        <Volume2 className="w-4 h-4 text-amber-400" /> :
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                    <div className="text-left">
                      <div className="text-white/90 font-medium">
                        {enableVoiceInChat ? 'Disable' : 'Enable'} voice responses
                      </div>
                      <div className="text-white/50 text-xs">
                        {enableVoiceInChat ? 'MAIA will be silent' : 'MAIA will speak aloud'}
                      </div>
                    </div>
                  </button>
                )}

                {/* Download Conversation */}
                {onDownloadConversation && (
                  <button
                    onClick={() => {
                      onDownloadConversation();
                      setShowTools(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Download className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white/90 font-medium">Download conversation</div>
                      <div className="text-white/50 text-xs">Save as text file</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit-error banner — surfaces parent-detected submission failures
          (network/server/maintenance) so a cleared input is not visually
          indistinguishable from a successful send. Auto-clears on next keystroke. */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute -top-12 left-0 right-0 mx-4 flex items-center justify-between gap-2 rounded border border-rose-400/40 bg-rose-950/60 px-3 py-1.5 text-xs text-rose-100"
            role="status"
            aria-live="polite"
          >
            <span>{submitError}</span>
            {onClearSubmitError && (
              <button
                type="button"
                onClick={onClearSubmitError}
                className="text-rose-200/70 hover:text-rose-50 text-[10px] uppercase tracking-wider"
                aria-label="dismiss error"
              >
                dismiss
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Indicator - ChatGPT style */}
      <AnimatePresence>
        {(isRecording || isTranscribing) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-400/30">
              {/* Waveform visualization */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-amber-400 rounded-full"
                    animate={{
                      height: isRecording ? [8, 24, 8] : 8
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
              <span className="text-amber-400 text-sm">
                {isTranscribing ? 'Transcribing...' : 'Listening...'}
              </span>
              {transcript && (
                <span className="text-white/60 text-sm truncate flex-1">
                  "{transcript}"
                </span>
              )}
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container */}
      <motion.div
        className={`relative rounded-3xl transition-all duration-200 ${
          isFocused
            ? 'bg-gradient-to-r from-[#1a1f2e]/95 via-[#1e2332]/95 to-[#1a1f2e]/95 shadow-2xl shadow-gold-divine/10'
            : 'bg-[#1a1f2e]/90 hover:bg-[#1e2332]/90'
        } backdrop-blur-xl border ${
          isRecording
            ? 'border-amber-400/50'
            : isFocused
              ? 'border-gold-divine/40'
              : enableVoiceInput
                ? 'border-blue-400/40'
                : 'border-gold-divine/20 hover:border-gold-divine/30'
        }`}
        animate={{
          scale: isFocused ? 1.01 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        {/* ChatGPT-style Compact Input Area */}
        <div className="flex items-center gap-2 p-2">
          {/* Tools Button - Small and subtle */}
          <button
            type="button"
            onClick={() => setShowTools(!showTools)}
            disabled={isRecording}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation ${
              showTools
                ? 'bg-gold-divine/20 text-gold-divine'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Tools"
          >
            <Plus className={`w-3 h-3 transition-transform duration-200 ${showTools ? 'rotate-45' : ''}`} />
          </button>

          {/* Text Input Container */}
          <div className="flex-1 relative">
            <textarea
              ref={setTextareaRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isRecording ? 'Listening...' : getIntimatePlaceholder()}
              // Voice/recording genuinely disables the field. Processing does NOT:
              // a `disabled` textarea is force-blurred by the browser, which drops
              // the soft keyboard (and the cursor) every turn. `readOnly` blocks
              // typing during processing while keeping focus — so the field stays
              // ready reply-to-reply without re-selecting it.
              disabled={enableVoiceInput || isRecording}
              readOnly={disabled || isProcessing}
              // No `autoFocus` attribute: mount focus is applied imperatively
              // above so it can be withheld on touch devices. See the comment there.
              maxLength={maxLength}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              data-form-type="other"
              // text-[16px], not text-sm (14px): iOS Safari auto-zooms the
              // page on focus for any input under 16px, and zoom is never
              // capped app-wide (accessibility — see app/layout.tsx), so
              // raising the field's own font-size is the only fix that
              // doesn't also block a member's own zoom.
              className={`w-full min-h-[40px] max-h-[200px] overflow-y-auto bg-transparent border-none outline-none resize-none
                       text-[16px] leading-relaxed placeholder:text-white/40 transition-colors pr-12
                       ${enableVoiceInput || isRecording
                         ? 'text-blue-300 cursor-not-allowed'
                         : 'text-white/90'
                       }`}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              rows={1}
            />

            {/* Action Buttons - ChatGPT pattern: Mic when empty, Send when text, Stop when recording */}
            <div className="absolute bottom-1 right-1 flex items-center gap-1">
              {/* Mic Button - shows when input is empty */}
              {showMic && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 flex items-center justify-center transition-all duration-200 touch-manipulation"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              {/* Stop Button - shows when recording */}
              {isRecording && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all duration-200 touch-manipulation"
                  title="Stop recording"
                >
                  <Square className="w-3 h-3" />
                </button>
              )}

              {/* Send Button - shows when there's text */}
              {canSubmit && (
                <button
                  type="button"
                  // Keep focus on the textarea when tapping Send so the browser
                  // doesn't blur it and dismiss the keyboard at send time.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleSubmit}
                  className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 flex items-center justify-center transition-all duration-200 touch-manipulation"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Character Count - only show for modes with limits */}
        {maxLength && value.length > maxLength * 0.9 && (
          <div className="absolute -top-6 right-3">
            <span className={`text-xs ${
              value.length >= maxLength ? 'text-red-400' : 'text-white/40'
            }`}>
              {value.length}/{maxLength}
            </span>
          </div>
        )}
      </motion.div>

      {/* Voice Error Display */}
      {voiceError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-xs mt-2 px-2"
        >
          {voiceError}
        </motion.p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,application/pdf,.txt,.doc,.docx,.md,.json"
        onChange={handleFileSelect}
      />
    </div>
  );
});

ModernTextInput.displayName = 'ModernTextInput';