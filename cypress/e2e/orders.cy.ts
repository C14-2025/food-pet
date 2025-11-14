describe('Orders Page - Authentication', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login page when accessing orders without authentication', () => {
      cy.visit('/orders');
      cy.url().should('include', '/login');
      cy.contains('Bem vindo!').should('be.visible');
    });

    it('should show loading state before redirect', () => {
      cy.intercept('/api/auth/session', { delay: 1000 }).as('session');
      cy.visit('/orders');
      cy.contains('Carregando...').should('be.visible');
    });
  });

  describe('Admin User', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('#email').type('admin@example.com');
      cy.get('#password').type('password123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/orders');
    });

    it('should display header with admin role badge', () => {
      cy.contains('span', 'ADMIN').should('be.visible');
      cy.contains('span', 'ADMIN').should('have.class', 'bg-blue-100');
    });

    it('should display admin email in dropdown menu', () => {
      cy.get('[data-cy="user-avatar"]').click();
      cy.get('[data-cy="user-email"]').should('contain', 'admin@example.com');
    });

    it('should display orders page content', () => {
      cy.get('#orders-title').should('contain', 'Pedidos');
      cy.contains('Lista de pedidos').should('be.visible');
      cy.contains('Atualizar').should('be.visible');
    });

    it('should logout and redirect to login page', () => {
      cy.get('[data-cy="user-avatar"]').click();
      cy.get('[data-cy="logout-button"]').click();
      cy.url().should('include', '/login');
    });

    it('should not access orders after logout', () => {
      cy.get('[data-cy="user-avatar"]').click();
      cy.get('[data-cy="logout-button"]').click();
      cy.url().should('include', '/login');
      
      cy.visit('/orders');
      cy.url().should('include', '/login');
    });
  });

  describe('Client User', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('#email').type('client@example.com');
      cy.get('#password').type('password123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/orders');
    });

    it('should display header with client role badge', () => {
      cy.contains('span', 'CLIENT').should('be.visible');
      cy.contains('span', 'CLIENT').should('have.class', 'bg-blue-100');
    });

    it('should display client email in dropdown menu', () => {
      cy.get('[data-cy="user-avatar"]').click();
      cy.get('[data-cy="user-email"]').should('contain', 'client@example.com');
    });

    it('should display orders page content', () => {
      cy.get('#orders-title').should('contain', 'Pedidos');
      cy.contains('Lista de pedidos').should('be.visible');
    });

    it('should logout and redirect to login page', () => {
      cy.get('[data-cy="user-avatar"]').click();
      cy.get('[data-cy="logout-button"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session after page refresh for admin', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@example.com');
      cy.get('#password').type('password123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/orders');
      
      cy.reload();
      cy.url().should('include', '/orders');
      cy.contains('span', 'ADMIN').should('be.visible');
    });

    it('should maintain session after page refresh for client', () => {
      cy.visit('/login');
      cy.get('#email').type('client@example.com');
      cy.get('#password').type('password123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/orders');
      
      cy.reload();
      cy.url().should('include', '/orders');
      cy.contains('span', 'CLIENT').should('be.visible');
    });
  });
});