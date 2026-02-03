// Activate PSI → AIN Memory Bridge
const { setPsiEpisodeWriter } = require('./dist/services/psiMemoryBridge.js');
const { dualPsiEpisodeWriter } = require('./dist/services/psiAinAdapter.js');

// Wire PSI episodes to flow into AIN memory store
setPsiEpisodeWriter(dualPsiEpisodeWriter);

console.log('🌉 PSI → AIN Memory Bridge Activated');
console.log('   Episodes will now flow to:');
console.log('   ✓ JSONL logs (backup/analysis)');
console.log('   ✓ AIN Memory Store (integration)');
console.log('   ✓ Searchable via existing memory APIs');