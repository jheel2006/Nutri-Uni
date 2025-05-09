// src/__tests__/NutritionInfo.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NutritionInfo } from "@/components/NutritionInfo"; // update path as needed
import { vi } from "vitest";

const mockItem = {
  food_info: {
    energy: 250,
    fats: 8,
    protein: 10,
    sugar: 5,
    salt: 1.2,
    energy_kj: 1045,
    energy_percent: 13,
    fats_percent: 10,
    protein_percent: 20,
    sugar_percent: 8,
    salt_percent: 12,
  },
};

describe("NutritionInfo", () => {
  it("renders nothing when 'open' is false", () => {
    const { container } = render(<NutritionInfo item={mockItem} open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when item.food_info is missing", () => {
    const { container } = render(<NutritionInfo item={{}} open={true} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly with nutritional info", () => {
    render(<NutritionInfo item={mockItem} open={true} onClose={() => {}} />);
    
    expect(screen.getByText("Nutritional Information")).toBeInTheDocument();
    expect(screen.getByText("250 kcal")).toBeInTheDocument();
    expect(screen.getByText("8 g")).toBeInTheDocument();
    expect(screen.getByText("10 g")).toBeInTheDocument();
    expect(screen.getByText("5 g")).toBeInTheDocument();
    expect(screen.getByText("1.2 g")).toBeInTheDocument();
    expect(screen.getByText("1045 kJ")).toBeInTheDocument();
    expect(screen.getByText("13%")).toBeInTheDocument();
    expect(screen.getAllByText("20%").length).toBeGreaterThan(0);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<NutritionInfo item={mockItem} open={true} onClose={onClose} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
