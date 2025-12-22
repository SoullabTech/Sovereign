'use client';

import { useState, useRef, KeyboardEvent } from 'react';

type VoiceMode = 'talk' | 'care' | 'note';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  currentMode: VoiceMode;
}

const EXAMPLE_PROMPTS: Record<VoiceMode, string[]> = {
  talk: [
    "Hey, I feel stuck.",
    "What shifted?",
    "I'm here.",
  ],
  care: [
    "I keep sabotaging myself.",
    "I shut down when things get hard.",
    "How do I know if this is real progress?",
  ],
  note: [
    "I feel better today.",
    "This feels familiar.",
    "I noticed a pattern.",
  ],
};

export function InputArea({ onSendMessage, disabled, currentMode }: InputAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 mr-2">Try:</span>
        {EXAMPLE_PROMPTS[currentMode].map((example, i) => (
          <button
            key={i}
            onClick={() => handleExampleClick(example)}
            disabled={disabled}
            className="text-xs bg-slate-800/50 hover:bg-slate-700/50 border border-violet-500/30 rounded px-2 py-1 text-violet-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-slate-900/50 border border-violet-500/30 rounded-lg p-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={`Type your message (${currentMode} mode)...`}
          className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none min-h-[60px] max-h-[200px]"
          rows={2}
        />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-violet-500/30">
          <span className="text-xs text-slate-400">
            Press Enter to send, Shift+Enter for new line
          </span>

          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {disabled ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
