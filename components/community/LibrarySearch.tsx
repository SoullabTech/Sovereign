'use client';

/**
 * LibrarySearch — Organized category-based library
 *
 * Collapsible accordion design for clear organization.
 * Categories are collapsed by default - users expand what they need.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, ChevronRight, ChevronDown, FolderOpen, FileText } from 'lucide-react';
import type { ArticleIndex, LibraryIndex } from '@/lib/library/types';

interface LibrarySearchProps {
  onSelectArticle: (article: ArticleIndex) => void;
}

// Strip emojis from text for cleaner presentation
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F000}-\u{1F02F}]/gu, '')
    .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '')
    .trim();
}

// Category display configuration
const CATEGORY_CONFIG: Record<string, { name: string; order: number; description: string }> = {
  '00-START-HERE': { name: 'Getting Started', order: 1, description: 'Begin your journey here' },
  '01-Core-Concepts': { name: 'Core Concepts', order: 2, description: 'Foundational ideas and frameworks' },
  '01-Member-Guides': { name: 'Member Guides', order: 3, description: 'Practical guides for members' },
  '02-Thematic-Essays': { name: 'Thematic Essays', order: 4, description: 'Deep explorations of key themes' },
  '03-Member-Guides': { name: 'Advanced Guides', order: 5, description: 'In-depth member resources' },
  '04-Practices': { name: 'Practices', order: 6, description: 'Exercises and rituals' },
  '06-Resources': { name: 'Resources', order: 7, description: 'Tools and references' },
  '07-Community-Contributions': { name: 'Community', order: 8, description: 'Contributions from our community' },
  '09-Technical': { name: 'Technical Documentation', order: 9, description: 'System architecture and specs' },
  'outreach': { name: 'Outreach', order: 10, description: 'External communications' },
  'spiritual-guidance': { name: 'Spiritual Guidance', order: 11, description: 'Contemplative wisdom' },
  '__uncategorized__': { name: 'Other Files', order: 99, description: 'Additional documents and resources' },
};

export function LibrarySearch({ onSelectArticle }: LibrarySearchProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/library-index.json')
      .then(res => res.json())
      .then((data: LibraryIndex) => {
        setIndex(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load library index:', err);
        setLoading(false);
      });
  }, []);

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!index) return [];

    let articles = index.articles;

    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      articles = articles.filter(article => {
        const searchText = `${article.title} ${article.description} ${article.tags.join(' ')} ${article.content}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }

    return articles;
  }, [index, query]);

  // Group articles by category, consolidating uncategorized into "Other"
  const groupedArticles = useMemo(() => {
    const groups: Record<string, ArticleIndex[]> = {};
    const uncategorized: ArticleIndex[] = [];

    for (const article of filteredArticles) {
      const cat = article.category;
      // Check if this is a known category or has multiple articles
      const isKnownCategory = CATEGORY_CONFIG[cat];

      if (isKnownCategory) {
        if (!groups[cat]) {
          groups[cat] = [];
        }
        groups[cat].push(article);
      } else {
        // Collect uncategorized articles (file names as categories, single-item cats, etc.)
        uncategorized.push(article);
      }
    }

    // Sort groups by configured order
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      const orderA = CATEGORY_CONFIG[a]?.order ?? 100;
      const orderB = CATEGORY_CONFIG[b]?.order ?? 100;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });

    // Add uncategorized at the end if any exist
    if (uncategorized.length > 0) {
      sortedGroups.push(['__uncategorized__', uncategorized]);
    }

    return sortedGroups;
  }, [filteredArticles]);

  // Count only the main categories for display
  const mainCategoryCount = groupedArticles.filter(([cat]) => cat !== '__uncategorized__').length;

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Expand all when searching
  useEffect(() => {
    if (query.trim()) {
      // When searching, expand all categories that have results
      setExpandedCategories(new Set(groupedArticles.map(([cat]) => cat)));
    } else {
      // When not searching, collapse all
      setExpandedCategories(new Set());
    }
  }, [query, groupedArticles.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading archive...</p>
        </div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="text-center py-20 text-white/50">
        Failed to load files. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all files..."
          className="w-full px-4 py-3 pl-11 rounded-lg
                   bg-[#2a2a2a] border border-white/10
                   hover:border-white/20 focus:border-orange-500/50
                   focus:ring-1 focus:ring-orange-500/20
                   text-white placeholder-white/30
                   transition-all"
        />
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded
                     text-white/30 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-white/40">
          {query ? (
            <span>Found <span className="text-white/70">{filteredArticles.length}</span> files in <span className="text-white/70">{mainCategoryCount}</span> categories</span>
          ) : (
            <span><span className="text-white/70">{index.totalArticles}</span> files in <span className="text-white/70">{mainCategoryCount}</span> categories</span>
          )}
        </p>
        {!query && (
          <button
            onClick={() => {
              if (expandedCategories.size === groupedArticles.length) {
                setExpandedCategories(new Set());
              } else {
                setExpandedCategories(new Set(groupedArticles.map(([cat]) => cat)));
              }
            }}
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            {expandedCategories.size === groupedArticles.length ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>

      {/* Category Accordions */}
      <div className="space-y-2">
        {groupedArticles.map(([category, articles]) => {
          const config = CATEGORY_CONFIG[category] || {
            name: category.replace(/^\d+-/, '').replace(/-/g, ' '),
            description: ''
          };
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="rounded-lg border border-white/10 overflow-hidden">
              {/* Category Header - Always visible */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#2a2a2a] hover:bg-[#333] transition-colors"
              >
                <div className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  <ChevronRight size={16} className="text-orange-500" />
                </div>
                <FolderOpen size={18} className="text-orange-500/70" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{config.name}</span>
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">
                      {articles.length}
                    </span>
                  </div>
                  {config.description && !isExpanded && (
                    <p className="text-xs text-white/40 mt-0.5">{config.description}</p>
                  )}
                </div>
              </button>

              {/* Articles List - Collapsible */}
              {isExpanded && (
                <div className="border-t border-white/5 bg-[#1a1a1a]">
                  <div className="divide-y divide-white/5">
                    {articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onSelectArticle(article)}
                        className="w-full flex items-center gap-3 px-4 py-3 pl-12
                                 hover:bg-white/5 transition-colors group text-left"
                      >
                        <FileText size={14} className="text-white/30 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                        <span className="flex-1 text-sm text-white/70 group-hover:text-white transition-colors line-clamp-1">
                          {stripEmojis(article.title)}
                        </span>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-orange-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && query && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl
                        bg-[#2a2a2a] border border-white/10 mb-4">
            <BookOpen size={28} className="text-white/30" />
          </div>
          <p className="text-white/60">No files found matching "{query}"</p>
          <p className="text-white/40 text-sm mt-1">
            Try different search terms
          </p>
        </div>
      )}
    </div>
  );
}
