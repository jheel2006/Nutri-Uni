// File: src/__tests__/ConfirmDialogue.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialogue from "@/components/ConfirmDialogue";

describe("ConfirmDialogue", () => {
  it("renders title and description when open", () => {
    const mockClose = () => {};
    const mockConfirm = () => {};

    render(
      <ConfirmDialogue
        open={true}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Delete Item?"
        description="This action cannot be undone."
      />
    );

    expect(screen.getByText("Delete Item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("does not render anything when `open` is false", () => {
    const { container } = render(
      <ConfirmDialogue open={false} onClose={() => {}} onConfirm={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClose when Cancel is clicked", () => {
    const mockClose = vi.fn();
    render(<ConfirmDialogue open={true} onClose={mockClose} onConfirm={() => {}} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockClose).toHaveBeenCalled();
  });

  it("calls onConfirm when Delete is clicked", () => {
    const mockConfirm = vi.fn();
    render(<ConfirmDialogue open={true} onClose={() => {}} onConfirm={mockConfirm} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(mockConfirm).toHaveBeenCalled();
  });
});
