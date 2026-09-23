/** R1-1B-D14 · a live view that falls back to the controlled fixture. ⛔ Disposable. */
import * as React from 'react';
import { REVIEW } from '../../../../../scripts/witness/flagship/fixtures';
export function FixtureFallbackView() { return <div data-fixture={REVIEW.work} />; }
