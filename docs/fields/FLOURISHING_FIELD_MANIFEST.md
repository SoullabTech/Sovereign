# Flourishing Field Manifest

**Version:** 0.1 (OS validation draft)
**Date:** 2026-06-28
**Author:** Kelly Nezat + AIN OS validation pass
**Status:** Draft — written to test the Field Manifest spec, not to showcase it.

**Success criterion (pre-registered):**
Every change required during authoring can be classified as one of three kinds:
- a **manifest addition** — something needed here that belongs in the configurable layer spec
- a **constitutional refinement** — something that touches the protected ring or the resolution sequence
- a **mistaken application request** — something that properly belongs in Larry's application layer, not the OS

If every discovered issue has an unambiguous home, the architecture is behaving as an operating system should.

**Pre-registered prediction:**
Gaps will appear in the manifest schema, not the constitutional layer. The protected ring has survived multiple rounds of compression; the manifest is the first place where abstract principles must become declarative configuration.

**Authoring instruction:**
Do not protect the spec from the manifest. Let the manifest expose weaknesses in the spec.

---

## What this field is

The **Flourishing Field** is a living developmental field for a human being engaged in Larry Closs's Now What? flourishing practice.

Larry's philosophy provides the content: why humans don't flourish, what practices support flourishing, and what it looks like when flourishing is happening. The OS provides the substrate: developmental continuity, evidence accumulation, consent governance, and the authority lifecycle that protects members from premature interpretation.

Larry's intellectual property is not in this manifest. What is in this manifest is the configuration of a governed environment in which his methodology can be held, practiced, and matured over time.

---

## Identity

```yaml
name: "Now What? Flourishing Field"

description: >
  A living field for the development of human flourishing across the domains 
  of attention, relationship, meaning, contribution, and presence.

purpose: >
  To hold the developmental arc of a person's flourishing practice — not as 
  a destination to reach but as a practice to cultivate across time. The 
  field remembers development so the member does not have to carry it alone.

developmentalStage: "orientation"

stageVocabulary:
  - name: "orientation"
    description: "Member is establishing their practices and finding their footing in the field"
  - name: "active-practice"
    description: "Member is engaged with standing practices and accumulating evidence"
  - name: "deepening"
    description: "Member is working with patterns, commitments, and inter-domain relationships"
  - name: "integration"
    description: "Member is synthesizing; practices are embodied rather than effortful"
  - name: "contribution"
    description: "Member's flourishing is now visible in their relationships and environment"
```

**Authoring note — Discovery 1: `stageVocabulary` not in configurable layer.**
`developmentalStage` exists in the spec as a configurable field, but the vocabulary of stages is undefined. Open-ended string means every manifest author invents their own stages, and the OS cannot validate them, compare them across fields, or reason about transitions between them.

For a Flourishing Field, the stage vocabulary is application-specific (Larry's stages, derived from his methodology) but architecturally general (any developmental field would benefit from a declared vocabulary). The OS needs to know what the stages are so it can support: "member has been in 'active-practice' for 6 months; a synthesis might be timely."

**Classification: manifest addition** — the configurable layer's `identity` section should include `stageVocabulary?: Stage[]`, where each entry has `name` and `description`. The OS validates that `developmentalStage` is a member of this vocabulary at instantiation.

---

## Membership

```yaml
membership:
  participants:
    - role: "Member"
      description: "The person cultivating flourishing"
      permissions:
        - read_own_field
        - add_evidence
        - initiate_practice
        - initiate_session
        - request_synthesis
        - grant_guide_access
        - revoke_guide_access
        - request_export
        - invoke_sanctuary

    - role: "Guide"
      description: >
        A certified Now What? practitioner supporting the member's development. 
        The guide serves the field; the guide does not own it.
      permissions:
        - read_member_shared_records
        - add_practitioner_observation
        - propose_pattern_candidate
        - initiate_session
        - view_development_arc
        - request_synthesis_with_member_review
      excluded_permissions:
        - override_encounter_interpretation
        - read_sanctuary_content
        - grant_authority_without_member_confirmation

    - role: "Field Steward"
      description: >
        Platform administrator with no access to member content — only to 
        field health, consent state, and technical configuration.
      permissions:
        - view_field_health
        - view_consent_settings
        - manage_retention_configuration

  invitationPolicy: >
    Closed. Member self-identifies and opens the field. Guide is assigned 
    or chosen by member. No third party may enter without explicit member 
    consent. Field Steward role is platform-level, not field-level.
```

**Authoring note — Discovery 2: Role permissions need constitutional-layer validation.**
The spec says "role permissions — within constitutional limits only," but there is no mechanism that prevents a manifest author from granting `Guide` the permission `override_encounter_interpretation` (which would cross into the protected ring — Encounter ≠ Interpretation). The `excluded_permissions` field I've added here is invented; it has no home in the current spec.

The OS should validate permissions at instantiation against the protected ring. If a manifest grants a permission that would let a participant bypass the authority state machine or override the encounter/interpretation separation, the manifest should fail validation — not at runtime, but at the moment of instantiation.

**Classification: constitutional refinement** — the validation criteria in the Field Manifest spec should include: "No declared permission may grant a role the ability to bypass a protected-ring invariant." The OS should maintain a list of protected-ring permission names (e.g., `override_encounter_interpretation`, `read_sanctuary_content`, `grant_authority_without_evidence`) and reject any manifest that grants them to non-constitutional roles.

---

## Domains

```yaml
domains:
  - name: "Relationships"
    description: >
      The quality, depth, and developmental movement of the member's most 
      significant connections — how they are being held, how they are holding.
    primaryPractice: "Weekly Relationship Review"

  - name: "Meaning"
    description: >
      The member's relationship to purpose, significance, and contribution — 
      what makes their life feel like it matters.
    primaryPractice: "Monthly Meaning Check"

  - name: "Presence"
    description: >
      The quality of the member's attention and aliveness — whether they are 
      actually here for their own life.
    primaryPractice: "Daily Attention Practice"

  - name: "Contribution"
    description: >
      What the member is actively giving to the world — not productivity, 
      but generativity.
    primaryPractice: "Quarterly Contribution Review"

  - name: "Health"
    description: >
      Physical, energetic, and emotional vitality as the substrate of 
      flourishing — the body that practices.
    primaryPractice: "Weekly Energy Check"

  - name: "Purpose"
    description: >
      The member's developing sense of direction and calling — where they 
      are pointed and why.
    primaryPractice: "Annual Purpose Integration"
```

**Authoring note — Discovery 3: `domains` not in configurable layer.**
This is the first confirmed gap in the manifest schema. The spec has no `domains` concept. A domain is a named sub-area of a field with its own practices, evidence accumulation, and developmental arc.

Four-question gate:
1. **Universal?** Yes — a therapy field could have domains like "Trauma Work / Present Resources / Future Orientation"; an organizational field could have "Culture / Strategy / Operations / Learning."
2. **Constitutional?** No — domain names and descriptions are application-specific.
3. **Declarative?** Yes — a list of named areas.
4. **Portable?** Yes — any sufficiently complex field would benefit from named sub-areas.

A second observation: each domain has a `primaryPractice`, creating a connection between the `domains` and `practices` sections. The manifest schema should support cross-references between sections without requiring the OS to resolve them at every interaction.

**Classification: manifest addition** — the configurable layer should include `domains?: Domain[]`, where each `Domain` has `name`, `description`, and optionally `primaryPractice` (a reference to a named practice in the `practices` section).

---

## Primary Organizer

```yaml
primaryOrganizer: "Practice"
```

**Authoring note — Discovery 4: `primaryOrganizer` not in configurable layer.**
In a Flourishing Field, a returning member should enter through their active practices, not their session history. The field is organized by what the member is cultivating, not by when they last visited.

Four-question gate:
1. **Universal?** Yes — a grief support field might primary-organize by session; a coaching field by relationship; a learning field by evidence.
2. **Constitutional?** No — this is a UX and navigation preference derived from the field's purpose.
3. **Declarative?** Yes — a single named organizing concept.
4. **Portable?** Yes — any field could declare its entry point.

Default assumption in the current spec (no explicit entry point defined) would be session-based — which is wrong for this field.

**Classification: manifest addition** — the UX section of the configurable layer should include `primaryOrganizer?: 'Practice' | 'Session' | 'Relationship' | 'Evidence' | 'Timeline'`. Default: `'Session'`. The Flourishing Field sets this to `'Practice'`.

---

## Guides

```yaml
guides:
  preferredIntelligences:
    - name: "Now What? Presence"
      description: >
        A guide trained in Larry's flourishing methodology. Focused on 
        practices, evidence, and developmental continuity. Does not give 
        advice; holds and reflects the developmental arc. Asks before 
        interpreting.

  standingWisdomSources:
    - "Larry Closs's Flourishing Framework"
    - "Now What? Practice Library"
    - "The member's own developing field record"

  facilitationStyle: "developmental"

  guidanceConstraints:
    - "Ask before interpreting — encounter precedes meaning in every case"
    - "Do not name a pattern the member has not yet named"
    - "Surface evidence; do not offer conclusions"
    - "Reflect developmental movement without declaring it an achievement"
    - "When uncertain whether something is a pattern or a coincidence, say so"
```

**Authoring note — Discovery 5: manifest/policy boundary unclear for `guidanceConstraints`.**
The spec has `facilitationStyle` but not `guidanceConstraints`. These constraints encode Larry's coaching methodology as standing guidance rules.

The question is whether they belong in the manifest or in Field Policies.

- The constraint "Ask before interpreting" is active for *every* interaction regardless of context → this is a standing identity property of the field → **manifest**.
- The constraint "Do not name a pattern the member has not yet named" depends on what evidence has accumulated and whether the member has spoken yet → this depends on interaction context → **Field Policy**.

The current spec does not provide criteria for making this distinction. Two guidance constraints that look similar in wording (both start with "do not") belong in different documents.

**Proposed rule:** If the constraint holds unconditionally — regardless of what has happened so far in the interaction — it is a manifest property. If it depends on evidence state, interaction history, or participant context, it belongs in Field Policies.

**Classification: manifest/policy clarification** — the spec should state explicitly that `guidanceConstraints` in the manifest are unconditional standing constraints; context-dependent constraints belong in Field Policies.

**`guidanceConstraints` itself is a manifest addition:** add it to the `guides` section of the configurable layer.

---

## Memory Policies

```yaml
memoryPolicies:
  retentionDuration: "indefinite"
  summarizationCadence: "quarterly"

  visibilityRules:
    - scope: "member"
      access: "all own field records, including guide observations explicitly shared"
      
    - scope: "guide"
      access: "member-shared sessions, member-initiated evidence, member-visible summaries"
      excluded: "sanctuary sessions (total exclusion; no guide visibility under any circumstance)"
      
    - scope: "organization"
      access: "aggregated and anonymized patterns only, with explicit member consent per item"
      excluded: "individual session records, identifiable evidence, developmental arc"

  reviewRhythm: "weekly practice check-in; monthly domain review; quarterly synthesis; annual integration"

  evidenceTypes:
    - name: "member-reflection"
      description: "The member's own account of an encounter, practice, or pattern"
      visibility: "member + guide (if shared)"
      provenance: "member-authored"

    - name: "practice-log"
      description: "A record of a completed or attempted practice"
      visibility: "member + guide"
      provenance: "member-authored"

    - name: "session-note"
      description: "A record of a session — what was present, what moved"
      visibility: "member (always) + guide (member-controlled)"
      provenance: "joint-authored"

    - name: "practitioner-observation"
      description: "A guide's observation about development — not interpretation, not conclusion"
      visibility: "guide (until member explicitly opens it)"
      provenance: "guide-authored"

    - name: "pattern-candidate"
      description: "A recurring theme that has appeared across multiple encounters"
      visibility: "guide (until member names it; then member)"
      provenance: "field-generated"
      
    - name: "synthesis"
      description: "A quarterly or annual integrative review across all evidence types"
      visibility: "member + guide"
      provenance: "joint-authored with member review required before surfacing"
```

**Authoring note — Discovery 6: `evidenceTypes` not in configurable layer.**
The spec has no field for declaring what kinds of evidence exist in a given field. Yet evidence type determines provenance, visibility, and authority — all governed concepts. Without declared evidence types, the OS cannot enforce visibility rules at the type level.

Four-question gate:
1. **Universal?** Yes — every field has distinct evidence types (a medical field would have "clinical observation / patient report / diagnostic finding").
2. **Constitutional?** No — the constitutional layer requires evidence to be append-only with provenance, but it does not specify what evidence types exist.
3. **Declarative?** Yes — a list of types with names, descriptions, visibility defaults, and provenance.
4. **Portable?** Yes — any field could declare its evidence types.

**Classification: manifest addition** — the memory policies section should include `evidenceTypes?: EvidenceType[]`, where each entry has `name`, `description`, `visibility`, and `provenance`.

**Authoring note — Discovery 7: Policy rules should not hide inside evidence type declarations.**
The `pattern-candidate` entry above includes `visibility: "guide (until member names it; then member)"` — this is a Field Policy rule, not a manifest property. The evidence type exists (pattern candidate); when it surfaces is a per-interaction authorization question. That rule should live in Field Policies, not in the evidence type declaration.

**Classification: authoring discipline finding** — manifests should name evidence types and their default visibility; timing and surfacing rules based on accumulated state belong in Field Policies.

---

## Practices

```yaml
practices:
  standingPractices:
    - name: "Daily Attention Practice"
      description: >
        A brief moment of noticing what has one's attention — not interpretation, 
        just noticing. The simplest form of presence.
      cadence: "daily"
      evidenceType: "practice-log"
      domain: "Presence"

    - name: "Weekly Relationship Review"
      description: >
        A structured look at how the member's significant relationships are 
        moving — what's alive, what's stale, what's asking for attention.
      cadence: "weekly"
      evidenceType: "session-note"
      domain: "Relationships"

    - name: "Monthly Meaning Check"
      description: >
        A scheduled inquiry into the member's relationship with meaning, 
        purpose, and contribution. Not a report — a genuine question.
      cadence: "monthly"
      evidenceType: "member-reflection"
      domain: "Meaning"

    - name: "Quarterly Synthesis"
      description: >
        A review of the full quarter's evidence across all domains — patterns, 
        themes, movements, reversals. What was this quarter for?
      cadence: "quarterly"
      evidenceType: "synthesis"
      domain: null

    - name: "Annual Integration"
      description: >
        A full-year arc review. What was the year for? What is the member 
        now that they weren't at the start? What practice did the most work?
      cadence: "annual"
      evidenceType: "synthesis"
      domain: null

  sessionOpening: >
    Member declares which domain has their attention before the session opens.
    
  sessionClosure: >
    Member names one commitment or observation before the session closes.

  synthesisPolicy:
    cadence: "quarterly"
    authorizedBy: "member (unilateral) or guide (requires member review before surfacing)"
    authorityGate: "evidence must span at least two domains and three distinct encounters"
```

The `evidenceType` references within practices point to entries in `memoryPolicies.evidenceTypes` — this cross-section reference works declaratively. No new gaps found in the practices section.

---

## Rituals

```yaml
rituals:
  rhythms:
    - "Daily: attention practice (5 minutes)"
    - "Weekly: relationship review (15–30 minutes)"
    - "Monthly: meaning check (30–60 minutes)"
    - "Quarterly: synthesis and integration (2–3 hours)"
    - "Annual: full arc review (half day)"

  checkInForm:
    opening: "What domain has your attention today?"
    closing: "What will you carry forward from this session?"

  milestones:
    - "First practice completed"
    - "First pattern named by the member"
    - "First quarterly synthesis"
    - "One year in the field"
    - "First contribution to another's field (guide or peer)"

  transitionMarkers:
    - "Life phase change (member-named)"
    - "Domain reorientation (member-initiated)"
    - "Practice completion or retirement"
    - "Guide transition"
    - "Stage transition (member-confirmed)"
```

No new gaps found in the rituals section.

---

## User Experience

```yaml
userExperience:
  terminology:
    aliases:
      "AI response": "reflection"
      "session": "practice session"
      "conversation": "practice session"
      "memory": "field record"
      "pattern": "recurring theme"
      "MAIA": "Now What? Guide"

  interactionDefaults:
    primaryOrganizer: "Practice"
    entryPoint: "current-practices"

  notificationPreferences:
    practiceReminders: true
    synthesisReady: true
    patternCandidate: false
    guideObservation: "member-controlled"
```

**Authoring note — Discovery 8: Display-label aliasing vs. structural renaming.**
The `terminology.aliases` section renames display labels: "AI response" → "reflection", "MAIA" → "Now What? Guide." These are safe: they change what the member sees, not how the OS resolves anything.

But consider a different manifest that aliases "Practice" to "Commitment." If the OS uses "Practice" as a first-class object name in its resolution sequence, aliasing it could create ambiguity — especially in a multi-field context where one field calls them "Practices" and another calls them "Commitments."

The current spec says `terminology` is part of the UX configurable layer but does not distinguish between display-label aliasing (safe) and structural object renaming (not safe, because it would break cross-field consistency in the authority resolution sequence).

**Classification: constitutional clarification** — the spec should state: manifests may alias display labels for any concept, but may not rename constitutional objects (Practice, Session, Relationship, Evidence, Timeline, Person, Field, Ritual) in ways that would affect how the OS resolves authority or surfaces evidence. Display labels are skin; object names are structure.

---

## Manifest Validation

Does this manifest pass its own four-question test?

For each declared property, I ask:

| Property | Universal? | Configurable? | Declarative? | Portable? |
|----------|-----------|---------------|-------------|-----------|
| `stageVocabulary` | Yes | Yes | Yes | Yes |
| `domains` | Yes | Yes | Yes | Yes |
| `primaryOrganizer` | Yes | Yes | Yes | Yes |
| `evidenceTypes` | Yes | Yes | Yes | Yes |
| `guidanceConstraints` | Yes | Yes | Yes | Yes |
| Larry's flourishing philosophy | No | — | — | No |
| Coach certification requirements | No | — | — | No |
| Assessment instruments | No | — | — | No |
| Curriculum structure | No | — | — | No |

The last four items do not appear in this manifest. They belong in Larry's application layer. The OS does not need to know them to instantiate the field.

**Does the manifest invoke a constitution version?**
Not yet — the spec requires this for traceability. The Field Manifest spec (`docs/canon/FIELD_MANIFEST.md`) itself is the constitution being invoked; this manifest should reference it explicitly.

```yaml
constitutionVersion: "FIELD_MANIFEST.md v1.0 (2026-06-28)"
```

This should be a required field in the spec's validation criteria.

---

## Summary of Findings

Eight issues discovered during authoring:

| # | Finding | Classification |
|---|---------|---------------|
| 1 | `stageVocabulary` not in configurable layer — stages need declarable vocabulary | Manifest addition |
| 2 | Role permissions need constitutional-layer validation at instantiation | Constitutional refinement |
| 3 | `domains` not in configurable layer — universal concept, missing from spec | Manifest addition |
| 4 | `primaryOrganizer` not in configurable layer — needed for non-session-first fields | Manifest addition |
| 5 | `guidanceConstraints` not in configurable layer + manifest/policy boundary undefined | Manifest addition + clarification |
| 6 | `evidenceTypes` not in configurable layer — visibility and provenance need type-level declaration | Manifest addition |
| 7 | Policy rules hiding inside evidence type declarations | Authoring discipline finding |
| 8 | Display-label aliasing vs. structural renaming distinction needed | Constitutional clarification |

**Against Kelly's pre-registered prediction:** 5 manifest additions, 2 constitutional refinements, 1 authoring discipline finding. Zero items required changing a constitutional invariant. The protected ring held.

**Against the success criterion:** Every finding has an unambiguous home.

**Against the third-field test:** For a substantially different field (e.g., organizational learning, grief support, executive coaching), the five manifest additions found here would all be needed — they are universal concepts. The Flourishing Manifest has surfaced what the Field Manifest spec was missing. Adding those five properties to the spec would make it genuinely general rather than tailored to this use case.

---

## What this manifest does not authorize

This manifest does not authorize:
- Any AI to interpret the member's experience without member invitation
- Any pattern to be named before the member has named it
- Any guide to read sanctuary content
- Any synthesis to surface without member review
- Larry's philosophy to be encoded as system behavior — it remains the application layer

The OS holds the developmental arc. Larry's methodology shapes how that arc is cultivated. These are not the same thing.
