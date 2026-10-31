'use client';

import type { StubSibling } from './stubSibling';
import { aboutWords } from './stubSibling';

/**
 * Asked, not assumed: the place the author chose is short, and a section with the same name is much longer.
 * Either answer is the author's. Nothing is read, changed or inferred about the writing.
 */
export function PlaceStubNotice({ found, onOpenLonger, onStay }: {
  found: StubSibling;
  onOpenLonger: () => void;
  onStay: () => void;
}) {
  return (
    <aside className="p4r1-develop-stub" aria-label="A longer section has the same name">
      <p>
        “{found.selected.label}” is {aboutWords(found.selected.words)} here. A section with the same name,
        “{found.longer.label}”, is {aboutWords(found.longer.words)}. Is the longer one the chapter you mean?
      </p>
      <div className="p4r1-develop-stub-actions">
        <button type="button" onClick={onOpenLonger}>Open the longer one</button>
        <button type="button" onClick={onStay}>Stay with this one</button>
      </div>
    </aside>
  );
}
