import fs from 'fs';
import path from 'path';

/* Design pass 2026-11-05: Home speaks plainly. The return lines were machine phrasing
   ("Your last exact writing place is available."). */
const home = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'), 'utf8');

test('Home says where the writer can pick up, in plain words', () => {
  expect(home).toContain('Pick up where you left off.');
  expect(home).toContain('Open it and carry on.');
  for (const machine of ['exact writing place', 'without inventing a more precise return place']) {
    expect(home).not.toContain(machine);
  }
});
