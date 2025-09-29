describe("Orders Page Authentication", () => {
  it("should redirect to /login if not logged in", () => {
    cy.clearLocalStorage();

    cy.visit("/orders");

    cy.location("pathname").should("eq", "/login");
  });

  it("should allow access to /orders if logged in", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("isLoggedIn", "true");
      },
    });

    cy.visit("/orders");

    cy.location("pathname").should("eq", "/orders");

    cy.get("#orders-title").should("contain.text", "Pedidos");
  });
});
