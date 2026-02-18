"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import {
  ArrowLeft, Layers, Network, GitBranch, Layout, Server,
  Brain, Database, Link2, Search, ChevronRight, X,
  Flame, Droplets, Mountain, Wind, Sparkles,
  Shield, Mic, Eye, Settings, Users, Activity,
  Zap, Clock, BookOpen
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'architecture' | 'dataflow' | 'uiux' | 'api' | 'consciousness' | 'database' | 'connections';

interface APIRoute {
  endpoint: string;
  method: string;
  group: string;
  purpose: string;
}

interface DBTable {
  table: string;
  group: string;
  purpose: string;
}

interface Connection {
  source: string;
  target: string;
  domain: string;
  type: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const API_ROUTES: APIRoute[] = [
  { endpoint: 'POST /api/oracle/conversation', method: 'POST', group: 'oracle', purpose: 'Main conversation endpoint (Claude Opus 4.5, DEEP tier)' },
  { endpoint: 'POST /api/oracle/personal/insight', method: 'POST', group: 'oracle', purpose: 'Personal oracle memory-informed insight' },
  { endpoint: 'POST /api/oracle/personal/query', method: 'POST', group: 'oracle', purpose: 'Memory-enhanced personal query' },
  { endpoint: 'POST /api/oracle/personal/extract-symbols', method: 'POST', group: 'oracle', purpose: 'Extract symbolic resonances from text' },
  { endpoint: 'GET /api/oracle/insight-history', method: 'GET', group: 'oracle', purpose: 'Past insight retrieval' },
  { endpoint: 'POST /api/auth/credentials', method: 'POST', group: 'auth', purpose: 'Credential-based authentication' },
  { endpoint: 'GET /api/auth/whoami', method: 'GET', group: 'auth', purpose: 'Current session info' },
  { endpoint: 'POST /api/auth/webauthn/register/*', method: 'POST', group: 'auth', purpose: 'WebAuthn passkey registration' },
  { endpoint: 'POST /api/auth/google/connect', method: 'POST', group: 'auth', purpose: 'Google OAuth connection' },
  { endpoint: 'POST /api/auth/session/list', method: 'POST', group: 'auth', purpose: 'List active sessions' },
  { endpoint: 'GET /api/auth/roles', method: 'GET', group: 'auth', purpose: 'Get member roles' },
  { endpoint: 'POST /api/members/check', method: 'POST', group: 'members', purpose: 'Check if passkey exists (new vs returning)' },
  { endpoint: 'POST /api/members/register', method: 'POST', group: 'members', purpose: 'Register new member during onboarding' },
  { endpoint: 'POST /api/members/signin', method: 'POST', group: 'members', purpose: 'Authenticate returning member' },
  { endpoint: 'POST /api/members/recover', method: 'POST', group: 'members', purpose: 'Send passkey recovery email' },
  { endpoint: 'GET|POST /api/members/progress', method: 'GET/POST', group: 'members', purpose: 'Get/update onboarding progress' },
  { endpoint: 'GET|POST /api/consciousness/spiralogic', method: 'GET/POST', group: 'consciousness', purpose: 'Spiralogic cell inference & field events' },
  { endpoint: 'POST /api/ain/activate', method: 'POST', group: 'ain', purpose: 'Activate AIN intelligence network' },
  { endpoint: 'POST /api/ain/process', method: 'POST', group: 'ain', purpose: 'Process with AIN framework' },
  { endpoint: 'POST /api/ain/knowledge', method: 'POST', group: 'ain', purpose: 'AIN knowledge operations' },
  { endpoint: 'POST /api/ain/collective/breakthrough', method: 'POST', group: 'ain', purpose: 'Collective breakthrough detection' },
  { endpoint: 'POST /api/ain/telemetry', method: 'POST', group: 'ain', purpose: 'AIN telemetry collection' },
  { endpoint: 'GET /api/astrology/birth-chart', method: 'GET', group: 'astrology', purpose: 'Birth chart calculation' },
  { endpoint: 'GET /api/astrology/current-transits', method: 'GET', group: 'astrology', purpose: 'Current planetary transits' },
  { endpoint: 'GET /api/astrology/reading', method: 'GET', group: 'astrology', purpose: 'Personalized astrology reading' },
  { endpoint: 'POST /api/astrology/synastry/*', method: 'POST', group: 'astrology', purpose: 'Relationship synastry analysis' },
  { endpoint: 'GET /api/astrology/vedic/*', method: 'GET', group: 'astrology', purpose: 'Vedic astrology (Dasha, Gochara)' },
  { endpoint: 'GET|POST /api/circles', method: 'GET/POST', group: 'community', purpose: 'Join/create local circles' },
  { endpoint: 'POST /api/community/contribute', method: 'POST', group: 'community', purpose: 'Contribute to collective field' },
  { endpoint: 'GET /api/community/field-state', method: 'GET', group: 'community', purpose: 'Collective field snapshot' },
  { endpoint: 'GET /api/admin/command-center/*', method: 'GET', group: 'admin', purpose: 'System dashboard (overview, members, conversations)' },
  { endpoint: 'POST /api/admin/auth', method: 'POST', group: 'admin', purpose: 'Admin authentication' },
  { endpoint: 'GET /api/admin/opus-pulse/*', method: 'GET', group: 'admin', purpose: 'Opus conversation analysis dashboard' },
  { endpoint: 'POST /api/studio/personal/enter', method: 'POST', group: 'studio', purpose: 'Enter personal field mode' },
  { endpoint: 'GET /api/studio/field/pulse', method: 'GET', group: 'studio', purpose: 'Field pulse detection' },
  { endpoint: 'POST /api/capsules/*', method: 'POST', group: 'oracle', purpose: 'Memory capsule creation/retrieval' },
  { endpoint: 'POST /api/selflet/*', method: 'POST', group: 'oracle', purpose: 'Selflet chain operations' },
  { endpoint: 'GET /api/health', method: 'GET', group: 'admin', purpose: 'System health check (DB, tables, memory)' },
  { endpoint: 'POST /api/feedback', method: 'POST', group: 'admin', purpose: 'User feedback collection' },
  { endpoint: 'POST /api/voice/*', method: 'POST', group: 'oracle', purpose: 'Voice processing endpoints' },
  { endpoint: 'POST /api/settings/voice', method: 'POST', group: 'studio', purpose: 'Voice & sanctuary settings' },
];

const DB_TABLES: DBTable[] = [
  { table: 'members', group: 'identity', purpose: 'User accounts (passkey, username, email, onboarded)' },
  { table: 'member_settings', group: 'identity', purpose: 'Per-member preferences (voice, theme, sanctuary)' },
  { table: 'member_spiral_state', group: 'consciousness', purpose: 'Bridge D: Structural spiral position (element, phase, motion)' },
  { table: 'member_birth_data', group: 'astrology', purpose: 'Birth chart data (date/time/location)' },
  { table: 'member_preferred_name', group: 'identity', purpose: 'Display name override' },
  { table: 'password_reset_tokens', group: 'identity', purpose: 'Temporary password reset tokens' },
  { table: 'gift_passkeys', group: 'identity', purpose: 'Passkeys for new user invites' },
  { table: 'conversation_turns', group: 'conversation', purpose: 'Individual message exchanges' },
  { table: 'cognitive_turn_events', group: 'conversation', purpose: 'Deeper consciousness events per turn' },
  { table: 'session_memory', group: 'memory', purpose: 'Session-scoped memories' },
  { table: 'relationship_memory', group: 'memory', purpose: 'Relationship-specific anamnesis' },
  { table: 'episodic_memories', group: 'memory', purpose: 'Event-based memories' },
  { table: 'somatic_memories', group: 'memory', purpose: 'Body/feeling memories' },
  { table: 'morphic_pattern_memories', group: 'memory', purpose: 'Pattern resonances' },
  { table: 'selflet_chain', group: 'memory', purpose: 'Memory capsule storage (pgvector embeddings)' },
  { table: 'expansion_events', group: 'consciousness', purpose: 'User growth milestones' },
  { table: 'consciousness_traces', group: 'consciousness', purpose: 'Consciousness decision audit trail' },
  { table: 'consciousness_achievements', group: 'consciousness', purpose: 'Unlocked consciousness milestones' },
  { table: 'oracle_usage_events', group: 'consciousness', purpose: 'Oracle API call tracking' },
  { table: 'opus_axiom_turns', group: 'consciousness', purpose: 'Opus axiom validation logs' },
  { table: 'ain_executor_runs', group: 'consciousness', purpose: 'AIN framework execution logs' },
  { table: 'episodes', group: 'bardic', purpose: 'Narrative episodes/stories' },
  { table: 'bardic_embeddings', group: 'bardic', purpose: 'Narrative embeddings (pgvector)' },
  { table: 'bardic_cues', group: 'bardic', purpose: 'Trigger cues for story recalls' },
  { table: 'circles', group: 'community', purpose: 'Local community groups' },
  { table: 'community_bbs_posts', group: 'community', purpose: 'Forum/BBS posts' },
  { table: 'collective_breakthrough_events', group: 'community', purpose: 'Shared breakthroughs' },
  { table: 'coherence_field_readings', group: 'community', purpose: 'Collective coherence snapshots' },
  { table: 'synastry_analyses', group: 'astrology', purpose: 'Relationship chart comparisons' },
  { table: 'practitioner_caseload', group: 'practitioner', purpose: 'Clients per practitioner' },
  { table: 'supervision_sessions', group: 'practitioner', purpose: 'Supervision with trainer' },
  { table: 'academy_paths', group: 'practitioner', purpose: 'Learning paths for academy' },
  { table: 'storage_consent', group: 'identity', purpose: 'Opt-in for memory storage' },
  { table: 'elemental_journal', group: 'consciousness', purpose: 'Elemental tracking entries' },
  { table: 'practice_sessions', group: 'consciousness', purpose: 'Practice session metadata' },
  { table: 'missions', group: 'consciousness', purpose: 'Challenges/quests' },
  { table: 'platform_feedback', group: 'identity', purpose: 'Feature feedback' },
];

const CONNECTIONS: Connection[] = [
  { source: 'OracleConversation', target: 'POST /api/oracle/conversation', domain: 'oracle', type: 'API call' },
  { source: '/api/oracle/conversation', target: 'loadSpiralState()', domain: 'oracle', type: 'DB read' },
  { source: '/api/oracle/conversation', target: 'inferSpiralogicCell()', domain: 'consciousness', type: 'Function call' },
  { source: '/api/oracle/conversation', target: 'chooseFrameworks()', domain: 'consciousness', type: 'Function call' },
  { source: '/api/oracle/conversation', target: 'Conductor (hysteresis)', domain: 'voice', type: 'State machine' },
  { source: '/api/oracle/conversation', target: 'enforceFieldSafety()', domain: 'consciousness', type: 'Safety check' },
  { source: '/api/oracle/conversation', target: 'Claude Opus 4.5', domain: 'oracle', type: 'LLM call' },
  { source: '/api/oracle/conversation', target: 'upsertSpiralState()', domain: 'memory', type: 'Fire-and-forget' },
  { source: '/api/oracle/conversation', target: 'logMaiaTurn()', domain: 'memory', type: 'Fire-and-forget' },
  { source: '/api/oracle/conversation', target: 'sessionMemory.getRecent()', domain: 'memory', type: 'DB read' },
  { source: '/api/oracle/conversation', target: 'getRelationshipAnamnesis()', domain: 'memory', type: 'DB read' },
  { source: '/api/oracle/conversation', target: 'getAstrologyContext()', domain: 'oracle', type: 'Context enrichment' },
  { source: 'VoiceHUD', target: 'localStorage (maia_settings)', domain: 'voice', type: 'Client storage' },
  { source: 'Conductor', target: 'member_spiral_state (Bridge D)', domain: 'voice', type: 'DB seed on restart' },
  { source: 'SacredHoloflower', target: 'Oracle response metadata', domain: 'oracle', type: 'State sync' },
  { source: '/api/members/register', target: 'members table', domain: 'auth', type: 'DB write' },
  { source: '/api/members/signin', target: 'members table', domain: 'auth', type: 'DB read' },
  { source: 'apiFetch()', target: 'x-member-id header', domain: 'auth', type: 'Identity transport' },
  { source: 'Studio Field', target: '/api/studio/field/pulse', domain: 'studio', type: 'API call' },
  { source: 'AIN Network', target: '/api/ain/process', domain: 'consciousness', type: 'Intelligence routing' },
  { source: 'Selflet System', target: 'selflet_chain + pgvector', domain: 'memory', type: 'Embedding search' },
  { source: 'Bardic System', target: 'episodes + bardic_embeddings', domain: 'memory', type: 'Narrative search' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Layers size={14} /> },
  { id: 'architecture', label: 'Architecture', icon: <Network size={14} /> },
  { id: 'dataflow', label: 'Data Flow', icon: <GitBranch size={14} /> },
  { id: 'uiux', label: 'UI/UX Flows', icon: <Layout size={14} /> },
  { id: 'api', label: 'API Surface', icon: <Server size={14} /> },
  { id: 'consciousness', label: 'Consciousness', icon: <Brain size={14} /> },
  { id: 'database', label: 'Database', icon: <Database size={14} /> },
  { id: 'connections', label: 'Connections', icon: <Link2 size={14} /> },
];

function groupBadgeColor(group: string): string {
  const map: Record<string, string> = {
    oracle: 'bg-red-500/15 text-red-400',
    auth: 'bg-green-500/15 text-green-400',
    members: 'bg-green-500/15 text-green-400',
    consciousness: 'bg-purple-500/15 text-purple-400',
    ain: 'bg-purple-500/15 text-purple-400',
    astrology: 'bg-violet-500/15 text-violet-400',
    community: 'bg-teal-500/15 text-teal-400',
    admin: 'bg-amber-500/15 text-amber-400',
    studio: 'bg-amber-500/15 text-amber-400',
    identity: 'bg-green-500/15 text-green-400',
    conversation: 'bg-blue-500/15 text-blue-400',
    memory: 'bg-blue-500/15 text-blue-400',
    bardic: 'bg-fuchsia-500/15 text-fuchsia-400',
    practitioner: 'bg-amber-500/15 text-amber-400',
    voice: 'bg-amber-500/15 text-amber-400',
  };
  return map[group] || 'bg-white/10 text-white/60';
}

function elementBorder(el: string): string {
  const map: Record<string, string> = {
    fire: 'border-l-red-500',
    water: 'border-l-blue-500',
    earth: 'border-l-green-500',
    air: 'border-l-violet-400',
    aether: 'border-l-fuchsia-400',
  };
  return map[el] || '';
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-amber-400">{value}</div>
      <div className="text-[11px] text-white/40 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Card({ children, className = '', element }: { children: React.ReactNode; className?: string; element?: string }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 transition-all hover:border-amber-500/40 hover:shadow-[0_0_18px_rgba(245,158,11,0.06)] ${element ? `border-l-[3px] ${elementBorder(element)}` : ''} ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, group }: { children: React.ReactNode; group: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${groupBadgeColor(group)}`}>
      {children}
    </span>
  );
}

function FlowNode({ children, highlight, onClick }: { children: React.ReactNode; highlight?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 border rounded-lg px-3 py-2 text-xs cursor-pointer transition-all hover:border-amber-500/60 hover:-translate-y-0.5 ${highlight ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/10'}`}
    >
      {children}
    </div>
  );
}

function FlowArrow() {
  return <ChevronRight size={14} className="text-white/30 shrink-0" />;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs transition-all ${active ? 'border-amber-500 text-amber-400 bg-amber-500/8' : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/70'}`}
    >
      {label}
    </button>
  );
}

function ArchNode({ title, sub, onClick }: { title: string; sub: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-center cursor-pointer transition-all hover:border-amber-500/60 hover:-translate-y-0.5 hover:shadow-md min-w-[120px]"
    >
      <div className="text-white text-xs font-semibold">{title}</div>
      <div className="text-white/40 text-[10px] mt-0.5">{sub}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg text-white font-medium mt-8 mb-3 pb-2 border-b border-white/10">
      {children}
    </h2>
  );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

const DETAILS: Record<string, { title: string; content: React.ReactNode }> = {
  'oracle-conv': {
    title: 'OracleConversation Component',
    content: (
      <div className="space-y-2 text-sm text-white/60">
        <p>The main chat interface in /maia. Handles:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Chat history display (max 100 messages)</li>
          <li>Voice recording via ContinuousConversation (Web Speech API)</li>
          <li>Streaming response rendering</li>
          <li>WebRTC audio playback</li>
          <li>VoiceHUD overlay integration</li>
          <li>Holoflower motion state sync</li>
        </ul>
        <p className="font-mono text-[11px] text-white/30 mt-3">components/OracleConversation.tsx</p>
      </div>
    ),
  },
  'holoflower': {
    title: 'SacredHoloflower',
    content: (
      <div className="space-y-2 text-sm text-white/60">
        <p>12-petal mandala visualizing consciousness state:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Motion states: idle &rarr; listening &rarr; processing &rarr; responding &rarr; breakthrough</li>
          <li>Coherence visualization (0.0-1.0)</li>
          <li>Voice amplitude display</li>
          <li>Element-based color coding</li>
        </ul>
        <p className="font-mono text-[11px] text-white/30 mt-3">components/sacred/SacredHoloflower.tsx</p>
      </div>
    ),
  },
  'conductor': {
    title: 'Voice Conductor (State Machine)',
    content: (
      <div className="space-y-2 text-sm text-white/60">
        <p>The ONLY place that turns oracle state into voice state. Manages element hysteresis, archetype selection, and in-memory buffer per member. Bridge D seeds from DB on server restart.</p>
        <p className="font-mono text-[11px] text-white/30 mt-3">lib/voice/conductor.ts</p>
      </div>
    ),
  },
  'spiralogic': {
    title: 'Spiralogic Core',
    content: (
      <div className="space-y-2 text-sm text-white/60">
        <p>The consciousness mapping framework:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Element:</strong> Fire | Water | Earth | Air | Aether</li>
          <li><strong>Phase:</strong> 1-3 within each element</li>
          <li><strong>Arc:</strong> regressive | progressive</li>
          <li><strong>Cell:</strong> element + phase + arc + context</li>
        </ul>
        <p className="font-mono text-[11px] text-white/30 mt-3">lib/consciousness/spiralogic-core.ts</p>
      </div>
    ),
  },
  'oracle-api': {
    title: 'Oracle API Endpoint',
    content: (
      <div className="space-y-2 text-sm text-white/60">
        <p>Premium DEEP oracle. Always uses Claude Opus 4.5. Full pipeline: Load spiral state &rarr; Build consciousness context &rarr; Infer spiralogic cell &rarr; Choose frameworks &rarr; Create voice intent &rarr; Safety check &rarr; Call Claude &rarr; Validate axioms &rarr; Stream response &rarr; Fire-and-forget persistence.</p>
        <p className="font-mono text-[11px] text-white/30 mt-3">app/api/oracle/conversation/route.ts</p>
      </div>
    ),
  },
};

function DetailPanel({ id, onClose }: { id: string | null; onClose: () => void }) {
  if (!id || !DETAILS[id]) return null;
  const { title, content } = DETAILS[id];
  return (
    <div className="bg-white/5 border border-amber-500/40 rounded-xl p-5 mt-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-amber-400 font-medium">{title}</h4>
        <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
      </div>
      {content}
    </div>
  );
}

// ─── Tab Panels ──────────────────────────────────────────────────────────────

function OverviewPanel() {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <StatCard value="150+" label="Lib Modules" />
        <StatCard value="90+" label="API Routes" />
        <StatCard value="70+" label="Components" />
        <StatCard value="80+" label="DB Migrations" />
        <StatCard value="60+" label="Pages" />
        <StatCard value="3" label="Voice Modes" />
      </div>

      <SectionTitle>Platform Identity</SectionTitle>
      <Card>
        <h3 className="text-amber-400 text-sm font-semibold mb-2">What MAIA Is</h3>
        <p className="text-white/50 text-sm leading-relaxed">A self-hosted, sovereign consciousness companion. Supports human coherence, truth-telling, and inner guidance without eroding agency. Governed by vows: consent, containment, non-manipulation. Speaks in distinct modes (Talk, Care, Note) oriented by Spiralogic and AIN principles.</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card>
          <h3 className="text-amber-400 text-sm font-semibold mb-2">Non-Negotiables</h3>
          <div className="text-white/50 text-sm space-y-1">
            <p><strong className="text-white/70">Sovereignty first</strong> &mdash; Human agency {'>'} engagement metrics</p>
            <p><strong className="text-white/70">Consent for memory</strong> &mdash; No stealth memory (Sanctuary Mode)</p>
            <p><strong className="text-white/70">No coercion</strong> &mdash; Reflection, not command</p>
            <p><strong className="text-white/70">No attachment capture</strong> &mdash; No emotional dependency</p>
            <p><strong className="text-white/70">Self-hosted</strong> &mdash; Mac Studio + Docker + Caddy</p>
          </div>
        </Card>
        <Card>
          <h3 className="text-amber-400 text-sm font-semibold mb-2">Tech Stack</h3>
          <div className="text-white/50 text-sm space-y-1">
            <p><strong className="text-white/70">Frontend:</strong> Next.js 16 + Turbopack + Framer Motion</p>
            <p><strong className="text-white/70">Consciousness Engine:</strong> PFI (Panconscious Field Intelligence) — sovereign, self-hosted primary</p>
            <p><strong className="text-white/70">Reasoning Council:</strong> Ollama (DeepSeek-R1, Mistral, Qwen3, Llama, Gemma2) — local-first</p>
            <p><strong className="text-white/70">Voice / Comms:</strong> Claude (Anthropic) — articulation support layer only</p>
            <p><strong className="text-white/70">Synthesis:</strong> Moonshot/Kimi — library distillation, backstage only</p>
            <p><strong className="text-white/70">TTS:</strong> Kokoro (local) primary, browser Web Speech fallback</p>
            <p><strong className="text-white/70">Database:</strong> Self-hosted PostgreSQL (Docker)</p>
            <p><strong className="text-white/70">Proxy:</strong> Caddy (auto TLS via Let&apos;s Encrypt)</p>
            <p><strong className="text-white/70">Mobile:</strong> Capacitor (iOS static export)</p>
            <p><strong className="text-white/70">Domain:</strong> soullab.life</p>
          </div>
        </Card>
      </div>

      <SectionTitle>System Domains</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        <Card element="fire"><h3 className="text-sm font-semibold mb-1"><Badge group="oracle">FIRE</Badge> <span className="text-white/80 ml-1">Oracle & Conversation</span></h3><p className="text-white/50 text-xs">PFI consciousness engine primary. Spiralogic cell inference, framework selection. Claude handles voice articulation. Ollama Reasoning Council for depth analysis.</p></Card>
        <Card element="water"><h3 className="text-sm font-semibold mb-1"><Badge group="memory">WATER</Badge> <span className="text-white/80 ml-1">Memory & Continuity</span></h3><p className="text-white/50 text-xs">Session memory, relationship anamnesis, Bridge D spiral state persistence, selflet capsules, bardic episodes.</p></Card>
        <Card element="earth"><h3 className="text-sm font-semibold mb-1"><Badge group="auth">EARTH</Badge> <span className="text-white/80 ml-1">Identity & Auth</span></h3><p className="text-white/50 text-xs">Passkey-based membership. Cross-device recognition. WebAuthn, OAuth, biometric auth. x-member-id header for iOS.</p></Card>
        <Card element="air"><h3 className="text-sm font-semibold mb-1"><Badge group="astrology">AIR</Badge> <span className="text-white/80 ml-1">Learning & Evolution</span></h3><p className="text-white/50 text-xs">Academy paths, practice worlds, missions, pattern detection, wisdom library, astrology, I Ching.</p></Card>
        <Card element="aether"><h3 className="text-sm font-semibold mb-1"><Badge group="consciousness">AETHER</Badge> <span className="text-white/80 ml-1">Community & Field</span></h3><p className="text-white/50 text-xs">Circles, commons, collective breakthroughs, coherence field, practitioner portal, supervision.</p></Card>
      </div>
    </div>
  );
}

function ArchitecturePanel() {
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <div>
      <SectionTitle>Layered Architecture</SectionTitle>
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
        {/* UI Layer */}
        <div className="border border-dashed border-white/10 rounded-xl p-4 relative">
          <span className="absolute -top-2.5 left-4 bg-[#0f1328] px-2 text-[10px] text-white/30 uppercase tracking-widest">UI Layer (Client)</span>
          <div className="flex flex-wrap gap-2 pt-2">
            <ArchNode title="OracleConversation" sub="Main chat interface" onClick={() => setDetail('oracle-conv')} />
            <ArchNode title="SacredHoloflower" sub="Consciousness viz" onClick={() => setDetail('holoflower')} />
            <ArchNode title="VoiceHUD" sub="4 sacred controls" />
            <ArchNode title="Settings Panel" sub="Voice, Memory, etc." />
            <ArchNode title="Studio" sub="Field + Practice" />
            <ArchNode title="Onboarding" sub="5-step sacred flow" />
          </div>
        </div>

        <p className="text-center text-white/30 text-xs">&darr; apiFetch() + x-member-id &darr;</p>

        {/* API Layer */}
        <div className="border border-dashed border-white/10 rounded-xl p-4 relative">
          <span className="absolute -top-2.5 left-4 bg-[#0f1328] px-2 text-[10px] text-white/30 uppercase tracking-widest">API Layer (Next.js Routes)</span>
          <div className="flex flex-wrap gap-2 pt-2">
            <ArchNode title="/api/oracle" sub="Conversation endpoint" onClick={() => setDetail('oracle-api')} />
            <ArchNode title="/api/members" sub="Auth & identity" />
            <ArchNode title="/api/consciousness" sub="Spiralogic inference" />
            <ArchNode title="/api/ain" sub="Intelligence network" />
            <ArchNode title="/api/studio" sub="Field & practice" />
            <ArchNode title="/api/voice" sub="Voice processing" />
            <ArchNode title="/api/astrology" sub="Charts & transits" />
          </div>
        </div>

        <p className="text-center text-white/30 text-xs">&darr; lib/ modules &darr;</p>

        {/* Consciousness Engine */}
        <div className="border border-dashed border-white/10 rounded-xl p-4 relative">
          <span className="absolute -top-2.5 left-4 bg-[#0f1328] px-2 text-[10px] text-white/30 uppercase tracking-widest">Consciousness Engine</span>
          <div className="flex flex-wrap gap-2 pt-2">
            <ArchNode title="Conductor" sub="Voice state machine" onClick={() => setDetail('conductor')} />
            <ArchNode title="Spiralogic Core" sub="Element/Phase/Arc" onClick={() => setDetail('spiralogic')} />
            <ArchNode title="LLM Provider" sub="Claude + Ollama" />
            <ArchNode title="Voice Commands" sub="Mode detection" />
            <ArchNode title="Guardrails" sub="Safety + sovereignty" />
            <ArchNode title="Opus Axioms" sub="Response validation" />
          </div>
        </div>

        <p className="text-center text-white/30 text-xs">&darr; lib/db/postgres.ts &darr;</p>

        {/* Persistence */}
        <div className="border border-dashed border-white/10 rounded-xl p-4 relative">
          <span className="absolute -top-2.5 left-4 bg-[#0f1328] px-2 text-[10px] text-white/30 uppercase tracking-widest">Persistence Layer</span>
          <div className="flex flex-wrap gap-2 pt-2">
            <ArchNode title="PostgreSQL" sub="Self-hosted Docker" />
            <ArchNode title="Bridge D" sub="Spiral state persist" />
            <ArchNode title="Session Memory" sub="Turn history" />
            <ArchNode title="Anamnesis" sub="Relationship memory" />
            <ArchNode title="Selflet Chain" sub="Memory capsules" />
            <ArchNode title="Embeddings" sub="pgvector search" />
          </div>
        </div>

        <p className="text-center text-white/30 text-xs">&darr; Docker Compose &darr;</p>

        {/* Infrastructure */}
        <div className="border border-dashed border-white/10 rounded-xl p-4 relative">
          <span className="absolute -top-2.5 left-4 bg-[#0f1328] px-2 text-[10px] text-white/30 uppercase tracking-widest">Infrastructure</span>
          <div className="flex flex-wrap gap-2 pt-2">
            <ArchNode title="Mac Studio" sub="Physical server" />
            <ArchNode title="Caddy" sub="Reverse proxy + TLS" />
            <ArchNode title="maia-sovereign" sub="Next.js :3000" />
            <ArchNode title="maia-api" sub="Backend :3001" />
            <ArchNode title="maia-whisper" sub="Speech processing" />
            <ArchNode title="maia-rlm" sub="Reasoning module" />
          </div>
        </div>
      </div>

      <DetailPanel id={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function DataFlowPanel() {
  return (
    <div>
      <SectionTitle>Conversation Data Flow</SectionTitle>
      <p className="text-white/40 text-sm mb-4">Traces a full oracle conversation request from user input to streamed response.</p>

      <div className="space-y-4">
        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">1. User Input</h3><div className="flex items-center gap-2 flex-wrap"><FlowNode highlight>Voice/Text Input</FlowNode><FlowArrow /><FlowNode>OracleConversation.tsx</FlowNode><FlowArrow /><FlowNode>POST /api/oracle/conversation</FlowNode><FlowArrow /><FlowNode>x-member-id header</FlowNode></div></Card>

        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">2. Load Context (Parallel)</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2"><FlowNode>loadSpiralState()<br /><span className="text-white/30">Bridge D: element, phase, motion</span></FlowNode><FlowNode>sessionMemory.getRecent(5)<br /><span className="text-white/30">Last 5 conversation turns</span></FlowNode><FlowNode>getAstrologyContext()<br /><span className="text-white/30">Birth chart + transits</span></FlowNode></div><div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2"><FlowNode>getRelationshipAnamnesis()<br /><span className="text-white/30">Past relationship data</span></FlowNode><FlowNode>searchWisdomLibrary()<br /><span className="text-white/30">Relevant wisdom sources</span></FlowNode><FlowNode>loadMemberSettings()<br /><span className="text-white/30">Preferences, mode, voice</span></FlowNode></div></Card>

        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">3. Consciousness Processing</h3><div className="flex items-center gap-2 flex-wrap"><FlowNode>inferSpiralogicCell()</FlowNode><FlowArrow /><FlowNode>chooseFrameworks()</FlowNode><FlowArrow /><FlowNode>selectCanonicalQuestion()</FlowNode><FlowArrow /><FlowNode>createVoiceIntent()</FlowNode></div><p className="text-white/30 text-xs mt-2">Determines: Element + Phase (1-3) + Arc (regressive/progressive) + Frameworks (IPP, CBT, Jungian, etc.)</p></Card>

        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">4. Conductor Hysteresis</h3><div className="flex items-center gap-2 flex-wrap"><FlowNode>Proposed Element</FlowNode><FlowArrow /><FlowNode>Hysteresis Buffer<br /><span className="text-white/30">Need 2+ turns OR intensity &gt; 0.8</span></FlowNode><FlowArrow /><FlowNode highlight>Confirmed Element</FlowNode></div></Card>

        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">5. Safety + Intelligence Routing</h3><div className="flex items-center gap-2 flex-wrap"><FlowNode>enforceFieldSafety()</FlowNode><FlowArrow /><FlowNode highlight>PFI → Reasoning Council → Claude (voice)</FlowNode><FlowArrow /><FlowNode>evaluateAxioms()</FlowNode><FlowArrow /><FlowNode>Stream Response</FlowNode></div></Card>

        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">6. Fire-and-Forget Logging</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2"><FlowNode>logMaiaTurn()</FlowNode><FlowNode>logOpusAxioms()</FlowNode><FlowNode>logOracleUsage()</FlowNode><FlowNode>upsertSpiralState()</FlowNode></div><p className="text-white/30 text-xs mt-2">All non-blocking. Oracle response never delayed by persistence.</p></Card>

        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">7. Client Rendering</h3><div className="flex items-center gap-2 flex-wrap"><FlowNode>Stream Text</FlowNode><FlowArrow /><FlowNode>Voice Synthesis</FlowNode><FlowArrow /><FlowNode>Holoflower Motion</FlowNode><FlowArrow /><FlowNode>Element Indicator</FlowNode><FlowArrow /><FlowNode>Pattern Chips</FlowNode></div></Card>
      </div>
    </div>
  );
}

function UIUXPanel() {
  return (
    <div>
      <SectionTitle>Onboarding Flow</SectionTitle>
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <FlowNode highlight>/begin</FlowNode><FlowArrow />
        <FlowNode>/test-elemental</FlowNode><FlowArrow />
        <FlowNode>/faq</FlowNode><FlowArrow />
        <FlowNode>/onboarding</FlowNode><FlowArrow />
        <FlowNode>/choose</FlowNode><FlowArrow />
        <FlowNode highlight>/maia</FlowNode>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">/begin &mdash; Landing</h3><p className="text-white/50 text-xs"><strong className="text-white/70">Visual:</strong> Teal/sage gradient (#A0C4C7 &rarr; #7FB5B3)<br /><strong className="text-white/70">Components:</strong> Holoflower, BeginPage<br /><strong className="text-white/70">Action:</strong> &ldquo;Begin Journey&rdquo; button</p></Card>
        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">/test-elemental &mdash; Induction</h3><p className="text-white/50 text-xs"><strong className="text-white/70">Components:</strong> SacredSoulInduction + ElementalOrientation<br /><strong className="text-white/70">Phases:</strong> arrival &rarr; recognition &rarr; creation &rarr; blessing<br /><strong className="text-white/70">Elements:</strong> IF(Fire) &rarr; WHY(Water) &rarr; HOW(Earth) &rarr; WHAT(Air) &rarr; SOUL(Aether)</p></Card>
        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">/choose &mdash; Fork</h3><p className="text-white/50 text-xs"><Badge group="oracle">For Me</Badge> &rarr; Personal Field (Decisions, Changes, Vault, MAIA)<br /><Badge group="community">For My Practice</Badge> &rarr; Practitioner Studio (Clients, Sessions, Calendar)</p></Card>
        <Card><h3 className="text-amber-400 text-sm font-semibold mb-2">/maia &mdash; Main App</h3><p className="text-white/50 text-xs"><strong className="text-white/70">Components:</strong> OracleConversation + SacredHoloflower + VoiceHUD<br /><strong className="text-white/70">Layout:</strong> Dark navy, centered conversation, minimal chrome<br /><strong className="text-white/70">Drawers:</strong> Labs, Academy, Changes, Journal, Settings</p></Card>
      </div>

      <SectionTitle>Voice Modes</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        <Card element="fire"><h3 className="text-sm font-semibold text-white/80 mb-1">Talk Mode</h3><p className="text-white/50 text-xs">Direct dialogue. Responsive, efficient. Standard oracle conversation.</p></Card>
        <Card element="water"><h3 className="text-sm font-semibold text-white/80 mb-1">Care Mode</h3><p className="text-white/50 text-xs">Therapeutic holding. Sub-modes: presence, nervous-system, somatic, emotional, relational, parts, existential, grief, anxiety, night, aftercare</p></Card>
        <Card element="earth"><h3 className="text-sm font-semibold text-white/80 mb-1">Scribe / Note Mode</h3><p className="text-white/50 text-xs">Silent observation. Lenses: pure, archetypal, body, relational, story, timeline, highlights, dream</p></Card>
      </div>

      <SectionTitle>Design System</SectionTitle>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-amber-400 text-sm font-semibold mb-2">Color Tokens</h3>
          <div className="flex gap-1 flex-wrap mt-2">
            {[
              ['#0b0f1c','navy-950'], ['#0f1328','navy-900'], ['#121833','navy-850'], ['#161d3a','navy-800'],
              ['#fbbf24','spice-400'], ['#f59e0b','spice-500'],
              ['#5eead4','sage-400'], ['#14b8a6','sage-500'],
              ['#ef4444','fire'], ['#3b82f6','water'], ['#22c55e','earth'], ['#a78bfa','air'], ['#e879f9','aether'],
            ].map(([color, name]) => (
              <div key={name} className="w-8 h-6 rounded border border-white/10" style={{ background: color }} title={name} />
            ))}
          </div>
          <p className="text-white/30 text-xs mt-2">Navy depth layers. Spice (amber) CTAs. Sage (teal) onboarding. Element colors for state.</p>
        </Card>
        <Card>
          <h3 className="text-amber-400 text-sm font-semibold mb-2">Typography</h3>
          <div className="text-white/50 text-xs space-y-1">
            <p><strong className="text-white/70">Cinzel</strong> &mdash; Formal/ceremonial headings</p>
            <p><strong className="text-white/70">Spectral</strong> &mdash; Serif body text</p>
            <p><strong className="text-white/70">Cormorant</strong> &mdash; Literary/poetic</p>
            <p><strong className="text-white/70">Raleway</strong> &mdash; Modern sans-serif UI</p>
            <p><strong className="text-white/70">IBM Plex Sans</strong> &mdash; Body text</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function APIPanel() {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const groups = ['all', 'oracle', 'auth', 'members', 'consciousness', 'ain', 'astrology', 'community', 'admin', 'studio'];

  const filtered = useMemo(() => {
    return API_ROUTES.filter(r => {
      const matchesGroup = group === 'all' || r.group === group;
      const matchesSearch = !search || r.endpoint.toLowerCase().includes(search.toLowerCase()) || r.purpose.toLowerCase().includes(search.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [search, group]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search API routes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white/80 outline-none focus:border-amber-500/60 placeholder:text-white/30"
        />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {groups.map(g => (
          <FilterChip key={g} label={g} active={group === g} onClick={() => setGroup(g)} />
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10"><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Endpoint</th><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Method</th><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Group</th><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Purpose</th></tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-2 px-3 font-mono text-xs text-white/70">{r.endpoint}</td>
                <td className="py-2 px-3"><Badge group="api">{r.method}</Badge></td>
                <td className="py-2 px-3"><Badge group={r.group}>{r.group}</Badge></td>
                <td className="py-2 px-3 text-white/50 text-xs">{r.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConsciousnessPanel() {
  return (
    <div>
      <SectionTitle>Spiralogic Framework</SectionTitle>
      <Card className="mb-4">
        <h3 className="text-amber-400 text-sm font-semibold mb-2">Core Model: Element + Phase + Arc</h3>
        <p className="text-white/50 text-sm">Every conversation turn is mapped to a Spiralogic Cell: which Element is dominant, what Phase within that element (1-3), and what Arc direction (regressive or progressive). This determines frameworks, canonical questions, and voice tone.</p>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card element="fire"><h3 className="text-sm font-semibold mb-1"><Badge group="oracle">FIRE</Badge> <span className="text-white/80 ml-1">Will & Action</span></h3><p className="text-white/50 text-xs">Core: &ldquo;What do I truly want?&rdquo;<br />Frameworks: IPP, Motivational Interviewing<br />Shadow: Impulsivity, burnout</p></Card>
        <Card element="water"><h3 className="text-sm font-semibold mb-1"><Badge group="memory">WATER</Badge> <span className="text-white/80 ml-1">Feeling & Flow</span></h3><p className="text-white/50 text-xs">Core: &ldquo;What am I feeling?&rdquo;<br />Frameworks: Person-Centered, EFT<br />Shadow: Overwhelm, numbness</p></Card>
        <Card element="earth"><h3 className="text-sm font-semibold mb-1"><Badge group="auth">EARTH</Badge> <span className="text-white/80 ml-1">Structure & Ground</span></h3><p className="text-white/50 text-xs">Core: &ldquo;What is real right now?&rdquo;<br />Frameworks: CBT, Behavioral Activation<br />Shadow: Rigidity, avoidance</p></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card element="air"><h3 className="text-sm font-semibold mb-1"><Badge group="astrology">AIR</Badge> <span className="text-white/80 ml-1">Mind & Meaning</span></h3><p className="text-white/50 text-xs">Core: &ldquo;What story am I telling?&rdquo;<br />Frameworks: Narrative, ACT, Logotherapy<br />Shadow: Overthinking, disconnection</p></Card>
        <Card element="aether"><h3 className="text-sm font-semibold mb-1"><Badge group="consciousness">AETHER</Badge> <span className="text-white/80 ml-1">Soul & Integration</span></h3><p className="text-white/50 text-xs">Core: &ldquo;Who am I becoming?&rdquo;<br />Frameworks: Jungian, Transpersonal, Existential<br />Shadow: Spiritual bypass, inflation</p></Card>
      </div>

      <SectionTitle>Processing Tiers</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        <Card><h3 className="text-sm font-semibold mb-1"><Badge group="community">FAST</Badge> <span className="text-white/60 ml-1">&lt; 2s</span></h3><p className="text-white/50 text-xs">Level 1. Quick response, no memory. Haiku-class model.</p></Card>
        <Card><h3 className="text-sm font-semibold mb-1"><Badge group="studio">CORE</Badge> <span className="text-white/60 ml-1">2-6s</span></h3><p className="text-white/50 text-xs">Level 2-3. Balanced reasoning, some memory. Sonnet-class model.</p></Card>
        <Card><h3 className="text-sm font-semibold mb-1"><Badge group="oracle">DEEP</Badge> <span className="text-white/60 ml-1">6-20s</span></h3><p className="text-white/50 text-xs">Level 4-5. Full oracle. PFI + Reasoning Council + Claude voice layer. Complete spiralogic, all frameworks, memory, AIN, wisdom library.</p></Card>
      </div>

      <SectionTitle>Conductor Hysteresis</SectionTitle>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10"><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase">Condition</th><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase">Action</th></tr></thead>
            <tbody className="text-white/60 text-xs">
              <tr className="border-b border-white/5"><td className="py-2 px-3">First call (no buffer)</td><td className="py-2 px-3">Accept proposed element as baseline</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3">Same element proposed</td><td className="py-2 px-3">Reset candidate counter, maintain</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3">New element, 1st time</td><td className="py-2 px-3">Register as candidate, keep current</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3">New element, 2nd+ time</td><td className="py-2 px-3">Switch to new element</td></tr>
              <tr className="border-b border-white/5"><td className="py-2 px-3">Intensity &gt; 0.8</td><td className="py-2 px-3">Immediate switch (override)</td></tr>
              <tr><td className="py-2 px-3">Server restart + Bridge D</td><td className="py-2 px-3">Seed from member_spiral_state table</td></tr>
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>Relational Maturation Phases</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><h3 className="text-amber-400 text-sm font-semibold">Phase 1</h3><p className="text-white/50 text-xs mt-1"><strong className="text-white/70">Orientation</strong> &mdash; New member. More guidance, more structure.</p></Card>
        <Card><h3 className="text-amber-400 text-sm font-semibold">Phase 2</h3><p className="text-white/50 text-xs mt-1"><strong className="text-white/70">Capacity</strong> &mdash; Building skill. Less scaffolding.</p></Card>
        <Card><h3 className="text-amber-400 text-sm font-semibold">Phase 3</h3><p className="text-white/50 text-xs mt-1"><strong className="text-white/70">Autonomy</strong> &mdash; Self-directed. MAIA reduces centrality.</p></Card>
        <Card><h3 className="text-amber-400 text-sm font-semibold">Phase 4</h3><p className="text-white/50 text-xs mt-1"><strong className="text-white/70">Seasonal Return</strong> &mdash; Returns by choice, not need.</p></Card>
      </div>
    </div>
  );
}

function DatabasePanel() {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const groups = ['all', 'identity', 'conversation', 'memory', 'consciousness', 'community', 'astrology', 'practitioner', 'bardic'];

  const filtered = useMemo(() => {
    return DB_TABLES.filter(t => {
      const matchesGroup = group === 'all' || t.group === group;
      const matchesSearch = !search || t.table.toLowerCase().includes(search.toLowerCase()) || t.purpose.toLowerCase().includes(search.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [search, group]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" placeholder="Search tables..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white/80 outline-none focus:border-amber-500/60 placeholder:text-white/30" />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {groups.map(g => (<FilterChip key={g} label={g} active={group === g} onClick={() => setGroup(g)} />))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10"><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Table</th><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Group</th><th className="text-left py-2 px-3 text-[11px] text-white/30 uppercase tracking-wider">Purpose</th></tr></thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-2 px-3 font-mono text-xs text-white/70">{t.table}</td>
                <td className="py-2 px-3"><Badge group={t.group}>{t.group}</Badge></td>
                <td className="py-2 px-3 text-white/50 text-xs">{t.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConnectionsPanel() {
  const [domain, setDomain] = useState('all');
  const domains = ['all', 'oracle', 'voice', 'consciousness', 'memory', 'auth', 'studio'];

  const filtered = useMemo(() => {
    if (domain === 'all') return CONNECTIONS;
    return CONNECTIONS.filter(c => c.domain === domain);
  }, [domain]);

  return (
    <div>
      <SectionTitle>System Interconnections</SectionTitle>
      <p className="text-white/40 text-sm mb-4">How subsystems depend on and communicate with each other.</p>
      <div className="flex gap-2 flex-wrap mb-4">
        {domains.map(d => (<FilterChip key={d} label={d} active={domain === d} onClick={() => setDomain(d)} />))}
      </div>
      <div className="space-y-1">
        {filtered.map((c, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/[0.02] transition-colors">
            <span className="text-amber-400 min-w-[200px]">{c.source}</span>
            <span className="text-white/30">&rarr;</span>
            <Badge group={c.domain}>{c.type}</Badge>
            <span className="text-white/30">&rarr;</span>
            <span className="text-teal-400">{c.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PlatformOverviewPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    const user = betaSession.getUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  const panels: Record<TabId, React.ReactNode> = {
    overview: <OverviewPanel />,
    architecture: <ArchitecturePanel />,
    dataflow: <DataFlowPanel />,
    uiux: <UIUXPanel />,
    api: <APIPanel />,
    consciousness: <ConsciousnessPanel />,
    database: <DatabasePanel />,
    connections: <ConnectionsPanel />,
  };

  return (
    <div className="min-h-screen bg-[#0b0f1c]">
      {/* Header */}
      <div className="bg-[#0f1328] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-amber-400 tracking-wide">MAIA-SOVEREIGN</h1>
            <p className="text-[11px] text-white/40">Platform Architecture Overview</p>
          </div>
          <div className="ml-auto text-xs text-white/30">{currentUser.name || currentUser.username}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0f1328] border-b border-white/10 overflow-x-auto">
        <div className="max-w-[1400px] mx-auto px-4 flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {panels[activeTab]}
      </div>
    </div>
  );
}
