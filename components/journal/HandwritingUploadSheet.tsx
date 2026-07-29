'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, FileText, Save, Loader2, Check, AlertCircle, Sparkles, Info } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import HandwritingOCR from '@/lib/capacitor/HandwritingOCR';
import { apiUrl, apiFetch } from '@/lib/http/apiBase';

interface HandwritingUploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaved?: (entryId: string) => void;
  onAskMaia?: (content: string) => void;
}

type OCRProvider = 'ios_vision' | 'manual_paste' | 'none';

export function HandwritingUploadSheet({
  isOpen,
  onClose,
  userId,
  onSaved,
  onAskMaia,
}: HandwritingUploadSheetProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrAvailable, setOcrAvailable] = useState<boolean | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [ocrProvider, setOcrProvider] = useState<OCRProvider>('none');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check OCR availability on mount
  useEffect(() => {
    HandwritingOCR.isAvailable()
      .then(result => { setOcrAvailable(result.available); })
      .catch(() => { setOcrAvailable(false); }); // plugin not registered on this platform
  }, []);

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setExtractedText('');
      setIsExtracting(false);
      setIsSaving(false);
      setSavedMessage(null);
      setError(null);
      setOcrConfidence(null);
      setOcrProvider('none');
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [extractedText]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setExtractedText('');
    setOcrConfidence(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-extract if OCR is available
    if (ocrAvailable) {
      await extractText(file);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Extract text using OCR
  const extractText = async (file: File) => {
    setIsExtracting(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);

      if (Capacitor.isNativePlatform()) {
        // Use native Vision OCR
        const result = await HandwritingOCR.recognize({
          base64,
          languages: ['en-US'],
        });

        if (result.text) {
          setExtractedText(result.text);
          setOcrConfidence(result.confidence);
          setOcrProvider('ios_vision');
        } else {
          setError('No text found in image. Try a clearer photo or paste manually.');
          setOcrProvider('manual_paste');
        }
      } else {
        // Web: no OCR available
        setOcrProvider('manual_paste');
      }
    } catch (err) {
      console.error('OCR extraction failed:', err);
      setError('Text extraction failed. Please paste your text manually.');
      setOcrProvider('manual_paste');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save journal entry
  const handleSave = async (askMaia: boolean = false) => {
    if (!extractedText.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      // apiFetch (not raw fetch): the server derives the owning member from the
      // verified session, so the request must carry session credentials.
      // `userId` stays in the body for older clients; the server ignores it.
      const response = await apiFetch('/api/journal/quick/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entryType: 'handwriting',
          content: extractedText.trim(),
          tags: ['handwriting', ocrProvider === 'ios_vision' ? 'ocr' : 'manual'],
          source: ocrProvider === 'ios_vision' ? 'handwriting_ocr' : 'handwriting_paste',
          meta: {
            ocrProvider,
            ocrConfidence: ocrConfidence ?? undefined,
            hasImage: !!selectedFile,
            imageSize: selectedFile?.size,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSavedMessage('Journal entry saved ✓');
        onSaved?.(data.entryId);

        if (askMaia) {
          setTimeout(() => {
            onClose();
            onAskMaia?.(extractedText.trim());
          }, 500);
        } else {
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Connection error - try again');
    } finally {
      setIsSaving(false);
    }
  };

  const isNative = Capacitor.isNativePlatform();

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
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-black border-t border-amber-500/30 rounded-t-3xl z-[9999] max-h-[90vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-medium text-white">Handwriting Capture</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Upload Section */}
              {!selectedFile && (
                <div className="space-y-4">
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-3">
                      {isNative ? (
                        <Camera className="w-10 h-10 text-amber-400" />
                      ) : (
                        <Upload className="w-10 h-10 text-amber-400" />
                      )}
                      <div className="text-center">
                        <p className="text-white font-medium">
                          {isNative ? 'Take Photo or Choose Image' : 'Upload Image'}
                        </p>
                        <p className="text-stone-400 text-sm mt-1">
                          {isNative
                            ? 'MAIA will extract the text automatically'
                            : 'Then paste the text manually'}
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
                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-200 font-medium">On-device OCR not available</p>
                        <p className="text-blue-300/70 mt-1">
                          Use your phone&apos;s <strong>Live Text</strong> (iOS) or{' '}
                          <strong>Google Lens</strong> (Android) to copy text, then paste below.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preview + Extraction */}
              {selectedFile && (
                <div className="space-y-4">
                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-stone-700">
                      <img
                        src={previewUrl}
                        alt="Handwritten page"
                        className="w-full max-h-48 object-contain bg-stone-800"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setExtractedText('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}

                  {/* Extraction Status */}
                  {isExtracting && (
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      <span className="text-amber-200">Extracting text...</span>
                    </div>
                  )}

                  {/* OCR Confidence */}
                  {ocrConfidence !== null && ocrConfidence > 0 && (
                    <div className="text-xs text-stone-400">
                      Recognition confidence: {Math.round(ocrConfidence * 100)}%
                    </div>
                  )}

                  {/* Editable Text Area */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      placeholder={
                        ocrAvailable
                          ? 'Extracted text will appear here. Edit as needed...'
                          : 'Paste your text here (use Live Text or Google Lens to copy from image)...'
                      }
                      className="w-full min-h-[120px] max-h-[200px] p-4 bg-stone-800/50 border border-amber-500/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-white placeholder-stone-500 text-base leading-relaxed"
                      disabled={isSaving}
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {/* Save Only */}
                    <button
                      onClick={() => handleSave(false)}
                      disabled={!extractedText.trim() || isSaving}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                        !extractedText.trim() || isSaving
                          ? 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                          : savedMessage
                          ? 'bg-green-500/20 border border-green-500/40 text-green-300'
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
                      <span>{savedMessage || 'Save Entry'}</span>
                    </button>

                    {/* Save + Ask MAIA */}
                    {onAskMaia && (
                      <button
                        onClick={() => handleSave(true)}
                        disabled={!extractedText.trim() || isSaving}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                          !extractedText.trim() || isSaving
                            ? 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Save + Ask MAIA</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Helper text */}
              <p className="text-center text-xs text-stone-500 mt-4">
                Your handwritten wisdom, preserved and searchable.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
