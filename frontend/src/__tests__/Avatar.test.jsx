import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { vi } from "vitest";

describe("Avatar components", () => {
  test("renders Avatar with AvatarImage", () => {
    render(
      <Avatar>
        <AvatarImage alt="Profile picture" src="test.jpg" />
      </Avatar>
    );

    const image = screen.getByTestId("avatar-image");
    // expect(image).toHaveAttribute("src", "test.jpg");
    expect(image).toBeInTheDocument();
    // expect(image).toHaveAttribute("src", "test.jpg");
  });

  test("renders Avatar with AvatarFallback", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});
