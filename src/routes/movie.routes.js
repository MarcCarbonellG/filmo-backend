import express from "express";
import {
  getMovieById,
  getMovieList,
  searchMoviesByTitle,
} from "../controllers/movie.controller.js";

const router = express.Router();

// Search movies bi title
router.get("/search", searchMoviesByTitle);

// Get a movi by id
router.get("/:id([0-9]+)", getMovieById);

// Get a list of movies (now playing, popular, top rated or upcoming)
router.get("/list/:listName?", getMovieList);

export default router;
