'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Moon, Sun, Save, Sparkles, Loader2, Check, AlertCircle, ChevronDown, ChevronUp, Square, Trash2, PenTool, Camera, Upload, Info, BookOpen } from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';
import HandwritingOCR from '@/lib/capacitor/HandwritingOCR';
import { saveQuickJournal, getStorageDecision } from '@/lib/storage/sovereign';

interface JournalEntry {
  id: string;
  entry_type: 'dream' | 'day' | 'handwriting';
  content: string;
  created_at: string;
  audio_path?: string;
  audio_duration_ms?: number;
}

type JournalType = 'dream' | 'day' | 'handwriting';
type OCRProvider = 'ios_vision' | 'manual_paste' | 'none';

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
  const router = useRouter();
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

  // Handwriting state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrAvailable, setOcrAvailable] = useState<boolean | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [ocrProvider, setOcrProvider] = useState<OCRProvider>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordDurationMs, setRecordDurationMs] = useState<number>(0);
  const recordStartRef = useRef<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const speechRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check OCR availability on mount
  useEffect(() => {
    HandwritingOCR.isAvailable()
      .then(result => { setOcrAvailable(result.available); })
      .catch(() => { setOcrAvailable(false); }); // plugin not registered on this platform
  }, []);

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
      // Reset handwriting state
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsExtracting(false);
      setOcrConfidence(null);
      setOcrProvider('none');
      // Focus textarea after animation (unless handwriting tab)
      if (defaultTab !== 'handwriting') {
        setTimeout(() => textareaRef.current?.focus(), 300);
      }

      // Fetch recent entries
      if (userId) {
        setIsLoadingRecent(true);
        fetch(`/api/journal/quick/list?userId=${encodeURIComponent(userId)}&limit=5`)
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
    if (activeTab === 'handwriting') {
      return ocrAvailable
        ? 'Extracted text will appear here. Edit as needed...'
        : 'Paste your text here (use Live Text or Google Lens to copy from image)...';
    }
    return "What's alive in you right now? Capture this moment...";
  };

  const getTitle = () => {
    const hour = new Date().getHours();
    if (activeTab === 'dream') {
      return hour < 12 ? 'Morning Dream Capture' : 'Dream Recall';
    }
    if (activeTab === 'handwriting') {
      return 'Handwriting Capture';
    }
    if (hour < 12) return 'Morning Reflection';
    if (hour < 17) return 'Midday Check-in';
    return 'Evening Reflection';
  };

  const isNative = Capacitor.isNativePlatform();

  // Handwriting: file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Handwriting: extract text using OCR
  const extractText = async (file: File) => {
    setIsExtracting(true);
    setSaveError(null);

    try {
      const base64 = await fileToBase64(file);

      if (Capacitor.isNativePlatform()) {
        // Use native Vision OCR
        const result = await HandwritingOCR.recognize({
          base64,
          languages: ['en-US'],
        });

        if (result.text) {
          setContent(result.text);
          setOcrConfidence(result.confidence);
          setOcrProvider('ios_vision');
        } else {
          setSaveError('No text found in image. Try a clearer photo or paste manually.');
          setOcrProvider('manual_paste');
        }
      } else {
        // Web: no OCR available
        setOcrProvider('manual_paste');
      }
    } catch (err) {
      console.error('OCR extraction failed:', err);
      setSaveError('Text extraction failed. Please paste your text manually.');
      setOcrProvider('manual_paste');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handwriting: handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSaveError(null);
    setContent('');
    setOcrConfidence(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-extract if OCR is available
    if (ocrAvailable) {
      await extractText(file);
    }
  };

  const handleSave = async (askMaia: boolean = false) => {
    if (!content.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      // Build entry data based on type
      const isHandwriting = activeTab === 'handwriting';
      const tags = isHandwriting
        ? ['handwriting', ocrProvider === 'ios_vision' ? 'ocr' : 'manual']
        : [activeTab, 'quick_capture'];
      const source = isHandwriting
        ? (ocrProvider === 'ios_vision' ? 'handwriting_ocr' : 'handwriting_paste')
        : 'quick_sheet';

      // Build metadata for handwriting
      const meta = isHandwriting
        ? {
            ocrProvider,
            ocrConfidence: ocrConfidence ?? undefined,
            hasImage: !!selectedFile,
            imageSize: selectedFile?.size,
          }
        : undefined;

      // Use sovereign storage (respects consent: local, server, both, or ephemeral)
      const result = await saveQuickJournal(content.trim(), {
        userId,
        entryType: activeTab,
        source: source as 'quick_sheet' | 'voice' | 'scan' | 'handwriting_ocr' | 'handwriting_paste',
        tags,
        meta,
        audioBlob: recordedBlob || undefined,
        audioDurationMs: recordDurationMs || undefined,
      });

      if (result.success) {
        console.log(`[JournalSave] Saved: local=${result.local}, server=${result.server}, pendingSync=${result.pendingSync}`);

        // Determine the save message based on what succeeded
        let baseMessage: string;
        if (result.server) {
          // Server save succeeded - data is safe
          baseMessage = activeTab === 'dream' ? 'Dream captured ✓' : activeTab === 'handwriting' ? 'Handwriting saved ✓' : 'Saved ✓';
        } else if (result.local && result.pendingSync) {
          // Local only - warn user that sync is pending
          baseMessage = activeTab === 'dream' ? 'Dream saved locally (sync pending)' : 'Saved locally (sync pending)';
          console.warn('[JournalSave] Server sync failed - entry saved locally only. Will retry sync later.');
        } else {
          baseMessage = activeTab === 'dream' ? 'Dream captured' : 'Saved';
        }

        // Upload audio to server if user consents to server storage and we have audio
        if (recordedBlob && !isHandwriting) {
          const audioDecision = await getStorageDecision('audio');
          if (audioDecision?.saveServer && result.id) {
            try {
              const uploadResult = await uploadAudio(result.id);
              if (uploadResult.success) {
                setSavedMessage(baseMessage.replace('✓', '+ audio ✓'));
              } else if (uploadResult.error === 'PAID_FEATURE') {
                // Paid feature - audio saved locally, server sync requires upgrade
                setSavedMessage(baseMessage + ' (local audio)');
              } else {
                // Other error - audio still saved locally
                setSavedMessage(baseMessage + ' (audio pending)');
              }
            } catch (e: unknown) {
              console.error('Audio upload to server failed:', e);
              // Audio is still saved locally, so this is just a warning
              setSavedMessage(baseMessage + ' (audio pending)');
            }
          } else {
            // Audio saved locally only
            setSavedMessage(baseMessage.replace('✓', '+ audio ✓'));
          }
        } else {
          setSavedMessage(baseMessage);
        }

        if (result.id) onSaved?.(result.id);

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
            setSelectedFile(null);
            setPreviewUrl(null);
            onClose();
          }, 1200);
        }
      } else {
        console.error('Failed to save journal entry:', result.error);
        // Show specific error message if available
        if (result.error?.includes('sign in')) {
          setSaveError(result.error);
        } else {
          setSaveError('Failed to save - please try again');
        }
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
  // Note: Server reads consent from member_settings.storage_consent (authoritative),
  // not from client-provided values. userId is still passed until auth middleware exists.
  const uploadAudio = async (entryId: string): Promise<{ success: boolean; error?: string }> => {
    if (!recordedBlob) return { success: false, error: 'No audio to upload' };

    const fd = new FormData();
    fd.append('userId', userId); // TODO: Remove once auth middleware derives userId from session
    fd.append('entryId', entryId);
    fd.append('durationMs', String(recordDurationMs || 0));
    fd.append('transcriptSource', liveTranscript ? 'web_speech' : 'none');
    fd.append('audio', new File([recordedBlob], 'journal.webm', { type: 'audio/webm' }));

    const res = await fetch(apiUrl('/api/journal/quick/audio'), { method: 'POST', body: fd });
    const j = await res.json();

    // Handle paid feature gate (402)
    if (res.status === 402) {
      console.log('🔒 Server audio requires paid membership');
      return { success: false, error: 'PAID_FEATURE' };
    }

    // Handle consent disabled (403)
    if (res.status === 403) {
      console.log('🔒 Server audio disabled by user consent');
      return { success: false, error: 'CONSENT_DISABLED' };
    }

    if (!j.success) {
      throw new Error(j.error || 'Audio upload failed');
    }

    console.log('🎙️ Audio uploaded:', j.audioPath);
    return { success: true };
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
                ) : activeTab === 'handwriting' ? (
                  <PenTool className="w-5 h-5 text-amber-400" />
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  activeTab === 'day'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:bg-stone-700/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">Day</span>
              </button>
              <button
                onClick={() => setActiveTab('handwriting')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  activeTab === 'handwriting'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:bg-stone-700/50'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span className="text-sm font-medium">Ink</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-160px)]">
              {/* Handwriting: Upload Section (before file selected) */}
              {activeTab === 'handwriting' && !selectedFile && (
                <div className="space-y-4 mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-5 border-2 border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {isNative ? (
                        <Camera className="w-8 h-8 text-amber-400" />
                      ) : (
                        <Upload className="w-8 h-8 text-amber-400" />
                      )}
                      <div className="text-center">
                        <p className="text-white font-medium text-sm">
                          {isNative ? 'Take Photo or Choose Image' : 'Upload Image'}
                        </p>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {isNative
                            ? 'MAIA will extract the text automatically'
                            : 'Then paste the text manually below'}
                        </p>
                      </div>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture={isNative ? 'environment' : undefined}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Web fallback guidance */}
                  {!isNative && (
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="text-blue-200 font-medium">On-device OCR not available</p>
                        <p className="text-blue-300/70 mt-0.5">
                          Use <strong>Live Text</strong> (iOS) or <strong>Google Lens</strong> (Android) to copy text, then paste below.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Handwriting: Image Preview */}
              {activeTab === 'handwriting' && selectedFile && previewUrl && (
                <div className="relative rounded-xl overflow-hidden border border-stone-700 mb-4">
                  <img
                    src={previewUrl}
                    alt="Handwritten page"
                    className="w-full max-h-36 object-contain bg-stone-800"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setContent('');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* Handwriting: Extraction Status */}
              {activeTab === 'handwriting' && isExtracting && (
                <div className="flex items-center gap-3 p-3 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-amber-200 text-sm">Extracting text...</span>
                </div>
              )}

              {/* Handwriting: OCR Confidence */}
              {activeTab === 'handwriting' && ocrConfidence !== null && ocrConfidence > 0 && (
                <div className="text-xs text-stone-400 mb-2">
                  Recognition confidence: {Math.round(ocrConfidence * 100)}%
                </div>
              )}

              {/* Textarea (show for all tabs, but after upload UI for handwriting) */}
              {(activeTab !== 'handwriting' || selectedFile || !isNative) && (
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
                    disabled={isSaving || isExtracting}
                  />

                  {/* Voice Button (inside textarea area) - not for handwriting */}
                  {activeTab !== 'handwriting' && (
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
                  )}
                </div>
              )}

              {/* Recording indicator (not for handwriting) */}
              {activeTab !== 'handwriting' && isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-400 text-sm"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording... speak now</span>
                  {liveTranscript && (
                    <span className="text-stone-400 text-xs truncate max-w-[200px]">
                      &quot;{liveTranscript.slice(-50)}&quot;
                    </span>
                  )}
                </motion.div>
              )}

              {/* Recorded audio indicator (not for handwriting) */}
              {activeTab !== 'handwriting' && recordedBlob && !isRecording && (
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
                                ) : entry.entry_type === 'handwriting' ? (
                                  <PenTool className="w-3 h-3 text-amber-400" />
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

              {/* View All in Journal link */}
              <button
                onClick={() => {
                  onClose();
                  // Member route — /labtools/journal is behind the founder gate.
                  router.push('/journal');
                }}
                className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View All in Journal</span>
              </button>

              {/* Subtle helper text */}
              <p className="text-center text-xs text-stone-500 mt-3">
                {activeTab === 'dream'
                  ? 'Capture before it fades. Details matter.'
                  : activeTab === 'handwriting'
                  ? 'Your handwritten wisdom, preserved and searchable.'
                  : 'A moment of presence. What wants to be witnessed?'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
