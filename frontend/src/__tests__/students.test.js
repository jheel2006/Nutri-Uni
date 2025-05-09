import { describe, it, expect, vi } from "vitest";
import * as studentsAPI from "@/api/students";
import axios from "axios";

// Mock axios.create globally
vi.mock("axios", () => {
  return {
    default: {
      create: () => ({
        post: vi.fn(() => Promise.resolve({ data: "mock-post" })),
        patch: vi.fn(() => Promise.resolve({ data: "mock-patch" })),
        get: vi.fn(() => Promise.resolve({ data: "mock-get" })),
      }),
    },
  };
});

describe("students API", () => {
  it("calls initStudent", async () => {
    const res = await studentsAPI.initStudent("uid123", "test@example.com");
    expect(res.data).toBe("mock-post");
  });

  it("calls updatePreferences", async () => {
    const res = await studentsAPI.updatePreferences("uid123", { is_veg: true });
    expect(res.data).toBe("mock-patch");
  });

  it("calls getRecommendations", async () => {
    const res = await studentsAPI.getRecommendations("uid123");
    expect(res.data).toBe("mock-get");
  });

  it("calls getStudentInfo", async () => {
    const res = await studentsAPI.getStudentInfo("uid123");
    expect(res.data).toBe("mock-get");
  });
});
