/**
 * WORKSPACE SMTP QUALIFICATION — phase 1, without touching production.
 * ====================================================================
 *
 *   SMTP_HOST=smtp-relay.gmail.com SMTP_PORT=587 \
 *   SMTP_USER=<sending identity> SMTP_PASSWORD=<relay secret> \
 *   npx tsx scripts/witness/smtp-qualify.ts <from-address> <to-address>
 *
 * Constructs SmtpProvider DIRECTLY and sends one message. It does not read or
 * change EMAIL_PROVIDER, so production keeps sending through Resend while this
 * runs — the qualification cannot cause an identity-mail outage.
 *
 * WHAT THIS PROVES, AND WHAT IT DOES NOT
 * ======================================
 * Proves: the credentials authenticate, the relay accepts a message from this
 * sender, and (with the operator's inbox check) it is actually delivered.
 *
 * Does NOT prove the integrated path. `sendEmail` policy, lane resolution and
 * the delivery ledger are all bypassed here by design — that is phase 2, and it
 * needs a bounded EMAIL_PROVIDER=smtp switch to show a ledger row with
 * provider='smtp'. Passing phase 1 licenses attempting phase 2; it does not
 * substitute for it.
 *
 * The relay (smtp-relay.gmail.com) is preferred over smtp.gmail.com: it is
 * intended for application sending, and the app-password path puts P0 identity
 * mail behind a 2-Step-Verification dependency that Workspace policy can
 * disable.
 */
import { SmtpProvider } from '../../lib/email/providers/SmtpProvider';

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const grn = (s: string) => `\x1b[32m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

function die(msg: string): never {
  console.error(red(`STOP: ${msg}`));
  process.exit(1);
}

async function main() {
  const [from, to] = process.argv.slice(2);

  console.log(bold('\n== 0 · Inputs =='));
  if (!from || !to) die('usage: smtp-qualify.ts <from-address> <to-address>');
  if (from.includes('<') && !from.includes('@')) die('from looks like a placeholder');
  for (const [label, v] of [['from', from], ['to', to]] as const) {
    if (!/@.+\./.test(v)) die(`${label} is not an address: ${v}`);
  }
  console.log(`from: ${from}`);
  console.log(`to:   ${to}`);

  console.log(bold('\n== 1 · Configuration =='));
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  console.log(`SMTP_HOST: ${host ?? red('<unset>')}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT ?? '587 (default)'}`);
  console.log(`SMTP_USER: ${user ?? red('<unset>')}`);
  console.log(`SMTP_PASSWORD: ${process.env.SMTP_PASSWORD || process.env.SMTP_PASS ? 'set' : red('<unset>')}`);

  const provider = new SmtpProvider();
  if (!provider.isConfigured()) {
    die('SmtpProvider reports not configured — need SMTP_HOST, SMTP_USER and SMTP_PASSWORD');
  }
  console.log(grn('PASS · provider reports configured'));

  if (host && /(^|\.)smtp\.gmail\.com$/.test(host)) {
    console.log(
      '\x1b[33mNOTE\x1b[0m smtp.gmail.com requires an app password, which depends on ' +
      '2-Step Verification and can be disabled by Workspace policy. ' +
      'smtp-relay.gmail.com is the intended application path.'
    );
  }

  console.log(bold('\n== 2 · Send =='));
  const stamp = new Date().toISOString();
  const result = await provider.send({
    from,
    to,
    subject: `Soullab SMTP qualification ${stamp}`,
    text:
      `This message was sent directly through SmtpProvider to qualify an ` +
      `independent transport path.\n\nSent: ${stamp}\nHost: ${host}\n\n` +
      `Production was not modified; it continues on its current provider.\n`,
    tags: [
      { name: 'purpose', value: 'qualification' },
      { name: 'lane', value: 'P0' },
    ],
  });

  if (!result.accepted) {
    console.error(red('REFUSED'));
    console.error(JSON.stringify(result.rawError, null, 2).slice(0, 2000));
    die(
      'the relay did not accept the message.\n' +
      '       EAUTH        → credentials rejected\n' +
      '       ESOCKET/ETIMEDOUT → host or port unreachable\n' +
      '       "not allowed to send" → the sending identity is not authorised\n' +
      '                              to relay for this domain'
    );
  }

  console.log(grn(`PASS · relay accepted, id ${result.providerMessageId}`));

  console.log(bold('\n== OPERATOR CONFIRMATION =='));
  console.log(`
  Acceptance by a relay is not delivery, and for a NEW sending path the gap
  between them is exactly where SPF/DKIM/DMARC failures show up.

  [ ] The message arrived at ${to}
  [ ] It is in the INBOX, not spam
  [ ] Its headers show   spf=pass   dkim=pass   dmarc=pass
      (Gmail: open the message, kebab menu, "Show original")

  A message that arrives in spam has NOT qualified this path. Putting sign-in
  codes on it would lock members out more quietly than an outage would.

  Passing all three licenses phase 2: a bounded EMAIL_PROVIDER=smtp switch in
  production to prove a ledger row with provider='smtp'. Phase 1 does not
  substitute for it.
`);
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
