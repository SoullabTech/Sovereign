import fs from 'node:fs';
import path from 'node:path';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('Write to MAIA Craftsman’s Table crossing', () => {
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const controller = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const companion = read('app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx');
  const table = read('app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx');

  it('makes the active passage actionable directly from Write', () => {
    expect(view).toContain('Make changes with MAIA');
    expect(view).toContain('props.onEnterCraft()');
    expect(view).toContain('onClick={props.onEnterCraft}');
    expect(controller).toContain('onEnterCraft={() => void enterCraftFromWrite()}');
  });

  it('binds the exact writer selection to the Craft route, never a generic or stale locus', () => {
    expect(controller).toContain('Array.from(liveBody).slice(held.start, held.end).join(\'\') !== held.text');
    expect(controller).toContain('if (!(await settleWriting())) return;');
    expect(controller).toContain("fresh.set('developCraft', '1')");
    expect(controller).toContain('fresh.set(SECTION_PARAM, focusId)');
    expect(controller).toContain('fresh.set(CRAFT_HINT_START, String(held.start))');
    expect(controller).toContain('fresh.set(CRAFT_HINT_END, String(held.end))');
    expect(controller).toContain('canvasWithoutEditorialThread(pathname');
    expect(controller).toContain('router.push(clean)');
  });

  it('does not smuggle prior intelligence into a direct writer-initiated editing scope', () => {
    expect(controller).toContain("fresh.delete('insightAction')");
    expect(controller).toContain('fresh.delete(CRAFT_SOURCE_THREAD)');
    expect(controller).toContain('fresh.delete(CRAFT_SOURCE_MAIA_TURN)');
    expect(controller).toContain('fresh.delete(CRAFT_HINT_START)');
    expect(controller).toContain('fresh.delete(CRAFT_HINT_END)');
  });

  it('reuses the governed conversational and Apply/Undo surfaces', () => {
    expect(view).toContain('<MaiaCraftCompanionR1');
    expect(view).toContain('<CraftsmansTableR1');
    expect(companion).toContain('aria-label="Talk with MAIA about the writing"');
    expect(table).toContain('Apply my version');
    expect(table).toContain('onClick={props.onUndo}');
    expect(controller).toContain('onApply={() => void applySuggested()}');
  });
});
