/**
 * G8 · the two affirmative acts.
 *
 * Founder review 2026-09-08: both guards were `Boolean(env)`, so a negative
 * value counted as a positive assertion. The channel attestation is the one fact
 * the program admits it cannot verify in a transparent-proxy environment, which
 * makes the human gesture the load-bearing one:
 *
 *   Where machine proof ends and human attestation begins, the attestation
 *   itself must be unambiguous.
 *
 * These spawn the real witness, so they prove the refusal happens in the program
 * rather than in a helper a caller could bypass.
 */
import { spawnSync } from 'child_process';
import { join } from 'path';

const REPO = join(__dirname, '../../..');
const WITNESS = join(REPO, 'scripts/witness/encounter-g8-live-ear.ts');

/** Canonical origin and a key present, so only the guard under test can refuse. */
function run(env: Record<string, string | undefined>) {
  const r = spawnSync('npx', ['tsx', WITNESS, 'm-1', 'mem-1'], {
    cwd: REPO,
    encoding: 'utf8',
    env: {
      ...process.env,
      ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
      ANTHROPIC_API_KEY: 'not-used-these-refuse-first',
      DATABASE_URL: 'postgres://unreachable/none',
      ENCOUNTER_G8_CONFIRM: undefined,
      ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST: undefined,
      ...env,
    } as NodeJS.ProcessEnv,
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const NOT_AFFIRMATIVE = [undefined, '', '0', 'false', 'no', 'true', 'yes', 'TRUE', ' 1'];

describe('ENCOUNTER_G8_CONFIRM — I intend to execute cognition', () => {
  it.each(NOT_AFFIRMATIVE)('⛔ %p is not affirmative — refuses before anything runs', (v) => {
    const r = run({ ENCOUNTER_G8_CONFIRM: v as string | undefined });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/must be exactly "1"/);
  });

  it('exactly "1" is accepted, and the act proceeds to the next guard', () => {
    const r = run({ ENCOUNTER_G8_CONFIRM: '1' });
    /* It gets past confirmation and stops at the attestation, which is absent. */
    expect(r.out).toMatch(/product-channel attestation absent/);
  });
});

describe('ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST — I attest this is the product channel', () => {
  it.each(NOT_AFFIRMATIVE)('⛔ %p does not attest — refuses before inference', (v) => {
    const r = run({
      ENCOUNTER_G8_CONFIRM: '1',
      ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST: v as string | undefined,
    });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/product-channel attestation absent/);
    /* And nothing was read: the refusal precedes the Work, not merely the call. */
    expect(r.out).not.toMatch(/snapshot|digest|windows/);
  });

  it('exactly "1" attests, and the run proceeds past the channel guard', () => {
    const r = run({ ENCOUNTER_G8_CONFIRM: '1', ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST: '1' });
    expect(r.out).toMatch(/OPERATOR ATTESTED/);
    expect(r.out).not.toMatch(/attestation absent/);
    /* It then fails on the unreachable database, which is past both guards. */
    expect(r.code).not.toBe(0);
  });

  it('the witness never claims the attestation is machine-verified', () => {
    const r = run({ ENCOUNTER_G8_CONFIRM: '1' });
    expect(r.out).toMatch(/human attestation, NOT machine verification/i);
  });

  it('⛔ SP-4A still refuses a visibly foreign origin, attested or not', () => {
    const r = run({
      ENCOUNTER_G8_CONFIRM: '1',
      ENCOUNTER_G8_PRODUCT_CHANNEL_ATTEST: '1',
      ANTHROPIC_BASE_URL: 'https://proxy.internal:8443/v1',
    });
    expect(r.code).not.toBe(0);
    expect(r.out).toMatch(/G8 CHANNEL FAILURE/);
    /* An attestation cannot overrule what the machine CAN see. */
    expect(r.out).toMatch(/No inference is performed/);
  });
});
