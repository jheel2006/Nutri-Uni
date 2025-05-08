import express from "express";
import { supabase } from "../lib/supabaseClient.js";
import multer from "multer";
import crypto from "crypto";
import { calculateHealthScore } from "../healthScore.js";

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * GET /week-menu
 * This endpoint fetches the current week's menu along with full food info for each item
 */
router.get("/week-menu", async (req, res) => {
  const { data, error } = await supabase
    .from("week_menu") // Query the "week_menu" table
    .select(
      `
      id,
      dining_hall,
      counter,
      date_available,
      day,
      food_info (
        id,
        item_name,
        item_photo_link,
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
    .order("date_available", { ascending: false }); // Show latest dates first

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

/**
 * GET /food-info
 * This endpoint returns a simple list of food items (id and name) for dropdown menus
 */
// router.get("/food-info", async (req, res) => {
//   const { data, error } = await supabase
//     .from("food_info") // Query the "food_info" table
//     .select("id, item_name") // Only fetch ID and name
//     .order("item_name", { ascending: true }); //Sprt alphabetically

//   if (error) return res.status(500).json({ error: error.message });
//   res.status(200).json(data);
// });

router.get("/food-info", async (req, res) => {
  const { data, error } = await supabase
    .from("food_info")
    .select(`
      id,
      item_name,
      item_photo_link,
      veg,
      vegan,
      gluten_free,
      allergens,
      energy,
      fats,
      protein,
      salt,
      sugar
    `)
    .order("item_name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

/**
 * POST /food-info
 * This endpoint allows an admin to add a new food item, optionally with a photo
 */
router.post("/food-info", upload.single("photo"), async (req, res) => {
  try {
    // Get all the submitted data from the request body
    const {
      item_name,
      veg,
      vegan,
      gluten_free,
      allergens,
      energy,
      fats,
      protein,
      salt,
      sugar,
    } = req.body;

    // Check if item name is provided
    if (!item_name) {
      return res.status(400).json({ error: "Item name is required" });
    }

    // Variable to store the uploaded image link
    let item_photo_link = null;

    // If a photo is uploaded, handle the upload to Supabase storage
    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop(); // Get the file extension (e.g., jpg, png)
      const fileName = `${crypto.randomUUID()}.${fileExt}`; // Generate a random file name

      // Upload image to Supabase storage bucket (called "food-images")
      const { error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(`public/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype, // Set the content type of the file
        });

      if (uploadError) throw uploadError;

      // Get the public URL to the uploaded image
      const { data: publicUrl } = supabase.storage
        .from("food-images")
        .getPublicUrl(`public/${fileName}`);

      item_photo_link = publicUrl.publicUrl; // Save the public URL for the new food item
    }

    // Convert string inputs to numbers (in case sent from form as strings)
    const energyVal = parseFloat(energy);
    const fatsVal = parseFloat(fats);
    const proteinVal = parseFloat(protein);
    const saltVal = parseFloat(salt);
    const sugarVal = parseFloat(sugar);

    // Calculate health score
    const health_score = calculateHealthScore({
      energy: energyVal,
      fats: fatsVal,
      protein: proteinVal,
      salt: saltVal,
      sugar: sugarVal,
    });

    // Insert the new food item into the "food_info" table
    const { data, error } = await supabase.from("food_info").insert([
      {
        // Use the item name and photo link from the request body
        item_name,
        item_photo_link,

        // Convert string values to boolean for veg, vegan, and gluten_free
        veg: veg === "true" || veg === true,
        vegan: vegan === "true" || vegan === true,
        gluten_free: gluten_free === "true" || gluten_free === true,

        // Parse allergens from string to JSON if it's a string
        allergens:
          typeof allergens === "string" ? JSON.parse(allergens) : allergens,

        // Parse nutritional values from string to integer
        energy: parseInt(energy),
        fats: parseInt(fats),
        protein: parseInt(protein),
        salt: parseInt(salt),
        sugar: parseInt(sugar),
        health_score,
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});
// router.post("/food-info", async (req, res) => {
//   const {
//     item_name,
//     item_photo_link, // can be null for now
//     veg,
//     vegan,
//     gluten_free,
//     allergens,
//     energy,
//     fats,
//     protein,
//     salt,
//     sugar,
//   } = req.body;

//   if (!item_name) {
//     return res.status(400).json({ error: "Item name is required" });
//   }

//   const { data, error } = await supabase.from("food_info").insert([
//     {
//       item_name,
//       item_photo_link,
//       veg,
//       vegan,
//       gluten_free,
//       allergens,
//       energy,
//       fats,
//       protein,
//       salt,
//       sugar,
//     },
//   ]);

//   if (error) return res.status(500).json({ error: error.message });
//   res.status(201).json(data);
// });

/**
 * POST /week-menu
 * This endpoint allows an admin to add a new menu item to the week's dining schedule
 */
router.post("/week-menu", async (req, res) => {
  const { dining_hall, counter, food_info_id, date_available, day } = req.body;

  // Check if required fields are provided
  if (!dining_hall || !counter || !food_info_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if the food_info_id exists in the food_info table
  const { data, error } = await supabase.from("week_menu").insert([
    {
      dining_hall,
      counter,
      food_info_id,
      date_available,
      day// optional, will default to today if not provided
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// EDIT AND DELETE
/**
 * DELETE /food-info/:id
 * Deletes a food item by ID
 */
router.delete("/food-info/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("food_info").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Food item deleted successfully" });
});

/**
 * DELETE /week-menu/:id
 * Deletes a menu item by ID
 */
router.delete("/week-menu/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("week_menu").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Menu item deleted successfully" });
});

/**
 * PUT /food-info/:id
 * Updates an existing food item
 */
router.put("/food-info/:id", async (req, res) => {
  const {
    item_name,
    veg,
    vegan,
    gluten_free,
    allergens,
    energy,
    fats,
    protein,
    salt,
    sugar,
  } = req.body;

  const { id } = req.params;

  const { data, error } = await supabase
    .from("food_info")
    .update({
      item_name,
      veg,
      vegan,
      gluten_free,
      allergens,
      energy,
      fats,
      protein,
      salt,
      sugar,
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

/**
 * PUT /week-menu/:id
 * Updates an existing menu item (e.g., change date, counter, or food)
 */
router.put("/week-menu/:id", async (req, res) => {
  const { dining_hall, counter, food_info_id, date_available, day } = req.body;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("week_menu")
    .update({
      dining_hall,
      counter,
      food_info_id,
      date_available,
      day
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

export default router;
