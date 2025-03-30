import express from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to log in
router.post("/login", loginUser);

export default router;
