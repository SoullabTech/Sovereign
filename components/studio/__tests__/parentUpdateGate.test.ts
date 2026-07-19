/**
 * Bug B — UI contract guard (source-level).
 *
 * The full test env has no jsdom/RTL, so rather than render the component this
 * guards the two structural facts that keep Parent Update off scribe reviews:
 *  1. SessionReviewChat gates BOTH the button and the drawer on
 *     `parentUpdateSupported`, which defaults to false.
 *  2. The only production caller (the Session Room page) does NOT pass
 *     `parentUpdateSupported`, so the control is absent on ordinary scribe
 *     reviews and would only ever appear via an explicit, intentional opt-in.
 * A regression that wired Parent Update on by default would fail here.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..', '..');
const component = readFileSync(join(root, 'components/studio/SessionReviewChat.tsx'), 'utf8');
const sessionRoomPage = readFileSync(join(root, 'app/studio/session-room/page.tsx'), 'utf8');

describe('Parent Update gating', () => {
  it('component defaults parentUpdateSupported to false', () => {
    expect(component).toMatch(/parentUpdateSupported\s*=\s*false/);
  });

  it('component gates the Parent Update button on the flag', () => {
    // Between the guard and the label sits a long className + <Send/> icon.
    expect(component).toMatch(/parentUpdateSupported\s*&&[\s\S]{0,500}Parent Update/);
  });

  it('component gates the ParentUpdateDrawer mount on the flag', () => {
    expect(component).toMatch(/parentUpdateSupported\s*&&[\s\S]{0,120}ParentUpdateDrawer/);
  });

  it('the Session Room caller does NOT enable Parent Update', () => {
    // It renders SessionReviewChat but must not pass parentUpdateSupported.
    expect(sessionRoomPage).toMatch(/SessionReviewChat/);
    expect(sessionRoomPage).not.toMatch(/parentUpdateSupported/);
  });
});
