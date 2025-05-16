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
router.get("/fav/:movie_id", getMovieFavorites);

// Add movie to favorites
router.post("/fav", addMovieToFavorites);

// Remove movie from favorites
router.delete("/fav", removeMovieFavorite);

// Get movie watched array
router.get("/watched/:movie_id", getMovieWatched);

// Add movie to watched
router.post("/watched", addMovieToWatched);

// Remove movie from watched
router.delete("/watched", removeMovieWatched);

// Get genres
router.get("/genres", getGenres);

// Get movie genres
router.get("/genres/:movieId", getMovieGenres);

// Get languages
router.get("/languages", getLanguages);

// Add movie review
router.post("/review", addMovieReview);

// Delete movie review
router.delete("/review", deleteMovieReview);

// Get movie review
router.get("/review", getMovieReview);

// Get reviews of an specific movie
router.get("/review/:movie_id", getMovieReviews);

// Create movie recommendation
router.post("/recommendation", createMovieRecommendation);

// Delete movie recommendation
router.delete("/recommendation", deleteMovieRecommendation);

export default router;
