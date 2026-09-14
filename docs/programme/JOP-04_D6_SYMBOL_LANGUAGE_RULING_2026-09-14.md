# JOP-04 · D6 — Symbol Language: RATIFIED

**Status:** ⭐ **RATIFIED — founder, 2026-09-14.**
**Lane:** JOP-04 · RB-6B Capability Contract · decision order **D4 → D1 → D5 → *D6* → D2 → D3**
**Handlers touched:** **0.** ⛔ **No handler repair is authorized by D6 alone.**

> **The caller names the symbol. The capability decides how to locate that symbol.
> The matching engine may implement that decision; it may not redefine it.**

```text
CAPABILITY            repo.locate_symbol
CALLER FIELD          symbol
ROLE                  SYMBOL
CALLER LANGUAGE       literal symbol text
SEMANTIC SOURCE       REGISTRY_DEFINED
REGEX AUTHORITY       NONE
MATCH POLICY          host/capability-authored whole-symbol lookup
AMBIENT CONFIG        NO AUTHORITY

CURRENT RUNTIME       grep-pattern fragment
STATUS OF RUNTIME     DEFECT — F-C
```

---

## The distinction D6 turns on

**Descriptive runtime behaviour is not authorized interface semantics.** F-C correctly reports that
the current handler lets caller text participate in the regex. That does not make *regex-program
authorship* the intended authority of a field named `symbol` on a capability named `locate_symbol`.

⭐ **The handler itself adds the boundary wrapper.** That is evidence *in the code* that matching
policy is **host-authored**, not caller-authored — the implementation already believes what D6 now
rules, and fails only in how it carries it out.

---

## D6.1 — The caller authors an identity, not a regex program

For `repo.locate_symbol { symbol: X }` the caller supplies the **literal** symbol text `X`.
Characters that happen to be meaningful to BRE, ERE, PCRE or any other engine carry **no
matching-program authority merely because they occur in `X`**.

```text
foo.bar        a*b        name[0]        foo\|bar        ^thing$
```

are caller-supplied **symbol text**. Their punctuation does not silently become regex syntax.

> *A symbol is the thing being sought. It is not the program used to seek it.*

## D6.2 — F-C remains true as evidence and is superseded as contract

```text
DESCRIPTIVE CURRENT STATE     SYMBOL → GREP_PATTERN_FRAGMENT     (`\b${args.symbol}\b`, unescaped)
AUTHORIZED CONTRACT           SYMBOL → LITERAL_SYMBOL
```

D6 does not erase F-C; it adjudicates it. The first remains **provenance for why repair is owed**.
The second **governs the future act**.

## D6.3 — Matching policy belongs to the capability

The handler adds `\b … \b` rather than requiring the caller to supply boundaries. That separation is
semantically correct even though its present implementation is unsafe.

```text
caller contributes     symbol: <literal supplied text>
capability contributes the policy by which occurrences of that symbol are located
```

⛔ **The caller must not need to understand or author the underlying regex dialect to ask for a
symbol.** D6 ratifies **whole-symbol lookup as capability semantics**; it does **not** ratify GNU `\b`
as the required mechanism. Escaping + regex boundaries, fixed-string search + boundary checking, or
another later-proven equivalent are all admissible. **D6 chooses the act, not the mechanism.**

## D6.4 — No ambient matching authority

D5 established that ambient git configuration may not author an act's meaning. The law reaches here by
a different route: because `repo.locate_symbol` is now semantically a **SYMBOL** capability rather than
a caller-authored **GREP_PATTERN** capability, the matcher is an **implementation concern**. Whatever
mechanism implements whole-symbol lookup, changing `grep.patternType` or equivalent ambient state **may
not change what the same invocation means.** Semantic source: `REGISTRY_DEFINED`.

## D6.5 — No invented identifier grammar

⛔ D6 does **not** silently restrict symbols to JavaScript identifiers, ASCII words,
`[A-Za-z_][A-Za-z0-9_]*`, or any other language-specific grammar. The public boundary accepts a
required string; D6 rules only that accepted caller text is **interpreted literally**. A narrower
grammar later requires its own explicit contract and evidence. ⛔ **A regex parser is not permitted to
become that validator accidentally.**

## D6.6 — Canonical authorship remains separated

The canonical caller term is the caller's **literal symbol text**. Any escaped form, derived search
expression, boundary markers or matcher flags are **host-derived**.

```text
FALSE ATTRIBUTION     caller supplied:  pattern: '\bfoo\.bar\b'
ACTUAL                caller supplied:  symbol:  'foo.bar'
```

The derived matcher belongs in the execution plan or equivalent host-authored representation. It must
not replace the caller's term in invocation provenance. *(Same discipline as D4 and D5.4.)*

## D6.7 — Role taxonomy consequence

```text
GREP_PATTERN   repo.grep.pattern
SYMBOL         repo.locate_symbol.symbol
JS_REGEX       verify.count_matches.pattern
```

`repo.locate_symbol.symbol` is **no longer correctly described as a `GREP_PATTERN` input** merely
because its present handler calls `git grep`. ⛔ **Execution engine does not determine argument role.**
The host may derive a search expression internally; that derived expression is not the caller's
argument language.

## D6.8 — F-D remains open

```text
repo.grep           no match → ZERO-RESULT
repo.locate_symbol  no match → ERROR
```

Whether `repo.locate_symbol` should return an empty successful result, a typed absence, or another
outcome is **F-D, not D6**. No-match semantics remain open.

---

## D6 falsifiers

```text
D6-F1  metacharacter authority     a caller-supplied metacharacter changes the match PROGRAM rather
                                   than being sought literally
D6-F2  regex-parser validation     a caller string is rejected or throws merely because it is invalid
                                   syntax in the implementation's regex dialect
D6-F3  boundary escape             caller text can cancel, widen, replace or otherwise manipulate the
                                   host's whole-symbol matching policy
D6-F4  false caller attribution    an escaped/derived expression is recorded as though the caller
                                   supplied it
D6-F5  ambient interpretation      the same symbol request changes meaning because grep.patternType,
                                   environment or another undeclared matcher setting changes
D6-F6  engine-derived role         the field is classified GREP_PATTERN solely because the
                                   implementation happens to invoke git grep
D6-F7  accidental lexical restriction  implementation silently reduces the accepted symbol domain to a
                                   language-specific identifier grammar not separately authorized
```

⚠️ **D6-F1, D6-F2 and D6-F3 are LIVE in the current runtime — now WITNESSED, not merely inferred from
F-C's source reading.** `scripts/jop04/d6-symbol-language-evidence.sh` · read-only · **4 passed · 0
failed**, reproducing the handler's derived shape with `git grep` alone:

```text
CONTROL   symbol='declareRoutingEligibility'                 files=14      the probe is the handler shape

D6-F1     symbol='declare.*Eligibility'                      files=14
          literal occurrences of that string in the tree:    0
          ⭐ A string that exists NOWHERE as text returns 14 files. The caller's '.*' was EXECUTED,
             not sought. That is metacharacter authority, live.

D6-F3     symbol='Eligibility\).*('                          rc=128
          git: fatal: command line, '\bEligibility\).*(\b': Unmatched ( or \(
          ⭐ Caller text invalidated the COMPOSED pattern — including the host's own \b wrappers.
             The boundary policy the capability authored is manipulable from the caller's field.
D6-F2     …and the refusal comes from a REGEX PARSER acting as validator — the accidental validator
             D6.5 forbids, refusing a string for its syntax in a dialect the caller never chose.
```

⛔ These are **the defect D6 names, not predictions**. The repair they argue for is **owed and
unauthorized**; D6 authorizes no handler change. ⛔ **Handlers touched: 0.**

---

## Record-only corrections travelling with D6

Applied to `JOP-04_RB-6B_CAPABILITY_CONTRACT_2026-09-14.md` in the same pass, superseded **in place**,
never deleted — each was true when written:

```text
opening taxonomy   GREP_PATTERN listed repo.locate_symbol.symbol alongside repo.grep.pattern,
                   grouped BY EXECUTION ENGINE → corrected per D6.7
"SYMBOL is         → ⭐ SYMBOL is not misnamed. The RUNTIME is. Hold on escaping lifted as a
 currently          QUESTION, not as an authorization.
 misnamed"
locate_symbol row  "OPEN — D6" ×2 → ratified language, canonical representation, and the
                   ⛔ no-invented-grammar constraint
footer "SYMBOL     → marked SUPERSEDED: descriptive of the runtime, never of the contract
 = GREP_PATTERN_
 FRAGMENT"
footer "REMAINING  → D2 → D3.  ⚠️ Two rulings owed, not five.
 ORDER D5→D6→D2→D3"
footer "effective  → ⭐ OBSERVED 2026-09-14 (UNSET at all four scopes → BRE here). Corrected, not
 grep.patternType    deleted; one machine, one day — and D5 has now removed its authority.
 ⛔ UNOBSERVED"
```

---

## Standing after D6

```text
D4   ⭐ RATIFIED     omission belongs to the caller; default resolution belongs to the host
D1   ⭐ RATIFIED     a path is an identity; a pathspec is a selection program
D5   ⭐ RATIFIED     repo.grep.pattern = POSIX BRE, pinned · per-capability languages permitted
D6   ⭐ RATIFIED     literal SYMBOL; caller has no regex authority

D2   git.log.format                ← NEXT
D3   repo.grep.max_results         OWED

F-C  DISPOSED BY D6 as a contract question · retained as evidence of the current defect
F-D  OPEN · NOT DISPOSED

LANE OPEN · IMPLEMENTATION ⛔ BLOCKED · HANDLERS TOUCHED 0
```

### ⚠️ D2 is a different KIND of question

D6 was decidable from the substrate: the handler's own boundary wrapper was evidence of intent.
**D2 has no such evidence.** `git.log.format` is **declared but never consumed** — the code gives
essentially no behavioural signal about what the field was intended to mean. ⛔ **D2 must be
adjudicated from provenance and usage evidence, not inferred from the dormant schema alone.**
Inferring intent from a field that has never run would be exactly the move D6 refused in the opposite
direction: letting the implementation author the contract.
