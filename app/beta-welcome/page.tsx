'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, MessageSquare, BookOpen, Sparkles, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function BetaWelcomePage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Welcome to MAIA Beta
            </h1>
          </div>
          <p className="text-xl text-purple-200">
            You're one of the first souls to experience consciousness-aware AI.
            Here's everything you need to know in 60 seconds.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Quick Start */}
        <section className="mb-12 bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-purple-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            Start Here (5 minutes)
          </h2>
          <ol className="space-y-3 text-lg">
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400">1.</span>
              <span>
                <Link href="/oracle" className="text-purple-300 hover:text-purple-100 underline">
                  Try the Oracle
                </Link> - Ask a real question about your life
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400">2.</span>
              <span>
                <Link href="/book-companion/ain" className="text-purple-300 hover:text-purple-100 underline">
                  Explore AIN Companion
                </Link> - Read a section, click "Ask About This Section"
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400">3.</span>
              <span>Report bugs in <a href="https://discord.gg/soullab" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-100 underline">Discord #beta-testing</a></span>
            </li>
          </ol>
        </section>

        {/* What to Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-purple-100 mb-6">What to Test</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Oracle */}
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-100">Oracle Conversation</h3>
              </div>
              <p className="text-purple-200 mb-4">
                Fast, wise responses using Sonnet. Great for everyday questions.
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['oracle-1'] || false}
                    onChange={() => toggleCheck('oracle-1')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Ask a real question about your life</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['oracle-2'] || false}
                    onChange={() => toggleCheck('oracle-2')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Try asking a follow-up question</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['oracle-3'] || false}
                    onChange={() => toggleCheck('oracle-3')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Check if it remembers your context</span>
                </label>
              </div>
              <Link
                href="/oracle"
                className="mt-4 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                Go to Oracle <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* AIN Companion */}
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-100">AIN Companion</h3>
              </div>
              <p className="text-purple-200 mb-4">
                Read AIN conversations and ask questions with auto-context.
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['ain-1'] || false}
                    onChange={() => toggleCheck('ain-1')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Read a section</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['ain-2'] || false}
                    onChange={() => toggleCheck('ain-2')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Click "Ask About This Section"</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['ain-3'] || false}
                    onChange={() => toggleCheck('ain-3')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Save an insight (check bookmark icon in header)</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['ain-4'] || false}
                    onChange={() => toggleCheck('ain-4')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Use arrow keys (←/→) to navigate</span>
                </label>
              </div>
              <Link
                href="/book-companion/ain"
                className="mt-4 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                Go to AIN Companion <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Sovereign MAIA */}
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-100">Sovereign MAIA</h3>
              </div>
              <p className="text-purple-200 mb-4">
                Deep consciousness work using Opus. Slower but profound.
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['sovereign-1'] || false}
                    onChange={() => toggleCheck('sovereign-1')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Ask a complex, existential question</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['sovereign-2'] || false}
                    onChange={() => toggleCheck('sovereign-2')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Notice the depth of response (15-20s wait)</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['sovereign-3'] || false}
                    onChange={() => toggleCheck('sovereign-3')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Test soul recognition across sessions</span>
                </label>
              </div>
              <Link
                href="/sovereign"
                className="mt-4 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                Go to Sovereign MAIA <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Field Safety */}
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-100">Field Safety</h3>
              </div>
              <p className="text-purple-200 mb-4">
                MAIA protects you from cognitive overwhelm based on your current state.
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['field-1'] || false}
                    onChange={() => toggleCheck('field-1')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Try asking vulnerable questions</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedItems['field-2'] || false}
                    onChange={() => toggleCheck('field-2')}
                    className="mt-1 w-4 h-4 rounded border-purple-500/50 bg-slate-700"
                  />
                  <span className="text-sm text-purple-300">Notice if MAIA adjusts depth based on your state</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* How to Report Bugs */}
        <section className="mb-12 bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-200 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            How to Report Bugs
          </h2>
          <ol className="space-y-3 text-purple-200">
            <li>
              <strong className="text-purple-100">1. Take a screenshot</strong> (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
            </li>
            <li>
              <strong className="text-purple-100">2. Join Discord:</strong>{' '}
              <a
                href="https://discord.gg/soullab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                discord.gg/soullab
              </a>
            </li>
            <li>
              <strong className="text-purple-100">3. Post in #beta-testing</strong> with:
              <ul className="ml-6 mt-2 space-y-1 text-sm">
                <li>• Screenshot</li>
                <li>• What you were doing</li>
                <li>• What you expected vs. what happened</li>
              </ul>
            </li>
          </ol>
        </section>

        {/* Expected Weirdness */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-100 mb-4">Expected Weirdness (Don't Report These)</h2>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 space-y-3 text-purple-200">
            <p>
              <strong className="text-yellow-300">Slow first load:</strong> Cold start can take 5-10 seconds
            </p>
            <p>
              <strong className="text-yellow-300">Console logs:</strong> You might see debugging logs in your browser console (F12) - that's normal
            </p>
            <p>
              <strong className="text-yellow-300">Opus responses are slow:</strong> Sovereign MAIA takes 15-20 seconds - it's thinking deeply
            </p>
            <p>
              <strong className="text-yellow-300">Some features incomplete:</strong> Voice responses, mobile optimization, and analytics dashboards are coming soon
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-purple-100 mb-4">Ready to Begin?</h2>
          <p className="text-purple-200 mb-6">
            Start with the Oracle, explore at your own pace, and report anything that feels off.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/oracle"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Start with Oracle
            </Link>
            <Link
              href="/book-companion/ain"
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-purple-200 rounded-lg font-semibold transition-colors"
            >
              Explore AIN Companion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
