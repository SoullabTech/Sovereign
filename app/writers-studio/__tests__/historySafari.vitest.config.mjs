import base from './studioPanelControls.vitest.config.mjs';
export default {...base,css:{postcss:{plugins:[]}},test:{...base.test,include:[
  ...base.test.include,
  'app/writers-studio/__tests__/manuscriptHistory.test.tsx',
  'lib/writersStudio/__tests__/historyActions.test.ts',
  'lib/writersStudio/__tests__/sectionSaveQueue.test.ts',
  'lib/writersStudio/listen/__tests__/*.test.ts',
]}};
