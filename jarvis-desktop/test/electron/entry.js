// Loads the REAL main process, then the walk harness. main.js registers its IPC
// handlers at require time; the harness drives those same registered handlers.
require('../src/main.js');
require(process.env.JARVIS_HARNESS);
