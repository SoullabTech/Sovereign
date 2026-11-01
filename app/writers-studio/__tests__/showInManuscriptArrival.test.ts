import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

// "Show me in the manuscript" carries a Develop observation into Write. Holding
// the passage must happen once per arrival: holdPassage sets state and records
// the return place, so an unguarded effect re-held it on every render (an update
// loop that wrote the return place thousands of times).
test('the plain arrival holds the passage once, like the focus arrival', () => {
  const controller = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const start = controller.indexOf('Orientation may legitimately name a whole section');
  const effect = controller.slice(start, controller.indexOf('}, [arrivalInsight, context, requestedSection', start));
  const plain = effect.slice(effect.lastIndexOf('return;\n    }'));

  expect(plain).toContain("'show'");
  expect(plain).toContain('if (focusInsightConsumed.current === showKey) return;');
  expect(plain.indexOf('focusInsightConsumed.current = showKey'))
    .toBeLessThan(plain.indexOf('holdPassage(section'));
});

// The observation and revision layers render outside the Shell, where the theme
// variables are set. Without them the popover resolved var(--fr-panel) to
// transparent and its text to black, so the manuscript showed through.
test('the manuscript overlays carry the theme variables', () => {
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const overlays = view.slice(view.indexOf('data-p4r1-manuscript-overlays') - 200);

  expect(overlays).toContain("display: 'contents', ...appearanceVars(props.appearance)");
  expect(overlays.indexOf('data-p4r1-manuscript-overlays'))
    .toBeLessThan(overlays.indexOf('<ObservationManuscriptLayer'));
});
