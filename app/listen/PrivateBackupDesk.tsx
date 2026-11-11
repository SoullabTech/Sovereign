'use client';
import { useState } from 'react';
import { decryptListeningExport, encryptListeningExport, MAX_PRIVATE_BACKUP_BYTES } from '@/lib/listening/privateBackup';
import { SOULLAB_EXPORT_FORMAT } from '@/lib/listening/portableCollections';
import type { MemberCollection } from '@/lib/listening/portableCollections';
import styles from './listen.module.css';

type Props = {
  collections: MemberCollection[];
  journal: string;
  onRestore: (data: { collections: MemberCollection[]; journal: string }) => void;
};

function downloadBackup(text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'soullab-listening-private-backup.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** No browser persistent password store, network call, account or audio upload.
 * Intended as a review-stage user-custodied encrypted PORTABLE EXPORT only. */
export default function PrivateBackupDesk({ collections, journal, onRestore }: Props) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [selected, setSelected] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('No private backup opened.');
  const clearSecrets = () => { setPassphrase(''); setConfirmPhrase(''); };
  const exportEncrypted = async () => {
    if (busy) return;
    if (passphrase !== confirmPhrase) { setStatus('Passphrases do not match.'); return; }
    setBusy(true);
    try {
      const plain = JSON.stringify({format:SOULLAB_EXPORT_FORMAT,collections,journal});
      const sealed = await encryptListeningExport(plain, passphrase);
      downloadBackup(sealed);
      setStatus('Passphrase-protected backup saved to your device. Remember your passphrase: Soullab cannot recover it.');
      clearSecrets();
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not create private backup.'); }
    finally { setBusy(false); }
  };
  const unlock = async () => {
    if (busy) return;
    if (!selected) { setStatus('Choose a Soullab private backup file first.'); return; }
    if (selected.size > MAX_PRIVATE_BACKUP_BYTES) { setStatus('This private backup exceeds the 8 MB limit.'); return; }
    setBusy(true);
    try {
      const restored = await decryptListeningExport(await selected.text(), passphrase);
      if ((collections.length || journal) && !window.confirm('Replace the current tab collections and reflection with the unlocked backup?')) {
        setStatus('Restore canceled. Existing collections and reflection are unchanged.');
        return;
      }
      onRestore(restored);
      setSelected(null);
      clearSecrets();
      setStatus(`Restored ${restored.collections.length} collections in this tab. Nothing was sent to a server.`);
    } catch (e) { setStatus(e instanceof Error ? e.message : 'Unable to unlock backup.'); }
    finally { setBusy(false); }
  };
  return <section className={styles.panel} aria-labelledby="listen-private-title">
    <span className={styles.smallcaps}>PORTABLE · ENCRYPTED · MEMBER-CUSTODIED</span>
    <h2 id="listen-private-title">Keep your listening reflections private</h2>
    <p className={styles.muted}>Create a passphrase-protected backup of your playlists and reflections, or restore one on another device. Audio files and music-service credentials are never included.</p>
    <div className={styles.backupRow}>
      <label htmlFor="listen-private-passphrase">Private passphrase
        <input id="listen-private-passphrase" type="password" autoComplete="off" value={passphrase}
          onChange={e=>setPassphrase(e.target.value)} maxLength={500} placeholder="A memorable, long private phrase" />
      </label>
      <label htmlFor="listen-private-confirm">Repeat to create backup
        <input id="listen-private-confirm" type="password" autoComplete="off" value={confirmPhrase}
          onChange={e=>setConfirmPhrase(e.target.value)} maxLength={500} placeholder="Repeat your passphrase" />
      </label>
    </div>
    <div className={styles.importRow}>
      <button className={styles.addButton} type="button" disabled={busy} onClick={()=>void exportEncrypted()}>
        {busy?'Working…':'Save encrypted backup'}
      </button>
      <label className={styles.fileLabel} htmlFor="listen-private-file">Choose encrypted backup
        <input id="listen-private-file" type="file" accept=".json,application/json"
          onChange={e=>{setSelected(e.currentTarget.files?.[0]||null);e.currentTarget.value='';}} />
      </label>
      <button className={styles.ghost} type="button" disabled={busy||!selected} onClick={()=>void unlock()}>
        Restore with passphrase
      </button>
    </div>
    {selected && <p className={styles.muted}>Selected: {selected.name}. Enter its passphrase above; repeating it is only required when creating a backup.</p>}
    <p role="status" aria-live="polite" className={styles.muted}>{status}</p>
    <p className={styles.quality}>AES-256-GCM · PBKDF2-SHA-256 · 600,000 iterations · local processing only. This review feature is not a synced vault or a substitute for independent recovery.</p>
  </section>;
}
