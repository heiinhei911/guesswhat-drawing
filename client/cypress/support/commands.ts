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
    createSocket(roomId: string | JQuery<HTMLElement>): Chainable<void>;
    createNewRoom(): Chainable<void>;
    joinExistingRoom(roomId: string): Chainable<void>;
    startRound(): Chainable<void>;
  }
}

Cypress.Commands.add("createSocket", (roomId: string | JQuery<HTMLElement>) => {
  cy.request(`http://localhost:3001/socket/join?roomid=${roomId}`);
});

Cypress.Commands.add("createNewRoom", () => {
  cy.get('input[placeholder="Your name..."]').type("Steve");
  cy.contains("button", /create/i).click();
  cy.contains(/waitroom/i).should("be.visible");
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

Cypress.Commands.add("startRound", () => {
  cy.createNewRoom();
  cy.location("pathname").invoke("split", "/").its(1).as("tempRoomId");
  cy.get("@tempRoomId").then((tempRoomId) => cy.createSocket(tempRoomId));
  cy.contains(/start game/i).click();
  cy.get("canvas", { timeout: 6000 }).should("be.visible");
});
