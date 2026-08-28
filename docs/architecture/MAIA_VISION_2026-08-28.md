# MAIA Vision — image attachments reach the model

**Date**: 2026-08-28
**Status**: built + wired, **not yet verified in production**
**Trigger**: tester report — *"I could not upload pics to Maia. System took me to My photos, I selected one and Maia said all she could see is file name. I also tried to take a photo and send. In real time. Same result."*

---

## I. What was actually happening

MAIA's answer was **true**. She really could only see a file name.

`components/OracleConversation.tsx` (`handleTextMessage`) took the attached
`File[]` and did this:

```ts
const fileNames = attachments.map(f => f.name).join(', ');
messageText = `${text}\n\n[Files attached: ${fileNames}]`;
```

Text files were then read and inlined. Images were not — there was no branch for
them. The bytes were dropped in the browser; the string `[Files attached:
IMG_0421.HEIC]` was the entire attachment as far as the request body, the route,
`maiaService`, and Claude were concerned.

This was not a broken upload. **There was no upload.** Nothing downstream of the
browser had ever been built to carry an image:

| Layer | Before |
|---|---|
| `components/OracleConversation.tsx` | filename interpolated into message text |
| `POST /api/sovereign/app/maia/list` | no `images` field in the body contract |
| `lib/sovereign/maiaService.ts` | `MaiaRequest` was `{ sessionId, input, meta }` |
| `lib/ai/modelService.ts` | `TextRequest` was `{ systemPrompt, userInput, meta }` |
| `lib/ai/claudeClient.ts` | `messages: [{ role: 'user', content: userInput }]` — a string |

Two other findings from the same trace, worth recording:

- The hidden input used `accept="*"`. On iOS, an explicit `accept="image/*"` is
  part of what makes the photo picker hand back a decodable image; `"*"` invites
  a raw HEIC that nothing downstream could have read anyway.
- `components/chat/InlineFileUpload.tsx` posts to `/api/files/upload`, **which
  does not exist in this repo**. That component is not on the `/maia` path and
  was left alone, but it is dead as written.

## II. The seam now

One explicit `images` field, carried at every hop. Never inside `meta`.

```
File (photo library / camera)
  └─ lib/maia/vision/prepareImages.ts     decode (incl. iOS HEIC) → downscale 1568px → JPEG base64
      └─ body.images[]                     POST /api/sovereign/app/maia/list
          └─ lib/ai/vision.ts              normalizeImageAttachments() — server-side ceilings
              └─ MaiaRequest.images        lib/sovereign/maiaService.ts
                  └─ TextRequest.images    lib/ai/modelService.ts
                      └─ content blocks    lib/ai/claudeClient.ts → Anthropic
```

`lib/ai/vision.ts` is the single contract: the `MaiaImageAttachment` type, the
media-type allowlist, the ceilings, and the no-vision fallback note.

**Why not `meta`?** `meta` is the client-controlled rest-spread of the request
body. It reaches prompt composition and the context-inventory telemetry, both of
which walk its keys. Image bytes must reach neither, and a reader should be able
to grep every hop that touches them. Hence a named field with its own type.

## III. Bounds (enforced server-side, not trusted from the client)

| Bound | Value | Where |
|---|---|---|
| Media types | jpeg, png, webp, gif | `VISION_ALLOWED_MEDIA_TYPES` |
| Images per turn | 4 | `VISION_MAX_IMAGES_PER_TURN` |
| Bytes per image | 4 MB decoded | `VISION_MAX_BYTES_PER_IMAGE` |
| Long edge | 1568 px (client downscale) | `VISION_MAX_EDGE_PX` |

A refused attachment is **reported**, never silently dropped: the client toasts
its own failures, and the route returns `attachments: { seen, rejected[] }` on
the response. Silent loss is how this defect presented in the first place.

## IV. Honesty when she cannot see

Only the Claude lane accepts image blocks. Every other lane in `modelService` —
local Ollama, Kimi, multi-engine, the sovereign router — is text-only, and each
now receives `buildNoVisionFallbackNote()` appended to its system prompt: MAIA is
told the images exist, that she did **not** receive them, and to say so plainly
rather than describe or infer. The bytes are dropped from the request copy handed
to those lanes.

A capability that degrades into confident description is a non-manipulation
failure, not a graceful fallback.

### DEEP is image-blind, and turns carrying images are downgraded to CORE

FAST and CORE generate through `generateText()`. DEEP does not: its primary
generation is the local consciousness wrapper plus the Opus consultation lane,
neither of which takes image blocks — the same structural divergence recorded in
`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B, meeting a new payload.

So `getMaiaResponse` downgrades a DEEP-routed turn to CORE when images are
present, and logs `[MAIA] vision-tier-downgrade`. Losing depth orchestration on
an image turn is a bounded cost; MAIA's most confident register applied to an
image she never received is not. A `[MAIA] vision-reached-deep` warning fires if
the downgrade ever regresses.

**Lifting this requires image support in the DEEP lane — not a flag.**

## V. Sovereignty

**This claim is falsifiable, and the falsification is executable.**
`VISION-EPHEMERAL-01` is enforced in two halves: a source-level drift alarm
(`app/api/sovereign/app/maia/list/__tests__/visionEphemeral.test.ts`, 7
assertions, mutation-tested) and a runtime probe
(`scripts/verify-vision-ephemeral.ts`) that scans every text-bearing column in
every table for image-byte signatures. See the witness doc §1.

**Consent for memory / Sanctuary.** Images are **turn-scoped**. They are passed
to the model call and to nothing else: no loader reads them, no writer persists
them, they do not enter `conversation_turns`, atoms, or any memory layer, and no
caption, tag, or embedding is derived from them. Sanctuary Mode needs no new gate
because there is nothing to withhold — the same is true of an ordinary session.
Images go to Anthropic under exactly the concession that already governs text
(`ALLOW_ANTHROPIC_TEXT`); no new provider, no new destination.

**Growth-obligation check** (CLAUDE.md, 2026-08-04):

- *What uncertainty does this introduce, and how is it preserved?* MAIA now
  receives an image and speaks about it, which is a large new inference surface.
  Nothing in this seam interprets the image on her behalf — no classifier, no
  caption, no stored reading. What she makes of it is said in the turn, in the
  member's presence, and is gone. There is no derived image record for a later
  turn to treat as established fact.
- *What provenance and ownership boundaries does this require?* The image is the
  member's, for one turn. A named field at every hop makes each carrier
  greppable; logs carry counts and media types only, never bytes.
- *What new responsibility does this create?* That MAIA never implies she looked
  when she did not. §IV is that responsibility discharged — at the provider lane
  and at the DEEP tier.

**Sovereignty Invariant check.** Agency: the member chooses what to show and
says what it means; the prompt no longer puts *"Please analyze these files"* in
their mouth (see §VI). Outward: an image is usually something from the member's
actual life. Centrality: no retention, so no accumulating image record to become
a reason to return.

## VI. The prompt the app used to author

Attaching without typing used to send **"Please analyze these files:
IMG_0421.HEIC"** as the member's own message — app-authored, put in their mouth,
naming the file as the subject and setting an examining posture they never chose.
It is now `composeAttachmentPrompt()`: the member's typed draft always wins;
absent one, *"I'm sharing an image with you."*

## VII. Verification — NOT yet done

> **Ruling 2026-08-28**: architecture ACCEPTED; device witness and privacy
> witness REQUIRED before acceptance. The full gate, including the
> `VISION-EPHEMERAL-01` falsification probe and the iPhone HEIC + live-camera
> script, is **`docs/ops/VISION_WITNESS_2026-08-28.md`** — that document is the
> acceptance record; this section is the summary.

Status is **built + wired**. Per the standing discipline (*declaration is not
liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified*), this ships as
reachable, not live. It becomes verified when, under authenticated production
load:

1. `👁️ [MAIA] vision-received { accepted: { count: 1, … } }` on the list route;
2. `👁️ [MAIA] vision-attached` in `claudeClient` for the same turn;
3. MAIA's reply describes the image's actual content — the member confirms it;
4. an iPhone camera capture and an iPhone photo-library HEIC each survive the
   client conversion (this is the specific path the tester hit twice);
5. a text-only turn shows no vision log lines at all (no regression).

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 \
  | grep -E "vision-received|vision-attached|vision-tier-downgrade|vision-unavailable"'
```

## VIII. Known limits

- **DEEP has no vision.** §IV.
- **Resend drops images.** The recovery seam resends the member's text; the
  prepared attachments are not retained client-side (deliberate — no image state
  in the browser either). A retried image turn is a text turn, and MAIA will say
  she cannot see it via §IV rather than pretend.
- **No inline thumbnail.** The member's transcript shows `[Attached: name]`, not
  the picture. Rendering it means holding the data URL in message state; deferred
  rather than done carelessly.
- **PDFs still travel as filenames.** Only images were built. A PDF hits the
  unchanged `[Files attached: …]` path.
- **`components/chat/InlineFileUpload.tsx` remains dead** (§I).
