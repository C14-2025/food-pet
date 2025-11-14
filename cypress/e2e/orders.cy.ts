describe('Orders Page - Authentication', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to login page when accessing orders without authentication', () => {
      cy.mockUnauthenticated();
      cy.visit('/orders');
      cy.url().should('include', '/login');
      cy.contains('Bem vindo!').should('be.visible');
    });
  });

  describe('Admin User', () => {
    beforeEach(() => {
      cy.mockLoginAsAdmin();
      cy.visit('/orders');
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
  });

  describe('Client User', () => {
    beforeEach(() => {
      cy.mockLoginAsClient();
      cy.visit('/orders');
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
  });
});