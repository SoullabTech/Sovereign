# DESIGN.md — Soullab design brief for agents

**Status:** a derived working brief. **Not canon.** Drafted 2026-09-29 from a read-only survey of the repository.
**Authority:** `docs/canon/SOULLAB_THEME.md` ("Soullab Core") is the canonical visual system. This file only restates it in a form agents can use, and adds operational rules (motion vocabulary, accessibility floor, tool policy). Where the two conflict, SOULLAB_THEME wins and this file is wrong.
**Purpose:** any agent or design skill building UI in this repo reads this before writing any markup. A design skill that recommends something this file prohibits loses.

---

## 1. Precedence (who wins when sources disagree)

1. MAIA Oath, Canon and Sovereignty Invariants: no manipulation, no attachment capture, no guru stance.
2. `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`, for every outward sentence.
3. `docs/canon/SOULLAB_THEME.md`: palette, principles, prohibitions.
4. This file: operational rules.
5. Room-level token files, which are sanctioned exceptions:
   - `components/journal/room/tokens.ts` (the paper room)
   - `app/writers-studio/full-redesign/tokens.ts`
6. Third-party design skills. These are advisory only (§9).

**Out of scope for Soullab canon:**
- **Now What** (`--nw-*`, `components/now-what/PaperRoom.tsx`). This is Larry's coaching instance and has its own brand.
- **Elemental Alchemy v1** (`docs/book-studio/ELEMENTAL_ALCHEMY_DESIGN_SYSTEM_v1.md`). This is a print/book register, not an app theme.
- `docs/MAIA_ELEMENTAL_VISUAL_DESIGN_SYSTEM.md`. It is speculative, nothing references it, and its saturated named colours clash with the SOULLAB_THEME prohibitions.

## 2. Essence (from canon)

Dark, contained, developmental. It should feel like entering a field, crossing a threshold, being held somewhere quiet.
It is **not** SaaS, not productivity software, not social media, not gamified wellness.

The principles are:
- containment before stimulation
- depth before brightness
- **accent is never decorative**
- variation by function, not identity
- hierarchy from spacing, grouping, elevation and weight, not from colour

## 3. Palette (canonical, `--sl-*` in `app/globals.css`)

| Role | Value |
|---|---|
| Canvas / Deep / Lift | `#0A1628` / `#060D18` / `#0F1D32` |
| Surface / Elevated / Soft | `#121A2B` / `#1A2235` / `#162033` |
| Border subtle / stronger | `#1E2F4D` / `#2A3F63` |
| Text primary / secondary / muted | `#F5F7FB` / `#B7C0D1` / `#7F8AA3` |
| Accent gold / soft | `#B8860B` / `#D4AF37` |
| States | muted green · amber · muted red (never neon) · low-saturation blue |

- **Tailwind:** use the `maia-navy-*`, `maia-ink-*` and `maia-spice-*` tokens. Don't use raw `amber-*`, `purple-*` or `teal-*`. Those raw classes (711, 284 and 114 uses) are the main source of drift.
- **Known inconsistency (not yet fixed):** `html`/`body` paint `#1A1513` (warm brown) at `app/layout.tsx:87` and `app/globals.css:311,319`, while the canon canvas is navy. **This is a founder decision** (§10.2).

## 4. Element colours — ⛔ NOT RULED

There is no canonical element→colour map. The survey found at least 10 conflicting maps across 32+ files, and `getElementColor` is defined three times (`lib/imaginal`, `lib/holoflower-schema`, `lib/motion`).
- **Air** is the worst case: it appears as sky blue, lavender, near-white, yellow and gold.
- **Water** is either blue or teal, and the canon bans teal as an identity colour.
- **Aether** is purple, grey, lavender or pink depending on the file.

**Until a founder ruling:**
- Do not introduce a new map.
- Reuse the map already local to the surface you are editing.
- Never use elemental colour as decoration. The accent rule applies.

**Candidate direction (proposal only):** one exported module, `lib/design/elements.ts`. The muted register of `components/reflections/ReflectionsFeed.tsx:12-16` fits Soullab Core best:
- fire `#d58a28`
- water `#6f94bd`
- earth `#9eae6e`
- air `#c9b995`
- aether `#9d7fb0`

## 5. Typography

**What actually loads:**
- Inter, via `next/font`, self-hosted at build.
- Self-hosted `@font-face` in `app/fonts.css`: Atkinson Hyperlegible, Crimson Pro, IBM Plex Sans, Source Sans Pro, Spectral.

**Rules:**
- No remote font `@import`. `app/fonts.css:3-4` already states this.
- ⚠️ `lib/manuscript/render/print.css:21` and `print-book.css` violate it (Google CDN). That is a known finding and is not fixed here.
- ⚠️ **Classes that silently fall back to other fonts:**
  - `font-cinzel` (18 files): Cinzel is not loaded globally.
  - `font-cormorant` (16 files): Cormorant is never loaded.
  - Playfair and Crimson Text on screen: they fall back to Georgia.
  - Don't add new uses of these until the font question is settled (§10.3).
- Prefer Tailwind font tokens over inline `style={{fontFamily}}`.

## 6. Motion

Motion is presence, not performance. The default answer to "should this move?" is **no**.

**Vocabulary** (tokens in `:root`, `app/globals.css`, derived from values already in use):

| Token | Value | Use |
|---|---|---|
| `--motion-quick` | 200ms | hover, state change |
| `--motion-settle` | 400ms | enter / exit |
| `--motion-threshold` | 780ms | rare crossings only (the house threshold) |
| `--ease-quiet` | `cubic-bezier(.2,.7,.2,1)` | all one-shots |

- **Ambient loops:** only if they earn their place, at 7s or slower, always gated on reduced motion. The model to follow is the aurora constant and the dream/journal rooms.
- **`linear`** is for spinners only. **`ease-in-out`** is for ambient loops only.

**Never:**
- springs with overshoot
- `scale(0)` entrances
- scale-on-hover across repeated items
- stagger on utility lists (cap it at 150ms total where it is kept)
- pulsing dots that read as notifications or "live"
- confetti, reward or celebration motion
- motion that implies aliveness or presence when nothing is happening. Flag it; the founder decides.

**Reduced motion, three layers:**
1. **Room CSS modules** carry their own `prefers-reduced-motion` block. These are primary.
2. **`app/globals.css`** has a global backstop that collapses all CSS animations and transitions.
3. **`ReducedMotionProvider`** (`MotionConfig reducedMotion="user"`) in `app/layout.tsx` covers framer-motion transforms.
   - ⚠️ It does **not** cover opacity-only framer loops. Those must gate themselves on a live `prefers-reduced-motion` listener. The pattern to copy is `components/OracleConversation.tsx:1634`.

## 7. Accessibility floor (non-negotiable)

- **Contrast:**
  - body and small text at least 4.5:1, which means at least `text-white/55` on navy
  - focus indicators and non-text UI at least 3:1
  - never `text-white/20–35` for anything that must be read
- **Focus:** a visible `:focus-visible` on every interactive element. Public surfaces use the `.sl-focus` wrapper (2px `#D4AF37`). Never `outline-none` without a replacement.
- **Names:**
  - every icon-only button has `aria-label`
  - every input has a label or `aria-label`; a placeholder is not a label
  - disclosures carry `aria-expanded`
  - async answers carry `aria-live="polite"`
- **Targets:** at least 44×44px (`min-h-11 min-w-11` or `p-2.5`). Never set `tabIndex={-1}` on a real control.
- **Viewport:**
  - use `100dvh`, not `min-h-screen`, on full-height surfaces
  - layouts must work at 390px
  - zoom is never capped (`app/layout.tsx:70-73`)

## 8. Prohibitions

**From canon:**
- teal as the identity colour
- white SaaS surfaces in core flows
- per-page accent colours
- high-saturation gradients
- neon
- heavy glassmorphism
- flat black

**From the vows** (these override any design-skill advice):
- no urgency colours, countdowns, scarcity or "limited" framing
- no social proof: no "Trusted by" logo walls, testimonial carousels, avatar rows or user counters
- no fabricated specificity: no "messy organic numbers", no randomized dates
- no conversion-maximising restructuring. Don't collapse paired CTAs into one pushier CTA, and don't force CTAs above the fold at the cost of the page's pace.
- no analytics, CDN images (`picsum`, `simpleicons`), remote fonts or external image generators
- **no copy changes from design work.** Wording goes through claim discipline. Design tools may note "copy → claim-discipline review" with file:line and nothing more.

## 9. Design tools policy

Security review of 2026-09-29, pinned commits:

| Tool | Verdict | Use |
|---|---|---|
| `kylezantos/design-motion-principles` @ `4a9ca87` | Safe project-scoped | Motion create/audit. Strip the Google Fonts `<link>` from its HTML report template. |
| `Leonxlnx/taste-skill` @ `ce26fc2` | **Reference only, do not install** | Read `redesign-skill`'s audit checklist and `minimalist-skill`. `output-skill` and `imagegen-*` override defaults; `taste-skill` says it "MUST use" any image-gen tool present (OpenAI included). Its conversion and "Trusted by" content breaks §8. |
| `nextlevelbuilder/ui-ux-pro-max-skill` @ `09170ee` | **Do not install** | Sibling skills read `~/.claude/.env` and call Gemini and other cloud AI. `stack/.claude/settings.json` enables all MCP servers and grants `Read(//home/**)`. Its data encodes urgency and countdowns. Only its accessibility, touch and form rules are compatible, and they are already folded into §7. |
| getdesign / Awesome Claude Design | Not used | Borrowed brand systems conflict with §2. |
| DESIGN.md Chrome extractor | Not used for identity | — |

Never install design skills globally (`-g`). They would load in constitutional lanes.

## 10. Open founder decisions

1. **The canonical element→colour map** (§4).
2. **Body background:** warm `#1A1513` or canon navy `#0A1628` (§3).
3. **Display fonts:** load Cinzel/Cormorant/Playfair locally, or retire their classes (§5).
4. **The hero aura's violet glow** (`HeroSection.tsx:71`, `rgba(139,92,246)`) is a second, decorative accent against gold. Keep it, or retint it into the gold/navy family?
5. **Sanctuary badge pulse** (`OracleConversation.tsx` ~8499): make it static for everyone? A pulsing dot reads as "live/notification", which works against Sanctuary's visual-clarity invariant. It is currently gated on reduced motion only.
6. **"Breathing" holoflower and greeting loops:** do they imply presence when nothing is happening? These were flagged, not changed.

## 11. Known motion and accessibility backlog (not fixed in the 2026-09-29 pass)

- **Oracle divination pages** (`app/oracle/{iching,tarot,runes,yijing}/page.tsx`):
  - 40–60 infinite full-screen particles, now covered only by the global framer backstop
  - `Math.random()` in render, which causes a hydration mismatch
  - `scale:0` spring at `yijing:376`
- **`components/maia/MaiaCenterField.tsx:31`:** `usePrefersReducedMotion` reads matchMedia during render. That causes a hydration mismatch and doesn't react to changes in the OS setting.
- **Dead duplicates:** `styles/consciousness-animations.css` (byte-identical to `app/styles/`) and `styles/sacred-animations.css` (unimported superset). `app/oracle/page.broken.tsx` is not a route.
- **Globally imported but used on one page:** `styles/living-mandala.css` (`app/maia/mandala` only).
- **Staggered utility lists:** runes, iching, tarot, library, ChangeLandscapeVisual, ChangeJourney.
- **`/accounted-for` is not declared in `config/accessMatrix.ts`.** It is reached only through the unmapped default. This is an access-declaration gap to route separately.
- **Copy for claim-discipline review:**
  - `HeroSection.tsx:140`: privacy trust line
  - `AskWidget.tsx:93`: "Ask Kelly / MAIA" is ambiguous about who answers
  - `ResearchSection.tsx:189`: capability-count phrasing
