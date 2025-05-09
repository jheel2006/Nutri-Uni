// src/__tests__/MenuTable.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuTable from "@/components/MenuTable";
import { vi } from "vitest";

// Mocks
vi.mock("@/components/ToastContext", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock("@/api/meals", () => ({
  deleteMenuItem: vi.fn(() => Promise.resolve()),
  updateMenuItem: vi.fn(() => Promise.resolve()),
}));

const mockItems = [
  {
    id: "entry1",
    day: "Monday",
    dining_hall: "D1",
    counter: "Salad",
    food_info: {
      id: "food_001",
      item_name: "Veg Wrap",
      item_photo_link: "",
    },
  },
  {
    id: "entry2",
    day: "Wednesday",
    dining_hall: "D1",
    counter: "Salad",
    food_info: {
      id: "food_001",
      item_name: "Veg Wrap",
      item_photo_link: "",
    },
  },
];

describe("MenuTable", () => {
  it("renders loading state", () => {
    render(<MenuTable menuItems={[]} loading={true} refresh={() => {}} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<MenuTable menuItems={[]} loading={false} refresh={() => {}} />);
    expect(screen.getByText("No menu items found.")).toBeInTheDocument();
  });

  it("renders grouped menu items", () => {
    render(<MenuTable menuItems={mockItems} loading={false} refresh={() => {}} />);
    expect(screen.getByText("Veg Wrap")).toBeInTheDocument();
    expect(screen.getByText("D1")).toBeInTheDocument();
    expect(screen.getByText("Salad")).toBeInTheDocument();
    expect(screen.getByText("Monday, Wednesday")).toBeInTheDocument();
  });

  it("enters edit mode and updates input fields", () => {
    render(<MenuTable menuItems={mockItems} loading={false} refresh={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const diningHallInput = screen.getByDisplayValue("D1");
    const counterInput = screen.getByDisplayValue("Salad");

    fireEvent.change(diningHallInput, { target: { value: "New Hall" } });
    fireEvent.change(counterInput, { target: { value: "New Counter" } });

    expect(diningHallInput.value).toBe("New Hall");
    expect(counterInput.value).toBe("New Counter");
  });

  it("saves edits and calls updateMenuItem", async () => {
    const { updateMenuItem } = await import("@/api/meals");
    const refresh = vi.fn();

    render(<MenuTable menuItems={mockItems} loading={false} refresh={refresh} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.change(screen.getByDisplayValue("D1"), { target: { value: "D2" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(updateMenuItem).toHaveBeenCalled();
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("cancels edit mode", () => {
    render(<MenuTable menuItems={mockItems} loading={false} refresh={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("calls deleteMenuItem for all grouped ids", async () => {
    const { deleteMenuItem } = await import("@/api/meals");
    const refresh = vi.fn();

    render(<MenuTable menuItems={mockItems} loading={false} refresh={refresh} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(deleteMenuItem).toHaveBeenCalledTimes(2); // entry1 + entry2
      expect(refresh).toHaveBeenCalled();
    });
  });
});
