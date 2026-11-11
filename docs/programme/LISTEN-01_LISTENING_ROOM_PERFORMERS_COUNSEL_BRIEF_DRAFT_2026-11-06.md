# Counsel brief — showcasing performers in Soullab's Listening Room (DRAFT for founder review)

**State:** draft text for the founder to review and edit. **Not sent. No counsel engaged. No performer contacted.** Prepared by Claude for Kelly Nezat; the founder decides whether, when and to whom it goes, and which attachments accompany it.
**Founder read-through, 2026-11-06:** asked whether to add, cut or reword anything → "no" (no changes requested). Recorded as *no edits wanted*, **not** as approval to send or to engage counsel.
**Standing of the facts below:** everything about third-party terms was **read from the platforms' own pages on 2026-11-06 and paraphrased**; it is a dated reading, not a guarantee, and terms change. Nothing here has been tested in front of members: the Listening Room is on internal hold.
**Items in `[brackets]` are things I do not know** — please fill or delete before sending.

## 1. What we want to do (in plain terms)

Soullab (`[legal entity name, jurisdiction]`) runs a members-only app. Its **Listening Room** is a quiet place to listen. We want to add two sections — **Soullab Picks** (performers Soullab chooses) and **Members** (performers members suggest, curated by Soullab) — that introduce performers whose music is already published on **YouTube and Spotify** (and, as links only, Tidal, Apple Music, Bandcamp, SoundCloud and performers' own sites).

- **We host no audio and no video.** A card shows the performer's **name, a short description in Soullab's own words, links** to where their music lives, and a **click-to-load player supplied by YouTube or Spotify.** When a member presses play, the platform serves the performance.
- **Two tiers.** *Tier 1:* we link/embed with credit and **do not ask permission**. *Tier 2:* the performer opts in and gives a one-time permission for us to show their name, an introduction they write or approve, a photo and links.
- **Soullab Mixes (proposal):** DJ-style mixes of featured artists, with every artist and title credited — *not yet decided how to publish* (see Q5).
- **Members' suggestions:** a private form that goes only to the founder; nothing is published automatically.
- **Platform and audience:** members' app on web and iPhone (Capacitor shell); `[member countries]`; `[any minors among members? — please confirm]`.

## 2. Facts counsel should know (from primary sources, 2026-11-06)

- **YouTube** (IFrame Player API, API Services Terms/Policies, Required Minimum Functionality): embedding is permitted unless the uploader disables it; the policies **prohibit** covering or obscuring the player, separating audio from video, background playback, and modifying/blocking the player; **a play counts toward the video's official views only if started by the player's own play button**; selling advertising/sponsorship on a page containing YouTube content carries conditions; inside an app web view the app must **identify itself to YouTube** (YouTube documents setting the Referer to `https://` + the app's registered bundle ID). We tested that approach on a real iPhone; the standard in-app embed fails with error 153 without it.
- **Spotify** (Embed docs; Widget Terms of Use v2.0, effective 27 May 2014; Developer Terms v10, effective 15 May 2025): the widget must be shown unaltered and unobscured; **no caching, saving/downloading, or synchronizing recordings with visual media**; the widget licence is for **"a website you control"**; the Developer Terms **prohibit using Spotify content to train or be ingested into AI/ML models**; logged-out listeners get previews.
- **Mixcloud** (Terms of Use): permits uploading previously-released recordings with the copyright owners' permission; the licence to embed its widgets is for **"personal website, blog or social network profile pages for non-commercial and private use only"**, and **forbids exploiting widgets for commercial gain.**
- **Soullab's own owner records (#1979, #1984)** state: *imported Spotify/TIDAL/Apple Music metadata is not a licence*; the recording-rights registry **must fail closed** (unknown rights ⇒ no Soullab-hosted media; an artist agreeing to a submission is not automatically all rights); TIDAL's developer terms are limited to non-commercial use and forbid AI use of its content and independent storage of its catalog; Spotify's commercial streaming integrations require its approval beyond embeds. **Our design is embed-only: no sign-in with providers, no provider web-API calls, no stored provider metadata.**

## 3. Questions (in priority order, each with our proposed position)

1. **Embedding in a members-only commercial app.** Is embedding official YouTube and Spotify players inside the member app — with **no payment by members specific to the listening feature** `[confirm: is the app free, paid, or a subscription?]` — permissible under their terms and `[jurisdiction]` law, without asking each performer? *Proposed position: yes for embeds the platform itself offers; we never copy, host, download or alter.*
2. **"A website you control" (Spotify).** Does an iPhone app whose pages load from our own origin count? Any issue with how the web page is presented inside the native app?
3. **YouTube advertising/sponsorship conditions.** Does a membership product count as "selling advertising, sponsorships, or promotions on a page containing YouTube content"? *Proposed position: no — there is no advertising on the page.*
4. **Native player and YouTube's identification rule.** Is presenting the player in a native web view with an `https://<bundle id>` identity — **as YouTube's documentation describes** — compliant? We also **pause and never auto-play**, and will keep the player unobscured and unmodified.
5. **Soullab Mixes.** If Soullab publishes a DJ-style mix: (a) is **linking** to a licensed DJ-mix platform enough, given its widget licence is non-commercial; (b) does Soullab need anything (licence, notice) if it is only a link? (c) if Soullab **hosted** a mix, what must be cleared per track (master + composition, territories, mixing/derivative rights) — our rule is **no Soullab-hosted media without full clearance**.
6. **Performer permission wording.** Please review the Tier 2 invitation/grant (draft attached): **name, photo, introduction and links only; no rights in recordings; non-exclusive; revocable; removal within `[N]` days.** In particular: (a) adequacy of a photo/name permission (rights of publicity) in `[member countries]`; (b) **who can say yes** for a group, band, estate, label or distributor — does a solo performer's yes bind others; (c) minors as performers; (d) whether anything in the grant could be read as an **endorsement/affiliation claim** by Soullab, and whether the word **"featured"** is safe.
7. **Credit and takedown.** We carry credit on every card and an "Are you the artist? — tell us or ask us to take this down" line. Do we need a **formal notice-and-takedown process** even though we host no media (and what if members' suggested links point to infringing copies)? Any safe-harbour considerations for links to third-party content?
8. **Members' suggestion form.** It collects a member's free text and optionally first name, goes to the founder only, and is not published. Privacy/consent requirements in `[member countries]`; retention; deletion on request; **member-minimum-age** issues `[if relevant]`.
9. **AI.** Spotify's and TIDAL's terms restrict use of their content with AI. Our app contains an AI companion (MAIA). **Proposed position: performer/provider content and listening activity are not given to MAIA's models, and cards contain only Soullab's own words, the performer's own words, and links.** Please confirm that this satisfies the restrictions, and advise whether MAIA *mentioning* a performer a member brought up in conversation is a separate question. `[Founder decision pending: whether listening activity is ever remembered — currently not designed.]`
10. **Cultural/lineage music.** For music from living traditions, we propose **not featuring it as a Tier 1 spotlight at all** without its keepers' participation. Any legal exposure beyond ethics (e.g. traditional-knowledge or community-rights regimes) we should know about?

11. **Thank-you benefits for performers.** The founder is considering offering featured performers — **unconditionally, with no obligation to promote Soullab** — ordinary membership access when it is open to them, a card in which they introduce themselves in their own words with a support link, and highlighting (credit, a note they approve, inclusion in credited mixes). Please advise on: (a) whether any benefit changes the **consideration/contract** character of the Tier 2 grant, helpfully or not; (b) **endorsement/affiliate disclosure** if a performer later mentions Soullab; (c) **tax or reporting** of in-kind benefits, if any; (d) any conflict with the **YouTube/Spotify terms** (promotion, advertising) when a performer's card contains a self-promotional link; (e) how to word it so it is **never a payment for promotion**. *Proposed position: no payment either way, benefits unconditional, "self-promote" limited to their own card.* `[Founder decision pending.]`

## 4. What we are **not** asking

- Whether to build, ship or price anything; the room itself is on internal hold.
- A review of the app's terms of service or privacy policy as a whole.
- Advice on the AI/audio engineering design (reviewed separately).

## 5. Materials available to attach (your choice, founder)

1. Tier 2 invitation + grant + suggestion-form consent copy — `LISTEN-01_PERFORMER_INVITATION_AND_CONSENT_WORDING_DRAFT_2026-11-06.md`.
2. The design note's rules and card anatomy — `LISTEN-01_FEATURED_PERFORMERS_AND_LISTENING_COMMUNITY_DESIGN_DRAFT_2026-11-06.md` (§3–§5, §8a, §8b). **⚠️ This note also contains internal programme detail; share an extract, not the whole file.**
3. Platform term sources and the date read (Section 2).

## 6. Facts I do not know and have not guessed

Soullab's legal entity and governing law · which countries members are in · whether any members are minors · whether the app is free or paid · whether a licensing agreement with any rights society exists · who at Soullab signs for the company · the counsel's jurisdiction · the timeline.

## 7. Not authorised by this document

Engaging counsel; sending this brief or any attachment; contacting any performer or platform; any statement that a legal position has been confirmed.
