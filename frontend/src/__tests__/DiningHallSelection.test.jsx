import { render, screen, fireEvent } from "@testing-library/react";
import DiningHallSelection from "@/components/DiningHallSelection";

describe("DiningHallSelection", () => {
  const halls = ["D1", "D2", "Marketplace"];

  it("renders all dining halls with correct labels", () => {
    render(<DiningHallSelection diningHalls={halls} onSelect={() => {}} />);
    halls.forEach(hall => {
      expect(screen.getByText(hall)).toBeInTheDocument();
    });
  });

  it("renders the heading", () => {
    render(<DiningHallSelection diningHalls={halls} onSelect={() => {}} />);
    expect(screen.getByText("Please select your dining hall:")).toBeInTheDocument();
  });

  it("calls onSelect with correct hall when clicked", () => {
    const mockOnSelect = vi.fn(); // or jest.fn() if using Jest
    render(<DiningHallSelection diningHalls={halls} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByText("D2"));
    expect(mockOnSelect).toHaveBeenCalledWith("D2");
  });
});
