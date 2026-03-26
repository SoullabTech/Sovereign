# WhatsApp Integration — Soullab Architecture Spec

## Core Principle
WhatsApp is the channel, not the memory. MAIA receives summaries, not threads. Raw-thread access is deliberate, exceptional, and consented.

## Three Rules
1. Consent must be explicit — not just "message us anytime" but clear permission for what MAIA can and cannot do
2. MAIA should usually get summaries, not full threads — cleanest safety and dignity boundary
3. Deep work should migrate into the portal — WhatsApp opens and holds continuity but is not the whole temple

## Stack
- Transport: Meta WhatsApp Business Platform / Cloud API
- Ingress: Meta webhook → Soullab backend
- Decision layer: consent + routing policy
- Intelligence layer: MAIA
- Memory layer: Soullab-controlled storage
- Optional later: private MCP server with tightly scoped tools

## Data Flow
1. User sends WhatsApp message → Meta delivers webhook JSON
2. Soullab webhook normalizes: phone_e164, wa_user_id, timestamp, body, media meta, thread key
3. Identity resolution: known member / known contact not linked / unknown sender
4. Consent gate: transport_only → logistics_ok → maia_summary_ok → deep_process_ok
5. Routing: Logistics (A) / Guided conversation (B) / Deep process (C)
6. Context builder generates MAIA packet: member_id, consent_level, mode, recent_summary, themes, tone, escalation_allowed, memory_writeback_allowed
7. MAIA returns: reply_text, suggested_next_action, escalation_flag, memory_candidate
8. Outbound send via Cloud API
9. Post-processing: store transport logs, consent events, summaries, escalation events

## What MAIA Receives (Default)
- Latest user message
- Short thread summary
- Current consent level
- Risk flags
- Active mode
- Last 1-3 key themes

## What MAIA Does NOT Receive (Default)
- Full lifetime thread
- All historical media
- Unrelated prior intimate content

## Database Schema

### whatsapp_contacts
- id UUID PK
- phone_e164 TEXT NOT NULL
- wa_user_id TEXT
- member_id UUID NULLABLE FK → members(id)
- link_status TEXT DEFAULT 'unlinked' (unlinked | pending | linked)
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### whatsapp_threads
- id UUID PK
- contact_id UUID FK → whatsapp_contacts(id)
- mode TEXT DEFAULT 'logistics' (logistics | guided | deep_process)
- status TEXT DEFAULT 'active' (active | paused | closed)
- last_message_at TIMESTAMPTZ
- created_at TIMESTAMPTZ DEFAULT NOW()

### whatsapp_messages
- id UUID PK
- thread_id UUID FK → whatsapp_threads(id)
- direction TEXT NOT NULL (inbound | outbound)
- transport_payload_json JSONB
- body_text TEXT
- media_meta_json JSONB
- message_status TEXT DEFAULT 'received' (received | delivered | read | sent | failed)
- created_at TIMESTAMPTZ DEFAULT NOW()

### whatsapp_consents
- id UUID PK
- contact_id UUID FK → whatsapp_contacts(id)
- consent_type TEXT NOT NULL (transport_only | logistics_ok | maia_summary_ok | deep_process_ok)
- granted BOOLEAN NOT NULL
- source_message_id UUID
- created_at TIMESTAMPTZ DEFAULT NOW()

### whatsapp_summaries
- id UUID PK
- thread_id UUID FK → whatsapp_threads(id)
- summary_text TEXT NOT NULL
- themes_json JSONB
- tone TEXT
- risk_flags_json JSONB
- created_at TIMESTAMPTZ DEFAULT NOW()

### whatsapp_escalations
- id UUID PK
- thread_id UUID FK → whatsapp_threads(id)
- escalation_type TEXT NOT NULL (user_request | high_risk | confusion | billing | low_confidence)
- assigned_to TEXT
- status TEXT DEFAULT 'pending' (pending | acknowledged | resolved | dismissed)
- created_at TIMESTAMPTZ DEFAULT NOW()

## Consent Flow (Staged)
- Level 1 — transport only: "Soullab can receive and reply to your WhatsApp messages for practical support."
- Level 2 — MAIA summary use: "Soullab may summarize recent messages so MAIA can respond more helpfully."
- Level 3 — deep continuity: "Soullab may retain selected themes and patterns to support ongoing guidance over time."

## Retention Rules
- Transport logs: short retention unless needed operationally
- Summaries: medium retention for continuity
- Deep memory artifacts: only when consent explicitly allows
- Raw media: avoid keeping unless necessary
- Full raw thread replay to MAIA: off by default

## Practitioner Handoff Triggers
- User asks for human support
- High-risk emotional content
- Repeated confusion or rupture
- Billing / scheduling / clinical boundary issue
- MAIA confidence low

## MCP Tools (Phase 3, later)
- send_whatsapp_message(thread_id, text)
- get_recent_whatsapp_summary(thread_id)
- request_practitioner_handoff(thread_id, reason)
- set_whatsapp_mode(thread_id, mode)
- record_whatsapp_consent(contact_id, consent_type, granted)

## Phases

### Phase 1 (MVP)
- Meta business number
- Webhook verification
- Inbound/outbound messaging
- Contact table
- Consent capture
- One summary generator
- MAIA sees summaries only
- Practitioner handoff button

### Phase 2
- Account linking to Soullab member IDs
- Mode switching
- Limited continuity memory
- Portal handoff from WhatsApp to Soullab session

### Phase 3
- Private MCP layer
- Advanced operator tooling
- Selective analytics
- Template-based re-engagement

## Security Boundary — "Connected, Not Contained" Checklist

The risk is not Meta crawling your system. The risk is that your own exposed integration becomes the weak point.

### Webhook Hardening
- [ ] Verify every inbound webhook with `X-Hub-Signature-256` (SHA-256 HMAC of payload against app secret)
- [ ] Rate-limit the webhook endpoint
- [ ] Log all inbound requests (source IP, timestamp, payload hash)
- [ ] Reject malformed or unsigned requests immediately
- [ ] Webhook endpoint returns 200 quickly, processes async

### Adapter Isolation
- [ ] WhatsApp adapter runs as a separate service or clearly isolated module
- [ ] Adapter CANNOT reach main app database tables (members, conversations, memory)
- [ ] Adapter has least-privilege DB access: only `whatsapp_*` tables
- [ ] No shared credentials between adapter and main app
- [ ] Adapter failure does not cascade to main MAIA service

### Credential Management
- [ ] Cloud API Bearer token stored in environment variable, never in code
- [ ] Token rotation schedule documented
- [ ] Separate Meta app credentials from other Soullab secrets
- [ ] No tokens in logs, error messages, or webhook payloads

### MAIA Access Control
- [ ] MAIA receives structured summary packets, never raw transport payloads
- [ ] No blanket access to `whatsapp_messages` from MAIA or oracle route
- [ ] Context builder is the only path from WhatsApp data to MAIA
- [ ] Memory writeback requires explicit consent check before execution

### MCP Authorization (Phase 3)
- [ ] Private MCP server requires authentication for all tool calls
- [ ] Tools are narrowly scoped (send_message, get_summary, handoff, set_mode, record_consent)
- [ ] No tool exposes raw thread data or bulk message access
- [ ] Authorization checks consent level before returning any user data

### The Test
You are safe enough when:
1. The only public surface is a hardened webhook
2. Signatures are verified on every request
3. Credentials are tightly controlled and rotated
4. The adapter is sandboxed with least-privilege access
5. WhatsApp integration cannot touch the rest of your system except through narrow, audited paths

That is the difference between "connected" and "contained."
