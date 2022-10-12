// Start React and Node Servers before running any tests

describe("join an existing room and perform various actions inside waitroom", () => {
  const roomId = "testing123";

  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.createSocket(roomId);
    cy.joinExistingRoom(roomId);
  });

  afterEach(() => {
    cy.leaveRoom(roomId);
  });

  it("join an existing room", () => {});

  it("join an existing room, send a message. Message should be displayed for all players in the room", () => {
    cy.request(`http://localhost:3001/socket/send_message?roomid=${roomId}`);
    cy.get(
      "#root > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(1) > div"
    ).contains(/test message/i);
  });

  it("join an existing room & wait for the creator to start the game", () => {
    cy.request(`http://localhost:3001/socket/start_game?roomid=${roomId}`);
    cy.contains(/Game is starting in/i);
  });
});
