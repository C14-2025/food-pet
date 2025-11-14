describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should successfully login as admin and redirect to /orders', () => {
    cy.mockCredentialsLoginSuccess('admin@example.com', 'ADMIN');

    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="login-button"]').should('contain', 'Entrando...');
    cy.url().should('include', '/orders');
  });

  it('should successfully login as client and redirect to /orders', () => {
    cy.mockCredentialsLoginSuccess('client@example.com', 'CLIENT');

    cy.get('#email').type('client@example.com');
    cy.get('#password').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="login-button"]').should('contain', 'Entrando...');
    cy.url().should('include', '/orders');
  });

  it('should fail to login with invalid credentials', () => {
    cy.mockCredentialsLoginFailure();

    cy.get('#email').type('invalid@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[role="alert"]')
      .should('be.visible')
      .and('contain', 'Credenciais inválidas. Por favor, tente novamente.');

    cy.url().should('include', '/login');
  });

  it('should disable form fields and button while loading', () => {
    cy.mockCredentialsLoginSuccess('admin@example.com', 'ADMIN');

    cy.get('#email').type('admin@example.com');
    cy.get('#password').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.get('#email').should('be.disabled');
    cy.get('#password').should('be.disabled');
    cy.get('[data-testid="login-button"]').should('be.disabled');
  });

  it('should require email and password fields', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.get('#email:invalid').should('exist');
  });
});