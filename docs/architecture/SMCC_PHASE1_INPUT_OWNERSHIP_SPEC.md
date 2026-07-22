# SMCC Phase 1 — Input Ownership (change spec, for review)

**Status:** SPEC — awaiting Kelly approval before any implementation.
**Branch:** `fix/ios-conversation-contract` · **Authority:** `MOBILE_CHAT_INTERACTION_AUDIT_2026-07-21.md` (finding **F3**)
**Order:** Phase 1 of the strict dependency chain. Fixes *correctness* only; render-cost is deferred to Phase 3.

---

## The fault (F3)
`ModernTextInput` keeps an internal `value` `useState` (`:84`), renders `<textarea value={value}>` (`:459`), and reconciles it from props via an effect whose dependency array **includes `value` itself** (`:184-189`). The parent passes **two** draft props — `value={draftMessage}` and `externalValue={composerDraft}` (`OracleConversation.tsx:8541,8543`). On a lagged parent frame, the effect writes stale text back into the controlled textarea **mid-keystroke** → truncation, caret jump, and — critically — **abort of WebKit composition → keyboard drop.** This is also the most likely reason the failure now reaches Chrome (state-sequence exposure, not geometry).

## Principle (invariant to satisfy)
- Exactly **one** authoritative value for the textarea.
- **No effect whose dependencies include the value it rewrites.**
- No stale-value restoration during a keystroke; no interruption of WebKit composition; no caret loss; no text replacement during streamed MAIA responses; **draft preserved while MAIA is responding.**

## Recommended design — fully controlled, single parent owner
The smallest change that removes the fault:
1. **Delete** `ModernTextInput`'s internal `value` state (`:84`), `initialValue` (`:80`), and the sync effect (`:184-189`).
2. `<textarea>` reads directly from a single prop: `value={valueProp ?? externalValue ?? ''}`; `handleInputChange` calls **`onChange` only** (no internal `setValue`).
3. `handleSubmit` calls **`onSubmit` only**; the parent clears the draft (it already does at `:8549`).
4. `adjustHeight` re-runs off the incoming **value prop** (effect dep = the prop), not internal state.
5. **Consolidate the parent to ONE draft state.** Keep `draftMessage`; retire the `composerDraft`/`externalValue` duplication. All prefill flows (SoulPrompt `:9138`, DailyCheckin `:9175`, ElementDiscovery `:9189`) set the single `draftMessage`.

**Why controlled-by-parent, not uncontrolled:** the parent already owns `draftMessage` and every prefill path; this is the smallest change and leaves zero dual state. Its cost — a parent re-render per keystroke — is **render pressure, not a correctness bug**, and is removed in **Phase 3** by extracting a memoized `Composer` that owns the draft locally. Phase 1 fixes correctness; Phase 3 fixes cost. Do not conflate them.

*Alternative considered (uncontrolled, composer-owned draft): rejected for Phase 1 — prefill would need an imperative ref/seed, more surface, and it pre-empts the Phase 3 isolation decision. Revisit at Phase 3.*

## Exact change surface
- `components/ui/ModernTextInput.tsx` — remove internal value state + sync effect; textarea controlled by prop; `handleInputChange`→`onChange` only; `handleSubmit`→`onSubmit` only; `adjustHeight` effect dep = value prop. Keep: callback ref, `disabled`/`readOnly` semantics, `submitError` banner, maxLength, scribe-unlimited mode, voice paths.
- `components/OracleConversation.tsx` — collapse `draftMessage`/`composerDraft` to one draft state; point all prefill handlers at it; keep the submit-clears-draft path.

## Risks / guards
- **IME/composition:** add a `compositionstart`→`compositionend` no-write guard as defense-in-depth (with single-owner + no self-reconciling effect, the primary risk is already gone).
- Voice transcript path (`onVoiceMessage`/`onSubmit`) unchanged; scribe unlimited unchanged; maxLength enforcement retained.

## Acceptance — Phase 1 gate
- **Automated (Claude runs):** typecheck; interaction tests for rapid typing, delete, selection-replace, autocorrect, emoji, paste, multiline, and `compositionstart/end` (assert no mid-composition overwrite); assert draft survives a simulated per-word streamed `setMessages`.
- **Device (Kelly runs — iPhone Safari, definition of done):** type continuously 60s *during a real streamed reply* → no text loss/revert, caret stable, keyboard stays open; autocorrect/predictive/emoji work; send; draft persists while MAIA is responding.

**Do not proceed to Phase 2 until the device test passes.**

---

## Appendix A — Usage map (pre-implementation gate, required by Kelly)

### Structural facts (each verified by grep/read)
1. **`<ModernTextInput` has exactly ONE consumer:** `OracleConversation.tsx:8539`. **No external consumer.** The other input components (`HybridInput`, `ChatGPTStyleInput`, `EmbeddedMAIAChat`, and the unrouted `OracleConversationInterface` — which uses its own `inputText` state, `:58`) are independent and do not touch this contract.
2. `draftMessage` / `composerDraft` are declared and read **only** in `OracleConversation.tsx`. No `localStorage`/`sessionStorage` persistence; no cross-file leakage.
3. **No tests/fixtures** reference either (grep of test dirs = empty).
4. The forwarded ref (`textInputRef`) is used **only** for `.focus()` (a Phase 2 concern) — never to read or mutate the value.
5. Voice transcripts (`handleVoiceTranscript` `:5801`) auto-send via `handleTextMessage`; they do **not** write the draft.

### Every occurrence, classified
| Line(s) | Code | Classification |
|---|---|---|
| `677` | `const [draftMessage,setDraftMessage]=useState('')` | **Authoritative state** |
| `8541` | `value={draftMessage}` | Authoritative (controlled value) |
| `8542` | `onChange={setDraftMessage}` | Authoritative (user typing) |
| `8549` | `setDraftMessage('')` | Authoritative (clear-on-send) |
| `9132 / 9173 / 9187` | `setDraftMessage(prompt/context)` | Authoritative (prefill: SoulPrompt / DailyCheckin / ElementDiscovery) |
| `961` | `const [composerDraft,setComposerDraft]=useState('')` | **Legacy duplicate** |
| `8543` | `externalValue={composerDraft}` | **Legacy duplicate / dead** — `valueProp ?? externalValue`, and `draftMessage` (`''`) is never nullish, so `externalValue` can never win |
| `3521 / 3676 / 3707` | `setComposerDraft(text)` in `journalAskMaia` / `innerLandsAskMaia` / `domainAskMaia` events | **Legacy duplicate — DEAD DISPLAY**: "fill composer (user sees it)" never renders (see `8543`); the send is unaffected (uses `handleTextMessage(text)` directly) |
| `3529 / 3684 / 3715` | `setComposerDraft('')` | Legacy duplicate (clears a dead value) |
| `9133 / 9174 / 9188` | `setComposerDraft(...)` | **Legacy duplicate** — redundant; display already carried by the paired `setDraftMessage` |
| `ModernTextInput:84` | `const [value,setValue]=useState(initialValue)` | **Derived display fighting authoritative state = the F3 fault** |
| `ModernTextInput:184-189` | value↔prop sync effect (`value` in deps) | **F3 fault** (remove) |
| `ModernTextInput:219` | `setValue('')` on submit | Derived (remove; parent clears via `8549`) |

### Behavior audit — is anything lost?
- **Send / clear:** submit value flows from the input (→ becomes the controlled prop value) + parent `setDraftMessage('')`. **Preserved.**
- **Prefill (3 flows):** driven by `setDraftMessage`; the paired `setComposerDraft` is redundant. **Preserved.**
- **Auto-send events (journal / inner-lands / domain):** functional send **preserved** (`handleTextMessage(text)`). The `setComposerDraft(text)` "user sees it" pre-fill is **already non-functional** — dropping it preserves current behavior, **no change**. *(The intended visual pre-fill has never worked due to the `??` precedence bug; RESTORING it — by setting `draftMessage` — would be a behavior change and is **explicitly out of Phase 1 scope**. Flagged as a follow-up, not done here.)*
- **Voice / mode-switch / sub-rooms / refs / tests:** none consume the draft in a way affected by consolidation.

### Verdict: **GATE SATISFIED**
One parent-owned `draftMessage` replaces both with **zero behavior removed**. `composerDraft` is a legacy duplicate whose only unique effect (the auto-send visual pre-fill) is already dead.

### Resulting Phase 1 edit set (input ownership only)
- **OracleConversation.tsx** — delete `composerDraft` state (`961`) and `externalValue={composerDraft}` (`8543`); remove the redundant `setComposerDraft` in prefill (`9133/9174/9188`) and the dead `setComposerDraft` set/clear in the 3 auto-send events (`3521/3529/3676/3684/3707/3715`). Keep `draftMessage` as the single controlled draft; keep `setDraftMessage('')` on send.
- **ModernTextInput.tsx** — fully controlled: remove internal `value` state (`84`), `initialValue` (`80`), the sync effect (`184-189`), and `setValue('')` in submit; `<textarea value={valueProp ?? ''}>`; `handleInputChange` → `onChange` only; `handleSubmit` → `onSubmit(valueProp)` (parent clears); `adjustHeight` keyed off the value prop; drop the `externalValue` prop. Add a `compositionstart/end` no-write guard (defense-in-depth).
- **No** geometry, focus, scroll, or amplitude changes. **No** Phase 3 optimization.
