/**
 * WS-BACKUP-ERASURE-03 — content-minimal, offline manifest pre-admission.
 * This is a NEGATIVE FILTER, NOT proof that a claimed capture/ACL/key exists.
 * Never queries live PostgreSQL, reads member Source bytes, or performs restore.
 * Never print member identifiers, artifact refs, filenames or manuscript data.
 */
const validHash = (v) => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v);
const unique = (values) => values.length === new Set(values).size;

export function examineProposedRestore(m) {
  const refusals = [];
  const reject = (reason) => { if (!refusals.includes(reason)) refusals.push(reason); };
  if (!m || typeof m !== 'object') return { admitted: false, refusals: ['missing_manifest'] };

  const c = m.capture || {};
  const a = m.authority || {};
  if (m.version !== 1 || c.state !== 'sealed' || !c.generation ||
      c.databaseGeneration !== c.generation || c.vaultGeneration !== c.generation ||
      !c.databaseFence || c.databaseFence !== c.vaultFence)
    reject('unproven_consistent_generation');

  if (m.coverage?.databaseText !== 'per-work-ciphertext' ||
      m.coverage?.sourceVault !== 'per-work-ciphertext' ||
      m.coverage?.derivedText !== 'per-work-ciphertext' ||
      m.coverage?.keyAuthority !== 'nonrollbackable-per-work')
    reject('plaintext_or_globally_decryptable_work');

  // This is an attestation input. The validator cannot audit actual NAS copies.
  const census = m.replicaCensus || {};
  if (census.authority !== 'independently-witnessed' || census.scope !== 'all-soullab-controlled' ||
      census.unknownCopies !== 0 || census.reconstructiveLegacyCopies !== 0 ||
      census.unremediatedRecycleCopies !== 0)
    reject('historic_or_unknown_reconstructive_copies');

  if (!Number.isSafeInteger(a.currentDeletionEpoch) || a.currentDeletionEpoch < 0 ||
      !Number.isSafeInteger(a.captureDeletionEpoch) ||
      a.currentDeletionEpoch < a.captureDeletionEpoch ||
      a.barrierSealed !== true || a.barrierSource !== 'independent-nonrollbackable')
    reject('unverified_restore_deletion_barrier');

  const refs = Array.isArray(m.databaseSources) ? m.databaseSources : null;
  const files = Array.isArray(m.vaultArtifacts) ? m.vaultArtifacts : null;
  const works = Array.isArray(m.works) ? m.works : null;
  if (!refs || !files || !works) return { admitted: false, refusals: [...refusals, 'missing_reference_census'] };
  if (m.coverage?.captureScope !== 'entire-db-and-source-vault' ||
      !Number.isSafeInteger(m.coverage?.expectedSourceRefs) ||
      !Number.isSafeInteger(m.coverage?.expectedVaultFiles) ||
      m.coverage.expectedSourceRefs !== refs.length ||
      m.coverage.expectedVaultFiles !== files.length ||
      refs.length === 0 || works.length === 0)
    reject('incomplete_full_vault_census');

  // IDs below are artificial/opaque authority join handles, never file paths.
  if (!unique(refs.map(x => x?.ref)) || !unique(files.map(x => x?.ref)) || !unique(works.map(x => x?.work)))
    reject('duplicate_reference_identity');
  if (refs.some(x => !x || typeof x.ref !== 'string' || !validHash(x.hash) ||
                      typeof x.work !== 'string' || !['artifact','paste'].includes(x.kind)))
    reject('invalid_database_reference');
  if (files.some(x => !x || typeof x.ref !== 'string' || !validHash(x.hash)))
    reject('invalid_vault_inventory');

  const fileByRef = new Map(files.filter(Boolean).map(x => [x.ref,x]));
  const refByRef = new Map(refs.filter(x=>x?.kind === 'artifact').map(x=>[x.ref,x]));
  if (refs.some(x => x?.kind === 'artifact' && (!fileByRef.has(x.ref) || fileByRef.get(x.ref).hash !== x.hash)))
    reject('source_missing_or_hash_mismatch');
  if (files.some(x => !x || !refByRef.has(x.ref))) reject('unclaimed_or_orphan_source_custody');
  if (refs.some(x => x?.kind === 'paste' && fileByRef.has(x.ref)))
    reject('paste_invented_artifact');

  const workSet = new Map(works.filter(Boolean).map(x=>[x.work,x]));
  if (refs.some(x=>!x || !workSet.has(x.work))) reject('unclaimed_source_work');
  if (works.some(x=>!x || typeof x.work !== 'string' ||
                        !['active','deleted'].includes(x.state) ||
                        (x.state==='active' && (typeof x.key !== 'string' || x.key.length === 0)) ||
                        (x.state==='deleted' && (x.key !== null || !Number.isSafeInteger(x.erasedAtEpoch)))))
    reject('invalid_per_work_key_lifecycle');
  if (works.some(x=>x?.state==='deleted' && refs.some(r=>r?.work===x.work)) ||
      works.some(x=>x?.state==='deleted' && x.erasedAtEpoch > a.currentDeletionEpoch))
    reject('deleted_work_reconstructible');
  if (refs.some(x=>!x || workSet.get(x.work)?.state !== 'active'))
    reject('source_not_active');

  const keys = works.filter(x=>x?.state==='active').map(x=>x.key);
  if (!unique(keys)) reject('shared_work_key');
  return { admitted: refusals.length===0, refusals };
}
