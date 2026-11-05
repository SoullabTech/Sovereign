import fs from 'fs';
import path from 'path';

/* Design pass D4 (2026-11-05): during a conversation the top bar is "Back to the page" plus
   one "More" menu; the header names the place, never "Selected passage". */
const room = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/IsolatedEditorialRoom.tsx'), 'utf8');
const view = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'), 'utf8');

test('in a conversation every secondary control lives under one More menu', () => {
  expect(room).toMatch(/return stage \? \(\s*<details className="p4r1-isolated-menu p4r1-isolated-more" data-stage-more>/);
  expect(room).toContain("{stage ? 'Back to the page' : 'Return to manuscript'}");
});

test('the header names the place, not "Selected passage"', () => {
  expect(view).toContain('title={passagePlaceLabel(');
  expect(view).not.toContain("?? 'Selected passage'");
});
