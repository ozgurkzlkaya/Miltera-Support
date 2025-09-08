describe('Product Management', () => {
  beforeEach(() => {
    cy.loginAsTSP();
    cy.navigateToSection('products');
  });

  it('should display products list', () => {
    cy.get('[data-testid="products-table"]').should('be.visible');
    cy.get('[data-testid="add-product-button"]').should('be.visible');
  });

  it('should create a new product', () => {
    const productData = {
      modelId: 'model-1',
      productionDate: '2025-01-15',
    };

    cy.get('[data-testid="add-product-button"]').click();
    cy.get('[data-testid="product-form"]').should('be.visible');

    // Fill form
    cy.get('[data-testid="product-model-select"]').click();
    cy.get(`[data-value="${productData.modelId}"]`).click();
    
    cy.get('[data-testid="production-date-input"]').type(productData.productionDate);
    
    cy.get('[data-testid="save-product-button"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'Product created successfully');
  });

  it('should validate required fields when creating product', () => {
    cy.get('[data-testid="add-product-button"]').click();
    cy.get('[data-testid="save-product-button"]').click();

    cy.get('[data-testid="model-error"]').should('be.visible');
    cy.get('[data-testid="production-date-error"]').should('be.visible');
  });

  it('should edit an existing product', () => {
    // First create a product
    cy.createProduct({
      modelId: 'model-1',
      productionDate: '2025-01-15',
    });

    // Edit the product
    cy.get('[data-testid="edit-product-button"]').first().click();
    cy.get('[data-testid="product-form"]').should('be.visible');

    cy.get('[data-testid="serial-number-input"]').type('SN001');
    cy.get('[data-testid="save-product-button"]').click();

    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'Product updated successfully');
  });

  it('should update product status', () => {
    // Create a product first
    cy.createProduct({
      modelId: 'model-1',
      productionDate: '2025-01-15',
    });

    // Update status
    cy.get('[data-testid="status-select"]').first().click();
    cy.get('[data-value="READY_FOR_SHIPMENT"]').click();

    cy.get('[data-testid="update-status-button"]').first().click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should search products', () => {
    cy.get('[data-testid="search-input"]').type('SN001');
    cy.get('[data-testid="search-button"]').click();

    cy.get('[data-testid="products-table"]').should('contain', 'SN001');
  });

  it('should filter products by status', () => {
    cy.get('[data-testid="status-filter"]').click();
    cy.get('[data-value="FIRST_PRODUCTION"]').click();

    cy.get('[data-testid="products-table"]').should('contain', 'FIRST_PRODUCTION');
  });

  it('should bulk create products', () => {
    cy.get('[data-testid="bulk-create-button"]').click();
    cy.get('[data-testid="bulk-create-form"]').should('be.visible');

    // Fill bulk form
    cy.get('[data-testid="product-model-select"]').click();
    cy.get('[data-value="model-1"]').click();
    
    cy.get('[data-testid="quantity-input"]').type('5');
    cy.get('[data-testid="start-date-input"]').type('2025-01-15');
    
    cy.get('[data-testid="bulk-create-save-button"]').click();

    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', '5 products created successfully');
  });

  it('should export products', () => {
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="export-options"]').should('be.visible');

    cy.get('[data-testid="export-excel"]').click();
    
    // Verify download
    cy.readFile('cypress/downloads/products.xlsx').should('exist');
  });

  it('should show product details', () => {
    cy.get('[data-testid="view-product-button"]').first().click();
    cy.get('[data-testid="product-details-modal"]').should('be.visible');
    
    cy.get('[data-testid="product-id"]').should('be.visible');
    cy.get('[data-testid="product-status"]').should('be.visible');
    cy.get('[data-testid="product-history"]').should('be.visible');
  });

  it('should delete a product', () => {
    // Create a product first
    cy.createProduct({
      modelId: 'model-1',
      productionDate: '2025-01-15',
    });

    cy.get('[data-testid="delete-product-button"]').first().click();
    cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible');
    
    cy.get('[data-testid="confirm-delete-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'Product deleted successfully');
  });

  it('should show product statistics', () => {
    cy.get('[data-testid="stats-card"]').should('be.visible');
    cy.get('[data-testid="total-products"]').should('be.visible');
    cy.get('[data-testid="products-by-status"]').should('be.visible');
  });

  it('should handle pagination', () => {
    // Create multiple products to test pagination
    for (let i = 0; i < 25; i++) {
      cy.createProduct({
        modelId: 'model-1',
        productionDate: '2025-01-15',
      });
    }

    cy.get('[data-testid="pagination-next"]').click();
    cy.get('[data-testid="products-table"]').should('be.visible');
    
    cy.get('[data-testid="pagination-prev"]').click();
    cy.get('[data-testid="products-table"]').should('be.visible');
  });
});
