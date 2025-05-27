import express from "express";
import {
  addMovieReview,
  addMovieToFavorites,
  addMovieToWatched,
  createMovieRecommendation,
  deleteMovieRecommendation,
  deleteMovieReview,
  getApiMovieById,
  getGenres,
  getLanguages,
  getMovieCollection,
  getMovieFavorites,
  getMovieGenres,
  getMovieReview,
  getMovieReviews,
  getMovieWatched,
  getPopularAmongFollowed,
  removeMovieFavorite,
  removeMovieWatched,
  searchMoviesByTitle,
} from "../controllers/movie.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Search movies by title
router.get("/search", searchMoviesByTitle);

// Get a movie by id
router.get("/:id([0-9]+)", getApiMovieById);

// Get a collection of movies (now playing, popular, top rated, or upcoming)
router.get("/collection/:collection?", getMovieCollection);

// Get most popular movies among the ones followed by user
router.get("/following/:userId", getPopularAmongFollowed);

// Get movie favorites
router.get("/fav/:movieId", getMovieFavorites);

// Add movie to favorites
router.post("/fav", authMiddleware, addMovieToFavorites);

// Remove movie from favorites
router.delete("/fav", authMiddleware, removeMovieFavorite);

// Get movie watched array
router.get("/watched/:movieId", getMovieWatched);

// Add movie to watched
router.post("/watched", authMiddleware, addMovieToWatched);

// Remove movie from watched
router.delete("/watched", authMiddleware, removeMovieWatched);

// Get genres
router.get("/genres", getGenres);

// Get movie genres
router.get("/genres/:movieId", getMovieGenres);

// Get languages
router.get("/languages", getLanguages);

// Add movie review
router.post("/review", authMiddleware, addMovieReview);

// Delete movie review
router.delete("/review", authMiddleware, deleteMovieReview);

// Get movie review
router.get("/review", getMovieReview);

// Get reviews of an specific movie
router.get("/review/:movieId", getMovieReviews);

// Create movie recommendation
router.post("/recommendation", authMiddleware, createMovieRecommendation);

// Delete movie recommendation
router.delete("/recommendation", authMiddleware, deleteMovieRecommendation);

export default router;
