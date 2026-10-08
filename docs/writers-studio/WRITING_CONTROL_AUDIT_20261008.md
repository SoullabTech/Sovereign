# Writing controls: behavior audit and bounded repairs

Date: 2026-10-08
Candidate: feature/writers-studio-beta-readiness-20261007
Standing: presentation repairs verified; not production deployed and not a whole beta release clearance.

## Founder request

Layout, Tools and Preferences must retract the previous field when a new one opens. Each option must have a visible, useful effect and an intelligible place in writing. No draft, focus, conversation, authorial permission or manuscript should change merely from opening a panel.

## Reproduced and repaired

- Multiple menus could be open simultaneously. One explicit disclosure state now allows zero or one open panel; content remains mounted.
- Escape closes the active menu and returns focus to its heading. An outside pointer closes it; inside interaction does not.
- Preferences extended below a 1440 x 1000 viewport: the real browser could not reach More open. Menu cards now have a viewport-bounded, internally scrollable height.
- Hover and active layout shared the same color treatment. A checkmark now identifies the active layout separately; aria-pressed remains authoritative.
- Arrow-key resizing changed widths but called the layout Balanced. It now identifies the custom split correctly.

## Actual behavior, not proposed capability

| Control | Current effect | Boundary / usability finding |
| --- | --- | --- |
| Balanced | Side-by-side, approximately equal widths; configured left share 50% | No change to MAIA reading scope or prose |
| Passage wide | Side-by-side, left share 62% | More room to read the writing |
| MAIA wide | Side-by-side, left share 38% | More room for conversation, explanations and alternatives; not more intelligence |
| Stacked | Passage above editorial field, both full width with vertical scrolling | Useful for long lines/narrow windows; may require more scrolling between copy and response |
| Revision directions | Shows/hides existing directions/options sections | A visibility toggle, not a new request |
| Working draft | Shows/hides the draft and its action area, leaving the editor mounted | Can conceal the very next authoring action; needs ergonomic review |
| Craft depth | Shows/hides existing explanatory sections | Not a model-depth setting. Initial entry cards have no matching section, so it may appear inert there. Prefer a plain label such as Show craft explanations |
| Edit strength | Passes a separate numeric editing-latitude setting | Does not imply paragraph deletion or Apply |
| How much MAIA shows | Stores pacing preference, consumed by editorial request plumbing | Live model compliance must still be separately witnessed |
| How MAIA explains | Stores explanation vocabulary/density preference; updates illustrative preview | Not a measurement of MAIA reasoning depth |
| Allow paragraph-removal proposals | Separate explicit permission | Independent of strength; never automatic Apply |
| Suggest wording straight away | Separate suggestion preference, currently exposed only at Light | Existing helper text still says Touch; visibility and terminology require reconciliation |
| Reading size / Line spacing | Changes rendered passage font size and line height | Presentation only |
| Reset view | Resets layout, reading presentation and visibility toggles | Does not reset authorial permissions or alter text |

The six initial cards are distinct from Tools toggles: edit options requests proposals; Discuss, examples, ideas, teaching and deeper analysis use their bounded conversation paths. This audit traced the request wiring but did not invoke a real model or certify the quality of its answers.

## Verification

- Independent tests before repair: 3 failures / 2 passes, reproducing exclusive-panel, keyboard-dismissal and outside-dismissal defects.
- Final focused regression: 49 tests across 6 suites, all pass.
- Expanded tsconfig.ws-beta-readiness.json typecheck: exit 0.
- Real Chromium component/CSS witness: 22 checks pass, zero page errors, zero network requests outside its local synthetic harness.
- Browser verified geometry, actual font sizes/line spacing, CSS hide/show, draft element identity and exact text preservation, keyboard Enter/Space/Escape, outside dismissal, preference state and independent permission callbacks.
- Browser at 1440px: Balanced passage 720px / editorial 710px; Passage wide 892.8px / 537.2px; MAIA wide 547.2px / 882.8px; Stacked full-width 1440px, editorial begins below passage.
- Tested font sizes at that viewport: 23.76px, 27.36px, 30.96px. These are responsive measurements, not fixed font promises.

## Boundaries

No Elemental Alchemy text, source, draft, editorial request or stored choice was touched. The user's existing 3741 tab was not refreshed or swapped to this candidate. Broader beta readiness work remains separate and in progress. A passing presentation witness is not a passing live-model or complete release witness.

Sources inspected: IsolatedEditorialRoom.tsx, p4r1-live.css, EditorialDancePanel.tsx, P4R1Pc3WriteEditView.tsx, workingStyle.ts, editorialCollaboration.ts, editorial scope and suggestion-policy modules.
