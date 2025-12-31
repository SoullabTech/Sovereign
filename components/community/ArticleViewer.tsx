'use client';

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

    // Fetch the markdown file
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
        className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Wisdom Files
      </button>

      {/* Ambient glow behind container */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-[#26A69A]/10 via-transparent to-[#4DB6AC]/10 blur-3xl" />

        {/* Main Frosted Glass Container */}
        <div className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-[#1A2625]/95 dark:to-[#1A2F2E]/90
                      backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl
                      shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">

          {/* Decorative Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#26A69A] via-[#4DB6AC] to-[#80CBC4]" />

          {/* Subtle top border accent */}
          <div className="absolute top-1.5 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {/* Article Header */}
          <header className="px-8 md:px-12 pt-10 pb-8 border-b border-gray-200/50 dark:border-white/10">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wider
                           bg-[#26A69A]/10 text-[#00695C] dark:bg-[#26A69A]/20 dark:text-[#80CBC4]
                           border border-[#26A69A]/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title - Elegant Serif */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-light
                         text-[#004D40] dark:text-[#B2DFDB] tracking-tight leading-[1.15] mb-5">
              {article.title}
            </h1>

            {/* Description */}
            {article.description && (
              <p className="text-lg text-gray-600 dark:text-white/60 leading-relaxed max-w-3xl">
                {article.description}
              </p>
            )}

            {/* Meta bar */}
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-white/40">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Soullab Wisdom Files
              </span>
            </div>
          </header>

          {/* Content Body */}
          <div className="px-8 md:px-12 lg:px-16 py-10 md:py-12">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-[#26A69A]/30 border-t-[#26A69A] rounded-full animate-spin" />
                  <span className="text-gray-500 dark:text-white/50 text-sm">Loading wisdom...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-6 text-red-700 dark:text-red-300">
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
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300/30 dark:via-white/10 to-transparent" />

          {/* Footer */}
          <footer className="px-8 md:px-12 py-6 bg-gray-50/80 dark:bg-white/5 border-t border-gray-200/50 dark:border-white/10">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-white/50">
              <span>Soullab Community Commons</span>
              <button
                onClick={onBack}
                className="text-[#00796B] dark:text-[#80CBC4] hover:underline flex items-center gap-1"
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
 * Renders markdown with magazine-style typography
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
        <h1 key={i} className="text-3xl md:text-4xl font-serif font-light text-[#004D40] dark:text-[#B2DFDB]
                             tracking-tight mt-0 mb-10 leading-tight pb-4 border-b-2 border-[#26A69A]/20">
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    // Section headers (H2) with decorative line
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl md:text-2xl font-semibold text-[#00695C] dark:text-[#80CBC4]
                             mt-14 mb-6 flex items-center gap-4">
          <span className="w-10 h-0.5 bg-gradient-to-r from-[#26A69A] to-transparent rounded-full" />
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // Subsection headers (H3) - uppercase tracking
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-[#00796B] dark:text-[#4DB6AC] mt-10 mb-4
                             uppercase tracking-widest">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-base font-medium text-[#004D40] dark:text-[#B2DFDB] mt-8 mb-3">
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
                                     bg-gradient-to-r from-[#E0F2F1] to-transparent dark:from-[#26A69A]/10 dark:to-transparent
                                     border-l-4 border-[#26A69A] rounded-r-xl">
          <span className="absolute -top-3 left-4 text-6xl text-[#26A69A]/30 font-serif leading-none">"</span>
          <p className="text-lg md:text-xl italic text-[#004D40] dark:text-white/85 leading-relaxed font-light pl-4">
            {mainQuote}
          </p>
          {attribution && (
            <cite className="block mt-4 pl-4 text-sm text-[#00796B] dark:text-[#80CBC4] not-italic font-medium">
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
          <span className="mt-2.5 w-2 h-2 rounded-full bg-[#26A69A]/50 group-hover:bg-[#26A69A]
                         transition-colors flex-shrink-0" />
          <span className="text-[#1a1a1a] dark:text-white/80 leading-relaxed text-[1.05rem]">
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
          <span className="w-8 h-8 rounded-full bg-[#26A69A]/15 border border-[#26A69A]/30
                         flex items-center justify-center text-sm font-medium text-[#00695C] dark:text-[#80CBC4] flex-shrink-0">
            {num}
          </span>
          <span className="text-[#1a1a1a] dark:text-white/80 leading-relaxed pt-1 text-[1.05rem]">
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
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#26A69A]/40" />
          <div className="w-2 h-2 rotate-45 bg-[#26A69A]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#26A69A]/50" />
          <div className="w-2 h-2 rotate-45 bg-[#26A69A]/40" />
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#26A69A]/40" />
        </div>
      );
      continue;
    }

    // Code blocks (simple detection)
    if (line.startsWith('```')) {
      // Find end of code block
      let codeContent = '';
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('```')) {
        codeContent += lines[j] + '\n';
        j++;
      }
      elements.push(
        <pre key={i} className="my-8 p-6 bg-[#1A2F2E] rounded-xl overflow-x-auto
                              border border-[#26A69A]/20 shadow-lg">
          <code className="text-sm text-white/90 font-mono">{codeContent.trim()}</code>
        </pre>
      );
      i = j; // Skip to end of code block
      continue;
    }

    // Inline code
    if (line.includes('`') && !line.startsWith('```')) {
      // Handle inline code within paragraphs
    }

    // Italic footer text (for footnotes)
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(
        <p key={i} className="text-gray-500 dark:text-white/40 text-sm italic mt-14 pt-6
                            border-t border-gray-200 dark:border-white/10 text-center">
          {line.slice(1, -1)}
        </p>
      );
      continue;
    }

    // Regular paragraphs - refined typography
    if (line.trim()) {
      elements.push(
        <p key={i} className="text-[#1a1a1a] dark:text-white/80 leading-[1.85] mb-6 text-[1.05rem]">
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
  // Split on formatting patterns and render
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Process bold first
  while (remaining.includes('**')) {
    const start = remaining.indexOf('**');
    const end = remaining.indexOf('**', start + 2);
    if (end === -1) break;

    // Text before bold
    if (start > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, start)}</span>);
    }

    // Bold text
    parts.push(
      <strong key={key++} className="text-[#004D40] dark:text-[#B2DFDB] font-semibold">
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
          // This is code
          parts.push(
            <code key={key++} className="px-2 py-0.5 bg-[#E0F2F1] dark:bg-[#004D40]/40
                                       text-[#00695C] dark:text-[#80CBC4] rounded text-sm font-medium">
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
