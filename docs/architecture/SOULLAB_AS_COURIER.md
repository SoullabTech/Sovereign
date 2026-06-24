# Soullab as Courier — Gift → Delivery → Welcome

- **Date**: 2026-06-20
- **Status**: **DESIGN CAPTURE — not authorization, not canon.** No code changed by this document. Earn through use; spec before build.
- **Origin**: Kelly, 2026-06-20 — *"I wouldn't think of it as 'the platform sends a Soul Portrait.' I'd think of it as 'the platform carries a gift.'"*
- **Companions**: [`SOUL_PORTRAIT_THRESHOLD.md`](./SOUL_PORTRAIT_THRESHOLD.md) (the Welcome), [`SOUL_PORTRAIT_PATH_B_SPEC.md`](./SOUL_PORTRAIT_PATH_B_SPEC.md) (recipient consent), the Authorized Action pattern (author · consent · execute · audit).

## 1. The reframe

Not *"the platform sends a Soul Portrait."* → **"the platform carries a gift."**

- The **sender is always a person.**
- The **gift is always from that person.**
- Soullab simply provides a graceful way for it to **arrive.**

The platform never initiates and never courts. Its only act is **faithful carriage** of what a person authored — which keeps its jurisdiction on its own conduct, never reaching for the recipient.

## 2. The architecture

```
   Soul Portrait → Send        ✗  (platform sends a thing)

   Gift → Delivery → Welcome   ✓  (a person gives; the platform carries; the recipient is welcomed)
```

**Soul Portrait is one kind of gift.** The category is open: Year Ahead · Relationship Reading · Blessing · Letter · Meditation · Reflection · a shared journal · a book chapter · a song · an elemental practice. All carried the same way.

## 3. The voice (recipient never feels marketed to)

The recipient opens a link that says **"A gift has been prepared for you"** / *"Kelly has something he'd like to share with you."* — **never** "You have a notification," "Kelly shared content," or "Someone invited you to join."

The gift is **complete on open** — nothing missing, no funnel. Only after they've experienced it, one quiet line near the end:

> *Whenever you'd like to return, you'll always be welcome here.*

Not to convert — because that is what a good host says as you leave.

## 4. Generosity as a front door (the growth model)

Kelly's "many front doors" gains a whole category — and it is **not** marketing, growth, or sharing. It is **generosity.** People bring others not because Soullab asked, but because something beautiful happened to them and they wanted someone they love to feel it too. Growth **through relationship, not promotion.**

## 5. Guardrails (the load-bearing part)

1. **The courier must never become the marketer.** This is the make-or-break line, and it fails *silently* under growth pressure. The platform must be **indifferent to whether the gift is sent or opened** — it serves the giver's intent and nothing else. So: **no open-rate as a goal, no "you haven't sent yet" nudges, no conversion-optimized welcome, no gamified generosity.** The farewell line is **fixed copy, never A/B-tested.** *Generosity that is measured becomes promotion.* A courier paid by how many packages get opened is not a courier.
2. **Never auto-deliver to a minor.** Augusten's guard, generalized: the carrier must be structurally unable to deliver *to* a minor (hand-mediated only), even if a gift is *for* one.
3. **Gift stays authored, never generated-to-send.** Keep Gift ⟂ Delivery ⟂ Generator distinct. The courier carries what a person made; it does not manufacture gifts to deliver (protects the Traceability Covenant and earn-before-name).
4. **Recipient-side consent (Path B) re-enters** the moment a gift touches the recipient's data, account, or an ongoing relationship — not for a static hand-opened link, but for anything deeper.
5. **Built on the Authorized Action rails:** one human authors → consent → one execution → one audit. The platform is the stamp, never the sender.

## 6. Status

Real, buildable, and better than a per-feature "send" (it generalizes). But it is a **new primitive** whose spec spine *is* §5's guardrails — its own deliberate crossing, not a quick toggle. **Not needed to share Katie** (hand-delivered, live today). Spec under the Authorized-Action discipline before any build.
