---
description: "Audit sacred learning implementation for integrity and safety"
allowed-tools: "Read,Grep,Glob"
---

# Sacred Learning Audit

You are auditing the Sacred Learning Domain implementation for source integrity, safety, and policy compliance.

## REQUIRED READING FIRST

Read the governing documents:
- `docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md`
- `docs/sacred-learning/ARCHITECTURE_BRIEF.md`

## AUDIT CHECKLIST

### 1. Authority Hierarchy
- [ ] Every content record in DB has `authority_level` (1-6)
- [ ] No Level 6 content shares visual treatment with Level 1-4
- [ ] UI always shows SourceLabel on every content block
- [ ] SourceLabel cannot be hidden or toggled off
- [ ] Level 1 content is always primary in layout

### 2. Provenance
- [ ] Every passage has complete provenance metadata
- [ ] Every commentary has author + work + section
- [ ] Every translation credits translator + edition
- [ ] No fabricated citations anywhere in seed data
- [ ] No content with empty provenance fields is served

### 3. Editorial Review
- [ ] All served content has `review_status = 'approved'`
- [ ] No `unreviewed` content is reachable via API
- [ ] Flagged content is excluded from retrieval

### 4. AI Behavior
- [ ] Oracle lens prompt enforces humility language
- [ ] No AI-generated text claims doctrinal authority
- [ ] AI synthesis is always labeled "AI-composed"
- [ ] No false equivalence between authority levels
- [ ] Doctrinal questions are redirected to scholars

### 5. Sanctuary Mode
- [ ] Reflections created in Sanctuary are not stored
- [ ] Sanctuary indicator is visible when active
- [ ] No metadata from Sanctuary reflections leaks

### 6. Flattening Risks
- [ ] Qur'an and poetry are never in the same visual container without labels
- [ ] Commentary is never presented as scripture
- [ ] AI synthesis is never adjacent to Qur'an without clear separation
- [ ] No "all paths are one" language in prompts or content

### 7. Decontextualization
- [ ] Every Qur'anic passage includes surah:ayah reference
- [ ] Context notes are provided for passages that require them
- [ ] No single ayah used as a "wisdom quote" without context
- [ ] Sensitivity-flagged passages have additional context

### 8. Data Safety
- [ ] Member reflections are private (no aggregation, no sharing)
- [ ] No sacred learning data feeds training pipelines
- [ ] Deletion works (members can remove their reflections)
- [ ] Arabic text is stored and served as UTF-8

### 9. Feature Flag
- [ ] All sacred learning surfaces gated by `sacredLearning` flag
- [ ] Flag defaults to `false`
- [ ] No sacred learning routes accessible when flag is off

### 10. Retrieval
- [ ] Authority hierarchy respected in ranking
- [ ] Qur'an always primary when present
- [ ] Commentary follows source, never freestanding
- [ ] Poetry enriches but never leads in study views

## RISK ASSESSMENT

After completing the checklist, assess these risks:

| Risk | Severity | Status |
|---|---|---|
| Flattening revelation and commentary | Critical | |
| False equivalence between levels | Critical | |
| Weak provenance | High | |
| AI overclaiming | High | |
| Syncretic blur | High | |
| Decontextualization | Medium | |
| Aesthetic consumption without depth | Medium | |
| Poor Arabic rendering | Low | |

## OUTPUT

Produce a brief audit report:
1. Pass/fail per checklist item
2. Risk assessment with current status
3. Corrective recommendations (if any)
4. Launch readiness: YES / NO / CONDITIONAL
