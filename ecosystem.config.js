module.exports = {
  apps: [
    {
      name: 'maia-main',
      script: 'npx',
      args: 'next dev -p 3000 -H 0.0.0.0',
      cwd: '/Users/soullab/MAIA-SOVEREIGN',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      error_file: '/Users/soullab/MAIA-SOVEREIGN/logs/maia-main-error.log',
      out_file: '/Users/soullab/MAIA-SOVEREIGN/logs/maia-main-out.log',
      log_file: '/Users/soullab/MAIA-SOVEREIGN/logs/maia-main.log',
      time: true,
      merge_logs: true,
      exec_mode: 'fork',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'maia-labtools',
      script: 'npx',
      args: 'next dev -p 3001 -H 0.0.0.0',
      cwd: '/Users/soullab/MAIA-SOVEREIGN/apps/web',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOST: '0.0.0.0',
        NODE_OPTIONS: ''
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      error_file: '/Users/soullab/MAIA-SOVEREIGN/logs/maia-labtools-error.log',
      out_file: '/Users/soullab/MAIA-SOVEREIGN/logs/maia-labtools-out.log',
      log_file: '/Users/soullab/MAIA-SOVEREIGN/logs/maia-labtools.log',
      time: true,
      merge_logs: true,
      exec_mode: 'fork',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};