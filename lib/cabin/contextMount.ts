import {
  parseCabinContextPackage,
  type CabinContextPackage,
} from './contextPackage';

export type CabinContextMount = {
  mountSerialized(serialized: string): boolean;
  snapshot(): CabinContextPackage | null;
  clear(): void;
};

/**
 * Ephemeral runtime holder for a validated Cabin Context Package.
 *
 * This is intentionally not a provider, store, cache, or source of truth.
 * It owns only a defensive runtime copy of an already-governed package.
 */
export function createCabinContextMount(): CabinContextMount {
  let mounted: CabinContextPackage | null = null;

  return {
    mountSerialized(serialized: string): boolean {
      const parsed = parseCabinContextPackage(serialized);
      if (!parsed) return false;

      mounted = structuredClone(parsed);
      return true;
    },

    snapshot(): CabinContextPackage | null {
      return mounted ? structuredClone(mounted) : null;
    },

    clear(): void {
      mounted = null;
    },
  };
}
