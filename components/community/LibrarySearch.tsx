'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { ArticleIndex, LibraryIndex } from '@/lib/library/types';

interface LibrarySearchProps {
  onSelectArticle: (article: ArticleIndex) => void;
}

// Strip emojis from text
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Most emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
    .replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Mahjong
    .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '') // Playing cards
    .trim();
}

export function LibrarySearch({ onSelectArticle }: LibrarySearchProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Group definitions with display order and names
  const categoryGroups: Record<string, { name: string; order: number }> = {
    '09-Technical': { name: 'Technical', order: 1 },
    '01-Core-Concepts': { name: 'Core Concepts', order: 2 },
    '02-Thematic-Essays': { name: 'Essays', order: 3 },
    '04-Practices': { name: 'Practices', order: 4 },
    '07-Community-Contributions': { name: 'Community', order: 5 },
    '00-START-HERE': { name: 'Getting Started', order: 6 },
    '06-Resources': { name: 'Resources', order: 7 },
    'outreach': { name: 'Outreach', order: 8 },
    'spiritual-guidance': { name: 'Spiritual Guidance', order: 9 },
  };

  const filteredArticles = useMemo(() => {
    if (!index) return [];

    let articles = index.articles;

    // Filter by category if selected
    if (selectedCategory) {
      articles = articles.filter(a => a.category === selectedCategory);
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      articles = articles.filter(article => {
        const searchText = `${article.title} ${article.description} ${article.tags.join(' ')} ${article.content}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }

    return articles;
  }, [index, query, selectedCategory]);

  // Group articles by category
  const groupedArticles = useMemo(() => {
    const groups: Record<string, ArticleIndex[]> = {};

    for (const article of filteredArticles) {
      const cat = article.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(article);
    }

    // Sort groups by defined order, then alphabetically for undefined ones
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      const orderA = categoryGroups[a]?.order ?? 100;
      const orderB = categoryGroups[b]?.order ?? 100;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });

    return sortedGroups;
  }, [filteredArticles]);

  const categories = useMemo(() => {
    if (!index) return [];
    return Object.entries(index.categories)
      .filter(([_, cat]) => cat.count > 0)
      .sort((a, b) => b[1].count - a[1].count);
  }, [index]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Loading wisdom files...</p>
        </div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="text-center py-20 text-white/70">
        Failed to load wisdom files. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, subjects, concepts..."
            className="w-full px-5 py-4 pl-14 rounded-xl border-0 bg-white/95 dark:bg-[#1A2F2E]/95 backdrop-blur-sm text-[#1a1a1a] dark:text-white placeholder-[#999] dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg shadow-xl"
          />
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#26A69A]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#999] hover:text-[#1a1a1a] hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            !selectedCategory
              ? 'bg-white text-[#26A69A] shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
          }`}
        >
          All ({index.totalArticles})
        </button>
        {categories.slice(0, 8).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key === selectedCategory ? null : key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === key
                ? 'bg-white text-[#26A69A] shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-white/70">
        {query || selectedCategory ? (
          <span>Found <span className="text-white font-medium">{filteredArticles.length}</span> file{filteredArticles.length !== 1 ? 's' : ''}</span>
        ) : (
          <span>Browse <span className="text-white font-medium">{index.totalArticles}</span> wisdom files</span>
        )}
      </div>

      {/* Grouped Results */}
      <div className="space-y-10">
        {groupedArticles.map(([category, articles], groupIdx) => {
          const groupName = categoryGroups[category]?.name || index.categories[category]?.name || category;
          const groupColors = ['#009688', '#00897B', '#00796B', '#00695C', '#004D40'];
          const groupColor = groupColors[groupIdx % groupColors.length];

          return (
            <section key={category}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: groupColor }} />
                <h2 className="text-lg font-semibold text-white tracking-wide">
                  {groupName}
                </h2>
                <span className="text-sm text-white/50">({articles.length})</span>
              </div>

              {/* Group Cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 12).map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="group relative text-left overflow-hidden rounded-lg bg-white/95 dark:bg-[#1A2625]/95 backdrop-blur-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* File Tab Accent */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: groupColor }}
                    />

                    <div className="pl-4 pr-3 py-3">
                      {/* Title */}
                      <h3 className="text-sm font-medium text-[#1a1a1a] dark:text-white leading-snug line-clamp-2 group-hover:text-[#009688] transition-colors">
                        {stripEmojis(article.title)}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>

              {/* Show more link if there are more than 12 */}
              {articles.length > 12 && (
                <button
                  onClick={() => setSelectedCategory(category)}
                  className="mt-3 text-sm text-white/70 hover:text-white transition-colors"
                >
                  + {articles.length - 12} more files
                </button>
              )}
            </section>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (query || selectedCategory) && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-white/70">No files found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
