'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  Loader2,
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2,
  X,
  FileText,
  Star,
  Flame,
  BookOpen,
  Users,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  RelationshipRecord,
  CheckinRecord,
  ShareRecord,
  AstrologySnapshot,
  RelationshipDivination,
  ChildState,
  ParentNeed,
  PermissionLevel,
} from '@/lib/studio/relationships/types';
import {
  ROLE_LABELS,
  CHILD_STATE_LABELS,
  PARENT_NEED_LABELS,
  PERMISSION_LABELS,
} from '@/lib/studio/relationships/types';

// ─── Child State Options ────────────────────────────────────

const CHILD_STATES: { value: ChildState; label: string; color: string }[] = [
  { value: 'calm', label: 'Calm', color: 'text-emerald-300 border-emerald-700/50 bg-emerald-900/20' },
  { value: 'sensitive', label: 'Sensitive', color: 'text-blue-300 border-blue-700/50 bg-blue-900/20' },
  { value: 'anxious', label: 'Anxious', color: 'text-amber-300 border-amber-700/50 bg-amber-900/20' },
  { value: 'angry', label: 'Angry', color: 'text-red-300 border-red-700/50 bg-red-900/20' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'text-slate-300 border-slate-600/50 bg-slate-800/40' },
  { value: 'big_questions', label: 'Big Questions', color: 'text-purple-300 border-purple-700/50 bg-purple-900/20' },
  { value: 'social_pain', label: 'Social Pain', color: 'text-rose-300 border-rose-700/50 bg-rose-900/20' },
];

const PARENT_NEEDS: { value: ParentNeed; label: string }[] = [
  { value: 'what_to_say', label: 'What should I say?' },
  { value: 'how_serious', label: 'How serious is this?' },
  { value: 'regulate', label: 'How do I help regulate?' },
  { value: 'is_normal', label: 'Is this normal?' },
  { value: 'pattern', label: 'What pattern might be happening?' },
];

export default function RelationshipHubPage() {
  const params = useParams();
  const id = params?.id as string;

  const [relationship, setRelationship] = useState<RelationshipRecord | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCheckin, setExpandedCheckin] = useState<string | null>(null);

  // Check-in flow state
  const [showCheckin, setShowCheckin] = useState(false);
  const [step, setStep] = useState(1);
  const [whatHappened, setWhatHappened] = useState('');
  const [childState, setChildState] = useState<ChildState | null>(null);
  const [parentNeed, setParentNeed] = useState<ParentNeed | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [latestCheckin, setLatestCheckin] = useState<CheckinRecord | null>(null);

  // Mentor state
  const [requestingMentor, setRequestingMentor] = useState<string | null>(null);

  // Share state
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [creatingShare, setCreatingShare] = useState(false);
  const [sharePermission, setSharePermission] = useState<PermissionLevel>('summary_only');
  const [shareExpiry, setShareExpiry] = useState<string>('7d');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);
  const [exportingWeekly, setExportingWeekly] = useState(false);

  // Phase 3: Astrology + Divination state
  const [astroSnapshot, setAstroSnapshot] = useState<AstrologySnapshot | null>(null);
  const [astroLoading, setAstroLoading] = useState(false);
  const [showAstroPanel, setShowAstroPanel] = useState(false);
  const [divinations, setDivinations] = useState<RelationshipDivination[]>([]);
  const [castingIching, setCastingIching] = useState(false);
  const [consultingCouncil, setConsultingCouncil] = useState(false);
  const [latestDivination, setLatestDivination] = useState<RelationshipDivination | null>(null);
  const [showDivinationResult, setShowDivinationResult] = useState(false);
  const [divinationQuestion, setDivinationQuestion] = useState('');
  const [showDivinationInput, setShowDivinationInput] = useState<'iching' | 'council' | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [relRes, checkinsRes] = await Promise.all([
        apiFetch(`/api/studio/relationships/${id}`),
        apiFetch(`/api/studio/relationships/${id}/checkins`),
      ]);

      if (relRes.ok) {
        const data = await relRes.json();
        setRelationship(data.relationship);
      }
      if (checkinsRes.ok) {
        const data = await checkinsRes.json();
        setCheckins(data.checkins || []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function resetCheckin() {
    setShowCheckin(false);
    setStep(1);
    setWhatHappened('');
    setChildState(null);
    setParentNeed(null);
    setLatestCheckin(null);
  }

  async function submitCheckin() {
    if (!whatHappened.trim()) return;
    setSubmitting(true);

    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/checkin`, {
        method: 'POST',
        body: JSON.stringify({
          whatHappened: whatHappened.trim(),
          childState,
          parentNeed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLatestCheckin(data.checkin);
        setStep(4); // Show response
        // Refresh timeline
        const checkinsRes = await apiFetch(`/api/studio/relationships/${id}/checkins`);
        if (checkinsRes.ok) {
          const checkinsData = await checkinsRes.json();
          setCheckins(checkinsData.checkins || []);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Check-in failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function requestMentor(checkinId: string) {
    setRequestingMentor(checkinId);
    try {
      const res = await apiFetch(
        `/api/studio/relationships/${id}/checkin/${checkinId}/mentor`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        // Update the checkin in state
        setCheckins(prev =>
          prev.map(c =>
            c.id === checkinId
              ? { ...c, mentorReflection: data.mentorReflection }
              : c
          )
        );
        if (latestCheckin?.id === checkinId) {
          setLatestCheckin(prev =>
            prev ? { ...prev, mentorReflection: data.mentorReflection } : prev
          );
        }
      }
    } finally {
      setRequestingMentor(null);
    }
  }

  // ─── Share functions ──────────────────────────────────────
  async function loadShares() {
    setSharesLoading(true);
    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/shares`);
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } finally {
      setSharesLoading(false);
    }
  }

  async function createShare() {
    setCreatingShare(true);
    setNewShareUrl(null);
    try {
      const expiryMap: Record<string, number | null> = {
        '1d': 1, '7d': 7, '30d': 30, 'none': null,
      };
      const expiresInDays = expiryMap[shareExpiry];

      const res = await apiFetch(`/api/studio/relationships/${id}/shares`, {
        method: 'POST',
        body: JSON.stringify({
          shareType: 'link',
          permissionLevel: sharePermission,
          expiresInDays,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.share?.shareUrl) {
          setNewShareUrl(data.share.shareUrl);
          copyToClipboard(data.share.shareUrl);
        }
        loadShares();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create share link');
      }
    } finally {
      setCreatingShare(false);
    }
  }

  async function revokeShare(shareId: string) {
    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/shares/${shareId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShares(prev => prev.filter(s => s.id !== shareId));
      }
    } catch {
      // silent fail
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    });
  }

  async function exportWeeklySummary(format: 'json' | 'markdown') {
    setExportingWeekly(true);
    try {
      const res = await apiFetch(
        `/api/studio/relationships/${id}/export/weekly?format=${format}`
      );
      if (format === 'markdown' && res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weekly-summary-${relationship?.personName || 'relationship'}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          const blob = new Blob([JSON.stringify(data.summary, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `weekly-summary-${relationship?.personName || 'relationship'}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          alert(data.message || 'No check-ins this week');
        }
      }
    } catch {
      alert('Failed to export weekly summary');
    } finally {
      setExportingWeekly(false);
    }
  }

  function openSharePanel() {
    setShowSharePanel(true);
    loadShares();
  }

  // ─── Phase 3: Astrology + Divination functions ─────────────
  async function loadAstrology() {
    setAstroLoading(true);
    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/astrology`);
      if (res.ok) {
        const data = await res.json();
        setAstroSnapshot(data.snapshot);
        setShowAstroPanel(true);
      }
    } finally {
      setAstroLoading(false);
    }
  }

  async function castIching() {
    setCastingIching(true);
    setShowDivinationInput(null);
    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/divination/iching`, {
        method: 'POST',
        body: JSON.stringify({
          question: divinationQuestion.trim() || undefined,
          method: 'yarrow',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestDivination(data.divination);
        setShowDivinationResult(true);
        setDivinations(prev => [data.divination, ...prev]);
      } else {
        alert('Cast failed — try again');
      }
    } finally {
      setCastingIching(false);
      setDivinationQuestion('');
    }
  }

  async function consultCouncil() {
    setConsultingCouncil(true);
    setShowDivinationInput(null);
    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/divination/council`, {
        method: 'POST',
        body: JSON.stringify({
          question: divinationQuestion.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestDivination(data.divination);
        setShowDivinationResult(true);
        setDivinations(prev => [data.divination, ...prev]);
      } else {
        alert('Council consultation failed — try again');
      }
    } finally {
      setConsultingCouncil(false);
      setDivinationQuestion('');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-slate-400">Relationship not found.</p>
          <Link href="/studio/relationships" className="text-amber-400 text-sm mt-2 inline-block">
            Back to Relationships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/studio/relationships" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-light text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                {relationship.personName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {ROLE_LABELS[relationship.role]}
                {relationship.ageYears ? ` \u00B7 ${relationship.ageYears} years old` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openSharePanel}
              className="text-slate-500 hover:text-amber-300 transition-colors"
              title="Share & Export"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <Link
              href={`/studio/relationships/${id}`}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Share & Export Panel */}
        <AnimatePresence>
          {showSharePanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    Share & Export
                  </h2>
                  <button
                    onClick={() => setShowSharePanel(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Create Link Share */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Permission Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['summary_only', 'read_stream'] as PermissionLevel[]).map(p => (
                        <button
                          key={p}
                          onClick={() => setSharePermission(p)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            sharePermission === p
                              ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                              : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {PERMISSION_LABELS[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Expires In</label>
                    <div className="flex gap-2">
                      {[
                        { value: '1d', label: '1 day' },
                        { value: '7d', label: '7 days' },
                        { value: '30d', label: '30 days' },
                        { value: 'none', label: 'Never' },
                      ].map(e => (
                        <button
                          key={e.value}
                          onClick={() => setShareExpiry(e.value)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            shareExpiry === e.value
                              ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                              : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={createShare}
                    disabled={creatingShare}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {creatingShare ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <><LinkIcon className="w-4 h-4" /> Generate Share Link</>
                    )}
                  </button>

                  {/* Newly created share URL */}
                  {newShareUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30"
                    >
                      <LinkIcon className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-emerald-200 truncate flex-1">{newShareUrl}</span>
                      <button
                        onClick={() => copyToClipboard(newShareUrl)}
                        className="text-emerald-400 hover:text-emerald-200 flex-shrink-0"
                      >
                        {copiedUrl === newShareUrl ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Active Shares */}
                {sharesLoading ? (
                  <p className="text-xs text-slate-600">Loading shares...</p>
                ) : shares.length > 0 ? (
                  <div>
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active Shares</h3>
                    <div className="space-y-2">
                      {shares.map(s => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-800/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <LinkIcon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-300">{PERMISSION_LABELS[s.permissionLevel]}</p>
                              <p className="text-[10px] text-slate-600">
                                Created {new Date(s.createdAt).toLocaleDateString()}
                                {s.expiresAt ? ` · Expires ${new Date(s.expiresAt).toLocaleDateString()}` : ' · No expiry'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => revokeShare(s.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 ml-2"
                            title="Revoke share"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Weekly Export */}
                <div className="mt-5 pt-4 border-t border-slate-800">
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Weekly Summary Export</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportWeeklySummary('markdown')}
                      disabled={exportingWeekly}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-700 text-slate-400 rounded-lg hover:border-slate-600 hover:text-slate-300 disabled:opacity-50 transition-colors"
                    >
                      {exportingWeekly ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      Markdown
                    </button>
                    <button
                      onClick={() => exportWeeklySummary('json')}
                      disabled={exportingWeekly}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-700 text-slate-400 rounded-lg hover:border-slate-600 hover:text-slate-300 disabled:opacity-50 transition-colors"
                    >
                      {exportingWeekly ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      JSON
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    MAIA generates a summary from the last 7 days of check-ins.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary + Secondary Actions */}
        {!showCheckin && !showDivinationResult && (
          <div className="mb-8 space-y-3">
            {/* Primary */}
            <motion.button
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowCheckin(true)}
              className="w-full p-5 rounded-xl border-2 border-dashed border-amber-700/40 bg-amber-950/10 hover:border-amber-600/60 hover:bg-amber-950/20 transition-colors text-center group"
            >
              <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-amber-200 font-medium text-sm">
                Something happened &mdash; help me respond
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Quick check-in with MAIA guidance
              </p>
            </motion.button>

            {/* Secondary: Divination + Astrology row */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setShowDivinationInput(showDivinationInput === 'iching' ? null : 'iching')}
                disabled={castingIching}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-slate-800/60 bg-slate-900/30 hover:border-purple-700/40 hover:bg-purple-950/10 transition-colors text-xs text-slate-400 hover:text-purple-300 disabled:opacity-50"
              >
                {castingIching ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                <span>I Ching</span>
              </button>
              <button
                onClick={() => setShowDivinationInput(showDivinationInput === 'council' ? null : 'council')}
                disabled={consultingCouncil}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-slate-800/60 bg-slate-900/30 hover:border-blue-700/40 hover:bg-blue-950/10 transition-colors text-xs text-slate-400 hover:text-blue-300 disabled:opacity-50"
              >
                {consultingCouncil ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                <span>Ask Council</span>
              </button>
              <button
                onClick={() => showAstroPanel ? setShowAstroPanel(false) : loadAstrology()}
                disabled={astroLoading}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-slate-800/60 bg-slate-900/30 hover:border-amber-700/40 hover:bg-amber-950/10 transition-colors text-xs text-slate-400 hover:text-amber-300 disabled:opacity-50"
              >
                {astroLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                <span>Astrology</span>
              </button>
            </div>

            {/* Divination question input */}
            <AnimatePresence>
              {showDivinationInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden"
                >
                  <div className="p-4">
                    <label className="block text-xs text-slate-400 mb-2">
                      {showDivinationInput === 'iching' ? 'What do you want to cast about? (optional)' : 'What question would you like the Council to hold?'}
                    </label>
                    <textarea
                      value={divinationQuestion}
                      onChange={e => setDivinationQuestion(e.target.value)}
                      placeholder={showDivinationInput === 'iching'
                        ? `What is most needed in my relationship with ${relationship.personName}?`
                        : `What perspective would serve me most right now with ${relationship.personName}?`}
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none resize-none"
                    />
                    <div className="flex justify-between mt-3">
                      <button
                        onClick={() => { setShowDivinationInput(null); setDivinationQuestion(''); }}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={showDivinationInput === 'iching' ? castIching : consultCouncil}
                        disabled={castingIching || consultingCouncil}
                        className={`flex items-center gap-2 px-4 py-1.5 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${
                          showDivinationInput === 'iching'
                            ? 'bg-purple-700 hover:bg-purple-600'
                            : 'bg-blue-700 hover:bg-blue-600'
                        }`}
                      >
                        {(castingIching || consultingCouncil) ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Working...</>
                        ) : showDivinationInput === 'iching' ? (
                          <><BookOpen className="w-4 h-4" /> Cast</>
                        ) : (
                          <><Users className="w-4 h-4" /> Consult</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Check-in Flow */}
        <AnimatePresence>
          {showCheckin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
            >
              <div className="p-5">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2, 3].map(s => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        s <= step ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Step 1: What happened */}
                {step === 1 && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      What happened?
                    </label>
                    <textarea
                      value={whatHappened}
                      onChange={e => setWhatHappened(e.target.value)}
                      placeholder="Describe what's going on..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={resetCheckin}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!whatHappened.trim()}
                        className="px-4 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Child state */}
                {step === 2 && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-3">
                      {relationship.role === 'child' ? 'Child' : relationship.personName} is:
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CHILD_STATES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setChildState(s.value)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            childState === s.value
                              ? s.color
                              : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-300">
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="px-4 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                      >
                        {childState ? 'Next' : 'Skip'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: What do you need */}
                {step === 3 && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-3">
                      What do you need?
                    </label>
                    <div className="space-y-2">
                      {PARENT_NEEDS.map(n => (
                        <button
                          key={n.value}
                          onClick={() => setParentNeed(n.value)}
                          className={`w-full text-left px-4 py-2.5 text-sm rounded-lg border transition-colors ${
                            parentNeed === n.value
                              ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                              : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button onClick={() => setStep(2)} className="text-xs text-slate-500 hover:text-slate-300">
                        Back
                      </button>
                      <button
                        onClick={submitCheckin}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Asking MAIA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {parentNeed ? 'Get Guidance' : 'Submit'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: MAIA Response */}
                {step === 4 && latestCheckin?.maiaResponse && (
                  <div>
                    <h3 className="text-sm font-medium text-amber-200 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      MAIA Response
                    </h3>

                    <div className="space-y-4">
                      <ResponseBlock
                        label="What this is"
                        content={latestCheckin.maiaResponse.framing}
                      />
                      <ResponseBlock
                        label="What to say"
                        content={latestCheckin.maiaResponse.script}
                        highlight
                      />
                      <ResponseBlock
                        label="What to do"
                        content={latestCheckin.maiaResponse.action}
                      />
                      <ResponseBlock
                        label="When to worry"
                        content={latestCheckin.maiaResponse.threshold}
                      />
                    </div>

                    {/* Mentor button */}
                    {!latestCheckin.mentorReflection ? (
                      <button
                        onClick={() => requestMentor(latestCheckin.id)}
                        disabled={requestingMentor === latestCheckin.id}
                        className="mt-5 flex items-center gap-2 px-4 py-2 text-xs border border-slate-700 text-slate-400 rounded-lg hover:border-amber-700/50 hover:text-amber-200 disabled:opacity-50 transition-colors"
                      >
                        {requestingMentor === latestCheckin.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Reflecting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Ask MAIA Mentor
                          </>
                        )}
                      </button>
                    ) : (
                      <MentorReflectionCard reflection={latestCheckin.mentorReflection} />
                    )}

                    <div className="flex justify-between mt-5 pt-4 border-t border-slate-800">
                      <button
                        onClick={resetCheckin}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          resetCheckin();
                          setShowCheckin(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        Another check-in
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Astrology Panel */}
        <AnimatePresence>
          {showAstroPanel && astroSnapshot && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    What&apos;s Active
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadAstrology}
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowAstroPanel(false)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!astroSnapshot.hasBirthData ? (
                  <p className="text-xs text-slate-500">
                    Add birth data to {relationship.personName}&apos;s profile to see their astrology.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Natal snapshot */}
                    {astroSnapshot.natalSummary && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Natal</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-md bg-amber-950/30 border border-amber-800/30 text-amber-200">
                            ☀ {astroSnapshot.natalSummary.sun.sign} h{astroSnapshot.natalSummary.sun.house}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-md bg-blue-950/30 border border-blue-800/30 text-blue-200">
                            ☽ {astroSnapshot.natalSummary.moon.sign} h{astroSnapshot.natalSummary.moon.house}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/40 text-slate-300">
                            ↑ {astroSnapshot.natalSummary.rising}
                          </span>
                        </div>
                        {astroSnapshot.natalSummary.attachmentSignature && (
                          <p className="text-xs text-slate-400 italic">{astroSnapshot.natalSummary.attachmentSignature}</p>
                        )}
                      </div>
                    )}

                    {/* Active transits */}
                    {astroSnapshot.activeTransits.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Current Transits</p>
                        <div className="space-y-2">
                          {astroSnapshot.activeTransits.map((t, i) => (
                            <div key={i} className="rounded-lg p-3 bg-slate-800/30 border border-slate-800/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Flame className={`w-3 h-3 flex-shrink-0 ${
                                  t.intensity === 'high' ? 'text-red-400' :
                                  t.intensity === 'medium' ? 'text-amber-400' : 'text-slate-500'
                                }`} />
                                <span className="text-xs font-medium text-slate-300">
                                  {t.planet} {t.aspect} {t.natalPoint}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mb-0.5">{t.theme}</p>
                              {t.supportMove && (
                                <p className="text-xs text-amber-200/70">↳ {t.supportMove}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Synastry narrative */}
                    {astroSnapshot.synastryNarrative && (
                      <div className="pt-3 border-t border-slate-800">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Relational Signature</p>
                        <p className="text-xs text-slate-400 italic">{astroSnapshot.synastryNarrative}</p>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-700">
                      Computed {new Date(astroSnapshot.computedAt).toLocaleDateString()} · refreshes daily
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divination Result */}
        <AnimatePresence>
          {showDivinationResult && latestDivination && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    {latestDivination.divinationType === 'iching' ? (
                      <><BookOpen className="w-4 h-4 text-purple-400" /> I Ching</>
                    ) : (
                      <><Users className="w-4 h-4 text-blue-400" /> Council</>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowDivinationResult(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {latestDivination.question && (
                  <p className="text-xs text-slate-500 italic mb-4">&ldquo;{latestDivination.question}&rdquo;</p>
                )}

                {/* I Ching result */}
                {latestDivination.divinationType === 'iching' && latestDivination.ichingResult && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{latestDivination.ichingResult.hexagramCharacter}</span>
                      <div>
                        <p className="text-sm font-medium text-purple-200">
                          {latestDivination.ichingResult.hexagramNumber}. {latestDivination.ichingResult.hexagramName}
                        </p>
                        <p className="text-xs text-slate-500">{latestDivination.ichingResult.hexagramEnglish}</p>
                        {latestDivination.ichingResult.relatingHexagramName && (
                          <p className="text-xs text-slate-600">
                            → {latestDivination.ichingResult.relatingHexagramName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg p-3 bg-purple-950/20 border border-purple-800/30">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">MAIA Reading</p>
                      <p className="text-sm text-slate-300">{latestDivination.ichingResult.maiaInterpretation}</p>
                    </div>
                    <div className="rounded-lg p-3 bg-slate-800/30">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Judgment</p>
                      <p className="text-xs text-slate-400">{latestDivination.ichingResult.judgment}</p>
                    </div>
                    {latestDivination.ichingResult.changingLines.length > 0 && (
                      <p className="text-xs text-slate-600">
                        Changing lines: {latestDivination.ichingResult.changingLines.join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Council result */}
                {latestDivination.divinationType === 'council' && latestDivination.councilResult && (
                  <div className="space-y-3">
                    <div className="rounded-lg p-3 bg-blue-950/20 border border-blue-800/30">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Recommendation</p>
                      <p className="text-sm text-slate-300">{latestDivination.councilResult.recommendation}</p>
                    </div>
                    {latestDivination.councilResult.insights.length > 0 && (
                      <div className="rounded-lg p-3 bg-slate-800/30">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Insights</p>
                        <ul className="space-y-1">
                          {latestDivination.councilResult.insights.map((ins, i) => (
                            <li key={i} className="text-xs text-slate-300">· {ins}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {latestDivination.councilResult.tensions.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Tensions to hold</p>
                        <ul className="space-y-0.5">
                          {latestDivination.councilResult.tensions.map((t, i) => (
                            <li key={i} className="text-xs text-slate-500">↔ {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowDivinationResult(false)}
                  className="mt-4 text-xs text-slate-600 hover:text-slate-400"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        {checkins.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Timeline
            </h2>
            <div className="space-y-3">
              {checkins.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => setExpandedCheckin(expandedCheckin === c.id ? null : c.id)}
                    className="w-full text-left p-4 rounded-lg border border-slate-800/60 bg-slate-900/30 hover:border-slate-700/60 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white line-clamp-2">{c.whatHappened}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          {c.childState && (
                            <span className="text-xs text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/50">
                              {CHILD_STATE_LABELS[c.childState]}
                            </span>
                          )}
                          {c.mentorReflection && (
                            <span className="text-xs text-purple-400">
                              <Sparkles className="w-3 h-3 inline" /> Mentor
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 text-slate-600">
                        {expandedCheckin === c.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded view */}
                    <AnimatePresence>
                      {expandedCheckin === c.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-3 border-t border-slate-800"
                          onClick={e => e.stopPropagation()}
                        >
                          {c.parentNeed && (
                            <p className="text-xs text-slate-500 mb-3">
                              Need: {PARENT_NEED_LABELS[c.parentNeed]}
                            </p>
                          )}

                          {c.maiaResponse && (
                            <div className="space-y-3">
                              <ResponseBlock label="What this is" content={c.maiaResponse.framing} />
                              <ResponseBlock label="What to say" content={c.maiaResponse.script} highlight />
                              <ResponseBlock label="What to do" content={c.maiaResponse.action} />
                              <ResponseBlock label="When to worry" content={c.maiaResponse.threshold} />
                            </div>
                          )}

                          {/* Mentor section */}
                          {c.mentorReflection ? (
                            <MentorReflectionCard reflection={c.mentorReflection} />
                          ) : c.maiaResponse ? (
                            <button
                              onClick={() => requestMentor(c.id)}
                              disabled={requestingMentor === c.id}
                              className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs border border-slate-700 text-slate-400 rounded-lg hover:border-amber-700/50 hover:text-amber-200 disabled:opacity-50 transition-colors"
                            >
                              {requestingMentor === c.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Reflecting...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  Ask MAIA Mentor
                                </>
                              )}
                            </button>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for timeline */}
        {!loading && checkins.length === 0 && !showCheckin && (
          <div className="text-center py-8 text-slate-600 text-sm">
            No check-ins yet. Use the button above when something comes up.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function ResponseBlock({
  label,
  content,
  highlight,
}: {
  label: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-amber-950/20 border border-amber-800/30' : 'bg-slate-800/30'}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-sm ${highlight ? 'text-amber-100' : 'text-slate-300'}`}>{content}</p>
    </div>
  );
}

function MentorReflectionCard({ reflection }: { reflection: CheckinRecord['mentorReflection'] }) {
  if (!reflection) return null;
  return (
    <div className="mt-4 rounded-lg border border-purple-800/30 bg-purple-950/10 p-4">
      <h4 className="text-xs font-medium text-purple-300 mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        MAIA Mentor
      </h4>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Questions for you</p>
          <ul className="space-y-1">
            {reflection.questions.map((q, i) => (
              <li key={i} className="text-xs text-slate-300">
                {i + 1}. {q}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Sovereignty check</p>
          <p className="text-xs text-slate-300">{reflection.sovereigntyCheck}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Try this week</p>
          <p className="text-xs text-amber-200/80">{reflection.nextExperiment}</p>
        </div>
      </div>
    </div>
  );
}
