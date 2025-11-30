const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function rollback(reason = "Critical system failure") {
  console.log(`🚨 EMERGENCY ROLLBACK INITIATED: ${reason}`);
  console.log("Rolling back to last stable commit...");

  const rollbackCommands = [
    "git fetch origin",
    'git stash push -m "emergency-rollback-$(date +%s)"',
    "git checkout $(git describe --tags $(git rev-list --tags --max-count=1) 2>/dev/null || git rev-parse HEAD~1)",
    "npm ci --production",
    "pm2 restart all --update-env",
  ];

  try {
    for (const command of rollbackCommands) {
      console.log(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      if (stderr && !stderr.includes("warning")) {
        console.warn(`Warning during rollback: ${stderr}`);
      }
      console.log(`✅ ${command} completed`);
    }

    // Verify rollback success
    const { stdout: status } = await execAsync("pm2 list");
    console.log("PM2 Status after rollback:", status);

    console.log("✅ EMERGENCY ROLLBACK COMPLETED SUCCESSFULLY");
    return true;
  } catch (error) {
    console.error("❌ CRITICAL: Rollback failed!", error.message);
    console.error("Manual intervention required immediately");
    return false;
  }
}

async function createRestorePoint() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await execAsync(
      `git tag -a "stable-${timestamp}" -m "Auto-generated restore point"`,
    );
    console.log(`✅ Restore point created: stable-${timestamp}`);
  } catch (error) {
    console.warn("Could not create restore point:", error.message);
  }
}

module.exports = { rollback, createRestorePoint };
