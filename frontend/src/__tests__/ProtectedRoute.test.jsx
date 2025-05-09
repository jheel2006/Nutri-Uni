// src/__tests__/ProtectedRoute.test.jsx
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { vi } from "vitest";

// 👇 mock Clerk's useUser hook
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
}));

const { useUser } = await import("@clerk/clerk-react");

describe("ProtectedRoute", () => {
  it("shows loading when user is not loaded", () => {
    useUser.mockReturnValue({ isLoaded: false, user: null });

    render(
      <ProtectedRoute roleRequired={["admin"]}>
        <div>Secret Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders children when user role is allowed", () => {
    useUser.mockReturnValue({
      isLoaded: true,
      user: { publicMetadata: { role: "admin" } },
    });

    render(
      <ProtectedRoute roleRequired={["admin"]}>
        <div>Secret Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Secret Page")).toBeInTheDocument();
  });

  it("shows access denied when role is not allowed", () => {
    useUser.mockReturnValue({
      isLoaded: true,
      user: { publicMetadata: { role: "student" } },
    });

    render(
      <ProtectedRoute roleRequired={["admin"]}>
        <div>Secret Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("🚫 Access Denied")).toBeInTheDocument();
  });

  it("defaults to 'student' role if role is undefined", () => {
    useUser.mockReturnValue({
      isLoaded: true,
      user: { publicMetadata: {} },
    });

    render(
      <ProtectedRoute roleRequired={["student"]}>
        <div>Student Page</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Student Page")).toBeInTheDocument();
  });
});
