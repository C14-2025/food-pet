import { defineConfig } from 'cypress';
import mochawesome from 'cypress-mochawesome-reporter/plugin';

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Next.js dev server
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      mochawesome(on);
      return config;
    },
  },

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    overwrite: false,
    html: true,
    json: true,
  },
});
