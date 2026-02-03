const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function repair(issueType = "general") {
  console.log(`🔧 Attempting automated repair for: ${issueType}`);

  const repairCommands = {
    general: ["pm2 restart all", "redis-cli FLUSHALL", "pm2 reload all"],
    memory: [
      "pm2 restart spiralogic-api",
      'node -e "if (global.gc) { global.gc(); }"',
    ],
    redis: ["redis-cli FLUSHDB", "pm2 restart spiralogic-api"],
    database: ["pm2 reload spiralogic-api"],
    rateLimiter: ['redis-cli DEL "rate_limit:*"', "pm2 restart spiralogic-api"],
  };

  const commands = repairCommands[issueType] || repairCommands.general;

  try {
    for (const command of commands) {
      console.log(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      if (stderr) console.warn(`Warning: ${stderr}`);
      console.log(`✅ ${command} completed`);
    }

    console.log("✅ Automated repair sequence completed");
    return true;
  } catch (error) {
    console.error("❌ Repair failed:", error.message);
    return false;
  }
}

module.exports = { repair };
