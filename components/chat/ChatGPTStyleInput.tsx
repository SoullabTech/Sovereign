'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Square,
  Plus,
  Camera,
  Image as ImageIcon,
  FileText,
  Globe,
  X,
  Sparkles,
  Shield
} from 'lucide-react';
import { useVoiceInput } from '@/lib/hooks/useVoiceInput';
import { getInitialSessionSettings } from '@/lib/settings/accountSettings';

interface ChatGPTStyleInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  onVoiceMessage?: (transcript: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showSanctuary?: boolean;
}

interface Attachment {
  type: 'image' | 'file' | 'camera';
  file?: File;
  preview?: string;
}

export default function ChatGPTStyleInput({
  onSendMessage,
  onVoiceMessage,
  disabled = false,
  placeholder = "Message MAIA...",
  showSanctuary = true
}: ChatGPTStyleInputProps) {
  const [message, setMessage] = useState('');
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSanctuary, setIsSanctuary] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Voice input hook
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
        // Auto-send on voice completion
        if (onVoiceMessage) {
          onVoiceMessage(text.trim());
        } else {
          onSendMessage(text.trim());
        }
      }
    },
    onAutoStop: (finalText) => {
      if (finalText.trim() && onVoiceMessage) {
        onVoiceMessage(finalText.trim());
      }
    },
    silenceTimeoutMs: 2000,
    minSpeechLengthChars: 2
  });

  // Load sanctuary state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('maia_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setIsSanctuary(settings.sanctuary === true);
      } else {
        const defaults = getInitialSessionSettings();
        setIsSanctuary(defaults.sanctuary === true);
      }
    } catch (e) {
      console.error('Failed to load sanctuary state', e);
    }

    const handleSettingsChange = (e: CustomEvent) => {
      if (e.detail?.sanctuary !== undefined) {
        setIsSanctuary(e.detail.sanctuary === true);
      }
    };
    window.addEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${maxHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    if (disabled) return;

    onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Plus menu handlers
  const handleCameraClick = () => {
    setIsPlusMenuOpen(false);
    // Request camera access and capture photo
    if (navigator.mediaDevices?.getUserMedia) {
      // For now, just show a file picker with capture attribute
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          setAttachments(prev => [...prev, { type: 'camera', file, preview }]);
        }
      };
      input.click();
    }
  };

  const handlePhotosClick = () => {
    setIsPlusMenuOpen(false);
    imageInputRef.current?.click();
  };

  const handleFilesClick = () => {
    setIsPlusMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleWebClick = () => {
    setIsPlusMenuOpen(false);
    // Add web search indicator to message
    setMessage(prev => prev + ' [search web] ');
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const preview = type === 'image' ? URL.createObjectURL(file) : undefined;
      setAttachments(prev => [...prev, { type, file, preview }]);
    });
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim().length > 0 || attachments.length > 0) && !disabled && !isRecording;
  const showMic = message.trim().length === 0 && attachments.length === 0;

  // Plus menu items
  const plusMenuItems = [
    { icon: Camera, label: 'Camera', onClick: handleCameraClick, color: 'text-blue-400' },
    { icon: ImageIcon, label: 'Photos', onClick: handlePhotosClick, color: 'text-green-400' },
    { icon: FileText, label: 'Files', onClick: handleFilesClick, color: 'text-amber-400' },
    { icon: Globe, label: 'Web', onClick: handleWebClick, color: 'text-purple-400' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 z-50">
      {/* Sanctuary indicator */}
      {showSanctuary && isSanctuary && (
        <div className="max-w-3xl mx-auto px-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Shield className="w-3 h-3" />
            <span>Sanctuary Mode - This session won't be remembered</span>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-3xl mx-auto px-4 pt-3"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {attachments.map((att, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative flex-shrink-0"
                >
                  {att.preview ? (
                    <img
                      src={att.preview}
                      alt="Attachment"
                      className="w-16 h-16 object-cover rounded-lg border border-neutral-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-700 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording indicator */}
      <AnimatePresence>
        {(isRecording || isTranscribing) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-3xl mx-auto px-4 pt-3"
          >
            <div className="flex items-center gap-3 p-3 bg-neutral-800/80 rounded-xl border border-amber-400/30">
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
                <span className="text-neutral-400 text-sm truncate flex-1">
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

      {/* Main input area */}
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-end gap-2 bg-neutral-800/60 rounded-2xl border border-neutral-700/50 p-2">
          {/* Plus button with menu */}
          <div className="relative self-end">
            <motion.button
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              disabled={disabled || isRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isPlusMenuOpen
                  ? 'bg-amber-400 text-neutral-900'
                  : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <motion.div
                animate={{ rotate: isPlusMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            </motion.button>

            {/* Plus menu popup */}
            <AnimatePresence>
              {isPlusMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-neutral-800 rounded-xl border border-neutral-700 shadow-xl overflow-hidden"
                >
                  {plusMenuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      onClick={item.onClick}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-neutral-700/50 transition-colors"
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-white text-sm">{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening...' : placeholder}
            disabled={disabled || isRecording}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-white placeholder-neutral-500 py-2.5 px-1 max-h-[200px] text-base"
          />

          {/* Mic or Send button */}
          <div className="self-end">
            {showMic ? (
              <motion.button
                onClick={handleMicClick}
                disabled={disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-400 text-neutral-900 hover:bg-amber-300'
                }`}
              >
                {isRecording ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSend}
                disabled={!canSend}
                whileHover={{ scale: canSend ? 1.05 : 1 }}
                whileTap={{ scale: canSend ? 0.95 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  canSend
                    ? 'bg-amber-400 text-neutral-900 hover:bg-amber-300'
                    : 'bg-neutral-700/50 text-neutral-500'
                }`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Voice error */}
        {voiceError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-xs mt-2 px-2"
          >
            {voiceError}
          </motion.p>
        )}

        {/* Helper text */}
        <p className="text-neutral-500 text-xs text-center mt-2">
          MAIA can make mistakes. Consider checking important info.
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'file')}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
      />

      {/* Click outside to close plus menu */}
      {isPlusMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsPlusMenuOpen(false)}
        />
      )}
    </div>
  );
}
