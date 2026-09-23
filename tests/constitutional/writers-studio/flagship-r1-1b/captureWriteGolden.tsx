/** R1-1B · golden of the ordinary flagship Write view at the untouched base. ⛔ Run ONLY at the accepted base; never to bless a change. */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FlagshipWriteView } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import { CONTEXT } from '../flagship-c1b/laws';
export const WRITE_STATES = {
  'write-plain': () => <FlagshipWriteView context={CONTEXT} workTitle="The River Between" workForm={null} focusId="d-2" held={null} onFocus={() => {}} onHold={() => {}} />,
  'write-held-editorial': () => <FlagshipWriteView context={CONTEXT} workTitle="The River Between" workForm={null} focusId="d-2" held={{ sectionId: 'd-2', start: 21, end: 29, text: 'far bank' }} onFocus={() => {}} onHold={() => {}} editorialEnabled />,
} as const;
if (require.main === module) {
  for (const [id, node] of Object.entries(WRITE_STATES)) {
    const html = renderToStaticMarkup(node());
    writeFileSync(join(__dirname, 'golden', `${id}.html`), html);
    console.log(id, html.length);
  }
}
