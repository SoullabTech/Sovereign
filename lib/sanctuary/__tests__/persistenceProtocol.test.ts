import { decideSourcePersistence, resolveTransition, type PersistEvidence } from '../persistenceProtocol';
const ordinary: PersistEvidence = {
  sessionAuthenticated: true, sessionActive: true,
  posture: 'ordinary', exclusivePersistenceLease: true,
  leaseRevision: 4n, postureRevision: 4n,
};
test('allows only a matched server-owned ordinary lease', () => {
  expect(decideSourcePersistence(ordinary)).toBe('allow');
});
test.each([
  ['unauthenticated', { sessionAuthenticated: false }],
  ['expired or revoked', { sessionActive: false }],
  ['sanctuary', { posture: 'sanctuary' }],
  ['unresolved', { posture: 'unresolved' }],
  ['no exclusive lease', { exclusivePersistenceLease: false }],
  ['absent lease revision', { leaseRevision: null }],
  ['absent posture revision', { postureRevision: null }],
  ['raced transition', { postureRevision: 5n }],
] as const)('%s refuses content persistence', (_label, change) => {
  expect(decideSourcePersistence({ ...ordinary, ...change })).toBe('refuse');
});
test('uncommitted exit from Sanctuary never authorizes writes', () => {
  expect(resolveTransition('sanctuary', 'ordinary', false)).toBe('sanctuary');
  expect(resolveTransition('ordinary', 'ordinary', false)).toBe('unresolved');
  expect(resolveTransition('sanctuary', 'ordinary', true)).toBe('ordinary');
  expect(resolveTransition('ordinary', 'sanctuary', true)).toBe('sanctuary');
});
