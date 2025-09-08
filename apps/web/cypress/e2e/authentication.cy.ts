describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should display login form', () => {
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.login('admin@miltera.com.tr', 'admin123');
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard-title"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@email.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="password-error"]').should('be.visible');
  });

  it('should validate email format', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format');
  });

  it('should logout successfully', () => {
    cy.loginAsAdmin();
    cy.logout();
    cy.url().should('include', '/auth');
  });

  it('should redirect to dashboard if already logged in', () => {
    cy.loginAsAdmin();
    cy.visit('/auth');
    cy.url().should('include', '/dashboard');
  });

  it('should show different navigation based on user role', () => {
    // Test Admin role
    cy.loginAsAdmin();
    cy.get('[data-testid="nav-users"]').should('be.visible');
    cy.get('[data-testid="nav-reports"]').should('be.visible');
    cy.logout();

    // Test TSP role
    cy.loginAsTSP();
    cy.get('[data-testid="nav-users"]').should('not.exist');
    cy.get('[data-testid="nav-products"]').should('be.visible');
    cy.get('[data-testid="nav-issues"]').should('be.visible');
    cy.logout();

    // Test Customer role
    cy.loginAsCustomer();
    cy.get('[data-testid="nav-users"]').should('not.exist');
    cy.get('[data-testid="nav-products"]').should('not.exist');
    cy.get('[data-testid="nav-issues"]').should('be.visible');
  });

  it('should handle session expiration', () => {
    cy.loginAsAdmin();
    
    // Simulate session expiration by clearing localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    
    cy.reload();
    cy.url().should('include', '/auth');
  });

  it('should show forgot password form', () => {
    cy.get('[data-testid="forgot-password-link"]').click();
    cy.get('[data-testid="forgot-password-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="reset-password-button"]').should('be.visible');
  });

  it('should send password reset email', () => {
    cy.get('[data-testid="forgot-password-link"]').click();
    cy.get('[data-testid="email-input"]').type('admin@miltera.com.tr');
    cy.get('[data-testid="reset-password-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'Password reset email sent');
  });
});
