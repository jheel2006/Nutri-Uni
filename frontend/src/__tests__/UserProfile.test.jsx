// src/__tests__/UserProfile.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserProfile from "@/components/UserProfile";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/components/ToastContext";

// Mock Clerk
vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: {
      id: "user_123",
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      publicMetadata: { role: "student" }
    }
  }),
  UserButton: () => <div data-testid="mock-user-button" />
}));

// Mock student API
vi.mock("@/api/students", () => ({
  getStudentInfo: vi.fn(() =>
    Promise.resolve({
      data: {
        is_veg: true,
        is_vegan: false,
        is_gluten_free: true,
        allergens: ["Milk", "Soy"]
      }
    })
  ),
  updatePreferences: vi.fn(() => Promise.resolve())
}));

describe("UserProfile", () => {
  it("renders student info and allows preference update", async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <UserProfile onBack={() => {}} isAdmin={false} />
        </ToastProvider>
      </MemoryRouter>
    );

    // Wait for fields to populate
    await screen.findByDisplayValue("test@example.com");

    // Workaround: test display values instead of getByLabelText
    expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();

    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();

    expect(screen.getByText(/Dietary Preference/i)).toBeInTheDocument();
    expect(screen.getByText(/Allergies/i)).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(screen.getByText("Preferences saved successfully.")).toBeInTheDocument()
    );
  });

  it("does not render preferences section for admin", async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <UserProfile onBack={() => {}} isAdmin={true} />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();

    // Ensure dietary preference and allergies are not shown
    expect(screen.queryByText(/Dietary Preference/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Allergies/i)).not.toBeInTheDocument();
  });
});
