# Beta Core — What Must Never Break

> Everything on this list is the living system. Everything NOT on this list is experimental.

---

## The Critical Path

**Member → Sign in → Talk to MAIA → Memory persists → Return and be recognized**

That's the product. Everything else is future.

---

## Core Files (the living system)

### 1. Authentication & Identity

| File | Role |
|------|------|
| `app/signin/page.tsx` | Sign-in UI |
| `app/api/members/signin/route.ts` | Auth endpoint |
| `app/api/members/register/route.ts` | New member creation |
| `app/api/members/progress/route.ts` | Onboarding step tracking |
| `lib/auth/serverSessions.ts` | Session creation, cookies, validation |
| `lib/auth/passwordUtils.ts` | Password hashing/verification |
| `lib/auth/betaSession.ts` | Client session state |
| `lib/http/apiBase.ts` | apiFetch() — Capacitor x-member-id injection |
| `middleware.ts` | Access control on every request |
| `config/accessMatrix.ts` | Route permission rules |

**Tables:** `members`, `auth_sessions`

### 2. Onboarding

| File | Role |
|------|------|
| `app/begin/page.tsx` | Landing page, "Begin Journey" |
| `app/test-elemental/page.tsx` | Passkey + registration + orientation |
| `app/faq/page.tsx` | FAQ section |
| `app/onboarding/page.tsx` | Preferences, completion |

**Tables:** `members` (onboarded, onboarding_step)

### 3. MAIA Conversation (the heart)

| File | Role |
|------|------|
| `app/maia/page.tsx` | Main app page |
| `components/OracleConversation.tsx` | Conversation UI + voice |
| `app/api/sovereign/app/maia/route.ts` | Conversation endpoint |
| `lib/sovereign/maiaService.ts` | Response orchestration (FAST/CORE/DEEP) |
| `lib/sovereign/sessionManager.ts` | Session + turn management |
| `lib/ai/modelService.ts` | Claude API calls |
| `lib/consciousness/processingProfiles.ts` | Routing to processing paths |
| `lib/voice/maiaVoiceService.ts` | Voice synthesis |

**Tables:** `maia_sessions`, `conversation_turns`

### 4. Memory Persistence

| File | Role |
|------|------|
| `lib/memory/stores/TurnsStore.ts` | Write/read conversation turns |
| `lib/memory/MemoryOrchestrator.ts` | Build session recall context |
| `lib/sovereign/sessionManager.ts` | addConversationExchange() |

**Tables:** `conversation_turns` (indexed by user_id for cross-session)

### 5. Infrastructure

| File | Role |
|------|------|
| `lib/db/postgres.ts` | Database client (the only one) |
| `docker-compose.production.yml` | Production stack |
| `Caddyfile` | Reverse proxy + HTTPS |
| `Dockerfile` | Build pipeline |
| `scripts/deploy-production.sh` | Deployment orchestration |
| `scripts/entrypoint.sh` | Schema gate + server start |

---

## Core Database Tables

| Table | Purpose | Critical? |
|-------|---------|-----------|
| `members` | Identity, auth, onboarding state | YES |
| `auth_sessions` | Server-side session tokens | YES |
| `maia_sessions` | Per-session conversation state | YES |
| `conversation_turns` | Cross-session memory | YES |

---

## What Is NOT Core (experimental / future)

These exist in the codebase but are not in the critical path:

- `lib/consciousness/` (308 files) — most are dormant framework layers
- `lib/cognitive-engines/` — completed research, deliberately disconnected
- Astrology / divination endpoints — future features
- Community / BBS / forum components — not live
- Academy / learning path components — not live
- Practitioner Studio beyond basic access — future tier
- Multiple voice implementations (adaptive, realtime, organic) — only maiaVoiceService is in path
- Mem0 / advanced memory integrations — not in active flow

---

## Weekly Core Health Check

```bash
# 1. Can someone sign in?
curl -s https://soullab.life/api/health | jq .

# 2. Are all containers healthy?
docker ps --format "table {{.Names}}\t{{.Status}}"

# 3. Is the database responding?
docker exec maia-postgres pg_isready

# 4. Can the conversation endpoint respond?
# (manual test: sign in and send a message)
```

---

## The Rule

> If a change touches a file on this list, it gets extra scrutiny.
> If a change touches a file NOT on this list, it's experimental and can break without blocking beta.
