// Initialize React and Node Server before running any test

const roomId = "testing123";

beforeEach(() => {
  cy.visit("http://localhost:3000");
});

describe("create a room and perform actions inside waitroom", () => {
  it("create a room", () => {
    cy.createNewRoom();
  });

  it("create a room & leave the room", () => {
    cy.createNewRoom();
    cy.contains(/leave room/i).click();
    cy.contains("button", /create/i);
  });

  it("create a room & send a message", () => {
    cy.createNewRoom();
    cy.get('input[placeholder="Type in your message..."]').type("hello");
    cy.contains(/send/i).click();
    cy.get(
      "#root > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(1) > div"
    ).contains("hello");
  });

  it("create a room & leave", () => {
    cy.createNewRoom();
    cy.contains(/leave room/i).click();
    cy.get('input[placeholder="Your name..."]');
  });
});

describe("join an existing room and perform actions inside waitroom", () => {
  beforeEach(() => {
    cy.createSocket(roomId);
  });

  it("join an existing room", () => {
    cy.joinExistingRoom(roomId);
  });

  it("join an existing room & send a message", () => {
    cy.joinExistingRoom(roomId);
    cy.request(`http://localhost:3001/socket/send_message?roomid=${roomId}`);
    cy.get(
      "#root > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(1) > div"
    ).contains(/test message/i);
  });
});

describe("start a round & perform actions in game", () => {
  beforeEach(() => {
    cy.startRound();
  });

  it("start a round", () => {});

  it("start a round and take a wrong guess", () => {});
});
