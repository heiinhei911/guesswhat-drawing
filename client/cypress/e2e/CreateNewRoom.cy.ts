describe("create a room and perform various actions inside waitroom", () => {
  const roomId = "testing123";

  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.createNewRoom();
  });

  it("create a room", () => {});

  it("create & leave a room", () => {
    cy.contains(/leave room/i).click();
    cy.contains("button", /create/i);
  });

  it("create a room & it should ask the creator to invite more people", () => {
    cy.contains(/invite one more player to start the game!/i);
  });

  it("create a room, let another player joins the room, only then the creator is allowed to start the game", () => {
    cy.createSocket(roomId);
    cy.get("span").should(
      "not.contain.text",
      /invite one more player to start the game!/i
    );
    cy.leaveRoom(roomId);
  });

  it("create a room, send a message. Message should be displayed in the chat", () => {
    cy.get('input[placeholder="Type in your message..."]').type("hello");
    cy.contains(/send/i).click();
    cy.get(
      "#root > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(1) > div"
    ).contains("hello");
  });

  it("create a room & adjust number of rounds and duration", () => {
    cy.get("[data-testid='no-rounds']").type("{selectall}").type("5");
    cy.get("[data-testid='no-rounds']").should("have.value", "5");

    cy.get("[data-testid='no-rounds']").type("{selectall}").type("11");
    cy.contains(/rounds must be between 1 and 10/i);

    cy.get("[data-testid='no-rounds']").type("{selectall}").type("0");
    cy.contains(/rounds must be between 1 and 10/i);

    cy.get("[data-testid='duration-rounds']").type("{selectall}").type("5");
    cy.get("[data-testid='duration-rounds']").should("have.value", "5");

    cy.get("[data-testid='duration-rounds']").type("{selectall}").type("-1");
    cy.contains(/duration must be between 1 and 5 minutes/i);

    cy.get("[data-testid='duration-rounds']").type("{selectall}").type("6");
    cy.contains(/duration must be between 1 and 5 minutes/i);
  });
});
