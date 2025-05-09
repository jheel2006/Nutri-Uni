import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

// Mock Clerk components
vi.mock("@clerk/clerk-react", () => ({
  SignedIn: ({ children }) => <>{children}</>,
  SignedOut: ({ children }) => <>{children}</>,
  SignInButton: () => <div data-testid="sign-in-button">Sign In</div>,
  UserButton: () => <div data-testid="user-button">User</div>,
}));

// Mock pages and components
vi.mock("@/pages/AdminDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));
vi.mock("@/pages/StudentDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="student-dashboard">Student Dashboard</div>,
}));
vi.mock("@/components/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));
vi.mock("@/components/StudentInitializer", () => ({
  __esModule: true,
  default: () => <div data-testid="student-initializer">Initializer</div>,
}));
vi.mock("@/components/AddFoodItemForm", () => ({
  __esModule: true,
  default: () => <div data-testid="add-food">Add Food</div>,
}));
vi.mock("@/components/AddMenuItemForm", () => ({
  __esModule: true,
  default: () => <div data-testid="add-menu">Add Menu</div>,
}));
vi.mock("@/components/RoleRedirector", () => ({
  __esModule: true,
  default: () => <div data-testid="redirector">Redirector</div>,
}));
vi.mock("@/components/UserProfile", () => ({
  __esModule: true,
  default: () => <div data-testid="user-profile">User Profile</div>,
}));
vi.mock("@/components/LandingPage", () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div data-testid="landing-page" onClick={onClose}>Landing</div>
  ),
}));

describe("App.jsx", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders SignedIn block and core routes", () => {
    render(<App />);
    expect(screen.getByTestId("redirector")).toBeInTheDocument();
    expect(screen.getByTestId("student-initializer")).toBeInTheDocument();
  });

  it("renders /admin/dashboard route", () => {
    window.history.pushState({}, "Test page", "/admin/dashboard");
    render(<App />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("renders /admin/add-item route", () => {
    window.history.pushState({}, "Test page", "/admin/add-item");
    render(<App />);
    expect(screen.getByTestId("add-food")).toBeInTheDocument();
  });

  it("renders /admin/add-to-menu route", () => {
    window.history.pushState({}, "Test page", "/admin/add-to-menu");
    render(<App />);
    expect(screen.getByTestId("add-menu")).toBeInTheDocument();
  });

  it("renders /student/profile route", () => {
    window.history.pushState({}, "Test page", "/student/profile");
    render(<App />);
    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
  });

  it("renders /student/dashboard route", () => {
    window.history.pushState({}, "Test page", "/student/dashboard");
    render(<App />);
    expect(screen.getByTestId("student-dashboard")).toBeInTheDocument();
  });

  it("renders SignedOut LandingPage and closes it on click", () => {
    render(<App />);
    const modal = screen.getByTestId("landing-page");
    expect(modal).toBeInTheDocument();
    modal.click();
    
  });
});
