import {
  assembleConnectedCabinContextPackage,
  type ConnectedCabinExportAssemblyDeps,
  type ConnectedCabinExportSelection,
} from './connectedExportAssembly';
import {
  writeCabinContextPackage,
  type CabinContextPackageWriteResult,
} from './contextPackageWriter';

export type ConnectedCabinContextExportDeps = {
  assemble: (
    memberId: string,
    selection: ConnectedCabinExportSelection,
    deps?: ConnectedCabinExportAssemblyDeps,
  ) => ReturnType<typeof assembleConnectedCabinContextPackage>;
  write: (
    packagePath: string,
    packageInput: Parameters<typeof writeCabinContextPackage>[1],
  ) => CabinContextPackageWriteResult;
};

const productionDeps: ConnectedCabinContextExportDeps = {
  assemble: assembleConnectedCabinContextPackage,
  write: writeCabinContextPackage,
};

/**
 * Explicit operational seam:
 *
 * H3.4 connected source assembly -> H3.3 artifact writer.
 *
 * This function is intentionally boring. It is the one place where the
 * already-governed in-memory package becomes a portable artifact. It performs
 * no source reads of its own, no selection, no serialization, and no filesystem
 * operations.
 */
export async function exportConnectedCabinContextPackage(
  memberId: string,
  selection: ConnectedCabinExportSelection,
  packagePath: string,
  assemblyDeps?: ConnectedCabinExportAssemblyDeps,
  deps: ConnectedCabinContextExportDeps = productionDeps,
): Promise<CabinContextPackageWriteResult> {
  const packageValue = await deps.assemble(
    memberId,
    selection,
    assemblyDeps,
  );

  return deps.write(packagePath, packageValue);
}
