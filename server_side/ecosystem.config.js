// PM2 Ecosystem Configuration
// This file is used by PM2 to manage the application process
// Update this file if you need to change:
// - Port number
// - Memory limits
// - Number of instances
// - Environment variables
// - Log file locations

module.exports = {
  apps: [{
    name: 'be-smart-server',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};

