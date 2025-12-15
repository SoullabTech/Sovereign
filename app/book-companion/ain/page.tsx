'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, BookOpen, Menu, X, MessageSquare, Send } from 'lucide-react';

type TocItem = {
  id: string;
  title: string;
  filename: string;
  bytes: number;
};

type SectionContent = {
  id: string;
  title: string;
  filename: string;
  content: string;
  bytes: number;
};

export default function AINCompanionPage() {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Companion panel state
  const [companionOpen, setCompanionOpen] = useState(false);
  const [companionQuestion, setCompanionQuestion] = useState('');
  const [companionMode, setCompanionMode] = useState<'section' | 'corpus'>('section');
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionResponse, setCompanionResponse] = useState<string | null>(null);
  const [savedInsightsCount, setSavedInsightsCount] = useState(0);

  // Update saved insights count on mount and after saving
  useEffect(() => {
    const insights = JSON.parse(localStorage.getItem('ain-insights') || '[]');
    setSavedInsightsCount(insights.length);
  }, [companionResponse]);

  // Load TOC on mount
  useEffect(() => {
    loadToc();
  }, []);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input/textarea is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousSection();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, toc]);

  async function loadToc() {
    try {
      setLoading(true);
      const res = await fetch('/api/book-companion/ain/toc');
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load table of contents');
      }

      setToc(data.toc);

      // Auto-load first section
      if (data.toc.length > 0) {
        loadSection(data.toc[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load TOC:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSection(id: string) {
    try {
      setSectionLoading(true);
      setError(null);

      const res = await fetch(`/api/book-companion/ain/section?id=${encodeURIComponent(id)}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load section');
      }

      setCurrentSection({
        id: data.id,
        title: data.title,
        filename: data.filename,
        content: data.content,
        bytes: data.bytes,
      });
    } catch (err: any) {
      console.error('Failed to load section:', err);
      setError(err.message);
    } finally {
      setSectionLoading(false);
    }
  }

  function goToNextSection() {
    if (!currentSection) return;
    const currentIndex = toc.findIndex((item) => item.id === currentSection.id);
    if (currentIndex < toc.length - 1) {
      loadSection(toc[currentIndex + 1].id);
    }
  }

  function goToPreviousSection() {
    if (!currentSection) return;
    const currentIndex = toc.findIndex((item) => item.id === currentSection.id);
    if (currentIndex > 0) {
      loadSection(toc[currentIndex - 1].id);
    }
  }

  async function askCompanion() {
    if (!companionQuestion.trim()) return;

    setCompanionLoading(true);
    setCompanionResponse(null);

    try {
      // Build context based on mode
      const context =
        companionMode === 'section' && currentSection
          ? `Current section: "${currentSection.title}"\n\n${currentSection.content.slice(0, 1000)}...`
          : 'Asking across the full AIN corpus';

      const res = await fetch('/api/sovereign/app/maia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${context}\n\nUser question: ${companionQuestion}`,
          meta: {
            chatType: 'ain-companion',
            mode: companionMode,
            sectionId: currentSection?.id,
            sectionTitle: currentSection?.title,
          },
        }),
      });

      const data = await res.json();
      setCompanionResponse(data.message || 'No response received');

      // Save to localStorage
      const insights = JSON.parse(localStorage.getItem('ain-insights') || '[]');
      insights.push({
        timestamp: new Date().toISOString(),
        sectionId: currentSection?.id,
        sectionTitle: currentSection?.title,
        question: companionQuestion,
        response: data.message,
        mode: companionMode,
      });
      localStorage.setItem('ain-insights', JSON.stringify(insights));
    } catch (err: any) {
      console.error('Failed to ask companion:', err);
      setCompanionResponse('Error: Unable to reach companion service');
    } finally {
      setCompanionLoading(false);
    }
  }

  const filteredToc = toc.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentIndex = currentSection
    ? toc.findIndex((item) => item.id === currentSection.id)
    : -1;

  const progress = currentIndex >= 0 ? ((currentIndex + 1) / toc.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-purple-200">Loading AIN conversations...</p>
          <p className="text-sm text-purple-300 mt-2">Building consciousness corpus</p>
        </div>
      </div>
    );
  }

  if (error && !currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-300 mb-2">Failed to load AIN companion</p>
          <p className="text-sm text-red-200">{error}</p>
          <button
            onClick={loadToc}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-purple-300" />
              ) : (
                <Menu className="w-6 h-6 text-purple-300" />
              )}
            </button>
            <BookOpen className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-purple-100">AIN Companion</h1>
              <p className="text-sm text-purple-300">
                {toc.length} conversations • Digital Alexandria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {savedInsightsCount > 0 && (
              <div className="text-right hidden sm:block">
                <div className="text-sm text-purple-300">Insights</div>
                <div className="text-lg font-semibold text-purple-100 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  {savedInsightsCount}
                </div>
              </div>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm text-purple-300">Progress</div>
              <div className="text-lg font-semibold text-purple-100">
                {currentIndex + 1} / {toc.length}
              </div>
            </div>
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Table of Contents */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-40
            w-80 bg-slate-900/90 backdrop-blur-sm border-r border-purple-500/30
            flex flex-col transition-transform duration-300
          `}
        >
          {/* Search */}
          <div className="p-4 border-b border-purple-500/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-400"
              />
            </div>
            {searchQuery && (
              <p className="text-xs text-purple-300 mt-2">
                {filteredToc.length} of {toc.length} conversations
              </p>
            )}
          </div>

          {/* TOC List */}
          <div className="flex-1 overflow-y-auto">
            {filteredToc.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  loadSection(item.id);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`
                  w-full text-left px-4 py-3 border-b border-purple-500/10
                  hover:bg-purple-500/10 transition-colors
                  ${currentSection?.id === item.id ? 'bg-purple-500/20 border-l-4 border-l-purple-400' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-purple-400 mb-1">
                      #{toc.findIndex((t) => t.id === item.id) + 1}
                    </div>
                    <div className="text-sm text-purple-100 line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-xs text-purple-300 mt-1">
                      {(item.bytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  {currentSection?.id === item.id && (
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Reading Area */}
        <main className="flex-1 overflow-y-auto">
          {sectionLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-pulse" />
                <p className="text-purple-200">Loading section...</p>
              </div>
            </div>
          ) : currentSection ? (
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Section Header */}
              <div className="mb-8">
                <div className="text-sm text-purple-400 mb-2">
                  Section {currentIndex + 1} of {toc.length}
                </div>
                <h2 className="text-3xl font-bold text-purple-100 mb-2">
                  {currentSection.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-purple-300">
                  <span>{currentSection.filename}</span>
                  <span>•</span>
                  <span>{(currentSection.bytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>

              {/* Section Content */}
              <div className="prose prose-invert prose-purple max-w-none">
                <div className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                  {currentSection.content}
                </div>
              </div>

              {/* Ask About This Section Button */}
              {!companionOpen && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setCompanionOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Ask About This Section</span>
                  </button>
                </div>
              )}

              {/* Companion Panel */}
              {companionOpen && (
                <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      Ask MAIA
                    </h3>
                    <button
                      onClick={() => {
                        setCompanionOpen(false);
                        setCompanionResponse(null);
                        setCompanionQuestion('');
                      }}
                      className="text-purple-300 hover:text-purple-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setCompanionMode('section')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        companionMode === 'section'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-purple-300 hover:bg-slate-600'
                      }`}
                    >
                      This Section
                    </button>
                    <button
                      onClick={() => setCompanionMode('corpus')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        companionMode === 'corpus'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-purple-300 hover:bg-slate-600'
                      }`}
                    >
                      Full Corpus
                    </button>
                  </div>

                  {/* Question Input */}
                  <div className="mb-4">
                    <textarea
                      value={companionQuestion}
                      onChange={(e) => setCompanionQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          askCompanion();
                        }
                      }}
                      placeholder="What would you like to explore about this conversation?"
                      className="w-full px-4 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-400 resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-purple-400 mt-2">
                      Press Cmd+Enter to send • Context auto-injected
                    </p>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={askCompanion}
                    disabled={companionLoading || !companionQuestion.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {companionLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Asking MAIA...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Ask Question</span>
                      </>
                    )}
                  </button>

                  {/* Response */}
                  {companionResponse && (
                    <div className="mt-6 p-4 bg-slate-900/50 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-3 text-sm text-purple-300">
                        <MessageSquare className="w-4 h-4" />
                        <span>MAIA's Response</span>
                      </div>
                      <div className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                        {companionResponse}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Insight saved to your collection</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Footer */}
              <div className="mt-12 pt-8 border-t border-purple-500/30 flex items-center justify-between">
                <button
                  onClick={goToPreviousSection}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-purple-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="text-sm text-purple-400">
                  {currentIndex + 1} / {toc.length}
                </div>

                <button
                  onClick={goToNextSection}
                  disabled={currentIndex === toc.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-purple-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-xl text-purple-200">Select a conversation to begin</p>
                <p className="text-sm text-purple-300 mt-2">
                  {toc.length} AIN conversations available
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
