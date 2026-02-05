'use client';

/**
 * LibrarySearch — Clean search interface
 *
 * Matte dark + orange accent styling.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
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

  // Group definitions
  const categoryGroups: Record<string, { name: string; order: number }> = {
    '09-Technical': { name: 'Technical Documentation', order: 1 },
    '01-Core-Concepts': { name: 'Core Concepts', order: 2 },
    '03-Member-Guides': { name: 'Member Guides', order: 3 },
    '02-Thematic-Essays': { name: 'Thematic Essays', order: 4 },
    '04-Practices': { name: 'Practices', order: 5 },
    '01-Member-Guides': { name: 'Foundational Guides', order: 6 },
    '07-Community-Contributions': { name: 'Community', order: 7 },
    '00-START-HERE': { name: 'Getting Started', order: 8 },
    'outreach': { name: 'Outreach', order: 9 },
    '06-Resources': { name: 'Resources', order: 10 },
    'spiritual-guidance': { name: 'Spiritual Guidance', order: 11 },
  };

  const filteredArticles = useMemo(() => {
    if (!index) return [];

    let articles = index.articles;

    if (selectedCategory) {
      articles = articles.filter(a => a.category === selectedCategory);
    }

    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      articles = articles.filter(article => {
        const searchText = `${article.title} ${article.description} ${article.tags.join(' ')} ${article.content}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
    }

    return articles;
  }, [index, query, selectedCategory]);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, ArticleIndex[]> = {};

    for (const article of filteredArticles) {
      const cat = article.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(article);
    }

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
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">
            Loading archive...
          </p>
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
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, concepts..."
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

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            !selectedCategory
              ? 'bg-orange-500 text-white'
              : 'bg-[#2a2a2a] text-white/60 hover:text-white border border-white/10'
          }`}
        >
          All ({index.totalArticles})
        </button>
        {categories.slice(0, 6).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key === selectedCategory ? null : key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === key
                ? 'bg-orange-500 text-white'
                : 'bg-[#2a2a2a] text-white/60 hover:text-white border border-white/10'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div>
        <p className="text-sm text-white/40">
          {query || selectedCategory ? (
            <span>Found <span className="text-white/70">{filteredArticles.length}</span> file{filteredArticles.length !== 1 ? 's' : ''}</span>
          ) : (
            <span>Browse <span className="text-white/70">{index.totalArticles}</span> files</span>
          )}
        </p>
      </div>

      {/* Grouped Results */}
      <div className="space-y-10">
        {groupedArticles.map(([category, articles]) => {
          const groupName = categoryGroups[category]?.name || index.categories[category]?.name || category;

          return (
            <section key={category}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 rounded-full bg-orange-500" />
                <div>
                  <h2 className="text-lg font-medium text-white">
                    {groupName}
                  </h2>
                  <p className="text-sm text-white/40">
                    {articles.length} {articles.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {articles.slice(0, 12).map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="group text-left p-4 rounded-lg
                             bg-[#2a2a2a] border border-white/10
                             hover:border-orange-500/50
                             transition-all"
                  >
                    <h3 className="text-sm font-medium text-white/90 leading-relaxed line-clamp-2
                                 group-hover:text-white transition-colors">
                      {stripEmojis(article.title)}
                    </h3>
                    <div className="mt-2 flex items-center gap-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs">Read</span>
                      <ChevronRight size={12} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Show more link */}
              {articles.length > 12 && (
                <button
                  onClick={() => setSelectedCategory(category)}
                  className="mt-3 text-sm text-orange-500 hover:text-orange-400 transition-colors
                           flex items-center gap-1"
                >
                  <span>+ {articles.length - 12} more</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </section>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (query || selectedCategory) && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl
                        bg-[#2a2a2a] border border-white/10 mb-4">
            <BookOpen size={28} className="text-white/30" />
          </div>
          <p className="text-white/60">
            No files found matching your search.
          </p>
          <p className="text-white/40 text-sm mt-1">
            Try different terms or browse the categories above.
          </p>
        </div>
      )}
    </div>
  );
}
