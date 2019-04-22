module.exports = {
  apps : [{
    name: 'node-image-proxy',
    script: 'bin/www',
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch: ['public', 'node_modules'],
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: {
      DEBUG: '*',
      DEBUG_HIDE_DATE: true,
      DEBUG_COLORS: true,
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};
