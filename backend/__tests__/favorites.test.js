import request from "supertest";
import express from "express";
import favoritesRoute from "../routes/favorites.js";
import { supabase } from "../lib/supabaseClient.js";
import { vi, describe, it, expect, afterEach } from "vitest";

// Mock Supabase
vi.mock("../lib/supabaseClient.js", () => {
  const m = {
    from: vi.fn(),
  };
  return { supabase: m };
});

const createMockFrom = (selectData = null, selectError = null, insertError = null, deleteError = null) => {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: selectData,
          error: selectError,
        })),
      })),
    })),
    insert: vi.fn(() => ({ error: insertError })),
    delete: vi.fn(() => ({ error: deleteError })),
  };
};

const app = express();
app.use(express.json());
app.use("/favorites", favoritesRoute);

describe("/favorites route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // POST
  it("POST /favorites > returns 400 if missing fields", async () => {
    const res = await request(app).post("/favorites").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id or food_id");
  });

  it("POST /favorites > returns 500 if Supabase select throws error", async () => {
    supabase.from.mockReturnValue(createMockFrom(null, { message: "fail" }));
    const res = await request(app).post("/favorites").send({ clerk_user_id: "abc", food_id: "123" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("fail");
  });

  it("POST /favorites > returns 200 if already favorited", async () => {
    supabase.from.mockReturnValue(createMockFrom([{ id: 1 }], null));
    const res = await request(app).post("/favorites").send({ clerk_user_id: "abc", food_id: "123" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Already favorited");
  });

  it("POST /favorites > returns 201 if favorite is added", async () => {
    const mock = createMockFrom([], null, null);
    supabase.from.mockReturnValue(mock);
    const res = await request(app).post("/favorites").send({ clerk_user_id: "abc", food_id: "123" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Favorite added");
  });

  it("POST /favorites > returns 500 if insert fails", async () => {
    const mock = createMockFrom([], null, { message: "insert fail" });
    supabase.from.mockReturnValue(mock);
    const res = await request(app).post("/favorites").send({ clerk_user_id: "abc", food_id: "123" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("insert fail");
  });

  // DELETE

  it("DELETE /favorites > returns 400 if missing fields", async () => {
    const res = await request(app).delete("/favorites").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id or food_id");
  });
  it("DELETE /favorites > returns 500 if supabase delete fails", async () => {
    supabase.from.mockReturnValueOnce({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: { message: "delete failed" },
          })),
        })),
      })),
    });
  
    const res = await request(app).delete("/favorites").send({
      clerk_user_id: "abc",
      food_id: "123",
    });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("delete failed");
  });
  it("DELETE /favorites > returns 200 on success", async () => {
    supabase.from.mockReturnValueOnce({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null,
          })),
        })),
      })),
    });
  
    const res = await request(app).delete("/favorites").send({
      clerk_user_id: "abc",
      food_id: "123",
    });
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Favorite removed");
  });
      
  

  // GET
  it("GET /favorites > returns 400 if missing clerk_user_id", async () => {
    const res = await request(app).get("/favorites");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing clerk_user_id");
  });

  it("GET /favorites > returns 500 if supabase fails", async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: null,
          error: { message: "get error" },
        }),
      }),
    });
    const res = await request(app).get("/favorites").query({ clerk_user_id: "abc" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("get error");
  });

  it("GET /favorites > returns 200 with data", async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          data: [{ food_id: "x" }],
          error: null,
        }),
      }),
    });
    const res = await request(app).get("/favorites").query({ clerk_user_id: "abc" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ food_id: "x" }]);
  });
});
