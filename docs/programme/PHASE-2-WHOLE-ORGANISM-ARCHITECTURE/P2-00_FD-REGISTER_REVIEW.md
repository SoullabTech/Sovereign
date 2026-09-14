# P2-00 · DECISION-REGISTER REVIEW

```text
PURPOSE     classify every UNRESOLVED founder decision as
              RATIFICATION-BLOCKING   or   INTENTIONALLY DOWNSTREAM
            ⛔ no third status
SOURCES     P2-00 charter ab070551 · Amendment 1 41378a5d · Amendment 2 e2c945c8 ·
            Amendment 3 · their FD register — ⛔ AND NOTHING ELSE
⛔ NOT DONE  no code inspected · no Phase 1 evidence consulted · no census · no mapping
RESULT      ⛔ RATIFICATION REMAINS HELD — two blockers, both bounded
```

## 1 · The criterion, stated before it is applied

```text
RATIFICATION-BLOCKING     the decision is required to UNDERSTAND or APPLY a charter
                          primitive. Two readers cannot reach the same answer without it.
INTENTIONALLY DOWNSTREAM  the primitive is applicable as written; the open decision concerns
                          what the ARCHITECTURE SHOULD DO, not what the TERM MEANS.
```

⭐ **One structural signature decides most entries: a primitive whose own text defers part of its
meaning to an open FD cannot be applied reproducibly.** Two primitives carry that signature; the
rest defer only design.

## 2 · ⛔ RATIFICATION-BLOCKING — two

```text
FD-4 · Does executing a rule someone else authored count as DECIDES?
  WHY BLOCKING   Charter §3.7's DOES NOT MEAN list contains the exclusion and marks it
                 "drafted, not decided". The primitive's own text therefore defers part of
                 its meaning. ⭐ Two readers asked whether a threshold check, a route
                 selection or a policy evaluation is DECIDES reach OPPOSITE answers, and the
                 charter does not settle it — which is the definition of unapplicable.
  SCOPE          one semantic question. ⛔ Not a redesign.
  ⚠️ CONSEQUENCE IF LEFT OPEN  DECIDES is currently EMPTY across the organism's evidence.
                 An unsettled exclusion is exactly the gap through which routing and
                 threshold logic could later be read as deciding — or never be.

FD-11a · Where does the authority chain TERMINATE?
  WHY BLOCKING   Charter §3.9 states GOVERNING SOURCE's own legitimacy "comes from a superior
                 source, terminating in the constitution or in the person, per FD-11" — the
                 definition defers its own terminus. ⭐ Without a termination rule, the
                 question *is this source competent to grant?* regresses without end, so the
                 primitive cannot be applied to any concrete grant.
  SCOPE          the TERMINATION half only.
  ⭐ SPLIT DECLARED  FD-11 is split into FD-11a (termination — BLOCKING) and FD-11b (the
                 taxonomy of source kinds — DOWNSTREAM). ⛔ A split is not a third status.
```

## 3 · INTENTIONALLY DOWNSTREAM

```text
FD-3 · CONCLUDES' placement — rung, or orthogonal permission?
  ⭐ REASONING, offered so it can be checked rather than trusted: every KIND 1 primitive
  carries its OWN `GRANTED BY` field, charter §3.8 requires authority to be POSITIVELY
  granted and traceable, and FD-13 rules that the kinds create no architectural succession.
  Under positive-grant semantics NO RUNG ENTAILS ANOTHER — so ordinal placement changes
  nothing about how CONCLUDES is applied. Its non-collapse guards (§3.6) already hold
  against CAPABILITY, CONTRIBUTES, DECIDES and HAS AUTHORITY independently of position.
  ⚠️ CONDITIONAL, and the condition is named: FD-3 BECOMES RATIFICATION-BLOCKING if
  ratification ever makes any rung ENTAIL a lower one. As written, it does not.

FD-6 · The six contested-knowledge behaviours
  CONTESTED's meaning is complete — a property of a claim, entered by detection of
  incompatible legitimate accounts, exited only by a competent authority or a ruling that
  resolution is unnecessary. The six questions (what may participate · be surfaced · not be
  concluded · who resolves · what evidence resolves · whether resolution is needed) are what
  the architecture DOES with a contested claim. Design.

FD-7 · Does a PERSISTED conclusion acquire consequence a transient one lacks?
  ⭐ PARTLY DISSOLVED by the amendments, and that is why it is downstream: `C-b` answers YES
  for ANY conclusion regardless of persistence, and Amendment 2 §4 makes a persisted one
  also answer `C-c`. So FD-7 cannot change WHETHER a conclusion is governed — only HOW.

FD-9 · Does the can / may split settle Phase 1's C-04?
  CAPABILITY and CONCLUDES are each applicable without answering it. And per the permanent
  labelling rule, resolving C-04 would be recorded as a FOUNDER DECISION — ⛔ it is not a
  charter definition, and ⛔ Phase 1's NOT SETTLED standing is unaffected either way.

FD-10 · Must CONTRIBUTES be OBSERVABLE in the target architecture?
  ⭐ PARTLY DISSOLVED: charter §3.5's EVIDENCE field already requires the contribution be
  "traceably present in the produced artifact", so the primitive is applicable as written.
  Whether the TARGET ARCHITECTURE must GUARANTEE that observability is a design requirement.

FD-11b · The taxonomy of governing-source kinds
  Constitutional · founder-delegated · member-granted · role-derived · protocol-derived ·
  situational · other. ⭐ GOVERNING SOURCE is applicable without the taxonomy: a source is
  identified, citable and able to revoke, or it is not. Which KIND it is affects allocation.

FD-12 · Does MAIA hold any HAS AUTHORITY?
  Reclassified by founder ruling as a DEFERRED AUTHORITY-ALLOCATION DECISION. HAS AUTHORITY
  is defined without assigning it. ⛔ And mapping may not answer it by observing that code
  already behaves authoritatively — current behaviour is not a grant.
```

## 4 · ⚠️ One register entry the binary cannot classify without circularity

```text
FD-8 · "Ratification: which of the twelve stand as drafted, which amended, which rejected."
  ⭐ This is not a decision WITHIN the charter — it is THE RATIFICATION ACT the register
  exists to serve. Calling it ratification-blocking is circular; calling it downstream is
  false.
  ⭐ PROPOSED, ⛔ not decided: STRIKE FD-8 from the register as a mis-filed entry.
  ⚠️ Flagged rather than forced, because forcing it into a status the entry does not fit is
  the kind of tidying this lane exists to refuse.
```

## 5 · Register state after the review

```text
DECIDED        FD-1 (form) · FD-2 · FD-5 · FD-13 · FD-14 · FD-15 · FD-17 · FD-18 · FD-19 · FD-20
DISCHARGED     FD-16
BLOCKING       FD-4 · FD-11a
DOWNSTREAM     FD-3 (conditional) · FD-6 · FD-7 · FD-9 · FD-10 · FD-11b · FD-12
MIS-FILED      FD-8 — retirement proposed
```

## 6 · Result

```text
⛔ RATIFICATION REMAINS HELD
```

Two decisions are required to apply two primitives — `DECIDES` (FD-4) and `GOVERNING SOURCE`
(FD-11a) — and in both cases **the charter's own text says so**, deferring part of a definition to
an open FD. ⭐ Every other open decision concerns what the architecture should do, and the
primitive it touches is applicable as written.

⭐ **Both blockers are single semantic questions, not redesigns.** A founder act settling *whether
rule-execution is `DECIDES`* and *where the authority chain terminates* would leave no
ratification-blocking entry in the register.

⛔ No primitive was amended by this review. ⛔ No decision was taken. ⛔ No code, Phase 1 record,
or sibling lane was consulted.

```text
P2-00            DRAFT — three amendments, reviewed
ratification     HELD — FD-4 · FD-11a
mapping          BLOCKED          implementation  BLOCKED

AUTH-EXPOSURE-01 independent · W-1 AND W-3 · ⛔ neither alone spends it
```

---
_Decision-register review. One pass, four documents, two blockers, no third status._
