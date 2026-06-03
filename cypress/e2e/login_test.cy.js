/**
 * PROFESSIONAL LOGIN E2E TEST
 * Validates both UI rendering and API authentication flow.
 */

describe('Login Functionality - UI & API', () => {
  const credentials = {
    email: 'hello@gmail.com',
    password: 'Hello*123'
  };

  beforeEach(() => {
    cy.visit('/login');
  });

  it('1. UI: Should render the Login page correctly', () => {
    cy.get('body').should('be.visible');
    cy.get('h1').should('contain', 'Welcome Back');
    cy.get('form').should('be.visible');
    cy.get('input[name="email"]').should('be.visible').and('have.attr', 'placeholder', 'Enter your email');
    cy.get('input[name="password"]').should('be.visible').and('have.attr', 'placeholder', 'Enter your password');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Sign In');
  });

  it('2. API: Should authenticate successfully via API', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: credentials
    }).then((response) => {
      expect(response.status).to.eq(200);
      // Removed .property('success') because the API returns { user, access }
      expect(response.body).to.have.property('access');
      expect(response.body.user).to.have.property('email', credentials.email);
    });
  });

  it('3. E2E: Should login through UI and verify Toastify notification', () => {
    cy.get('input[name="email"]').type(credentials.email);
    cy.get('input[name="password"]').type(credentials.password);
    
    // Ensure the button is interactive and form is ready without hardcoded waits
    cy.get('button[type="submit"]').should('not.be.disabled');

    // NOTE: hello@gmail.com uses a hardcoded bypass in the frontend 
    // and does NOT trigger a real API request. 
    // We only intercept for non-admin users if needed.

    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });

    // VERIFY TOASTIFY NOTIFICATION (This is the primary success indicator)
    cy.contains('Welcome back! Login successful', { timeout: 15000 }).should('be.visible');
    cy.log('Toastify Notification Verified Successfully');

    // Redirection check: hello@gmail.com redirects to /all-tools
    cy.url({ timeout: 20000 }).should('include', '/all-tools');
  });
});
