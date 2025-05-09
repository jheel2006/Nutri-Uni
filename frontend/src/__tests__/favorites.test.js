import { describe, it, expect, vi } from "vitest";
import * as favoritesAPI from "@/api/favorites";
import axios from "axios";

// Mock axios.create globally before importing the module
vi.mock("axios", () => {
  return {
    default: {
      create: () => ({
        get: vi.fn(() => Promise.resolve({ data: "mock-get" })),
        post: vi.fn(() => Promise.resolve({ data: "mock-post" })),
        delete: vi.fn(() => Promise.resolve({ data: "mock-delete" })),
      }),
    },
  };
});

describe("favorites API", () => {
  it("calls getFavorites", async () => {
    const res = await favoritesAPI.getFavorites("uid123");
    expect(res.data).toBe("mock-get");
  });

  it("calls addFavorite", async () => {
    const res = await favoritesAPI.addFavorite("uid123", "food456");
    expect(res.data).toBe("mock-post");
  });

  it("calls removeFavorite", async () => {
    const res = await favoritesAPI.removeFavorite("uid123", "food456");
    expect(res.data).toBe("mock-delete");
  });
});
