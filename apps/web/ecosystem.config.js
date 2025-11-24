module.exports = {
  apps: [{
    name: 'maia-sovereign',
    script: 'npm',
    args: 'start',
    cwd: '/Users/soullab/MAIA-PAI/apps/web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }, {
    name: 'cloudflare-tunnel',
    script: 'cloudflared',
    args: 'tunnel run maia-sovereign',
    autorestart: true,
    watch: false,
    error_file: './logs/tunnel-error.log',
    out_file: './logs/tunnel-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
