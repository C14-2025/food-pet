import './commands';
import 'cypress-mochawesome-reporter/register';

Cypress.on('uncaught:exception', () => false);
