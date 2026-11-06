import fs from 'fs';
import path from 'path';

/* Develop design pass (founder go-ahead 2026-11-05): MAIA asks once to read; her own
   observation comes first; one next step leads into the conversation. */
const view = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
const field = view.slice(view.indexOf('function ReadingField('), view.indexOf('function ThemeField('));

test('MAIA asks once, with the button, instead of three blocks and a link', () => {
  expect(view).toContain('I haven’t read {scopeName(props.scope)} yet. Shall I read it now?');
  expect(view).toMatch(/data-develop-read-now[\s\S]*?onClick=\{props\.onCommission\}/);
  expect(view).not.toContain('I don’t have a saved reading for this question yet.');
});

test('a changed draft is saved only by the writer’s own press, offered right where they asked', () => {
  expect(view).toMatch(/props\.commissionNeedsCheckpoint \? \([\s\S]*?data-develop-save-and-read[\s\S]*?onClick=\{props\.onCheckpointAndCommission\}/);
  expect(view).not.toContain('since its last reading snapshot');
});

test('her own observation comes first; the template lead is gone from the card', () => {
  const said = field.indexOf('<p>{observation.observation}</p>');
  const actions = field.indexOf('p4r1-discovery-actions');
  expect(said).toBeGreaterThan(-1);
  expect(said).toBeLessThan(actions);
  expect(field).not.toContain('{friendly.lead}');
  expect(field).not.toContain('You do not have to decide what this means alone');
});

test('one next step leads into the conversation; the rest waits under More', () => {
  const actions = field.slice(field.indexOf('p4r1-discovery-actions'), field.indexOf('data-develop-observation-more'));
  expect(actions).toContain('Talk about this passage');
  expect(actions).not.toContain('Help me understand');
  expect(actions).not.toContain('Go deeper');
  const more = field.slice(field.indexOf('data-develop-observation-more'));
  expect(more).toContain('Help me understand');
  expect(more).toContain('What this rests on');
});
