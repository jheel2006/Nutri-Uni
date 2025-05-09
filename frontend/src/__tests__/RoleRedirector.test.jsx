// src/__tests__/RoleRedirector.test.jsx
import { render } from "@testing-library/react";
import RoleRedirector from "@/components/RoleRedirector";
import { vi } from "vitest";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";

// Mocks
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

const mockNavigate = vi.fn();
const mockUseUser = useUser;
const mockUseNavigate = useNavigate;
const mockUseLocation = useLocation;

describe("RoleRedirector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it("does nothing if user is not loaded", () => {
    mockUseUser.mockReturnValue({ user: null });
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(<RoleRedirector />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects admin to /admin/dashboard", () => {
    mockUseUser.mockReturnValue({ user: { publicMetadata: { role: "admin" } } });
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(<RoleRedirector />);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("redirects student to /student/dashboard", () => {
    mockUseUser.mockReturnValue({ user: { publicMetadata: { role: "student" } } });
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(<RoleRedirector />);
    expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
  });

  it("does nothing if path is not /", () => {
    mockUseUser.mockReturnValue({ user: { publicMetadata: { role: "admin" } } });
    mockUseLocation.mockReturnValue({ pathname: "/other" });

    render(<RoleRedirector />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
