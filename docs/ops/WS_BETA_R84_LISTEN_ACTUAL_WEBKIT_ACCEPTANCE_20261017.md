# R84 — Listen in real Writer's Studio, authenticated WebKit + PostgreSQL

**2026-10-17 · isolated Mac Studio · fictional-only writer and manuscript · production/beta HOLD**

## Authority and source

R84 is an additive, isolated acceptance on clean R83 commit
`8b3022269cee20d8244edb407ccc2ca830a17521`. It changes **no**
application code or protected Writer's Studio component. The canonical
`/writers-studio?mode=listen&m=<owned-Work>` routes through the accepted
`P4R1StudioHost`, actual `ListenPilot`, and the existing owner-scoped
`/api/writers-studio/rebuild/context` service.

It inherits R83's independently completed, strict offline Next.js
production build, typechecked without suppressed errors, original
Inter/Newsreader fonts, 826/826 generated pages, 1,193/1,193 source
regressions and protected R81/R79 Apply/Undo and four-format import.

The sole R84 source additions are:

- `scripts/ops/wsBetaR84ListenActualWebKit.cjs`: a real WebKit 26
  Next.js Listen journey, with **fictional** manuscript and no hardware mic
  request.
- `scripts/ops/wsBetaR84ListenWithWriterPG16.py`: additive isolated
  PostgreSQL16/Next.js runner built from the accepted R81 physical fixture;
  it runs the original full protected Writer workflow FIRST, then R84 on
  the same authenticated fake Work before tearing down all resources.
- This acceptance record.

No production credential, real member content, saved audio, model API,
external provider, KMS secret, GitHub write, protected merge, deploy or
beta invitation is accessed or created. The only signing/encryption keys
used are fresh, synthetic fixture-only keys owned by the local Next
process. Those keys are intentionally NOT passed to the R84 Listen browser.

## Real WebKit Listen journey

The genuine app and PostgreSQL16 store were used. The original R81
journey first proved Import → Write → Review → source/History recovery →
encrypted fictional proposal → exact Apply → separate Undo → revocation,
while exercising real DOCX/PDF/TXT/MD source custody. The R81 browser
deliberately removes even fictional Work IDs from its receipt. R84
preserves that privacy practice and selects the sole correct fake Work
via member+title-scoped SQL metadata (no source prose).

R84's real WebKit browser then independently proves:

1. Anonymous owner-context GET is **401** and a different authenticated
   member cannot read the Work (**404**). The owner receives a real,
   section-addressable manuscript with original sections.
2. The canonical `mode=listen` route renders the genuine Listen component
   and Listen navigation, with original Work identity retained.
3. Chapter selectors come from verified saved draft-section IDs and
   selecting Chapter Two displays exactly its original author text,
   not Chapter One. No complete Preface is invented where none exists;
   complete-Preface logic is separately covered in **41 passing Listen
   Vitest cases across six files** on R83.
4. Recording controls are present and truthful: the application does not
   falsely advertise 24-bit PCM WAV.
5. No automated microphone access is attempted. The test installs an
   explicit fake MediaDevices permission guard before Listen renders,
   and checks **zero getUserMedia requests and zero fabricated takes**.
   It does not attempt to certify live mic levels, actual audio capture,
   channel routing on real hardware, audio quality, playback, or
   compressed file export.
6. The author types a made-up performance note, chooses Download notes,
   and receives an actual browser download containing the exact text.
7. Leaving with unsaved notes prompts a real WebKit confirm dialog.
   Dismissing the warning preserves Listen; explicitly confirming it
   permits navigation. Notes remain session-only, never silently
   promoted to manuscript edits.
8. A 390px WebKit mobile viewport shows no horizontal page overflow.
9. After all Listen interactions, a second authenticated PostgreSQL
   read proves the original manuscript text/section ordering remains
   identical; **zero unexpected content/provider writes or off-host
   requests** occurred; the browser raised zero page errors.

## Precommit physical acceptance

- **25/25 real WebKit Listen assertions** passed.
- **116/116 inherited genuine WebKit Writer's Studio assertions** passed.
- **78/78 real PostgreSQL and fixture infrastructure/security checks** passed
  (including the R84 Listen ownership/session safety checks).
- Fresh synthetic database, Next.js and browser disposed; no external
  model calls, real members, real microphone, files uploaded outside the
  fixture, deployments or production changes.

Evidence:
`/Volumes/T7 Shield/ws-beta-r84-listen-precommit-v7-20261017/`.

Earlier negative runs are preserved, including a refactor that found
R81's deliberate Work-ID redaction and a WebKit synthetic-mic
interception limitation. No code was changed to weaken privacy or
quietly allow real microphone capture for a test.

**This is precommit acceptance; exact-source requalification remains
mandatory before R84 is declared locally accepted.**

## Required physical device acceptance — not yet passed

The Mac Studio sees an attached iPhone, but a connected device is NOT
evidence of a successful Safari voice recording. Founder consent and a
physical, secure HTTPS or loopback-attested device test are required
before beta:

- Mac Safari with the intended audio interface: inspect actual 48 kHz
  hardware rate, selected Input 1 vs Input 2, safe mono routing, live
  levels, record, stop, playback, compressed M4A/WebM download and
  intended Notes download, and verify it remains session-only.
- Physical iPhone Safari: device microphone permission, genuine
  MediaRecorder support/fallback, no forced horizontal scrolling,
  Stop and notes recovery, safe exit, and no accidental upload.
- No invented 24-bit WAV, no direct Descript transfer, no persistent
  audio storage, and no remote inference are claimed for the pilot.

R83 strict build acceptance is inherited but does not mean R84 Listen
has been deployed to Soullab.life. Production Source/SQL/WAL/backup
encryption and cold restore, signed runtime rollback, genuinely
consented MAIA provider proposal custody and controlled member canary
remain independent beta launch gates.

**Disposition: actual WebKit Listen read/notes/ownership acceptance
CANDIDATE; real microphone/mobile Safari not yet accepted; beta HOLD.**
