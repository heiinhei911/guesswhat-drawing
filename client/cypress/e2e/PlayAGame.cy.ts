describe("start a game and play the game", () => {
  let tempRoomId: JQuery<HTMLElement> | string = "";

  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.startRound().then((roomId) => {
      tempRoomId = roomId;
    });
  });

  it("take guesses or draw on canvas, depending if it's our turn", () => {
    cy.clock(new Date());
    cy.get('div[data-testid="turn"]')
      .wait(500)
      .then(($body) => {
        if ($body.text().includes("Your word:")) {
          console.log("our turn");
          cy.get("canvas")
            .trigger("pointerdown", { which: 1, force: true })
            .trigger("pointermove", {
              which: 1,
              clientX: 20,
              clientY: 40,
              force: true,
            })
            .trigger("pointerup", { force: true });
        } else {
          console.log("not our turn");
          cy.request(
            `http://localhost:3001/socket/send_message?roomid=${tempRoomId}&type=guesses`
          );
          cy.get("p").contains(/Test Message/i);

          cy.tick(59000);
          cy.clock().invoke("restore");
        }
      });
  });
});
