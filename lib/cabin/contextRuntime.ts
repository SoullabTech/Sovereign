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

type CabinContextRuntimeGlobal = {
  mount: CabinContextMount | null;
  state: CabinContextRuntimeState | null;
};

const CABIN_RUNTIME_GLOBAL_KEY =
  '__SOULLAB_CABIN_CONTEXT_RUNTIME__' as const;

type CabinContextGlobalHost = typeof globalThis & {
  [CABIN_RUNTIME_GLOBAL_KEY]?: CabinContextRuntimeGlobal;
};

function cabinRuntimeGlobal(): CabinContextRuntimeGlobal {
  const host = globalThis as CabinContextGlobalHost;
  if (!host[CABIN_RUNTIME_GLOBAL_KEY]) {
    host[CABIN_RUNTIME_GLOBAL_KEY] = {
      mount: null,
      state: null,
    };
  }
  return host[CABIN_RUNTIME_GLOBAL_KEY]!;
}

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
  const runtime = cabinRuntimeGlobal();
  if (runtime.mount && runtime.state) return runtime.state;

  const packagePath = resolveCabinContextPackagePath(dataPath);
  runtime.mount = createCabinContextMount();

  if (!fs.existsSync(packagePath)) {
    const emptyPackage = buildCabinContextPackage();
    if (!emptyPackage || !runtime.mount.mountSerialized(
      serializeCabinContextPackage(emptyPackage),
    )) {
      runtime.mount = null;
      throw new Error('CABIN_CONTEXT_MOUNT_UNAVAILABLE');
    }

    runtime.state = { state: 'empty', packagePath };
    return runtime.state;
  }

  const serialized = fs.readFileSync(packagePath, 'utf8');
  if (!runtime.mount.mountSerialized(serialized)) {
    runtime.mount = null;
    runtime.state = null;
    throw new Error('CABIN_CONTEXT_PACKAGE_INVALID');
  }

  runtime.state = { state: 'mounted', packagePath };
  return runtime.state;
}

export function cabinContextSnapshot(
  dataPath: string,
): CabinContextPackage {
  initializeCabinContextMount(dataPath);

  const runtime = cabinRuntimeGlobal();
  const snapshot = runtime.mount?.snapshot();
  if (!snapshot) {
    throw new Error('CABIN_CONTEXT_MOUNT_UNAVAILABLE');
  }

  return snapshot;
}

/**
 * Read the current process-global mount without initializing or refreshing it.
 * Experiences use this seam so reading mounted context cannot become a hidden
 * activation act.
 */
export function currentCabinContextRuntime(): {
  state: CabinContextRuntimeState['state'];
  package: CabinContextPackage;
} | null {
  const runtime = cabinRuntimeGlobal();
  if (!runtime.mount || !runtime.state) return null;

  const snapshot = runtime.mount.snapshot();
  if (!snapshot) return null;

  return {
    state: runtime.state.state,
    package: snapshot,
  };
}

/**
 * Test/process teardown seam. It does not write or delete the package artifact.
 */
export function clearCabinContextMount(): void {
  const runtime = cabinRuntimeGlobal();
  runtime.mount?.clear();
  runtime.mount = null;
  runtime.state = null;
}
