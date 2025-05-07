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
  const { data: todayMeals, error: menuError } = await supabase
    .from("week_menu")
    .select(
      `
        id,
        dining_hall,
        counter,
        day,
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
    );

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

  // 3. Get student preferences
  const { data: studentPrefs, error: prefsError } = await supabase
    .from("students")
    .select("is_veg, is_vegan, is_gluten_free")
    .eq("id", clerk_user_id)
    .single();

  if (prefsError) {
    return res.status(500).json({ error: "Failed to fetch student preferences" });
  }

  // 4. Filter and annotate meals
  const meals = todayMeals
    .filter((meal) => {
      const info = meal.food_info;
      if (!info) return false;
      if (studentPrefs.is_veg && !info.veg) return false;
      if (studentPrefs.is_vegan && !info.vegan) return false;
      if (studentPrefs.is_gluten_free && !info.gluten_free) return false;
      return true;
    })
    .map((meal) => ({
      ...meal,
      health_score: meal.food_info?.health_score || 0,
      isFavorite: likedFoodIds.includes(meal.food_info?.id),
    }));

// 5. No valid meals? Return empty
if (meals.length === 0) {
  return res.status(200).json([]);
}

// Sort all annotated meal instances by health_score for general listing
const overallSortedInstances = [...meals].sort(
  (a, b) => b.health_score - a.health_score
);

let topMealInstance = null;


const favoriteInstances = meals.filter((m) => m.isFavorite);

if (favoriteInstances.length > 0) {

  topMealInstance = favoriteInstances.sort((a, b) => b.health_score - a.health_score)[0];
} else {

  if (overallSortedInstances.length > 0) {
    topMealInstance = overallSortedInstances[0];
  }
}


if (topMealInstance) {

  const remainingInstances = overallSortedInstances.filter(
    (meal) => meal.id !== topMealInstance.id 
  );
  res.status(200).json([topMealInstance, ...remainingInstances]);
} else {

  res.status(200).json([]);
}
});




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

export default router;