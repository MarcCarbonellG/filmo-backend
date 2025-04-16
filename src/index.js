import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import pool from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Prueba de conexión a la base de datos
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "DB Connected!", time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api", (req, res) => {
  res.send("Hello from Express!");
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de películas
app.use("/api/movie", movieRoutes);

// Rutas de usuarios
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
