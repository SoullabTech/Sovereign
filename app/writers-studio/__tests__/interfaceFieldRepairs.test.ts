/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import WriterPreferencesMenu from '@/app/writers-studio/full-redesign/WriterPreferencesMenu';
import { projectPc3LiveWrite } from '@/app/writers-studio/full-redesign/liveWriteAdapter';
import { readStudioReadingSize, setStudioReadingSize } from '@/lib/writersStudio/readingSizePreference';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe('Reading size remains current across visible controls', () => {
  let host: HTMLDivElement;
  let root: Root;
  beforeEach(async () => {
    localStorage.clear();
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(React.createElement(WriterPreferencesMenu)));
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    localStorage.clear();
  });

  it('updates an already mounted Preferences control when View changes the shared reading preference', async () => {
    const control = host.querySelector<HTMLSelectElement>('[aria-label="Reading size preference"]')!;
    expect(control.value).toBe('large');
    await act(async () => setStudioReadingSize('larger'));
    expect(control.value).toBe('larger');
    await act(async () => setStudioReadingSize('largest'));
    expect(control.value).toBe('largest');
  });

  it('writes a direct Preferences selection to the shared reading preference', async () => {
    const control = host.querySelector<HTMLSelectElement>('[aria-label="Reading size preference"]')!;
    await act(async () => {
      control.value = 'largest';
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(readStudioReadingSize()).toBe('largest');
    expect(control.value).toBe('largest');
  });
});

type Section = Parameters<typeof projectPc3LiveWrite>[0]['sections'][number];
const fictionalBody = 'Mara opened the window.\n\nRain tapped the sill.';

function projectHeading(heading: string | null) {
  const section = {
    draftSectionId: 'fictional-section', position: 0, heading,
    headingDepth: null, editable: true, body: fictionalBody,
  } as Section;
  return projectPc3LiveWrite({
    sections: [section], activeId: section.draftSectionId,
    bodyOf: () => fictionalBody, statusOf: () => 'dirty',
    workTitle: 'Window and Rain', manuscriptTitle: null,
  })!;
}

describe('The visible Write identity matches its editable section', () => {
  it.each([null, '', '   '])('labels a headingless section consistently without altering its words (%p)', heading => {
    const projection = projectHeading(heading);
    expect(projection.data.title).toBe('Section 1');
    expect(projection.data.place).toBe('Section 1');
    expect(projection.data.chapters[0].label).toBe('Section 1');
    expect(projection.canonicalBody).toBe(fictionalBody);
  });

  it('retains the actual heading and Work name when present', () => {
    const projection = projectHeading('Chapter 2: Garden');
    expect(projection.data.title).toBe('Chapter 2: Garden');
    expect(projection.data.place).toBe('Chapter 2: Garden');
    expect(projection.data.work).toBe('Window and Rain');
    expect(projection.canonicalBody).toBe(fictionalBody);
  });
});
