import { render, screen, waitFor } from "@testing-library/react";
import SetRound from "../components/SetRound";
import { IGameData } from "@backend/interfaces";
import { SocketClientMock, SocketServerMock } from "socket.io-mock-ts";
import { act } from "react-dom/test-utils";

const roomId = "testing123";

beforeEach(() => {
  act(() => {
    render(<SetRound />);
  });
});

describe("initial render", () => {
  it("renders 'waiting to start' text", () => {
    expect(
      screen.getByText(/waiting for the creator to start the game\.\.\./i)
    ).toBeInTheDocument();
  });
});

describe("the countdown timer should start/stop for all other players when the creator starts/stops the game", () => {
  let socket: SocketServerMock;
  let client: SocketClientMock;
  beforeEach(() => {
    socket = new SocketServerMock();
    client = socket.clientMock;
    socket.join(roomId);
  });

  afterEach(() => {
    socket.disconnect();
    client.close();
  });

  it("start countdown timer when the creator starts the game", (done) => {
    const gameData: IGameData = {
      room: roomId,
      rounds: 2,
      duration: 1,
    };
    client.on("receive_start_game", async (gameData: IGameData) => {
      await waitFor(() => {
        expect(gameData.rounds).toBe(2);
        expect(gameData.duration).toBe(1);
        done();
      });
    });
    socket.emit("receive_start_game", gameData);
  });

  //   it("renders number of rounds input", async () => {
  //     // Assert
  //     await waitFor(() => {
  //       expect(screen.findByTestId("no-rounds")).toHaveValue("1");
  //     });
  //   });
  //   it("renders duration of rounds input", () => {
  //     expect(screen.findByTestId("duration-rounds")).toHaveValue("1");
  //   });
  //   it("renders 'copy to clipboard' text", () => {
  //     expect(
  //       screen.findByText(/the room id has been copied to your clipboard/i)
  //     ).toBeInTheDocument();
  //   });
  //   it("renders 'start game' button", () => {
  //     expect(screen.findByText(/start game/i)).toBeInTheDocument();
  //   });
  // it("renders 'waiting to start game' text", () => {
  //   expect(
  //     screen.getByText(/waiting for the creator to start the game/i)
  //   ).toBeInTheDocument();
});
