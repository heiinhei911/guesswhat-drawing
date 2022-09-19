import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";

// Unit Testing for 'Home' component

let nameInput: HTMLInputElement,
  roomIdInput: HTMLInputElement,
  createBtn: HTMLButtonElement,
  joinBtn: HTMLButtonElement;

describe("initial render", () => {
  beforeEach(async () => {
    // Arrange
    render(
      <Router>
        <Routes>
          <Route path="/">
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    );

    nameInput = screen.getByRole("textbox", {
      name: /enter your name:/i,
    });
    roomIdInput = screen.getByRole("textbox", {
      name: /enter a room ID:/i,
    });
    createBtn = screen.getByRole("button", { name: /create/i });
    joinBtn = screen.getByRole("button", {
      name: /join/i,
    });
  });

  test("renders empty name field", () => {
    // Assert
    expect(nameInput).toHaveValue("");
  });

  test("renders empty room ID field", () => {
    expect(roomIdInput).toHaveValue("");
  });

  test("renders 'Create' button", () => {
    expect(createBtn).toBeEnabled();
  });

  test("renders disabled 'Join' button", () => {
    expect(joinBtn).toBeDisabled();
  });
});

describe("filling in 'RoomID' and/or 'name' fields should have different effects on 'create' and 'join' buttons", () => {
  beforeEach(async () => {
    // Arrange
    act(() => {
      render(
        <Router>
          <Routes>
            <Route path="/">
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>
        </Router>
      );
    });

    nameInput = screen.getByRole("textbox", {
      name: /enter your name:/i,
    });
    roomIdInput = screen.getByRole("textbox", {
      name: /enter a room ID:/i,
    });
    createBtn = screen.getByRole("button", { name: /create/i });
    joinBtn = screen.getByRole("button", {
      name: /join/i,
    });
  });

  test("joining with an empty 'name' field should throw an error", async () => {
    // Act
    userEvent.click(createBtn);
    await waitFor(() => {
      // Assert
      expect(screen.getByText(/name can't be empty/i)).toBeInTheDocument();
    });
  });

  test("filling out the Room ID should enable 'join' and disable 'create' buttons", async () => {
    fireEvent.change(roomIdInput, { target: { value: "qwertyuiop" } });
    await waitFor(() => {
      expect(createBtn).toBeDisabled();
      expect(joinBtn).toBeEnabled();
    });
  });

  test("filling out a Room ID that doesn't exist with Name filled out should throw an error", async () => {
    fireEvent.change(roomIdInput, { target: { value: "qwertyuiop" } });
    fireEvent.change(nameInput, { target: { value: "Steve" } });
    userEvent.click(joinBtn);
    await waitFor(() => {
      expect(joinBtn).toBeInTheDocument();
    });
  });
});
