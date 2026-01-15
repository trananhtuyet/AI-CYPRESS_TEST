// Custom commands for AI-generated tests

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.get('input[type="email"], input[placeholder*="email" i], input[placeholder*="Email" i]').type(email);
  cy.get('input[type="password"], input[placeholder*="password" i], input[placeholder*="Password" i]').type(password);
  cy.get('button').contains(/login|sign in|submit/i).click();
});

// Fill form field
Cypress.Commands.add('fillForm', (fields) => {
  fields.forEach((field) => {
    if (field.selector) {
      cy.get(field.selector).type(field.value);
    }
  });
});

// Wait for element
Cypress.Commands.add('waitForElement', (selector, timeout = 5000) => {
  cy.get(selector, { timeout }).should('be.visible');
});
