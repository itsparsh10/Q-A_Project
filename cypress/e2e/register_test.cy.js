/**
 * PROFESSIONAL REGISTER E2E TEST
 * Validates the multi-step registration flow and redirection to login.
 */

describe('Registration Functionality - UI & API', () => {
  const uniqueId = Date.now();
  const newUser = {
    email: `pro_dev_${uniqueId}@markzy.ai`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    firstName: 'Pro',
    lastName: 'Developer',
    companyName: 'Tech Innovators',
    jobTitle: 'Senior Engineer',
    companySize: '11-50 employees',
    industry: 'Technology',
    monthlyBudget: '$1,000 - $5,000'
  };

  beforeEach(() => {
    cy.visit('/register');
  });

  it('1. UI: Should render the Registration page correctly', () => {
    cy.get('body').should('be.visible');
    // The page has two H1/H2 tags, we target the one in the header
    cy.get('h1').should('contain', 'Welcome Back'); 
    cy.get('h2').should('contain', 'Create Your Account');
    cy.get('form').should('be.visible');
  });

  it('2. E2E: Should complete the 3-step registration flow and redirect to login', () => {
    // --- STEP 1: Basic Information ---
    // Using .clear().type() and .blur() to ensure React state updates properly
    cy.get('input[name="firstName"]').clear({ force: true }).type(newUser.firstName, { force: true, delay: 0 }).should('have.value', newUser.firstName);
    cy.get('input[name="lastName"]').clear({ force: true }).type(newUser.lastName, { force: true, delay: 0 }).should('have.value', newUser.lastName);
    cy.get('input[name="email"]').clear({ force: true }).type(newUser.email, { force: true, delay: 0 }).should('have.value', newUser.email);
    cy.get('input[name="password"]').clear({ force: true }).type(newUser.password, { force: true, delay: 0 }).should('have.value', newUser.password);
    cy.get('input[name="confirmPassword"]').clear({ force: true }).type(newUser.confirmPassword, { force: true, delay: 0 }).should('have.value', newUser.confirmPassword);
    
    // Explicitly wait for the button to become enabled (React state sync)
    cy.contains('button', 'Continue').should('not.be.disabled').click({ force: true });

    // --- STEP 2: Company Information ---
    cy.get('h2', { timeout: 10000 }).should('contain', 'Company Information');
    cy.get('input[name="companyName"]').should('not.be.disabled').clear({ force: true }).type(newUser.companyName, { force: true }).blur();
    cy.get('input[name="jobTitle"]').should('not.be.disabled').clear({ force: true }).type(newUser.jobTitle, { force: true }).blur();
    cy.get('select[name="companySize"]').select(newUser.companySize, { force: true });
    cy.get('select[name="industry"]').select(newUser.industry, { force: true });
    
    cy.contains('button', 'Continue').should('not.be.disabled').click({ force: true });

    // --- STEP 3: Marketing Preferences ---
    cy.get('h2', { timeout: 10000 }).should('contain', 'Marketing Preferences');
    
    // The checkbox in Step 3 is required for the "Create Account" button
    cy.get('input[name="agreeToTerms"]').check({ force: true });

    // Submit the form
    cy.contains('button', 'Create Account').should('not.be.disabled').click({ force: true });

    // --- REDIRECTION ---
    // Wait for the redirect to Login page
    cy.url({ timeout: 20000 }).should('include', '/login');
    cy.get('h1').should('contain', 'Welcome Back');
  });

  it('3. API: Should register a new user successfully via direct API call', () => {
    const apiUser = { ...newUser, email: `api_dev_${Date.now()}@markzy.ai` };
    cy.request({
      method: 'POST',
      url: '/api/auth/register',
      body: apiUser,
      failOnStatusCode: false
    }).then((response) => {
      // Expect 200/201
      expect([200, 201]).to.include(response.status);
    });
  });
});
