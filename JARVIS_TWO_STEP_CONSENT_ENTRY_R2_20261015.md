# Jarvis — Writer's Studio two-step consent entrance (R2)

**Date:** 2026-10-15
**Disposition:** ISOLATED SOURCE QUALIFICATION PASS, **PUBLIC RELEASE HOLD**.
**Base:** approved public fictional beta source `5c44ce936f2325270d94fe5d0074758bde7be6f1`, plus isolated R1 consent ledger source `4d98713685050f5044e69946bfa3323def8bf252`.
**Public beta** continues serving `https://beta.soullab.life/signin` with no changes or real tester admission.

## Candidate behavior
- Invited member authenticates with ordinary verified credentials. Existing exact member-ID allowlist plus an active Writer's Studio beta contact are required *before* any beta session can be minted.
- If consent has not been recorded, the signed-in member is routed to `/beta/consent`, not the Studio. Credentials do not grant manuscript, MAIA, export, or Studio API access.
- `/beta/consent` has an exact authenticated, free-tier access-matrix rule, not a general public route. `/api/beta/consent` has its own exact rule and verified-session/host/invitation checks.
- The only consent notice comes from explicitly configured, reviewed server-side **exact text**, semantic version and SHA-256. There is **no default notice**, test agreement or source string embedded as a real policy. If any part is absent or mismatched, the API returns `notice_pending` and refuses acceptance.
- The member must explicitly press **I agree to participate**. The POST includes the notice version/hash actually shown, rejects stale text or a changed version (409), verifies strict trusted Origin, derives the acting member from the verified session, and appends one self-member consent event. Client cannot provide member or actor IDs.
- Withdrawal is an authenticated self-member act and remains possible even if the notice configuration was removed or replaced; it appends a revocation for the prior policy and the full beta authorization immediately refuses later Studio requests.
- Approved, accepted member gets a link to the Studio. The page does NOT promise that membership or consent is sufficient to access someone else's Work, whose owner checks remain independent.
- Founder/CTO witness status stays distinct from tester enrollment and is not represented as their consent to participate.
- Public Caddy candidate stages a narrow exception for exactly `/beta/consent` and `/api/beta/consent`. All manuscript/MAIA/Studio routes retain `forward_auth`. Caddy configuration has been validated and **NOT applied**.

## Candidate evidence
- Full R2 targeted consent/sign-in/edge tests: **46/46 PASS** across 6 suites.
- Broader beta authorization/import/editorial-custody regression: **200/200 PASS** across 17 suites.
- TypeScript/TSX syntax parse of six relevant modules, including the actual consent UI and API: PASS.
- Existing R1 migration and fictional append-only consent ledger were already tested using an independently restored fictional database, then the lab DB removed. No migration applied to live.
- Staged Caddy validated with source hash `a8146faa0094190a1874f840bdaf872a6d3e84f525123ddd41251185b212b191`. Active public Caddy hash remains `a1b9fed965e901a519da79fd90764ed53755595471100099f8b2e610199b65a5`.
- No real emails, invitations, member data, provider tokens or further MAIA dispatches occurred.

## Blocking release acceptance
1. **Founder-approved, member-visible participation notice**: exact language on what is stored, private member writing, third-party model processing, explicit Apply/Undo, encryption/recovery, abandonment of unconfirmed source uploads, revocation, and deletion/backup terms. Do not invent legal permission or accept on behalf of members.
2. **Post-withdrawal self-custody**: a revoked member must still be able to export or request confirmed deletion of their own Work without regaining MAIA/editorial access. The specific authenticated data-only gateway and browser acceptance are not yet implemented. Do not release consent gating before this works.
3. **True public Chrome/Safari acceptance on final exact-source build**: this candidate has source/syntax tests only, no new full image build or public route switch.
4. **Independent encrypted offsite recovery and key escrow**: current fictional AES-256-GCM trial has no independently administered decryptor, and the T7 itself is unencrypted. No real data may be migrated into the isolated beta until qualified.
5. **Unclaimed original retention**: no 24-hour auto-deletion policy was authorized. The R4 retention engine remains explicitly disabled; a pending original survives tab closure until member discard or a separately approved policy.
6. **Human security/privacy review and actual named cohort consent**: no tester admitted, no member acceptance presumed. Do not copy production credentials or manuscripts.
7. **Authentication-method breadth**: the R2 sign-in redirect is explicitly qualified for the password form. Other beta entry methods (passkey/biometric) must either be routed through the same consent-only boundary or hidden until tested. Caddy's Studio forward authorization still protects content regardless of client navigation.

**Operator ruling:** Keep current beta and production untouched. No mass invitations, migration, Caddy reload or retention scheduler. A future release requires one fully integrated isolated image + actual public browser acceptance and a separately approved consent policy.

## Final disposition after R2 source qualification

- **Source-only acceptance:** 46/46 targeted tests and 200/200 broader regressions passed on the isolated Minisforum.
- **Syntax acceptance:** all six changed representative TypeScript/TSX files parsed correctly in the pinned container.
- **Gateway candidate:** Caddy syntax PASS, only `/beta/consent` and `/api/beta/consent` exempted from normal Studio forward-auth; the API itself checks verified session, beta host, exact cohort candidacy and CSRF Origin. Configuration **not loaded** into active public Caddy.
- **Consent safety:** POST acceptance requires the exact policy version/hash displayed in the prior GET. Version/text changes refuse with 409. No server-approved notice exists, so current candidate refuses real agreement. Revocation remains available against a prior accepted record even when the active notice has been withdrawn.
- **Repository check:** pre-commit on the Mac Studio was stalled for four minutes in filesystem I/O during `check:no-supabase`, while another Jarvis process also scanned T7. Only this candidate's stalled hook chain was terminated; **the candidate is still STAGED, not committed**. Git diff --check passed. Do not report a new commit or completed pre-commit acceptance.
- **Evidence:** `/Volumes/T7 Shield/ws-beta-consent-entry-r2-evidence-20261015/MANIFEST.json`, verified 46/46 and 200/200 Jest logs. Previous R1 consent migration remains separately committed as `4d9871368`, without deployment.
- **Public check:** `https://beta.soullab.life/signin` responds HTTP 200 with valid TLS. Public beta remains `5c44ce936...`; this R2 code is **not deployed**, no real members admitted.
- **Next exact operation:** finish repository security hooks without bypass; approve exact member-facing notice and independent recovery/retention; add verified post-revocation self-export/deletion; qualify non-password sign-in routing; build an isolated complete image and test public Chrome + Safari before any route switch.
