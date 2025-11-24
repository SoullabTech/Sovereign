'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VoiceJournalSession } from '@/lib/journaling/VoiceJournalingService';
import { obsidianExporter } from '@/lib/export/ObsidianExporter';
import { Download, Check, Copy } from 'lucide-react';

interface ExportButtonProps {
  session: VoiceJournalSession;
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export default function ExportButton({ session, variant = 'icon', className = '' }: ExportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'copied'>('idle');

  const handleExport = async () => {
    setStatus('exporting');

    try {
      const result = obsidianExporter.exportSession(session);

      if (result.success) {
        obsidianExporter.downloadMarkdown(result.filename, result.content);
        setStatus('success');

        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('idle');
    }
  };

  const handleCopy = async () => {
    try {
      const result = obsidianExporter.exportSession(session);

      if (result.success) {
        const copied = await obsidianExporter.copyToClipboard(result.content);
        if (copied) {
          setStatus('copied');
          setTimeout(() => setStatus('idle'), 2000);
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (variant === 'icon') {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleExport}
          disabled={status === 'exporting'}
          className={`p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 ${className}`}
          title="Export to Obsidian"
        >
          {status === 'success' ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : status === 'exporting' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Download className="w-4 h-4" />
            </motion.div>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          title="Copy to clipboard"
        >
          {status === 'copied' ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleExport}
        disabled={status === 'exporting'}
        className={`flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 ${className}`}
      >
        {status === 'success' ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            Exported
          </>
        ) : status === 'exporting' ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Download className="w-4 h-4" />
            </motion.div>
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export
          </>
        )}
      </button>
    );
  }

  // Full button
  return (
    <button
      onClick={handleExport}
      disabled={status === 'exporting'}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {status === 'success' ? (
        <>
          <Check className="w-5 h-5" />
          Exported!
        </>
      ) : status === 'exporting' ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Download className="w-5 h-5" />
          </motion.div>
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Export to Obsidian
        </>
      )}
    </button>
  );
}