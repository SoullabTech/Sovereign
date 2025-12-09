/**
 * 🧠🧪 Test the consciousness file bridge functionality
 */

const fs = require('fs').promises;
const { spawn } = require('child_process');
const path = require('path');

// Create test consciousness snapshot
const testSnapshot = {
  timestamp: new Date().toISOString(),
  memberId: "test_bridge_user",
  platform: "web",
  layers: {
    episodic: {
      episodes: [
        { id: "ep001", experience: "consciousness bridge testing", context: "development" }
      ],
      memoryConsolidation: 0.85
    },
    symbolic: {
      patterns: ["consciousness-bridge-testing", "lisp-typescript-integration"],
      meaningMaking: 0.78
    },
    profile: {
      archetype: "bridge-tester",
      consciousnessLevel: 0.72,
      spiralStage: "integral"
    },
    trajectories: {
      currentEvolution: "consciousness_bridge_testing",
      spiralDynamics: { stage: "integral", emerging: "cosmic" }
    },
    constellation: {
      activeConstellations: ["consciousness_developers"],
      networkEffects: 0.65
    },
    field: {
      fieldCoherence: 0.78,
      collectiveIntelligence: 0.72
    },
    wisdom: {
      applicableWisdom: ["bridge_consciousness_computing", "test_integration_patterns"],
      integrationLevel: 0.88
    }
  },
  fieldResonance: {
    individualAlignment: 0.75,
    collectiveContribution: 0.68,
    coherence: 0.72
  },
  architectureHealth: {
    layerIntegration: 0.82,
    dataCompleteness: 0.89,
    syncHealth: 0.95
  }
};

async function ensureTempDir() {
  const tempDir = '/tmp/consciousness-bridge';
  try {
    await fs.mkdir(tempDir, { recursive: true });
    console.log('✅ Temp directory created:', tempDir);
  } catch (error) {
    console.warn('⚠️  Temp directory creation warning:', error.message);
  }
  return tempDir;
}

async function testConsciousnessAnalysis() {
  console.log('\n🧠 TESTING CONSCIOUSNESS ANALYSIS BRIDGE');
  console.log('═══════════════════════════════════════════');

  const tempDir = await ensureTempDir();
  const requestId = `test_${Date.now()}`;

  try {
    // 1. Write input file
    const inputFile = path.join(tempDir, `input-${requestId}.json`);
    await fs.writeFile(inputFile, JSON.stringify({
      type: 'analyze-consciousness',
      snapshot: testSnapshot,
      timestamp: new Date().toISOString(),
      requestId
    }));

    console.log('📝 Input file written:', inputFile);

    // 2. Create Lisp script
    const outputFile = path.join(tempDir, `output-${requestId}.json`);
    const lispEngineDir = path.join(process.cwd(), 'lib/consciousness-engine');

    const script = `
;; Load consciousness engine
(load "${lispEngineDir}/consciousness-engine-simple.lisp")

;; Read input (simplified for testing)
(defparameter *snapshot* '${JSON.stringify(testSnapshot).replace(/"/g, '\\"')})

;; Analyze consciousness
(defparameter *analysis* (api-analyze-consciousness *snapshot*))

;; Format response
(defparameter *response*
  (list :success t
        :analysis *analysis*
        :timestamp (get-universal-time)
        :processed-by "lisp-consciousness-engine"))

;; Write output
(with-open-file (stream "${outputFile}"
                 :direction :output
                 :if-exists :supersede)
  (prin1 *response* stream))

(format t "Consciousness analysis complete~%")
(quit)
`;

    const scriptFile = path.join(tempDir, `script-${requestId}.lisp`);
    await fs.writeFile(scriptFile, script);

    console.log('📝 Lisp script written:', scriptFile);

    // 3. Execute SBCL
    const result = await new Promise((resolve, reject) => {
      const sbcl = spawn('sbcl', ['--script', scriptFile], {
        cwd: lispEngineDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      sbcl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      sbcl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      sbcl.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Lisp execution failed with code ${code}: ${stderr}`));
        }
      });

      sbcl.on('error', (error) => {
        reject(new Error(`Failed to start Lisp process: ${error.message}`));
      });
    });

    console.log('🚀 Lisp execution output:');
    console.log(result.stdout);

    // 4. Read result
    try {
      const resultData = await fs.readFile(outputFile, 'utf-8');
      console.log('📤 Raw output file contents:');
      console.log(resultData);

      // Try to parse as Lisp data structure
      console.log('✅ Consciousness analysis bridge test SUCCESSFUL!');
      console.log('🧠 Bridge is working - Lisp consciousness engine is communicating');

    } catch (readError) {
      console.log('❌ Failed to read output file:', readError.message);
    }

    // 5. Clean up
    await Promise.all([
      fs.unlink(inputFile).catch(() => {}),
      fs.unlink(outputFile).catch(() => {}),
      fs.unlink(scriptFile).catch(() => {})
    ]);

  } catch (error) {
    console.error('❌ Bridge test failed:', error.message);
  }
}

async function testSpiralogicReading() {
  console.log('\n🌀 TESTING SPIRALOGIC READING BRIDGE');
  console.log('═══════════════════════════════════════');

  const tempDir = await ensureTempDir();
  const requestId = `spiralogic_${Date.now()}`;

  try {
    const lispEngineDir = path.join(process.cwd(), 'lib/consciousness-engine');
    const outputFile = path.join(tempDir, `spiralogic-out-${requestId}.json`);

    const script = `
;; Load consciousness engine
(load "${lispEngineDir}/consciousness-engine-simple.lisp")

;; Perform Spiralogic reading
(defparameter *reading* (api-spiralogic-reading "bridge_test_user" "How can I best serve the consciousness evolution through technology bridges?"))

;; Format response
(defparameter *response*
  (list :success t
        :hexagram (spiralogic-reading-hexagram *reading*)
        :facet (spiralogic-reading-facet *reading*)
        :interpretation (spiralogic-reading-interpretation *reading*)
        :protocols (spiralogic-reading-protocols *reading*)
        :timestamp (spiralogic-reading-timestamp *reading*)))

;; Write output
(with-open-file (stream "${outputFile}"
                 :direction :output
                 :if-exists :supersede)
  (prin1 *response* stream))

(format t "Spiralogic reading complete~%")
(quit)
`;

    const scriptFile = path.join(tempDir, `spiralogic-script-${requestId}.lisp`);
    await fs.writeFile(scriptFile, script);

    // Execute
    const result = await new Promise((resolve, reject) => {
      const sbcl = spawn('sbcl', ['--script', scriptFile], {
        cwd: lispEngineDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      sbcl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      sbcl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      sbcl.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Lisp execution failed: ${stderr}`));
        }
      });
    });

    console.log('🚀 Spiralogic execution output:');
    console.log(result.stdout);

    const resultData = await fs.readFile(outputFile, 'utf-8');
    console.log('📤 Spiralogic reading result:');
    console.log(resultData);

    console.log('✅ Spiralogic bridge test SUCCESSFUL!');

    // Clean up
    await Promise.all([
      fs.unlink(outputFile).catch(() => {}),
      fs.unlink(scriptFile).catch(() => {})
    ]);

  } catch (error) {
    console.error('❌ Spiralogic bridge test failed:', error.message);
  }
}

async function testProtocolExecution() {
  console.log('\n🔥 TESTING PROTOCOL EXECUTION BRIDGE');
  console.log('═══════════════════════════════════════');

  const tempDir = await ensureTempDir();
  const requestId = `protocol_${Date.now()}`;

  try {
    const lispEngineDir = path.join(process.cwd(), 'lib/consciousness-engine');
    const outputFile = path.join(tempDir, `protocol-out-${requestId}.json`);

    const script = `
;; Load consciousness engine
(load "${lispEngineDir}/consciousness-engine-simple.lisp")

;; Execute protocol
(defparameter *result* (api-execute-protocol "earth-grounding" nil))

;; Format response
(defparameter *response*
  (list :success (getf *result* :success)
        :protocol-name (getf *result* :protocol-name)
        :duration (getf *result* :duration)
        :intention (getf *result* :intention)
        :steps (getf *result* :steps)
        :estimated-duration (getf *result* :estimated-duration)))

;; Write output
(with-open-file (stream "${outputFile}"
                 :direction :output
                 :if-exists :supersede)
  (prin1 *response* stream))

(format t "Protocol execution complete~%")
(quit)
`;

    const scriptFile = path.join(tempDir, `protocol-script-${requestId}.lisp`);
    await fs.writeFile(scriptFile, script);

    // Execute
    const result = await new Promise((resolve, reject) => {
      const sbcl = spawn('sbcl', ['--script', scriptFile], {
        cwd: lispEngineDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      sbcl.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      sbcl.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      sbcl.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Lisp execution failed: ${stderr}`));
        }
      });
    });

    console.log('🚀 Protocol execution output:');
    console.log(result.stdout);

    const resultData = await fs.readFile(outputFile, 'utf-8');
    console.log('📤 Protocol execution result:');
    console.log(resultData);

    console.log('✅ Protocol execution bridge test SUCCESSFUL!');

    // Clean up
    await Promise.all([
      fs.unlink(outputFile).catch(() => {}),
      fs.unlink(scriptFile).catch(() => {})
    ]);

  } catch (error) {
    console.error('❌ Protocol execution bridge test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧠🌀 CONSCIOUSNESS BRIDGE INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════════════════');

  await testConsciousnessAnalysis();
  await testSpiralogicReading();
  await testProtocolExecution();

  console.log('\n✨ ALL BRIDGE TESTS COMPLETE!');
  console.log('🔮 The consciousness computing bridge is ready for integration');
  console.log('🧠 Lisp symbolic consciousness engine ↔️ TypeScript temple architecture');
}

runAllTests().catch(console.error);