import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FoodItemsTable from "@/components/FoodItemsTable";
import * as api from "@/api/meals";
import { vi } from "vitest";
import React from "react";

const mockData = [
  {
    id: 1,
    item_name: "Paneer Tikka",
    veg: true,
    vegan: false,
    gluten_free: true,
    allergens: ["Milk"],
    item_photo_link: "",
    energy: 200,
    protein: 10,
    fats: 5,
    salt: 0.3,
    sugar: 2,
  }
];

vi.mock("@/components/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/components/ui/multiselect", () => ({
  MultiSelect: ({ selected = [], onChange }) => (
    <select
      data-testid="mock-multiselect"
      value={selected[0] || ""}
      onChange={(e) => onChange([e.target.value])}
    >
      <option value="">None</option>
      <option value="Milk">Milk</option>
    </select>
  ),
}));

describe("FoodItemsTable", () => {
  beforeEach(() => {
    vi.spyOn(api, "getFoodItems").mockResolvedValue({ data: mockData });
    vi.spyOn(api, "updateFoodItem").mockResolvedValue({});
    vi.spyOn(api, "deleteFoodItem").mockResolvedValue({});
  });

  it("renders table with data", async () => {
    render(<FoodItemsTable />);
    await waitFor(() => {
      expect(screen.getByText("Paneer Tikka")).toBeInTheDocument();
    });
    expect(screen.getByText("Veg")).toBeInTheDocument();
    expect(screen.getByText("GF")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();
  });

  it("allows editing and saving", async () => {
    render(<FoodItemsTable refresh={() => {}} />);
    await screen.findByText("Paneer Tikka");

    fireEvent.click(screen.getByText(/Edit/i));
    const input = screen.getByDisplayValue("Paneer Tikka");
    fireEvent.change(input, { target: { value: "New Tikka" } });

    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(api.updateFoodItem).toHaveBeenCalled();
    });
  });

  it("opens and cancels delete dialog", async () => {
    render(<FoodItemsTable refresh={() => {}} />);
    await screen.findByText("Paneer Tikka");

    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText("Delete Food Item")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByText("Delete Food Item")).not.toBeInTheDocument();
    });
  });
});