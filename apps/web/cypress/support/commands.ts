// Custom commands for authentication
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@miltera.com.tr', 'admin123');
});

Cypress.Commands.add('loginAsTSP', () => {
  cy.login('tsp@miltera.com.tr', 'tsp123');
});

Cypress.Commands.add('loginAsCustomer', () => {
  cy.login('musteri@testmusteri.com', 'musteri123');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/auth');
});

// Custom commands for navigation
Cypress.Commands.add('navigateToSection', (section: string) => {
  cy.get(`[data-testid="nav-${section}"]`).click();
  cy.url().should('include', `/${section}`);
});

// Custom commands for data creation
Cypress.Commands.add('createProduct', (productData: any) => {
  cy.navigateToSection('products');
  cy.get('[data-testid="add-product-button"]').click();
  
  // Fill product form
  cy.get('[data-testid="product-model-select"]').click();
  cy.get(`[data-value="${productData.modelId}"]`).click();
  
  cy.get('[data-testid="production-date-input"]').type(productData.productionDate);
  cy.get('[data-testid="save-product-button"]').click();
  
  // Verify product was created
  cy.get('[data-testid="success-message"]').should('be.visible');
});

Cypress.Commands.add('createIssue', (issueData: any) => {
  cy.navigateToSection('issues');
  cy.get('[data-testid="add-issue-button"]').click();
  
  // Fill issue form
  cy.get('[data-testid="issue-title-input"]').type(issueData.title);
  cy.get('[data-testid="issue-description-input"]').type(issueData.description);
  cy.get('[data-testid="issue-priority-select"]').click();
  cy.get(`[data-value="${issueData.priority}"]`).click();
  
  cy.get('[data-testid="save-issue-button"]').click();
  
  // Verify issue was created
  cy.get('[data-testid="success-message"]').should('be.visible');
});

// Utility commands
// Cypress.Commands.add('waitForPageLoad', () => {
//   cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
// });

// Cypress.Commands.add('clearDatabase', () => {
//   // This would typically call an API endpoint to clear test data
//   cy.request('POST', '/api/test/clear-database');
// });

// Cypress.Commands.add('seedTestData', () => {
//   // This would typically call an API endpoint to seed test data
//   cy.request('POST', '/api/test/seed-data');
// });
