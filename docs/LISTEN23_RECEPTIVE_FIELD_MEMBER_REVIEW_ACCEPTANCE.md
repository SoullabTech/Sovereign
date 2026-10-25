# LISTEN-23 — The Receptive Field: members can listen, tailor and keep their go-to sound worlds

**2026-10-24 · Existing LISTEN-01 #1979 · SOURCE-REVIEW / SYNTHETIC ACCEPTANCE ONLY · Production/member release HOLD**

## Founder intent, retained without overbuilding

The founder wants Soullab's Audio & Listening Field to be **creative and receptive**. Members **do not need to compose music**. They may simply receive an existing soundscape, gently tailor its rhythm, resonance and texture, then keep personally chosen sound experiences that inspire, center, accompany remembrance or grief, help them explore balance, or invite catharsis and emotional release. **Hard, intense, dissonant or cathartic sounds are not excluded merely because they can stir strong reactions.** The member should control when and how to approach them, hear a small optional preview, and have obvious Pause/Stop/silence. No emotional label is mandatory, and no audio setting is certified to heal or transform a person.

This **extends the existing** Listening Room and Sound Sanctuary vision: one sound session and one player, no new application, no separate AI persona and no aesthetic redesign. *Artist original* and *member-tailored recipe* are different states. The actual released A+B full-length master remains entirely unchanged and **not** part of this synthetic mixing test.

## Actual review experience built

**Inside the existing `/listen` review route** there is an optional *Receptive Field / The sounds you return to* section:

1. **Receive:** Select one of four musical invitations—*A place to center*, *A moving current*, *A wider horizon*, and *Room for catharsis*. No compulsory questionnaires and **no autoplay**. These are **original synthetic review sound sketches**, not claims about the 20-minute founder master, commercial recordings, or cultural materials.
2. **Tailor only if desired:** Three independent, audible controls—**Organic Current (warm moving pulse), Open Water (space and resonance), Texture & stillness**—operate on the **existing**, low-gain WebAudio oscillator sketch through smooth audio-parameter changes. At 50/50/50 the earlier original oscillator/filter balance is restored. There is no additional player or copy of the music.
3. **Name and remember:** The member may choose up to four *self-selected* intention words (including **Grief & tenderness** and **Catharsis & release**) and keep up to 24 named recipes. A recipe contains only a title, permitted source ID `soullab-original-sketch-v1`, the listening journey, three bounded values and intention labels—**no audio bytes, member ID, private journal, inferred diagnosis, commercial provider URL or biometric data**.
4. **Go-to shelf:** A saved recipe can be recalled with one action, but **does not automatically play** or grant audio focus. During the fictional authenticated-shell test, the in-memory shelf survives client navigation from Listening Room into House and back.
5. **Member-led private portability:** The user can manually export **a passphrase-protected, AES-256-GCM / PBKDF2-SHA256 (600k iteration)** portable JSON file, or restore it after decryption and strict format/content revalidation. Every export uses a fresh 16-byte salt and 12-byte nonce plus an independent, domain-bound authenticated-data label; file limit 128 KiB, with at most 24 recipes. No automatic localStorage, cloud sync or recovery promise. Passwords are not retained after a successful operation. A review-only browser backup is **not** an accepted account vault, privacy/security certification or full deletion/restore authority.
6. **Existing music remains separate:** The UI refuses to represent a member-selected FLAC/MP3 file, Apple/Spotify/TIDAL reference, the LISTEN-18 master or the LISTEN-19 rehearsal dry guides as remixable stems. During local-file playback the synthetic-shaping controls are disabled. The separate playlist/track-reference shelf is unchanged.

**Accessibility/agency:** The soundboard uses labeled keyboard-operable sliders, selected-intention states, explicit Play/Pause/Stop, a readable status, deliberate private export/restore and the pre-existing source/privacy disclosures. “Catharsis” is a member preference/invitation, **not a medical diagnosis or therapeutic promise**.

## Exact source custody — additions in existing Listening review only

Review branch: [`review/listen-03-native-20261024`](https://github.com/SoullabTech/Sovereign/tree/review/listen-03-native-20261024). Compared to protected `clean-main-no-secrets`, **no existing protected baseline files were modified**.

Source additions:
- `lib/listening/receptiveField.ts`: bounded, inert user-authored recipe schema, four ready-made invitations, voluntary self-description and strict import/export.
- `lib/listening/receptiveFieldBackup.ts`: fresh-passphrase encrypted recipe export/restore; independent format from existing playlist/journal backup; **review only**.
- `app/listen/ReceptiveFieldDesk.tsx`: Receiving/Tailoring/Go-to session UI inside the original room, no additional player, no media upload.
- `tests/listening/listen23_receptive_field.test.mjs`: source/cryptographic validation.
- `tests/listening/listen23_receptive_browser_witness.cjs`: real Chrome/WebKit source-derived interaction witness.
- Bounded updates to existing review `app/listen/ListenRoom.tsx` and `components/listening/PersistentListeningProvider.tsx` to render the section, smoothly adjust the **existing synthetic WebAudio** oscillator voices and hold the recipe shelf while an authenticated review-shell provider is mounted. The synthetic amplitude modulation does not apply to local files or released masters.

**No change** to the protected current production app's root, real MAIA speech/microphone, Writer’s Studio, original sound masters, recorder, playlist/OAuth integration, rights signer, shared authentication or native/mobile release settings. No artist/cultural participation claimed.

## Physical isolated-source QA

Mac Studio testing used a disposable Next.js **16.3.8** application with existing synthetic PostgreSQL **14.19** member fixtures, corrected **test-only** same-member auth and strict route rule, and actual Chrome and WebKit browsers. It did **not** use any real member account, third-party music/provider, private listening reflection, live member data, original A+B sound recording or authorized production service.

| Witness | Result |
|---|---|
| Inert recipe and AES-GCM backup unit tests: bounds, consent labels, cryptographic roundtrips, fresh IV/salt, tampering, wrong password, unsupported sources and coercive-intention refusal | **17/17 PASS** |
| **Chrome** Listening Room: no autoplay, optional catharsis, 3 live synth controls/gain changes, current-tab save, room navigation and recall, deliberate pause, encrypted export, simulated session-end erasure, restore and mobile-responsive viewport | **30/30 PASS** |
| **WebKit** same real UI journey, including local encryption and file restore | **30/30 PASS** |
| Combined existing policy/crypto + new recipe suite | **52/52 PASS** |
| Prior cross-room continuity after source change | **22/22 Chrome and 22/22 WebKit PASS** |
| Prior LISTEN-14 cross-tab exclusive-output after source change | **12/12 Chrome and 12/12 WebKit PASS** |
| Existing standalone Listening Room, no persistent provider | **24/24 Chrome PASS** |
| Existing mocked private-route / MAIA speaking lease / source structural checks | **4/4, 5/5, 25/25 PASS** |
| Disposable project full TypeScript `tsc --noEmit` | **0 errors** |

A browser witness inspected actual WebAudio gain nodes: selecting the expressive preset changed the existing synth bass, middle, air and pulse-modulation parameters (not just slider labels). Tests verified **zero nonlocal browser requests and zero unhandled JavaScript errors** in the examined contexts.

The browser acceptance initially hit **two test expectation mismatches**: it looked for the visible Play text rather than its accessible button name, and expected a collapsed soundboard/returned recipe to behave as if it had never unmounted. Both tests were corrected to match the intentional accessible labels and **no-autoplay on recall**; no feature, permission or protected source change was required for those corrections.

## Essential holds / convergence before members

- **Independent security/privacy review:** New crypto code is experimental; the library must be reconciled with existing `privateBackup.ts` and the future **single member-owned** encrypted vault and accepted anti-resurrection deletion/recovery controls. No automatic restore, sync, cross-device continuity or cloud persistence accepted. Manual encrypted file export remains user responsibility. Refuse hidden emotional profiling and prompt-to-memory.
- **Media rights:** This review controls only original **synthetic study voices**. Mixable original long-form A+B multitrack/artist performances do not yet have independent, signed master/composition/stem/AI-use/group/offline/territory permissions. The approved original recording must stay immutable; `LISTEN-19` dry guides are not cleared professional remix stems.
- **Platform auth and voice:** Real production cookie/header concordance, authenticated stable-root, member switching, real MAIA/Writer floor, native iPhone/Safari/WKWebView, Web Locks and accessibility tests on physical devices, signing and founder release **HOLD**.
- **Emotional intensity and sensory agency:** Actual cathartic/strong recordings require artist-defined content guidance, measured dynamic range and clear sound-level transitions, always member-controlled and never surprise-autoplay. No promise of healing, entrainment, trauma treatment or diagnostic outcomes.
- **Experience fidelity:** The existing synthesized study is a narrow audible **technical sketch**; it does **not** yet make the Listening Field's full creative, ceremony/culture, collaborator, artist or surround-sound vision real. Keep professional rights-clear music and founder human listening review the product milestone, not more sliders in isolation.

## Next one meaningful milestone

**LISTEN-24** should test one beautifully made, **creator-permissioned**, full-length A+B soundscape whose actual stems allow a member to choose receptive presets, adjust three sound relationships, save a private recipe, and restore the untouched artist original. The founder should experience *both* the received original and a few optional variations, and judge whether it feels musically alive and supportive of human agency. True artist/cultural collaborators and rights/recovery acceptance must precede any member or paid release.

Owner of the experience: [LISTEN-01 #1979](https://github.com/SoullabTech/Sovereign/issues/1979). Supporting audio priority: [AUDIO-PLATFORM-01 #1984](https://github.com/SoullabTech/Sovereign/issues/1984). Overall continuity [#1982](https://github.com/SoullabTech/Sovereign/issues/1982) remains coordination only.

**Status: REVIEW-SOURCE/PREVIEW PASS — PRODUCTION/USER-DATA/COMMERCIAL MUSIC/HUMAN MUSICIAN CLAIMS HOLD.**
