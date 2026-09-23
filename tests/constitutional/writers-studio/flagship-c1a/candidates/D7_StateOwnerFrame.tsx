/** C1A-D7 · a frame that owns the held passage. ⛔ Disposable defeat candidate. */
import * as React from 'react';
import { useState } from 'react';
import { WriteFrame, type WriteFrameProps } from '../../../../../app/writers-studio/flagship/WriteFrame';
export function StateOwnerFrame(props: WriteFrameProps) {
  const [held] = useState<{ start: number; end: number } | null>(null);
  void held;
  return <WriteFrame {...props} />;
}
