/**
 * Offline, read-only R19 schema eligibility probe. Input must be a separately
 * captured metadata-only JSON snapshot; NEVER connect to a live database here.
 * The output is a refusal/hold receipt, not an admission authorization.
 */
import { readFileSync } from 'node:fs';
import { assessR19SchemaCustody } from '../../lib/writersStudio/recovery/schemaCustodyR19';

const path = process.argv[2];
if (!path || process.argv.length !== 3) {
  console.error('usage: tsx wsBetaR19SchemaHoldGate.ts <private-metadata-snapshot.json>');
  process.exitCode = 2;
} else {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path,'utf8'));
    const assessed = assessR19SchemaCustody(parsed);
    console.log(JSON.stringify(assessed,null,2));
    if (assessed.status === 'REFUSED_UNTRUSTED_SNAPSHOT') process.exitCode = 2;
    // HOLD on valid schema is the expected safe outcome, not a build failure.
  } catch (error) {
    console.error('R19_SNAPSHOT_UNREADABLE', (error as Error).name);
    process.exitCode = 2;
  }
}
