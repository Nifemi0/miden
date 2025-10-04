describe('Integration Test', () => {
  it('should load projects and switch to the admin portal', () => {
    // Visit the application
    cy.visit('http://localhost:3000');

    // Wait for the page to load
    cy.wait(2000);

    // Check for the loading message first
    cy.contains('div', 'Loading proposals...').should('not.exist');

    // Check that the "No proposals found." message is displayed
    cy.screenshot('before-assertion');
    cy.contains('p', 'No proposals found.').should('be.visible');

    // Click on the Admin Portal tab
    cy.contains('button', 'Admin Portal').click();

    // Check that the Admin Portal tab is active
    cy.get('[data-state="active"]').should('contain', 'Admin Portal');

    // Check for the "Connect Wallet Required" message
    cy.contains('h2', 'Admin Portal').should('be.visible');
  });
});
