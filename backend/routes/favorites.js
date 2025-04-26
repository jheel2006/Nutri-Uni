// routes/favorites.js
import express from "express";
import { supabase } from "../lib/supabaseClient.js";

const router = express.Router();

/**
 * POST /favorites/add
 * Add a food item to a student's favorites
 * Required: clerk_user_id, food_id
 */
router.post("/", async (req, res) => {
  const { clerk_user_id, food_id } = req.body;

  if (!clerk_user_id || !food_id) {
    return res.status(400).json({ error: "Missing clerk_user_id or food_id" });
  }

  const { error } = await supabase.from("liked_foods").insert([
    {
      student_id: clerk_user_id,
      food_id,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
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


