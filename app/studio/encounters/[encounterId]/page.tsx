'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Clock,
  Users,
  FileText,
  BarChart2,
  BookOpen,
  Layers,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Check,
  DoorOpen,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Encounter {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'complete';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcription_status: 'pending' | 'processing' | 'complete' | 'failed';
  created_at: string;
}

interface Participant {
  id: string;
  display_name: string;
  role: string;
}

interface RoomLink {
  participantId: string;
  displayName: string;
  role: string;
  thresholdPath: string;
}

interface RoomConsent {
  participantId: string;
  joined: boolean;
  recordConsented: boolean;
}

interface TranscriptTurn {
  id: string;
  speaker: string | null;
  text: string | null;
  start_ms: number | null;
  end_ms: number | null;
  turn_index: number;
}

interface Moment {
  id: string;
  moment_type: string;
  title: string;
  start_ms: number | null;
  end_ms: number | null;
  excerpt: string | null;
  candidate_interpretation: string | null;
  confidence: number | null;
  status: 'candidate' | 'accepted' | 'rejected' | 'edited';
  artifact_type: string;
}

interface Reflection {
  id: string;
  body: string | null;
  author_role: string;
  artifact_type: string;
  created_at: string;
}

interface Interpretation {
  id: string;
  layer: string;
  content: unknown;
  artifact_type: string;
  generated_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type TabKey = 'overview' | 'transcript' | 'moments' | 'reflections' | 'dynamics' | 'teaching' | 'development';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMs(ms: number | null): string {
  if (ms == null) return '';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const momentTypeLabels: Record<string, string> = {
  emotional_shift: 'Emotional Shift',
  rupture_repair: 'Rupture / Repair',
  insight: 'Insight',
  resistance: 'Resistance',
  aliveness: 'Aliveness',
  silence: 'Silence',
  intervention: 'Intervention',
  self_recognition: 'Self Recognition',
  unresolved_question: 'Unresolved Question',
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-700 text-slate-300',
  active: 'bg-amber-500/20 text-amber-300',
  complete: 'bg-emerald-500/20 text-emerald-300',
  pending: 'bg-slate-700 text-slate-400',
  processing: 'bg-amber-500/20 text-amber-300',
  failed: 'bg-red-500/20 text-red-300',
};

const TABS: { key: TabKey; label: string; icon: typeof Eye }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart2 },
  { key: 'transcript', label: 'Transcript', icon: FileText },
  { key: 'moments', label: 'Moments', icon: Sparkles },
  { key: 'reflections', label: 'Reflections', icon: BookOpen },
  { key: 'dynamics', label: 'Dynamics', icon: Layers },
  { key: 'teaching', label: 'Teaching', icon: MessageCircle },
  { key: 'development', label: 'Development', icon: TrendingUp },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EncounterWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params.encounterId as string;

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [interpretations, setInterpretations] = useState<Interpretation[]>([]);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [speakerCount, setSpeakerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showRejected, setShowRejected] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [editingMoment, setEditingMoment] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ title: '', interpretation: '' });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [generatingLayer, setGeneratingLayer] = useState<string | null>(null);
  const [roomLinks, setRoomLinks] = useState<RoomLink[]>([]);
  const [roomConsents, setRoomConsents] = useState<RoomConsent[]>([]);
  const [copiedParticipant, setCopiedParticipant] = useState<string | null>(null);
  const [refreshingConsent, setRefreshingConsent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}`);
      const data = await res.json();
      if (!res.ok) return;
      setEncounter(data.encounter);
      setParticipants(data.participants ?? []);
      setTurns(data.turns ?? []);
      setMoments(data.moments ?? []);
      setReflections(data.reflections ?? []);
      setInterpretations(data.interpretations ?? []);
      if (data.transcript) {
        setWordCount(data.transcript.word_count);
        setSpeakerCount(data.transcript.speaker_count);
      }
    } finally {
      setLoading(false);
    }
  }, [encounterId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // ── Session Room (native) ─────────────────────────────────────────────────
  // Tokens are stateless with a 7-day TTL, so minting on page view never
  // invalidates a link already sent — it just issues a fresh door key.

  const refreshConsents = useCallback(async () => {
    setRefreshingConsent(true);
    try {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}/threshold`);
      if (res.ok) {
        const data = await res.json();
        setRoomConsents(data.participants ?? []);
      }
    } finally {
      setRefreshingConsent(false);
    }
  }, [encounterId]);

  useEffect(() => {
    if (participants.length === 0) return;
    let cancelled = false;
    (async () => {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}/threshold`, { method: 'POST' });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setRoomLinks(data.links ?? []);
      refreshConsents();
    })();
    return () => { cancelled = true; };
  }, [participants.length, encounterId, refreshConsents]);

  async function copyInvite(link: RoomLink) {
    const url = `${window.location.origin}${link.thresholdPath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedParticipant(link.participantId);
      setTimeout(() => setCopiedParticipant(null), 2000);
    } catch {
      window.prompt('Copy this invite link:', url);
    }
  }

  // ── Moment actions ────────────────────────────────────────────────────────

  async function acceptMoment(momentId: string) {
    await apiFetch(`/api/studio/encounters/${encounterId}/moments/${momentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted', artifact_type: 'accepted_recognition' }),
    });
    setMoments(prev => prev.map(m => m.id === momentId ? { ...m, status: 'accepted', artifact_type: 'accepted_recognition' } : m));
  }

  async function rejectMoment(momentId: string) {
    await apiFetch(`/api/studio/encounters/${encounterId}/moments/${momentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected' }),
    });
    setMoments(prev => prev.map(m => m.id === momentId ? { ...m, status: 'rejected' } : m));
  }

  async function saveMomentEdit(momentId: string) {
    await apiFetch(`/api/studio/encounters/${encounterId}/moments/${momentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: editDraft.title, candidate_interpretation: editDraft.interpretation, status: 'edited', artifact_type: 'accepted_recognition' }),
    });
    setMoments(prev => prev.map(m => m.id === momentId
      ? { ...m, title: editDraft.title, candidate_interpretation: editDraft.interpretation, status: 'edited', artifact_type: 'accepted_recognition' }
      : m));
    setEditingMoment(null);
  }

  async function extractMoments() {
    setExtracting(true);
    try {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}/moments/extract`, { method: 'POST' });
      if (res.ok) await load();
    } finally {
      setExtracting(false);
    }
  }

  // ── Reflections ───────────────────────────────────────────────────────────

  async function submitReflection() {
    if (!reflectionDraft.trim()) return;
    setSubmittingReflection(true);
    try {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}/reflections`, {
        method: 'POST',
        body: JSON.stringify({ body: reflectionDraft.trim() }),
      });
      if (res.ok) {
        setReflectionDraft('');
        await load();
      }
    } finally {
      setSubmittingReflection(false);
    }
  }

  // ── Interpretation layers ─────────────────────────────────────────────────

  async function generateLayer(layer: string) {
    setGeneratingLayer(layer);
    try {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}/moments/extract`, {
        method: 'POST',
        body: JSON.stringify({ layer }),
      });
      if (res.ok) await load();
    } finally {
      setGeneratingLayer(null);
    }
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const res = await apiFetch(`/api/studio/encounters/${encounterId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: msg, history: chatMessages }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } finally {
      setChatLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Encounter not found.</p>
        <button onClick={() => router.push('/studio/encounters')} className="text-sm text-amber-400 hover:underline">
          Back to encounters
        </button>
      </div>
    );
  }

  const visibleMoments = moments.filter(m => showRejected ? true : m.status !== 'rejected');
  const dynamicsInterps = interpretations.filter(i => i.layer === 'dynamics');
  const teachingInterps = interpretations.filter(i => i.layer === 'teaching');
  const developmentInterps = interpretations.filter(i => i.layer === 'development');

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#1a1a2e]/95 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/studio/encounters')} className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-medium truncate">{encounter.title}</h1>
            <p className="text-xs text-slate-500">{formatDate(encounter.started_at ?? encounter.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[encounter.status] ?? 'bg-slate-700 text-slate-400'}`}>
              {encounter.status}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[encounter.transcription_status] ?? 'bg-slate-700 text-slate-400'}`}>
              transcript: {encounter.transcription_status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-0.5 overflow-x-auto pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 pb-40">

        {/* ── Overview ──────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Duration', value: formatDuration(encounter.duration_seconds), icon: Clock },
                { label: 'Participants', value: participants.length || '—', icon: Users },
                { label: 'Words', value: wordCount ?? '—', icon: FileText },
                { label: 'Moments', value: moments.length, icon: Sparkles },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <Icon className="w-4 h-4 text-slate-500 mb-2" />
                    <p className="text-xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {participants.length > 0 && roomLinks.length > 0 && (
              <div className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5" />
                    Session Studio
                  </h3>
                  <button
                    onClick={refreshConsents}
                    disabled={refreshingConsent}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    title="Refresh who has arrived"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingConsent ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-2">
                  {roomLinks.map(link => {
                    const consent = roomConsents.find(c => c.participantId === link.participantId);
                    const arrived = consent?.joined ?? false;
                    const isPractitioner = link.role === 'practitioner';
                    return (
                      <div key={link.participantId} className="flex items-center gap-3 bg-slate-800/60 rounded-lg px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-slate-200">{link.displayName}</span>
                          <span className="ml-2 text-xs text-slate-500">{link.role}</span>
                        </div>
                        <span className={`text-xs ${arrived ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {arrived ? '✓ arrived' : 'waiting'}
                        </span>
                        {isPractitioner ? (
                          <a
                            href={link.thresholdPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-medium rounded-lg transition-colors"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            Enter Room
                          </a>
                        ) : (
                          <button
                            onClick={() => copyInvite(link)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors"
                          >
                            {copiedParticipant === link.participantId
                              ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                              : <Copy className="w-3.5 h-3.5" />}
                            {copiedParticipant === link.participantId ? 'Copied' : 'Copy Invite'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Send each person their own invite — everyone consents on their own device before the room opens.
                  Links stay good for 7 days.
                </p>
              </div>
            )}

            {participants.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Participants</h3>
                <div className="flex flex-wrap gap-2">
                  {participants.map(p => (
                    <span key={p.id} className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full">
                      {p.display_name}
                      <span className="ml-1.5 text-slate-500 text-xs">{p.role}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick stats</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>Accepted moments: <span className="text-emerald-400">{moments.filter(m => m.status === 'accepted' || m.status === 'edited').length}</span></span>
                <span>Candidate: <span className="text-amber-400">{moments.filter(m => m.status === 'candidate').length}</span></span>
                <span>Reflections: <span className="text-blue-400">{reflections.length}</span></span>
                <span>Speakers: <span className="text-white">{speakerCount ?? '—'}</span></span>
              </div>
            </div>
          </div>
        )}

        {/* ── Transcript ────────────────────────────────────────────────── */}
        {activeTab === 'transcript' && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <Lock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Source Record — immutable</span>
            </div>
            {turns.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No transcript available yet.</p>
                <p className="text-slate-600 text-sm mt-1">
                  {encounter.transcription_status === 'processing' ? 'Transcription is in progress — check back shortly.' : 'Transcription has not been started for this encounter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {turns.map(turn => (
                  <div key={turn.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-slate-600 tabular-nums">{String(turn.turn_index + 1).padStart(3, '0')}</span>
                      <span className="text-xs font-medium text-slate-400">{turn.speaker || 'Unknown'}</span>
                      {turn.start_ms != null && (
                        <span className="text-xs text-slate-600 ml-auto">{formatMs(turn.start_ms)}</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{turn.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Moments ───────────────────────────────────────────────────── */}
        {activeTab === 'moments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-slate-400">Candidate patterns worth exploring</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRejected(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showRejected ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showRejected ? 'Hide rejected' : 'Show rejected'}
                </button>
                <button
                  onClick={extractMoments}
                  disabled={extracting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/25 transition-all disabled:opacity-50"
                >
                  {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Extract Moments
                </button>
              </div>
            </div>

            {visibleMoments.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No moments have been identified yet.</p>
                <p className="text-slate-600 text-sm mt-1">Use "Extract Moments" to begin, or mark them manually during a session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleMoments.map(moment => {
                  const isAccepted = moment.status === 'accepted' || moment.status === 'edited';
                  const isRejected = moment.status === 'rejected';
                  const isEditing = editingMoment === moment.id;

                  return (
                    <div
                      key={moment.id}
                      className={`border rounded-xl p-4 ${
                        isAccepted ? 'bg-emerald-500/5 border-emerald-500/20' :
                        isRejected ? 'bg-slate-900/30 border-slate-800/50 opacity-50' :
                        'bg-amber-500/5 border-amber-500/15'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              isAccepted ? 'bg-emerald-500/20 text-emerald-300' :
                              isRejected ? 'bg-slate-700 text-slate-500' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>
                              {isAccepted ? 'Recognized' : isRejected ? 'Set aside' : 'Candidate'}
                            </span>
                            <span className="text-xs text-slate-500">{momentTypeLabels[moment.moment_type] ?? moment.moment_type}</span>
                            {moment.start_ms != null && (
                              <span className="text-xs text-slate-600">{formatMs(moment.start_ms)}{moment.end_ms ? `–${formatMs(moment.end_ms)}` : ''}</span>
                            )}
                            {moment.confidence != null && (
                              <span className="text-xs text-slate-600">confidence {Math.round(moment.confidence * 100)}%</span>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-2 mt-2">
                              <input
                                value={editDraft.title}
                                onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                                placeholder="Title"
                              />
                              <textarea
                                value={editDraft.interpretation}
                                onChange={e => setEditDraft(d => ({ ...d, interpretation: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                                rows={3}
                                placeholder="Your interpretation"
                              />
                              <div className="flex gap-2">
                                <button onClick={() => saveMomentEdit(moment.id)} className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors">Save</button>
                                <button onClick={() => setEditingMoment(null)} className="px-3 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-white text-sm font-medium mb-1">{moment.title}</p>
                              {moment.excerpt && <p className="text-slate-400 text-sm italic mb-2">&ldquo;{moment.excerpt}&rdquo;</p>}
                              {moment.candidate_interpretation && (
                                <p className="text-slate-300 text-sm">{moment.candidate_interpretation}</p>
                              )}
                            </>
                          )}
                        </div>

                        {!isEditing && !isRejected && (
                          <div className="flex items-center gap-1 shrink-0">
                            {!isAccepted && (
                              <button onClick={() => acceptMoment(moment.id)} title="Accept" className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => { setEditingMoment(moment.id); setEditDraft({ title: moment.title, interpretation: moment.candidate_interpretation ?? '' }); }} title="Edit" className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {!isAccepted && (
                              <button onClick={() => rejectMoment(moment.id)} title="Set aside" className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Reflections ───────────────────────────────────────────────── */}
        {activeTab === 'reflections' && (
          <div className="space-y-4">
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
              <p className="text-xs text-blue-400 uppercase tracking-wider mb-3">Add your reflection</p>
              <textarea
                value={reflectionDraft}
                onChange={e => setReflectionDraft(e.target.value)}
                placeholder="What stayed with you? What feels important to hold? Reflections remain yours — they are not processed or interpreted."
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/40 resize-none"
                rows={4}
              />
              <button
                onClick={submitReflection}
                disabled={!reflectionDraft.trim() || submittingReflection}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/25 transition-all disabled:opacity-40"
              >
                {submittingReflection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Save reflection
              </button>
            </div>

            {reflections.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No reflections yet.</p>
                <p className="text-slate-600 text-sm mt-1">Your reflections are attributed to you and kept separate from AI interpretations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reflections.map(r => (
                  <div key={r.id} className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-blue-400 uppercase tracking-wider">Human Reflection</span>
                      <span className="text-xs text-slate-600">{r.author_role}</span>
                      <span className="ml-auto text-xs text-slate-600">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Interpretation layer tabs ──────────────────────────────────── */}
        {(['dynamics', 'teaching', 'development'] as const).map(layer => {
          if (activeTab !== layer) return null;
          const layerInterps = layer === 'dynamics' ? dynamicsInterps : layer === 'teaching' ? teachingInterps : developmentInterps;
          const isGenerating = generatingLayer === layer;

          const layerMeta = {
            dynamics: { label: 'Relational Dynamics', desc: 'Possible relational patterns present in this encounter.', icon: Layers, color: 'purple' },
            teaching: { label: 'Teaching Summary', desc: 'Themes that may be worth bringing into the next session or a larger arc.', icon: MessageCircle, color: 'teal' },
            development: { label: 'Development', desc: 'Longitudinal patterns across encounters — this grows over time.', icon: TrendingUp, color: 'indigo' },
          }[layer];

          return (
            <div key={layer} className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{layerMeta.desc}</p>
                {layer !== 'development' && (
                  <button
                    onClick={() => generateLayer(layer)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/25 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {layerInterps.length > 0 ? 'Regenerate' : `Ask MAIA to identify ${layerMeta.label.toLowerCase()}`}
                  </button>
                )}
              </div>

              {layerInterps.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center">
                  <layerMeta.icon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">
                    {layer === 'development'
                      ? 'Developmental patterns will emerge as more encounters are added to this person\'s record.'
                      : `No ${layerMeta.label.toLowerCase()} have been generated yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {layerInterps.map(interp => (
                    <div key={interp.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-amber-400 uppercase tracking-wider">Candidate interpretation</span>
                        <span className="text-xs text-slate-600">{new Date(interp.generated_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {typeof interp.content === 'string' ? interp.content : JSON.stringify(interp.content, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── MAIA Chat Panel ───────────────────────────────────────────────── */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all ${chatOpen ? 'h-80' : 'h-12'}`}>
        <div className="max-w-6xl mx-auto px-4 h-full flex flex-col">
          <button
            onClick={() => setChatOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-t-xl text-slate-400 text-xs hover:text-slate-200 transition-colors w-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask MAIA about this encounter</span>
            {chatOpen ? <ChevronDown className="w-3.5 h-3.5 ml-auto" /> : <ChevronUp className="w-3.5 h-3.5 ml-auto" />}
          </button>

          {chatOpen && (
            <div className="flex-1 bg-slate-900 border border-t-0 border-slate-700 rounded-b-xl flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-slate-600 text-xs text-center py-4">
                    I'm looking at this encounter with you. Ask me about what you're noticing, what might be worth exploring, or what patterns may be present.
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-amber-500/10 border border-amber-500/20 text-slate-200'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'assistant' && (
                      <span className="text-[10px] text-slate-600 ml-1">candidate interpretation</span>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                      <Loader2 className="w-4 h-4 text-amber-400/60 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-slate-800 p-2 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="What are you noticing?"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/30"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
