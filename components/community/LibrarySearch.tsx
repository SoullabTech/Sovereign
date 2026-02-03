'use client';

/**
 * LibrarySearch — The Card Catalog
 *
 * A sophisticated search interface styled after ancient library catalogs,
 * with aged parchment cards and brass accents befitting Jung's study.
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { ArticleIndex, LibraryIndex } from '@/lib/library/types';

interface LibrarySearchProps {
  onSelectArticle: (article: ArticleIndex) => void;
}

// Strip emojis from text for cleaner scholarly presentation
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

  // Group definitions with display order and names
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
          <div className="w-8 h-8 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
          <p className="text-[#C4A77D]/70 text-sm font-light tracking-wide">
            Opening the archive...
          </p>
        </div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="text-center py-20 text-[#C4A77D]/70">
        Failed to load wisdom files. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search Input — styled as a brass-trimmed card catalog search */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, subjects, concepts..."
            className="w-full px-6 py-4 pl-14 rounded-xl
                     bg-[#F5E6D3]/95 dark:bg-[#2C1810]/95
                     border border-[#B8860B]/30 hover:border-[#B8860B]/50
                     focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20
                     text-[#3D2B1F] dark:text-[#D4B896]
                     placeholder-[#8B4513]/50 dark:placeholder-[#C4A77D]/40
                     backdrop-blur-sm text-lg shadow-xl
                     transition-all duration-200"
            style={{ fontFamily: 'Georgia, serif' }}
          />
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8860B]"
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
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full
                       text-[#8B4513]/50 hover:text-[#8B4513] dark:text-[#C4A77D]/50 dark:hover:text-[#C4A77D]
                       hover:bg-[#B8860B]/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filters — brass-accented tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            !selectedCategory
              ? 'bg-[#B8860B] text-[#1A1008] shadow-lg shadow-[#B8860B]/30'
              : 'bg-[#D4B896]/15 text-[#D4B896] hover:bg-[#D4B896]/25 border border-[#D4B896]/20'
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
                ? 'bg-[#B8860B] text-[#1A1008] shadow-lg shadow-[#B8860B]/30'
                : 'bg-[#D4B896]/15 text-[#D4B896] hover:bg-[#D4B896]/25 border border-[#D4B896]/20'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count — scholarly presentation */}
      <div className="text-center">
        <p className="text-sm text-[#C4A77D]/70 tracking-wide">
          {query || selectedCategory ? (
            <span>Found <span className="text-[#D4B896] font-medium">{filteredArticles.length}</span> file{filteredArticles.length !== 1 ? 's' : ''}</span>
          ) : (
            <span>Browse <span className="text-[#D4B896] font-medium">{index.totalArticles}</span> wisdom files</span>
          )}
        </p>
      </div>

      {/* Grouped Results — aged parchment cards */}
      <div className="space-y-12">
        {groupedArticles.map(([category, articles], groupIdx) => {
          const groupName = categoryGroups[category]?.name || index.categories[category]?.name || category;

          // Warm amber accent colors that complement the theme
          const accentColors = [
            '#B8860B', // Dark goldenrod
            '#CD853F', // Peru
            '#A0522D', // Sienna
            '#8B4513', // Saddle brown
            '#D2691E', // Chocolate
          ];
          const accentColor = accentColors[groupIdx % accentColors.length];

          return (
            <section key={category}>
              {/* Group Header — scholarly section divider */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <div>
                  <h2
                    className="text-xl font-light text-[#D4B896] tracking-wide"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {groupName}
                  </h2>
                  <p className="text-sm text-[#C4A77D]/50 mt-0.5">
                    {articles.length} {articles.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>

              {/* Group Cards — aged parchment index cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {articles.slice(0, 12).map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="group relative text-left overflow-hidden rounded-lg
                             bg-gradient-to-br from-[#F5E6D3]/95 to-[#E8D8C3]/90
                             dark:from-[#2C1810]/95 dark:to-[#3D2B1F]/90
                             backdrop-blur-sm
                             shadow-md hover:shadow-xl
                             border border-[#B8860B]/20 hover:border-[#B8860B]/40
                             hover:-translate-y-0.5
                             transition-all duration-200"
                  >
                    {/* Left accent bar — library filing color */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
                      style={{ backgroundColor: accentColor }}
                    />

                    <div className="pl-5 pr-4 py-4">
                      {/* Title — scholarly typography */}
                      <h3
                        className="text-sm font-medium text-[#3D2B1F] dark:text-[#D4B896]
                                 leading-relaxed line-clamp-2
                                 group-hover:text-[#8B4513] dark:group-hover:text-[#F5E6D3]
                                 transition-colors"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {stripEmojis(article.title)}
                      </h3>
                    </div>

                    {/* Subtle corner flourish on hover */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                      <svg className="w-4 h-4 text-[#B8860B]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Show more link */}
              {articles.length > 12 && (
                <button
                  onClick={() => setSelectedCategory(category)}
                  className="mt-4 text-sm text-[#B8860B]/70 hover:text-[#B8860B] transition-colors
                           flex items-center gap-2"
                >
                  <span>+ {articles.length - 12} more files</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              )}
            </section>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (query || selectedCategory) && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
                        bg-[#B8860B]/10 border border-[#B8860B]/20 mb-6">
            <svg className="w-10 h-10 text-[#B8860B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-[#C4A77D]/70 font-light" style={{ fontFamily: 'Georgia, serif' }}>
            No files found matching your search.
          </p>
          <p className="text-[#C4A77D]/50 text-sm mt-2">
            Try different terms or browse the categories above.
          </p>
        </div>
      )}
    </div>
  );
}
