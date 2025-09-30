import { defineConfig } from 'cypress';

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Next.js dev server
    supportFile: 'cypress/support/e2e.ts',
  },
});
