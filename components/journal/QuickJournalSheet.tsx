'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Moon, Sun, Save, Sparkles, Loader2, Check, AlertCircle, ChevronDown, ChevronUp, Play, Square, Trash2 } from 'lucide-react';

interface JournalEntry {
  id: string;
  entry_type: 'dream' | 'day';
  content: string;
  created_at: string;
  audio_path?: string;
  audio_duration_ms?: number;
}

type JournalType = 'dream' | 'day';

interface QuickJournalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultTab?: JournalType;
  onSaved?: (entryId: string) => void;
  onAskMaia?: (content: string, type: JournalType) => void;
}

export function QuickJournalSheet({
  isOpen,
  onClose,
  userId,
  defaultTab = 'dream',
  onSaved,
  onAskMaia
}: QuickJournalSheetProps) {
  const [activeTab, setActiveTab] = useState<JournalType>(defaultTab);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordDurationMs, setRecordDurationMs] = useState<number>(0);
  const recordStartRef = useRef<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const speechRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset content when sheet opens and fetch recent entries
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSavedMessage(null);
      setSaveError(null);
      setActiveTab(defaultTab);
      setShowRecent(false);
      setRecordedBlob(null);
      setRecordDurationMs(0);
      setLiveTranscript('');
      setIsRecording(false);
      // Focus textarea after animation
      setTimeout(() => textareaRef.current?.focus(), 300);

      // Fetch recent entries
      if (userId) {
        setIsLoadingRecent(true);
        fetch(`/api/journal/quick?userId=${encodeURIComponent(userId)}&limit=5`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setRecentEntries(data.entries || []);
            }
          })
          .catch(err => console.error('Failed to fetch recent entries:', err))
          .finally(() => setIsLoadingRecent(false));
      }
    }
  }, [isOpen, defaultTab, userId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const getPlaceholder = () => {
    if (activeTab === 'dream') {
      return "What did you dream? Let it flow without editing...";
    }
    return "What's alive in you right now? Capture this moment...";
  };

  const getTitle = () => {
    const hour = new Date().getHours();
    if (activeTab === 'dream') {
      return hour < 12 ? 'Morning Dream Capture' : 'Dream Recall';
    }
    if (hour < 12) return 'Morning Reflection';
    if (hour < 17) return 'Midday Check-in';
    return 'Evening Reflection';
  };

  const handleSave = async (askMaia: boolean = false) => {
    if (!content.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch('/api/journal/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entryType: activeTab,
          content: content.trim(),
          tags: [activeTab, 'quick_capture'],
          source: 'quick_sheet'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Upload audio if we have a recording
        if (recordedBlob) {
          try {
            await uploadAudio(data.entryId);
            setSavedMessage(activeTab === 'dream' ? 'Dream + audio captured ✓' : 'Saved with audio ✓');
          } catch (e: any) {
            console.error('Audio upload failed:', e);
            setSavedMessage(activeTab === 'dream' ? 'Dream captured (audio failed)' : 'Saved (audio failed)');
          }
        } else {
          setSavedMessage(activeTab === 'dream' ? 'Dream captured ✓' : 'Saved ✓');
        }

        onSaved?.(data.entryId);

        if (askMaia) {
          // Close sheet and send to MAIA
          setTimeout(() => {
            onClose();
            onAskMaia?.(content.trim(), activeTab);
          }, 500);
        } else {
          // Just show confirmation and close
          setTimeout(() => {
            setContent('');
            setRecordedBlob(null);
            onClose();
          }, 1200);
        }
      } else {
        console.error('Failed to save journal entry:', data.error);
        setSaveError(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setSaveError('Connection error - try again');
    } finally {
      setIsSaving(false);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    setSaveError(null);
    setRecordedBlob(null);
    setRecordDurationMs(0);
    recordedChunksRef.current = [];
    setLiveTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setRecordDurationMs(Date.now() - recordStartRef.current);
      };

      recordStartRef.current = Date.now();
      mr.start();
      setIsRecording(true);

      // Optional live transcript using Web Speech API (best-effort)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        speechRef.current = rec;
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        let finalTranscript = '';
        rec.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interim += transcript;
            }
          }
          setLiveTranscript(finalTranscript + interim);
        };

        rec.onerror = (e: Event) => {
          console.log('Speech recognition error:', e);
        };

        try {
          rec.start();
        } catch (e) {
          console.log('Speech recognition start failed:', e);
        }
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
      setSaveError('Could not access microphone');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    setIsRecording(false);

    // Stop speech recognition
    try {
      speechRef.current?.stop?.();
    } catch (e) {
      // Ignore
    }
    speechRef.current = null;

    // Stop media recorder
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
    }
  };

  // Discard recorded audio
  const discardRecording = () => {
    setRecordedBlob(null);
    setRecordDurationMs(0);
    setLiveTranscript('');
  };

  // Handle voice toggle button
  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Auto-fill transcript into content when recording stops
  useEffect(() => {
    if (!isRecording && liveTranscript && !content.trim()) {
      setContent(liveTranscript.trim());
    }
  }, [isRecording, liveTranscript]);

  // Upload audio after text entry is saved
  const uploadAudio = async (entryId: string): Promise<void> => {
    if (!recordedBlob) return;

    const fd = new FormData();
    fd.append('userId', userId);
    fd.append('entryId', entryId);
    fd.append('durationMs', String(recordDurationMs || 0));
    fd.append('transcriptSource', liveTranscript ? 'web_speech' : 'none');
    fd.append('audio', new File([recordedBlob], 'journal.webm', { type: 'audio/webm' }));

    const res = await fetch('/api/journal/quick/audio', { method: 'POST', body: fd });
    const j = await res.json();
    if (!j.success) {
      throw new Error(j.error || 'Audio upload failed');
    }
    console.log('🎙️ Audio uploaded:', j.audioPath);
  };

  // Format duration for display
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-black border-t border-amber-500/30 rounded-t-3xl z-[9999] max-h-[85vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                {activeTab === 'dream' ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
                <h2 className="text-lg font-medium text-white">{getTitle()}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 mb-4">
              <button
                onClick={() => setActiveTab('dream')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                  activeTab === 'dream'
                    ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                    : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:bg-stone-700/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">Dream</span>
              </button>
              <button
                onClick={() => setActiveTab('day')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                  activeTab === 'day'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:bg-stone-700/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">Day</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4">
              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={getPlaceholder()}
                  className={`w-full min-h-[120px] max-h-[200px] p-4 bg-stone-800/50 border rounded-xl resize-none focus:outline-none focus:ring-2 text-white placeholder-stone-500 text-base leading-relaxed ${
                    activeTab === 'dream'
                      ? 'border-indigo-500/30 focus:ring-indigo-500/30'
                      : 'border-amber-500/30 focus:ring-amber-500/30'
                  }`}
                  disabled={isSaving}
                />

                {/* Voice Button (inside textarea area) */}
                <button
                  onClick={handleVoiceToggle}
                  disabled={isSaving}
                  className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : recordedBlob
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-stone-700/50 text-stone-400 hover:bg-stone-600/50'
                  }`}
                  title={isRecording ? 'Stop recording' : recordedBlob ? 'Re-record' : 'Record voice note'}
                >
                  {isRecording ? (
                    <Square className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-400 text-sm"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording... speak now</span>
                  {liveTranscript && (
                    <span className="text-stone-400 text-xs truncate max-w-[200px]">
                      "{liveTranscript.slice(-50)}"
                    </span>
                  )}
                </motion.div>
              )}

              {/* Recorded audio indicator */}
              {recordedBlob && !isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Mic className="w-4 h-4" />
                    <span>Voice note ({formatDuration(recordDurationMs)})</span>
                  </div>
                  <button
                    onClick={discardRecording}
                    className="ml-auto p-1 text-stone-400 hover:text-red-400 transition-colors"
                    title="Discard recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Character count for long entries */}
              {content.length > 500 && (
                <div className="text-right text-xs text-stone-500 mt-1">
                  {content.length} characters
                </div>
              )}

              {/* Error Display */}
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{saveError}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                {/* Save Only */}
                <button
                  onClick={() => handleSave(false)}
                  disabled={!content.trim() || isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    !content.trim() || isSaving
                      ? 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                      : savedMessage
                      ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                      : activeTab === 'dream'
                      ? 'bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedMessage ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{savedMessage || 'Save'}</span>
                </button>

                {/* Save + Ask MAIA */}
                {onAskMaia && (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={!content.trim() || isSaving}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      !content.trim() || isSaving
                        ? 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Save + Ask MAIA</span>
                  </button>
                )}
              </div>

              {/* Recent Entries Section */}
              {recentEntries.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-700/50">
                  <button
                    onClick={() => setShowRecent(!showRecent)}
                    className="w-full flex items-center justify-between text-stone-400 hover:text-stone-300 transition-colors"
                  >
                    <span className="text-xs font-medium">
                      Recent entries ({recentEntries.length})
                    </span>
                    {showRecent ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showRecent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto">
                          {recentEntries.map(entry => (
                            <div
                              key={entry.id}
                              className={`p-2 rounded-lg text-xs ${
                                entry.entry_type === 'dream'
                                  ? 'bg-indigo-500/10 border border-indigo-500/20'
                                  : 'bg-amber-500/10 border border-amber-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {entry.entry_type === 'dream' ? (
                                  <Moon className="w-3 h-3 text-indigo-400" />
                                ) : (
                                  <Sun className="w-3 h-3 text-amber-400" />
                                )}
                                <span className="text-stone-500">
                                  {new Date(entry.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-stone-300 line-clamp-2">
                                {entry.content}
                              </p>
                              {/* Audio playback if entry has audio */}
                              {entry.audio_path && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Mic className="w-3 h-3 text-green-400" />
                                  <audio
                                    controls
                                    className="h-6 flex-1"
                                    style={{ minWidth: 0 }}
                                    src={`/api/journal/quick/audio-file?path=${encodeURIComponent(entry.audio_path)}`}
                                  />
                                  {entry.audio_duration_ms && (
                                    <span className="text-stone-500 text-xs">
                                      {formatDuration(entry.audio_duration_ms)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Loading recent entries */}
              {isLoadingRecent && (
                <div className="flex items-center justify-center gap-2 mt-3 text-stone-500 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Loading recent entries...</span>
                </div>
              )}

              {/* Subtle helper text */}
              <p className="text-center text-xs text-stone-500 mt-3">
                {activeTab === 'dream'
                  ? 'Capture before it fades. Details matter.'
                  : 'A moment of presence. What wants to be witnessed?'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
