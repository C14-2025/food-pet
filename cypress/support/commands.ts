Cypress.Commands.add('mockLoginAsAdmin', () => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        email: 'admin@example.com',
        role: 'ADMIN',
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
  }).as('session');
});

Cypress.Commands.add('mockLoginAsClient', () => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        email: 'client@example.com',
        role: 'CLIENT',
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
  }).as('session');
});

Cypress.Commands.add('mockUnauthenticated', () => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: null,
  }).as('session');
});

Cypress.Commands.add('mockCredentialsLoginSuccess', (email: string, role: string) => {
  cy.intercept('POST', '/api/auth/callback/credentials', {
    statusCode: 200,
    body: {
      url: `${Cypress.config().baseUrl}/orders`,
    },
  }).as('credentialsLogin');

  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        email: email,
        role: role,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
  }).as('session');
});

Cypress.Commands.add('mockCredentialsLoginFailure', () => {
  cy.intercept('POST', '/api/auth/callback/credentials', {
    statusCode: 401,
    body: {
      error: 'CredentialsSignin',
    },
  }).as('credentialsLogin');
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockLoginAsAdmin(): Chainable<void>;
      mockLoginAsClient(): Chainable<void>;
      mockUnauthenticated(): Chainable<void>;
      mockCredentialsLoginSuccess(email: string, role: string): Chainable<void>;
      mockCredentialsLoginFailure(): Chainable<void>;
    }
  }
}

export {};