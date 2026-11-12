# ASTRO-PRO-MAIA-GUIDE-01 — Astrology control census

**Subject:** canonical `clean-main-no-secrets` @ `20ce7334e5`. **Instrument:** code read
(two read-only census passes plus spot verification by the lane, 2026-11-11).
**Not:** a walk, a production witness, or a device check. A label here is *present in
source*; it is not proven *visible at runtime*.

Part of the [Astrology Pro MAIA guidance spec](ASTRO-PRO-MAIA-GUIDE-01_SPEC_2026-11-11.md).

Paths are under `app/astrology/pro-preview/` unless given in full. **E** =
`ProAstrologyExperience.tsx`. Labels are quoted as rendered (`&amp;` shown as `&`).
Spot-verified by the lane against source: rail and desk limit (E:114, 607–672), empty
states (E:909, 956, 978), `ProMaiaDock.tsx` empty state, `ASK_MAIA_LIMIT = 40`,
"Progressions & returns", the Relationships footer line, the wheel centre text.

---

## A. Astrology Pro cockpit

### A.0 Gate, shell and desk

- **Who may open it:** `page.tsx:21–36` + `lib/astrology/proAccess.ts`. Preview enabled,
  valid phase, founder UUID, a session, and founder or active tester grant. Anyone else:
  `notFound()`. No tier or subscription check. No phone-specific JavaScript branch.
- **Rail, in order** (E:97–109, 607–672): "Chart", "Timing", "Relationships", "Places",
  "Traditions", "Readings", "Research", "Study", "Saved charts". Tooltip `{label} ({n})`.
  Keys 1–9 toggle a tool; **M** shows or hides MAIA; ignored while typing (E:707–721).
- **Desk** (E:113–114, 504–530): `DESK_LIMIT = 3` — one tool in hand, others folded to
  header bars; the oldest leaves when a fourth opens. "Saved charts" is open on first
  load. Clicking the tool in hand closes it; any other opens or brings it forward.
  Opening a tool closes the MAIA stage. First opening of Timing loads the sky now.
- **Tool header** (E:917–948): tool name; tablist when more than one tab; sparkle button
  "Ask MAIA about {tool}" (title "Ask MAIA about this", **only with a chart open**);
  "Collapse {tool}" / "Expand {tool}"; "Close {tool}".
- **Empty / no-chart copy:** "No tools open. Choose one from the rail, or press 1–9."
  (E:909) · "Open a chart to use {Tool}." / "Open a chart to use {Tool} · {Tab}." (E:956).
  Only **Saved charts** and **Readings → Soul Portrait** work without a chart (`withoutChart`).

### A.1 Header and opening a chart

- "Astrology Pro" brand link (aria "Return to Soullab Astrology") (E:730).
- Title: "My chart" / {saved label} / "No chart open" (E:735).
- **"Houses"** select (E:736–752): "Porphyry" (default), "Whole Sign", "Equal",
  "Placidus", "Koch". Title: "Changing the house system closes the open chart and its
  unsaved notes".
- With a chart: "Calculation method and limits" (info popover, five paragraphs, "Close");
  **"Share with client"** (saved client chart only; title "Make, copy or view this
  person’s private chart link"); "Close chart".
- Sky strip "The sky now": "Calculating the sky…" / "Current sky unavailable" /
  "Sky at {time}".
- Badge **"Private preview"** (E:787), kept on phones.
- Stage toggle **"Talk with MAIA"** / "Tools" (title "Talk with MAIA, or return to the tools (M)").
- **Empty stage** (E:876–891): heading "Open a chart to begin"; "Your own chart is
  calculated from the birth details held by your signed-in account. A client’s chart
  opens from Saved charts."; buttons **"Open my chart"** ("Opening your chart…") and
  "Saved charts"; link "Edit my birth details" (`/account/settings`). Status copy for
  signed-out, astrology consent not opted in ("Astrology access is not opted in…"),
  incomplete details ("…Review chart details"); "Verifying private chart access…".
- **Wheel controls** (E:831–866): "Aspects" toggle, "Houses" toggle, "Max orb"
  ("All" / "1°" / "3°" / "5°" / "8°"), "Orbs" disclosure (`ProOrbSettings.tsx:74–114`:
  presets "Engine default", "Wider Sun and Moon", "Tight"; "A pair uses" "the larger of
  its two orbs" / "the average of its two orbs (moieties)"; "Reset to engine default"),
  planet buttons, resize divider (hidden ≤900px).
- **Not present:** a birth-data form for the astrologer's own chart (it is edited at
  account settings), a zodiac selector in the header, a header chart-picker. Sidereal is
  only under Chart → Views.

### A.2 The nine tools

| Tool → tab | Exact controls (source) | Needs chart | MAIA view phrase (`PRO_ASK_VIEWS`) / sees figures |
|---|---|---|---|
| **Chart → {planet}** (default "Point") | Segments "Calculated", "Explore", "My notes"; "Aspects to {X}"; notes "My notes on {X}" — "Kept in this page while the chart is open. Not saved, and not sent to MAIA." (E:548–600) | yes | "one selected point of the chart" / yes |
| **Chart → Aspects** | "Aspect grid & declinations"; tabs "Aspect grid", "Declinations"; "Parallels within 1°" (`ProAspectGrid.tsx:56–123`) | yes | "the aspect grid and declinations" / yes (declinations added) |
| **Chart → Views** | "Chart points & views"; "Chart points", "Sidereal", "Harmonic" (2–360) (`ProChartViews.tsx:41–85`) | yes | "alternative views of the chart (sidereal, harmonic, chart points)" / **no** |
| **Chart → Houses** | "Spiralogic house wheel"; "Traditional order", "Spiralogic order" (`ProHouseWheel.tsx`) | yes | "the Spiralogic house wheel" / **no** |
| **Timing → Transits** | "Moment (your local time)"; "Show transits", "Now", "Hide"; "Step" (1 hour…1 year); "◀", "▶", "◀◀ Play back", "Play ▶▶", "Stop", "Live clock"; "Transit aspects to this chart" + "Orb"; link "Talk with MAIA about these transits"; dates 1800–2200 (`ProTransitPanel.tsx:134–202`) | yes | none sent; section `transits` |
| **Timing → Progressions** | "Progressions & returns"; "Chart": "Progressed chart", "Solar return", "Lunar return", "Mercury return", "Venus return", "Mars return", "Jupiter return", "Saturn return"; "Progressed to" / "First return on or after"; "Calculate", "Show as outer ring", "Clear"; link "Talk with MAIA about progressions and solar arcs" (`ProDerivedPanel.tsx:21–133`) | yes | none; section `progressed` |
| **Timing → Ephemeris** | "Ephemeris & timeline"; "From"; "Span" (3–36 months); "Scale" ("360° (zodiac)", "90° (hard aspects)", "45°", "30° (degree in sign)"); "Draw"; "Transit timeline ({n} exact hits)" (`ProEphemerisPanel.tsx:83–154`) | yes | "the graphical ephemeris" / **no** |
| **Relationships → Two charts** | "Compare"; "Compare {chart} with" ("Choose a chart…", "My chart"); "Compare", "Biwheel", "Composite", "Clear"; "Contacts between the charts" + "Orb"; empty "Save a chart for someone else to compare with it."; links "Talk with MAIA about the two charts together" / "…about the composite" (`ProComparePanel.tsx:106–166`) | yes | none; sections `biwheel` / `composite` |
| **Relationships → Questions** | "RELATIONSHIPS · OWN-CHART INQUIRY · PRIVATE"; "Questions for relational awareness". On a client chart the panel receives no chart (E:634) and asks to open your own. | own chart | "questions for relational awareness drawn from this chart" / yes |
| **Places → Astro map** (only tab) | "Astro map & relocation"; "Draw astro map" / "Redraw"; "Relocate to" ("City, country"), "Relocate"; body toggles; legend "Solid: MC · short dash: IC · long dash: Ascendant · dotted: Descendant. Click the map to relocate…"; 66° N–66° S limit (`ProAstroMapPanel.tsx:112–174`) | yes | "the astro map (whether they have relocated the chart to a place is not known)" / **no** (#2228) |
| **Traditions → Vedic · Chinese · Mayan** (only tab) | "Other systems"; tabs "Vedic", "Chinese", "Mayan"; "Ayanamsa" ("Lahiri", "True Chitra", "Krishnamurti (KP)"); "Day begins at" ("Midnight", "23:00, the Zi hour"); "Show {chart} in these systems". Vedic: "Profile", "Dasha", "Planets". Chinese: "Pillars & year sign", "Zodiac reading", "Ten-year cycles" ("Forward"/"Backward"). Mayan: "Traditional count", "Path of life", "Galactic signature", "Today’s energy". Links "Talk with MAIA about the Vedic chart" / "…the Four Pillars" / "…the Mayan count and path of life" (`ProSystemsPanel.tsx`, `ProFourPillars.tsx:141–177`) | yes | **no view sent** (sections `vedic`, `four-pillars`, `mayan`) |
| **Readings → Deep reading** | "Deep reading by MAIA"; "Transits on (optional)"; "Four Pillars", "Traditional Maya count", "Progressions and solar arcs"; "Luck pillars:" forward/backward/leave out; "over a period since (optional)"; "What you know of their life (optional)"; "Focus" ("Write a full reading."); "Write the reading" / "Write it again" ("MAIA is writing… about a minute"), "Copy", "Clear" (`ProDeepReadingPanel.tsx:74–126`) | yes | section `deep` (no view) |
| **Readings → Soul Portrait** | "Name on the portrait"; "Kind" ("Gift", "Self", "Parent–child", "Legacy"); "Page theme"; "Age"; "Subject is a minor"; "Add the Year Ahead (optional)"; "Write draft", "Cancel"; "Draft ready." → "Open draft", "Write another" (`ProSoulPortraitPanel.tsx:20–148`) | **no** | "a Soul Portrait of this chart" / yes |
| **Readings → Tradition report** | "REPORT · LABELLED AS TRADITION"; "Natal report: {label}"; "Read report" / "Hide report", "Print"; "The angles", "Placements", "Closest aspects" (`ProTraditionReport.tsx:38–68`) | yes | "the written report of what tradition says about the placements" / yes |
| **Research** (only tab) | "RESEARCH WORKBENCH · PRIVATE"; "Chart evidence table"; "Maximum displayed orb"; "Calculator-reported aspects" (`ProResearchWorkbench.tsx:28–112`) | yes | "a research snapshot of this chart" / yes |
| **Study** (only tab) | "STUDY · METHOD BEFORE MEANING"; "The chart as a field of inquiry"; tracks "Foundations" ("Reading a position", "Houses and conventions", "Aspects and orbs", "Apparent motion", "Meaning and multiple lenses") and "Techniques" (nine `TECHNIQUE_LESSONS`); "Observe", "With the open chart", "Practise in Pro", "Check yourself", "Show answer" (`ProStudyWorkbench.tsx`, `lib/astrology/proStudyField.ts`, `proTechniqueLessons.ts`) | yes | "a study lesson, using this chart as the example" / yes |
| **Saved charts** (only tab) | "CHARTS FOR OTHER PEOPLE"; "New chart" → "Name" ("e.g. Sam, or Client A"), "Birth date", "Birth time (local)", "Birthplace" + "Search", "Timezone at birth", "I have this person’s permission to keep their birth details here.", "Save and open chart", "Cancel". Rows: "Open chart", "Share link", "Soul Portrait", delete ("Delete permanently?" "Delete" / "Keep"). Empty "No saved charts yet." (`ProSavedCharts.tsx:184–283`) | **no** | none |

### A.3 Share with client (`ProChartShareAction.tsx:39–166`)

- "A private link shows {label} their chart and its transits, view-only, with no account
  needed. You can turn it off any time."
- Checkboxes: "{label} agreed to have their chart shared by link." · "Include the
  Elemental Alchemy overview." · "Let {label} ask MAIA about this chart. MAIA answers
  from this chart only, as MAIA, and keeps nothing."
- "Offered by (optional — your name or practice)"; "Make link", "Cancel".
- After: "Ask MAIA: {used} of {limit} questions used." (`ASK_MAIA_LIMIT = 40`,
  `lib/astrology/proChartShares.ts:37`); "Save changes", "Copy", "View", "Turn off", "Close".
- **No expiry copy exists**; a link lives until turned off.

### A.4 The MAIA stage

- `ProMaiaDock.tsx:56–93`: "Back to the tools"; "MAIA"; segment **"Ask"** / **"Mentor"**
  (only with a chart); "We are talking about {subject}" (select "What MAIA is reading"
  when several); "· you have {where} open, {X} selected, so you can say “this”".
- **Without a chart:** "Open a chart and MAIA can read it with you. Until then there is
  nothing for MAIA to see. Use “Open my chart” beside the wheel, or Saved charts on the rail."
- Talk bar (E:976–980): "Talk with MAIA about {subject}" / **"Talk with MAIA once a chart
  is open"**, with "Ask · Mentor · in depth".
- Conversation (`ProAskMaiaPanel.tsx:169–270`): disclaimer "MAIA will read {readsWhose}
  to answer: only the calculated facts of this section, not names or birth details.
  Nothing is kept. MAIA is an AI, not the astrologer."; "Brief" / "In depth"; "Draw on
  all systems (progressions, Four Pillars, Maya count)" (natal only); **"Read this with
  what you know about me"** (own chart only, not in Mentor) with its note and provenance
  lines; "Include transits on (optional)", "Look across a period since (optional, up to
  10 years)"; chips "Say more", "Shorter, please", "What next?" / "Show me on this chart";
  "Ask MAIA" / "Ask the mentor" ("MAIA is reading…"), "Clear". Starter prompts per
  section at `ProAskMaiaPanel.tsx:64–91`.

### A.5 Phone (CSS only; no JS branch)

≤1240px sky strip shows four bodies · ≤900px rail becomes a sticky horizontal row,
divider hidden, regions stack, talk bar sticks to the bottom, share popover inline ·
≤600px smaller header, badge kept.

### A.6 Observations found by the census (not fixed here)

| # | Observation | Source |
|---|---|---|
| O-1 | The Relationships → Questions footer says "No chart data is transmitted to MAIA", but asking MAIA from that view sends the view phrase and the natal facts. True of the panel, misleading of the stage. | `ProRelationshipsWorkbench.tsx:68` vs `PRO_ASK_VIEWS.relationships` |
| O-2 | The wheel centre reads "Your chart" even when a client's chart is open. | `CelestialChartWheel.tsx:280` |
| O-3 | `PRO_ASK_VIEWS.vedic` and `.mayan` are defined but the cockpit never sends them (Traditions sets no `view`). | E:640–644 |
| O-4 | Study lesson practice steps name panel headings ("Astro map & relocation", "Aspect grid & declinations", "Chart points & views", "Progressions & returns", "Ephemeris & timeline", "Natal report", "Compare"), not the rail path the astrologer clicks (Places → Astro map, …). Real labels; incomplete directions. | `proTechniqueLessons.ts` |
| O-5 | No expiry for client links; MAIA must never tell a client or astrologer that links expire. | `ProChartShareAction.tsx` |

### A.7 Labels only in unreachable code (guard test must exclude)

- `ProAskMaiaPanel.tsx:297–311` non-dock branch ("Ask MAIA about {subject}", its "Close").
- `ProElementalOverview.tsx` — reachable only from the client page, never the cockpit.
- `portraitOpen` state (E:180): no UI attached.
- `ProAspectGrid` without declinations ("Aspect grid" heading alone) and `ProTransitPanel`
  without `ask` — client page only.
- Unverified: labels inside shared Free components used by Traditions
  (`VedicProfilePanel`, `DashaTimeline`, `ChineseReadingView`, `DaYunTimelineView`,
  `MayanSignCard`, `MayanPathOfLife`). The build lane must census them before naming them.

---

## B. Free Astrology (tester-only)

### B.0 Gate and ways in

- Every `/astrology` and `/astrology/**` path except `/astrology/pro-preview` returns an
  **empty 404** unless the visitor is signed in, verified, and `members.tester = true`
  (`proxy.ts:437–444`, `lib/astrology/testerGate.ts`; lookup error = not a tester). This
  includes `/astrology/discover`. Calculator APIs are not gated by it.
- `app/astrology/layout.tsx` wraps these pages (and Pro) in `HouseEntryThreshold room="FREE ASTROLOGY"`.
- Ways in, shown to testers only: House catalog "Free Astrology" — "Explore your
  personal birth chart and current sky." (`lib/house/catalog.ts:23`); rail "Free
  Astrology" (`lib/navigation/maiaNav.ts:146–156`, `audience:'tester'`); House
  destination "Astrology" (`lib/navigation/houseDestinations.ts:370–376`); House sky
  line "Open Astrology →" / "Explore the moment in your chart →" when `canOpenAstrology`
  (`components/astrology/CurrentTransitsField.tsx:108–170`); `/patterns` modules filtered
  for non-testers (`app/patterns/page.tsx:54`).
- **O-7 · Ungated ways in (lead non-testers to a 404):** `components/ui/SacredLabDrawer.tsx:409–412`
  "Cosmic Blueprint" — "Your birth chart & astrology" → `/astrology` (mounted in `/maia`;
  spot-verified); `components/account/AccountSettings.tsx:1205, 1381`.

### B.1 `/astrology` (`app/astrology/page.tsx`)

- Loading: "FREE ASTROLOGY" / "Gathering your sky."
- No chart: signed out "Your chart is waiting." → "Enter your chart"; unreachable
  "Your chart is resting." → "Try again"; error "Your chart needs another look." →
  "Try the chart again"; first visit "Begin with the moment you arrived." / "Add your
  birth date, time, and place." with `BirthDataForm`: "Birth Date", "Birth Time" ("If
  unsure, use 12:00 noon"), "Birth Location", "Calculate My Birth Chart".
- Whisper **"PRO ASTROLOGY · IN DEVELOPMENT"** (aria "Pro Astrology development preview", :179–185).
  **No link, badge or upgrade path to Pro exists in Free.**
- With a chart: corner "Edit Chart" / "Calculate Chart" → "Birth Chart Calculator",
  "Update Chart" / "Calculate Birth Chart" ("Updates all astrological pages instantly");
  "Your birth sky"; "Your chart at first glance" (SUN, MOON, ASCENDANT; ELEMENTAL
  EMPHASIS); "CURRENT LENS" with ZodiacToggle "Tropical", "Sidereal", "Chinese", "Mayan"
  (the last three **navigate** to `/astrology/vedic`, `/chinese`, `/mayan`);
  "What do you recognize here?" → "Keep this as a Reflection" (POST
  `/api/astrology/reflection`, member-owned capsule, **no model call**); "House Wheel"
  with "House System" ("Porphyry", "Placidus", "Whole Sign", "Equal", "Koch"),
  "Transits", "Which lens fits your inquiry?"; "Planetary Positions"; "Patterns to hold
  together" → "Open this aspect →"; "The lunar nodes as an evolutionary lens"; "Show the
  current sky →" / "Hide current sky"; "Spiralogic Pathways" ("Fire Pathway" …);
  "Additional Wisdom Systems" ("Vedic Astrology", "Mayan Astrology", "Chinese Astrology").
- **No route from this page to MAIA.**

### B.2 Other Free rooms

| Route | Labels | Notes |
|---|---|---|
| `/astrology/vedic` | "Vedic Astrology", "Back to Astrology", "Calculation Settings" → "Ayanamsa System", "Enter Your Birth Details", "Calculate Vedic Chart"; tabs "Profile", "Dasha", "Planets", "New Chart" | needs a saved birthplace; Gochara/Ashtakavarga **withheld**; Dasha withheld without birth time |
| `/astrology/chinese` | "Chinese Astrology Portal"; tabs "Zodiac Profile", "Da Yun (10-Year Cycles)"; "Explore Your Symbolic Reading"; "Gender (affects cycle direction)" | client-side; `/api/astrology/chinese/discuss` has no caller and returns **451** "…unavailable pending consent review." |
| `/astrology/mayan` | "Dreamspell · Modern Calendar-Inspired Astrology"; "Discover Your Galactic Signature"; tabs "Galactic Signature", "Path of Life", "Today's Energy" | Dreamspell only (Pro carries the traditional count) |
| `/astrology/aspects/[slug]` | "Back to Chart Overview"; "What This Aspect Is", "The Spectrum: Shadow & Gift", "How This Aspect Works", "Working With This Aspect" | |
| `/astrology/pathways/[element]` | "Back to Cosmic Blueprint", "Soul Questions" | |
| `/astrology/synastry`, `/synastry/saved` | "Synastry is not open in this Free release." | **held** |
| `/astrology/report` | "The generated Astrology report is not available in this Free release." | **held** |
| `/astrology/synastry/[analysisId]` | — | fetches a route that does not exist; treat as unreachable |
| `/astrology/discover` | "Your chart is not a verdict.", "Enter Astrology", … | tester-gated, so 404 for the public |
| `/chart` (public) | "Your Cosmic Blueprint", "Calculate another chart"; teasers "Unlock Archetypal Interpretations" → "Create Free Account", "Ask MAIA About Your Chart" → "Meet MAIA" (both to `/signin`) | nothing goes to MAIA |
| `/birth-chart` | — | redirects to `/patterns` |

### B.3 How Free Astrology meets MAIA

- Main chat loads the member's own birth chart summary and transits when birth data
  exists (`app/api/oracle/conversation/route.ts:948–968`).
- `AstrologyHandoffCard` in MAIA chat ("Cosmic Blueprint", button "Look through your
  Cosmic Blueprint") navigates to **`/journey`**, not `/astrology`
  (`lib/astrology/astrologyHandoff.ts:280`, spot-verified), carrying an emotional field
  context in sessionStorage. Direction is MAIA → page; no chart goes to MAIA.
- `/api/astrology/narrative` is called only by an unimported component: dead.

## C. Shared client chart (`/shared-chart/<token>`)

- Public, no account, `noindex`, `no-referrer`. 404 unless Pro is enabled, the share is
  live (not revoked, chart not deleted) and **the owner still holds Pro**.
- **No time-based expiry.** A revoked link shows the generic "Path Not Found" page
  (`app/not-found.tsx`); no tailored copy.
- Header "A CHART SHARED WITH YOU". Nav: "Chart", "Transits", "Positions", "Aspects",
  plus "Elements" if included and "Ask MAIA" if turned on (`SharedChartView.tsx:56–63`).
  Sections "Your natal chart", "Current transits", "Where everything sits", "How the
  planets relate", "The elements in your chart". Footer "A calculated chart, not a reading…".
- Ask box (`SharedAskMaia.tsx`): "Ask MAIA about your chart"; "MAIA is an AI in Soullab,
  not your astrologer. It answers from this chart and today’s transits only, and keeps
  nothing: your questions are not saved."; starters "What pattern holds this chart
  together?", "What do today’s transits highlight?", "What could I explore with my
  astrologer?"; limit copy "This link has reached its number of questions. Your
  astrologer can help with anything more."
- Limits: 40 per link, 6 per minute per token and IP (memory), 600 characters; crisis →
  fixed reply, no model.
- **Model receives:** client's **first name** (first word of the saved label,
  `app/api/shared-chart/[token]/ask/route.ts:92`, spot-verified), the "offered by" name,
  chart text (angles, bodies, ≤24 aspects, ≤12 transits), elemental data if included,
  one question. **No birth date, time or place; no earlier turns.** Persists: the
  counter and a log line "answered".
- **O-6:** unlike Pro Ask ("never a name"), the client path names the client to MAIA so
  she can address them. By design of that pathway; recorded so the guide never claims
  "MAIA is never told a name" across all routes.

## D. Phone and native

- Pro: §A.5 (CSS only).
- Free: compact ZodiacToggle is icons only; Vedic tab labels and Mayan "Galactic" hidden
  below `sm`; stacks at ≤900 / ≤640px. Shared chart ≤520px: nav not sticky, Ask row stacks.
- Native iOS shell: only exact `/astrology` is a phone route (`lib/mobile/mobileAllowlist.ts:66`);
  by source, subroutes and `/shared-chart` show "Available in Web Studio"
  (`MobileRouteGuard.tsx:189–193`). **Unverified at runtime.** Whether Pro is reachable
  in the native shell is not established.

## E. Released absences (the guide states these as not available, never as coming)

- Pro for anyone without a grant; any sign-up, upgrade, billing or price.
- Free synastry, saved synastry, generated report; Free Vedic Gochara / Ashtakavarga;
  Chinese MAIA discussion.
- Client-link expiry; client accounts; any export beyond Tradition report "Print" and
  Deep reading "Copy".
- Chart transfer into main MAIA (R4F, held).

## F. Dead code (labels must not count)

`app/astrology/page-old.tsx`, `page-archetypal-backup.tsx`; the locked "Upgrade to
unlock" block in `page.tsx` (`isPersonal` hard-coded `true`); `ArchetypalNarrativeCard`,
`ArchetypeExplorerCards`, `LifeCycleTimeline` (unimported); `/astrology/synastry/[analysisId]`;
plus §A.7.
