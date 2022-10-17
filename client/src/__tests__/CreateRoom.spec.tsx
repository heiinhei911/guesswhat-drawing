import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { act } from "react-dom/test-utils";

describe("Creating a room", () => {
  // let mockEmitter = jest.fn();
  // jest.mock("socket.io-client", () => {
  //   return jest.fn(() => ({
  //     emit: mockEmitter,
  //     on: jest.fn(),
  //   }));
  // });

  beforeEach(() => {
    act(() => {
      render(<App />);
    });
  });

  // afterEach(() => {
  //   jest.clearAllMocks();
  // });

  test("creating a new room", async () => {
    fireEvent.change(
      screen.getByRole("textbox", {
        name: /enter your name:/i,
      }),
      { target: { value: "Steve" } }
    );
    userEvent.click(
      screen.getByRole("button", {
        name: /create/i,
      })
    );
    await waitFor(() => {
      setTimeout(() => {
        expect(screen.findByText(/waitroom/i)).toBeInTheDocument();
        expect(screen.findAllByRole("listitem")).toBe(1);
      }, 1000);
    });
  });

  // test("joining an existing room", async () => {
  //   fireEvent.change(
  //     screen.getByRole("textbox", {
  //       name: /enter your name:/i,
  //     }),
  //     { target: { value: "Sam" } }
  //   );

  //   fireEvent.change(
  //     screen.getByRole("textbox", {
  //       name: /enter your name:/i,
  //     }),
  //     { target: { value: "qwertyuiop" } }
  //   );

  //   userEvent.click(
  //     screen.getByRole("button", {
  //       name: /join/i,
  //     })
  //   );
  //   await waitFor(() => {
  //     // expect(screen.findAllByRole("listitem")).toEqual(2);
  //     expect(mockEmitter).toHaveBeenCalled();
  //   });
  // });
});
