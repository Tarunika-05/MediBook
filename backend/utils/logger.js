const pino = require('pino');

let transport;
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  try {
    require.resolve('pino-pretty');
    transport = { target: 'pino-pretty', options: { colorize: true } };
  } catch (e) {
    // pino-pretty is not installed or available, fallback to default JSON logging
    transport = undefined;
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
});

module.exports = logger;
