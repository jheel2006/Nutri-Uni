// routes/students.js
import express from "express";
import { supabase } from "../lib/supabaseClient.js";

const router = express.Router();

/**
  * POST /init-student
  * Initialize a student account if it doesn't already exist
  * Required: clerk_user_id, email (sent via body)
  */
router.post("/init-student", async (req, res) => {
  const { clerk_user_id, email } = req.body;

  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("id", clerk_user_id)
    .single();

  if (existing) {
    return res.status(200).json({ message: "Student already exists" });
  }

  const { error } = await supabase.from("students").insert([
    {
      id: clerk_user_id,
      email,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Student initialized" });
});

/**
  * PATCH /preferences
  * Update a student's dietary preferences
  * Required: clerk_user_id (sent via body); optional: preference fields (e.g., vegetarian, vegan, etc.)
  */
router.patch("/preferences", async (req, res) => {
  const { clerk_user_id, ...preferences } = req.body;

  if (!clerk_user_id) {
    return res.status(400).json({ error: "Missing clerk_user_id" });
  }

  // Remove any undefined values from preferences
  const updateFields = Object.fromEntries(
    Object.entries(preferences).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: "No preferences to update" });
  }

  const { data, error } = await supabase
    .from("students")
    .update(updateFields)
    .eq("id", clerk_user_id)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Preferences updated", data });
});


/**
 * GET /recommendations
 * 
 * This endpoint retrieves the recommended meals for a student based on their preferences.
 * It performs the following steps:
 * 1. Fetches today's available meals from the 'week_menu' table.
 * 2. Retrieves the student's liked foods from the 'liked_foods' table.
 * 3. Sorts the meals based on health score and identifies the student's favorite meals.
 * 4. If the student has any favorite meals, the top favorite meal is selected; otherwise, the healthiest meal is chosen as the top recommendation.
 * 5. Returns the top recommended meal followed by the remaining meals sorted by health score.
*/
router.get("/recommendations", async (req, res) => {
  const { clerk_user_id } = req.query;

  if (!clerk_user_id) {
    return res.status(400).json({ error: "Missing clerk_user_id" });
  }


  // 1. Get today's meals
  // const today = new Date().toISOString().split("T")[0];
  // 1. CHANGE: Get all the information from the the db like full food_info
  const { data: todayMeals, error: menuError } = await supabase
    .from("week_menu")
    .select(
      `
        id,
        dining_hall,
        counter,
        date_available,
        food_info (
          id,
          item_name,
          item_photo_link,
          health_score,
          veg,
          vegan,
          gluten_free,
          allergens,
          energy,
          fats,
          protein,
          salt,
          sugar
        )
      `
    )
  // .eq("date_available", today);

  if (menuError) {
    return res.status(500).json({ error: "Failed to fetch today's meals" });
  }

  // 2. Get favorite food_ids
  const { data: likedFoods, error: likedError } = await supabase
    .from("liked_foods")
    .select("food_id")
    .eq("student_id", clerk_user_id);

  if (likedError) {
    return res.status(500).json({ error: "Failed to fetch liked foods" });
  }

  const likedFoodIds = likedFoods.map((f) => f.food_id);

  // 3. Prepare + sort meals
  const meals = todayMeals.map((meal) => ({
    ...meal,
    health_score: meal.food_info?.health_score || 0,
    isFavorite: likedFoodIds.includes(meal.food_info?.id),
  }));

  const sortedMeals = [...meals].sort(
    (a, b) => b.health_score - a.health_score
  );

  // 4. Pick the top recommendation
  let topMeal;

  const favoriteMeals = meals.filter((m) => m.isFavorite);
  if (favoriteMeals.length === 1) {
    topMeal = favoriteMeals[0];
  } else if (favoriteMeals.length > 1) {
    topMeal = favoriteMeals.sort((a, b) => b.health_score - a.health_score)[0];
  } else {
    topMeal = sortedMeals[0]; // fallback to healthiest
  }

  // 5. Remaining meals (excluding topMeal)
  const remainingMeals = sortedMeals.filter(
    (meal) => meal.food_info?.id !== topMeal.food_info?.id
  );

  res.status(200).json([topMeal, ...remainingMeals]);
});

export default router;

/**
 * GET /students/info
 * Get a student's dietary preferences and allergens
 * Required: clerk_user_id (sent via query)
 */
router.get("/info", async (req, res) => {
  const { clerk_user_id } = req.query;

  if (!clerk_user_id) {
    return res.status(400).json({ error: "Missing clerk_user_id" });
  }

  const { data, error } = await supabase
    .from("students")
    .select("is_veg, is_vegan, is_gluten_free, allergens")
    .eq("id", clerk_user_id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});
