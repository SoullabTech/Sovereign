'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Download
} from 'lucide-react';

interface ModernTextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (message: string, files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  enableVoiceInput?: boolean;
  enableVoiceInChat?: boolean;
  onVoiceInputToggle?: () => void;
  onVoiceResponseToggle?: () => void;
  onFileUpload?: (files: File[]) => void;
  onDownloadConversation?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
  hasMemory?: boolean;
  lastConnectionTime?: string;
  currentPhase?: string;
  relationshipDepth?: 'new' | 'developing' | 'deep' | 'profound';
  mode?: 'normal' | 'patient' | 'session'; // MAIA mode: normal=dialogue, patient=counsel, session=scribe
}

export const ModernTextInput = forwardRef<HTMLTextAreaElement, ModernTextInputProps>(({
  value: externalValue,
  onChange,
  onSubmit,
  placeholder = "Message MAIA...",
  disabled = false,
  isProcessing = false,
  enableVoiceInput = false,
  enableVoiceInChat = false,
  onVoiceInputToggle,
  onVoiceResponseToggle,
  onFileUpload,
  onDownloadConversation,
  autoFocus = false,
  maxLength: maxLengthProp = 10000,
  hasMemory = false,
  lastConnectionTime,
  currentPhase,
  relationshipDepth = 'new',
  mode = 'normal'
}, ref) => {
  // Scribe/session mode allows unlimited input for full transcript uploads
  const maxLength = mode === 'session' ? undefined : maxLengthProp;
  const [value, setValue] = useState(externalValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Forward ref to external ref if provided
  useEffect(() => {
    if (ref && typeof ref === 'object' && ref.current !== textareaRef.current) {
      if (ref.current) {
        ref.current = textareaRef.current;
      }
    }
  }, [ref]);

  // Sync external value
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== value) {
      setValue(externalValue);
    }
  }, [externalValue, value]);

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

  const canSubmit = value.trim().length > 0 && !disabled && !isProcessing && !enableVoiceInput;

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

      {/* Memory Indicator */}
      {hasMemory && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-4 flex items-center gap-2 text-xs text-gold-divine/60"
        >
          <Sparkles className="w-3 h-3" />
          <span>MAIA remembers our conversations</span>
          {lastConnectionTime && (
            <span className="text-white/40">• last spoke {getTimeAgo(lastConnectionTime)} ago</span>
          )}
        </motion.div>
      )}

      {/* Main Input Container */}
      <motion.div
        className={`relative rounded-3xl transition-all duration-200 ${
          isFocused
            ? 'bg-gradient-to-r from-[#1a1f2e]/95 via-[#1e2332]/95 to-[#1a1f2e]/95 shadow-2xl shadow-gold-divine/10'
            : 'bg-[#1a1f2e]/90 hover:bg-[#1e2332]/90'
        } backdrop-blur-xl border ${
          isFocused
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
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation ${
              showTools
                ? 'bg-gold-divine/20 text-gold-divine'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
            title="Tools"
          >
            <Plus className={`w-3 h-3 transition-transform duration-200 ${showTools ? 'rotate-45' : ''}`} />
          </button>

          {/* Text Input Container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={getIntimatePlaceholder()}
              disabled={disabled || enableVoiceInput}
              autoFocus={autoFocus}
              maxLength={maxLength}
              className={`w-full min-h-[40px] max-h-[120px] bg-transparent border-none outline-none resize-none
                       text-sm leading-relaxed placeholder:text-white/40 transition-colors pr-20
                       ${enableVoiceInput
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

            {/* Action Buttons - Positioned in lower right */}
            <div className="absolute bottom-1 right-1 flex items-center gap-1">
              {/* Voice Input Toggle - Removed since voice toggle is now in upper right navigation */}

              {/* Send Button - Small arrow like ChatGPT */}
              {canSubmit && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-7 h-7 rounded-lg bg-gold-divine/20 text-gold-divine hover:bg-gold-divine/30 flex items-center justify-center transition-all duration-200 touch-manipulation"
                  title="Send message"
                >
                  <Send className="w-3 h-3" />
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