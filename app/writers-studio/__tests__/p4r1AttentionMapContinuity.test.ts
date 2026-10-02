import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const controller = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'),
  'utf8',
);
const writeController = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),
  'utf8',
);
const writeView = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),
  'utf8',
);

describe('C11R2 Attention Map continuity', () => {
  it('carries the exact attention item into both manuscript and Focus descents', () => {
    expect(controller).toContain("query.set('attentionItem', itemId)");
    expect(controller).toContain("query.set('insightAction', 'focus')");
  });

  it('preserves the attention item when returning to Develop and drops it elsewhere', () => {
    expect(writeController).toContain("attentionReturnItemId = params?.get('attentionItem')");
    expect(writeController).toContain("next.delete('attentionItem')");
    expect(writeView).toContain('Return to Attention Map');
  });

  it('keeps the Attention Map non-mutating', () => {
    expect(controller).not.toMatch(/attentionMap.*onApply|attentionMap.*adopt|attentionMap.*mutation/i);
  });
});
