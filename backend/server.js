import express from "express";
import cors from "cors";
import mealsRouter from "./routes/meals.js";
import studentRouter from "./routes/students.js";
import favoriteRouter from "./routes/favorites.js";

import { supabase } from "./lib/supabaseClient.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/meals", mealsRouter);
app.use("/students", studentRouter);
app.use("/favorites", favoriteRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
