# Writer's Studio — member-facing census for MAIA's Studio guide (2026-11-11)

**Purpose.** The inventory behind `lib/writersStudio/studioGuide.ts`: every room and control a writer meets, so MAIA can answer "how do I… / where is… / what does … do" by naming the real control.

**Ref (version pin).** First read from `origin/fix/ws-develop-walk-fixes-20261111` @ `c9ab0ee490` (PR #2230, which carries production hotfix `03399abe2`). #2230 then merged, and the census is pinned to canonical **`clean-main-no-secrets` @ `a5a80f7e05`**. `git diff c9ab0ee490 a5a80f7e05` is empty for every UI path the census covers (`app/dev/writers-studio-pc3-live`, `app/dev/writers-studio-p4r1`, `app/writers-studio`, `components/bugs`), so the inventory carries over unchanged. The guard test re-checks every label against whichever tree it runs on.

**Runtime vs source.** A control merged behind a switch is not one a writer sees. The guide reads the Studio's own switches at runtime (`studioRuntime()`):
- the Develop stage (`NEXT_PUBLIC_WS_DEVELOP_STAGE`): compose default 1, Dockerfile default 0;
- automatic reading (`NEXT_PUBLIC_WS_AUTO_READ`): compose default 1;
- the Pro gate (`WS_PRO_GATE_ENABLED === "true"`, from #2223): off unless set;
- export certification (`releaseAuthority.ts`): false in source.

It describes only what is on. What production actually has set was not witnessed here.

**Evidence class.** This is a code read: it shows what the source renders, not what a writer meets on a device. Labels are copied from JSX and checked by the guard test (`lib/writersStudio/__tests__/studioGuide.test.ts`). No F6 walk was done for this census.

## The tree members actually reach

- `/writers-studio` → `app/writers-studio/page.tsx` → `app/dev/writers-studio-p4r1/P4R1StudioHost.tsx`. The room comes from `?mode=` and defaults to Home. Every room uses the same top bar, `app/writers-studio/full-redesign/Shell.tsx`, and its tabs come from `PRIMARY_MODES` (`full-redesign/types.ts`).
- Rooms:
  - home → `P4R1HomeView`
  - write → `P4R1Pc3WriteEditView` (with `WriteRoom` and `EditorialDancePanel`)
  - develop → `P4R1DevelopView` → `DevelopStage` + `canvas/WorkConversation`
  - review → `P4R1ReviewController`
  - publish → `P4R1PublishRoom`
  - listen → `ListenPilot`
- Not inventoried (unreachable from the live tree): the dev review pages, `full-redesign/HomeRoom|DevelopRoom|ReviewRoom`, `flagship/*`, `studio/*` and `insight/*`. Some older routes can still be opened directly (`/writers-studio/develop`, `/rebuild`, `/review`, `/canvas`), but nothing in the live tree links to them.
- ⚠️ `app/writers-studio/studioMap.ts` (`STUDIO_MODES`) still marks Review and Publish as `later`. The live top bar does not use it and shows all six rooms. The guide takes its rooms from `PRIMARY_MODES`. It uses `STUDIO_MAP` only for the list of things that are *not* in the Studio yet.

## Findings to carry (reported, not fixed here)

1. **Quiet and Balanced look the same on the Develop stage.** `DevelopStage.tsx:185` checks only `view === 'full'`. They differ only on the older Develop map, where Balanced adds "Other ways to explore, if useful". The guide states this as current behaviour.
2. **"turns" in the conversation list counts messages.** `threadStore.ts` `threadsOnLivingWork` counts `ask_turns` rows, one per message from either side. The guide says so.
3. **Broken link.** Preferences → "See the planned Free and Pro experience" points to `/writers-studio/plans`, and no such route exists. The guide tells MAIA that the link does not open a page yet.
4. **Free/Pro.** There is no plan switch on screen. Only the whole-book editorial pass can be gated, and only when `WS_PRO_GATE_ENABLED === "true"`. This code read cannot tell whether it is on in production. The guide says nothing about the switch's state beyond what the writer would see.
5. **Develop-stage flag drift.** `NEXT_PUBLIC_WS_DEVELOP_STAGE` defaults to 1 in `docker-compose.production.yml` and to 0 in the Dockerfile.
6. **The old guide named controls that live only on the All-tools Develop map** ("Read this chapter", "Start an editorial pass", "Edit with MAIA") as if they were the main route. The guide now says where each one actually is.
7. **Sanctuary got no guide in the Work conversation** (askReader, walk 2026-11-09 defect 5). Passage Focus got the full guide, including reading permission, even in Sanctuary. Both now get a Sanctuary variant that leaves out every reading or keeping tool. See the guide's `inSanctuary: false`.
8. **Review → Discuss** (`reviewDiscussReader.ts`) was a Studio conversation without the guide. It now has it. Its entry point is "Discuss with MAIA" on a Review finding (`full-redesign/LiveReviewRoom.tsx`), and Sanctuary refuses it ("Review Discuss is unavailable while Sanctuary is on.").
9. **Revision latitude names differ between surfaces.** `editorialScope/contract.ts` uses Touch, Line, Passage, Shape and Open; `IsolatedEditorialRoom.tsx` calls band 1 "Light".
10. **The take-me-there actions are not runtime-aware.** With the Develop stage off, MAIA can still offer `show:*`, which opens a More panel that is not there. This was found in the eval.

## 1. Top bar and shell (`full-redesign/Shell.tsx` unless noted)
| Label | file:line | Where | Does | Condition |
|---|---|---|---|---|
| Home / Write / Develop / Review / Publish / Listen | Shell 249-260; types.ts:11-18 | room tabs | switch room (asks first if leaving unsent text) | all six live |
| Room (dropdown) | 266-272 | top bar, narrow screens | the same six rooms | narrow layouts |
| Preferences | WriterPreferencesMenu.tsx:66 | top bar | "How would you like to work?" | every room |
| ↳ Tell the Studio in your own words / Review / Apply to my Studio / Not now | :71-85 | Preferences | describe a display preference; MAIA proposes it; the writer applies it | - |
| ↳ Fine-tune directly → How much to show (Quiet / Balanced / All tools), Working pace (Intimate / Guided / Mapped), Explanation (Plain / Guided / Craft / Deep), Reading size (Large / Larger / Largest) | :90-116 | Preferences | direct settings | - |
| ↳ About Studio access / See the planned Free and Pro experience | :121-124 | bottom of Preferences | text about access, plus a link | the link's route is missing |
| Layout | Shell 276-277 | top bar, right of Preferences | Theme, Aa size, ‹/› Manuscript, MAIA ›/‹, Open MAIA ›, Reset widths | hidden in Full Canvas |
| Work switcher (title ▾, "Choose another Work") | 337-344 | right end of top bar | to Home to pick another Work | a Work is open |
| Panel dividers | 366-386 | between panels | drag to resize; double-click to reset | - |
| Beta note → "What happened?" → Keep beta note | P4R1BetaFeedback.tsx:78-80 | bottom-left | a beta note for the Soullab team | `?beta=1` and an eligible beta tester |
| Beta journey | P4R1BetaJourney.tsx:282-288 | bottom-left | team questions; answers can be withdrawn or shared to the Beta Co-Lab | eligible beta testers |
| Report a bug | components/bugs/BugReportButton.tsx | bottom-right, every page | sends a bug report | signed in |

## 2. Home (`P4R1HomeView.tsx`)
Return to this work · Publish (inline) · Choose a manuscript to continue · Start writing · What feeds this Work · Your Works (Open / Start writing / Delete or Remove) · Writing not yet in a Work (Open writing / Make this a Work / Add to a Work / Delete) · History → See all history · Start or bring a Work → New Work / Import writing / Notes & sources.

## 3. Write (in addition to the earlier Passage Focus entries)
Manuscript rail (open a section) · Saved / Saving… / Unsaved · Full Canvas / Return · words count, Previous / Next · Edit this section · Talk with MAIA › (on selected words in Edit) · Show me an edit · Talk about this place / Develop this place / Review this place (MAIA panel after clicking a section) · Talk about the whole book · Relationship with MAIA (Begin / Change / Leave; nothing is deleted) · Passage Focus: Start with MAIA / Continue, "We’ve talked about this passage before" → Our latest / Earlier / Start a new one; Use it / Change it / Talk about it / Keep mine.

## 4. Develop stage (`DevelopStage.tsx`; requires `NEXT_PUBLIC_WS_DEVELOP_STAGE=1`)
| Label | file:line | Does | Condition |
|---|---|---|---|
| Chapter dropdown | 237-243 | pick a chapter | - |
| View: Quiet / Balanced / All tools | 245-253 | Quiet and Balanced behave the same; All tools opens More beside the chapter | - |
| Read this chapter with MAIA | 255-259 | MAIA reads the open chapter | not while a reading is running; automatic reading only with `NEXT_PUBLIC_WS_AUTO_READ=1`, read permission, and not in Sanctuary |
| Edit in Write | 261 | go to Write | - |
| More / Back to the chapter | 262-266 | the More panel | hidden in All tools |
| Ways row: Development, Structure, Arc, Themes, Voice, Coherence, Continuity, Reader | 271-278 | opens a lens beside the chapter (← Back to the reading); Themes opens its own room | - |
| Whole book · editorial pass (… ready) | 283-288 | starts or opens the whole-book pass | gated only if the Pro gate is on |
| Make a plan with MAIA → Make a plan / Not now | 314-329 (More) | MAIA drafts plan steps | not in Sanctuary; if the posture is unknown, Ordinary/Sanctuary first |
| Plan steps: To do / Working on it / Resolved / Set aside, Remove, Go to the passage, Work on this passage, delete the plan | 333-378 | edit the plan | a plan exists |
| What she read for that answer · Go there / Read it here | 386-412 | the chapters behind her last answer | after an answer |
| Starters · More ways to explore | 415-424 | fill the box (unsent) / leave for the All-tools map | - |
| Your book: Fiction / Nonfiction / A helper’s book · Change | 503-546 | the kind of book | - |
| What MAIA can read → Let MAIA read my saved work / Only the passage I am in / Stop | ReadScopeControl.tsx:55-68 | grant or revoke reading | not in Sanctuary |
| What you have settled → Note something you have settled → Keep this / Withdraw | SettledDecisions.tsx:47-69 | decisions MAIA won't reopen | not kept in Sanctuary |
| Ask MAIA about this | 466-475 | selected chapter words → message box | words selected |
| Coverage line · Which ones? / Hide | CoverageLine.tsx | which sections MAIA has read | - |
| Reading card: Go through what she noticed / Talk about one passage / Work toward a revision / Leave it for now | 578-606 | act on her reading | reading ready |
| Conversation: More / Fewer options → Where are we?, Start a new conversation, Focus, Keeps, Open in MAIA → | WorkConversation.tsx | the conversation's own controls | - |
| Earlier conversations: "{date} · {n} turns" | WorkConversation 672-692 | resume one; n counts messages | more than one conversation |
| About: where I am / the whole book · Ask about the whole book? | 1001-1022 | the scope of the question | - |
| Correct MAIA → Keep correction | ~805-863 | correct her understanding | - |
| All-tools Develop map: Read this chapter, More ways to explore → Edit with MAIA → Start an editorial pass | P4R1DevelopView 1672, 1928-1936 | the older map | off the stage |

## 5. Review · Publish · Listen
- **Review**: Review / Proof tabs · Quick reread (or Save current draft & quick reread) · Run deep Review · Saved Reviews · Talk about the larger Work.
- **Publish**: a "Beta preview". Downloads are held ("File downloads are awaiting final verification.") until export certification. It has Interior preview, a Cover study and preparation steps for KDP, EPUB and Soullab Press.
- **Listen**: "Author Voice Studio · Private recording pilot". Read aloud, Record my voice, Download WAV. Recordings stay in the browser session only.

## 6. Ordinary / Sanctuary (exact copy)
- Passage Focus: "How would you like me to hold this conversation?" / "I won’t guess. Ordinary can be remembered; Sanctuary is never saved."
- Craft: "How should this Craft session be held?"
- Develop: "How would you like me to hold this session? I won’t guess. Ordinary can be remembered; Sanctuary is never saved." This appears under Make a plan, What MAIA can read and What you have settled.
- Sanctuary notice in Develop: "Sanctuary is on, so MAIA is not reading your work and cannot make a plan."

## Where training / group sessions with MAIA happen (proposal only — nothing changed)
The guide now reaches every Studio conversation. It does **not** reach MAIA's main chat (`app/api/oracle/conversation/route.ts`) or Team/Co-Lab conversations. Adding it there would change non-Studio prompts for every member, so it needs a founder ruling. The proposed shape is in the PR description.
