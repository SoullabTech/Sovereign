const cron = require("node-cron");
const { repair } = require("./repair");
const { rollback, createRestorePoint } = require("./rollback");
const { sendAlert } = require("./alerts");

class ProductionMonitor {
  constructor() {
    this.baselineMetrics = null;
    this.consecutiveFailures = 0;
    this.repairAttempts = 0;
    this.maxRepairAttempts = 3;
    this.apiEndpoints = [
      { name: "Health", url: "/api/v1/health", timeout: 5000 },
      {
        name: "Personal Oracle",
        url: "/api/v1/personal-oracle/elements",
        timeout: 10000,
      },
      {
        name: "AIN Engine",
        url: "/api/v1/ain-engine/system-status",
        timeout: 8000,
      },
    ];
  }

  async checkEndpoint(endpoint) {
    const startTime = Date.now();
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(
        `${process.env.API_BASE_URL || "http://localhost:3001"}${endpoint.url}`,
        {
          timeout: endpoint.timeout,
          headers:
            endpoint.name === "AIN Engine"
              ? { "X-API-Key": "demo_key_123" }
              : {},
        },
      );

      const latency = Date.now() - startTime;
      const isHealthy = response.ok && latency < endpoint.timeout * 0.8;

      return {
        name: endpoint.name,
        healthy: isHealthy,
        status: response.status,
        latency,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: endpoint.name,
        healthy: false,
        status: 0,
        latency: Date.now() - startTime,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runHealthChecks() {
    console.log("🔍 Running production health checks...");

    const results = await Promise.all(
      this.apiEndpoints.map((endpoint) => this.checkEndpoint(endpoint)),
    );

    const unhealthyEndpoints = results.filter((r) => !r.healthy);
    const avgLatency =
      results.reduce((sum, r) => sum + r.latency, 0) / results.length;

    // Log results
    results.forEach((result) => {
      const status = result.healthy ? &quot;✅" : "❌";
      console.log(
        `${status} ${result.name}: ${result.status} (${result.latency}ms)`,
      );
    });

    return {
      healthy: unhealthyEndpoints.length === 0,
      unhealthyCount: unhealthyEndpoints.length,
      avgLatency,
      results,
      unhealthyEndpoints,
    };
  }

  async analyzeSystemHealth() {
    try {
      // Check memory usage
      const memUsage = process.memoryUsage();
      const memoryIssue = memUsage.heapUsed > memUsage.heapTotal * 0.9;

      // TODO: Add Redis health check
      // TODO: Add database connection check

      return {
        memory: {
          healthy: !memoryIssue,
          usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        },
      };
    } catch (error) {
      console.error("System health check failed:", error);
      return { memory: { healthy: false, error: error.message } };
    }
  }

  shouldTriggerRollback(healthCheck, systemHealth) {
    // Rollback criteria
    const criticalIssues = [
      healthCheck.unhealthyCount >= this.apiEndpoints.length, // All endpoints down
      healthCheck.avgLatency > 10000, // 10s+ latency
      !systemHealth.memory.healthy, // Memory issues
      this.consecutiveFailures >= 5, // 5 consecutive failures
    ];

    return criticalIssues.some((issue) => issue);
  }

  async handleUnhealthySystem(healthCheck, systemHealth) {
    this.consecutiveFailures++;

    const issueType = this.determineIssueType(healthCheck, systemHealth);

    if (this.shouldTriggerRollback(healthCheck, systemHealth)) {
      await sendAlert(
        `CRITICAL SYSTEM FAILURE DETECTED\n` +
          `Unhealthy endpoints: ${healthCheck.unhealthyCount}/${this.apiEndpoints.length}\n` +
          `Average latency: ${Math.round(healthCheck.avgLatency)}ms\n` +
          `Consecutive failures: ${this.consecutiveFailures}\n` +
          `Initiating emergency rollback...`,
        "critical",
      );

      const rollbackSuccess = await rollback(
        "Critical system failure detected by monitoring",
      );

      if (!rollbackSuccess) {
        await sendAlert(
          "ROLLBACK FAILED - MANUAL INTERVENTION REQUIRED",
          "critical",
        );
      } else {
        await sendAlert("Emergency rollback completed successfully", "warning");
        this.consecutiveFailures = 0;
        this.repairAttempts = 0;
      }
      return;
    }

    // Try automated repair
    if (this.repairAttempts < this.maxRepairAttempts) {
      this.repairAttempts++;

      await sendAlert(
        `System health issues detected. Attempting automated repair (${this.repairAttempts}/${this.maxRepairAttempts})\n` +
          `Issue type: ${issueType}\n` +
          `Failed endpoints: ${healthCheck.unhealthyEndpoints.map((e) => e.name).join(&quot;, ")}`,
        "warning",
      );

      const repairSuccess = await repair(issueType);

      if (repairSuccess) {
        console.log("⏱️ Waiting 60 seconds for repair to take effect...");
        setTimeout(() => this.verifyRepair(), 60000);
      }
    } else {
      await sendAlert(
        `Maximum repair attempts exceeded (${this.maxRepairAttempts}). System still unhealthy.`,
        "critical",
      );
    }
  }

  determineIssueType(healthCheck, systemHealth) {
    if (!systemHealth.memory.healthy) return "memory";
    if (healthCheck.avgLatency > 5000) return "database";
    if (healthCheck.unhealthyEndpoints.some((e) => e.name === "AIN Engine"))
      return "rateLimiter";
    return "general";
  }

  async verifyRepair() {
    console.log("🔧 Verifying repair effectiveness...");
    const healthCheck = await this.runHealthChecks();

    if (healthCheck.healthy) {
      await sendAlert("Automated repair successful - system healthy", "info");
      this.consecutiveFailures = 0;
      this.repairAttempts = 0;
    } else {
      console.log("Repair verification failed, continuing monitoring...");
    }
  }

  async monitor() {
    try {
      const healthCheck = await this.runHealthChecks();
      const systemHealth = await this.analyzeSystemHealth();

      if (healthCheck.healthy) {
        this.consecutiveFailures = 0;
        console.log("✅ All systems healthy");

        // Set baseline on first healthy check
        if (!this.baselineMetrics) {
          this.baselineMetrics = {
            avgLatency: healthCheck.avgLatency,
            timestamp: new Date().toISOString(),
          };
          console.log("📊 Baseline metrics established");
        }
      } else {
        console.log(
          `❌ System unhealthy: ${healthCheck.unhealthyCount} endpoints failing`,
        );
        await this.handleUnhealthySystem(healthCheck, systemHealth);
      }
    } catch (error) {
      console.error("Monitor cycle failed:", error);
      await sendAlert(`Monitoring system error: ${error.message}`, "warning");
    }
  }

  start() {
    console.log("🚀 Starting 72-hour post-launch monitoring...");

    // Create initial restore point
    createRestorePoint();

    // Initial health check
    this.monitor();

    // Hour 0-6: Every 15 minutes
    cron.schedule("*/15 * * * *", () => {
      const hoursAfterLaunch =
        (Date.now() - (process.env.LAUNCH_TIMESTAMP || Date.now())) /
        (1000 * 60 * 60);
      if (hoursAfterLaunch <= 6) {
        this.monitor();
      }
    });

    // Hour 6-24: Every 30 minutes
    cron.schedule("*/30 * * * *", () => {
      const hoursAfterLaunch =
        (Date.now() - (process.env.LAUNCH_TIMESTAMP || Date.now())) /
        (1000 * 60 * 60);
      if (hoursAfterLaunch > 6 && hoursAfterLaunch <= 24) {
        this.monitor();
      }
    });

    // Hour 24-72: Every 4 hours
    cron.schedule("0 */4 * * *", () => {
      const hoursAfterLaunch =
        (Date.now() - (process.env.LAUNCH_TIMESTAMP || Date.now())) /
        (1000 * 60 * 60);
      if (hoursAfterLaunch > 24 && hoursAfterLaunch <= 72) {
        this.monitor();
      }
    });

    console.log("📅 Monitoring schedule established for 72 hours");
  }
}

// Initialize and start monitoring
const monitor = new ProductionMonitor();
monitor.start();
