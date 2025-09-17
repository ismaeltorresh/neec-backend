// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const env = require('./environments');

// Configure sensible defaults per environment to avoid excessive overhead
const isProd = env.execution === 'production';
const tracesSampleRate = isProd ? (process.env.SENTRY_TRACES_SAMPLE_RATE ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE) : 0.05) : 1.0;
const profilesSampleRate = isProd ? (process.env.SENTRY_PROFILES_SAMPLE_RATE ? Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) : 0.01) : 1.0;

Sentry.init({
  dsn: "https://2664da89890b2f7b43762d6d22758855@o1281102.ingest.us.sentry.io/4508049371889664",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate,
  profilesSampleRate,
});
