import { render, screen, fireEvent } from "@testing-library/react";
import Chat from "../components/Chat";
import { ChatTypes } from "../enums";
import { IMessageData } from "@backend/interfaces";
import { SocketServerMock } from "socket.io-mock-ts";

const roomId = "testing123";

beforeEach(() => {
  render(<Chat type={ChatTypes.chat} />);
});

describe("initial render", () => {
  it("renders input field", () => {
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("renders 'send' button", () => {
    expect(screen.getByRole("button", { name: /send/i })).toBeEnabled();
  });
});

describe("send & receive messages", () => {
  it("type in messages in input field & send the message", () => {
    const inputField = screen.getByRole("textbox");
    const sendBtn = screen.getByRole("button", { name: /send/i });
    const value = "Test Message";

    expect(inputField).toBeEnabled();
    fireEvent.change(inputField, { target: { value } });
    expect(inputField).toHaveValue(value);
    fireEvent.click(sendBtn);
    expect(inputField).toHaveValue("");
  });

  it("send and receive a chat message", () => {
    const socket = new SocketServerMock();
    const client = socket.clientMock;
    socket.join(roomId);
    const messageData: IMessageData = {
      room: roomId,
      author: "Test User",
      message: "Test Message",
      time: "01:11:11 AM",
      type: ChatTypes.chat,
    };

    socket.on("receive_chat", (messageData: IMessageData) => {
      // await waitFor(() => {
      expect(messageData.message).toBe("Test Message");
      // });
    });
    client.emit("receive_chat", messageData);
    socket.disconnect();
    client.close();
  });
});
