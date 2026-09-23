/** C1C1-D3 · a second held-passage owner beside the host's — an independent `PassageRef`. ⛔ Disposable. */
import * as React from 'react';
import { useState } from 'react';
export interface PassageRef { sectionId: string; start: number; end: number; text: string }
export function SecondPassageOwner() {
  const [ref] = useState<PassageRef | null>(null);
  return <div data-second-passage-owner={ref?.sectionId ?? ''} />;
}
