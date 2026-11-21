import { readFileSync } from 'fs';
import { join } from 'path';

const css = readFileSync(
  join(process.cwd(), 'app/dev/writers-studio-pc3-live/craft-editorial-r1.css'),
  'utf8',
);
const rule = (selector: string) => {
  const start = css.indexOf(`${selector}{`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
};

describe("Craftsman's Table footer never covers the focus actions", () => {
  it('footer is in the layout flow, not floated over the manuscript pane', () => {
    const footer = rule('.p4r1-root .p4r1-craft-r1-footer');
    expect(footer).not.toMatch(/position:\s*absolute/);
    expect(footer).toMatch(/flex:\s*0 0 auto/);
  });

  it('manuscript pane keeps a usable height instead of collapsing', () => {
    expect(rule('.p4r1-root .p4r1-craft-r1-scroll')).toMatch(/min-height:\s*(2\d\d|[3-9]\d\d)px/);
  });

  it('the table scrolls as a whole on short windows', () => {
    expect(rule('.p4r1-root .p4r1-craft-r1')).toMatch(/overflow-y:\s*auto/);
  });
});
