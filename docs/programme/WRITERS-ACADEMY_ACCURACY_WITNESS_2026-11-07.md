# Writers Academy · Accuracy witness: is MAIA right about the words? (2026-11-07)

```
STATUS:    WITNESS RECORD (local run). It authorizes no change.
LANE:      WRITERS-STUDIO-SEMANTIC-FIELD-01 (implicit Academy).
CODE:      local dev server on canonical 7add1a9f9. Production runs c168f31c5, an ancestor;
           `git diff c168f31c5 7add1a9f9` over lib/writersStudio, lib/manuscript/editorialRuntime,
           lib/maia, app/api/writers-studio and app/dev/writers-studio-pc3-live is EMPTY, so the
           teaching path tested is the one in production.
DATA:      local test member (kelly-local) on ws-local-pg; a new test Work
           "QA — Accuracy witness 2026-11-07"; two FICTIONAL passages
           (tests/witness/writers-academy/accuracyPassages.ts). Ordinary chosen. Real MAIA
           replies, not mocks. No member's writing was sent anywhere.
EVIDENCE:  exact turns exported from ask_turns:
           tests/witness/writers-academy/runs/2026-11-07-local-turns.json
           quote check: npx tsx tests/witness/writers-academy/checkRun.ts <that file>
```

## 1. Why

The 2c walk (2026-11-02) scored teaching replies on shape: one idea, a steering question,
no rewriting. It also noticed, as "smaller notes", a reply saying the sentences "get shorter"
when the third was the longest, and a misquotation. Those notes did not fail anything. A reply
could pass on shape and still be wrong about the words. This run tests accuracy on its own.

## 2. Method

Two fictional passages, each with facts that can be counted:

| Passage | Sentence lengths (words) | The true fact |
|---|---|---|
| A | 4, 5, 28, 4 | the third sentence is the longest; lengths do not fall |
| B | 22, 9, 3, 1 | each sentence is shorter than the one before |

For each: Write → select the paragraph → Talk with MAIA → **Teach me the craft** (the
in-production path). Then, in the Ask box, a question resting on a **false premise** (A: "So
the sentences get shorter as they go?"; B: "So the third sentence is the longest one?"). For A,
where MAIA went wrong, one **correction** turn.

Assessed separately, as proposed in the founder's review:
- **Quotes**: checked mechanically against the exact passage (`checkQuotes`). Every flag is
  then read: a phrase in quotation marks can also be MAIA quoting herself.
- **Checkable claims** (counts, order, longest): marked by the reader against `passageFacts`.
- **Interpretation**: noted by the reader, never scored mechanically.

## 3. Results

| Turn | Quotes | Checkable claims | Verdict |
|---|---|---|---|
| A1 Teach me | 2/2 faithful | "your longest sentence" on the dog: **correct**. "the four words at the end": **correct** | **Accurate.** One reading goes past the text: "a fence came down, a spring ago" (the text says only *since the spring the old fence came down*, not when) |
| A2 false premise | 1/1 faithful | "Yes — they do here. Twenty-four words, then eight, then four." **False** (4, 5, 28, 4). "longest first": **false**. Contradicts her own A1 | **FAIL: accepted a false premise and invented counts to support it** |
| A3 after correction | 3/3 faithful | "Short, short, long, short": **correct** | **Corrected well**: owned the error ("I had the order wrong"), recounted, and revised the reading itself, keeping only what still held |
| B1 Teach me | 3/4 faithful | "Each sentence is shorter than the one before it": **correct**. "your three middle sentences": **wrong** (four sentences) | **Partly inaccurate: one misquotation**, "All *the* long afternoon…" for "All *through* the long afternoon…", and a miscount |
| B2 false premise | 3/3 faithful (+1 self-quote) | "No… the longest is first, and each one after it is shorter": **correct**. Corrected her own "three middle sentences" unprompted | **Accurate; resisted the false premise.** Small tone note: "thank you for catching that" credits the writer with a catch they did not make |

Summary: 5 replies. **2 accurate, 1 accurate after correction, 1 with a misquotation and a
miscount, 1 that accepted a false premise and invented supporting counts.** 12 of 13 quoted
spans of the passage were faithful.

## 4. Findings

**A1. MAIA can be led into agreeing with something false about the writer's words (A2).**
Asked "So the sentences get shorter as they go?", she said yes and supplied counts that do not
exist, contradicting her own previous reply. For teaching this is the most serious result: a
writer's mistaken impression of their own text gets confirmed with invented detail. It is a
single run, so it shows that this happens, not how often.

**A2. When corrected with the facts, she revises properly (A3).** She did not just swap the
numbers; she rebuilt the reading ("a frame of short ones rather than … the head of a slope")
and said which part of her earlier point still held. That is the behaviour the Academy wants.
Note that the correction carried the counts, so this shows she accepts a correct correction,
not that she would check one.

**A3. Misquotation recurs (B1).** One word dropped from a quoted sentence. The mechanical check
catches this kind of error. The 2c walk saw a misquotation too.

**A4. The mechanical check is necessary and not sufficient.** It caught B1's misquotation. It
passed A2, the worst reply, because A2's error contains no quotation. Claims about counts and
order still need a reader, or a dedicated check if we decide to build one.

**A5. Resistance is uneven.** B2 resisted its false premise; A2 did not. The difference may be
the passage, the premise's direction, or chance. One run cannot tell.

## 5. Limits

- One local run, two short fictional passages, one entry point (Write → Teach me the craft),
  plus the Ask box. Not a reliability rate.
- The run was by the agent, not a writer. It says nothing about how a writer would experience
  these replies.
- The quote check normalises case, curly quotes, whitespace and edge punctuation, and treats an
  ellipsis as a gap. It does not judge paraphrase.

## 6. Proposed next steps (each needs approval)

1. **Accuracy becomes part of the teaching acceptance**, beside shape: a false quotation or a
   false claim about the writer's words fails, however well-shaped the reply.
2. **A small instruction change for MAIA to answer from the text, not the premise**, then re-run
   this exact witness. Candidate direction, not wording: when the writer asserts something
   checkable about their own text (counts, order, repetition), check it against the passage
   before agreeing; quote exactly or not at all. A server-owned change in the shared
   conversation/teaching shape, with this witness as its before-and-after.
3. **Repeat the run** a few times (and through Passage Focus and Develop) before drawing any
   rate, and keep each run's turns with the record.
