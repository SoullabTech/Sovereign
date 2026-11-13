import type { DoorwayId } from '@/lib/studios/doorways';
import { pathFromParam } from '@/lib/writersStudio/studioPaths';

/**
 * A Studio doorway may preserve only a known, member-selected local sub-path.
 * Writer paths are exact allowlisted ids; every unknown/cross-Studio value falls
 * back to the Studio's ordinary local destination.
 */
export function doorwayReturnPath(
  studio: DoorwayId,
  studioPath: string,
  selectedPath: string | null | undefined,
): string {
  if (studio !== 'writer') return studioPath;
  const path = pathFromParam(selectedPath);
  return path ? `${studioPath}?path=${encodeURIComponent(path.id)}` : studioPath;
}
