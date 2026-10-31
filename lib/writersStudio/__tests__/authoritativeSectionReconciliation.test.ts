/** @jest-environment jsdom */
/**
 * Mounted actual boundary/hook/queue with a fictional in-memory save transport.
 * This proves cache and queue behavior, not browser, PostgreSQL or member access.
 */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TextEncoder } from 'node:util';
import RebuildWritingBoundary from '@/app/writers-studio/rebuild/RebuildWritingBoundary';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { CleanSectionObservation, CleanSectionReconciliation, SectionWriting } from '../useSectionWriting';
import type { SaveOutcome } from '../sectionSaveQueue';

const mockSend = jest.fn<Promise<SaveOutcome>, [string, string, number, string | null]>();
jest.mock('@/lib/writersStudio/sectionSaveClient', () => ({ makeSectionSave: () => mockSend }));
jest.mock('@/app/press/manuscript/workingDraftClient', () => ({ AUTOSAVE_DELAY_MS: 10000 }));

const original = 'The fictional lantern beside the river.';
const applied = 'A fictional lantern illuminates the river.';
const neighbor = 'Another section keeps its own words.';
const section = (id: string, body: string, position: number): RebuildSection => ({
  draftSectionId: id, sourceSectionId: null, position, heading: null,
  headingDepth: null, headingSignal: null, body, editable: true,
});

// The digest transport is deliberately synthetic; only digest invalidation and
// per-section ownership are tested. No claim about cryptographic validation.
const fakeDigest = (value: string) => new Uint8Array(32).fill(value.charCodeAt(0) % 256);
const fakeDigestHex = (value: string) => Array.from(fakeDigest(value), (b) => b.toString(16).padStart(2, '0')).join('');

let writing: SectionWriting;
let observation: CleanSectionObservation | null;
let currentSections: RebuildSection[];
let serverVersion: number;
let host: HTMLDivElement;
let root: Root;
let cryptoDescriptor: PropertyDescriptor | undefined;
let encoderDescriptor: PropertyDescriptor | undefined;
const releases: Array<() => void> = [];

async function settle() { for (let n = 0; n < 20; n++) await Promise.resolve(); }
async function render(sections = currentSections, version = 12, manuscriptId = 'fiction-manuscript') {
  currentSections = sections;
  await act(async () => {
    root.render(React.createElement(RebuildWritingBoundary, {
      key: manuscriptId, manuscriptId, version, sections, initialSectionId: 'A', epoch: 0,
      children: (value: SectionWriting) => {
        writing = value;
        return React.createElement('textarea', { 'data-testid': 'visible-body', readOnly: true, value: value.activeBody });
      },
    }));
    await settle();
  });
}
function input(over: Partial<CleanSectionReconciliation> = {}): CleanSectionReconciliation {
  return {
    observation: observation ?? writing.observeCleanSection!('A')!,
    authoritativeRevision: 14,
    authoritativeSections: [
      { id: 'A', body: original, editable: true },
      { id: 'B', body: neighbor, editable: true },
    ], ...over,
  };
}
async function reconcile(value = input()) {
  let result = false;
  await act(async () => { result = writing.reconcileCleanSection?.(value) ?? false; await settle(); });
  return result;
}
async function persistApplied() {
  await act(async () => { writing.edit(applied); writing.flushPending(); await settle(); });
  expect(writing.bodyOf('A')).toBe(applied);
  expect(writing.statusOf('A')).toBe('clean');
  expect(writing.currentRevisionId()).toBe(13);
  observation = writing.observeCleanSection!('A');
  expect(observation).not.toBeNull();
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  currentSections = [section('A', original, 0), section('B', neighbor, 1)];
  serverVersion = 12; observation = null;
  mockSend.mockReset();
  mockSend.mockImplementation(async (_id, body, base) => base === serverVersion
    ? { ok: true, version: ++serverVersion, observedBodySha256: fakeDigestHex(body) }
    : { ok: false, refusal: 'stale_base' });
  cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  encoderDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'TextEncoder');
  Object.defineProperty(globalThis, 'TextEncoder', { configurable: true, value: TextEncoder });
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
    subtle: { digest: jest.fn(async (_algorithm: unknown, bytes: Uint8Array) =>
      new Uint8Array(32).fill(bytes[0] ?? 0).buffer) },
  } });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => {
  releases.splice(0).forEach((release) => release());
  await act(async () => { await settle(); root.unmount(); await settle(); });
  host.remove();
  if (cryptoDescriptor) Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
  if (encoderDescriptor) Object.defineProperty(globalThis, 'TextEncoder', encoderDescriptor);
  else Reflect.deleteProperty(globalThis, 'TextEncoder');
});

describe('authoritative reconciliation of one clean section', () => {
  it('replaces the acknowledged applied cache, renders original words, and does not resave them on section switch', async () => {
    await render(); await persistApplied();
    expect(await reconcile()).toBe(true);
    expect(writing.bodyOf('A')).toBe(original);
    expect(writing.bodyOf('B')).toBe(neighbor);
    expect((host.querySelector('textarea') as HTMLTextAreaElement).value).toBe(original);
    expect(writing.currentRevisionId()).toBe(14);
    expect(writing.hasUnsavedWork()).toBe(false);
    const calls = mockSend.mock.calls.length;
    await act(async () => { writing.goToSection('B'); await settle(); });
    await act(async () => { writing.goToSection('A'); await settle(); });
    expect(writing.activeBody).toBe(original);
    expect(mockSend).toHaveBeenCalledTimes(calls);
  });

  it('works after fresh return without an existing acknowledged local cache', async () => {
    await render([section('A', applied, 0), section('B', neighbor, 1)], 13);
    expect(await reconcile()).toBe(true);
    expect(writing.activeBody).toBe(original);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('retires only the target digest and uses the authoritative revision for the next save', async () => {
    await render(); await persistApplied();
    expect(await reconcile()).toBe(true); serverVersion = 14;
    await act(async () => { writing.edit('New author words'); writing.flushPending(); await settle(); });
    expect(mockSend).toHaveBeenLastCalledWith('A', 'New author words', 14, null);
    await act(async () => { writing.editSection('B', 'New neighboring words'); writing.flushPending(); await settle(); });
    expect(mockSend).toHaveBeenLastCalledWith('B', 'New neighboring words', 15, fakeDigestHex(neighbor));
  });

  it('consumes the captured observation so a replayed readback cannot advance this session again', async () => {
    await render(); await persistApplied();
    const captured = input();
    expect(await reconcile(captured)).toBe(true);
    expect(await reconcile({ ...captured, authoritativeRevision: 15 })).toBe(false);
    expect(writing.currentRevisionId()).toBe(14);
    expect(writing.bodyOf('A')).toBe(original);
  });

  it('does not let a late mount-time digest restore the target observation that Undo retired', async () => {
    let resolveOldDigest: ((value: ArrayBuffer) => void) | undefined;
    const encodedApplied = Array.from(new TextEncoder().encode(applied)).join(',');
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
      subtle: { digest: jest.fn((_algorithm: unknown, bytes: Uint8Array) =>
        Array.from(bytes).join(',') === encodedApplied
          ? new Promise<ArrayBuffer>((resolve) => { resolveOldDigest = resolve; })
          : Promise.resolve(new Uint8Array(32).fill(bytes[0] ?? 0).buffer)) },
    } });
    await render([section('A', applied, 0), section('B', neighbor, 1)], 13);
    expect(resolveOldDigest).toBeDefined();
    expect(await reconcile()).toBe(true);
    await act(async () => { resolveOldDigest!(fakeDigest(applied).buffer as ArrayBuffer); await settle(); });
    serverVersion = 14;
    await act(async () => { writing.edit('Words after protected Undo'); writing.flushPending(); await settle(); });
    expect(mockSend).toHaveBeenLastCalledWith('A', 'Words after protected Undo', 14, null);
  });

  it.each(['A', 'B'])('preserves staged words in section %s and refuses reconciliation', async (id) => {
    await render(); await persistApplied();
    await act(async () => { writing.editSection(id, 'Newer unsaved words'); await settle(); });
    expect(await reconcile()).toBe(false);
    expect(writing.bodyOf(id)).toBe('Newer unsaved words');
    expect(writing.currentRevisionId()).toBe(13);
    expect(writing.statusOf(id)).toBe('dirty');
  });

  it('preserves in-flight and queued text while Undo readback returns', async () => {
    await render(); await persistApplied();
    mockSend.mockImplementationOnce(() => new Promise((resolve) => {
      releases.push(() => resolve({ ok: true, version: 14 }));
    }));
    await act(async () => {
      writing.edit('In-flight newer words'); writing.flushPending();
      writing.editSection('B', 'Queued neighboring words'); writing.flushPending(); await settle();
    });
    expect(await reconcile()).toBe(false);
    expect(writing.bodyOf('A')).toBe('In-flight newer words');
    expect(writing.bodyOf('B')).toBe('Queued neighboring words');
    expect(writing.currentRevisionId()).toBe(13);
  });

  it.each(['stale_base', 'error'])('preserves a %s refusal and its local body', async (refusal) => {
    await render(); await persistApplied();
    mockSend.mockResolvedValueOnce({ ok: false, refusal });
    await act(async () => { writing.edit('Words needing attention'); writing.flushPending(); await settle(); });
    expect(await reconcile()).toBe(false);
    expect(writing.bodyOf('A')).toBe('Words needing attention');
    expect(writing.statusOf('A')).toBe(refusal === 'stale_base' ? 'conflict' : 'error');
    expect(writing.currentRevisionId()).toBe(13);
  });

  it('refuses an acknowledged edit that completed while Undo was pending even if its words equal the earlier body', async () => {
    await render(); await persistApplied();
    await act(async () => { writing.edit(applied); writing.flushPending(); await settle(); });
    expect(writing.currentRevisionId()).toBe(14);
    expect(await reconcile(input({ authoritativeRevision: 15 }))).toBe(false);
    expect(writing.bodyOf('A')).toBe(applied);
    expect(writing.currentRevisionId()).toBe(14);
  });


  it('refuses edit-and-return-to-identical-words even when body-based admission leaves the numeric queue revision unchanged', async () => {
    await render(); await persistApplied();
    mockSend.mockResolvedValueOnce({ ok: true, version: 14, advancesVersion: false });
    await act(async () => { writing.edit(applied); writing.flushPending(); await settle(); });
    expect(writing.currentRevisionId()).toBe(13);
    expect(writing.bodyOf('A')).toBe(applied);
    expect(await reconcile(input({ authoritativeRevision: 15 }))).toBe(false);
    expect(writing.currentRevisionId()).toBe(13);
    expect(writing.bodyOf('A')).toBe(applied);
  });

  it('refuses a captured observation from an earlier mounted manuscript session', async () => {
    await render(); await persistApplied();
    await render([section('A', applied, 0), section('B', neighbor, 1)], 13, 'fiction-other-manuscript');
    expect(await reconcile()).toBe(false);
    expect(writing.bodyOf('A')).toBe(applied);
  });

  it('refuses a changed neighboring server body instead of blessing a stale neighbor with a newer draft revision', async () => {
    await render(); await persistApplied();
    expect(await reconcile(input({ authoritativeRevision: 17, authoritativeSections: [
      { id: 'A', body: original, editable: true },
      { id: 'B', body: 'Changed on another device', editable: true },
    ] }))).toBe(false);
    expect(writing.bodyOf('A')).toBe(applied);
    expect(writing.bodyOf('B')).toBe(neighbor);
    expect(writing.currentRevisionId()).toBe(13);
  });

  it.each([
    { name: 'incomplete', sections: [{ id: 'A', body: original, editable: true }] },
    { name: 'duplicate', sections: [{ id: 'A', body: original, editable: true }, { id: 'A', body: neighbor, editable: true }] },
    { name: 'read-only', sections: [{ id: 'A', body: original, editable: false }, { id: 'B', body: neighbor, editable: true }] },
    { name: 'foreign', sections: [{ id: 'foreign', body: original, editable: true }, { id: 'B', body: neighbor, editable: true }] },
  ])('refuses $name section identity', async ({ sections: authoritativeSections }) => {
    await render(); await persistApplied();
    expect(await reconcile(input({ authoritativeSections }))).toBe(false);
    expect(writing.bodyOf('A')).toBe(applied);
    expect(writing.currentRevisionId()).toBe(13);
  });

  it('refuses a changed target body, missing target and stale authoritative revision', async () => {
    await render(); await persistApplied();
    expect(await reconcile(input({ observation: { ...observation!, body: 'Different captured words' } }))).toBe(false);
    expect(await reconcile(input({ observation: { ...observation!, sectionId: 'missing' } }))).toBe(false);
    expect(await reconcile(input({ authoritativeRevision: 13 }))).toBe(false);
    expect(writing.bodyOf('A')).toBe(applied);
    expect(writing.currentRevisionId()).toBe(13);
  });
});
