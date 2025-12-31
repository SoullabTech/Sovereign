'use client';

/**
 * Community Library
 *
 * A sacred repository where seekers discover wisdom,
 * philosophical foundations, and practical guidance
 * for conscious evolution.
 */

import React, { useState } from 'react';
import { LibrarySearch } from '@/components/community/LibrarySearch';
import { ArticleViewer } from '@/components/community/ArticleViewer';
import type { ArticleIndex } from '@/lib/library/types';

export default function LibraryPage() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleIndex | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);

  return (
    <main className="min-h-screen bg-[#80CBC4] dark:bg-[#1A3533]">
      {/* Solid sage-teal background with subtle texture */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4DB6AC] via-[#80CBC4] to-[#80CBC4] dark:from-[#1A3533] dark:to-[#1E3D3A]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#26A69A]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-[#4DB6AC]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top Navigation Bar */}
        {!selectedArticle && (
          <div className="flex items-center justify-between mb-8">
            <a
              href="/maia"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to MAIA
            </a>

            <button
              onClick={() => setShowContributeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-white/20 hover:bg-white/30 backdrop-blur-sm
                       text-white font-medium transition-all
                       border border-white/20 hover:border-white/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Contribute
            </button>
          </div>
        )}

        {/* Header */}
        {!selectedArticle && (
          <header className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase text-white/70 dark:text-[#80CBC4] font-medium">
              SOULLAB Community
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-light text-white dark:text-[#A7D8D1] tracking-wide drop-shadow-sm">
              Wisdom Files
            </h1>
            <p className="mt-4 text-lg text-white/80 dark:text-[#B2DFDB]/90 max-w-2xl mx-auto leading-relaxed font-light">
              A living collection of insights, teachings, and practices
              from our community of seekers and practitioners.
            </p>

            {/* Decorative divider */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-white/50" />
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-white/30 to-white/50" />
            </div>
          </header>
        )}

        {/* Content */}
        {selectedArticle ? (
          <ArticleViewer
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
          />
        ) : (
          <LibrarySearch onSelectArticle={setSelectedArticle} />
        )}
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContributeModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
                        bg-gradient-to-br from-white/95 to-white/90 dark:from-[#1A2625]/98 dark:to-[#1A2F2E]/95
                        backdrop-blur-xl rounded-2xl shadow-2xl
                        border border-white/20 dark:border-white/10">

            {/* Decorative top bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#26A69A] via-[#4DB6AC] to-[#80CBC4]" />

            {/* Close button */}
            <button
              onClick={() => setShowContributeModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full
                       text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white
                       hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
                              bg-[#26A69A]/20 mb-4">
                  <svg className="w-8 h-8 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-[#004D40] dark:text-[#B2DFDB]">
                  Contribute to the Commons
                </h2>
                <p className="mt-3 text-gray-600 dark:text-white/60 max-w-lg mx-auto">
                  Share your wisdom, insights, and practices with our community of seekers.
                </p>
              </div>

              {/* Guidelines Section */}
              <div className="mb-8 p-6 rounded-xl bg-[#E0F2F1]/50 dark:bg-[#26A69A]/10 border border-[#26A69A]/20">
                <h3 className="font-semibold text-[#00695C] dark:text-[#80CBC4] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contribution Guidelines
                </h3>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-white/70">
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#004D40] dark:text-[#B2DFDB]">Original work</strong> — Share your own insights, reflections, or practices</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#004D40] dark:text-[#B2DFDB]">Depth focus</strong> — Content aligned with depth psychology, alchemy, consciousness</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#004D40] dark:text-[#B2DFDB]">Markdown format</strong> — Submit in .md format for best formatting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#004D40] dark:text-[#B2DFDB]">Attribution</strong> — Properly cite sources and quotes</span>
                  </li>
                </ul>
              </div>

              {/* Submission Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#004D40] dark:text-white mb-4">Ways to Contribute</h3>

                {/* Email Submission */}
                <a
                  href="mailto:commons@soullab.io?subject=Wisdom%20Files%20Contribution"
                  className="flex items-center gap-4 p-4 rounded-xl
                           bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
                           hover:border-[#26A69A]/50 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-lg bg-[#26A69A]/10 group-hover:bg-[#26A69A]/20 transition-colors">
                    <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#004D40] dark:text-white">Email Submission</div>
                    <div className="text-sm text-gray-500 dark:text-white/50">Send your contribution to commons@soullab.io</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#26A69A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/SoullabTech/community-commons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl
                           bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
                           hover:border-[#26A69A]/50 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-lg bg-[#26A69A]/10 group-hover:bg-[#26A69A]/20 transition-colors">
                    <svg className="w-6 h-6 text-[#26A69A]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#004D40] dark:text-white">GitHub Pull Request</div>
                    <div className="text-sm text-gray-500 dark:text-white/50">For technical contributors — submit a PR directly</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#26A69A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                {/* Discord/Community */}
                <a
                  href="https://discord.gg/soullab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl
                           bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
                           hover:border-[#26A69A]/50 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-lg bg-[#26A69A]/10 group-hover:bg-[#26A69A]/20 transition-colors">
                    <svg className="w-6 h-6 text-[#26A69A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#004D40] dark:text-white">Join the Discussion</div>
                    <div className="text-sm text-gray-500 dark:text-white/50">Connect with contributors in our community</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#26A69A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Footer note */}
              <p className="mt-8 text-center text-sm text-gray-500 dark:text-white/40">
                All contributions are reviewed before publishing. We honor diverse perspectives
                while maintaining alignment with our community values.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
