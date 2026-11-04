import pino from 'pino';

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isTest ? 'silent' : (process.env.LOG_LEVEL || (isDev ? 'debug' : 'info')),
  base: {
    service: 'waliliens-api',
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
