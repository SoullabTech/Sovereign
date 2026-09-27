import { BecomingError, prepareKeep, type SavedRecord, type Session } from '../../lib/becoming/core';
const DB = 'soullab-becoming-preview-v1';
let connection: Promise<IDBDatabase> | undefined;
export function openStore(): Promise<IDBDatabase> {
  if (!connection) connection = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('reflections', { keyPath: 'id' }); };
    req.onsuccess = () => { req.result.onversionchange = () => { req.result.close(); connection = undefined; }; resolve(req.result); };
    req.onerror = () => { connection = undefined; reject(new BecomingError('STORAGE_UNAVAILABLE')); };
    req.onblocked = () => { connection = undefined; reject(new BecomingError('STORAGE_BLOCKED')); };
  });
  return connection;
}
export async function listRecords(): Promise<SavedRecord[]> {
  const db = await openStore(); return new Promise((resolve, reject) => {
    const tx = db.transaction('reflections', 'readonly'); const req = tx.objectStore('reflections').getAll();
    tx.oncomplete = () => resolve((req.result as SavedRecord[]).sort((a,b) => b.current.updatedAt.localeCompare(a.current.updatedAt)));
    tx.onerror = () => reject(new BecomingError('READ_FAILED')); tx.onabort = () => reject(new BecomingError('READ_FAILED'));
  });
}
function changed() { try { const ch = new BroadcastChannel(DB); ch.postMessage('changed'); ch.close(); } catch { /* Focus refresh remains available. */ } }
export function subscribe(callback: () => void): () => void {
  let ch: BroadcastChannel | null = null; try { ch = new BroadcastChannel(DB); ch.onmessage = callback; } catch { /* No synthetic claims of cross-tab notification. */ }
  window.addEventListener('focus', callback); return () => { ch?.close(); window.removeEventListener('focus', callback); };
}
export async function keep(candidate: Session, expectedRevision: number): Promise<Session> {
  const snapshot = structuredClone(candidate); const db = await openStore();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reflections', 'readwrite'); const store = tx.objectStore('reflections');
    const read = store.get(snapshot.id); let result: SavedRecord | undefined; let error: unknown;
    read.onsuccess = () => { try { result = prepareKeep(read.result, snapshot, expectedRevision, new Date().toISOString(), true); store.put(result); } catch (e) { error = e; tx.abort(); } };
    tx.oncomplete = () => { changed(); if (result) resolve(result.current); else reject(new BecomingError('SAVE_FAILED')); };
    tx.onabort = () => reject(error ?? new BecomingError('SAVE_FAILED')); tx.onerror = () => { error ??= new BecomingError('SAVE_FAILED'); };
  });
}
export async function remove(id: string, expectedRevision: number): Promise<void> {
  const db = await openStore(); return new Promise((resolve, reject) => {
    const tx = db.transaction('reflections', 'readwrite'); const store = tx.objectStore('reflections'); const req = store.get(id); let error: unknown;
    req.onsuccess = () => { const rec = req.result as SavedRecord | undefined;
      if (!rec || rec.current.revision !== expectedRevision) { error = new BecomingError('REVISION_CONFLICT'); tx.abort(); } else store.delete(id);
    };
    tx.oncomplete = () => { changed(); resolve(); }; tx.onabort = () => reject(error ?? new BecomingError('DELETE_FAILED')); tx.onerror = () => { error ??= new BecomingError('DELETE_FAILED'); };
  });
}
