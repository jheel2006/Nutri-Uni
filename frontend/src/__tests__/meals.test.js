import { describe, it, expect, vi } from "vitest";
import * as mealsAPI from "@/api/meals";

// Globally mock axios.create before importing anything that uses it
vi.mock("axios", () => {
  return {
    default: {
      create: () => ({
        get: vi.fn(() => Promise.resolve({ data: "mock-get" })),
        post: vi.fn(() => Promise.resolve({ data: "mock-post" })),
        delete: vi.fn(() => Promise.resolve({ data: "mock-delete" })),
        put: vi.fn(() => Promise.resolve({ data: "mock-put" })),
      }),
    },
  };
});

describe("meals API", () => {
  it("calls getWeekMenu", async () => {
    const res = await mealsAPI.getWeekMenu();
    expect(res.data).toBe("mock-get");
  });

  it("calls addFoodItem", async () => {
    const formData = new FormData();
    formData.append("item_name", "Paneer Curry");
    const res = await mealsAPI.addFoodItem(formData);
    expect(res.data).toBe("mock-post");
  });

  it("calls getFoodItems", async () => {
    const res = await mealsAPI.getFoodItems();
    expect(res.data).toBe("mock-get");
  });

  it("calls addMenuItem", async () => {
    const res = await mealsAPI.addMenuItem({ food_info_id: 1 });
    expect(res.data).toBe("mock-post");
  });

  it("calls deleteMenuItem", async () => {
    const res = await mealsAPI.deleteMenuItem("123");
    expect(res.data).toBe("mock-delete");
  });

  it("calls updateMenuItem", async () => {
    const res = await mealsAPI.updateMenuItem("123", { counter: "Salad" });
    expect(res.data).toBe("mock-put");
  });

  it("calls deleteFoodItem", async () => {
    const res = await mealsAPI.deleteFoodItem("456");
    expect(res.data).toBe("mock-delete");
  });

  it("calls updateFoodItem", async () => {
    const res = await mealsAPI.updateFoodItem("456", { veg: true });
    expect(res.data).toBe("mock-put");
  });
});
