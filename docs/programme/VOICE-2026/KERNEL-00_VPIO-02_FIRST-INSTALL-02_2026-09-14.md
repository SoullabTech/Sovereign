# KERNEL-00 / VPIO-02 · FIRST-INSTALL-02 — 2026-09-14 — DONE · exact artifact installed once · no launch

**Act:** founder-authorized VPIO-02 FIRST-INSTALL-02 under plan §13.16, executed exactly once from instrument `08483cfe4f6c3e98198805337ced99bae92ce911`.
**Source organism:** `ac12dedf4b7b4efc9855c08bb4285a704e7039f1` · MAC-COMPILE-01 GREEN.
**Authority boundary:** custody-gated first install only. No driver run, launch, container read, journal pull, physiological sample, or N=30 act.

## Verdict

```text
local checks                  PASS
artifact custody              MATCH × all pinned fields
JIT installed-app read        ABSENT for life.soullab.voicekernel.vpio02
install transactions          exactly 1
post-install harness process  absent
script exit code              0
launch                        NOT RUN
sample                        NOT RUN
```

The request carrying the one script invocation timed out at the remote-command transport after dispatch. **No retry was issued.** The already-running shell was read until it reported the install, the post-install process result, the artefact path, and exit code 0. This is a transport observation, not a second invocation or device act.

## Local preflight required by §13.16

```text
HEAD                         08483cfe4f6c3e98198805337ced99bae92ce911
reinstall script            instrument-identical
manifest SHA-256            1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410
MAC-COMPILE product         present
```
## Invocation inputs

The §13.16 pinned values were supplied explicitly. The 1,861-byte founder authority string was loaded from `/private/tmp/vpio02-fi02-authority.txt`, which is the ruling text byte-for-byte; §13.16 explicitly permits the equivalent export-from-file form.

```text
K00_SUBJECT             vpio-02
K00_EXPECT_UUID         B346F448-A2A8-30DB-9683-B732A80D7899
K00_EXPECT_DYLIB_SHA    e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec
K00_EXPECT_MANIFEST     /private/tmp/vpio02b-driver-compile-08483cfe4/docs/programme/VOICE-2026/KERNEL-00_VPIO-02_MAC-COMPILE-01_2026-09-14.manifest.sha256
product                 /private/tmp/vpio02-mac-compile-01-ac12dedf4-derived/Build/Products/Debug-iphoneos/VoiceKernelHarness.app
authority bytes         1861
```

The script invocation itself was exactly one call to `scripts/witness/k00-reinstall.sh docs/programme/VOICE-2026/driver-ledger <product>`. The terminal transcript is preserved beside this record.

## Installed artifact result

```text
bundle id               life.soullab.voicekernel.vpio02
dylib UUID              B346F448-A2A8-30DB-9683-B732A80D7899
dylib SHA-256           e963a23cd17fd12e273671023b01c74ea5fbc4e8a7fb22168a0cee2562bd66ec
executable SHA-256      9fe56504131e0b023162c62a6bd60541053b14262c9d3075a15a08dbe6c7805a
manifest SHA-256        1459283c175e243c90459b2724c2be7362cf6dd4c95c191bd15c443ec8b98410
manifest files          7 · every file OK · exact file set
TeamIdentifier          ZVK2X646Z2
installation UUID       E3B88028-A10F-46B1-AB27-CF0A1F83FB78
database UUID           42158240-DA3F-491F-8B75-F106CD31316A
database sequence       6972
post-install process    (no VoiceKernelHarness process)
```
## Evidence custody

```text
terminal transcript SHA-256   d71c1bcae8c5aac328a71b54b0215caf04c5a88075563d3a9d5db8d00a023167
install artefact SHA-256      9963eb0bab12b571ff2e41bc1c6d2a91a47dc686402c8950fa1d5f62e4e7fc9e
script exit code              0
```

Files:
- `driver-ledger/VPIO-02-FIRST-INSTALL-02-20260914T221040Z/terminal-transcript.txt`
- `driver-ledger/VPIO-02-FIRST-INSTALL-02-20260914T221040Z/reinstall-20260914T221040Z.txt`

The install artefact is copied byte-for-byte from the instrument worktree. The tracked `.last-reinstall` mutation in that execution worktree is not part of this evidence commit.

## Standing

VPIO-02 exact MAC-COMPILE-01 artifact **INSTALLED**. This earns no physiology. Launch, first sample, and N=30 remain NOT AUTHORIZED; F-W1 for VPIO-02 remains UNSPENT. VPIO-01 remains CLOSED and `.vpio01` frozen; historical K00/R1 remains untouched; KERNEL-00 remains NOT ACCEPTED. No result from this act opens the next one.
