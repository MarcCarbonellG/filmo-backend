import express from "express";
import {
  addMovieToFav,
  getMovieById,
  getMovieList,
  removeMovieFav,
  searchMoviesByTitle,
} from "../controllers/movie.controller.js";

const router = express.Router();

// Search movies by title
router.get("/search", searchMoviesByTitle);

// Get a movie by id
router.get("/:id([0-9]+)", getMovieById);

// Get a list of movies (now playing, popular, top rated or upcoming)
router.get("/list/:listName?", getMovieList);

// Add movie to favourites
router.post("/fav", addMovieToFav);

// Remove movie from favourites
router.delete("/fav/:id", removeMovieFav);

export default router;
