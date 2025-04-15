import express from "express";
import {
  addMovieReview,
  addMovieToFavorites,
  addMovieToWatched,
  getApiMovieById,
  getGenres,
  getLanguages,
  getMovieFavorites,
  getMovieList,
  getMovieReview,
  getMovieReviews,
  getMovieWatched,
  removeMovieFavorite,
  removeMovieReview,
  removeMovieWatched,
  searchMoviesByTitle,
} from "../controllers/movie.controller.js";

const router = express.Router();

// Search movies by title
router.get("/search", searchMoviesByTitle);

// Get a movie by id
router.get("/:id([0-9]+)", getApiMovieById);

// Get a list of movies (now playing, popular, top rated or upcoming)
router.get("/list/:listName?", getMovieList);

// Get movie favorites
router.get("/fav/:movie_id([0-9]+)", getMovieFavorites);

// Add movie to favorites
router.post("/fav", addMovieToFavorites);

// Remove movie from favorites
router.delete("/fav", removeMovieFavorite);

// Get movie watched array
router.get("/watched/:movie_id([0-9]+)", getMovieWatched);

// Add movie to watched
router.post("/watched", addMovieToWatched);

// Remove movie from watched
router.delete("/watched", removeMovieWatched);

// Get genres
router.get("/genres", getGenres);

// Get languages
router.get("/languages", getLanguages);

// Add movie review
router.post("/review", addMovieReview);

// Remove movie review
router.delete("/review", removeMovieReview);

// Get movie review
router.get("/review", getMovieReview);

// Get movie review
router.get("/review/:movie_id([0-9]+)", getMovieReviews);

export default router;
