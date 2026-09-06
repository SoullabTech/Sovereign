# E5 · Synthetic Corpus v1 — DESIGN SHEET (SEALED)

```text
SEALED      RATERS MUST NOT SEE THIS FILE BEFORE THEIR CODING SHEET IS SUBMITTED.
            Opening it before submission voids the rater's sheet (manual §2 rule 5).
            Custody: the run coordinator. Not to be pasted into any rater channel.
PURPOSE     Records what the AUTHOR intended each synthetic turn to be, so the dry-run can check
            (a) whether raters can apply the manual at all, (b) whether the adversarial categories
            behave adversarially, (c) whether the manual's definitions leak toward the model.
            The author's readings are NOT ground truth for the corpus and are never used as a
            criterion in M1–M6. They are a design record.
STATUS      SYNTHETIC RUN — licenses nothing about H1.
CORPUS      E5_SYNTHETIC_CORPUS_v1.md · MANUAL E5_CODING_MANUAL_v2.md
```

## 1 · Composition (as built)

| Category | Definition (protocol dry-run condition) | Count | Ids |
|---|---|---|---|
| **mixed** | two or more modes clearly co-present, not in tension | **12** | S02 S05 S09 S13 S17 S21 S25 S29 S33 S37 S41 S46 |
| **contradictory** | one present mode reads against another | **9** | S03 S07 S11 S15 S19 S23 S27 S31 S43 |
| **ambiguous** | plausibly any mode or none; the turn does not settle | **9** | S04 S08 S12 S16 S20 S24 S28 S36 S40 |
| **element-poor** | logistics, factual question, small talk, code, meta | **9** | S01 S06 S10 S14 S18 S22 S26 S34 S38 |
| **single** | one mode carries the turn; others ≤ 1 | **11** | S30 S32 S35 S39 S42 S44 S45 S47 S48 S49 S50 |
| | | **50** | |

Founder conditions met: ≥10 mixed (12) · ≥8 contradictory (9) · ≥8 ambiguous (9) · ≥8 element-poor (9).
Thirty-nine of fifty turns (78 %) are therefore *not* clean single-mode exemplars.

| Register | Count | Protocol §2 requires |
|---|---|---|
| Talk | 21 | ≥10 |
| Care | 16 | ≥10 |
| Note | 13 | ≥10 |

Protocol §2 also stratifies by the live substrate's keyword ratio (high / low) and caps turns per
member at 5. Neither applies to a synthetic corpus: there is no live substrate output for these
turns and no members. Recorded as not applicable, not as met.

Voices: fictional first-person throughout; settings and names drawn from West Africa, South Asia,
the Philippines, Central/Eastern Europe, Latin America, East Asia, the UK and unspecified places;
five turns in non-native English (S19 S29 S42 S50, and lighter register in S12); four very short
turns (S04 S16 S28 S36; S20 and S32 nearly so); one code turn (S10); one meta/consent question
(S22). No real people, no real member data, no disclosures of the kind that would belong in a
memory-free session.

Single-mode distribution: Fire ×3 (S30 S45 S48) · Water ×3 (S32 S42 S49) · Earth ×3 (S35 S47 S50)
· Air ×2 (S39 S44). Contradiction pairs cover Air–Fire ×2, Fire–Earth ×1, Water–Fire ×2, Air–Water ×1,
Air–Earth ×2, Fire–Water(absent) ×1 — no single pair dominates.

## 2 · Per-turn design record

Presence columns give the author's intended reading (`F W E A`, 0–3, ranges where the author
expects legitimate spread). `contra` is the intended flag. `winner` is the author's forced choice;
two entries mean the author expects raters to split, which is the point of M5. `tests` names what
the turn is there to stress in the instrument.

| id | reg | category | F | W | E | A | contra | winner | tests |
|---|---|---|---|---|---|---|---|---|---|
| S01 | Talk | element-poor | 0 | 0 | 0–1 | 0 | no | any | pure logistics; "hard to read on my phone" may tempt an Earth 1 |
| S02 | Talk | mixed | 3 | 0–1 | 3 | 0 | no | fire / earth | Earth and Fire both dominant, no tension; two 3s permitted |
| S03 | Care | contradictory | 2 | 0–1 | 1 | 3 | air+fire | air / fire | reasons complete, hand will not send; blocked will still counts as Fire |
| S04 | Talk | ambiguous | 0 | 0 | 0 | 0 | no | any | one word; do raters invent from the preceding reply? |
| S05 | Care | mixed | 2–3 | 3 | 2 | 0 | no | water | three modes co-present; throat tightness accompanies rather than opposes |
| S06 | Note | element-poor | 0 | 0 | 0–1 | 0 | no | any | shopping list; Earth leakage check ("plumber", "tap") |
| S07 | Talk | contradictory | 3 | 1 | 3 | 0 | fire+earth | fire / earth | canonical will-vs-body; the manual's own example shape (T04) — checks transfer from training |
| S08 | Note | ambiguous | 0 | 0–1 | 0 | 0–1 | no | any | a fragment; "I don't know" is not Air by itself |
| S09 | Note | mixed | 0–1 | 2 | 0 | 3 | no | air | argument kept + being moved; Note register carrying feeling |
| S10 | Talk | element-poor | 0 | 0 | 0 | 0 | no | any | code; must be all zeros at high confidence |
| S11 | Care | contradictory | 3 | 3 | 0 | 0 | water+fire | fire / water | two 3s in tension; minimal words; checks that "both" is read as tension not mixture |
| S12 | Talk | ambiguous | 0 | 0–1 | 0 | 0–1 | no | any | diffuse; tone may earn a 1, must not earn a 3 |
| S13 | Talk | mixed | 3 | 0–1 | 3 | 0 | no | fire | pain present but overridden without strain ("doesn't matter") — near neighbour of S07 with the flag expected to differ |
| S14 | Note | element-poor | 0 | 0 | 0 | 0 | no | any | meeting logistics; names and places are not Water/Earth |
| S15 | Note | contradictory | 0–1 | 2 | 0 | 3 | air+water | air | the person explicitly refuses to merge two readings — the model's own claim stated by a member; checks raters do not over-read that |
| S16 | Care | ambiguous | 0 | 0 | 0 | 0–1 | no | any | "let me sit with that" — is sitting-with Air, Earth, or nothing? expected spread |
| S17 | Care | mixed | 0–1 | 3 | 0 | 3 | no (defensible: air+water) | air / water | searching for words *for* a feeling; Air and Water both dominant and cooperating |
| S18 | Talk | element-poor | 0 | 0–1 | 0 | 0 | no | any | factual question; "my kid asked" faint relational trace at most |
| S19 | Talk | contradictory | 0 | 0–1 | 3 | 2 | air+earth | earth | the paper says healthy, the body says stone; non-native English |
| S20 | Talk | ambiguous | 0 | 0–1 | 1–2 | 0–1 | no | any | perceptual fragment; Earth vs Water vs Air genuinely open |
| S21 | Note | mixed | 3 | 1 | 2 | 1 | no | fire | act + chest opening + "before I talk myself out of it" (faint Air/Fire); Note register with will |
| S22 | Care | element-poor | 0–1 | 0 | 0 | 0 | no | any | a settings/consent question in Care register; "I want to check" is procedural, not Fire |
| S23 | Care | contradictory | 0 | 2 | 3 | 2–3 | air+earth (also water+earth) | earth / air | forgiveness stated and meant; body flinches; two flags plausible |
| S24 | Note | ambiguous | 0–1 | 0 | 0 | 0 | no | any | a follow-up instruction; almost element-poor — placed as ambiguous because "the same thing" is unreadable |
| S25 | Talk | mixed | 0 | 3 | 3 | 0–1 | no | water / earth | sensory memory fused with belonging; "I don't have a room like that now" — loss read through place |
| S26 | Talk | element-poor | 0–1 | 0–1 | 0 | 0 | no | any | small talk; a new cat may tempt Water 1 |
| S27 | Talk | contradictory | 2–3 | 0 | 0 | 2–3 | air+fire | fire / air | words say "don't care", acts say applied three times; contradiction carried entirely by juxtaposition |
| S28 | Care | ambiguous | 0 | 0–1 | 0 | 1 | no | any | three words asking for a norm; faint Air at most |
| S29 | Talk | mixed | 3 | 3 | 0 | 0 | no | fire / water | decision and longing pulling the same way; non-native English; checks Fire is not lowered by grammar |
| S30 | Talk | single (Fire) | 3 | 0 | 0 | 0 | no | fire | clean will; short |
| S31 | Note | contradictory | 2 | 1–2 | 0 | 0–1 | fire+water | fire | act completed, expected feeling absent; tests the negation rule ("feel nothing" is a Water reading) |
| S32 | Care | single (Water) | 0 | 3 | 0 | 0 | no | water | clean feeling; very short; must not become a 1 for brevity |
| S33 | Care | mixed | 3 | 0–1 | 0 | 3 | no | air / fire | the found word releases the will; two 3s cooperating |
| S34 | Note | element-poor | 0 | 0 | 0–1 | 0 | no | any | reminders; "blue folder" is an object but not attended-through |
| S35 | Note | single (Earth) | 0 | 0 | 3 | 0 | no | earth | body scan; pure sensation; checks no emotion is inferred from "jaw tight" |
| S36 | Talk | ambiguous | 0 | 0–1 | 0 | 0 | no | any | flatness; is sameness a feeling? expected low scores, low confidence |
| S37 | Note | mixed | 0 | 2–3 | 3 | 0 | no | earth / water | boxes and back + the neighbour and the hidden face; feeling shown, not named |
| S38 | Talk | element-poor | 0 | 0 | 0–1 | 0 | no | any | factual conversion; "oven" not Earth |
| S39 | Talk | single (Air) | 0–1 | 0 | 0 | 3 | no | air | distinction-making about wanting vs deciding; the *content* is Fire vocabulary, the *mode* is Air — key leak test |
| S40 | Care | ambiguous | 0–1 | 1 | 0 | 0 | no | any | arrives on someone else's prompting; reluctance readable as Fire-withheld or Water or nothing |
| S41 | Talk | mixed | 2 | 3 | 3 | 0 | no | water / earth | kitchen heat and turmeric hands + people loved + intent to feed; three modes, joyful; checks the scale is not sadness-biased |
| S42 | Talk | single (Water) | 0 | 3 | 0–1 | 0 | no | water | airport goodbye; non-native; "the flat is quiet" faint Earth or Water |
| S43 | Care | contradictory | 3 | 2 | 0 | 1 | water+fire | fire / water | displayed grief vs wish to smash plates; tests the anger rule (felt vs wish-to-act) |
| S44 | Care | single (Air) | 0 | 1–2 | 0 | 3 | no | air | naming a feeling; Air dominant with Water underneath; the manual's T05 shape |
| S45 | Note | single (Fire) | 3 | 0 | 0 | 0 | no | fire | work log; effort and "no excuses"; nothing bodily or felt |
| S46 | Care | mixed | 3 | 2 | 0 | 2 | no | fire | decided + reason given + tenderness; three modes aligned; "not angry" is a Water reading of absence |
| S47 | Talk | single (Earth) | 0 | 0–1 | 3 | 0 | no | earth | bench, stone temperature, mud, weir; "when things get loud" is in the reply, not the turn |
| S48 | Care | single (Fire) | 3 | 1 | 0 | 0 | no | fire | refusal to slow; "feels like mine" faint Water |
| S49 | Note | single (Water) | 0 | 3 | 0 | 1 | no | water | warmth and belonging; "that word again" faint Air — will some raters make it 2? |
| S50 | Care | single (Earth) | 0 | 1 | 3 | 0–1 | no | earth | sleep, noise, small room, hands missing dirt; "tired in a good way / bad way" is a distinction (faint Air) about the body |

## 3 · What the dry-run reads off this sheet (calibration questions, not H1)

1. **Manual applicability.** Do element-poor turns (S01 S06 S10 S14 S18 S22 S26 S34 S38) come back
   ≤ 1 on every mode from every rater? If not, section 4 of the manual is not landing.
2. **Leak test.** S39 (Fire vocabulary, Air mode) and S35 (body words, no feeling) — do raters code
   the *mode* or the *topic*? Topic-coding here means the manual's "not domains" rule has not
   transferred and the manual must be revised (→ v2, restart).
3. **Contradiction discrimination.** S07 (flag expected) vs S13 and S21 (no flag expected) share
   will + body. If raters flag all three or none, section 7 needs a sharper "accompanies vs opposes"
   rule.
4. **Ambiguous turns.** Expected: low scores, low confidence, winners split. If ambiguous turns
   come back with confident 2s and 3s, raters are inventing — a manual problem, not a rater problem.
5. **Two-3s tolerance.** S02 S11 S17 S29 S33 — do raters actually give two 3s, or do they share
   points? Point-sharing shows up as an inflated negative correlation in M2 and must be fixed in
   the manual, not in the data.
6. **M5 behaviour.** Where this sheet lists two winners, the dry-run expects rater disagreement on
   `single_winner` alongside agreement on presence. That is the pattern the protocol calls the
   signature of an unreliable collapse. On synthetic data it demonstrates only that the scorer
   can *see* the pattern — not that the pattern exists in members.

None of the above moves any claim. A synthetic run ends in a calibration note, never in a verdict
on H1.
