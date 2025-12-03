// MAIA Sovereign PM2 Ecosystem Configuration
// Fail-proof process management for solo developer operations

module.exports = {
  apps: [
    {
      name: "maia-production",
      script: "npm",
      args: "run start",
      cwd: "/Users/soullab/MAIA-SOVEREIGN",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "./logs/production-error.log",
      out_file: "./logs/production-out.log",
      log_file: "./logs/production-combined.log",
      time: true,
      restart_delay: 5000,
      max_restarts: 5,
      min_uptime: "10s"
    },
    {
      name: "maia-staging",
      script: "npm",
      args: "run start",
      cwd: "/Users/soullab/MAIA-SOVEREIGN",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "staging",
        PORT: 3010
      },
      env_file: ".env.staging",
      error_file: "./logs/staging-error.log",
      out_file: "./logs/staging-out.log",
      time: true,
      restart_delay: 3000
    },
    {
      name: "maia-development",
      script: "npm",
      args: "run dev",
      cwd: "/Users/soullab/MAIA-SOVEREIGN",
      instances: 1,
      exec_mode: "fork",
      watch: ["app", "lib", "components"],
      ignore_watch: ["node_modules", ".next", "logs", "backups"],
      env: {
        NODE_ENV: "development",
        PORT: 3005
      },
      error_file: "./logs/dev-error.log",
      out_file: "./logs/dev-out.log",
      time: true
    },
    {
      name: "soulguard",
      script: "soulguard/soulguard.py",
      interpreter: "python3",
      cwd: "/Users/soullab/MAIA-SOVEREIGN",
      instances: 1,
      watch: false,
      env: {
        PYTHONPATH: "/Users/soullab/MAIA-SOVEREIGN",
        SOULGUARD_MODE: "archetypal"
      },
      error_file: "./logs/soulguard-error.log",
      out_file: "./logs/soulguard-out.log",
      time: true,
      restart_delay: 10000,
      max_restarts: 3,
      min_uptime: "30s"
    },
    {
      name: "maia-health-monitor",
      script: "scripts/maia-health-monitor.sh",
      interpreter: "bash",
      cwd: "/Users/soullab/MAIA-SOVEREIGN",
      instances: 1,
      watch: false,
      cron_restart: "*/5 * * * *", // Every 5 minutes
      error_file: "./logs/health-monitor-error.log",
      out_file: "./logs/health-monitor-out.log",
      time: true
    },
    {
      name: "maia-backup-daemon",
      script: "scripts/maia-auto-backup.sh",
      interpreter: "bash",
      cwd: "/Users/soullab/MAIA-SOVEREIGN",
      instances: 1,
      watch: false,
      cron_restart: "0 3 * * *", // Daily at 3 AM
      error_file: "./logs/backup-daemon-error.log",
      out_file: "./logs/backup-daemon-out.log",
      time: true
    }
  ],

  deploy: {
    production: {
      user: "soullab",
      host: ["localhost"],
      ref: "origin/main",
      repo: "/Users/soullab/MAIA-SOVEREIGN",
      path: "/Users/soullab/MAIA-SOVEREIGN",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save"
    },
    staging: {
      user: "soullab",
      host: ["localhost"],
      ref: "origin/develop",
      repo: "/Users/soullab/MAIA-SOVEREIGN",
      path: "/Users/soullab/MAIA-SOVEREIGN",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env staging"
    }
  }
};