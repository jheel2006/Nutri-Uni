// routes/students.js
import express from "express";
import { supabase } from "../lib/supabaseClient.js";

const router = express.Router();

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

export default router;
