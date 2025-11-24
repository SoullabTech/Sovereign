"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send } from "lucide-react";
import { getMaiaSystemPrompt } from "@/lib/voice/MaiaSystemPrompt";
import { RhythmHoloflower } from "@/components/liquid/RhythmHoloflower";
import { ConversationalRhythm } from "@/lib/liquid/ConversationalRhythm";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function OracleConversation({ onOpenLabTools }: { onOpenLabTools: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionType, setSessionType] = useState<"dialogue" | "patient" | "scribe">("dialogue");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Conversational Rhythm tracking
  const [rhythmTracker] = useState(() => new ConversationalRhythm());
  const [rhythmMetrics, setRhythmMetrics] = useState(rhythmTracker.getMetrics());

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, isStreaming, scrollToBottom]);

  const getModeStyle = (mode: typeof sessionType) => {
    switch (mode) {
      case "dialogue":
        return "natural";
      case "patient":
        return "consciousness";
      case "scribe":
        return "adaptive";
    }
  };

  async function sendMessage() {
    if (!input.trim()) return;

    // Track speech end for rhythm analysis
    rhythmTracker.onSpeechEnd(input.trim());
    setRhythmMetrics(rhythmTracker.getMetrics());

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Add placeholder for streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const res = await fetch("/api/maia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          mode: sessionType,
          systemPrompt: getMaiaSystemPrompt({
            conversationStyle: getModeStyle(sessionType),
          }),
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Response error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming failed");

      let streamedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        streamedText += new TextDecoder().decode(value);

        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: streamedText, timestamp: new Date() },
        ]);
      }

      // Track MAIA response completion
      rhythmTracker.onMAIAResponse();
      setRhythmMetrics(rhythmTracker.getMetrics());
    } catch (error) {
      console.error("MAIA conversation error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Something interrupted our connection. Try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1A1512]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#3A2F28]">
        <div className="flex gap-1 bg-[#2A211B] rounded-full p-1">
          {(["dialogue", "patient", "scribe"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSessionType(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-light transition-all capitalize ${
                sessionType === mode
                  ? "bg-[#3A2E26] text-[#D4B896] border border-[#D4B896]/30"
                  : "text-[#D4B896]/60 hover:text-[#D4B896]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenLabTools}
          className="text-[#D4B896]/60 hover:text-[#D4B896] transition-colors p-2"
        >
          <BookOpen size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6">
              <RhythmHoloflower
                rhythmMetrics={rhythmMetrics}
                size={96}
                interactive={false}
                isProcessing={isStreaming}
                motionState={isStreaming ? 'processing' : 'idle'}
              />
            </div>
            <p className="text-[#D4B896]/70 text-sm font-light mb-2">
              What's alive in you right now?
            </p>
            <p className="text-[#D4B896]/40 text-xs font-light">Type to begin</p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-xl ${
                  m.role === "user"
                    ? "bg-[#2D231C] text-[#D4B896]/90"
                    : "bg-[#3A2E26] text-[#D4B896]/80"
                }`}
              >
                <p className="text-sm leading-relaxed font-light whitespace-pre-wrap">
                  {m.content}
                  {isStreaming && i === messages.length - 1 && m.role === "assistant" && (
                    <span className="inline-block w-1.5 h-4 bg-[#D4B896]/60 ml-1 animate-pulse" />
                  )}
                </p>
                <p className="text-xs text-[#D4B896]/30 mt-2 font-light">
                  {m.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#3A2F28] bg-[#1A1512]">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#2A211B] border border-[#3A2F28] rounded-lg px-4 py-3 text-[#D4B896] text-sm font-light placeholder:text-[#D4B896]/30 focus:outline-none focus:border-[#D4B896]/40"
            placeholder="Speak to MAIA..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className={`p-3 rounded-lg transition-all ${
              input.trim() && !isStreaming
                ? "bg-[#D4B896] text-[#1A1512] hover:bg-[#D4B896]/90"
                : "bg-[#2A211B] text-[#D4B896]/30 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}