'use client';

import { useState, useRef, useCallback } from 'react';

interface MessageInputProps {
  channelName: string;
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ channelName, onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const handleSend = async () => {
    const body = value.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body);
      setValue('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-amber-500/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => { setValue(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          disabled={disabled || sending}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/25 resize-none outline-none leading-relaxed py-1"
          style={{ minHeight: '24px', maxHeight: '160px' }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending || disabled}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500/80 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors mb-0.5"
          title="Send (Enter)"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m-7 7 7-7 7 7" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-white/20 mt-1.5 pl-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
