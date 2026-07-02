'use client';

/**
 * Practice Field Editor — Beta Scope
 *
 * Interview model: practitioners answer reflective questions, not configuration panels.
 * Their answers become the field.
 *
 * Beta layers:
 *   Layer 1 (required): welcome_message, welcome_video_url, about_practice
 *   Layer 2 (required for LIVE): how_we_work_together, how_maia_supports, professional_practice, orientation_style
 *   Layer 3 (optional): resources list
 *   Layer 4 (Adaptive Guidance): deferred — observe demand first
 *
 * Spec: docs/specs/PRACTICE_FIELD_SPEC.md
 */

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { MirrorFieldAssist } from './MirrorFieldAssist';
import type { PracticeField, PracticeFieldStatus, OrientationStyle } from '@/lib/types/practiceField';

type EditorSection = 'identity' | 'relationship' | 'practice' | 'invite';

const STATUS_COLORS: Record<PracticeFieldStatus, string> = {
  pending: 'text-amber-500',
  warning: 'text-orange-400',
  live: 'text-emerald-400',
};

const STATUS_LABELS: Record<PracticeFieldStatus, string> = {
  pending: 'PENDING — complete required sections to invite clients',
  warning: 'WARNING — review required',
  live: 'LIVE',
};

const ORIENTATION_LABELS: Record<OrientationStyle, string> = {
  minimal: 'Minimal — Welcome message. Begin.',
  guided: 'Guided — Welcome, brief introduction, one recommended first step.',
  relationship_first: 'Relationship-first — Welcome, then how you accompany people.',
  tour: 'Tour — Welcome, orientation to shared space and features.',
};

export function PracticeFieldEditor() {
  const [field, setField] = useState<PracticeField | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<EditorSection>('identity');
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadField();
  }, []);

  async function loadField() {
    try {
      const res = await apiFetch('/api/practitioner/practice-field');
      const json = await res.json();
      setField(json.field ?? {
        welcome_message: null, welcome_video_url: null, about_practice: null,
        how_we_work_together: null, how_maia_supports: null, professional_practice: null,
        orientation_style: 'guided', resources: [], active_field_content: null,
        status: 'pending', status_reason: null,
      } as Partial<PracticeField> as PracticeField);
    } catch (err) {
      setError('Unable to load your Practice Field.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(key: keyof PracticeField, value: any) {
    setField(prev => prev ? { ...prev, [key]: value } : prev);
    scheduleSave();
  }

  function scheduleSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveField, 1500);
  }

  async function saveField() {
    if (!field) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiFetch('/api/practitioner/practice-field', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcome_message: field.welcome_message,
          welcome_video_url: field.welcome_video_url,
          about_practice: field.about_practice,
          how_we_work_together: field.how_we_work_together,
          how_maia_supports: field.how_maia_supports,
          professional_practice: field.professional_practice,
          orientation_style: field.orientation_style,
          resources: field.resources,
          active_field_content: field.active_field_content,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setField(json.field);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    finally { setSaving(false); }
  }

  async function sendInvitation() {
    if (!clientEmail) return;
    setInviting(true);
    setInviteResult(null);
    try {
      const res = await apiFetch('/api/practitioner/practice-field/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_email: clientEmail, client_name: clientName }),
      });
      const json = await res.json();
      if (res.ok) {
        setInviteResult({ success: true, message: `Invitation sent to ${clientEmail}` });
        setClientEmail('');
        setClientName('');
      } else {
        setInviteResult({ success: false, message: json.error || json.status_reason || 'Failed to send.' });
      }
    } catch (err: any) {
      setInviteResult({ success: false, message: err.message });
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return <div className="text-stone-500 text-sm font-light p-8">Opening your Practice Field…</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm p-8">{error}</div>;
  }

  const status = (field?.status ?? 'pending') as PracticeFieldStatus;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-stone-500">Practice Field</p>
          <p className={`text-xs font-light ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </p>
          {field?.status_reason && status === 'pending' && (
            <p className="text-stone-600 text-xs">{field.status_reason}</p>
          )}
        </div>
        <div className="text-right">
          {saving && <p className="text-stone-600 text-xs">Saving…</p>}
          {saved && <p className="text-emerald-600 text-xs">Saved</p>}
        </div>
      </div>

      {/* Nav */}
      <div className="flex gap-4 border-b border-stone-800 pb-0">
        {(['identity', 'relationship', 'practice', 'invite'] as EditorSection[]).map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`pb-3 text-xs uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              section === s
                ? 'text-stone-200 border-stone-400'
                : 'text-stone-600 border-transparent hover:text-stone-400'
            }`}
          >
            {s === 'identity' ? 'Who I Am' :
             s === 'relationship' ? 'How We Work' :
             s === 'practice' ? 'My Practice' :
             'Invite Client'}
          </button>
        ))}
      </div>

      {/* ── Layer 1: Identity ── */}
      {section === 'identity' && (
        <div className="space-y-8">
          <InterviewQuestion
            question="Write a welcome message for clients arriving in your shared space."
            hint="This is the first thing they'll read. You can speak directly, or let MAIA carry your voice — 'Kelly asked me, Maia, to share something with you about us…'"
            required
          >
            <Textarea
              value={field?.welcome_message ?? ''}
              onChange={v => updateField('welcome_message', v)}
              rows={5}
              placeholder={`Kelly asked me, Maia, to share something with you about us…\n\nThis space was built for the work you and Kelly are doing together. What you bring here is yours. MAIA holds it with care, and Kelly has shaped how it shows up for you.`}
            />
            <MirrorFieldAssist fieldKey="welcome_message" currentValue={field?.welcome_message ?? ''} onAccept={v => updateField('welcome_message', v)} />
          </InterviewQuestion>

          <InterviewQuestion
            question="How do you understand the work you do?"
            hint="Your modality, philosophy, or how you think about the work — in your own words. Clients will see this on the threshold screen."
          >
            <Textarea
              value={field?.about_practice ?? ''}
              onChange={v => updateField('about_practice', v)}
              rows={4}
              placeholder="I work with EFT (Emotional Freedom Techniques) to help people release stuck patterns…"
            />
            <MirrorFieldAssist fieldKey="about_practice" currentValue={field?.about_practice ?? ''} onAccept={v => updateField('about_practice', v)} />
          </InterviewQuestion>

          <InterviewQuestion
            question="Welcome video URL (optional)"
            hint="A Loom, YouTube, or Vimeo link introducing yourself to new clients."
          >
            <input
              type="url"
              value={field?.welcome_video_url ?? ''}
              onChange={e => updateField('welcome_video_url', e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-stone-500 rounded"
              placeholder="https://loom.com/share/..."
            />
          </InterviewQuestion>
        </div>
      )}

      {/* ── Layer 2: Relationship ── */}
      {section === 'relationship' && (
        <div className="space-y-8">

          <InterviewQuestion
            question="How do you and your clients work together between sessions?"
            hint={`"When I read reflections, how I use messages, what I want clients to bring here vs. save for our session, my response rhythm." This becomes the relational operating agreement MAIA holds as context.`}
            required
          >
            <Textarea
              value={field?.how_we_work_together ?? ''}
              onChange={v => updateField('how_we_work_together', v)}
              rows={7}
              placeholder={`I read reflections before each session, so you'll find it useful to capture what's been alive for you in between.\n\nMessages here reach me between sessions — I aim to respond within 24 hours. If something feels urgent, please contact me directly.\n\nWhat you bring here is yours. I don't share what I see without your explicit permission.`}
            />
            <MirrorFieldAssist fieldKey="how_we_work_together" currentValue={field?.how_we_work_together ?? ''} onAccept={v => updateField('how_we_work_together', v)} />
          </InterviewQuestion>

          <InterviewQuestion
            question="How does MAIA support the work you and your clients do together?"
            hint={`"What MAIA is here for, what it remembers, when a client should contact you directly instead. Answer what clients will wonder but rarely ask."`}
            required
          >
            <Textarea
              value={field?.how_maia_supports ?? ''}
              onChange={v => updateField('how_maia_supports', v)}
              rows={7}
              placeholder={`MAIA is here to support the work we're doing together — not to replace it.\n\nIt can help you reflect between sessions, prepare for our next meeting, or integrate what arose after. It remembers what you've shared over time, with your consent.\n\nMAIA doesn't share your conversations with me. If something feels urgent or needs my direct attention, please reach out to me personally rather than relying on MAIA.`}
            />
            <MirrorFieldAssist fieldKey="how_maia_supports" currentValue={field?.how_maia_supports ?? ''} onAccept={v => updateField('how_maia_supports', v)} />
          </InterviewQuestion>

          <InterviewQuestion
            question="What professional context should clients understand before entering this space?"
            hint="Your professional role, any record retention obligations, mandatory reporting duties if applicable, and any practice policies. Required for LIVE. The platform records what you declare; it does not verify credentials."
            required
          >
            <Textarea
              value={field?.professional_practice ?? ''}
              onChange={v => updateField('professional_practice', v)}
              rows={5}
              placeholder={`I am a certified EFT practitioner. I maintain session records for [duration] per professional guidelines.\n\nI am not a licensed therapist and this work is not a substitute for therapy. If you are in crisis, please contact [crisis resource].`}
            />
            <MirrorFieldAssist fieldKey="professional_practice" currentValue={field?.professional_practice ?? ''} onAccept={v => updateField('professional_practice', v)} />
          </InterviewQuestion>

          <InterviewQuestion
            question="How do you want new clients to arrive for the first time?"
            hint="Choose the threshold experience that fits how you work."
          >
            <div className="space-y-2">
              {(Object.entries(ORIENTATION_LABELS) as [OrientationStyle, string][]).map(([key, label]) => (
                <label key={key} className="flex gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    checked={field?.orientation_style === key}
                    onChange={() => updateField('orientation_style', key)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-stone-300 text-sm font-light group-hover:text-stone-200 transition-colors">
                      {label.split(' — ')[0]}
                    </p>
                    <p className="text-stone-600 text-xs">{label.split(' — ')[1]}</p>
                  </div>
                </label>
              ))}
            </div>
          </InterviewQuestion>

        </div>
      )}

      {/* ── Layer 3: Practice ── */}
      {section === 'practice' && (
        <div className="space-y-8">
          <InterviewQuestion
            question="What's alive in your practice right now that you'd like all clients to know about?"
            hint="This is the Active Field — it can change weekly or seasonally. MAIA surfaces it as present-moment practitioner emphasis."
          >
            <Textarea
              value={field?.active_field_content ?? ''}
              onChange={v => updateField('active_field_content', v)}
              rows={4}
              placeholder="This month I'm inviting clients to pay attention to rest. Notice where you're pushing through rather than allowing…"
            />
          </InterviewQuestion>

          <div className="border-t border-stone-800 pt-6">
            <p className="text-stone-500 text-sm font-light">
              Resources (exercises, readings, prompts) — coming soon. MAIA will surface them contextually.
            </p>
          </div>
        </div>
      )}

      {/* ── Invite ── */}
      {section === 'invite' && (
        <div className="space-y-6">
          {status === 'pending' && (
            <div className="border border-amber-900/40 bg-amber-950/20 rounded p-4 space-y-2">
              <p className="text-amber-400 text-sm font-light">Your Practice Field is PENDING.</p>
              <p className="text-amber-600 text-xs">{field?.status_reason}</p>
              <p className="text-stone-500 text-xs">Complete the required sections before inviting clients.</p>
            </div>
          )}

          {status !== 'pending' && (
            <div className="space-y-5">
              <p className="text-stone-400 text-sm font-light leading-relaxed">
                Invite a client into a private shared space. They'll receive an email with your welcome message and a link to accept.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Client email *</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-stone-500 rounded"
                    placeholder="sarah@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Client name (optional)</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-stone-500 rounded"
                    placeholder="Sarah"
                  />
                </div>
              </div>

              {inviteResult && (
                <p className={`text-sm font-light ${inviteResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {inviteResult.message}
                </p>
              )}

              <button
                onClick={sendInvitation}
                disabled={inviting || !clientEmail}
                className="bg-stone-200 text-stone-900 px-6 py-3 text-sm font-medium tracking-wide hover:bg-white transition-colors disabled:opacity-50"
              >
                {inviting ? 'Sending…' : 'Send Invitation'}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function InterviewQuestion({
  question, hint, required, children,
}: {
  question: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-stone-300 text-sm font-light leading-snug">
          {question}
          {required && <span className="text-amber-600 ml-1 text-xs">required for LIVE</span>}
        </p>
        {hint && <p className="text-stone-600 text-xs font-light leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Textarea({
  value, onChange, rows = 4, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-3 text-sm font-light leading-relaxed focus:outline-none focus:border-stone-500 rounded resize-none placeholder:text-stone-700"
    />
  );
}
