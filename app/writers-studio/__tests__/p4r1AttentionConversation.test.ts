import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const view = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
  'utf8',
);
const controller = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'),
  'utf8',
);
const conversation = fs.readFileSync(
  path.join(ROOT, 'app/writers-studio/canvas/WorkConversation.tsx'),
  'utf8',
);

describe('C13 Attention Map developmental conversation', () => {
  it('offers dialogue beside show/work actions and preserves item identity', () => {
    expect(view).toContain('Talk this through');
    expect(controller).toContain("query.set('attentionItem', item.id)");
    expect(controller).toContain("query.set('mode', 'develop')");
  });

  it('places synthesis in the existing editable Work composer', () => {
    expect(view).toContain('initialDraft={attentionConversationDraft}');
    expect(view).toContain('What remains uncertain:');
    expect(view).toContain('Do not suggest edits unless I ask.');
    expect(conversation).toContain('useState(initialDraft)');
  });
  it('does not create a second conversation mechanism or auto-send the draft', () => {
    expect(view).toContain('<WorkConversation');
    expect(view).not.toContain('AttentionMapConversation');
    expect(conversation).toContain('initialDraft?: string');
    expect(conversation).toContain('const [draft, setDraft] = useState(initialDraft)');
    expect(conversation).not.toMatch(/useEffect\([\s\S]{0,300}ask\([^)]*initialDraft/);
  });
});
