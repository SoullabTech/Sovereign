# App mail: turn on Proton SMTP in production (DRAFT PLAN, 31 Oct 2026)

**Status:** plan only. **Nothing here is authorized, applied or deployed.** Owner: founder (credential, deploy) with the mail/auth lane
(AUTH-RETURN-01, MAIL-*). It is outside the Writer lane's change scope.

## 1. What is true today (evidence)
| Fact | Evidence class |
|---|---|
| The deployed app (`a9a23e134`) selects provider `smtp` by default (`EMAIL_PROVIDER` unset); `resend` is no longer a supported provider. | code read, `lib/email/providers/index.ts` |
| Production container and host `.env.production` have **no** `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD_FILE`, `EMAIL_PROVIDER`; `docker-compose.production.yml` wires none. | runtime read (names only, values never read) |
| A real send attempt on 2026-10-31 failed with `not_configured` / "smtp provider is not configured". Nothing was sent. | runtime trace |
| `email_delivery_attempts`: 30 `accepted` and 45 `refused` ever, all provider `resend`; latest 7 refused with `provider_auth`, newest 2026-10-29. No `smtp` row has ever existed. | runtime read |
| Effect: email-code sign-in and any other app email cannot be delivered. | derived; not witnessed by a member |

## 2. What "on" would mean (constraints read from code, not assumptions)
- Managed identity is **`noreply@soullab.life`** only; host must be **`smtp.protonmail.ch`**; credential must come from **`SMTP_PASSWORD_FILE`**
  (no `SMTP_PASSWORD` in production). The file must be a regular file ≤16 KB, mode with no group/other bits, **owned by the container user**
  (uid 1000 `node`; the host user `soullab` is also uid 1000, so a `soullab`-owned 0600/0400 file fits). `lib/email/protonTransport.ts`.
- There is **no fallback provider**. Unconfigured means refused, as today.
- The managed send boundary is narrow by design: from `noreply@soullab.life`, purpose `auth:email-code`, budget 30/min and 500/day
  (`lib/email/senderCapacity.ts`). Consequences:
  1. Turning it on restores **email-code sign-in**.
  2. **Invitations (`invite:*`) would still be refused by the boundary.** Writer invitations stay a human send from Proton.
  3. **Passkey recovery** (`auth:passkey-recovery`, `app/api/members/recover/route.ts`) is a different purpose and appears to be outside the
     boundary: recovery email may stay unavailable. To be confirmed by reading the boundary's full purpose check before any promise.

## 3. Open question: RESOLVED 2026-10-31
The Soullab Proton plan DOES allow **SMTP submission tokens** (founder screenshot of Proton Settings, IMAP/SMTP, SMTP submission: tokens exist for `noreply@soullab.life`, incl. "Soullab Production SMTP", created 12 Oct, last used 12 Oct). Original question: does it allow for `noreply@soullab.life`? `docs/ops/WORKSPACE_SMTP_QUALIFICATION.md` calls it
"the natural inquiry" and does not record an answer. Founder to check in Proton (Settings, IMAP/SMTP, SMTP tokens). If it does not, the whole plan
changes (another submission service, which is a design decision, not a configuration step).

## 4. Steps (each a separate approval; none run)
1. **DONE, no action:** an owner-only credential file already exists on minisforum at `/home/soullab/.config/soullab-mail/noreply.smtp-token` (owner `soullab`, mode 0600, 18 bytes, non-empty; contents never read). Whether that token is still VALID is unverified until the acceptance send in step 6.
2. (none: the file in step 1 is used; if step 6 shows an auth refusal, generate a new token in Proton and overwrite that file, never paste it in chat.)
3. **Lane change (source):** `docker-compose.production.yml`, `maia` service: add a read-only bind mount of that file (e.g. to
   `/run/secrets/smtp_password`) and `SMTP_HOST=smtp.protonmail.ch`, `SMTP_USER=noreply@soullab.life`, `SMTP_PASSWORD_FILE=/run/secrets/smtp_password`
   (`SMTP_PORT` default 587). Normal custody, review, immutable-SHA deploy lane. Not a hand edit on the host.
4. **Qualify before production:** `scripts/witness/smtp-qualify.ts <from> <to>` from a safe environment with the same settings, to the founder's own address.
5. **Deploy** through `scripts/pre-deploy-gate.sh` (prepare, then cutover), named SHA, Co-Lab gate.
6. **Witness (acceptance):** request an email code for the **founder's own account** through the real route; confirm the code arrives; confirm an
   `email_delivery_attempts` row with provider `smtp`, state `accepted`; confirm a disallowed purpose is still refused.
7. **Observe** the 30-minute window; watch `refused`/`indeterminate` counts and the 30/min, 500/day budget.

## 5. Rollback
Remove the three variables and the mount, redeploy the previous image (`previous` tag). Result is today's state (mail unconfigured), not a worse one.
Revoke the Proton token if it was exposed.

## 6. What this plan does not do
It sends no invitation, changes no member, does not enable Resend, does not widen the managed send boundary, and does not claim recovery email works.
Whether to widen the boundary (for `invite:*` or recovery) is a separate founder ruling.

## 7. Immediate interim (no change needed)
Writers sign in with username and password. If a writer cannot, the founder or the Writer lane resets it by hand. Invitations go out from Proton by hand.
