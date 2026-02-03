'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Loader2,
  Copy,
  Check,
  Save,
  RefreshCw,
} from 'lucide-react';

type ContentType = 'email' | 'social' | 'nurture_sequence' | 'transit_alert';
type Platform = 'instagram' | 'facebook' | 'linkedin' | 'twitter';
type ContentPillar = 'educational' | 'inspirational' | 'promotional' | 'personal' | 'seasonal';

interface GeneratedEmail {
  subject: string;
  preview_text: string;
  body: string;
}

interface GeneratedSocial {
  content_text: string;
  hashtags: string[];
  notes?: string;
}

interface GeneratedSequence {
  emails: Array<{
    order: number;
    timing: string;
    subject: string;
    preview_text: string;
    body: string;
  }>;
}

// Mock generated content
const mockSocialContent: GeneratedSocial = {
  content_text: `The stars don't just tell your story—they illuminate the path forward.

When Mercury enters Pisces this week, our minds become more intuitive, more poetic, more connected to the unseen.

This is the time to:
- Trust your gut feelings
- Journal your dreams
- Have those heart-to-heart conversations you've been putting off

How are you feeling this Mercury transit?`,
  hashtags: ['#astrology', '#mercuryinpisces', '#cosmicguidance', '#intuition', '#soulgrowth'],
  notes: 'Best posted in the evening when engagement peaks for spiritual content.',
};

const mockEmailContent: GeneratedEmail = {
  subject: 'The cosmic shift you need to know about',
  preview_text: 'Mercury enters Pisces and everything changes...',
  body: `Dear soul,

Something magical is happening in the cosmos this week, and I wanted to make sure you heard about it from me first.

Mercury—the planet of communication and thought—is swimming into the dreamy waters of Pisces. This happens once a year, and it's one of my favorite transits to work with.

Here's what this means for you:

Your intuition is about to get a major upgrade. Those gut feelings? They're actually cosmic downloads. Trust them.

Communication becomes more poetic, more heart-centered. This is the perfect time for meaningful conversations, creative writing, or finally expressing what you've been holding back.

Dreams may become more vivid. Keep a journal by your bed—your subconscious has messages for you.

If you've been feeling called to explore your birth chart more deeply, this is an auspicious time to begin. I have a few openings for readings next week.

With cosmic love,
[Your name]

P.S. Reply to this email and tell me: what's the first thing that comes to mind when you think about trusting your intuition more?`,
};

export default function GeneratePage() {
  const router = useRouter();

  const [contentType, setContentType] = useState<ContentType>('social');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<
    GeneratedEmail | GeneratedSocial | GeneratedSequence | null
  >(null);

  // Form state
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [contentPillar, setContentPillar] = useState<ContentPillar>('educational');
  const [emailCategory, setEmailCategory] = useState('newsletter');
  const [targetAudience, setTargetAudience] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [sequenceLength, setSequenceLength] = useState(5);
  const [transitContext, setTransitContext] = useState({
    planet: '',
    sign: '',
    aspect: '',
    dates: '',
  });
  const [additionalContext, setAdditionalContext] = useState('');

  const contentTypes: Array<{ value: ContentType; label: string; icon: React.ReactNode }> = [
    { value: 'social', label: 'Social Post', icon: <Instagram className="w-4 h-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'nurture_sequence', label: 'Email Sequence', icon: <Mail className="w-4 h-4" /> },
    { value: 'transit_alert', label: 'Transit Alert', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const platforms: Array<{ value: Platform; label: string; icon: React.ReactNode }> = [
    { value: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { value: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
    { value: 'twitter', label: 'Twitter/X', icon: <Twitter className="w-4 h-4" /> },
  ];

  const pillars: Array<{ value: ContentPillar; label: string }> = [
    { value: 'educational', label: 'Educational' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'personal', label: 'Personal/Story' },
    { value: 'seasonal', label: 'Seasonal/Transit' },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedContent(null);

    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (contentType === 'social') {
      setGeneratedContent(mockSocialContent);
    } else if (contentType === 'email' || contentType === 'transit_alert') {
      setGeneratedContent(mockEmailContent);
    } else if (contentType === 'nurture_sequence') {
      setGeneratedContent({
        emails: Array.from({ length: sequenceLength }, (_, i) => ({
          order: i + 1,
          timing: i === 0 ? 'Immediately' : `Day ${i * 2}`,
          subject: `Email ${i + 1}: ${topic || 'Your journey continues'}`,
          preview_text: 'Continue your transformation...',
          body: `This is email ${i + 1} of your nurture sequence about ${topic || 'spiritual growth'}...`,
        })),
      });
    }

    setGenerating(false);
  };

  const handleSave = async () => {
    if (!generatedContent) return;
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleCopy = async () => {
    if (!generatedContent) return;

    let textToCopy = '';

    if ('content_text' in generatedContent) {
      textToCopy = generatedContent.content_text;
      if (generatedContent.hashtags?.length) {
        textToCopy += '\n\n' + generatedContent.hashtags.join(' ');
      }
    } else if ('body' in generatedContent) {
      textToCopy = `Subject: ${generatedContent.subject}\n\n${generatedContent.body}`;
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white">Generate Content</h1>
          <p className="text-sm text-slate-500">MAIA writes in your voice</p>
        </div>
      </div>

      {/* Content Type Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {contentTypes.map(type => (
          <button
            key={type.value}
            onClick={() => {
              setContentType(type.value);
              setGeneratedContent(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              contentType === type.value
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800/30 text-slate-400 hover:text-slate-200 border border-slate-700/30'
            }`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl mb-6">
        <div className="p-4 border-b border-slate-800/50">
          <h2 className="text-sm font-medium text-slate-300 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
            Generate {contentTypes.find(t => t.value === contentType)?.label}
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Topic / Theme
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="What do you want to write about?"
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* Platform Selection (for social) */}
          {contentType === 'social' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                        platform === p.value
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-800/50 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Content Pillar
                </label>
                <select
                  value={contentPillar}
                  onChange={e => setContentPillar(e.target.value as ContentPillar)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  {pillars.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Email Category (for email) */}
          {contentType === 'email' && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Email Type
              </label>
              <select
                value={emailCategory}
                onChange={e => setEmailCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
              >
                <option value="newsletter">Newsletter</option>
                <option value="nurture">Nurture</option>
                <option value="promo">Promotional</option>
                <option value="follow_up">Follow-up</option>
                <option value="welcome">Welcome</option>
              </select>
            </div>
          )}

          {/* Sequence Length (for nurture sequence) */}
          {contentType === 'nurture_sequence' && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Number of Emails
              </label>
              <input
                type="number"
                value={sequenceLength}
                onChange={e => setSequenceLength(parseInt(e.target.value) || 5)}
                min={3}
                max={10}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          )}

          {/* Transit Context (for transit alert) */}
          {contentType === 'transit_alert' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Planet</label>
                <input
                  type="text"
                  value={transitContext.planet}
                  onChange={e => setTransitContext({ ...transitContext, planet: e.target.value })}
                  placeholder="e.g., Mercury"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Sign</label>
                <input
                  type="text"
                  value={transitContext.sign}
                  onChange={e => setTransitContext({ ...transitContext, sign: e.target.value })}
                  placeholder="e.g., Retrograde in Pisces"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Aspect</label>
                <input
                  type="text"
                  value={transitContext.aspect}
                  onChange={e => setTransitContext({ ...transitContext, aspect: e.target.value })}
                  placeholder="e.g., square Neptune"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Dates</label>
                <input
                  type="text"
                  value={transitContext.dates}
                  onChange={e => setTransitContext({ ...transitContext, dates: e.target.value })}
                  placeholder="e.g., Jan 20 - Feb 10"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Target Audience (optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="Who is this for?"
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* Call to Action */}
          {(contentType === 'email' || contentType === 'nurture_sequence') && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Call to Action (optional)
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={e => setCallToAction(e.target.value)}
                placeholder="What do you want them to do?"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          )}

          {/* Additional Context */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Additional Context (optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              placeholder="Any other details to include..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating in your voice...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate with MAIA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#1e1e38] border border-amber-500/20 rounded-xl"
          >
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">Generated Content</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  className="p-2 text-slate-400 hover:text-slate-200"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-slate-200"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              {/* Social content */}
              {'content_text' in generatedContent && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-200 whitespace-pre-wrap">
                      {generatedContent.content_text}
                    </p>
                  </div>
                  {generatedContent.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {generatedContent.notes && (
                    <div className="text-sm text-slate-500 italic">
                      {generatedContent.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Email content */}
              {'subject' in generatedContent && 'body' in generatedContent && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Subject</div>
                    <div className="text-slate-200 font-medium">
                      {generatedContent.subject}
                    </div>
                  </div>
                  {generatedContent.preview_text && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Preview</div>
                      <div className="text-slate-400 text-sm">
                        {generatedContent.preview_text}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Body</div>
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <p className="text-slate-200 whitespace-pre-wrap">
                        {generatedContent.body}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email sequence */}
              {'emails' in generatedContent && (
                <div className="space-y-6">
                  {generatedContent.emails.map((email, index) => (
                    <div key={index} className="border border-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-amber-400">
                          Email {email.order}: {email.timing}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-slate-500">Subject</div>
                          <div className="text-slate-200">{email.subject}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Body</div>
                          <div className="p-3 bg-slate-900/50 rounded text-slate-300 text-sm whitespace-pre-wrap">
                            {email.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
