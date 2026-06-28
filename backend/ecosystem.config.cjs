module.exports = {
  apps: [
    {
      name: 'quantum-signal-api',
      script: 'npx',
      args: 'tsx backend/src/server.ts',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      time: true,
    },
  ],
};
