'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar, Mail, Sparkles } from 'lucide-react';

interface PreludeResponse {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  invite_code: string;

  // Fire
  what_is_calling: string;
  what_does_it_change: string;
  pulse_or_temperature: string;

  // Water
  why_must_exist: string;
  what_is_ready_to_flow: string;
  who_enters_and_feels: string;

  // Earth
  grounded_tech_meaning: string;
  functions_needed: string;
  sustaining_resources: string;

  // Air
  voice_it_speaks: string;
  conversation_type: string;
  form_it_takes: string;

  // Aether
  what_is_it: string;
  presence_it_carries: string;
  how_know_alive: string;

  // Closing
  cosmos_line: string;

  // Metadata
  chat_messages: any[];
}

interface Invite {
  project_name: string;
  element_mix: string;
  meeting_date: string;
}

/**
 * Admin: Partner Prelude Response Viewer
 *
 * View partner's five-element reflection before listening session
 */
export default function AdminPreludeView() {
  const params = useParams();
  const responseId = params?.id as string;

  const [response, setResponse] = useState<PreludeResponse | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResponse() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get response
        const { data: responseData, error: responseError } = await supabase
          .from('partners_prelude_responses')
          .select('*')
          .eq('id', responseId)
          .single();

        if (responseError) throw responseError;

        setResponse(responseData);

        // Get invite details
        const { data: inviteData, error: inviteError } = await supabase
          .from('partners_invites')
          .select('project_name, element_mix, meeting_date')
          .eq('invite_code', responseData.invite_code)
          .single();

        if (!inviteError && inviteData) {
          setInvite(inviteData);
        }

      } catch (err) {
        console.error('Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load response');
      } finally {
        setLoading(false);
      }
    }

    if (responseId) {
      loadResponse();
    }
  }, [responseId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soul-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold-amber mx-auto mb-4 animate-pulse" />
          <p className="text-soul-textSecondary">Loading reflection...</p>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="min-h-screen bg-soul-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-soul-textPrimary mb-2">Not Found</h2>
          <p className="text-soul-textSecondary mb-6">{error || 'Response not found'}</p>
          <Link
            href="/admin/partners"
            className="text-gold-amber hover:underline"
          >
            ← Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soul-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/partners"
            className="inline-flex items-center gap-2 text-gold-amber hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-soul-textPrimary mb-2">
                {response.name}'s Prelude
              </h1>
              {invite && (
                <div className="space-y-1 text-sm text-soul-textSecondary">
                  <p><strong>Project:</strong> {invite.project_name}</p>
                  <p><strong>Element:</strong> {invite.element_mix}</p>
                  {invite.meeting_date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <strong>Meeting:</strong> {formatDate(invite.meeting_date)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gold-amber/20 hover:bg-gold-amber/30 border border-gold-amber/60 rounded-lg text-gold-amber font-semibold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print/PDF
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-soul-textTertiary">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {response.email}
            </div>
            <div>Submitted {formatDate(response.submitted_at)}</div>
            {response.chat_messages.length > 0 && (
              <div className="text-gold-amber">
                💬 {response.chat_messages.length} MAIA chat messages
              </div>
            )}
          </div>
        </div>

        {/* Responses - Organized by Element */}
        <div className="space-y-8">
          {/* Fire */}
          <ElementSection
            title="Fire — The If"
            subtitle="What's calling to be built"
            emoji="🔥"
            color="fire"
            responses={[
              { question: 'What is calling to be built now?', answer: response.what_is_calling },
              { question: 'When you imagine it alive and working beautifully, what does it change?', answer: response.what_does_it_change },
              { question: 'If your digital field had a pulse or temperature, what would it feel like?', answer: response.pulse_or_temperature },
            ]}
          />

          {/* Water */}
          <ElementSection
            title="Water — The Why"
            subtitle="Why this matters"
            emoji="💧"
            color="water"
            responses={[
              { question: 'Why does this need to exist?', answer: response.why_must_exist },
              { question: 'What part of your current practice feels ready to flow further?', answer: response.what_is_ready_to_flow },
              { question: 'Who do you imagine entering this space — and how do you want them to feel?', answer: response.who_enters_and_feels },
            ]}
          />

          {/* Earth */}
          <ElementSection
            title="Earth — The How"
            subtitle="Grounded technical requirements"
            emoji="🌱"
            color="earth"
            responses={[
              { question: 'What does "grounded technology" mean to you?', answer: response.grounded_tech_meaning },
              { question: 'Which functions must this space perform?', answer: response.functions_needed },
              { question: 'How do you envision sustaining it — time, energy, and resources?', answer: response.sustaining_resources },
            ]}
          />

          {/* Air */}
          <ElementSection
            title="Air — The What"
            subtitle="Voice and conversation type"
            emoji="🌬️"
            color="air"
            responses={[
              { question: 'If your work could speak in its own voice online, what would it say?', answer: response.voice_it_speaks },
              { question: 'What kind of conversation do you want your visitors to have with it?', answer: response.conversation_type },
              { question: 'What form could that take?', answer: response.form_it_takes },
            ]}
          />

          {/* Aether */}
          <ElementSection
            title="Aether — The Is"
            subtitle="Essence and presence"
            emoji="✨"
            color="gold"
            responses={[
              { question: 'When you imagine this project complete and breathing on its own — what is it?', answer: response.what_is_it },
              { question: 'What presence do you want it to carry when you are not there?', answer: response.presence_it_carries },
              { question: 'How will you know it is alive?', answer: response.how_know_alive },
            ]}
          />

          {/* Closing */}
          {response.cosmos_line && (
            <div className="bg-soul-surface border border-soul-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌙</span>
                <h3 className="text-xl font-bold text-soul-textPrimary">Closing Reflection</h3>
              </div>
              <blockquote className="border-l-4 border-gold-amber pl-4 italic text-soul-textPrimary">
                "The cosmos remembers you."
              </blockquote>
              <p className="mt-4 text-soul-textPrimary leading-relaxed whitespace-pre-wrap">
                {response.cosmos_line}
              </p>
            </div>
          )}

          {/* MAIA Chat (if any) */}
          {response.chat_messages.length > 0 && (
            <div className="bg-soul-surface border border-soul-border rounded-lg p-6">
              <h3 className="text-xl font-bold text-soul-textPrimary mb-4">
                💬 MAIA Chat ({response.chat_messages.length} messages)
              </h3>
              <p className="text-sm text-soul-textSecondary mb-4">
                Questions the partner asked during reflection (shows areas of uncertainty or curiosity)
              </p>
              <div className="space-y-3">
                {response.chat_messages.map((msg: any, i: number) => (
                  <div key={i} className="text-sm">
                    <div className="font-semibold text-soul-textPrimary">Q: {msg.question || msg.text}</div>
                    {msg.answer && <div className="text-soul-textSecondary ml-4 mt-1">A: {msg.answer}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preparation Notes */}
        <div className="mt-12 bg-gold-amber/10 border border-gold-amber/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gold-amber mb-4">📝 Preparation Notes</h3>
          <ul className="space-y-2 text-sm text-soul-textPrimary">
            <li>• Pay attention to <strong>Fire</strong> (what's calling) - the impulse and urgency</li>
            <li>• Notice <strong>Aether</strong> (what it IS) - the essence beyond function</li>
            <li>• Look for recurring themes across elements</li>
            <li>• What do they circle back to multiple times?</li>
            <li>• Where is there uncertainty vs clarity?</li>
          </ul>
          <p className="mt-4 text-xs italic text-soul-textSecondary">
            This is ceremony, not client intake. Listen for truth, not completion.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for element sections
function ElementSection({
  title,
  subtitle,
  emoji,
  color,
  responses,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  color: 'fire' | 'water' | 'earth' | 'air' | 'gold';
  responses: { question: string; answer: string | null }[];
}) {
  const colorMap = {
    fire: 'border-fire-base',
    water: 'border-water-base',
    earth: 'border-earth-base',
    air: 'border-air-base',
    gold: 'border-gold-amber',
  };

  return (
    <div className={`bg-soul-surface border ${colorMap[color]} rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h3 className="text-xl font-bold text-soul-textPrimary">{title}</h3>
          <p className="text-sm text-soul-textSecondary">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {responses.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-soul-textSecondary mb-2">{item.question}</p>
            {item.answer ? (
              <p className="text-soul-textPrimary leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-soul-border">
                {item.answer}
              </p>
            ) : (
              <p className="text-soul-textTertiary italic pl-4">No response</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
