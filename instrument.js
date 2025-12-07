import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import env from './environments/index.js';

// Configure sensible defaults per environment to avoid excessive overhead
const isProd = env.execution === 'production';
const tracesSampleRate = isProd ? (process.env.SENTRY_TRACES_SAMPLE_RATE ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE) : 0.05) : 1.0;
const profilesSampleRate = isProd ? (process.env.SENTRY_PROFILES_SAMPLE_RATE ? Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) : 0.01) : 1.0;

// Initialize Sentry only if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate,
    profilesSampleRate,
  });
  console.info('Sentry initialized successfully');
} else if (env.sentry) {
  console.warn('Sentry enabled in environment but SENTRY_DSN not provided');
}
