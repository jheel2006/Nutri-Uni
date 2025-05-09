import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddMenuItemForm from "@/components/AddMenuItemForm";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ToastContext"; 
import { vi } from "vitest";
import * as mealsApi from "@/api/meals";

vi.mock("@/api/meals", () => ({
  __esModule: true,
  getFoodItems: vi.fn(() => Promise.resolve({ data: [{ id: 1, item_name: "Mock Food" }] })),
  getWeekMenu: vi.fn(() => Promise.resolve({ data: [] })),
  addMenuItem: vi.fn(() => Promise.resolve()),
}));

describe("AddMenuItemForm", () => {
  it("renders the form with all dropdowns and day checkboxes", () => {
    render(
      <MemoryRouter>
        <ToastProvider><AddMenuItemForm /></ToastProvider>
      </MemoryRouter>
    );

    // Check for dropdowns
    expect(screen.getByText("Select Food item")).toBeInTheDocument();
    expect(screen.getByText("Select Dining Hall")).toBeInTheDocument();
    expect(screen.getByText("Select Days")).toBeInTheDocument();

    // Check a few day checkboxes
    expect(screen.getByLabelText("Monday")).toBeInTheDocument();
    expect(screen.getByLabelText("Sunday")).toBeInTheDocument();
  });


  it("submits the form successfully and shows success toast", async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <AddMenuItemForm />
        </ToastProvider>
      </MemoryRouter>
    );
  
    // Wait for food dropdown to populate
    await screen.findByText("Mock Food");
  
    // Select a food item
    fireEvent.change(screen.getByDisplayValue("Select Food item"), {
      target: { value: "1" }
    });
  
    // Select dining hall
    fireEvent.change(screen.getByDisplayValue("Select Dining Hall"), {
      target: { value: "D1" }
    });
  
    // Select counter
    await waitFor(() => {
      const counterDropdown = screen.getByDisplayValue("Select Counter");
      fireEvent.change(counterDropdown, { target: { value: "Salad" } });
    });
  
    // Select days
    fireEvent.click(screen.getByLabelText("Monday"));
    fireEvent.click(screen.getByLabelText("Tuesday"));
  
    // Submit
    fireEvent.click(screen.getByText("Add"));
  
    await waitFor(() => {
      expect(mealsApi.addMenuItem).toHaveBeenCalledTimes(2);
    });
  });
  
});
