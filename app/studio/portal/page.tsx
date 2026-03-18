'use client';

import { useEffect, useState } from 'react';
import { Globe, Send, CheckCircle2, Clock, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface PortalClient {
  id: string;
  name: string | null;
  email: string | null;
  portal_email: string | null;
  portal_claimed_at: string | null;
  invite_id: string | null;
  invite_status: string | null;
  expires_at: string | null;
  invite_sent_at: string | null;
  portal_slug: string;
}

function statusBadge(client: PortalClient) {
  if (client.portal_claimed_at) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 size={13} /> Active
      </span>
    );
  }
  if (client.invite_status === 'unused' && client.expires_at && new Date(client.expires_at) > new Date()) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
        <Clock size={13} /> Invited
      </span>
    );
  }
  if (client.invite_status === 'claimed') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 size={13} /> Active
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
      <AlertCircle size={13} /> Not invited
    </span>
  );
}

export default function StudioPortalPage() {
  const [clients, setClients] = useState<PortalClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sentResult, setSentResult] = useState<{ id: string; url?: string; error?: string } | null>(null);
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [portalSlug, setPortalSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/studio/whoami')
      .then(r => r.json())
      .then(d => {
        const pid = d.identity?.practitionerId;
        const slug = d.identity?.slug;
        if (pid) {
          setPractitionerId(pid);
          setPortalSlug(slug);
          return fetch(`/api/studio/portal?practitioner_id=${pid}`);
        }
      })
      .then(r => r?.json())
      .then(d => {
        if (d?.clients) setClients(d.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function sendInvite(clientId: string) {
    if (!practitionerId) return;
    setSending(clientId);
    setSentResult(null);
    try {
      const res = await fetch(`/api/studio/portal?practitioner_id=${practitionerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentResult({ id: clientId, url: data.claimUrl });
        // Refresh client list
        const updated = await fetch(`/api/studio/portal?practitioner_id=${practitionerId}`).then(r => r.json());
        if (updated.clients) setClients(updated.clients);
      } else {
        setSentResult({ id: clientId, error: data.error || 'Failed to send' });
      }
    } catch {
      setSentResult({ id: clientId, error: 'Network error' });
    } finally {
      setSending(null);
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://soullab.life';
  const portalUrl = portalSlug ? `${baseUrl}/portal/${portalSlug}` : null;

  const active = clients.filter(c => c.portal_claimed_at || c.invite_status === 'claimed');
  const invited = clients.filter(c => !c.portal_claimed_at && c.invite_status === 'unused' && c.expires_at && new Date(c.expires_at) > new Date());
  const uninvited = clients.filter(c => !c.portal_claimed_at && c.invite_status !== 'unused');

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={22} className="text-amber-400" />
          <h1 className="text-xl font-semibold text-white">Client Portal</h1>
        </div>
        <p className="text-sm text-zinc-400">
          Manage client portal access. Send invite links for clients to create their own login.
        </p>
      </div>

      {/* Portal URL */}
      {portalUrl && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Your Portal URL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-amber-300 bg-zinc-950 rounded-lg px-4 py-2.5 truncate">
              {portalUrl}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(portalUrl)}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Copy URL"
            >
              <Copy size={15} />
            </button>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Open portal"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-zinc-500 py-12 text-center">Loading clients…</div>
      ) : clients.length === 0 ? (
        <div className="text-sm text-zinc-500 py-12 text-center">
          No clients yet. Add clients in the Clients section first.
        </div>
      ) : (
        <div className="space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active', count: active.length, color: 'text-emerald-400' },
              { label: 'Invited', count: invited.length, color: 'text-amber-400' },
              { label: 'Not invited', count: uninvited.length, color: 'text-zinc-500' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Client list */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {clients.map((client, i) => (
              <div
                key={client.id}
                className={`flex items-center gap-4 px-5 py-4 ${i < clients.length - 1 ? 'border-b border-zinc-800' : ''}`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300 flex-shrink-0">
                  {(client.name || client.email || '?')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{client.name || '—'}</p>
                  <p className="text-xs text-zinc-500 truncate">{client.portal_email || client.email || 'No email'}</p>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {statusBadge(client)}
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {client.portal_claimed_at ? (
                    <span className="text-xs text-zinc-600">
                      Claimed {new Date(client.portal_claimed_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <button
                      onClick={() => sendInvite(client.id)}
                      disabled={sending === client.id}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending === client.id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      {client.invite_status === 'unused' ? 'Resend' : 'Send invite'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Last sent result */}
          {sentResult && (
            <div className={`rounded-xl border p-4 text-sm ${sentResult.error ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-emerald-800 bg-emerald-900/20 text-emerald-400'}`}>
              {sentResult.error ? (
                `Failed: ${sentResult.error}`
              ) : (
                <div>
                  <p className="font-medium mb-2">Invite sent.</p>
                  {sentResult.url && (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-black/30 rounded px-3 py-1.5 truncate text-emerald-300">
                        {sentResult.url}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(sentResult.url!)}
                        className="p-1.5 rounded bg-emerald-800/30 hover:bg-emerald-800/50 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
