/**
 * PROFILE MANAGEMENT E2E TEST
 * Automates the flow of logging in, navigating to account settings, 
 * editing profile details, and verifying the updates.
 */

describe('Profile Management - Single Session E2E', () => {
  const uniqueId = Date.now();
  const credentials = {
    email: 'hello@gmail.com',
    password: 'Hello*123'
  };

  const updatedProfile = {
    firstName: `Pro_${uniqueId}`,
    lastName: `Dev_${uniqueId}`,
    companyName: `Innovators_${uniqueId} Corp`,
    jobTitle: 'Lead Automation Engineer',
    website: `https://test-${uniqueId}.markzy.ai`
  };

  // Handle hydration/uncaught exceptions
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Hydration failed') || err.message.includes('Minified React error')) {
      return false;
    }
    return true;
  });

  it('Should complete the full Profile Management journey in one session', () => {
    // 1. Setup Intercepts
    cy.intercept('GET', '/api/user/membership*', {
      statusCode: 200,
      body: { paymentHistory: [] }
    }).as('getMembership');

    cy.intercept('GET', '/api/user/profile*').as('getProfile');
    cy.intercept('PUT', '/api/user/profile*').as('updateProfile');

    // 2. Login
    cy.visit('/login');
    cy.get('input[name="email"]').type(credentials.email);
    cy.get('input[name="password"]').type(credentials.password);
    cy.wait(1000); // Wait for hydration
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.contains('Welcome back! Login successful', { timeout: 15000 }).should('be.visible');

    // 3. Navigate to Account & Verify Initial State
    cy.visit('/account');
    cy.wait('@getProfile');
    cy.get('h1').should('contain', 'Account Settings');
    cy.get('h2').should('contain', 'Hello,');

    // 4. Edit Profile
    cy.contains('button', 'Edit Profile').click();
    cy.get('input[placeholder="Enter your first name"]').clear().type(updatedProfile.firstName);
    cy.get('input[placeholder="Enter your last name"]').clear().type(updatedProfile.lastName);
    cy.get('input[placeholder="Your company name"]').clear().type(updatedProfile.companyName);
    cy.get('input[placeholder="Your job title"]').clear().type(updatedProfile.jobTitle);
    cy.get('input[placeholder="https://yourwebsite.com"]').clear().type(updatedProfile.website);

    // 5. Save and Verify
    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfile').its('response.statusCode').should('eq', 200);
    cy.contains('Profile updated successfully!', { timeout: 10000 }).should('be.visible');

    // 6. Final UI Verification (No re-login needed)
    // Using .should('exist') instead of .should('be.visible') to avoid clipping issues with overflow:hidden
    cy.contains(updatedProfile.firstName).should('exist');
    cy.contains(updatedProfile.lastName).should('exist');
    cy.contains(updatedProfile.companyName).should('exist');
    cy.contains(updatedProfile.jobTitle).should('exist');
    const expectedWebsiteDisplay = updatedProfile.website.replace('https://', '');
    cy.contains(expectedWebsiteDisplay).should('exist');

    cy.log('Profile Management E2E Test Completed Successfully');
  });
});
