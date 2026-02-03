'use client';

/**
 * ArticleViewer — The Reading Chamber
 *
 * A refined article viewer styled after ancient manuscripts,
 * with warm parchment tones and scholarly typography.
 */

import React, { useState, useEffect } from 'react';
import type { ArticleIndex } from '@/lib/library/types';

interface ArticleViewerProps {
  article: ArticleIndex;
  onBack: () => void;
}

export function ArticleViewer({ article, onBack }: ArticleViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/library/article?path=${encodeURIComponent(article.path)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load article');
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [article.path]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-[#D4B896]/80 hover:text-[#D4B896] transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to the Archive
      </button>

      {/* Ambient glow behind container - warm torchlight effect */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-[#B8860B]/8 via-transparent to-[#CD853F]/8 blur-3xl" />

        {/* Main Parchment Container */}
        <div className="relative bg-gradient-to-br from-[#F5E6D3]/98 to-[#E8D8C3]/95 dark:from-[#2C1810]/98 dark:to-[#3D2B1F]/95
                      backdrop-blur-xl border border-[#B8860B]/20 rounded-2xl
                      shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">

          {/* Decorative Top Gradient Bar - golden trim */}
          <div className="h-1.5 bg-gradient-to-r from-[#8B4513] via-[#B8860B] to-[#CD853F]" />

          {/* Subtle top border accent */}
          <div className="absolute top-1.5 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B8860B]/30 to-transparent" />

          {/* Article Header */}
          <header className="px-8 md:px-12 pt-10 pb-8 border-b border-[#B8860B]/20">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wider
                           bg-[#B8860B]/10 text-[#8B4513] dark:bg-[#B8860B]/20 dark:text-[#D4B896]
                           border border-[#B8860B]/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title - Elegant Serif */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-light
                         text-[#3D2B1F] dark:text-[#D4B896] tracking-tight leading-[1.15] mb-5"
                style={{ fontFamily: 'Georgia, serif' }}>
              {article.title}
            </h1>

            {/* Description */}
            {article.description && (
              <p className="text-lg text-[#5D4E37] dark:text-[#C4A77D]/70 leading-relaxed max-w-3xl">
                {article.description}
              </p>
            )}

            {/* Meta bar */}
            <div className="mt-6 flex items-center gap-4 text-sm text-[#8B4513]/60 dark:text-[#C4A77D]/40">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                The Archive · Wisdom Files
              </span>
            </div>
          </header>

          {/* Content Body */}
          <div className="px-8 md:px-12 lg:px-16 py-10 md:py-12">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
                  <span className="text-[#8B4513]/60 dark:text-[#C4A77D]/50 text-sm">Unrolling the scroll...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-[#8B4513]/30 bg-[#8B4513]/10 p-6 text-[#8B4513] dark:text-[#D4B896]">
                {error}
              </div>
            )}

            {content && (
              <article className="prose-article">
                <ElegantMarkdownRenderer content={content} />
              </article>
            )}
          </div>

          {/* Subtle bottom border accent */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B8860B]/20 to-transparent" />

          {/* Footer */}
          <footer className="px-8 md:px-12 py-6 bg-[#3D2B1F]/5 dark:bg-[#1A1008]/50 border-t border-[#B8860B]/10">
            <div className="flex items-center justify-between text-sm text-[#8B4513]/60 dark:text-[#C4A77D]/50">
              <span>Soullab Archive · Community Commons</span>
              <button
                onClick={onBack}
                className="text-[#B8860B] hover:text-[#D4B896] hover:underline flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Return to collection
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/**
 * Elegant Markdown Renderer
 * Renders markdown with manuscript-style typography in amber tones
 */
function ElegantMarkdownRenderer({ content }: { content: string }) {
  // Remove frontmatter
  let md = content.replace(/^---[\s\S]*?---\n/, '');

  // Split into lines and render
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Main title (H1) - elegant serif styling
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl md:text-4xl font-light text-[#3D2B1F] dark:text-[#D4B896]
                             tracking-tight mt-0 mb-10 leading-tight pb-4 border-b-2 border-[#B8860B]/20"
            style={{ fontFamily: 'Georgia, serif' }}>
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    // Section headers (H2) with decorative line
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl md:text-2xl font-semibold text-[#8B4513] dark:text-[#D4B896]
                             mt-14 mb-6 flex items-center gap-4"
            style={{ fontFamily: 'Georgia, serif' }}>
          <span className="w-10 h-0.5 bg-gradient-to-r from-[#B8860B] to-transparent rounded-full" />
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // Subsection headers (H3) - uppercase tracking
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-[#A0522D] dark:text-[#CD853F] mt-10 mb-4
                             uppercase tracking-widest">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-base font-medium text-[#3D2B1F] dark:text-[#D4B896] mt-8 mb-3"
            style={{ fontFamily: 'Georgia, serif' }}>
          {line.slice(5)}
        </h4>
      );
      continue;
    }

    // Blockquotes - elegant pull quote styling
    if (line.startsWith('> ')) {
      const quoteText = line.slice(2);
      const hasAttribution = quoteText.includes('—') || quoteText.includes('--');
      let mainQuote = quoteText;
      let attribution = '';

      if (hasAttribution) {
        const parts = quoteText.split(/—|--/);
        mainQuote = parts[0].trim();
        attribution = parts[1]?.trim() || '';
      }

      elements.push(
        <blockquote key={i} className="relative my-10 py-6 px-8
                                     bg-gradient-to-r from-[#B8860B]/10 to-transparent dark:from-[#B8860B]/10 dark:to-transparent
                                     border-l-4 border-[#B8860B] rounded-r-xl">
          <span className="absolute -top-3 left-4 text-6xl text-[#B8860B]/30 leading-none"
                style={{ fontFamily: 'Georgia, serif' }}>"</span>
          <p className="text-lg md:text-xl italic text-[#3D2B1F] dark:text-[#D4B896]/90 leading-relaxed font-light pl-4"
             style={{ fontFamily: 'Georgia, serif' }}>
            {mainQuote}
          </p>
          {attribution && (
            <cite className="block mt-4 pl-4 text-sm text-[#8B4513] dark:text-[#CD853F] not-italic font-medium">
              — {attribution}
            </cite>
          )}
        </blockquote>
      );
      continue;
    }

    // Bullet lists - refined bullet styling
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const textContent = line.slice(2);
      elements.push(
        <div key={i} className="flex gap-4 mb-3 group">
          <span className="mt-2.5 w-2 h-2 rounded-full bg-[#B8860B]/50 group-hover:bg-[#B8860B]
                         transition-colors flex-shrink-0" />
          <span className="text-[#3D2B1F] dark:text-[#D4B896]/80 leading-relaxed text-[1.05rem]">
            {renderInlineFormatting(textContent)}
          </span>
        </div>
      );
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\./)?.[1];
      const textContent = line.replace(/^\d+\. /, '');
      elements.push(
        <div key={i} className="flex gap-4 mb-4">
          <span className="w-8 h-8 rounded-full bg-[#B8860B]/15 border border-[#B8860B]/30
                         flex items-center justify-center text-sm font-medium text-[#8B4513] dark:text-[#D4B896] flex-shrink-0">
            {num}
          </span>
          <span className="text-[#3D2B1F] dark:text-[#D4B896]/80 leading-relaxed pt-1 text-[1.05rem]">
            {renderInlineFormatting(textContent)}
          </span>
        </div>
      );
      continue;
    }

    // Horizontal rule - elegant divider with diamond motif
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(
        <div key={i} className="my-14 flex items-center justify-center gap-3">
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#B8860B]/40" />
          <div className="w-2 h-2 rotate-45 bg-[#B8860B]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B]/50" />
          <div className="w-2 h-2 rotate-45 bg-[#B8860B]/40" />
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#B8860B]/40" />
        </div>
      );
      continue;
    }

    // Code blocks
    if (line.startsWith('```')) {
      let codeContent = '';
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('```')) {
        codeContent += lines[j] + '\n';
        j++;
      }
      elements.push(
        <pre key={i} className="my-8 p-6 bg-[#1A1008] rounded-xl overflow-x-auto
                              border border-[#B8860B]/20 shadow-lg">
          <code className="text-sm text-[#D4B896]/90 font-mono">{codeContent.trim()}</code>
        </pre>
      );
      i = j;
      continue;
    }

    // Italic footer text (for footnotes)
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(
        <p key={i} className="text-[#8B4513]/60 dark:text-[#C4A77D]/40 text-sm italic mt-14 pt-6
                            border-t border-[#B8860B]/10 text-center">
          {line.slice(1, -1)}
        </p>
      );
      continue;
    }

    // Regular paragraphs - refined typography
    if (line.trim()) {
      elements.push(
        <p key={i} className="text-[#3D2B1F] dark:text-[#D4B896]/80 leading-[1.85] mb-6 text-[1.05rem]">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  }

  return <>{elements}</>;
}

/**
 * Render inline formatting (bold, italic, links, code)
 */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Process bold first
  while (remaining.includes('**')) {
    const start = remaining.indexOf('**');
    const end = remaining.indexOf('**', start + 2);
    if (end === -1) break;

    if (start > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, start)}</span>);
    }

    parts.push(
      <strong key={key++} className="text-[#3D2B1F] dark:text-[#D4B896] font-semibold">
        {remaining.slice(start + 2, end)}
      </strong>
    );

    remaining = remaining.slice(end + 2);
  }

  // Add remaining text
  if (remaining) {
    // Process inline code in remaining text
    if (remaining.includes('`')) {
      const codeParts = remaining.split(/`([^`]+)`/);
      codeParts.forEach((part, idx) => {
        if (idx % 2 === 1) {
          parts.push(
            <code key={key++} className="px-2 py-0.5 bg-[#B8860B]/10 dark:bg-[#B8860B]/20
                                       text-[#8B4513] dark:text-[#D4B896] rounded text-sm font-medium">
              {part}
            </code>
          );
        } else if (part) {
          parts.push(<span key={key++}>{part}</span>);
        }
      });
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
    }
  }

  return parts.length > 0 ? parts : text;
}
