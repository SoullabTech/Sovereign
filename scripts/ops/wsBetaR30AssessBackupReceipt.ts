/**
 * R30 fictional-only post-test release-stop witness.
 *
 * Reads ONLY an explicitly marked R27 fictional fixture receipt. Emits no
 * manuscript, raw key, member account or source-vault contents.
 */
import {readFileSync} from 'node:fs';
import {reviewOldBackupEvidenceR27} from '../../lib/writersStudio/recovery/oldBackupReleaseGateR27';

if(process.env.R30_RECEIPT_REVIEW!=='fictional-only')
  throw new Error('R27_FIXTURE_RECEIPT_OPT_IN_REQUIRED');
const file='/Volumes/T7 Shield/ws-beta-release-r11-build-20261016/R30_OLD_BACKUP_REVOCATION_20261016.json';
let raw:unknown;
try {raw=JSON.parse(readFileSync(file,'utf8'));}
catch {raw=null;}
const result=reviewOldBackupEvidenceR27(raw);
console.log(JSON.stringify(result,null,2));
if(result.verdict!=='HOLD' ||
   result.reason!=='observed_retained_key_offline_decryption' ||
   result.canAdmitRealWriters!==false ||
   result.canClaimIrreversibleErasure!==false)
  process.exitCode=2;
else console.log('R27_EXPECTED_RELEASE_HOLD_WITNESSED');
