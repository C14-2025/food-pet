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
      cy.intercept('GET', '/api/product', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Teste Produto', price: 10.5, image: 'https://via.placeholder.com/80' },
          { id: 2, name: 'Outro Produto', price: 5, image: 'https://via.placeholder.com/80?2' },
        ],
      }).as('products');
      cy.intercept('POST', '/api/order', { statusCode: 200, body: { id: 99, total: 10.5 } }).as('createOrder');
      cy.visit('/orders');
    });

    it('should display orders page content', () => {
      cy.get('#orders-title').should('contain', 'Pedidos');
      cy.contains('Novo pedido').should('be.visible');
      cy.contains('Criar pedido').should('be.visible');
    });
  });

  describe('Client User', () => {
    beforeEach(() => {
      cy.mockLoginAsClient();
      cy.intercept('GET', '/api/product', {
        statusCode: 200,
        body: [{ id: 1, name: 'Teste Produto', price: 10.5, image: 'https://via.placeholder.com/80' }],
      }).as('products');
      cy.intercept('POST', '/api/order', { statusCode: 200, body: { id: 100, total: 10.5 } }).as('createOrder');
      cy.visit('/orders');
    });

    it('should display orders page content', () => {
      cy.get('#orders-title').should('contain', 'Pedidos');
      cy.contains('Novo pedido').should('be.visible');
      cy.contains('Criar pedido').should('be.visible');
    });
  });
});
