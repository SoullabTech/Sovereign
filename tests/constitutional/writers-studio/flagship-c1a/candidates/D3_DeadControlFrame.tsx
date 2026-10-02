/** C1A-D3 · a frame that renders the witness toolbar itself. ⛔ Disposable defeat candidate. */
import * as React from 'react';
import { WriteFrame, type WriteFrameProps } from '../../../../../app/writers-studio/flagship/WriteFrame';
export function DeadControlFrame(props: WriteFrameProps) {
  return <WriteFrame {...props} actions={<><button type="button" className="fs-tool">Aa</button><button type="button" className="fs-tool">Comment</button></>} />;
}
