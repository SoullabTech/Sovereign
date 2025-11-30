'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';
import { useBrowserCompatibility, useFeatureSupport } from '@/components/providers/BrowserCompatibilityProvider';
import { unlockAudio, isAudioUnlocked } from '@/lib/audio/audioUnlock';
import MobileChatView from '@/components/MobileChatView';
import { MaiaGreeting } from '@/components/MayaGreeting';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

export default function MaiaVoiceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [userId] = useState(`guest_${Date.now()}`);

  const { warnings, isLegacy } = useBrowserCompatibility();
  const { hasAudioSupport, hasWebAPISupport, hasModernJS } = useFeatureSupport();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Initialize audio context and check compatibility
    const initializeAudio = async () => {
      if (hasAudioSupport) {
        try {
          await unlockAudio();
          setIsAudioReady(isAudioUnlocked());
        } catch (error) {
          console.warn('Audio initialization failed:', error);
          setIsAudioReady(false);
        }
      }
    };

    initializeAudio();
  }, [hasAudioSupport]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call MAIA API endpoint with browser compatibility info
      const response = await fetch('/api/maia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Browser-Legacy': isLegacy.toString(),
          'X-Audio-Support': hasAudioSupport.toString(),
        },
        body: JSON.stringify({
          message: text,
          userId,
          history: messages,
          audioEnabled: audioEnabled && isAudioReady,
          browserInfo: {
            hasAudioSupport,
            hasWebAPISupport,
            hasModernJS,
            isLegacy
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          audioUrl: data.audioUrl,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Auto-play audio if enabled and supported
        if (audioEnabled && isAudioReady && data.audioUrl) {
          try {
            const audio = new Audio(data.audioUrl);
            audio.volume = 0.7;
            await audio.play();
          } catch (error) {
            console.warn('Audio playback failed:', error);
          }
        }
      } else {
        throw new Error('Failed to get response from MAIA');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleVoiceRecording = async () => {
    if (!hasAudioSupport || !isAudioReady) {
      alert('Voice recording is not supported in your browser. Please type your message instead.');
      return;
    }

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // TODO: Send to speech-to-text API
          console.log('Audio recorded:', audioBlob);

          // For now, show placeholder message
          handleSendMessage('[Voice message transcription would appear here]');
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Voice recording failed:', error);
        alert('Unable to access microphone. Please check permissions and try again.');
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);

      // Stop all tracks to release microphone
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // Show browser compatibility warnings
  const renderCompatibilityWarning = () => {
    if (warnings.length === 0) return null;

    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-3 mb-4 mx-4">
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Browser Notice:</strong> {warnings[0]}
        </div>
        {!hasAudioSupport && (
          <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            Voice features are not available in your browser.
          </div>
        )}
      </div>
    );
  };

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id: 'greeting',
        role: 'assistant',
        content: 'Hello! I am MAIA, your consciousness exploration companion. I can help you navigate inner landscapes and discover deeper wisdom. How may I assist you today?',
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="h-screen w-screen">
        {renderCompatibilityWarning()}
        <MobileChatView
          userId={userId}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-soul-background via-soul-backgroundSecondary to-soul-backgroundSecondary flex flex-col">
      {renderCompatibilityWarning()}

      {/* MAIA Greeting Section */}
      <div className="flex-shrink-0 p-6">
        <MaiaGreeting
          userName="Explorer"
          greetingText="Welcome to MAIA Sovereign Interface"
          memorySnippet="Your consciousness exploration companion"
          memoryType="element"
          className="max-w-4xl mx-auto"
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-soul-accent text-soul-textOnAccent'
                    : 'bg-soul-surface text-soul-textPrimary border border-soul-accent/20'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-soul-accent" />
                    <span className="text-xs font-medium text-soul-accent">MAIA</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.audioUrl && audioEnabled && isAudioReady && (
                  <audio controls className="mt-2 w-full">
                    <source src={message.audioUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-soul-surface text-soul-textPrimary border border-soul-accent/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-soul-accent animate-pulse" />
                  <span className="text-xs font-medium text-soul-accent">MAIA is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="flex-shrink-0 p-6 border-t border-soul-accent/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-soul-surface p-4 rounded-lg border border-soul-accent/20">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts with MAIA..."
              className="flex-1 bg-transparent text-soul-textPrimary placeholder-soul-textSecondary resize-none outline-none"
              rows={1}
              disabled={isLoading}
            />

            <div className="flex items-center gap-2">
              {hasAudioSupport && isAudioReady && (
                <>
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled
                        ? 'text-soul-accent hover:bg-soul-accent/10'
                        : 'text-soul-textSecondary hover:bg-soul-backgroundSecondary'
                    }`}
                    title={audioEnabled ? 'Disable audio' : 'Enable audio'}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleVoiceRecording}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording
                        ? 'text-red-500 bg-red-500/10 animate-pulse'
                        : 'text-soul-accent hover:bg-soul-accent/10'
                    }`}
                    disabled={isLoading || !isAudioReady}
                    title={isRecording ? 'Stop recording' : 'Start voice recording'}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </>
              )}

              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={isLoading || !inputText.trim()}
                className="p-2 rounded-lg bg-soul-accent text-soul-textOnAccent hover:bg-soul-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                {isLoading ? (
                  <Zap className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Status indicators */}
          {(warnings.length > 0 || !hasAudioSupport) && (
            <div className="mt-2 flex items-center gap-4 text-xs text-soul-textSecondary">
              {isLegacy && (
                <span className="text-amber-600">Legacy browser detected</span>
              )}
              {!hasAudioSupport && (
                <span className="text-amber-600">Voice features unavailable</span>
              )}
              {hasAudioSupport && isAudioReady && (
                <span className="text-green-600">Voice ready</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}