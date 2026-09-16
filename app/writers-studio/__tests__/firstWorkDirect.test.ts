import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(join(__dirname, '..', 'HomeView.tsx'), 'utf8');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('WS-FIRST-WORK-DIRECT-01 — first writer crosses straight into Write', () => {
  it('the empty-Studio primary act begins an unnamed Work immediately', () => {
    const start = CODE.indexOf('<BeginAndImport\n              primary');
    const end = CODE.indexOf('/>', start);
    const emptyDoor = CODE.slice(start, end);
    expect(start).toBeGreaterThan(-1);
    expect(emptyDoor).toContain("onSubmit={() => void run(() => onBegin(''), BEGIN_FAILED)}");
    expect(emptyDoor).not.toContain('onBegin(draftName.trim())');
  });

  it('the primary button performs submit rather than opening the naming form', () => {
    expect(CODE).toContain('onClick={primary ? onSubmit : onOpen}');
    expect(CODE).toContain('beginning && !primary ? (');
    expect(CODE).toContain("primary && busy ? 'Opening your work…' : 'Begin a new work'");
  });

  it('starting another Work from a populated Studio still offers naming', () => {
    const last = CODE.lastIndexOf('<BeginAndImport');
    const tail = CODE.slice(last, CODE.indexOf('/>', last));
    expect(tail).toContain('primary={false}');
    expect(tail).toContain('onBegin(draftName.trim())');
  });
});
