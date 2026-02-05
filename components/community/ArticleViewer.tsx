'use client';

/**
 * ArticleViewer — Clean article display
 *
 * Matte dark + orange accent styling.
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
      >
        <ChevronLeft size={16} className="text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
        Back to Archive
      </button>

      {/* Main Container */}
      <div className="bg-[#2a2a2a] border border-white/10 rounded-xl overflow-hidden">
        {/* Article Header */}
        <header className="px-6 md:px-8 pt-8 pb-6 border-b border-white/10">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-medium rounded uppercase tracking-wider
                         bg-orange-500/10 text-orange-500 border border-orange-500/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight leading-tight mb-4">
            {article.title}
          </h1>

          {/* Description */}
          {article.description && (
            <p className="text-white/60 leading-relaxed">
              {article.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
            <BookOpen size={14} />
            <span>Wisdom Files · The Archive</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="px-6 md:px-8 py-8">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-white/40 text-sm">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {content && (
            <article className="prose-article">
              <MarkdownRenderer content={content} />
            </article>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 md:px-8 py-4 bg-[#1a1a1a] border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>Soullab Archive</span>
            <button
              onClick={onBack}
              className="text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={14} />
              Return to collection
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * Markdown Renderer
 * Clean markdown rendering with matte dark styling
 */
function MarkdownRenderer({ content }: { content: string }) {
  // Remove frontmatter
  let md = content.replace(/^---[\s\S]*?---\n/, '');

  // Split into lines and render
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl md:text-3xl font-medium text-white
                             tracking-tight mt-0 mb-8 leading-tight pb-4 border-b border-white/10">
          {line.slice(2)}
        </h1>
      );
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl md:text-2xl font-medium text-white
                             mt-10 mb-4 flex items-center gap-3">
          <span className="w-8 h-0.5 bg-orange-500 rounded-full" />
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-orange-500 mt-8 mb-3
                             uppercase tracking-wider">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-base font-medium text-white mt-6 mb-2">
          {line.slice(5)}
        </h4>
      );
      continue;
    }

    // Blockquotes
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
        <blockquote key={i} className="relative my-6 py-4 px-6
                                     bg-[#1a1a1a] border-l-2 border-orange-500 rounded-r-lg">
          <p className="text-white/80 leading-relaxed italic">
            {mainQuote}
          </p>
          {attribution && (
            <cite className="block mt-3 text-sm text-orange-500 not-italic font-medium">
              — {attribution}
            </cite>
          )}
        </blockquote>
      );
      continue;
    }

    // Bullet lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const textContent = line.slice(2);
      elements.push(
        <div key={i} className="flex gap-3 mb-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          <span className="text-white/70 leading-relaxed">
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
        <div key={i} className="flex gap-3 mb-3">
          <span className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20
                         flex items-center justify-center text-xs font-medium text-orange-500 flex-shrink-0">
            {num}
          </span>
          <span className="text-white/70 leading-relaxed pt-0.5">
            {renderInlineFormatting(textContent)}
          </span>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(
        <div key={i} className="my-10 flex items-center justify-center gap-2">
          <div className="w-16 h-px bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
          <div className="w-16 h-px bg-white/10" />
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
        <pre key={i} className="my-6 p-4 bg-[#1a1a1a] rounded-lg overflow-x-auto
                              border border-white/10">
          <code className="text-sm text-white/80 font-mono">{codeContent.trim()}</code>
        </pre>
      );
      i = j;
      continue;
    }

    // Italic footer text
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(
        <p key={i} className="text-white/40 text-sm italic mt-10 pt-4
                            border-t border-white/10 text-center">
          {line.slice(1, -1)}
        </p>
      );
      continue;
    }

    // Regular paragraphs
    if (line.trim()) {
      elements.push(
        <p key={i} className="text-white/70 leading-relaxed mb-4">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  }

  return <>{elements}</>;
}

/**
 * Render inline formatting (bold, italic, code)
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
      <strong key={key++} className="text-white font-medium">
        {remaining.slice(start + 2, end)}
      </strong>
    );

    remaining = remaining.slice(end + 2);
  }

  // Add remaining text
  if (remaining) {
    // Process inline code
    if (remaining.includes('`')) {
      const codeParts = remaining.split(/`([^`]+)`/);
      codeParts.forEach((part, idx) => {
        if (idx % 2 === 1) {
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 bg-orange-500/10
                                       text-orange-500 rounded text-sm font-medium">
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
