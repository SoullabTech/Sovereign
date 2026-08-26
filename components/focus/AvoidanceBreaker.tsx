'use client';

/**
 * AVOIDANCE BREAKER
 *
 * The message you've been putting off + the follow-up you'll forget.
 *
 * This is the highest-leverage ADHD tool:
 * - Draft the awkward text/email
 * - Schedule the next touchpoint
 * - Close the loop
 *
 * Rules:
 * - Works in under 60 seconds
 * - Requires <3 choices
 * - Ends in a real-world action (message sent + calendar event)
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Mail, Calendar, CheckCircle, Sparkles, Copy, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type MessageType = 'text' | 'email';

interface AvoidanceBreakerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: AvoidanceResult) => void;
  context?: string; // What they're avoiding (from conversation)
  memberId?: string; // For stewardship weight tracking
}

export interface AvoidanceResult {
  messageType: MessageType;
  recipient: string;
  subject?: string; // For emails
  messageBody: string;
  followUpScheduled: boolean;
  followUpDate?: Date;
  sent: boolean;
  stewardship?: {
    threshold: 'none' | 'acknowledgment' | 'invitation' | 'pause';
    weeklyWeight: number;
    projectedWeight: number;
    tier: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const MESSAGE_STARTERS: Record<string, string[]> = {
  'late-reply': [
    "Hey, sorry for the delay—",
    "I know it's been a minute—",
    "Circling back on this—",
  ],
  'awkward-ask': [
    "I wanted to check in about—",
    "Quick question—",
    "Would you be open to—",
  ],
  'boundary': [
    "I've been thinking about this, and—",
    "I need to be honest about—",
    "I wanted to let you know—",
  ],
  'follow-up': [
    "Just wanted to follow up on—",
    "Checking in on—",
    "Any update on—",
  ],
};

const FOLLOW_UP_OPTIONS = [
  { label: 'In 3 days', getDays: () => 3 },
  { label: 'In a week', getDays: () => 7 },
  { label: 'In 2 weeks', getDays: () => 14 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function AvoidanceBreaker({
  isOpen,
  onClose,
  onComplete,
  context = '',
  memberId
}: AvoidanceBreakerProps) {
  const [phase, setPhase] = useState<'type' | 'who' | 'what' | 'draft' | 'followup' | 'done'>('type');
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [situation, setSituation] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  /* `stewardship` is an OPTIONAL field, so its type is `… | undefined` and
     never includes null. Seeding with null typechecked only while these
     components sat outside the ship program. */
  const [latestStewardship, setLatestStewardship] =
    useState<AvoidanceResult['stewardship']>(undefined);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPhase('type');
      setMessageType('text');
      setRecipient('');
      setSubject('');
      setSituation('');
      setMessageBody('');
      setSendError(null);
      setEmailSent(false);
    }
  }, [isOpen]);

  // Check Gmail connection status
  useEffect(() => {
    async function checkGmail() {
      try {
        // Use stored userId or default - in production this would come from auth
        const userId = localStorage.getItem('beta_user')
          ? JSON.parse(localStorage.getItem('beta_user') || '{}').email
          : 'anonymous';

        const response = await fetch(`/api/gmail/send?userId=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          setGmailConnected(data.connected);
          setGmailEmail(data.email);
        }
      } catch (err) {
        console.error('Gmail check error:', err);
      }
    }

    if (isOpen) {
      checkGmail();
    }
  }, [isOpen]);

  const handleTypeSelect = useCallback((type: MessageType) => {
    setMessageType(type);
    setPhase('who');
  }, []);

  const handleWhoSubmit = useCallback(() => {
    if (recipient.trim()) {
      setPhase('what');
    }
  }, [recipient]);

  const handleWhatSubmit = useCallback(async () => {
    if (situation.trim()) {
      setIsGenerating(true);

      // Call MAIA to draft the message
      try {
        const response = await fetch('/api/focus/draft-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageType,
            recipient,
            situation,
            context,
            memberId, // For stewardship weight tracking
          })
        });

        if (response.ok) {
          const data = await response.json();
          setMessageBody(data.draft || generateFallbackDraft());
          if (data.subject) setSubject(data.subject);
          if (data.stewardship) setLatestStewardship(data.stewardship);
        } else {
          setMessageBody(generateFallbackDraft());
        }
      } catch (err) {
        console.error('Draft generation error:', err);
        setMessageBody(generateFallbackDraft());
      }

      setIsGenerating(false);
      setPhase('draft');
    }
  }, [situation, messageType, recipient, context, memberId]);

  const generateFallbackDraft = () => {
    // Pick a random starter based on situation keywords
    let category = 'follow-up';
    const lower = situation.toLowerCase();
    if (lower.includes('late') || lower.includes('delay') || lower.includes('forgot')) {
      category = 'late-reply';
    } else if (lower.includes('ask') || lower.includes('need') || lower.includes('help')) {
      category = 'awkward-ask';
    } else if (lower.includes('no') || lower.includes('boundary') || lower.includes('honest')) {
      category = 'boundary';
    }

    const starters = MESSAGE_STARTERS[category];
    const starter = starters[Math.floor(Math.random() * starters.length)];
    return `${starter}\n\n[Your message here]`;
  };

  const handleRegenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/focus/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType,
          recipient,
          situation,
          context,
          regenerate: true,
          memberId, // For stewardship weight tracking
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessageBody(data.draft || messageBody);
      }
    } catch (err) {
      console.error('Regenerate error:', err);
    }
    setIsGenerating(false);
  }, [messageType, recipient, situation, context, messageBody]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [messageBody]);

  const handleSendViaGmail = useCallback(async () => {
    if (messageType !== 'email' || !gmailConnected) return;

    setIsSending(true);
    setSendError(null);

    try {
      const userId = localStorage.getItem('beta_user')
        ? JSON.parse(localStorage.getItem('beta_user') || '{}').email
        : 'anonymous';

      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          to: recipient, // Could be an email or a name - user should enter email
          subject: subject || `Message for ${recipient}`,
          body: messageBody,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        setPhase('followup');
      } else {
        setSendError(data.error || 'Failed to send email');
        if (data.needsReauth) {
          setSendError('Gmail permission needed. Please reconnect Google in settings.');
        }
      }
    } catch (err) {
      console.error('Gmail send error:', err);
      setSendError('Failed to send. Please try copying instead.');
    }

    setIsSending(false);
  }, [messageType, gmailConnected, recipient, subject, messageBody]);

  const handleDraftDone = useCallback(() => {
    setPhase('followup');
  }, []);

  const handleFollowUp = useCallback(async (getDays?: () => number) => {
    setIsProcessing(true);

    const followUpDate = getDays
      ? new Date(Date.now() + getDays() * 24 * 60 * 60 * 1000)
      : undefined;

    const result: AvoidanceResult = {
      messageType,
      recipient,
      subject: messageType === 'email' ? subject : undefined,
      messageBody,
      followUpScheduled: !!followUpDate,
      followUpDate,
      sent: emailSent // True if sent via Gmail
    };

    // Schedule the follow-up
    let stewardship = latestStewardship;
    if (followUpDate) {
      try {
        const response = await fetch('/api/focus/schedule-followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient,
            situation,
            followUpDate,
            originalMessage: messageBody,
            memberId, // For stewardship weight tracking
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.stewardship) {
            stewardship = data.stewardship;
          }
        }
      } catch (err) {
        console.error('Follow-up scheduling error:', err);
      }
    }

    setIsProcessing(false);
    setPhase('done');

    setTimeout(() => {
      onComplete?.({ ...result, stewardship });
      onClose();
    }, 1500);
  }, [messageType, recipient, subject, messageBody, situation, emailSent, latestStewardship, memberId, onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-gradient-to-b from-stone-900 to-stone-950
                     rounded-2xl border border-stone-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/50">
            <div className="flex items-center gap-2 text-rose-400/90">
              <Send className="w-5 h-5" />
              <span className="font-medium">Break the Avoidance</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300
                         hover:bg-stone-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {/* PHASE: TYPE */}
              {phase === 'type' && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-sm text-center">
                    What kind of message have you been avoiding?
                  </p>

                  <div className="grid gap-3">
                    <TypeButton
                      icon={<MessageSquare className="w-5 h-5" />}
                      label="A text"
                      description="To a person in my phone"
                      onClick={() => handleTypeSelect('text')}
                    />
                    <TypeButton
                      icon={<Mail className="w-5 h-5" />}
                      label="An email"
                      description="More formal, needs a subject"
                      onClick={() => handleTypeSelect('email')}
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE: WHO */}
              {phase === 'who' && (
                <motion.div
                  key="who"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-sm">
                    Who are you writing to?
                  </p>

                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWhoSubmit()}
                    placeholder="Name or relationship (e.g., Mom, my boss, Sarah)"
                    className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                               px-4 py-3 text-stone-100 placeholder:text-stone-500
                               focus:outline-none focus:border-rose-600/50 focus:ring-1 focus:ring-rose-600/30"
                    autoFocus
                  />

                  <button
                    onClick={handleWhoSubmit}
                    disabled={!recipient.trim()}
                    className="w-full py-3 rounded-xl font-medium transition-all
                               bg-rose-600/80 hover:bg-rose-600 text-white
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* PHASE: WHAT */}
              {phase === 'what' && (
                <motion.div
                  key="what"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-sm">
                    What's the situation? (I'll help you draft it.)
                  </p>

                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="e.g., I need to tell them I can't make it to the event..."
                    rows={3}
                    className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                               px-4 py-3 text-stone-100 placeholder:text-stone-500
                               focus:outline-none focus:border-rose-600/50 focus:ring-1 focus:ring-rose-600/30
                               resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleWhatSubmit}
                    disabled={!situation.trim() || isGenerating}
                    className="w-full py-3 rounded-xl font-medium transition-all
                               bg-rose-600/80 hover:bg-rose-600 text-white
                               disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Draft it for me
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* PHASE: DRAFT */}
              {phase === 'draft' && (
                <motion.div
                  key="draft"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-rose-300/90 text-sm font-medium">
                      To: {recipient}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="p-2 rounded-lg text-stone-500 hover:text-stone-300
                                   hover:bg-stone-800/50 transition-colors"
                        title="Try another version"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg text-stone-500 hover:text-stone-300
                                   hover:bg-stone-800/50 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {messageType === 'email' && (
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject line..."
                      className="w-full bg-stone-800/50 border border-stone-700/50 rounded-lg
                                 px-3 py-2 text-stone-100 placeholder:text-stone-500 text-sm
                                 focus:outline-none focus:border-rose-600/50"
                    />
                  )}

                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    rows={6}
                    className="w-full bg-stone-800/50 border border-stone-700/50 rounded-xl
                               px-4 py-3 text-stone-100 placeholder:text-stone-500
                               focus:outline-none focus:border-rose-600/50 focus:ring-1 focus:ring-rose-600/30
                               resize-none font-mono text-sm"
                  />

                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-400 text-sm text-center"
                    >
                      Copied to clipboard!
                    </motion.p>
                  )}

                  {sendError && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-amber-400 text-sm bg-amber-900/20
                                 border border-amber-700/30 rounded-lg px-3 py-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{sendError}</span>
                    </motion.div>
                  )}

                  {/* Gmail Send button for emails when connected */}
                  {messageType === 'email' && gmailConnected && (
                    <button
                      onClick={handleSendViaGmail}
                      disabled={isSending || !recipient.includes('@')}
                      className="w-full py-3 rounded-xl font-medium transition-all
                                 bg-blue-600/80 hover:bg-blue-600 text-white
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send via Gmail
                          {gmailEmail && (
                            <span className="text-blue-200/70 text-xs">({gmailEmail})</span>
                          )}
                        </>
                      )}
                    </button>
                  )}

                  {/* Hint for email address */}
                  {messageType === 'email' && gmailConnected && !recipient.includes('@') && (
                    <p className="text-stone-500 text-xs text-center">
                      Enter the recipient's email address above to send directly
                    </p>
                  )}

                  <button
                    onClick={handleDraftDone}
                    className={`w-full py-3 rounded-xl font-medium transition-all
                               ${messageType === 'email' && gmailConnected
                                 ? 'bg-stone-700/50 hover:bg-stone-700 text-stone-300'
                                 : 'bg-rose-600/80 hover:bg-rose-600 text-white'}`}
                  >
                    {messageType === 'email' && gmailConnected
                      ? "I'll copy and send myself"
                      : "I'll send this"}
                  </button>
                </motion.div>
              )}

              {/* PHASE: FOLLOWUP */}
              {phase === 'followup' && (
                <motion.div
                  key="followup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-stone-300 text-center text-sm">
                    Want a reminder to follow up if they don't respond?
                  </p>

                  <div className="grid gap-3">
                    {FOLLOW_UP_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleFollowUp(opt.getDays)}
                        disabled={isProcessing}
                        className="w-full p-4 rounded-xl text-left
                                   bg-stone-800/30 border border-stone-700/30
                                   hover:bg-stone-800/60 hover:border-rose-600/30
                                   transition-all flex items-center gap-3
                                   disabled:opacity-50"
                      >
                        <Calendar className="w-5 h-5 text-rose-400/70" />
                        <span className="text-stone-200">{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleFollowUp()}
                    disabled={isProcessing}
                    className="w-full py-2 text-stone-500 hover:text-stone-300 text-sm"
                  >
                    No thanks, I'm done
                  </button>
                </motion.div>
              )}

              {/* PHASE: DONE */}
              {phase === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <CheckCircle className={`w-12 h-12 mx-auto ${emailSent ? 'text-emerald-400' : 'text-rose-400'}`} />
                  </motion.div>
                  {emailSent ? (
                    <>
                      <p className="text-emerald-300">Email sent!</p>
                      <p className="text-stone-500 text-sm">One less thing on your mind.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-stone-300">The loop is closing.</p>
                      <p className="text-stone-500 text-sm">Now paste and send.</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function TypeButton({
  icon,
  label,
  description,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 rounded-xl text-left
                 bg-stone-800/30 border border-stone-700/30
                 hover:bg-stone-800/60 hover:border-rose-600/30
                 transition-all"
    >
      <div className="p-2 rounded-lg bg-stone-700/50 text-rose-400/80">
        {icon}
      </div>
      <div>
        <p className="font-medium text-stone-200">{label}</p>
        <p className="text-sm text-stone-500">{description}</p>
      </div>
    </button>
  );
}

export default AvoidanceBreaker;
