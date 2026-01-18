"use client";

/**
 * CONTENT GENERATOR COMPONENT
 *
 * MAIA-powered content creation in your voice
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
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
  ChevronDown,
} from 'lucide-react';

type ContentType = 'email' | 'social' | 'nurture_sequence' | 'transit_alert';
type Platform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'threads';
type ContentPillar = 'educational' | 'inspirational' | 'promotional' | 'personal' | 'seasonal';

interface ContentGeneratorProps {
  practitionerId: string;
  onSaved?: () => void;
}

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

export default function ContentGenerator({
  practitionerId,
  onSaved,
}: ContentGeneratorProps) {
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

    try {
      const response = await fetch('/api/stellium/maia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          type: contentType,
          topic,
          platform: contentType === 'social' ? platform : undefined,
          contentPillar: contentType === 'social' ? contentPillar : undefined,
          emailCategory: contentType === 'email' ? emailCategory : undefined,
          targetAudience,
          callToAction,
          sequenceLength: contentType === 'nurture_sequence' ? sequenceLength : undefined,
          transitContext: contentType === 'transit_alert' ? transitContext : undefined,
          additionalContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    setSaving(true);
    try {
      const response = await fetch('/api/stellium/maia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          type: contentType,
          topic,
          platform: contentType === 'social' ? platform : undefined,
          contentPillar: contentType === 'social' ? contentPillar : undefined,
          emailCategory: contentType === 'email' ? emailCategory : undefined,
          targetAudience,
          callToAction,
          transitContext: contentType === 'transit_alert' ? transitContext : undefined,
          additionalContext,
          save: true,
        }),
      });

      if (response.ok) {
        onSaved?.();
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
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
    <div className="space-y-6">
      {/* Content Type Selection */}
      <div className="flex flex-wrap gap-2">
        {contentTypes.map(type => (
          <button
            key={type.value}
            onClick={() => {
              setContentType(type.value);
              setGeneratedContent(null);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              contentType === type.value
                ? 'bg-sacred-gold/20 text-sacred-gold border border-sacred-gold/30'
                : 'bg-gray-800/30 text-gray-400 hover:text-gray-200 border border-gray-700/30'
            }`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-gray-300 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-sacred-gold" />
            Generate {contentTypes.find(t => t.value === contentType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Topic / Theme
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="What do you want to write about?"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
            />
          </div>

          {/* Platform Selection (for social) */}
          {contentType === 'social' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
                        platform === p.value
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Content Pillar
                </label>
                <select
                  value={contentPillar}
                  onChange={e => setContentPillar(e.target.value as ContentPillar)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
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
              <label className="block text-sm text-gray-400 mb-2">
                Email Type
              </label>
              <select
                value={emailCategory}
                onChange={e => setEmailCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
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
              <label className="block text-sm text-gray-400 mb-2">
                Number of Emails
              </label>
              <input
                type="number"
                value={sequenceLength}
                onChange={e => setSequenceLength(parseInt(e.target.value) || 5)}
                min={3}
                max={10}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
          )}

          {/* Transit Context (for transit alert) */}
          {contentType === 'transit_alert' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Planet</label>
                <input
                  type="text"
                  value={transitContext.planet}
                  onChange={e => setTransitContext({ ...transitContext, planet: e.target.value })}
                  placeholder="e.g., Mercury"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sign</label>
                <input
                  type="text"
                  value={transitContext.sign}
                  onChange={e => setTransitContext({ ...transitContext, sign: e.target.value })}
                  placeholder="e.g., Retrograde in Pisces"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Aspect</label>
                <input
                  type="text"
                  value={transitContext.aspect}
                  onChange={e => setTransitContext({ ...transitContext, aspect: e.target.value })}
                  placeholder="e.g., square Neptune"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dates</label>
                <input
                  type="text"
                  value={transitContext.dates}
                  onChange={e => setTransitContext({ ...transitContext, dates: e.target.value })}
                  placeholder="e.g., Jan 20 - Feb 10"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Target Audience */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Target Audience (optional)
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="Who is this for?"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
            />
          </div>

          {/* Call to Action */}
          {(contentType === 'email' || contentType === 'nurture_sequence') && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Call to Action (optional)
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={e => setCallToAction(e.target.value)}
                placeholder="What do you want them to do?"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
              />
            </div>
          )}

          {/* Additional Context */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Additional Context (optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              placeholder="Any other details to include..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg disabled:opacity-50 transition-colors"
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
        </CardContent>
      </Card>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gray-900/50 backdrop-blur-xl border-sacred-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-300">Generated Content</CardTitle>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleGenerate}
                      className="p-2 text-gray-400 hover:text-gray-200"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-400 hover:text-gray-200"
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
                      className="flex items-center space-x-1 px-3 py-1.5 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg text-sm"
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
              </CardHeader>
              <CardContent>
                {/* Render based on content type */}
                {'content_text' in generatedContent && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-200 whitespace-pre-wrap">
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
                      <div className="text-sm text-gray-500 italic">
                        {generatedContent.notes}
                      </div>
                    )}
                  </div>
                )}

                {'subject' in generatedContent && 'body' in generatedContent && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Subject</div>
                      <div className="text-gray-200 font-medium">
                        {generatedContent.subject}
                      </div>
                    </div>
                    {generatedContent.preview_text && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Preview</div>
                        <div className="text-gray-400 text-sm">
                          {generatedContent.preview_text}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Body</div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-200 whitespace-pre-wrap">
                          {generatedContent.body}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {'emails' in generatedContent && (
                  <div className="space-y-6">
                    {generatedContent.emails.map((email, index) => (
                      <div key={index} className="border border-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-sacred-gold">
                            Email {email.order}: {email.timing}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-500">Subject</div>
                            <div className="text-gray-200">{email.subject}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Body</div>
                            <div className="p-3 bg-gray-800/50 rounded text-gray-300 text-sm whitespace-pre-wrap">
                              {email.body}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
