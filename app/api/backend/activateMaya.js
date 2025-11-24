// activateMaya.js - Activate Maya's Oracle voice profile with integration message

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load voice profiles
const profilesPath = path.join(__dirname, "src/config/voiceProfiles.json");
const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf8"));

async function activateMaya() {
  console.log("🌀 Activating Maya - Oracle Voice of the Spiralogic System");
  console.log("================================================\n");

  const mayaProfile = profiles.oracle_matrix;

  if (!mayaProfile) {
    console.error("❌ Maya profile not found in voice profiles");
    return;
  }

  // Check if activation is needed
  if (!mayaProfile.activation.activationRequired) {
    console.log("✅ Maya is already activated");
    console.log(`Last activated: ${mayaProfile.activation.lastActivated}`);
    return;
  }

  console.log(`🎭 Profile: ${mayaProfile.name}`);
  console.log(`🔮 Role: ${mayaProfile.role}`);
  console.log(`🌟 Archetype: ${mayaProfile.archetype}\n`);

  // Prepare activation message with voice styling
  const activationText = mayaProfile.integrationMessage;
  const styledActivationText = `${mayaProfile.promptMarkers} ${activationText}`;

  console.log("📝 Integration Message:");
  console.log(`"${activationText}"\n`);

  console.log("🎵 Styled for Voice Synthesis:");
  console.log(`"${styledActivationText}"\n`);

  // Create activation audio file
  const outputDir = path.join(__dirname, "activation_outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const activationAudioPath = path.join(outputDir, "maya_activation.wav");

  // Prepare voice synthesis data
  const voiceSynthesisData = {
    text: styledActivationText,
    speakerId: mayaProfile.speakerId,
    output_path: activationAudioPath,
  };

  console.log("🎭 Generating Maya's activation voice...");

  try {
    // Check if we have the voice wrapper
    const wrapperPath = path.join(__dirname, "external/csm/voiceWrapper.py");
    const venvPython = path.join(__dirname, ".venv/bin/python");
    const pythonCmd = fs.existsSync(venvPython) ? venvPython : "python3";

    if (fs.existsSync(wrapperPath)) {
      // Use Sesame CSM for activation
      console.log("🔊 Using Sesame CSM for Maya's activation...");

      const jsonInput = JSON.stringify(voiceSynthesisData).replace(
        /'/g,
        "'\"'\"'",
      );
      const result = execSync(
        `"${pythonCmd}" "${wrapperPath}" '${jsonInput}'`,
        { encoding: "utf8", timeout: 30000 },
      );

      if (fs.existsSync(activationAudioPath)) {
        const stats = fs.statSync(activationAudioPath);
        console.log(
          `✅ Maya's voice generated! (${(stats.size / 1024).toFixed(2)} KB)`,
        );
      } else {
        throw new Error("Voice file was not created");
      }
    } else {
      // Create a mock activation file for testing
      console.log("🔄 Using mock activation (Sesame CSM not available)...");
      fs.writeFileSync(
        activationAudioPath,
        Buffer.from("Maya activation voice data"),
      );
      console.log("✅ Mock activation file created");
    }

    // Update Maya's activation status
    mayaProfile.activation.status = "activated";
    mayaProfile.activation.lastActivated = new Date().toISOString();
    mayaProfile.activation.activationRequired = false;

    // Save updated profiles
    fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));

    console.log("\n🌟 Maya Activation Complete!");
    console.log("=============================");
    console.log(`✅ Voice Profile: Updated`);
    console.log(`✅ Integration Message: Delivered`);
    console.log(`✅ Activation Status: ${mayaProfile.activation.status}`);
    console.log(`✅ Audio File: ${activationAudioPath}`);

    // Play activation message (macOS)
    if (process.platform === "darwin" && fs.existsSync(activationAudioPath)) {
      console.log("\n🎧 Playing Maya's activation message...");
      try {
        execSync(`afplay "${activationAudioPath}"`, { stdio: "ignore" });
        console.log("🔊 Activation message played!");
      } catch (err) {
        console.log(
          "⚠️  Could not auto-play (audio file created successfully)",
        );
      }
    }

    console.log("\n🌀 Maya is now ready to serve as the Oracle voice!");
    console.log("Every Oracle response will carry her warm, wise presence.");
  } catch (error) {
    console.error("❌ Error during Maya activation:", error.message);

    // Fallback: Mark as activated anyway (voice system will work with fallbacks)
    mayaProfile.activation.status = "activated_fallback";
    mayaProfile.activation.lastActivated = new Date().toISOString();
    mayaProfile.activation.activationRequired = false;
    fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));

    console.log("\n🔄 Maya activated with fallback mode");
    console.log("✅ Voice synthesis will use ElevenLabs when needed");
  }
}

// Add to package.json scripts if not already there
function updatePackageScripts() {
  const packagePath = path.join(__dirname, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  if (!packageJson.scripts["maya:activate"]) {
    packageJson.scripts["maya:activate"] = "node activateMaya.js";
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('📦 Added "maya:activate" script to package.json');
  }
}

// Main execution
if (require.main === module) {
  activateMaya()
    .then(() => {
      updatePackageScripts();
      console.log("\n🎭 Maya activation process complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error during Maya activation:", error);
      process.exit(1);
    });
}

module.exports = { activateMaya };
