'use client';

import { useState, useRef, useCallback } from 'react';
import type { PromptScaffoldField, MessageKind } from '@/lib/team/types';

const KIND_OPTIONS: { value: MessageKind; label: string }[] = [
  { value: 'build',    label: 'Build' },
  { value: 'question', label: 'Question' },
  { value: 'request',  label: 'Request' },
  { value: 'decision', label: 'Decision' },
  { value: 'insight',  label: 'Insight' },
];

interface MessageInputProps {
  channelName: string;
  onSend: (body: string, kind: MessageKind) => Promise<void>;
  disabled?: boolean;
  promptScaffold?: PromptScaffoldField[];
}

export function MessageInput({ channelName, onSend, disabled, promptScaffold }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [structured, setStructured] = useState(false);
  const [scaffoldValues, setScaffoldValues] = useState<Record<string, string>>({});
  const [selectedKind, setSelectedKind] = useState<MessageKind>('build');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasScaffold = promptScaffold && promptScaffold.length > 0;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const serializeScaffold = (): string => {
    if (!promptScaffold) return '';
    return promptScaffold
      .filter(f => scaffoldValues[f.label]?.trim() || f.required)
      .map(f => {
        const val = scaffoldValues[f.label]?.trim() ?? '';
        if (!val && !f.required) return null;
        return `**${f.label}**\n${val}`;
      })
      .filter(Boolean)
      .join('\n\n');
  };

  const canSendStructured = (): boolean => {
    if (!promptScaffold) return false;
    return promptScaffold
      .filter(f => f.required)
      .every(f => scaffoldValues[f.label]?.trim());
  };

  const handleSend = async () => {
    let body: string;
    if (structured && hasScaffold) {
      body = serializeScaffold();
    } else {
      body = value.trim();
    }
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body, selectedKind);
      setValue('');
      setScaffoldValues({});
      setSelectedKind('build');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
      if (!structured) textareaRef.current?.focus();
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
      {/* Structured / Freeform toggle */}
      {hasScaffold && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex rounded-full border border-white/10 overflow-hidden text-xs">
            <button
              onClick={() => setStructured(false)}
              className={`px-3 py-1 transition-colors ${
                !structured ? 'bg-amber-500/20 text-amber-300' : 'text-white/30 hover:text-white/60'
              }`}
            >
              Freeform
            </button>
            <button
              onClick={() => setStructured(true)}
              className={`px-3 py-1 transition-colors ${
                structured ? 'bg-amber-500/20 text-amber-300' : 'text-white/30 hover:text-white/60'
              }`}
            >
              Structured
            </button>
          </div>
        </div>
      )}

      {structured && hasScaffold ? (
        /* Structured mode: render scaffold fields */
        <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl px-3 py-3 focus-within:border-amber-500/40 transition-colors">
          {promptScaffold!.map(field => (
            <div key={field.label}>
              <label className="block text-xs text-white/40 mb-1">
                {field.label}
                {field.required && <span className="text-amber-500/60 ml-0.5">*</span>}
              </label>
              <textarea
                value={scaffoldValues[field.label] ?? ''}
                onChange={e => setScaffoldValues(prev => ({ ...prev, [field.label]: e.target.value }))}
                placeholder={field.placeholder}
                disabled={disabled || sending}
                rows={2}
                className="w-full bg-transparent text-sm text-white/90 placeholder-white/20 resize-none outline-none leading-relaxed"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSend}
              disabled={!canSendStructured() || sending || disabled}
              className="text-xs px-4 py-1.5 rounded-lg bg-amber-500/80 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors font-medium"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        /* Freeform mode: original textarea */
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
          {/* Kind selector — secondary, minimal */}
          <select
            value={selectedKind}
            onChange={e => setSelectedKind(e.target.value as MessageKind)}
            disabled={disabled || sending}
            className="flex-shrink-0 text-xs bg-transparent text-white/35 hover:text-white/60 border-none outline-none cursor-pointer mb-0.5 pr-1"
            title="Message kind"
            aria-label="Message kind"
          >
            {KIND_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-zinc-800 text-white/80">
                {opt.label}
              </option>
            ))}
          </select>
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
      )}

      {!structured && (
        <p className="text-xs text-white/20 mt-1.5 pl-1">
          Enter to send · Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
