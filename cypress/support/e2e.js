/**
 * GLOBAL E2E SUPPORT FILE
 * This file is processed and loaded automatically before your test files.
 */

// Global Error Handler to catch and ignore ChunkLoadErrors and Hydration issues
Cypress.on('uncaught:exception', (err, runnable) => {
  const ignoredErrors = [
    'Hydration failed',
    'Minified React error',
    'ChunkLoadError',
    'Loading chunk',
    'failed to fetch', // Often related to chunk loading in dev
    'Network Error'
  ];

  const shouldIgnore = ignoredErrors.some((msg) => err.message.includes(msg));

  if (shouldIgnore) {
    console.log('Cypress caught and ignored a transient error:', err.message);
    return false;
  }

  // Allow other errors to fail the test
  return true;
});
