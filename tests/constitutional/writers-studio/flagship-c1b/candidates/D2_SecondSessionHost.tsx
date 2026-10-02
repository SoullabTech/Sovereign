/** C1B-D2 · a host that mints its own writing session beside the boundary. ⛔ Disposable. */
import * as React from 'react';
import { useSectionWriting } from '../../../../../lib/writersStudio/useSectionWriting';
import { makeSectionSave } from '../../../../../lib/writersStudio/sectionSaveClient';
export function SecondSessionHost({ manuscriptId }: { manuscriptId: string }) {
  const writing = useSectionWriting([], 1, makeSectionSave(manuscriptId), `${manuscriptId}:second`, null);
  return <div data-second-session={writing.activeId ?? ''} />;
}
