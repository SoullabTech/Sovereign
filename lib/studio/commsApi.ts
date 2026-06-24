/**
 * Comms Studio — client-side API layer (READ-ONLY)
 *
 * Thin typed fetchers over the live Comms Spine endpoints
 * (`/api/comms/*`). This module intentionally exposes ONLY read
 * operations: inbox, thread detail, and existing AI reply
 * suggestions. No compose / reply / send / acknowledge — outbound
 * actions are a separate, explicitly-authorized capability.
 *
 * All requests go through `apiFetch`, which attaches the member id
 * (x-member-id) for cross-device / Capacitor auth.
 *
 * @module lib/studio/commsApi
 */

import { apiFetch } from '@/lib/http/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (mirror the JSON shapes returned by /api/comms/*)
// ─────────────────────────────────────────────────────────────────────────────

export type CommsDomain = 'clinical' | 'ops' | 'community';
export type InboxFilter = 'all' | 'unread' | 'safety' | 'unanswered';
export type CommsSenderType = 'practitioner' | 'client' | 'system' | 'maia';
export type CommsSeverity = 'yellow' | 'red' | 'crisis';

export interface InboxThread {
  thread_id: string;
  domain: CommsDomain;
  thread_type: string;
  client_id: string | null;
  client_name: string | null;
  last_message_preview: string;
  last_message_at: string | null;
  last_message_sender: CommsSenderType;
  unread_count: number;
  has_safety_flag: boolean;
  highest_safety_severity: CommsSeverity | null;
}

export interface SafetyRibbon {
  has_unacknowledged: boolean;
  total_unacknowledged: number;
  highest_severity: CommsSeverity | null;
  by_severity: { crisis: number; red: number; yellow: number };
}

export interface InboxResponse {
  threads: InboxThread[];
  summary: {
    total_threads: number;
    total_unread: number;
    by_domain: { clinical: number; ops: number; community: number };
  };
  safety_ribbon: SafetyRibbon;
}

export interface MaiaAnalysis {
  inferred_urgency?: string;
  sentiment?: number;
  safety?: { detected?: boolean; severity?: string; safety_cues?: string[] };
  [key: string]: unknown;
}

export interface ThreadMessageSafetyFlag {
  id: string;
  severity: CommsSeverity;
  cues: string[];
  acknowledged_at: string | null;
  recommended_action: string | null;
}

export interface ThreadMessage {
  id: string;
  sender_type: CommsSenderType;
  sender_id: string | null;
  body: string;
  message_type: string | null;
  urgency: 'normal' | 'time_sensitive' | 'safety_concern';
  delivery_status: string;
  read_at: string | null;
  created_at: string;
  is_quick_response: boolean;
  quick_response_type: string | null;
  maia_analysis: MaiaAnalysis | null;
  safety_flags: ThreadMessageSafetyFlag[];
}

export interface ThreadDetail {
  thread: {
    thread_id: string;
    domain: CommsDomain;
    thread_type: string;
    client: {
      id: string;
      name: string;
      email?: string;
      spiral_stage?: string | null;
      last_session?: string | null;
    } | null;
    policy: unknown | null;
  };
  messages: ThreadMessage[];
  unread_count: number;
}

export interface ReplySuggestion {
  id: string;
  thread_id: string;
  message_id: string;
  kind: 'reply' | 'follow_up' | 'boundary' | 'safety';
  title: string | null;
  suggested_text: string;
  confidence: number;
  rationale: string | null;
  status: 'draft' | 'dismissed' | 'sent' | 'superseded';
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCHERS (read-only)
// ─────────────────────────────────────────────────────────────────────────────

export class CommsApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CommsApiError';
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error || '';
    } catch {
      /* non-JSON error body */
    }
    throw new CommsApiError(detail || `Request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

/** Fetch the unified practitioner inbox. */
export function fetchInbox(): Promise<InboxResponse> {
  return getJson<InboxResponse>('/api/comms/inbox');
}

/**
 * Fetch a single thread with its messages.
 * READ-ONLY: deliberately omits `mark_read` so viewing never mutates state.
 */
export function fetchThread(threadId: string): Promise<ThreadDetail> {
  return getJson<ThreadDetail>(`/api/comms/threads/${encodeURIComponent(threadId)}`);
}

/** Fetch existing (draft) AI reply suggestions for a thread. Display-only. */
export function fetchSuggestions(threadId: string): Promise<ReplySuggestion[]> {
  return getJson<{ suggestions: ReplySuggestion[]; count: number }>(
    `/api/comms/threads/${encodeURIComponent(threadId)}/suggested-replies?status=draft`
  ).then((r) => r.suggestions || []);
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Practitioner-facing labels for the backend comms domains.
 *
 * Translation layer: the domain KEYS (`clinical` / `ops` / `community`)
 * are the backend model and never change; these VALUES are the words the
 * practitioner actually sees. The UI should describe the practitioner's
 * world, not the database's — adjust these labels freely without touching
 * the domain model or any query.
 */
export const DOMAIN_LABEL: Record<CommsDomain, string> = {
  clinical: 'Clients',
  ops: 'Admin',
  community: 'Community',
};

export const SENDER_LABEL: Record<CommsSenderType, string> = {
  practitioner: 'You',
  client: 'Client',
  system: 'System',
  maia: 'MAIA',
};

/** Human-friendly thread title when no explicit subject exists. */
export function threadTitle(thread: Pick<InboxThread, 'client_name' | 'domain' | 'thread_type'>): string {
  if (thread.client_name) return thread.client_name;
  const type = thread.thread_type ? thread.thread_type.replace(/_/g, ' ') : '';
  return type ? `${DOMAIN_LABEL[thread.domain]} · ${type}` : DOMAIN_LABEL[thread.domain];
}

/** Relative timestamp for list/detail rows. */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
