// frontend

'use client';

import { useState } from 'react';
import { ainKnowledgeGate, KnowledgeGateInput, KnowledgeGateResult } from '@/lib/ain/knowledge-gate';
import { SourceHalo, SourceMixDebug } from '@/components/ain/SourceHalo';

export default function TestAINPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<KnowledgeGateResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock LLM caller for testing
  const mockLLMCall = async (args: any): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    // Generate a mock response based on the source mix
    const topSource = args.source_mix.sort((a: any, b: any) => b.weight - a.weight)[0];
    const responses = {
      FIELD: "🌀 The resonance field is sensing deep currents of meaning in your inquiry...",
      AIN_OBSIDIAN: "📚 Drawing from your vault of accumulated knowledge and research...",
      AIN_DEVTEAM: "💻 Accessing Soullab Dev Team patterns and implementation wisdom...",
      ORACLE_MEMORY: "🔮 Reflecting on our past conversations and the threads that connect...",
      LLM_CORE: "🤖 Processing this through base reasoning and analytical frameworks..."
    };

    return responses[topSource.source as keyof typeof responses] || "Processing your message...";
  };

  const handleTest = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const gateInput: KnowledgeGateInput = {
        userMessage: input,
        style: 'gentle',
        contextHint: 'test'
      };

      const gateResult = await ainKnowledgeGate(gateInput, mockLLMCall);
      setResult(gateResult);
    } catch (error) {
      console.error('AIN Knowledge Gate test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soul-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-soul-accent mb-2">
            🚪 AIN Knowledge Gate Test
          </h1>
          <p className="text-soul-textSecondary">
            Test the 5-source knowledge scoring and source halo visualization
          </p>
        </div>

        <div className="bg-soul-surface/10 border border-soul-accent/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-soul-textPrimary mb-4">
            Test Input
          </h2>

          <div className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try messages like: 'Tell me about morphic resonance' or 'Check the dev team code patterns' or 'What did we discuss in our last session?'"
              className="w-full h-24 p-3 bg-soul-surface border border-soul-accent/20 rounded-lg text-soul-textPrimary placeholder:text-soul-textSecondary/50 focus:border-soul-accent focus:outline-none"
            />

            <button
              onClick={handleTest}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-soul-accent text-soul-background rounded-lg font-medium hover:bg-soul-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Test Knowledge Gate'}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-soul-surface/10 border border-soul-accent/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-soul-textPrimary mb-4">
                Response
              </h2>
              <div className="p-4 bg-soul-surface/20 rounded-lg">
                <p className="text-soul-textPrimary">{result.response}</p>
              </div>
            </div>

            <div className="bg-soul-surface/10 border border-soul-accent/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-soul-textPrimary mb-4">
                Source Halo Visualization
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-soul-textSecondary mb-2">Small</h3>
                  <SourceHalo sourceMix={result.source_mix} size="sm" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-soul-textSecondary mb-2">Medium with Labels</h3>
                  <SourceHalo sourceMix={result.source_mix} size="md" showLabels />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-soul-textSecondary mb-2">Large</h3>
                  <SourceHalo sourceMix={result.source_mix} size="lg" />
                </div>
              </div>
            </div>

            <SourceMixDebug
              sourceMix={result.source_mix}
              debug={result.debug}
            />
          </div>
        )}

        <div className="bg-soul-surface/5 border border-soul-accent/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-soul-textPrimary mb-3">
            Test Keywords
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-soul-accent mb-2">🟡 FIELD triggers:</div>
              <div className="text-soul-textSecondary">field, resonance, morphic, coherence, numinous, ritual</div>
            </div>
            <div>
              <div className="font-medium text-soul-accent mb-2">🔵 AIN_OBSIDIAN triggers:</div>
              <div className="text-soul-textSecondary">obsidian, vault, my notes, research, mapping, ain</div>
            </div>
            <div>
              <div className="font-medium text-soul-accent mb-2">🟣 AIN_DEVTEAM triggers:</div>
              <div className="text-soul-textSecondary">code, repo, commit, branch, test, vercel, dev team</div>
            </div>
            <div>
              <div className="font-medium text-soul-accent mb-2">🟤 ORACLE_MEMORY triggers:</div>
              <div className="text-soul-textSecondary">journal, transcript, session, last time, earlier you said</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}