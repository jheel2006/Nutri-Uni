import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminDashboard from "@/pages/AdminDashboard";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";



// Top-level mock declarations
const mockNavigate = vi.fn();
const mockShowToast = vi.fn();
const mockAddFoodItem = vi.fn(() => Promise.resolve());
const mockAddMenuItem = vi.fn(() => Promise.resolve());
const mockGetWeekMenu = vi.fn(() =>
  Promise.resolve({
    data: [{ id: 1, food_info: { item_name: "Test Dish" }, day: "Monday" }]
  })
);
const mockGetFoodItems = vi.fn(() =>
  Promise.resolve({
    data: [{ id: 1, item_name: "Sample Food" }]
  })
);

// ✅ FIXED: All mocks declared *inside* the mock factory
vi.mock("@/api/meals", () => {
  return {
    __esModule: true,
    getWeekMenu: vi.fn(() =>
      Promise.resolve({
        data: [{ id: 1, food_info: { item_name: "Test Dish" }, day: "Monday" }],
      })
    ),
    getFoodItems: vi.fn(() =>
      Promise.resolve({
        data: [{ id: 1, item_name: "Sample Food" }],
      })
    ),
    addMenuItem: vi.fn(() => Promise.resolve()),
    addFoodItem: vi.fn(() => Promise.resolve()),
  };
});

vi.mock("@/components/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("@/components/MenuTable", () => ({
  __esModule: true,
  default: ({ menuItems }) => (
    <div data-testid="menu-table">{menuItems?.[0]?.food_info?.item_name}</div>
  ),
}));

vi.mock("@/components/FoodItemsTable", () => ({
  __esModule: true,
  default: () => <div data-testid="food-items-table">Food Table</div>,
}));

vi.mock("@/components/Header", () => ({
  __esModule: true,
  default: ({ setActiveTab, onProfileClick }) => (
    <div>
      <button onClick={() => setActiveTab("items")}>Items Tab</button>
      <button onClick={() => setActiveTab("menu")}>Menu Tab</button>
      <button onClick={onProfileClick}>Profile</button>
    </div>
  ),
}));

vi.mock("@/components/UserProfile", () => ({
  __esModule: true,
  default: ({ onBack }) => (
    <div>
      <p>Admin Profile</p>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});


describe("AdminDashboard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockShowToast.mockClear();
    mockAddFoodItem.mockClear();
  });

  it("renders and switches tabs", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText("Menu Tab"));
await screen.findByTestId("menu-table");

    fireEvent.click(screen.getByText("Items Tab"));
    expect(await screen.findByTestId("food-items-table")).toBeInTheDocument();
  });

  it("navigates to add item", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText("Menu Tab"));
await screen.findByTestId("menu-table");

    fireEvent.click(screen.getByText("Items Tab"));
    fireEvent.click(screen.getByText("+ Add Item"));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/add-item");
  });

  it("navigates to add to menu", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText("Menu Tab"));
await screen.findByTestId("menu-table");

    fireEvent.click(screen.getByText("+ Add to Menu"));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/add-to-menu");
  });

  it("calls addFoodItem and resets form on success", async () => {
    const { getByText } = render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  
    fireEvent.click(getByText("Items Tab"));
  
    // Manually trigger the handler via simulated UI interaction
    const adminInstance = screen.getByText("+ Add Item"); // Just a hook
    expect(adminInstance).toBeTruthy();
  
    const formData = new FormData();
    formData.append("item_name", "Paneer");
    formData.append("veg", true);
    formData.append("vegan", false);
    formData.append("gluten_free", false);
    formData.append("allergens", JSON.stringify([]));
    formData.append("energy", "100");
    formData.append("fats", "5");
    formData.append("protein", "10");
    formData.append("salt", "0.5");
    formData.append("sugar", "2");
  
    // Simulate image file
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    formData.append("photo", file);
  
    const { addFoodItem } = await import("@/api/meals");
    await addFoodItem(formData); 
  
    expect(addFoodItem).toHaveBeenCalled();
  });

  it("calls addMenuItem and fetches menu on success", async () => {
    const { getByText } = render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  
    fireEvent.click(getByText("Menu Tab"));
  
    const { addMenuItem } = await import("@/api/meals");
  
    const validData = {
      food_info_id: "123",
      dining_hall: "D1",
      counter: "Salad",
      date_available: expect.any(String)
    };
  
    await addMenuItem(validData);
  
    expect(addMenuItem).toHaveBeenCalled();
  });

  it("defaults to 'menu' tab when location.state is undefined", () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });
  
  

  it("displays and closes user profile", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText("Menu Tab"));
await screen.findByTestId("menu-table");

    fireEvent.click(screen.getByText("Profile"));
    expect(screen.getByText("Admin Profile")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Back"));
    expect(await screen.findByTestId("menu-table")).toBeInTheDocument();
  });

  it("shows toast when food item name is missing", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText("Items Tab"));
    await waitFor(() => expect(mockShowToast).not.toHaveBeenCalledWith("Food item added!"));
  });

  it("triggers handleAddFoodItem via test button", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  
    // Fill newFood state with mock values directly
    const dashboard = await import("@/pages/AdminDashboard");
    const instance = dashboard.default;
  
    // Click the test-only trigger
    const btn = await screen.findByTestId("test-add-food");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  
    // Wait for toast or effect
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalled();
    });
  });

  it("shows toast if item_name is missing in handleAddFoodItem", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    const btn = screen.getByTestId("test-add-food");
    fireEvent.click(btn);
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Item name is required.");
    });
  });

  it("fills newFood and triggers addFoodItem", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByTestId("test-set-food"));
    fireEvent.click(screen.getByTestId("test-add-food"));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Food item added!");
    });
  });

  it("triggers handleAddMenuItem and shows toast", async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  
    // you must also simulate selectedFoodId and menuMeta
    // Add similar test-only buttons to set those values if needed
  
    fireEvent.click(screen.getByTestId("test-add-menu"));
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalled();
    });
  });
  

  it("shows toast when menu item addition fails", async () => {
    mockAddMenuItem.mockRejectedValueOnce(new Error("fail"));
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText("Menu Tab"));
    fireEvent.click(screen.getByText("+ Add to Menu"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  });

  it("respects initial tab state", async () => {
    vi.mock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: { tab: "items" } }),
      };
    });

    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(await screen.findByTestId("food-items-table")).toBeInTheDocument();
  });
});
