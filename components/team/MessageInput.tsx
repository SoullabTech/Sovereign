'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { PromptScaffoldField, MessageKind } from '@/lib/team/types';

// Client-side UX hints only. The server (lib/team/attachments) is the authoritative
// gate on type / size / count — never import that server module here (it pulls in fs).
const ACCEPT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const ACCEPT_IMAGE_ATTR = ACCEPT_IMAGE_TYPES.join(',');
const MAX_IMAGES = 5;

const KIND_OPTIONS: { value: MessageKind; label: string }[] = [
  { value: 'build',    label: 'Build' },
  { value: 'question', label: 'Question' },
  { value: 'request',  label: 'Request' },
  { value: 'decision', label: 'Decision' },
  { value: 'insight',  label: 'Insight' },
];

interface MessageInputProps {
  channelName: string;
  onSend: (body: string, kind: MessageKind, images: File[]) => Promise<void>;
  disabled?: boolean;
  promptScaffold?: PromptScaffoldField[];
}

export function MessageInput({ channelName, onSend, disabled, promptScaffold }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [structured, setStructured] = useState(false);
  const [scaffoldValues, setScaffoldValues] = useState<Record<string, string>>({});
  const [selectedKind, setSelectedKind] = useState<MessageKind>('build');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const hasScaffold = promptScaffold && promptScaffold.length > 0;

  // Local preview URLs for pending images. Revoked when images change or on unmount.
  const previewUrls = useMemo(() => images.map(f => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => { previewUrls.forEach(url => URL.revokeObjectURL(url)); };
  }, [previewUrls]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter(f => ACCEPT_IMAGE_TYPES.includes(f.type));
    if (picked.length) setImages(prev => [...prev, ...picked].slice(0, MAX_IMAGES));
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  // Open the "insert link" popover, remembering the caret/selection so we can
  // splice the link back in at the right spot. Any selected text pre-fills the label.
  const openLinkForm = useCallback(() => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    selectionRef.current = { start, end };
    setLinkText(value.slice(start, end));
    setLinkUrl('');
    setShowLinkForm(true);
  }, [value]);

  const insertLink = useCallback(() => {
    let url = linkUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const label = linkText.trim();
    const snippet = label ? `[${label}](${url})` : url;
    const { start, end } = selectionRef.current;
    setValue(value.slice(0, start) + snippet + value.slice(end));
    setShowLinkForm(false);
    setLinkText('');
    setLinkUrl('');
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      const pos = start + snippet.length;
      el.focus();
      el.setSelectionRange(pos, pos);
      autoResize();
    });
  }, [linkUrl, linkText, value, autoResize]);

  // Paste handling: a screenshot → attach as a pending image; a URL over a selection → named link.
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (!el) return;

    // 1) Pasted screenshot(s): pull image files off the clipboard and queue them for upload.
    const pastedImages: File[] = [];
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.kind === 'file' && ACCEPT_IMAGE_TYPES.includes(item.type)) {
        const f = item.getAsFile();
        if (f) pastedImages.push(f);
      }
    }
    if (pastedImages.length) {
      e.preventDefault();
      setImages(prev => [...prev, ...pastedImages].slice(0, MAX_IMAGES));
      return;
    }

    // 2) Select text, then paste a URL → wrap it as a named link (Slack/iMessage behavior).
    const pasted = e.clipboardData.getData('text').trim();
    const { selectionStart: start, selectionEnd: end } = el;
    if (start !== end && /^https?:\/\/\S+$/i.test(pasted)) {
      e.preventDefault();
      const snippet = `[${value.slice(start, end)}](${pasted})`;
      setValue(value.slice(0, start) + snippet + value.slice(end));
      requestAnimationFrame(() => {
        const pos = start + snippet.length;
        el.focus();
        el.setSelectionRange(pos, pos);
        autoResize();
      });
    }
  }, [value, autoResize]);

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
    // Freeform allows an image-only message; structured always needs its body.
    const hasImages = images.length > 0;
    if ((!body && !hasImages) || sending) return;
    setSending(true);
    try {
      await onSend(body, selectedKind, images);
      setValue('');
      setImages([]);
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
        <>
          {/* Pending image previews (local objectURLs, not yet uploaded) */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-1">
              {images.map((file, i) => (
                <div key={`${file.name}-${i}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrls[i]}
                    alt={file.name}
                    className="h-16 w-16 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-900 border border-white/20 text-white/70 hover:text-white hover:bg-red-500/80 transition-colors text-xs leading-none"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-amber-500/40 transition-colors">
          {/* Insert-link popover */}
          {showLinkForm && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-zinc-800 border border-white/12 rounded-xl p-3 shadow-xl z-30">
              <p className="text-xs font-medium text-white/50 mb-2">Insert link</p>
              <input
                autoFocus
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); insertLink(); }
                  if (e.key === 'Escape') setShowLinkForm(false);
                }}
                placeholder="Text to show (optional)"
                className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white/90 placeholder-white/25 outline-none focus:border-amber-500/40 transition-colors"
              />
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); insertLink(); }
                  if (e.key === 'Escape') setShowLinkForm(false);
                }}
                placeholder="Paste URL — e.g. https://…"
                className="w-full mb-3 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white/90 placeholder-white/25 outline-none focus:border-amber-500/40 transition-colors"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkForm(false)}
                  className="text-xs px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  disabled={!linkUrl.trim()}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/80 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors font-medium"
                >
                  Insert
                </button>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => { setValue(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={`Message #${channelName}`}
            disabled={disabled || sending}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/25 resize-none outline-none leading-relaxed py-1"
            style={{ minHeight: '24px', maxHeight: '160px' }}
          />
          {/* Attach image */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_IMAGE_ATTR}
            multiple
            hidden
            onChange={handleFilePick}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending || images.length >= MAX_IMAGES}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/35 hover:text-amber-300 hover:bg-white/10 transition-colors mb-0.5 disabled:opacity-30"
            title={images.length >= MAX_IMAGES ? `Max ${MAX_IMAGES} images` : 'Attach image'}
            aria-label="Attach image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          {/* Insert link */}
          <button
            type="button"
            onClick={() => (showLinkForm ? setShowLinkForm(false) : openLinkForm())}
            disabled={disabled || sending}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/35 hover:text-amber-300 hover:bg-white/10 transition-colors mb-0.5 disabled:opacity-30"
            title="Insert link"
            aria-label="Insert link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
            </svg>
          </button>
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
            disabled={(!value.trim() && images.length === 0) || sending || disabled}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500/80 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors mb-0.5"
            title="Send (Enter)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m-7 7 7-7 7 7" />
            </svg>
          </button>
          </div>
        </>
      )}

      {!structured && (
        <p className="text-xs text-white/20 mt-1.5 pl-1">
          Enter to send · Shift+Enter for new line · paste a screenshot to attach · select text then paste a URL to name a link
        </p>
      )}
    </div>
  );
}
