describe("Login Page", () => {
  it("should have username and password pre-filled and redirect to /orders after login", () => {
    cy.visit("/login");

    cy.get("#username")
      .should("have.value", "Guest1978")
      .and("be.disabled");

    cy.get("#password")
      .should("have.value", "guest1978")
      .and("be.disabled");

    cy.get("[data-testid=login-button]").click();

    cy.url().should("match", /\/(orders|)$/);
    cy.location("pathname").should("eq", "/orders");

    cy.get("#orders-title").should("contain.text", "Pedidos");
  });
});
