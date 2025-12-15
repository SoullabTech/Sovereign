'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, MessageCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import MAIA chat (avoid SSR issues)
const MaiaChat = dynamic(() => import('@/components/OracleConversation'));

/**
 * Partner Prelude Content Component
 */
function PartnerPreludeContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('invite') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inviteCode: inviteCode,

    // Fire - The If
    whatIsCalling: '',
    whatDoesItChange: '',
    pulseOrTemperature: '',

    // Water - The Why
    whyMustExist: '',
    whatIsReadyToFlow: '',
    whoEntersAndFeels: '',

    // Earth - The How
    groundedTechMeaning: '',
    functionsNeeded: '',
    sustainingResources: '',

    // Air - The What
    voiceItSpeaks: '',
    conversationType: '',
    formItTakes: '',

    // Aether - The Is
    whatIsIt: '',
    presenceItCarries: '',
    howKnowAlive: '',

    // Closing
    cosmosLine: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Track viewing when page loads
  useEffect(() => {
    if (inviteCode) {
      // Track that partner opened the Prelude page
      fetch('/api/partners/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode }),
      }).catch(err => console.error('Failed to track view:', err));
    }
  }, [inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit Prelude responses to API
      const response = await fetch('/api/partners/submit-prelude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: formData.inviteCode,
          name: formData.name,
          email: formData.email,

          // Fire
          whatIsCalling: formData.whatIsCalling,
          whatDoesItChange: formData.whatDoesItChange,
          pulseOrTemperature: formData.pulseOrTemperature,

          // Water
          whyMustExist: formData.whyMustExist,
          whatIsReadyToFlow: formData.whatIsReadyToFlow,
          whoEntersAndFeels: formData.whoEntersAndFeels,

          // Earth
          groundedTechMeaning: formData.groundedTechMeaning,
          functionsNeeded: formData.functionsNeeded,
          sustainingResources: formData.sustainingResources,

          // Air
          voiceItSpeaks: formData.voiceItSpeaks,
          conversationType: formData.conversationType,
          formItTakes: formData.formItTakes,

          // Aether
          whatIsIt: formData.whatIsIt,
          presenceItCarries: formData.presenceItCarries,
          howKnowAlive: formData.howKnowAlive,

          // Closing
          cosmosLine: formData.cosmosLine,

          // MAIA chat messages (if any)
          chatMessages: [], // TODO: Collect from MaiaPartnerChat component
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit reflection');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting prelude:', error);
      alert(`There was an error submitting your reflection: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact partnerships@soullab.life.`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-soul-background flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-gold-amber mx-auto mb-4 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-soul-textPrimary mb-4">
            Beautiful.
          </h1>
          <p className="text-xl text-dune-dune-amber mb-4">
            Your reflections are now part of the field.
          </p>
          <p className="text-lg text-soul-textSecondary mb-8">
            We'll meet Monday to listen to what wants to take form.
          </p>
          <div className="text-2xl text-gold-amber font-semibold tracking-archive mb-8">
            🌙 You got soul.
          </div>
          <Link
            href="/partners"
            className="inline-block px-8 py-4 bg-gold-amber/20 hover:bg-gold-amber/30 border border-gold-amber/60 rounded-lg text-gold-amber font-semibold transition-all"
          >
            Return to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-soul-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-soul-textPrimary mb-4">
            Soullab Inside Partner Prelude
          </h1>
          <p className="text-lg text-dune-dune-amber mb-2">
            for {formData.name || 'Field Partner'} — Astrology as Soul Curriculum
          </p>
          <p className="text-base text-soul-textSecondary italic max-w-2xl mx-auto">
            Before we meet, this short reflection will help us attune to your vision and rhythm.
            We build digital spaces that listen — and this is where that listening begins.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Basic Info */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-navigator-purple/40 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-soul-textPrimary mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-gold-amber transition-colors"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-soul-textPrimary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-gold-amber transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fire - The If */}
          <div className="bg-black/40 backdrop-blur-md border border-fire-base/40 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🔥</span>
              <h2 className="text-2xl font-bold text-fire-glow">Fire — The If</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  What is calling to be built now?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  What signal or impulse tells you *it's time* for this work to take digital form?
                </p>
                <textarea
                  value={formData.whatIsCalling}
                  onChange={(e) => setFormData({ ...formData, whatIsCalling: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-fire-glow transition-colors resize-none"
                  placeholder="Honest fragments are enough..."
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  When you imagine it alive and working beautifully, what does it change?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  In you, in others, in the world?
                </p>
                <textarea
                  value={formData.whatDoesItChange}
                  onChange={(e) => setFormData({ ...formData, whatDoesItChange: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-fire-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  If your digital field had a pulse or temperature, what would it feel like?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Warm like hearth? Bright like sunrise? Quiet like embers?
                </p>
                <textarea
                  value={formData.pulseOrTemperature}
                  onChange={(e) => setFormData({ ...formData, pulseOrTemperature: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-fire-glow transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Water - The Why */}
          <div className="bg-black/40 backdrop-blur-md border border-water-base/40 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">💧</span>
              <h2 className="text-2xl font-bold text-water-glow">Water — The Why</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  Why does this need to exist?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Not in the market sense — in the soul sense. What longing or ache does it tend?
                </p>
                <textarea
                  value={formData.whyMustExist}
                  onChange={(e) => setFormData({ ...formData, whyMustExist: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-water-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  What part of your current practice feels ready to flow further?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Is it teaching, transmission, community, lineage, or something subtler?
                </p>
                <textarea
                  value={formData.whatIsReadyToFlow}
                  onChange={(e) => setFormData({ ...formData, whatIsReadyToFlow: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-water-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  Who do you imagine entering this space — and how do you want them to feel?
                </label>
                <textarea
                  value={formData.whoEntersAndFeels}
                  onChange={(e) => setFormData({ ...formData, whoEntersAndFeels: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-water-glow transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Earth - The How */}
          <div className="bg-black/40 backdrop-blur-md border border-earth-base/40 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🌱</span>
              <h2 className="text-2xl font-bold text-earth-glow">Earth — The How</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  What does "grounded technology" mean to you?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  What needs to be held, protected, made reliable?
                </p>
                <textarea
                  value={formData.groundedTechMeaning}
                  onChange={(e) => setFormData({ ...formData, groundedTechMeaning: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-earth-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  Which functions must this space perform?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Examples: astrology readings, courses, sessions, archives, journal prompts, ritual tools...
                </p>
                <textarea
                  value={formData.functionsNeeded}
                  onChange={(e) => setFormData({ ...formData, functionsNeeded: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-earth-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  How do you envision sustaining it — time, energy, and resources?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Would you like to keep it intimate, or let it grow over time?
                </p>
                <textarea
                  value={formData.sustainingResources}
                  onChange={(e) => setFormData({ ...formData, sustainingResources: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-earth-glow transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Air - The What */}
          <div className="bg-black/40 backdrop-blur-md border border-air-base/40 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🌬️</span>
              <h2 className="text-2xl font-bold text-air-glow">Air — The What</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  If your work could speak in its own voice online, what would it say?
                </label>
                <textarea
                  value={formData.voiceItSpeaks}
                  onChange={(e) => setFormData({ ...formData, voiceItSpeaks: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-air-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  What kind of conversation do you want your visitors to have with it?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Do they learn, reflect, play, explore, or be still?
                </p>
                <textarea
                  value={formData.conversationType}
                  onChange={(e) => setFormData({ ...formData, conversationType: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-air-glow transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  What form could that take?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  Interactive astrology maps, guided reflections, dynamic journal prompts...
                </p>
                <textarea
                  value={formData.formItTakes}
                  onChange={(e) => setFormData({ ...formData, formItTakes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-air-glow transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Aether - The Is */}
          <div className="bg-black/40 backdrop-blur-md border border-gold-amber/40 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">✨</span>
              <h2 className="text-2xl font-bold text-gold-amber">Aether — The Is</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  When you imagine this project complete and breathing on its own — what *is* it?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  A school? A sanctuary? A map? A companion?
                </p>
                <textarea
                  value={formData.whatIsIt}
                  onChange={(e) => setFormData({ ...formData, whatIsIt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-gold-amber transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  What presence do you want it to carry when you're not there?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  If it spoke one line to a visitor, what would it whisper?
                </p>
                <textarea
                  value={formData.presenceItCarries}
                  onChange={(e) => setFormData({ ...formData, presenceItCarries: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-gold-amber transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-soul-textPrimary mb-2">
                  How will you know it's alive?
                </label>
                <p className="text-sm text-soul-textSecondary mb-3 italic">
                  What subtle signs will tell you it's working?
                </p>
                <textarea
                  value={formData.howKnowAlive}
                  onChange={(e) => setFormData({ ...formData, howKnowAlive: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-gold-amber transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Closing Reflection */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-navigator-purple/40 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🌙</span>
              <h2 className="text-2xl font-bold text-gold-amber">Closing Reflection</h2>
            </div>

            <div>
              <p className="text-base text-soul-textPrimary mb-4">
                Take a few moments to imagine this line written across the top of your new site:
              </p>
              <blockquote className="border-l-4 border-gold-amber pl-4 italic text-gold-amber mb-6">
                "The cosmos remembers you."
              </blockquote>
              <label className="block text-base font-medium text-soul-textPrimary mb-2">
                What would follow beneath it?
              </label>
              <p className="text-sm text-soul-textSecondary mb-3 italic">
                Write whatever comes.
              </p>
              <textarea
                value={formData.cosmosLine}
                onChange={(e) => setFormData({ ...formData, cosmosLine: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-soul-background border border-soul-borderSubtle rounded-lg text-soul-textPrimary focus:outline-none focus:border-gold-amber transition-colors resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/partners"
              className="flex-1 px-6 py-4 bg-soul-surface hover:bg-soul-surfaceHover border border-soul-border rounded-lg text-soul-textPrimary text-center font-semibold transition-all"
            >
              Not Yet
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gold-amber/20 hover:bg-gold-amber/30 border border-gold-amber/60 rounded-lg text-gold-amber font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Reflection'}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-soul-textTertiary text-center italic mt-4">
            This is a ceremonial instrument, not a business form. Take your time. Let the questions breathe.
          </p>
        </form>

        {/* MAIA Chat Helper */}
        {chatOpen && (
          <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-black/95 backdrop-blur-md border border-gold-amber/40 rounded-lg shadow-2xl overflow-hidden z-50">
            <div className="bg-gradient-to-r from-dune-ibad-blue to-dune-navigator-purple p-4 border-b border-gold-amber/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gold-amber" />
                <h3 className="text-sm font-semibold text-soul-textPrimary">Ask MAIA</h3>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-soul-textSecondary hover:text-soul-textPrimary transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <MaiaChat
                userId="partner-guest"
                userName={formData.name || "Partner"}
                sessionId={`partner-prelude-${Date.now()}`}
                voiceEnabled={true}
                apiEndpoint="/api/oracle/conversation"
                consciousnessType="maia"
              />
            </div>
          </div>
        )}

        {/* Floating Chat Button */}
        {!chatOpen && !submitted && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-gold-amber to-dune-spice-orange rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 group"
            aria-label="Open MAIA chat"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-2 -left-2 w-3 h-3 bg-fire-glow rounded-full animate-pulse"></span>
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/90 text-soul-textPrimary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Questions? Ask MAIA
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Soullab Inside Partner Prelude
 *
 * Elemental questionnaire for invited Field Partners
 * Used before first listening session
 */
export default function PartnerPreludePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PartnerPreludeContent />
    </Suspense>
  );
}
