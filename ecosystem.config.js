module.exports = {
  apps: [{
    name: 'lobster-admin-api',
    cwd: '/home/autorun/.openclaw/workspace/lobster-admin/backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '../logs/error.log',
    out_file: '../logs/out.log',
    log_file: '../logs/combined.log',
    time: true
  }]
};
