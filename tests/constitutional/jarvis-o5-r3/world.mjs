/**
 * JARVIS O5-R3 — a deterministic model world for the writer-lease falsifiers.
 *
 * It models only what the lease law is about: one delegation home, processes
 * that can be spawned, killed or have their pid reused, a liveness probe, and
 * filesystem primitives with EXPLICIT atomicity:
 *
 *   createExclusive(path, bytes)   atomic create-if-absent (O_EXCL)
 *   swap(path, expected, next)     atomic compare-and-swap (rename over a verified read)
 *   remove(path, expected)         atomic compare-and-remove
 *   write(path, bytes)             plain overwrite, NOT atomic with any prior read
 *   append(path, bytes, {calls})   one write call per invocation (a torn write is modelled separately)
 *
 * `tick()` yields to other pending async work. A candidate that reads, ticks,
 * then writes has a real interleaving window, exactly as a filesystem round
 * trip has; this is how the race falsifiers become buildable. JavaScript is
 * single-threaded, so this models the race; it does not prove OS atomicity.
 * The build owes a real two-process witness (see the census record).
 *
 * ⛔ This is a test world, not an implementation, and never a seed for one.
 */
export const LEASE = 'home/writer.lease';
export const LEDGER = 'home/work-units-v2/execution-grants/wu-o5r3.jsonl';

export function makeWorld({ host = 'studio', probeUndeterminable = false } = {}) {
  const files = new Map();
  const procs = new Map();
  const writes = [];
  const key = (h, pid) => `${h}:${pid}`;
  const world = {
    host,
    files,
    writes,
    probeUndeterminable,
    tick: () => new Promise((r) => setImmediate(r)),
    spawn(pid, start_time, h = host) {
      procs.set(key(h, pid), { start_time });
      return { pid, start_time, host: h };
    },
    kill(p) { procs.delete(key(p.host, p.pid)); },
    /** Liveness as the local host can observe it. A remote pid is unobservable. */
    probe(h, pid) {
      if (world.probeUndeterminable) return { state: 'UNDETERMINABLE' };
      if (h !== host) return { state: 'UNDETERMINABLE' };
      const p = procs.get(key(h, pid));
      return p ? { state: 'ALIVE', start_time: p.start_time } : { state: 'GONE' };
    },
    /** A local-only probe that ignores the host: what a naive `kill(pid, 0)` answers. */
    probeLocalPidOnly(pid) {
      const p = procs.get(key(host, pid));
      return p ? { state: 'ALIVE', start_time: p.start_time } : { state: 'GONE' };
    },
    fs: {
      read: (p) => (files.has(p) ? files.get(p) : null),
      exists: (p) => files.has(p),
      createExclusive(p, bytes) {
        if (files.has(p)) return false;
        files.set(p, bytes);
        return true;
      },
      swap(p, expected, next) {
        if (files.get(p) !== expected) return false;
        files.set(p, next);
        return true;
      },
      remove(p, expected) {
        if (!files.has(p) || files.get(p) !== expected) return false;
        files.delete(p);
        return true;
      },
      write(p, bytes) { files.set(p, bytes); },
      append(p, bytes) {
        writes.push({ path: p, bytes });
        files.set(p, (files.get(p) ?? '') + bytes);
      },
    },
  };
  return world;
}

/** The ledger's committed events, read without a lease (JSON lines). */
export function ledgerLines(world) {
  const text = world.fs.read(LEDGER) ?? '';
  return text.split('\n').filter(Boolean);
}
