import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('C7 — existing Work → begin writing without copying materials', () => {
  const controller = read('app/dev/writers-studio-pc3-live/P4R1HomeController.tsx');
  const home = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');

  it('offers Start writing only when the Work has no manuscript expression', () => {
    expect(home).toContain("const hasManuscriptExpression = work.expressions.some((expression) => expression.expressionType === 'manuscript');");
    expect(home).toContain(") : !hasManuscriptExpression ? (");
    expect(home).toContain('Start writing');
  });

  it('tells the member that beginning writing does not consume Work materials', () => {
    expect(home).toContain('Begins a blank writing place. Materials stay where they are.');
  });

  it('uses one Work-scoped server transaction for blank creation and declaration', () => {
    const helperStart = controller.indexOf('const startWritingInWork = useCallback');
    const start = controller.indexOf('const onStartWriting = useCallback');
    const end = controller.indexOf('const onMakeWork = useCallback', start);
    const helper = controller.slice(helperStart, start);
    const slice = controller.slice(start, end);

    expect(helper).toContain("'/api/sovereign/living-works/' + workId + '/start-writing'");
    expect(slice).toContain('await startWritingInWork(workId)');
    expect(slice).not.toContain('/api/sovereign/manuscripts/blank');
    expect(slice).not.toContain('await declare(');
    expect(slice).toContain('await refresh()');
    expect(slice).toContain('open(manuscriptId)');
  });


  it('uses the same atomic Work-scoped start after creating a new Work', () => {
    const start = controller.indexOf('const onBegin = useCallback');
    const end = controller.indexOf('const onStartWriting = useCallback', start);
    const slice = controller.slice(start, end);
    expect(slice).toContain("post('/api/sovereign/living-works'");
    expect(slice).toContain('await startWritingInWork(workId)');
    expect(slice).not.toContain('/api/sovereign/manuscripts/blank');
    expect(slice).not.toContain('await declare(');
  });

  it('keeps explicit Add to Work separate from Start writing', () => {
    const start = controller.indexOf('const onAddToWork = useCallback');
    const end = controller.indexOf('/* HOUSE-STUDIO', start);
    const slice = controller.slice(start, end);
    expect(slice).toContain('await declare(workId, manuscriptId)');
    expect(slice).not.toContain('/start-writing');
  });

  it('does not create another Work or copy Idea/Source content during Start writing', () => {
    const start = controller.indexOf('const onStartWriting = useCallback');
    const end = controller.indexOf('const onMakeWork = useCallback', start);
    const slice = controller.slice(start, end);

    expect(slice).not.toContain("post('/api/sovereign/living-works'");
    expect(slice).not.toContain('member_ideas');
    expect(slice).not.toContain('source_upload');
    expect(slice).not.toContain('/materials');
    expect(slice).not.toContain('idea');
  });

  it('keeps New Work and import affordances visible after a writer already has Works', () => {
    expect(home).toContain('Start or bring a Work');
    expect(home).toContain('New Work');
    expect(home).toContain('Import writing');
    expect(home).toContain('Notes &amp; sources');
    // BEGIN, returning Work, unclaimed writing, and general many-Works Home
    // all keep creation/import affordances available.
    // R10 adds a fifth arrival state (the new-work room), which also keeps the
    // controls visible: every state offers creation/import.
    expect(home.match(/\{creationControls\}/g)?.length).toBe(5);
    expect(home).toContain('data-home-return-work={props.returnWork.id}');
    expect(controller).toContain("import P4R1ImportManuscript from './P4R1ImportManuscript';");
    expect(controller).toContain('onImport={openImport}');
    expect(controller).not.toContain('window.location.assign');
  });
});


it('keeps Start writing available for Works on the shelf, not only the anchor Work', () => {
  const home = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');

  const shelfStart = home.slice(
    home.indexOf('function WorkShelfCard'),
    home.indexOf('function WritingCard'),
  );

  expect(shelfStart).toContain("const hasManuscriptExpression = work.expressions.some");
  expect(shelfStart).toContain("!hasManuscriptExpression");
  expect(shelfStart).toContain("onStartWriting(work.id)");
  expect(shelfStart).toContain("Blank page. Materials stay where they are.");
  expect(shelfStart).not.toContain("/api/sovereign/manuscripts/blank");
  expect(shelfStart).not.toContain("/api/sovereign/living-works");
});
