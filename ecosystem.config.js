module.exports = {
  apps: [
    {
      name: 'StreamAuto247',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
      exp_backoff_restart_delay: 100,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
