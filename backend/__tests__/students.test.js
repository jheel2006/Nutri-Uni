// __tests__/students.test.js
import request from "supertest";
import express from "express";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import studentsRoute from "../routes/students.js";
import { supabase } from "../lib/supabaseClient.js";

// Mock Supabase client
vi.mock("../lib/supabaseClient.js", () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

const app = express();
app.use(express.json());
app.use("/", studentsRoute);

afterEach(() => {
  vi.clearAllMocks();
});

describe("Student Routes", () => {
  it("POST /init-student - creates new student", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null })),
        })),
      })),
    });
    supabase.from.mockReturnValueOnce({
      insert: vi.fn(() => ({
        error: null,
      })),
    });

    const res = await request(app).post("/init-student").send({
      clerk_user_id: "user_123",
      email: "test@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Student initialized");
  });

  it("POST /init-student - insert error", async () => {
    // Mock select to return null (student does not exist)
    supabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: null })),
          })),
        })),
      })
      // Then mock insert to throw an error
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          error: { message: "Insert failed" },
        })),
      });
  
    const res = await request(app).post("/init-student").send({
      clerk_user_id: "user_999",
      email: "fail@example.com",
    });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Insert failed");
  });

  it("POST /init-student - insert error", async () => {
    // Mock select to return null (student does not exist)
    supabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: null })),
          })),
        })),
      })
      // Then mock insert to throw an error
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          error: { message: "Insert failed" },
        })),
      });
  
    const res = await request(app).post("/init-student").send({
      clerk_user_id: "user_999",
      email: "fail@example.com",
    });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Insert failed");
  });

  it("GET /recommendations - missing clerk_user_id", async () => {
    const res = await request(app).get("/recommendations");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id");
  });

  it("GET /recommendations - missing clerk_user_id", async () => {
    const res = await request(app).get("/recommendations");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id");
  });
  it("GET /info - missing clerk_user_id", async () => {
    const res = await request(app).get("/info");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id");
  });
  it("GET /info - supabase error", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: { message: "DB failure" },
          })),
        })),
      })),
    });
  
    const res = await request(app).get("/info").query({ clerk_user_id: "user_123" });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB failure");
  });

  it("GET /recommendations - liked foods fetch error", async () => {
    supabase.from
      .mockReturnValueOnce({ // meals
        select: vi.fn(() => ({
          error: null,
          data: [],
        })),
      })
      .mockReturnValueOnce({ // liked foods
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: { message: "Liked foods error" },
          })),
        })),
      });
  
    const res = await request(app).get("/recommendations").query({ clerk_user_id: "user_123" });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch liked foods");
  });

  it("GET /recommendations - preferences fetch error", async () => {
    supabase.from
      .mockReturnValueOnce({ // meals
        select: vi.fn(() => ({
          error: null,
          data: [],
        })),
      })
      .mockReturnValueOnce({ // liked foods
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })
      .mockReturnValueOnce({ // preferences
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: "Prefs fail" },
            })),
          })),
        })),
      });
  
    const res = await request(app).get("/recommendations").query({ clerk_user_id: "user_123" });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch student preferences");
  });
  it("GET /recommendations - meals with missing food_info", async () => {
    supabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          error: null,
          data: [{ id: 1, food_info: null }], // no food_info
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                is_veg: false,
                is_vegan: false,
                is_gluten_free: false,
              },
              error: null,
            })),
          })),
        })),
      });
  
    const res = await request(app).get("/recommendations").query({ clerk_user_id: "user_123" });
  
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]); // no valid meals
  });

  it("GET /recommendations - chooses healthiest meal when no favorites", async () => {
    const mealData = [
      {
        id: 101,
        food_info: {
          id: 1,
          health_score: 85,
          veg: true,
          vegan: false,
          gluten_free: false,
        },
      },
      {
        id: 102,
        food_info: {
          id: 2,
          health_score: 90,
          veg: true,
          vegan: false,
          gluten_free: false,
        },
      },
    ];
  
    supabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          error: null,
          data: mealData,
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [], // no liked foods
            error: null,
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                is_veg: true,
                is_vegan: false,
                is_gluten_free: false,
              },
              error: null,
            })),
          })),
        })),
      });
  
    const res = await request(app).get("/recommendations").query({ clerk_user_id: "user_123" });
  
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].health_score).toBe(90); // healthiest meal is selected
  });

  
  it("POST /init-student - student already exists", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: "user_123" } })),
        })),
      })),
    });

    const res = await request(app).post("/init-student").send({
      clerk_user_id: "user_123",
      email: "test@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Student already exists");
  });

  it("PATCH /preferences - missing clerk_user_id", async () => {
    const res = await request(app).patch("/preferences").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id");
  });

  it("PATCH /preferences - no preferences to update", async () => {
    const res = await request(app).patch("/preferences").send({
      clerk_user_id: "user_123",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No preferences to update");
  });

  it("PATCH /preferences - updates preferences", async () => {
    supabase.from.mockReturnValueOnce({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [{ is_veg: true }],
            error: null,
          })),
        })),
      })),
    });

    const res = await request(app).patch("/preferences").send({
      clerk_user_id: "user_123",
      is_veg: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Preferences updated");
  });

  it("GET /info - returns preferences", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { is_veg: true, is_vegan: false },
            error: null,
          })),
        })),
      })),
    });

    const res = await request(app).get("/info").query({ clerk_user_id: "user_123" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ is_veg: true, is_vegan: false });
  });

  it("GET /recommendations - returns empty array if no meals match", async () => {
    // Step 1: Today's meals
    supabase.from
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })
      // Step 2: Liked foods
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })
      // Step 3: Student preferences
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { is_veg: false, is_vegan: false, is_gluten_free: false },
              error: null,
            })),
          })),
        })),
      });

    const res = await request(app).get("/recommendations").query({
      clerk_user_id: "user_123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
