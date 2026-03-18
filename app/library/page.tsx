'use client';

/**
 * Library — Wisdom Files
 *
 * Clean, minimal library interface with matte dark + orange accent styling.
 */

import React, { useState } from 'react';
import { LibrarySearch } from '@/components/community/LibrarySearch';
import { ArticleViewer } from '@/components/community/ArticleViewer';
import type { ArticleIndex } from '@/lib/library/types';
import { ChevronLeft, Plus, X, BookOpen, Mail, Github, MessageCircle, CheckCircle } from 'lucide-react';

export default function LibraryPage() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleIndex | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);

  return (
    <main className="min-h-screen font-sans bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Navigation */}
        {!selectedArticle && (
          <div className="flex items-center justify-between mb-8">
            <a
              href="/maia"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            >
              <ChevronLeft size={16} className="text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
              Back to MAIA
            </a>

            <button
              onClick={() => setShowContributeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-orange-500 hover:bg-orange-600
                       text-white font-medium transition-colors"
            >
              <Plus size={16} />
              Contribute
            </button>
          </div>
        )}

        {/* Header */}
        {!selectedArticle && (
          <header className="mb-10">
            <p className="text-sm tracking-wider uppercase text-orange-500 font-medium mb-2">
              The Archive
            </p>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Wisdom Files
            </h1>
            <p className="mt-3 text-white/50 max-w-2xl">
              A living collection of insights, teachings, and practices from our community.
            </p>
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

          {/* Modal */}
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto
                        bg-[#2a2a2a] rounded-xl border border-white/10">

            {/* Close button */}
            <button
              onClick={() => setShowContributeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg
                       text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg
                              bg-orange-500/10 mb-4">
                  <BookOpen size={24} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-medium text-white">
                  Contribute to the Archive
                </h2>
                <p className="mt-2 text-white/50">
                  Share your wisdom with our community of seekers.
                </p>
              </div>

              {/* Guidelines */}
              <div className="mb-6 p-4 rounded-lg bg-[#1a1a1a] border border-white/10">
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-orange-500" />
                  Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex gap-3">
                    <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span><span className="text-white/80">Original work</span> — Share your own insights and practices</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span><span className="text-white/80">Depth focus</span> — Content aligned with consciousness exploration</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span><span className="text-white/80">Markdown format</span> — Submit in .md format</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1 h-1 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <span><span className="text-white/80">Attribution</span> — Properly cite sources and quotes</span>
                  </li>
                </ul>
              </div>

              {/* Submission Options */}
              <div className="space-y-3">
                <h3 className="font-medium text-white mb-3">Ways to Contribute</h3>

                {/* Email */}
                <a
                  href="mailto:commons@soullab.io?subject=Wisdom%20Files%20Contribution"
                  className="flex items-center gap-4 p-4 rounded-lg
                           bg-[#1a1a1a] border border-white/10
                           hover:border-orange-500/50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Mail size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">Email Submission</div>
                    <div className="text-sm text-white/40">commons@soullab.io</div>
                  </div>
                  <ChevronLeft size={16} className="text-orange-500 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/SoullabTech/community-commons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg
                           bg-[#1a1a1a] border border-white/10
                           hover:border-orange-500/50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Github size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">GitHub Pull Request</div>
                    <div className="text-sm text-white/40">For technical contributors</div>
                  </div>
                  <ChevronLeft size={16} className="text-orange-500 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Discord */}
                <a
                  href="https://discord.gg/soullab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg
                           bg-[#1a1a1a] border border-white/10
                           hover:border-orange-500/50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <MessageCircle size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">Join the Discussion</div>
                    <div className="text-sm text-white/40">Connect in our community</div>
                  </div>
                  <ChevronLeft size={16} className="text-orange-500 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Footer note */}
              <p className="mt-6 text-center text-sm text-white/30">
                All contributions are reviewed before publishing.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
