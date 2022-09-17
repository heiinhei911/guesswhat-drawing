import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("", () => {
  test("renders home screen", () => {
    render(<App />);

    const nameElement = screen.getByRole("textbox", {
      name: /enter your name:/i,
    });

    expect(nameElement).toBeInTheDocument();
  });
});
