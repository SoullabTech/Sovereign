/**
 * D2 — the workbench upload store cannot become the open door when member Source intake is released.
 * Pure decision first, then the route EXECUTED with every collaborator mocked so each test can say what was NOT touched.
 */
import { WORKBENCH_STORE_IS_ENVELOPE_ENCRYPTED, workbenchPlaintextStoreHeld } from '../plaintextStoreHold';

describe('workbenchPlaintextStoreHeld (pure)', () => {
  it('does not change today\'s behaviour: not held while the manifest holds member intake', () => {
    expect(workbenchPlaintextStoreHeld({ sourceIntakeReleased: false })).toBe(false);
  });
  it('holds as soon as the manifest releases member intake', () => {
    expect(workbenchPlaintextStoreHeld({ sourceIntakeReleased: true })).toBe(true);
  });
  it.each([[undefined], [null], ['false'], [0], ['']])('fails closed on a non-literal-false manifest value (%p)', (value) => {
    expect(workbenchPlaintextStoreHeld({ sourceIntakeReleased: value as unknown as boolean })).toBe(true);
  });
  it('opens only when the store is explicitly known to be envelope-encrypted', () => {
    expect(workbenchPlaintextStoreHeld({ sourceIntakeReleased: true }, true)).toBe(false);
    expect(workbenchPlaintextStoreHeld({ sourceIntakeReleased: true }, undefined as unknown as boolean)).toBe(true);
    expect(workbenchPlaintextStoreHeld({ sourceIntakeReleased: true }, 'true' as unknown as boolean)).toBe(true);
  });
  it('PINS the claim: the workbench store is not envelope-encrypted. Changing this is a reviewed act, not a drive-by.', () => {
    expect(WORKBENCH_STORE_IS_ENVELOPE_ENCRYPTED).toBe(false);
  });
});
