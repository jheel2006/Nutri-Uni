import { describe, it, vi, expect, beforeEach } from "vitest";


document.body.innerHTML = '<div id="root"></div>';

const renderSpy = vi.fn();
const createRootSpy = vi.fn(() => ({ render: renderSpy }));


vi.mock("react-dom/client", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createRoot: createRootSpy,
    default: {
      ...actual,
      createRoot: createRootSpy,
    },
  };
});

vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", "test-pub-key");

describe("main.jsx", () => {
  beforeEach(() => {
    renderSpy.mockClear();
    createRootSpy.mockClear();
  });

  it("renders the app with providers into the root", async () => {
    await import("../main.jsx");

    expect(createRootSpy).toHaveBeenCalledWith(document.getElementById("root"));
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
