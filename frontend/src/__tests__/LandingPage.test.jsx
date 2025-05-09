import { render, screen } from "@testing-library/react";
import LandingPage from "@/components/LandingPage";
import { vi } from "vitest";

// Mock Clerk components
vi.mock("@clerk/clerk-react", () => ({
  SignedIn: ({ children }) => <>{children}</>,
  SignedOut: ({ children }) => <>{children}</>,
  SignInButton: ({ children }) => <>{children}</>,
}));

describe("LandingPage", () => {
  it("renders landing page header", () => {
    render(<LandingPage />);
    expect(screen.getByText("Nutri-UnI")).toBeInTheDocument();
  });

  it("shows Sign In and Get Started buttons when signed out", () => {
    render(<LandingPage />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("shows Go to Dashboard button when signed in", () => {
    // Use custom mock logic if needed here
    render(<LandingPage />);
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  });

  it("shows all 3 feature cards", () => {
    render(<LandingPage />);
    expect(screen.getByText("Smart Meal Discovery")).toBeInTheDocument();
    expect(screen.getByText("Allergy-Safe Filtering")).toBeInTheDocument();
    expect(screen.getByText("Admin Control Center")).toBeInTheDocument();
  });
});
