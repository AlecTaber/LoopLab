describe("Sign In Journey", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("A user can sign into the website", () => {
    cy.visit("/login");

    cy.get("form div input").eq(0).type("johndoe@email.com");
    cy.get("form div input").eq(1).type("password");

    cy.get("form button").click();

    cy.url().should("be.equals", "http://localhost:3000/home");
  });

  it("A user can comment under posts", () => {
    cy.visit("/login");

    cy.get("form div input").eq(0).type("johndoe@email.com");
    cy.get("form div input").eq(1).type("password");

    cy.get("form button").click();

    cy.get(".openComment").eq(0).click();
    cy.get("textarea").type("Comment!");
    cy.get(".submit").click();

    setTimeout(() => {
      cy.get(".comment")
        .eq(0)
        .invoke("text")
        .should("be.equal", "johnDoe: Comment!");
    }, 3000);
  });
});
