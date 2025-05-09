import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiSelect } from "@/components/ui/MultiSelect";

describe("MultiSelect", () => {
  const options = [
    { value: "chicken", label: "Chicken" },
    { value: "paneer", label: "Paneer" },
  ];

  it("renders all options", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={[]} onChange={onChange} />);

    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(screen.getByText("Paneer")).toBeInTheDocument();
  });

  it("selects an unselected option on click", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={[]} onChange={onChange} />);

    fireEvent.click(screen.getByText("Chicken"));
    expect(onChange).toHaveBeenCalledWith(["chicken"]);
  });

  it("deselects a selected option on click", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={["chicken"]} onChange={onChange} />);

    fireEvent.click(screen.getByText("Chicken"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("preserves other selections when selecting another option", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={["chicken"]} onChange={onChange} />);

    fireEvent.click(screen.getByText("Paneer"));
    expect(onChange).toHaveBeenCalledWith(["chicken", "paneer"]);
  });
});
