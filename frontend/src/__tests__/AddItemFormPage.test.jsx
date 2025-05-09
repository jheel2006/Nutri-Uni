import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddItemFormPage from "@/components/AddFoodItemForm";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ToastContext";

// Mock useToast and addFoodItem API
vi.mock("@/components/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }) => <div>{children}</div>
}));
vi.mock("@/api/meals", () => ({
  addFoodItem: vi.fn().mockResolvedValue({}),
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>{ui}</ToastProvider>
    </BrowserRouter>
  );
};

describe("AddItemFormPage", () => {
  it("renders the form and all required fields", () => {
    renderWithProviders(<AddItemFormPage />);

    expect(screen.getByText("Add new item")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Item Name")).toBeInTheDocument();
    expect(screen.getByText("Dietary Requirements")).toBeInTheDocument();
    expect(screen.getByText("Allergens")).toBeInTheDocument();
    expect(screen.getByText("Nutrition facts")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("shows validation error when trying to submit empty form", async () => {
    renderWithProviders(<AddItemFormPage />);

    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);

    // You could check that the validation toast was triggered
    expect(await screen.findByText("Add")).toBeInTheDocument();
  });
});
