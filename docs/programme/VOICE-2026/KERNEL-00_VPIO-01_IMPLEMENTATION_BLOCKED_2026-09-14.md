# KERNEL-00 / VPIO-01 — BOUNDED IMPLEMENTATION OPENED AND STOPPED · TWO BLOCKERS

**Status:** IMPLEMENTATION AUTHORIZED (founder act, 2026-09-14) · **OPENED · NO SOURCE WRITTEN · RETURNED**
**Lane:** `VOICE-2026` · `KERNEL-00` · branch `claude/voice-2026-census-01`, base `ebd9eef5d`
**Record class:** RECORD ONLY. No `.swift` file, no `Package.swift`, no `project.yml`, no gate file changed by this commit.

The authorization was accepted and the work was opened against the pinned plan
(`KERNEL-00_VPIO-01_PLAN_2026-09-14.md` §2 / §6 / §7) and the founder's source envelope.
It stops before the first line of substrate source on two blockers. Neither is a design
refusal; neither is repairable inside the envelope; both are discharged off this machine.

The governing sentence is the founder's own:

> *If the implementation needs to touch anything outside the admitted envelope, that is a
> refusal, not a convenient expansion.*

and F-V7's fallback, applied literally:

> *If the necessary primitive is absent or undocumented, stop and return it as a finding.
> Do not approximate the design with a nearby API.*

---

## 0. Baseline read before anything (evidence, not claim)

```
npx jest __tests__/voice-kernel-00-source-gates.test.ts
  →  35 passed · 0 failed · 1 suite
  →  DRIVER-01 byte-pin GREEN at both hashes
```

So at `ebd9eef5d` the working tree **is** the frozen `AVAudioEngine` subject `24a6fcfa1`, byte for byte.
That fact is the whole of BLOCKER 2.

`swift test`: **NOT RUN — no toolchain in this environment.** `swift`, `swiftc`, `/usr/share/swift`
and `~/.swiftly` are all absent on this Linux container. This is reported as a first-class
NOT RUN, never as a pass and never as a skip. `swift test` is discharged at MAC-COMPILE or on
a machine with a toolchain; it was never runnable here.

---

## BLOCKER 1 — F-V7 cannot be discharged from this machine, and the design needs ~11 symbols beyond the confirmed set

The founder's independent F-V7 preflight against the installed **iPhoneOS 26.2 SDK** confirmed the
public API surface the plan names, and confirmed the four semantics the design leans on (input at
input scope / element 1; output at output scope / element 0; the input callback is global and
requires `AudioUnitRender()` to obtain mic frames; `IsRunning` global/read-only; stream format
readable/writable on input and output scopes; VPIO bypass/AGC global read/write).

**That preflight covers the plan's vocabulary. It does not cover the vocabulary an implementation
of that plan must additionally name.** The gap below is not a request for new design — every item
is a type, field or constant *consequential* on a symbol the founder already confirmed (you cannot
call `AudioComponentFindNext` without the struct it takes, or `AudioUnitRender` without the buffer
list it fills).

⛔ **This container has no iPhoneOS SDK and no Xcode.** F-V7's instruction — *read that installed
header before using it* — is physically unreachable from here. Writing these names from memory is
exactly the guess F-V7 exists to forbid, and is the same failure class as the `devicectl` and
`log(1)` incidents this lane already paid for.

### The gap list — one header read on the Mac Studio discharges all of it

| # | needed symbol / type / constant | why the design needs it | seam |
|---|---|---|---|
| G1 | `AudioComponentDescription` + fields `componentType` · `componentSubType` · `componentManufacturer` · `componentFlags` · `componentFlagsMask` | the argument of the confirmed `AudioComponentFindNext` | unit discovery |
| G2 | `kAudioUnitManufacturer_Apple` | the manufacturer field of G1 | unit discovery |
| G3 | `AudioComponentInstance` / `AudioUnit` (typealias relationship) | the return of `AudioComponentInstanceNew`, the receiver of every confirmed call | unit handle |
| G4 | `kAudioUnitScope_Input` · `kAudioUnitScope_Output` · `kAudioUnitScope_Global` | the scope arguments for every confirmed property call — the **semantics** are confirmed in the preflight, the **symbol names** are not | every property |
| G5 | `AudioStreamBasicDescription` + `mSampleRate` · `mFormatID` · `mFormatFlags` · `mBytesPerPacket` · `mFramesPerPacket` · `mBytesPerFrame` · `mChannelsPerFrame` · `mBitsPerChannel` · `mReserved` | the value type of the confirmed `kAudioUnitProperty_StreamFormat` | client format, hardware-format read (§3.1 precondition) |
| G6 | `kAudioFormatLinearPCM` · the float/packed/non-interleaved flag constants (exact spelling, incl. whether a `…NativeFloatPacked` composite exists) | building G5 for the app's client format | client format |
| G7 | `AURenderCallbackStruct` + `inputProc` · `inputProcRefCon` | the value of the confirmed `kAudioUnitProperty_SetRenderCallback` **and** `kAudioOutputUnitProperty_SetInputCallback` | both callbacks |
| G8 | the render-callback signature types: `AudioUnitRenderActionFlags` · `AudioTimeStamp` · `AudioBufferList` · `AudioBuffer` (`mNumberChannels` · `mDataByteSize` · `mData`) · `UnsafeMutableAudioBufferListPointer` | writing the output callback and receiving the pulled input from the confirmed `AudioUnitRender` | both callbacks |
| G9 | `kAudioUnitProperty_MaximumFramesPerSlice` | correct sizing of the app-owned buffer the input callback renders into. ⛔ Guessing a generous constant instead is an approximation, not an implementation | input pull |
| G10 | `AudioUnitUninitialize` | teardown symmetry in `stop()`; `AudioUnitInitialize` is confirmed, its inverse is not | generation teardown |
| G11 | `AudioUnitPropertyListenerProc` signature (`AudioUnit` · `AudioUnitPropertyID` · `AudioUnitScope` · `AudioUnitElement` · refcon order) | the body of the confirmed `AudioUnitAddPropertyListener` / `AudioUnitRemovePropertyListenerWithUserData`, which carries the retained `onConfigurationChange` seam (K00-11) | configuration-change seam |

`OSStatus` / `noErr` are MacTypes, not Audio Toolbox; named for completeness, not flagged.

### One semantics question the header will probably NOT answer

`kAUVoiceIOProperty_BypassVoiceProcessing` is confirmed global read/write, but plan §2 requires VP
on/off to be settled **before `AudioUnitInitialize`**. Whether bypass is honoured pre-initialize,
post-initialize, or both is runtime behaviour, not header text. ⛔ It must not be resolved by
assumption; it is either documented, or it becomes an observation the first VPIO witness makes.
**Recorded as owed, not answered.**

---

## BLOCKER 2 — every authorized delta invalidates the DRIVER-01 byte-pin, and re-scoping it is a custody act on frozen evidence

`__tests__/voice-kernel-00-source-gates.test.ts:440` asserts:

```
treeHash([ ios/VoiceKernel/Sources, ios/VoiceKernel/Tests, ios/VoiceKernel/Package.swift ])
  === 3f746769236d7ee68b38bafa7dfa278032063c833c24d88b9d1ad343fe1c16a2
treeHash([ ios/VoiceKernelHarness/Harness, ios/VoiceKernelHarness/project.yml ])
  === 3e718a09a23e6f5598e62162222310b3ee088ec6471f0e9656b9c16a9f00185c
```

under the name *"the kernel and harness trees are byte-pinned at the P5-B0 subject `24a6fcfa1`
(the app under test is never rebuilt for the driver)"*.

⭐ **The envelope and this pin are mutually exclusive by construction.** Every single admitted delta
lands inside a pinned path:

| admitted delta (founder envelope) | pinned path it lands in |
|---|---|
| `AudioGraph.swift` interior replaced | `VoiceKernel/Sources` |
| `VoiceKernel.swift` two buffer seams · trace vocabulary · six `engineRunning`→`ioRunning` · `vpExpectationPending` false | `VoiceKernel/Sources` |
| `Package.swift` Audio Toolbox link | `VoiceKernel/Package.swift` |
| distinct bundle id `life.soullab.voicekernel.vpio01` | `VoiceKernelHarness/project.yml` **line 50** |

The harness's *behavioural* source stays invariant exactly as ruled — but `project.yml` is inside the
harness pin, so even the ruled-YES bundle identity breaks it.

⛔ **I am not choosing the repair.** The pin is the custody instrument of the **frozen historical
subject**, and quietly re-scoping frozen evidence to let new work through is the precise move this
lane's discipline exists to refuse. The two dispositions I can see, named without preference:

- **(a) Subject-declared pin.** Assert the ENGINE subject's two tree hashes against the immutable
  commit `24a6fcfa1` read from git, and add a second pin for the VPIO subject's working tree. This
  makes historical custody *stronger* (the frozen bytes stop depending on a working tree that can
  drift) and gives the new subject its own pin. It is still an amendment to a frozen-evidence
  instrument and needs the founder's act.
- **(b) VPIO-01 does not live in these paths at all.** Then the substitution is no longer "one file's
  interior", and §2's whole substitution boundary is a different claim — which reads as a redesign,
  and §6/F-V3 would have something to say about it.

⚠️ **A downstream consequence of (a) or (b), named now so it is not discovered at the witness:**
`K00DriverTests.swift` hard-asserts `"life.soullab.voicekernel.k00"`, and the gate asserts that
assertion. Plan §7 requires the driver's `--subject vpio-01` to map to the new bundle id through a
subject table — **but the driver is not in the authorized source envelope**, so that subject table
currently has no authorized home. The envelope as written yields a VPIO harness the existing driver
cannot reach. This bites at install/witness, not at source-level qualification, and is **recorded,
not solved**.

---

## What was verified while opening the work (read-only, useful either way)

1. **The §0 census boundary still holds at `ebd9eef5d`.** `AudioGraph.swift` is 338 lines and the only
   file touching the engine; `VoiceKernel.swift` reaches it through the sixteen seams the plan lists.
2. **The diff-budget line numbers are accurate.** All six `engineRunning` evidence-key occurrences are
   present in `VoiceKernel.swift` at **326 · 427 · 499 · 516 · 602 · 625**, and the seventh is
   `AudioGraph.swift:200` (`trace(.isRunningImmediate, ["engineRunning": …])`), which disappears with
   that file's interior exactly as §2 says. `vpExpectationPending = snap.voiceProcessingEnabled` is at
   **`VoiceKernel.swift:322`**, one site, as the VP-expectation ruling assumes.
3. ⚠️ **`ConfigurationChangeClassifier.swift` DOES NOT EXIST.** The envelope requires it BYTE-IDENTICAL
   alongside `ConfigurationChange.swift`; the classifier in fact lives *inside* `ConfigurationChange.swift`
   (51 lines, the only such file). The obligation is satisfiable and unambiguous — one file, byte-identical —
   but the envelope names a file that has never existed on this branch. Recorded so it is not later read
   as a deleted file.
4. **`Package.swift` has exactly ONE target** (`VoiceKernel`) plus its test target. The envelope's
   *"Audio Toolbox link for the substrate target only"* therefore collapses to "the only target".
   ⛔ Creating a separate substrate target to make the word *only* literally true would be a new
   architectural object and is NOT taken as licensed. Read as: link Audio Toolbox on the existing
   `VoiceKernel` target, platform-conditioned. Flagged rather than assumed.

---

## Standing after this record

```
VPIO PLAN / CENSUS              ✅ ACCEPTED
record reconciliation           ✅ ebd9eef5d
F-V7 named API preflight        ✅ PASS (founder, iPhoneOS 26.2) — plan vocabulary
F-V7 implementation vocabulary  ⛔ 11 items UNCONFIRMED · unreachable from this machine
VPIO bounded implementation     🟡 AUTHORIZED · OPENED · STOPPED · NO SOURCE WRITTEN
DRIVER-01 byte-pin custody      ⛔ BLOCKING · founder act required (a) or (b)
driver subject table            ⛔ required by plan §7 · no authorized home in the envelope
swift test                      ⛔ NOT RUN — no toolchain here (never a pass, never a skip)
source gate                     ✅ 35/35 at ebd9eef5d (unchanged by this commit)

MAC-COMPILE                     ⛔ STILL HELD
install · device act · N=30     ⛔ HELD
KERNEL-01 · BENCH-01            ⛔ CLOSED
AVAudioEngine subject           ⛔ FROZEN HISTORICAL EVIDENCE — untouched by this commit
```

**Two founder acts unblock the whole of it**, and both are small:

1. One header read on the Mac Studio against the G1–G11 table above (plus, if documented, the
   bypass-before-initialize question).
2. A custody ruling on the DRIVER-01 byte-pin — (a), (b), or a third the founder sees.

Neither requires the phone. Neither spends a witness.

> *Replace the physical substrate; do not let the substitution rewrite the organism that governs it.*
> A substrate written from remembered symbol names, compiled by nothing, would be neither a
> replacement nor a qualification — only a file that looks like one.

---

## ADJUDICATION APPENDED (founder, 2026-09-14) — record above unchanged

*Appended by the VOICE-2026 session after the founder's header read against the installed iPhoneOS 26.2 SDK; nothing above this line was edited.*

```
BLOCKER 2  byte-pin
            CLOSED by the already-ruled gate-by-history implementation
            (VPIO-01 plan §11 item 5 → 0f535e705 gate; assertions read 24a6fcfa1 / 4596b9bdb from the object database)

BLOCKER 1  G1–G11
            G1–G8, G10, G11   VERIFIED against the installed header — the source as written was correct
            G9                VERIFIED (Global · UInt32 · read/write) — and it exposed ONE REAL SOURCE DEFECT:
                              the fixed 8192-sample scratch + min(requested, capacity) truncation in 0f535e705
            bypass-before-initialize: no header blocker (documented lifecycle: uninitialize → configure → initialize);
                              runtime effect stays witness evidence

source      CORRECTABLE · not withdrawn
            → corrected at 5ca7851a8 (AudioGraph.swift G9 only + gate pin; 45/45)
            → MAC-COMPILE AUTHORIZED on exactly 5ca7851a8; a991d09a4 / 0f535e705 are NOT compile subjects
            → install · device act · N=30 remain NOT AUTHORIZED
```

Full record: `KERNEL-00_VPIO-01_PLAN_2026-09-14.md` §12.5 (side-by-side) and §12.6 (adjudication + correction).
