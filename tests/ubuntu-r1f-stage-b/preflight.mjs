/**
 * Ubuntu R1F Stage B — configuration preflight only.
 * SOURCE-FROZEN / FICTIONAL DATA ONLY / NO DATABASE OR NETWORK OPERATIONS.
 * This guard is NOT proof of the Docker runtime, a database, or an actual service test.
 */
import { fileURLToPath } from 'node:url';

export const SOURCE_SHA = '81ae1edfe592fedac43e458245944e4dd33e9a41';
export const FIXTURE_URL = 'postgresql://ubuntu_fixture_test:fictional_fixture_only@pg-fixture:5432/ubuntu_r1f_ephemeral';
export const REQUIRED = Object.freeze({
  NODE_ENV: 'test',
  R1F_STAGE_B_SCOPE: 'FICTIONAL_DISPOSABLE_ONLY',
  R1F_STAGE_B_MODE: 'PREFLIGHT_ONLY',
  R1F_SOURCE_SHA: SOURCE_SHA,
  R1F_EGRESS: 'INTERNAL_ONLY',
  R1F_DATABASE_ATTESTATION: 'NOT_YET_VERIFIED'
});
const AMBIENT_RE = /^(?:AWS_|AZURE_|GCP_|GOOGLE_|OPENAI_|ANTHROPIC_|STRIPE_|PROTON_|RESEND_|SMTP_|SUPABASE_|SENTRY_|FIREBASE_|NEXT_PUBLIC_|PGHOST$|PGPORT$|PGUSER$|PGPASSWORD$|PGDATABASE$|PGSERVICE$|DATABASE_REPLICA_|DATABASE_READ_|PROD_|PRODUCTION_)/i;

export function checkConfiguration(env) {
  const problems = [];
  if (!env || typeof env !== 'object') {
    return { status: 'REFUSED', problems: ['ENV_NOT_OBJECT'], databaseContacted: false, sourceExecuted: false };
  }
  for (const [key, expected] of Object.entries(REQUIRED)) {
    if (env[key] !== expected) problems.push('INVALID_' + key);
  }
  if (!Object.prototype.hasOwnProperty.call(env, 'DATABASE_URL')) {
    problems.push('DATABASE_URL_MISSING_NO_FALLBACK');
  } else if (env.DATABASE_URL !== FIXTURE_URL) {
    problems.push('DATABASE_URL_NOT_FICTIONAL_FIXTURE');
  }
  const ambient = Object.keys(env).filter(name => AMBIENT_RE.test(name));
  if (ambient.length) problems.push('AMBIENT_CREDENTIAL_OR_EXTERNAL_PROVIDER_KEYS');
  // Deliberately no connection, DNS lookup, file read, socket, dynamic import,
  // credential display, or inference that network namespaces actually exist.
  const ok = problems.length === 0;
  return {
    status: ok ? 'PREPARED_NOT_EXECUTED' : 'REFUSED',
    problems,
    databaseContacted: false,
    sourceExecuted: false,
    networkIsolationVerified: false,
    disposableDatabaseVerified: false,
    noProductionPermissionsVerified: false
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const badInvocation = process.argv.length !== 3 || process.argv[2] !== '--preflight';
  const result = badInvocation
    ? { status: 'REFUSED', problems: ['EXPLICIT_PREFLIGHT_ONLY'], databaseContacted: false, sourceExecuted: false }
    : checkConfiguration(process.env);
  console.log(JSON.stringify(result));
  if (result.status === 'REFUSED') process.exitCode = 78;
}
