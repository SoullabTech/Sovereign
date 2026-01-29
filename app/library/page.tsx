'use client';

/**
 * Community Library — The Wisdom Archive
 *
 * A sacred repository styled after ancient desert libraries,
 * where seekers discover wisdom across the sands of time.
 *
 * DUNE-inspired amber aesthetic: warm, timeless, venerable.
 */

import React, { useState } from 'react';
import { LibrarySearch } from '@/components/community/LibrarySearch';
import { ArticleViewer } from '@/components/community/ArticleViewer';
import type { ArticleIndex } from '@/lib/library/types';

export default function LibraryPage() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleIndex | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);

  return (
    <main className="min-h-screen bg-[#2C1810] dark:bg-[#1A1008]">
      {/* Deep amber-brown background with desert texture */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient - warm sand to deep earth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3D2B1F] via-[#2C1810] to-[#1A1008]" />

        {/* Warm glow orbs - like torchlight in an ancient library */}
        <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-[#D4A574]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-[#B8860B]/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#CD853F]/6 rounded-full blur-[80px]" />

        {/* Subtle noise texture overlay for aged paper feel */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top Navigation Bar */}
        {!selectedArticle && (
          <div className="flex items-center justify-between mb-8">
            <a
              href="/maia"
              className="inline-flex items-center gap-2 text-[#D4B896]/70 hover:text-[#D4B896] transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to MAIA
            </a>

            <button
              onClick={() => setShowContributeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-[#D4B896]/10 hover:bg-[#D4B896]/20 backdrop-blur-sm
                       text-[#D4B896] font-medium transition-all
                       border border-[#D4B896]/30 hover:border-[#D4B896]/50"
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
            <p className="text-sm tracking-[0.3em] uppercase text-[#B8860B]/80 font-medium">
              The Archive
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-light text-[#D4B896] tracking-wide drop-shadow-sm"
                style={{ fontFamily: 'serif' }}>
              Wisdom Files
            </h1>
            <p className="mt-4 text-lg text-[#C4A77D]/80 max-w-2xl mx-auto leading-relaxed font-light">
              A living collection of insights, teachings, and practices
              from our community of seekers and practitioners.
            </p>

            {/* Decorative divider - like an ancient scroll ornament */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#B8860B]/30 to-[#B8860B]/60" />
              <div className="w-2 h-2 rounded-full bg-[#B8860B]/60 shadow-[0_0_8px_rgba(184,134,11,0.4)]" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent via-[#B8860B]/30 to-[#B8860B]/60" />
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowContributeModal(false)}
          />

          {/* Modal - Parchment style */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
                        bg-gradient-to-br from-[#F5E6D3]/98 to-[#E8D8C3]/95 dark:from-[#2C1810]/98 dark:to-[#3D2B1F]/95
                        backdrop-blur-xl rounded-2xl shadow-2xl
                        border border-[#B8860B]/30">

            {/* Decorative top bar - golden trim */}
            <div className="h-1.5 bg-gradient-to-r from-[#8B4513] via-[#B8860B] to-[#CD853F]" />

            {/* Close button */}
            <button
              onClick={() => setShowContributeModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full
                       text-[#8B4513]/60 hover:text-[#8B4513] dark:text-[#D4B896]/50 dark:hover:text-[#D4B896]
                       hover:bg-[#8B4513]/10 dark:hover:bg-[#D4B896]/10 transition-colors"
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
                              bg-[#B8860B]/20 mb-4">
                  <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-[#3D2B1F] dark:text-[#D4B896]">
                  Contribute to the Archive
                </h2>
                <p className="mt-3 text-[#5D4E37] dark:text-[#C4A77D]/70 max-w-lg mx-auto">
                  Share your wisdom, insights, and practices with our community of seekers.
                </p>
              </div>

              {/* Guidelines Section */}
              <div className="mb-8 p-6 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/20">
                <h3 className="font-semibold text-[#8B4513] dark:text-[#D4B896] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contribution Guidelines
                </h3>
                <ul className="space-y-3 text-sm text-[#5D4E37] dark:text-[#C4A77D]/80">
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#3D2B1F] dark:text-[#D4B896]">Original work</strong> — Share your own insights, reflections, or practices</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#3D2B1F] dark:text-[#D4B896]">Depth focus</strong> — Content aligned with depth psychology, alchemy, consciousness</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#3D2B1F] dark:text-[#D4B896]">Markdown format</strong> — Submit in .md format for best formatting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2 flex-shrink-0" />
                    <span><strong className="text-[#3D2B1F] dark:text-[#D4B896]">Attribution</strong> — Properly cite sources and quotes</span>
                  </li>
                </ul>
              </div>

              {/* Submission Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#3D2B1F] dark:text-[#D4B896] mb-4">Ways to Contribute</h3>

                {/* Email Submission */}
                <a
                  href="mailto:commons@soullab.io?subject=Wisdom%20Files%20Contribution"
                  className="flex items-center gap-4 p-4 rounded-xl
                           bg-white/80 dark:bg-[#1A1008]/80 border border-[#B8860B]/20
                           hover:border-[#B8860B]/50 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-lg bg-[#B8860B]/10 group-hover:bg-[#B8860B]/20 transition-colors">
                    <svg className="w-6 h-6 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#3D2B1F] dark:text-[#D4B896]">Email Submission</div>
                    <div className="text-sm text-[#8B4513]/70 dark:text-[#C4A77D]/50">Send your contribution to commons@soullab.io</div>
                  </div>
                  <svg className="w-5 h-5 text-[#B8860B]/50 group-hover:text-[#B8860B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/SoullabTech/community-commons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl
                           bg-white/80 dark:bg-[#1A1008]/80 border border-[#B8860B]/20
                           hover:border-[#B8860B]/50 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-lg bg-[#B8860B]/10 group-hover:bg-[#B8860B]/20 transition-colors">
                    <svg className="w-6 h-6 text-[#B8860B]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#3D2B1F] dark:text-[#D4B896]">GitHub Pull Request</div>
                    <div className="text-sm text-[#8B4513]/70 dark:text-[#C4A77D]/50">For technical contributors — submit a PR directly</div>
                  </div>
                  <svg className="w-5 h-5 text-[#B8860B]/50 group-hover:text-[#B8860B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                {/* Discord/Community */}
                <a
                  href="https://discord.gg/soullab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl
                           bg-white/80 dark:bg-[#1A1008]/80 border border-[#B8860B]/20
                           hover:border-[#B8860B]/50 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-lg bg-[#B8860B]/10 group-hover:bg-[#B8860B]/20 transition-colors">
                    <svg className="w-6 h-6 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#3D2B1F] dark:text-[#D4B896]">Join the Discussion</div>
                    <div className="text-sm text-[#8B4513]/70 dark:text-[#C4A77D]/50">Connect with contributors in our community</div>
                  </div>
                  <svg className="w-5 h-5 text-[#B8860B]/50 group-hover:text-[#B8860B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Footer note */}
              <p className="mt-8 text-center text-sm text-[#8B4513]/60 dark:text-[#C4A77D]/40">
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
