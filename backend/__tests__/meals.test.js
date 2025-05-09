import request from "supertest";
import express from "express";
import mealsRoute from "../routes/meals.js";
import { supabase } from "../lib/supabaseClient.js";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock Supabase
vi.mock("../lib/supabaseClient.js", () => {
  const m = {
    from: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ error: null })),
        getPublicUrl: vi.fn(() => ({ publicUrl: "http://example.com/fake.png" })),
      })),
    },
  };
  return { supabase: m };
});

const app = express();
app.use(express.json());
app.use("/", mealsRoute);

describe("Extra /meals routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("POST /food-info > returns 400 if item_name missing", async () => {
    const res = await request(app).post("/food-info").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Item name is required");
  });

  it("POST /food-info > returns 201 if insert succeeds", async () => {
    supabase.from.mockReturnValue({
      insert: vi.fn(() => ({ data: [{ id: 1 }], error: null })),
    });

    const res = await request(app).post("/food-info").send({
      item_name: "Test Meal",
      veg: true,
      vegan: false,
      gluten_free: true,
      allergens: [],
      energy: 100,
      fats: 5,
      protein: 10,
      salt: 2,
      sugar: 3,
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  it("PUT /food-info/:id > returns 200 if update succeeds", async () => {
    supabase.from.mockReturnValue({
      update: vi.fn(() => ({ eq: vi.fn(() => ({ data: [{ id: "updated" }], error: null })) })),
    });

    const res = await request(app).put("/food-info/123").send({
      item_name: "Updated",
      veg: false,
      vegan: false,
      gluten_free: false,
      allergens: [],
      energy: 50,
      fats: 1,
      protein: 2,
      salt: 1,
      sugar: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "updated" }]);
  });

  it("DELETE /food-info/:id > returns 500 on error", async () => {
    supabase.from.mockReturnValue({
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: { message: "fail" } })) })),
    });

    const res = await request(app).delete("/food-info/123");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("fail");
  });

  it("PUT /week-menu/:id > returns 200 on success", async () => {
    supabase.from.mockReturnValue({
      update: vi.fn(() => ({ eq: vi.fn(() => ({ data: [{ id: "updated" }], error: null })) })),
    });

    const res = await request(app).put("/week-menu/456").send({
      dining_hall: "D2",
      counter: "Italian",
      food_info_id: 2,
      date_available: "2025-05-07",
      day: "Wednesday",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "updated" }]);
  });

  it("GET /food-info > returns food item list", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn(() => Promise.resolve({ data: [{ id: 1, item_name: "Sample" }], error: null }))
      })
    });
  
    const res = await request(app).get("/food-info");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, item_name: "Sample" }]);
  });
  it("GET /week-menu > returns menu items", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
      })
    });
  
    const res = await request(app).get("/week-menu");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });
  it("GET /week-menu > returns menu items", async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
      })
    });
  
    const res = await request(app).get("/week-menu");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });
  it("POST /week-menu > returns 201 on success", async () => {
    supabase.from.mockReturnValueOnce({
      insert: vi.fn(() => Promise.resolve({ data: [{ id: 999 }], error: null }))
    });
  
    const res = await request(app).post("/week-menu").send({
      dining_hall: "D1",
      counter: "Grill",
      food_info_id: 1,
      date_available: "2025-05-08",
      day: "Thursday"
    });
  
    expect(res.status).toBe(201);
    expect(res.body).toEqual([{ id: 999 }]);
  });
  it("POST /week-menu > returns 400 when fields missing", async () => {
    const res = await request(app).post("/week-menu").send({
      counter: "Grill"
    });
  
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });
  it("POST /week-menu > returns 400 when fields missing", async () => {
    const res = await request(app).post("/week-menu").send({
      counter: "Grill"
    });
  
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });
  it("DELETE /week-menu/:id > returns 200 on success", async () => {
    supabase.from.mockReturnValueOnce({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null }))
      }))
    });
  
    const res = await request(app).delete("/week-menu/123");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Menu item deleted successfully");
  });
  it("POST /food-info > returns 500 if Supabase insert fails", async () => {
    supabase.from.mockReturnValueOnce({
      insert: vi.fn(() => ({ error: { message: "Insert failed" } }))
    });
  
    const res = await request(app).post("/food-info").send({
      item_name: "Error Case",
      veg: true,
      vegan: false,
      gluten_free: false,
      allergens: [],
      energy: 10,
      fats: 1,
      protein: 1,
      salt: 1,
      sugar: 1,
    });
  
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Insert failed");
  });
    
});
