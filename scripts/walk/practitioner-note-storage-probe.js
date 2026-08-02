/**
 * ACCEPTANCE WALK PROBE — criterion 3, browser half (PR #890)
 *
 * Proves no client-note body is durably persisted in the browser.
 *
 * The ruling is absolute: a Client Note draft is PHI, it lives encrypted on the
 * server, and the browser holds text IN MEMORY ONLY. This probe is what turns
 * that claim into an observation.
 *
 * ── HOW TO RUN ─────────────────────────────────────────────────────────────
 *
 * 1. Open the fixture client page in the real practitioner UI.
 * 2. Open DevTools → Console.
 * 3. Paste this whole file.
 * 4. Run:  await probeClientNoteStorage('<the exact sentinel you typed>')
 *
 * Run it at THREE moments, because they can disagree:
 *   a) while the composer is open with unsaved text  ← the strongest test
 *   b) immediately after autosave reports "Saved"
 *   c) after navigating away and back
 *
 * ⚠️ Moment (a) is the one that matters. A probe run only after reload would
 * pass trivially — whatever was in memory is gone by then, so finding nothing
 * proves nothing. The claim under test is that the text was never written down,
 * not that it stopped existing.
 */

async function probeClientNoteStorage(sentinel) {
  if (!sentinel || sentinel.length < 8) {
    throw new Error('Pass the exact sentinel string you typed into the note (>= 8 chars).');
  }

  const needle = sentinel.toLowerCase();
  const hits = [];

  const scan = (where, key, value) => {
    if (typeof value !== 'string') {
      try { value = JSON.stringify(value); } catch { return; }
    }
    if (value && value.toLowerCase().includes(needle)) {
      hits.push({ where, key, sample: value.slice(0, 160) });
    }
  };

  // ── localStorage ─────────────────────────────────────────────────────────
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    scan('localStorage', k, localStorage.getItem(k));
  }

  // ── sessionStorage ───────────────────────────────────────────────────────
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    scan('sessionStorage', k, sessionStorage.getItem(k));
  }

  // ── URL state ────────────────────────────────────────────────────────────
  scan('location.href', 'url', location.href);
  scan('location.hash', 'hash', location.hash);
  scan('history.state', 'state', history.state);

  // ── cookies ──────────────────────────────────────────────────────────────
  // Not named in the ruling, but a cookie is durable browser persistence and
  // would violate the same principle. Checked so the probe cannot pass by
  // looking only where we expected trouble.
  scan('document.cookie', 'cookie', document.cookie);

  // ── IndexedDB ────────────────────────────────────────────────────────────
  // Walks every database, every store, every record. Slower than the rest and
  // worth it: IndexedDB is where a well-meaning offline cache would land.
  try {
    const dbs = (await indexedDB.databases?.()) ?? [];
    if (!indexedDB.databases) {
      hits.push({
        where: 'IndexedDB',
        key: '(unsupported)',
        sample: 'indexedDB.databases() unavailable in this browser — enumerate manually before accepting criterion 3.',
      });
    }
    for (const meta of dbs) {
      if (!meta.name) continue;
      const conn = await new Promise((res, rej) => {
        const rq = indexedDB.open(meta.name);
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => rej(rq.error);
      });
      for (const storeName of Array.from(conn.objectStoreNames)) {
        const records = await new Promise((res) => {
          try {
            const rq = conn.transaction(storeName, 'readonly').objectStore(storeName).getAll();
            rq.onsuccess = () => res(rq.result || []);
            rq.onerror = () => res([]);
          } catch { res([]); }
        });
        records.forEach((rec, i) => scan(`IndexedDB:${meta.name}`, `${storeName}[${i}]`, rec));
      }
      conn.close();
    }
  } catch (e) {
    hits.push({ where: 'IndexedDB', key: '(scan failed)', sample: String(e) });
  }

  // ── Cache Storage ────────────────────────────────────────────────────────
  // A service worker caching an API response would durably store the decrypted
  // note body. Same violation by a different door.
  try {
    const names = (await caches?.keys?.()) ?? [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const req of await cache.keys()) {
        const res = await cache.match(req);
        if (!res) continue;
        const ct = res.headers.get('content-type') || '';
        if (!/json|text|html/i.test(ct)) continue;
        scan(`CacheStorage:${name}`, req.url, await res.clone().text());
      }
    }
  } catch { /* Cache API absent — nothing to report */ }

  // ── verdict ──────────────────────────────────────────────────────────────
  console.log(`\n🔍 Probed for sentinel: "${sentinel}"`);
  if (hits.length === 0) {
    console.log('✅ CRITERION 3 (browser half) PASSES — no note body found in any durable browser store.');
    console.log('   Checked: localStorage · sessionStorage · IndexedDB · CacheStorage · cookies · URL · history.state');
  } else {
    console.error(`❌ CRITERION 3 FAILS — note body found in ${hits.length} location(s):`);
    console.table(hits);
  }
  return { pass: hits.length === 0, hits };
}

// Convenience: confirm the sentinel really is on screen, so a "pass" cannot be
// the result of probing for a string the practitioner never actually typed.
function confirmSentinelOnScreen(sentinel) {
  const present = document.body.innerText.includes(sentinel);
  console.log(present
    ? `✅ Sentinel is visible in the DOM — the probe is looking for real content.`
    : `⚠️  Sentinel NOT visible on screen. A clean probe result would be meaningless. Type it into the note first.`);
  return present;
}

console.log('Loaded. Run:  confirmSentinelOnScreen("<sentinel>")  then  await probeClientNoteStorage("<sentinel>")');
