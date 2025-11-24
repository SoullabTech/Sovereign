'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X, Copy, BookOpen, Mic, MicOff } from 'lucide-react';
import { useMaiaStore } from '@/lib/maia/state';
import { Holoflower } from './ui/Holoflower';
import { SacredLabDrawer } from './lab/SacredLabDrawer';
import { getVoiceTranscript, speakText } from '@/lib/voice/utils';
import { TYPE_MODE, DialogueMode, PatientMode, ScribeMode } from '@/lib/maia/modes';
import { ContinuousConversation, ContinuousConversationRef } from './voice/ContinuousConversation';
import { VoiceCommandDetector } from '@/ui/VoiceCommandDetector';
import { QuickModeToggle } from '@/ui/QuickModeToggle';
import { MaiaChatInterface } from './chat/MaiaChatInterface';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';

export default function OracleConversation({
  onToggleLabTools,
  mode,
}: {
  onToggleLabTools: () => void;
  mode?: TYPE_MODE;
}) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { userId } = useMaiaStore();

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleUserInput = async (text: string) => {
    if (!text) return;
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const stream = await fetch('/api/maia/voice-chat', {
        method: 'POST',
        body: JSON.stringify({
          user: userId,
          mode: mode || TYPE_MODE.DIALOGUE,
          input: text,
        }),
      });

      if (!stream.ok) throw new Error('Voice chat failed');

      const reader = stream.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      let assistantMsg = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantMsg += new TextDecoder().decode(value);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: assistantMsg },
        ]);
      }
      speakText(assistantMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => mode === TYPE_MODE.DIALOGUE ? null : handleUserInput('')}
            className={mode === TYPE_MODE.DIALOGUE ? 'font-bold' : ''}
          >
            Dialogue
          </button>
          <button
            onClick={() => mode === TYPE_MODE.PATIENT ? null : handleUserInput('')}
            className={mode === TYPE_MODE.PATIENT ? 'font-bold' : ''}
          >
            Patient
          </button>
          <button
            onClick={() => mode === TYPE_MODE.SCRIBE ? null : handleUserInput('')}
            className={mode === TYPE_MODE.SCRIBE ? 'font-bold' : ''}
          >
            Scribe
          </button>
        </div>
        <button onClick={onToggleLabTools} className="text-[#D4B896] hover:opacity-80">
          <BookOpen size={20} />
        </button>
      </div>

      <div className="space-y-4 mb-24">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 rounded-lg max-w-[85%] ${
              m.role === 'user'
                ? 'ml-auto bg-[#2D231C]'
                : 'mr-auto bg-[#3A2E26]'
            }`}
          >
            {m.content}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1512] border-t border-[#3A2F28] p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#2A211B] text-[#D4B896] px-3 py-2 rounded-md"
            placeholder="Speak or type to MAIA…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUserInput(input)}
          />
          <button
            className="bg-[#D4B896] text-black px-4 rounded-md"
            onClick={() => handleUserInput(input)}
          >
            Send
          </button>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="text-[#D4B896] hover:opacity-80"
          >
            {voiceEnabled ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}