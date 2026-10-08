import { sourcePostureNotice } from '../sourcePostureNotice';
test.each(['sanctuary','ordinary-unverified','unavailable'] as const)('%s never advertises saving permission',state=>{
  const notice=sourcePostureNotice(state);
  expect(notice.heading).toBe('Materials saving paused');
  expect(notice.detail).not.toMatch(/you can save|saving enabled/i);
});
test('ordinary server posture cannot be confused with upload authorization',()=>{
  expect(sourcePostureNotice('ordinary-unverified').detail).toContain('does not authorize');
});
