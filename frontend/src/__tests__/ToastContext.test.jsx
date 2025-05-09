// src/__tests__/ToastContext.test.jsx
import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/ToastContext";
import { vi } from "vitest";
import React from "react";

// Test component that uses the context
const TestComponent = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast("Hello World!")}>Show Toast</button>
      <button onClick={() => showToast("Success!", "success")}>Success Toast</button>
      <button onClick={() => showToast("Oops!", "error")}>Error Toast</button>
    </div>
  );
};

describe("ToastContext", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Control timers
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("shows and hides a default toast message", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText("Show Toast").click();
    });

    expect(screen.getByText("Hello World!")).toBeInTheDocument();
    expect(screen.getByText("Hello World!").className).toContain("bg-gray-700");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Hello World!")).not.toBeInTheDocument();
  });

  it("shows a success toast", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText("Success Toast").click();
    });

    const toast = screen.getByText("Success!");
    expect(toast).toBeInTheDocument();
    expect(toast.className).toContain("bg-green-500");
  });

  it("shows an error toast", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText("Error Toast").click();
    });

    const toast = screen.getByText("Oops!");
    expect(toast).toBeInTheDocument();
    expect(toast.className).toContain("bg-red-500");
  });
});
