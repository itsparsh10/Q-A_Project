/**
 * SUPPORT TICKET E2E TEST
 * Automates the flow of logging in, navigating to the Help Center,
 * submitting a support ticket, and verifying the submission.
 */

describe('Support Ticket - Single Session E2E', () => {
  const uniqueId = Date.now();
  const credentials = {
    email: 'hello@gmail.com',
    password: 'Hello*123'
  };

  const ticketData = {
    userName: 'Cypress Tester',
    userEmail: 'hello@gmail.com',
    subject: `Test Ticket - ${uniqueId}`,
    description: 'This is an automated support ticket submitted by Cypress E2E test.',
    category: 'technical',
    priority: 'high'
  };


  it('Should complete the full Support Ticket journey in one session', () => {
    // 1. Setup Intercepts
    // Suppress background noise and API failures not relevant to support tickets
    cy.intercept('GET', '/api/user/membership*', {
      statusCode: 200,
      body: { paymentHistory: [] }
    }).as('getMembership');

    // Mock ticket fetching to prevent 500 errors and noise
    cy.intercept('GET', '/api/help-center/tickets*', {
      statusCode: 200,
      body: { success: true, tickets: [] }
    }).as('getTickets');

    cy.intercept('POST', '/api/help-center/tickets*').as('submitTicket');

    // 2. Login
    cy.visit('/login');
    cy.get('input[name="email"]').type(credentials.email);
    cy.get('input[name="password"]').type(credentials.password);
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.contains('Welcome back! Login successful', { timeout: 15000 }).should('be.visible');

    // 3. Navigate to Help Center
    cy.visit('/help-center');
    // No waiting for getTickets to avoid blocking on background noise
    cy.get('h1').should('contain', 'Help Center');

    // 4. Open Contact Form
    cy.contains('button', 'Submit Ticket').click();
    cy.get('h3').should('contain', 'Submit a Support Ticket');

    // 5. Fill Ticket Form
    cy.get('input[placeholder="Enter your full name"]').clear().type(ticketData.userName);
    cy.get('input[placeholder="Enter your email address"]').clear().type(ticketData.userEmail);
    
    // Select category and priority using labels for better stability
    cy.contains('label', 'Category *').parent().find('select').select(ticketData.category);
    cy.contains('label', 'Priority').parent().find('select').select(ticketData.priority);

    cy.get('input[placeholder="Brief description of your issue"]').clear().type(ticketData.subject);
    cy.get('textarea[placeholder*="detailed information"]').clear().type(ticketData.description);

    // 6. Submit Ticket (target the form's submit button, not the header toggle)
    cy.get('form').contains('button', 'Submit Ticket').click();

    // Wait for the API response to avoid aborting the request in CI
    cy.wait('@submitTicket').its('response.statusCode').should('eq', 200);
    cy.log('Support Ticket E2E Test Completed Successfully');
  });
});
