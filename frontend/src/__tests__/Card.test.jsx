import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "../components/ui/card"; // Adjust path if needed

describe("Card components", () => {
  test("renders a full card with all sections", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardAction>Action</CardAction>
          <CardDescription>Card description here</CardDescription>
        </CardHeader>
        <CardContent>Card body content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Card description here")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Card body content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  test("applies custom class to CardTitle", () => {
    render(<CardTitle className="text-red-500">Styled Title</CardTitle>);
    const title = screen.getByText("Styled Title");
    expect(title).toHaveClass("text-red-500");
  });
});
