# Twilio US texting (A2P 10DLC): registration pack (DRAFT, 6 Nov 2026)

**Status:** preparation only. Nothing is submitted. The founder enters this in the Twilio console (business identity and tax details are the founder's to supply). Owner: founder.

## 1. Why
Twilio's own health panel (5 Nov): top issue is **Error 30034, "US A2P 10DLC: Message from an Unregistered Number"**, 9 messages in the last 7 days. Since 2 Feb 2026, 359 of 383 Twilio messages were undelivered for this reason; about 8 were delivered or read (those look like WhatsApp). Until the sending number is registered, US texts are blocked by carriers.

## 2. What Soullab's own Twilio account actually sends (code read at `5772cafe3`)
Only these use **Soullab's** credentials and number:

| Sender | To | What |
|---|---|---|
| `lib/ops/mailTransportAlert.server.ts` | founder (`OPS_ALERT_PHONE`) | "email transport is down" alert, content-free |
| `lib/safety/humanSafetyAlert.server.ts` | designated safety recipient | member-safety alert, content-free |
| `app/api/feedback/route.ts` | founder | "MAIA {category} from {name}: {preview}" for each in-app feedback submission |
| `scripts/maia-monitor.js`, `lib/alerting/real-time-alerts.ts` | founder / staff | uptime and system alerts |

Practitioner session reminders (`app/api/notifications/sms`) use **each practitioner's own Twilio credentials**, so they are not covered by Soullab's registration and are out of scope here.

**So the honest campaign today is internal operational alerts to the owner and a few staff, not marketing and not member messaging.**

## 3. Brand registration: what the founder supplies (nothing here is guessed)
- Legal business name: ______
- Business type and tax ID/EIN (or Twilio's sole-proprietor path if there is no EIN; check the console for its limits): ______
- Registered address, website `https://soullab.life`, contact name, email, phone: ______
- Vertical / industry: ______

## 4. Campaign (draft text; confirm Twilio's use-case names in the console)
**Use case:** the closest of Twilio's offered categories for owner/staff operational notifications (usually "Account Notifications", "Low Volume Mixed" or a similar low-volume option).

**Description:**
> Soullab sends short operational notifications to its owner and a small number of staff: alerts when the platform's email or uptime fails, and a notice when a member submits in-app feedback. Messages go only to numbers the recipients themselves supplied for this purpose. No marketing, no promotions, no messages to the general public.

**Sample messages:**
1. `MAIA OPS | EMAIL TRANSPORT DOWN | kind=provider_auth | purpose=auth:email-code | Sign-in and other email are failing for everyone. No recipient data included.`
2. `MAIA problem from <first name>: <first 80 characters of the report>`
3. `Soullab uptime: maia-sovereign health check failed at 14:02 UTC. Reply STOP to opt out.`

**How recipients opt in:** each recipient is the owner or a staff member who personally configured their own number as the alert destination in Soullab's server configuration and consented in writing to receive these alerts. No third-party or member numbers are used.

**Opt-out / help:** reply STOP to opt out, HELP for help; Twilio handles these keywords on the sending number or messaging service.

**Links:** privacy policy `https://soullab.life/privacy`, terms `https://soullab.life/terms`.

## 5. A mismatch to fix before submitting
The privacy page already has an SMS section with STOP, HELP, "message and data rates may apply" and "no sharing for marketing", which is good. But it describes only **appointment reminders to members who opt in**. A reviewer compares the campaign to the website, so a short added sentence should say that Soullab also sends **operational alerts to its owner and staff**. That is a one-paragraph edit to `app/privacy/page.tsx` and would go through the normal PR.

## 6. After approval
1. Send one real test text to the founder's phone and confirm it arrives (a delivered status, not just "accepted").
2. Check whether the member-safety text path ever delivered, and fix it if not. Nothing member-safety-related should depend on an unproven path.
3. Record the outcome in `docs/ops/NON_DELIVERY_REGISTER.md`.

## 7. Not in this note
No submission, no console action, no code change. No claim that registration will be approved or how long it takes.
