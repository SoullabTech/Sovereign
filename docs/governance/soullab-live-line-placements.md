# Soullab Live Line — Verbatim Placements

Use these lines exactly as written. Do not paraphrase.

---

## The Lines

**Initiation:** It helps you see what's actually going on.

**Trust:** It only remembers what matters — and only if you want it to.

---

## Placement 1: Practitioner Trust Video CTA

Already implemented in `PractitionerTrust/scenes/CTA.tsx` and `soullab-practitioner-trust-animatic.html`. Both lines appear in sequence: initiation → trust → soullab.life.

---

## Placement 2: Website Hero Subline

```html
<section class="hero">
  <h1>For people who take their inner development as seriously as their outer life.</h1>
  <p>It helps you see what's actually going on.</p>
  <p>And it only remembers what matters — and only if you want it to.</p>
</section>
```

The `<h1>` is whichever positioning line fits the page. The two `<p>` tags are the Live Lines verbatim. Two separate elements — do not collapse into one paragraph.

---

## Placement 3: Onboarding Final Screen

The last screen a new user sees after completing setup.

```html
<div class="onboarding-complete">
  <h2>You're in.</h2>
  <p>It helps you see what's actually going on.</p>
  <p>And it only remembers what matters — and only if you want it to.</p>
  <a href="/dashboard">Begin</a>
</div>
```

No explanation. No feature tour. Just the two lines and a quiet entry point.

---

## Placement 4: Email Signature / Footer

For early stewards sharing the tool with colleagues.

```
—
It helps you see what's actually going on.
And it only remembers what matters — and only if you want it to.
soullab.life
```

Plain text. No formatting. No logo.

---

## Rules

1. These four placements use the lines verbatim. No paraphrasing.
2. Always two lines, never collapsed into one sentence.
3. Initiation line first, trust line second. Never reverse the order.
4. If the context needs only one line, use the initiation line. Never use the trust line alone — it sounds like a privacy policy without the first beat.

---

## Microcopy Rule

All product interface text must match Field Voice. This includes empty states, tooltips, error messages, memory consent prompts, save/don't-save decisions, and notifications.

Never use:
- Celebration language ("Great!", "Awesome!", "You're all set!")
- Optimization framing ("Optimize your experience", "Improve your results")
- System enthusiasm ("Our AI has analyzed...", "We've found something exciting")
- Exclamation marks in confirmations

Instead, use simple confirmations:
- "Saved."
- "Nothing stored."
- "You can change this anytime."
- "Only stored if you approve."
- "Session ended."
- "Ready when you are."

Test: Would this sound natural coming from a quiet, experienced practitioner?

---

## Governance Cross-References

- **Voice**: [Steward Language Guide](soullab-steward-language-guide.md)
- **Environment**: [Field Microcopy](soullab-field-microcopy.md)
- **Relationship**: [MAIA Relational Architecture](soullab-maia-relational-architecture.md)
- **Organization**: [System Health Metrics](soullab-system-health-metrics.md)
