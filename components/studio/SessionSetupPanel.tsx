'use client';

/**
 * SessionSetupPanel — facilitation setup for a Studio Session (ADR-006).
 *
 * Studio is the facilitation layer: the practitioner picks a swappable meeting provider and
 * attaches Resources that belong to the Session (not the provider). Renders in the Session
 * Room setup phase and calls the studio_sessions APIs. A draft studio_session is created
 * lazily on first action, so opening the panel costs nothing.
 *
 * This first increment covers provider selection + resource attachment. Invitations
 * (consent-gated) attach to the same session via /studio-sessions/[id]/invite next.
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Presentation, Plus, X, Link2, Loader2 } from 'lucide-react';

const PROVIDERS: Array<{ value: string; label: string }> = [
  { value: 'none', label: 'No video' },
  { value: 'microsoft_teams', label: 'Microsoft Teams' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'jitsi', label: 'Jitsi' },
  { value: 'livekit', label: 'LiveKit' },
  { value: 'proton_meet', label: 'Proton Meet' },
  { value: 'custom', label: 'Other' },
];

const RESOURCE_KINDS = ['presentation', 'pdf', 'image', 'video', 'worksheet', 'whiteboard', 'link', 'document'];

interface SessionResource {
  id: string;
  externalUrl: string | null;
  resourceKind: string;
  title: string | null;
}

export default function SessionSetupPanel({ sessionTitle }: { sessionTitle?: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState('none');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [resources, setResources] = useState<SessionResource[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newKind, setNewKind] = useState('presentation');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create the studio_session lazily, on first action that needs one.
  async function ensureSession(): Promise<string | null> {
    if (sessionId) return sessionId;
    const res = await apiFetch('/api/studio/studio-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: sessionTitle?.trim() || 'Untitled session',
        meetingProvider: provider,
        meetingUrl: meetingUrl.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Could not start setup'); return null; }
    setSessionId(data.session.sessionId);
    return data.session.sessionId as string;
  }

  async function persistProvider(nextProvider: string, nextUrl: string) {
    setBusy(true); setError(null);
    try {
      const id = await ensureSession();
      if (!id) return;
      await apiFetch('/api/studio/studio-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, meetingProvider: nextProvider, meetingUrl: nextUrl.trim() || null }),
      });
    } finally { setBusy(false); }
  }

  async function addResource() {
    const url = newUrl.trim();
    if (!url) return;
    setBusy(true); setError(null);
    try {
      const id = await ensureSession();
      if (!id) return;
      const res = await apiFetch(`/api/studio/studio-sessions/${id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalUrl: url, resourceKind: newKind, title: url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not attach resource'); return; }
      setResources((prev) => [...prev, data.resource]);
      setNewUrl('');
    } finally { setBusy(false); }
  }

  async function removeResource(resourceId: string) {
    if (!sessionId) return;
    setResources((prev) => prev.filter((r) => r.id !== resourceId)); // optimistic
    await apiFetch(`/api/studio/studio-sessions/${sessionId}/resources?resourceId=${resourceId}`, { method: 'DELETE' });
  }

  const labelClass = 'text-xs text-slate-500 uppercase tracking-wider block mb-2';

  return (
    <div className="mb-6 rounded-xl border border-slate-800/50 bg-[#1a1a32] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Presentation className="w-4 h-4 text-amber-400/80" />
        <h3 className="text-sm font-medium text-white">Facilitation setup</h3>
        {busy && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
      </div>

      {/* Meeting provider — swappable service under the Session */}
      <div className="mb-4">
        <label className={labelClass}>Meeting provider</label>
        <div className="flex gap-2">
          <select
            value={provider}
            onChange={(e) => { setProvider(e.target.value); persistProvider(e.target.value, meetingUrl); }}
            className="flex-1 rounded-lg border border-slate-800/50 bg-[#1e1e38] text-sm text-slate-200 px-3 py-2.5 focus:border-slate-600 outline-none"
          >
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {provider !== 'none' && (
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            onBlur={() => persistProvider(provider, meetingUrl)}
            placeholder="Meeting link (optional)"
            className="mt-2 w-full rounded-lg border border-slate-800/50 bg-[#1e1e38] text-sm text-slate-200 px-3 py-2.5 focus:border-slate-600 outline-none placeholder:text-slate-600"
          />
        )}
        <p className="text-[10px] text-slate-600 mt-1.5">Resources stay with the session if you switch providers.</p>
      </div>

      {/* Resources — owned by the Session */}
      <div>
        <label className={labelClass}>Resources</label>
        {resources.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {resources.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-800/50 bg-[#1e1e38] px-3 py-2 text-sm text-slate-300">
                <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[10px] uppercase tracking-wider text-slate-500">{r.resourceKind}</span>
                <span className="flex-1 truncate">{r.title || r.externalUrl}</span>
                <button onClick={() => removeResource(r.id)} className="text-slate-600 hover:text-red-400" aria-label="Remove resource">
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <select
            value={newKind}
            onChange={(e) => setNewKind(e.target.value)}
            className="rounded-lg border border-slate-800/50 bg-[#1e1e38] text-xs text-slate-300 px-2 py-2.5 focus:border-slate-600 outline-none"
          >
            {RESOURCE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addResource(); }}
            placeholder="Paste a link (slides, PDF, whiteboard…)"
            className="flex-1 rounded-lg border border-slate-800/50 bg-[#1e1e38] text-sm text-slate-200 px-3 py-2.5 focus:border-slate-600 outline-none placeholder:text-slate-600"
          />
          <button
            onClick={addResource}
            disabled={busy || !newUrl.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-2.5 text-sm text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5">Upload files in Media Studio, then paste the link — or attach any external resource.</p>
      </div>

      {error && <p className="mt-3 text-xs text-red-400/80">{error}</p>}
    </div>
  );
}
