import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import {
  buildCabinContextPackage,
  serializeCabinContextPackage,
  type CabinContextPackage,
  type CabinContextPackageInput,
} from './contextPackage';

export type CabinContextPackageWriteResult = {
  packagePath: string;
  bytes: number;
  package: CabinContextPackage;
};

function assertAbsolutePackagePath(packagePath: string): string {
  if (typeof packagePath !== 'string' || !path.isAbsolute(packagePath)) {
    throw new Error('CABIN_CONTEXT_PACKAGE_PATH_MUST_BE_ABSOLUTE');
  }
  return packagePath;
}

/**
 * Explicit export seam for an already-governed Context Package.
 *
 * This function does not discover source data. Callers must supply projections
 * that already passed H2.1/H2.2/H2.3. The artifact is replaced by an atomic
 * same-directory rename so readers never observe a partially written JSON file.
 */
export function writeCabinContextPackage(
  packagePath: string,
  input: CabinContextPackageInput = {},
): CabinContextPackageWriteResult {
  const target = assertAbsolutePackagePath(packagePath);
  const packageValue = buildCabinContextPackage(input);

  if (!packageValue) {
    throw new Error('CABIN_CONTEXT_PACKAGE_INVALID');
  }

  const serialized = serializeCabinContextPackage(packageValue);
  const directory = path.dirname(target);
  const stagingPath = path.join(
    directory,
    `.context-package.${process.pid}.${randomUUID()}.tmp`,
  );

  try {
    fs.writeFileSync(stagingPath, serialized, {
      encoding: 'utf8',
      mode: 0o600,
      flag: 'wx',
    });
    fs.renameSync(stagingPath, target);
  } catch (error) {
    try {
      fs.unlinkSync(stagingPath);
    } catch {
      // The failed staging path is best-effort cleanup only.
    }
    throw error;
  }

  return {
    packagePath: target,
    bytes: Buffer.byteLength(serialized, 'utf8'),
    package: packageValue,
  };
}
