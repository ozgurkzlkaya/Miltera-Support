// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Add custom commands for authentication
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      loginAsTSP(): Chainable<void>;
      loginAsCustomer(): Chainable<void>;
      logout(): Chainable<void>;
      createProduct(productData: any): Chainable<void>;
      createIssue(issueData: any): Chainable<void>;
      navigateToSection(section: string): Chainable<void>;
    }
  }
}
