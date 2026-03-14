# AIN Node — Definition of Done

No site goes live on the AIN network unless it passes every item below.

## Mandatory (must ship)

### 1. AIN Platform Signature Footer

Exact copy:

```
Powered by AIN — Private Intelligence Infrastructure
Your data stays with this business. No third-party tracking or resale.
```

Requirements:
- [ ] Present on every public page
- [ ] Links to `https://soullab.life/powered-by` (or `/powered-by` if hosted on soullab.life)
- [ ] Positioned below the site's own footer content
- [ ] Respects the site's palette (opacity, color) but uses the exact wording above

### 2. AI Entry Point (working)

- [ ] A visible chat button, widget, or `/chat` route exists
- [ ] It works. No dead links, no "coming soon" placeholders on live sites
- [ ] Named persona preferred (e.g., "Chef Jason", "Virtual Jeremy", "Stellium Guide")
- [ ] Visitor can find the AI in under 3 seconds

### 3. Owner Control Link

- [ ] A visible "Owner Portal" or "Admin" link exists (footer or navigation)
- [ ] Link leads to a real page (even if login-gated)
- [ ] Demonstrates that the business controls the AI, not the other way around

## Recommended (should ship)

### 4. Sovereignty Messaging

- [ ] At least one page (About, Privacy, or Footer) states data sovereignty explicitly
- [ ] No third-party analytics that contradict the sovereignty claim
- [ ] If using cookies, consent is handled

### 5. Consistent UI Pattern

- [ ] Chat interaction pattern matches the AIN family (floating widget or dedicated page)
- [ ] Loading behavior is smooth (typing indicator or skeleton)
- [ ] Error states are graceful, not raw error dumps
- [ ] Mobile responsive

### 6. Architecture Compliance

- [ ] Same `docker-compose` structure (service + caddy routing)
- [ ] Environment variables follow AIN convention
- [ ] `/api/chat` or equivalent endpoint pattern
- [ ] No third-party AI providers (Claude via Anthropic API only, Ollama for fallback)
- [ ] No cloud databases — local PostgreSQL or equivalent

## Audit Checklist (run before deploy)

| Check | Command / Action |
|-------|-----------------|
| Footer present | Visual inspection of every public page |
| AI works | Send a test message, confirm response |
| Admin link works | Click it, confirm page loads |
| Powered-by link works | Click it, confirm it reaches soullab.life/powered-by |
| Mobile responsive | Test at 375px width |
| No dead links | Click every CTA on the homepage |

## Current Network Status

| Site | Footer | AI Works | Admin Link | Powered-By Link | Status |
|------|--------|----------|------------|-----------------|--------|
| oldhead.soullab.life | TBD | Virtual Daragh | TBD | TBD | Needs audit (external repo) |
| rudeboy.soullab.life | AIN | Chef Jason | Kitchen Console | Yes | Compliant |
| palisades.soullab.life | AIN | Virtual Jeremy | Owner Portal | Yes | Compliant |
| loralee.soullab.life | AIN | Stellium Chat | Stellium Dashboard | Yes | Compliant |
| marc.soullab.life | Unknown | Unknown | Unknown | Unknown | Needs audit (external repo) |

## Rule

If a site cannot pass the three mandatory checks, it is not an AIN node.
It may be a website we built. It is not part of the platform network.
