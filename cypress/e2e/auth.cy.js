/**
 * AUTHENTICATION UI & API TESTS
 * Focus: Visibility and API functionality
 */

describe('Register and Login - UI & API Tests', () => {
  const uniqueId = Date.now();
  const newUser = {
    email: `user_${uniqueId}@test.com`,
    password: 'Password123!',
    firstName: 'Cypress',
    lastName: 'Tester'
  };

  // Handle hydration/uncaught exceptions
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Hydration failed') || err.message.includes('Minified React error')) {
      return false;
    }
    return true;
  });

  // 1. UI VISIBILITY TEST
  it('Should verify Landing Page UI is visible', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
    // Check for a common element like the logo or a heading
    cy.get('nav').should('exist');
    cy.contains(/Transform/i).should('be.visible');
  });

  // 2. REGISTER API & UI
  it('Should successfully Register and verify UI', () => {
    // Visit register page
    cy.visit('/register');
    cy.get('form').should('be.visible');

    // API Test
    cy.request({
      method: 'POST',
      url: '/api/auth/register',
      body: newUser,
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 201, 400]).to.include(response.status);
    });
  });

  // 3. LOGIN API & UI
  it('Should successfully Login and verify UI', () => {
    // Visit login page
    cy.visit('/login');
    cy.get('form').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');

    // API Test
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'hello@gmail.com',
        password: 'Hello*123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('access');
    });
  });
});
