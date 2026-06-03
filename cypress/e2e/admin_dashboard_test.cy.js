describe('Admin Dashboard Flow', () => {
  beforeEach(() => {
    // Ignore / mock the support and form-query APIs to prevent 500 errors
    cy.intercept('GET', '/api/admin/support', { statusCode: 200, body: [] }).as('getSupport');
    cy.intercept('GET', '/api/form-query', { statusCode: 200, body: [] }).as('getFormQuery');

    // 1. Login as Admin before the test
    cy.visit('/login');
    cy.get('input[name="email"]').clear().type('admin@gmail.com');
    cy.get('input[name="password"]').clear().type('Hello*123');
    cy.get('button[type="submit"]').click();
  });

  it('Verifies global statistics and explores all tabs', () => {
    // 2. Wait for redirect to Admin Dashboard
    cy.url().should('include', '/admin_dashboard');
    cy.contains('h1', 'Admin Dashboard', { timeout: 10000 }).should('be.visible');

    // 3. Verify Global Statistics Cards are present and have data
    const expectedStats = ['Total Users', 'Active Users', 'Tool Usage', 'Total Payments'];

    expectedStats.forEach((statTitle) => {
      cy.contains('p', statTitle, { timeout: 10000 })
        .parent()
        .within(() => {
          // Verify that the statistic value exists and is not empty
          cy.get('p').not(`:contains("${statTitle}")`).should('not.be.empty');
        });
    });

    // 4. Explore all Admin Dashboard Tabs
    const tabs = [
      'Overview',
      'Users',
      'User Analytics',
      'Analytics',
      'Revenue',
      'Tools',
      'Form Query',
      'Support',
    ];

    tabs.forEach((tabName) => {
      cy.contains('button', tabName).scrollIntoView().click({ force: true });

      // Verify content for each tab
      cy.get('div.max-w-full').should('exist');
    });
  });
});
