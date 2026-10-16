/**
 * R20 metadata-only analysis. Takes an existing privately captured schema
 * inventory, never connects to production or reads any manuscript rows.
 *
 * Positive recognition of ordinary SQL custody is deliberately a HOLD.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { assessR20HistoricalWriterCustody } from '../../lib/writersStudio/recovery/historicalContentCoverageR20';

if (process.argv.length !== 4) {
  console.error('usage: tsx wsBetaR20HistoricalHoldGate.ts <private-schema-metadata.json> <private-receipt.json>');
  process.exitCode = 2;
} else {
  try {
    const input = JSON.parse(readFileSync(process.argv[2],'utf8')) as unknown;
    const result = assessR20HistoricalWriterCustody(input);
    if (result.status === 'REFUSED_METADATA') process.exitCode = 2;
    // Filesystem metadata contains no manuscript rows, credentials or
    // identifiers; keep receipt private nonetheless, not in public git.
    writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n',{mode:0o600,flag:'wx'});
    console.log(JSON.stringify({
      status:result.status,
      canAdmitRealWriters:false,
      directFieldCount:result.directFields.length,
      derivedFieldCount:result.derivedEditorialFields.length,
      unclassifiedPriorityFieldCount:result.unclassifiedPriorityFields.length,
    },null,2));
  } catch(e) {
    console.error('R20_METADATA_REFUSED',(e as Error).name);
    process.exitCode = 2;
  }
}
