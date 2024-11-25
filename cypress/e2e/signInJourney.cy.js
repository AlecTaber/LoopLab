describe("Sign In Journey", () => {
  beforeEach(() => {
    cypress.visit("http://localhost:3001/");
  });

  it("signs the user into the website", () => {
    cy.fixture("getUser").then((response) => {
      cy.intercept("POST", "/graphql", (req) => {
        if (req.body.query.includes("Login")) {
          req.reply(response);
        }
      });
    });

    cy.visit("/login");

    cy.
  });
});
