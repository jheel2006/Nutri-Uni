// routes/favorites.js
import express from "express";
import { supabase } from "../lib/supabaseClient.js";

const router = express.Router();

/**
 * POST /favorites/add
 * Add a food item to a student's favorites
 * Required: clerk_user_id, food_id
 */
// router.post("/", async (req, res) => {
//   const { clerk_user_id, food_id } = req.body;

//   if (!clerk_user_id || !food_id) {
//     return res.status(400).json({ error: "Missing clerk_user_id or food_id" });
//   }

//   const { error } = await supabase.from("liked_foods").insert([
//     {
//       student_id: clerk_user_id,
//       food_id,
//     },
//   ]);

//   if (error) return res.status(500).json({ error: error.message });
//   res.status(201).json({ message: "Favorite added" });
// });

router.post("/", async (req, res) => {
  const { clerk_user_id, food_id } = req.body;
  if (!clerk_user_id || !food_id) {
    return res.status(400).json({ error: "Missing clerk_user_id or food_id" });
  }

  //check if already exists
  const { data: existing, error: checkError } = await supabase
    .from("liked_foods")
    .select("*")
    .eq("student_id", clerk_user_id)
    .eq("food_id", food_id);

  if (checkError) {
    return res.status(500).json({ error: checkError.message });
  }

  if (existing && existing.length > 0) {
    return res.status(200).json({ message: "Already favorited" });
  }
  const { error } = await supabase.from("liked_foods").insert([
    {
      student_id: clerk_user_id,
      food_id,
    },
  ]);

  if (error) {
  return res.status(500).json({ error: error.message });
   }

  res.status(201).json({ message: "Favorite added" });
});


/**
  * DELETE /favorites
  * Remove a liked food for a student
  * Required: clerk_user_id, food_id (sent via body or query)
  */
router.delete("/", async (req, res) => {
  const { clerk_user_id, food_id } = req.body;

  if (!clerk_user_id || !food_id) {
    return res.status(400).json({ error: "Missing clerk_user_id or food_id" });
  }

  const { error } = await supabase
    .from("liked_foods")
    .delete()
    .eq("student_id", clerk_user_id)
    .eq("food_id", food_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: "Favorite removed" });
});

export default router;


//GET /favorites
router.get("/", async (req, res) => {
  const { clerk_user_id } = req.query;

  if (!clerk_user_id) {
    return res.status(400).json({ error: "Missing clerk_user_id" });
  }

  const { data, error } = await supabase
    .from("liked_foods")
    .select("*")
    .eq("student_id", clerk_user_id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});



