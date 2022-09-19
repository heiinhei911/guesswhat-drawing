/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable {
    createSocket(roomId: string): Chainable<void>;
    createNewRoom(): Chainable<string>;
    joinExistingRoom(roomId: string): Chainable<void>;
  }
}

Cypress.Commands.add("createSocket", (roomId: string) => {
  cy.request(`http://localhost:3001/socket/join?roomid=${roomId}`);
});

Cypress.Commands.add("createNewRoom", () => {
  cy.get('input[placeholder="Your name..."]').type("Steve");
  cy.contains("button", /create/i).click();
  cy.contains(/waitroom/i);
  return cy.url();
});

Cypress.Commands.add("joinExistingRoom", (roomId: string) => {
  cy.get('input[placeholder="Your name..."]').type("Steve");
  cy.get('input[placeholder="Room ID..."]').type(roomId);
  cy.contains("button", /join/i).click();
  cy.contains(/waitroom/i);
  cy.get(
    "#root > div > div:nth-child(2) > div > div:nth-child(2) > div"
  ).contains("2");
});
