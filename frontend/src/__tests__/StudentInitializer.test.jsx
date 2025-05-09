// src/__tests__/StudentInitializer.test.jsx
import { render } from "@testing-library/react";
import StudentInitializer from "@/components/StudentInitializer";
import { vi } from "vitest";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { initStudent } from "@/api/students";

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

vi.mock("@/api/students", () => ({
  initStudent: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockUseUser = useUser;
const mockUseNavigate = useNavigate;
const mockUseLocation = useLocation;

describe("StudentInitializer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it("does nothing if user is not signed in", () => {
    mockUseUser.mockReturnValue({ isSignedIn: false });
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(<StudentInitializer />);
    expect(initStudent).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does nothing if user is admin", () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: { publicMetadata: { role: "admin" } },
    });
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(<StudentInitializer />);
    expect(initStudent).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("initializes student and navigates if user is a student and at root", async () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: {
        id: "user_123",
        publicMetadata: { role: "student" },
        emailAddresses: [{ emailAddress: "student@example.com" }],
      },
    });
    mockUseLocation.mockReturnValue({ pathname: "/" });
    initStudent.mockResolvedValue();

    render(<StudentInitializer />);
    await Promise.resolve(); // allow effect to flush

    expect(initStudent).toHaveBeenCalledWith("user_123", "student@example.com");
    expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
  });

  it("logs an error if initStudent throws", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      user: {
        id: "user_456",
        publicMetadata: { role: "student" },
        emailAddresses: [{ emailAddress: "fail@example.com" }],
      },
    });
    mockUseLocation.mockReturnValue({ pathname: "/" });
    initStudent.mockRejectedValue(new Error("Network error"));

    render(<StudentInitializer />);
    await Promise.resolve(); // flush useEffect

    expect(consoleSpy).toHaveBeenCalledWith("Error initializing student:", "Network error");
    expect(mockNavigate).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
