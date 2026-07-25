module.exports = {
  apps: [
    {
      name: 'StreamAuto247',
      script: 'npm',
      args: 'start',
      instances: 1, // Only 1 instance to avoid port collisions and multiple FFmpeg spawns
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true
    }
  ]
};
