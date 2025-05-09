import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuCard from "@/components/MenuCard";
import { vi } from "vitest";
import { useUser } from "@clerk/clerk-react";
import { addFavorite, removeFavorite } from "@/api/favorites";

// Mock dependencies
vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: { id: "user_1" }
  })
}));

vi.mock("@/api/favorites", () => ({
  addFavorite: vi.fn(),
  removeFavorite: vi.fn()
}));

const mockItem = {
  id: "menu_1",
  counter: "Grill",
  days_available: ["Wednesday", "Monday", "Friday"],
  food_info: {
    id: "food_1",
    item_name: "Grilled Paneer",
    item_photo_link: "",
    veg: true,
    vegan: false,
    gluten_free: true,
    allergens: ["Milk"],
    health_score: 85,
  },
};

const defaultProps = {
  item: mockItem,
  onClick: vi.fn(),
  onFavoriteUpdate: vi.fn(),
};

describe("MenuCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders menu card with item name", () => {
    render(<MenuCard {...defaultProps} isFavorited={false} />);
    expect(screen.getByText("Grilled Paneer")).toBeInTheDocument();
  });

  it("displays dietary badges", () => {
    render(<MenuCard {...defaultProps} isFavorited={false} />);
    expect(screen.getByText("Vegetarian")).toBeInTheDocument();
    expect(screen.getByText("Gluten Free")).toBeInTheDocument();
  });

  it("displays allergens and counter", () => {
    render(<MenuCard {...defaultProps} isFavorited={false} />);
    expect(screen.getByText(/Allergens:/i)).toBeInTheDocument();
    expect(screen.getByText("Grill")).toBeInTheDocument();
  });


  it("calls onClick when card is clicked", () => {
    render(<MenuCard {...defaultProps} isFavorited={false} />);
    fireEvent.click(screen.getByText("Grilled Paneer"));
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockItem);
  });

  it("adds item to favorites", async () => {
    render(<MenuCard {...defaultProps} isFavorited={false} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle favorite/i }));
    await waitFor(() => {
      expect(addFavorite).toHaveBeenCalledWith("user_1", "food_1");
      expect(defaultProps.onFavoriteUpdate).toHaveBeenCalled();
    });
  });

  it("removes item from favorites", async () => {
    render(<MenuCard {...defaultProps} isFavorited={true} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle favorite/i }));
    await waitFor(() => {
      expect(removeFavorite).toHaveBeenCalledWith("user_1", "food_1");
      expect(defaultProps.onFavoriteUpdate).toHaveBeenCalled();
    });
  });
});
