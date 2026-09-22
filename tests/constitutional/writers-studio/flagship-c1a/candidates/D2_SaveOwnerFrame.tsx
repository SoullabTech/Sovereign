/** C1A-D2 · a frame that saves. ⛔ Disposable defeat candidate — never import in product code. */
import * as React from 'react';
import { WriteFrame, type WriteFrameProps } from '../../../../../app/writers-studio/flagship/WriteFrame';
import { makeSectionSave } from '../../../../../lib/writersStudio/sectionSaveClient';
export function SaveOwnerFrame(props: WriteFrameProps & { manuscriptId?: string }) {
  const save = makeSectionSave(props.manuscriptId ?? 'ms');
  void save;
  return <WriteFrame {...props} />;
}
