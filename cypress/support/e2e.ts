// Runs before every test file
// You can add global configuration or hooks here

// Example: ignore uncaught exceptions from Next.js hydration
Cypress.on('uncaught:exception', () => false);
