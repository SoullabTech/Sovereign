# WRITER'S STUDIO — DESKTOP SEAM LOG

**Purpose:**
A durable append-only record of canonical Writer's Studio seams that an
external container such as MAIA Desktop may consume.

**Authority:**
This log does not define Writer's Studio architecture.
The governing WS2 decisions, code, and unit records remain authoritative.

Writer's Studio never implements Desktop compatibility here.
Desktop adapts to these canonical seams.

For each WS2 unit:

```
DESKTOP_SEAM_CHANGED: YES | NO
```

If YES, record:

- contract changed
- exact route / parameter / data shape
- exact files
- whether the change is permanent or temporary
- anything a consumer must NOT infer

---

## Continuity invariant

```
Desktop House
→ canonical Writer's Studio
→ exact canonical Work
→ canonical /maia situated in that Work
→ same conversation
→ return to that same Work
```

---

## WS2-03B · `154383e6`

```
DESKTOP_SEAM_CHANGED: YES
```

**Contract changed —** manuscript-scoped navigation now carries exact
manuscript identity.

```
Canvas   /writers-studio/canvas?m=<manuscript-id>
Export   /press/manuscript?tab=export&m=<manuscript-id>
```

**Files:** `app/writers-studio/studioMap.ts` (`shellDestinations`,
`assertShellPromisesNothing`), `app/writers-studio/canvasIdentity.ts`
(`CANVAS_MANUSCRIPT_PARAM`, `canvasForManuscript`),
`app/writers-studio/studio/StudioRail.tsx`.

**Permanence:** permanent.

**A consumer must NOT infer:**

- That an unnamed Studio entry resolves to a manuscript. With several
  manuscripts it deliberately reaches the chooser. There is no
  "most recent" and no `list[0]` resolution — that substitution is the defect
  this unit closed.
- That `?m=` is always required. The contract is conditional: **if Desktop
  knows the exact manuscript being continued, it must carry `m=<id>`.** If it
  only knows "enter Writer's Studio", an unnamed entry is valid and the Studio
  may ask the member which manuscript they mean. Turning exact identity into a
  blanket requirement would fabricate certainty the container may not have,
  and would defeat the refusal-to-guess rule rather than uphold it.
- That an unresolvable `m=` degrades to something else. It refuses visibly.

---

## WS2-03C · `dd89c181`

```
DESKTOP_SEAM_CHANGED: YES
```

**Contract changed —** canonical Studio → MAIA handoff.

```
/maia?work=<living-work-id>&return=<studio-path>
```

- Client sends **Work identity only**.
- Work `title` / `purpose` / `form` / `stage` are re-read **server-side** from
  the authenticated member's `living_works` row.
- The MAIA request body carries `workContext: { workId }`.
- Return accepts **only** canonical `/writers-studio` paths.
- **Exactly one** declared Work enables situated Conversations; zero or
  multiple Works do not authorize guessing.

**Files:** `app/writers-studio/workContext.ts`,
`lib/writersStudio/workSituation.ts`, `app/maia/useStudioHandoff.ts`,
`app/maia/StudioHandoffBanner.tsx`, `components/OracleConversation.tsx`,
`app/api/sovereign/app/maia/list/route.ts`, `lib/sovereign/maiaService.ts`,
`lib/sovereign/maiaVoice.ts`, `lib/maia/maiaRuntimeContext.ts`.

**Permanence:** permanent.

**A consumer must NOT infer:**

- That anything it puts in the URL reaches the prompt. The URL is a claim; the
  member's row is the fact. A work id the member does not own resolves to
  nothing and the exchange is simply not situated.
- That a `return` value of any shape will be honoured. Non-Studio and
  off-origin values are dropped.
- That the Work model or ownership rules changed. They did not — only the
  resolution contract is new.

---

## SITUATED-WORK-DEEP-01 · `ac9df0c2`

```
DESKTOP_SEAM_CHANGED: YES
```

**Contract changed —** temporary situated-conversation execution containment.

```
computed FAST → FAST
computed CORE → CORE
computed DEEP → CORE
```

- Applies **only** after a server-verified Work situation exists.
- Contained responses expose `computedProfile` and `containmentReason`.

**Files:** `lib/writersStudio/situatedProfileContainment.ts`,
`lib/sovereign/maiaService.ts`.

**Permanence: TEMPORARY.** This is containment, not the permanent routing
contract. It must be removed when DEEP composes the supported addenda channel
(`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B).

**A consumer must NOT infer:**

- That DEEP is capped generally. Unsituated MAIA routing is unchanged.
- That `processingProfile` in a contained response is what the router chose.
  It is what **executed**; `computedProfile` is what the router wanted.
- That these fields are always present. They appear only when a turn was
  actually contained.
