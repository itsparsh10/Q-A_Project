/**
 * FORM QUERY E2E & API TEST
 * Validates the "Get My Marketing Strategy" form submission and API.
 */

describe('Form Query Functionality - UI & API', () => {
  const uniqueId = Date.now();
  const testData = {
    name: `Cypress Tester ${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    company: 'Test Automation Corp',
    industry: 'Technology & Software',
    message: 'This is a test message from Cypress E2E automation.'
  };


  beforeEach(() => {
    // Visit the landing page where the CallToAction form is located
    cy.visit('/');
  });

  it('1. UI: Should render the Form Query section correctly', () => {
    // Scroll to the bottom where CallToAction usually is
    cy.scrollTo('bottom');
    
    cy.get('section').contains(/Transform Your/i).should('be.visible');
    cy.get('form').should('be.visible');
    
    // Check for essential input fields
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Get My Marketing Strategy');
  });

  it('2. E2E: Should submit the marketing strategy form and verify field reset', () => {
    // Scroll to the form
    cy.get('form').scrollIntoView();

    // Fill out the form
    cy.get('form').within(() => {
      cy.get('input[name="name"]').type(testData.name);
      cy.get('input[name="email"]').type(testData.email);
      cy.get('input[name="company"]').type(testData.company);
      cy.get('select[name="industry"]').select(testData.industry);
      cy.get('textarea[name="message"]').type(testData.message);
    });

    // Intercept the API call to verify the payload and response
    cy.intercept('POST', '/api/form-query').as('submitForm');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for the API response
    cy.wait('@submitForm').then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      expect(interception.response.body.success).to.be.true;
    });

    // Success condition: fields should be cleared (verified by value check)
    cy.get('input[name="name"]').should('have.value', '');
    cy.get('input[name="email"]').should('have.value', '');
    cy.get('input[name="company"]').should('have.value', '');
    cy.get('textarea[name="message"]').should('have.value', '');
  });

  it('3. API: Should submit a form query successfully via direct API call', () => {
    const apiData = {
      ...testData,
      email: `api_test_${Date.now()}@example.com`,
      message: 'Direct API test submission'
    };

    cy.request({
      method: 'POST',
      url: '/api/form-query',
      body: apiData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('queryId');
    });
  });

  it('4. API: Should fail when required fields are missing', () => {
    cy.request({
      method: 'POST',
      url: '/api/form-query',
      body: {
        name: 'Missing Email'
        // email is missing
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Name and email are required');
    });
  });
});
