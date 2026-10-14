# Pro Studio R5a — bounded session continuity security correction
Date: October 13, 2026
Status: **LOCAL CANDIDATE — independent human Class A and production release HOLD**

## Parent and protected release custody
- Frozen prior R5 local commit: `e796009713ef1559292732e810aa6f66f76d4a6d`.
- R5a branch: `fix/pro-studio-r5a-session-continuity-20261013` on separate T7 Shield worktree.
- Protected release baseline: `clean-main-no-secrets@2e836abc32853bf01bf8256062b561c2b7406378`.
- No previously reviewed commit was rewritten, rebased or changed.
- No new SQL migration; Home and House remain neutral SSR with private no-store JSON.

## Two reproduced predecessor blockers
1. **Dead-end after deliberate sign-out.** R5 preserved the signout latch
   `maia_signed_out=1`, but the ordinary browser conflict assessment also
   refused a newly authenticated return to the SAME saved member. Automatic
   sign-in must continue to honor the latch; explicit credential verification
   may discharge it only after confirming exact server session identity.
2. **Cookie-only account switch in a mounted room.** An already-open Home
   with A Work continued showing A after its HttpOnly server session switched
   to B without any localStorage change. MAIA had a similar on-mount-only
   gate. Server cookie changes are not storage events.

## R5a correction
- Introduces a separate explicitly invoked fresh-sign-in validator; the
  passive `assessBrowserAccount` and automatic whoami resume keep the
  strict signout latch. On a deliberate fresh credential response, exact
  same-member cached identities and an active server cookie must be verified
  BEFORE clearing the latch or claiming a new local account scope.
- All six current explicit `storeSession` callback paths await the validator
  (email-code, registration, biometric, password and native Google/Apple);
  no foreign local member material is moved or erased.
- Home/House conceal existing private UI on pagehide/visibility loss and
  reverify actual `GET /api/members/session` on focus, pageshow, visibility
  regain and cross-tab broadcast. A different cookie identity goes to the
  neutral account conflict; a failed check leaves private view absent.
  Private JSON receipt is followed by a final server session recheck.
- Mounted MAIA is unmounted during uncertainty, reconciles cookie/member
  on return or account notice and refuses different server identity.
  Previous MAIA/journal browser data remain untouched. Normal revalidation
  may transiently remount the MAIA UI; full conversation continuity requires
  separate authenticated acceptance.
- Fixed an event-loop in the first R5a candidate: no re-broadcast for mere
  Home readmission (only deliberate sign-in/signout broadcasts); coalesce
  concurrent resume requests, and avoid treating a first-use Continue
  threshold as an already accepted account.

## Isolated development evidence so far
- 8 scoped Jest suites, 79 tests PASS after first R5a implementation;
  rerun against exact final commit for final custody.
- Real local WebKit with disposable fictional PG16: R5 Home/House, client
  data separation, local A→B cross-tab storage invalidation, explicit
  first-use Continue, MAIA/sign-in mismatch and signed-out refusal PASS.
- Cookie-only B server session replacing A with no storage event:
  previously mounted A Home and MAIA both redirect to neutral conflict,
  preserving A local browser ownership — real WebKit PASS.
- Deliberate user-initiated A signout followed by simulated successful
  B credential callback (mocked only in fictional browser rehearsal):
  B's authenticated cookie checked, B Home Work appears, B's earlier local
  note persists and signout latch is cleared — PASS. No real login secrets,
  member records or production authentication touched.
- Separate mocked *foreign* credential A callback while browser holds B
  stayed on sign-in under Next development Fast Refresh. Browser-local B
  content and sign-out marker were preserved; navigation to the neutral
  conflict screen was NOT conclusively witnessed in that negative UI run.
  Pure adversarial tests reject the A/B mismatch, but production-mode
  browser and actual credential workflow still require adjudication.

## Non-authorities and remaining gates
Browser localStorage remains client-controlled and is NOT cryptographic
authentication or a defense against hostile same-origin scripts. Existing
server bearer-cookie rights persist; neither the new account guard nor
`expectedMemberId` is authorization. Other member routes/global providers
and legacy unscopeable local materials require broader privacy review.

Before accepting R5a: exact-source no-regression TypeScript, whole build,
synthetic restored-PG WebKit/Chrome production-mode checks, in-flight races,
verified genuine authentication (not mocked), MAIA conversation/voice/memory
continuity, physical iOS Safari, independent qualified human Class A
security/privacy review, founder visual acceptance, R20 recovery,
production image digest/ingress/no-store/rollback and explicit consenting
tester allowlist + founder/operator exact-image beta GO.

**NO merge, push, deployment, billing, migration, live member write or
tester access is permitted by this document.**
Tracker: https://github.com/SoullabTech/Sovereign/issues/1816
