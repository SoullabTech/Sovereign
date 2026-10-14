import base from './studioPanelControls.vitest.config.mjs';
export default {
  ...base,
  test: {
    ...base.test,
    include: ['lib/writersStudio/listen/__tests__/*.test.ts'],
  },
};
