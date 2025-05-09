import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import StudentDashboard from "../pages/StudentDashboard";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import * as studentAPI from "../api/students";
import * as favoritesAPI from "../api/favorites";
import { vi } from "vitest";

// 🧪 Mock dependencies
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
}));
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
      ...actual,
      useLocation: vi.fn(),
      useNavigate: vi.fn(() => vi.fn()), //return error fixed
    };
  });
  
vi.mock("../api/students", () => ({
  getRecommendations: vi.fn(),
  getStudentInfo: vi.fn(),
}));
vi.mock("../api/favorites", () => ({
  getFavorites: vi.fn(),
}));


describe("StudentDashboard", () => {
  beforeEach(() => {
    useUser.mockReturnValue({ user: { id: "123", firstName: "Test" } });
    useLocation.mockReturnValue({ state: { tab: "menu" } });

    studentAPI.getRecommendations.mockResolvedValue({
      data: [
        {
          id: "1",
          day: "Monday",
          dining_hall: "D1",
          counter: "Salad",
          food_info: {
            id: "f1",
            item_name: "Salad Bowl",
            energy: 200,
            fats: 10,
            protein: 5,
            sugar: 2,
            salt: 0.5,
            veg: true,
            vegan: false,
            gluten_free: true,
            allergens: ["nuts"],
            health_score: 80,
          },
        },
      ],
    });

    studentAPI.getStudentInfo.mockResolvedValue({
      data: {
        is_veg: true,
        is_vegan: false,
        is_gluten_free: true,
        allergens: [],
      },
    });

    favoritesAPI.getFavorites.mockResolvedValue({
      data: [{ food_id: "f1" }],
    });
  });

  test("renders dashboard and filters meals", async () => {
    render(<StudentDashboard />);
  
    await waitFor(() => {
      expect(screen.getByText("Hello Test,")).toBeInTheDocument();
    });
  
    // Select Dining Hall
    fireEvent.click(screen.getByText("D1"));
  
    // Wait for counters to appear
    await waitFor(() => {
      expect(screen.getByText("Salad")).toBeInTheDocument();
    });
  
    // Select Counter
    fireEvent.click(screen.getByText("Salad"));
  
    // Check filtered meal card appears
    await waitFor(() => {
      expect(screen.getByText(/Salad Bowl/i)).toBeInTheDocument();
    });
  });  

 

  test("displays error on fetch failure", async () => {
    studentAPI.getRecommendations.mockRejectedValueOnce(new Error("fail"));
    studentAPI.getStudentInfo.mockRejectedValueOnce(new Error("fail"));
    favoritesAPI.getFavorites.mockRejectedValueOnce(new Error("fail"));

    render(<StudentDashboard />);

     // Simulate selecting a dining hall (triggers error render)
  const hallButton = await screen.findByText("D1");
  fireEvent.click(hallButton);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load meals/i)).toBeInTheDocument();
    });
  });
});
