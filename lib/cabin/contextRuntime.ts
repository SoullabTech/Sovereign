import fs from 'node:fs';
import path from 'node:path';
import {
  buildCabinContextPackage,
  serializeCabinContextPackage,
  type CabinContextPackage,
} from './contextPackage';
import {
  createCabinContextMount,
  type CabinContextMount,
} from './contextMount';

export const CABIN_CONTEXT_PACKAGE_FILENAME = 'context-package.json';
export const CABIN_CONTEXT_PACKAGE_PATH_ENV = 'MAIA_CABIN_CONTEXT_PACKAGE_PATH';

export type CabinContextRuntimeState = {
  state: 'empty' | 'mounted';
  packagePath: string;
};

let runtimeMount: CabinContextMount | null = null;
let runtimeState: CabinContextRuntimeState | null = null;

/**
 * Resolve the explicit package artifact path used by the local Cabin runtime.
 *
 * The package is an artifact on disk; the mount remains ephemeral process
 * state. This function never creates, writes, or mutates the artifact.
 */
export function resolveCabinContextPackagePath(
  dataPath: string,
  explicitPath = process.env[CABIN_CONTEXT_PACKAGE_PATH_ENV],
): string {
  if (!dataPath) throw new Error('CABIN_DATA_UNAVAILABLE');

  const candidate =
    explicitPath && explicitPath.trim().length > 0
      ? explicitPath.trim()
      : path.join(path.dirname(dataPath), CABIN_CONTEXT_PACKAGE_FILENAME);

  if (!path.isAbsolute(candidate)) {
    throw new Error('CABIN_CONTEXT_PACKAGE_PATH_MUST_BE_ABSOLUTE');
  }

  return candidate;
}

/**
 * Initialize the local runtime mount exactly once per server process.
 *
 * Missing package = truthful empty context.
 * Present but invalid package = fail closed.
 */
export function initializeCabinContextMount(
  dataPath: string,
): CabinContextRuntimeState {
  if (runtimeMount && runtimeState) return runtimeState;

  const packagePath = resolveCabinContextPackagePath(dataPath);
  runtimeMount = createCabinContextMount();

  if (!fs.existsSync(packagePath)) {
    const emptyPackage = buildCabinContextPackage();
    if (!emptyPackage || !runtimeMount.mountSerialized(
      serializeCabinContextPackage(emptyPackage),
    )) {
      runtimeMount = null;
      throw new Error('CABIN_CONTEXT_MOUNT_UNAVAILABLE');
    }

    runtimeState = { state: 'empty', packagePath };
    return runtimeState;
  }

  const serialized = fs.readFileSync(packagePath, 'utf8');
  if (!runtimeMount.mountSerialized(serialized)) {
    runtimeMount = null;
    runtimeState = null;
    throw new Error('CABIN_CONTEXT_PACKAGE_INVALID');
  }

  runtimeState = { state: 'mounted', packagePath };
  return runtimeState;
}

export function cabinContextSnapshot(
  dataPath: string,
): CabinContextPackage {
  initializeCabinContextMount(dataPath);

  const snapshot = runtimeMount?.snapshot();
  if (!snapshot) {
    throw new Error('CABIN_CONTEXT_MOUNT_UNAVAILABLE');
  }

  return snapshot;
}

/**
 * Test/process teardown seam. It does not write or delete the package artifact.
 */
export function clearCabinContextMount(): void {
  runtimeMount?.clear();
  runtimeMount = null;
  runtimeState = null;
}
