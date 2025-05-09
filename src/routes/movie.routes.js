import express from "express";
import {
  addMovieReview,
  addMovieToFavorites,
  addMovieToWatched,
  deleteMovieReview,
  getApiMovieById,
  getGenres,
  getLanguages,
  getMovieCollection,
  getMovieFavorites,
  getMovieReview,
  getMovieReviews,
  getMovieWatched,
  removeMovieFavorite,
  removeMovieWatched,
  searchMoviesByTitle,
} from "../controllers/movie.controller.js";

const router = express.Router();

// Search movies by title
router.get("/search", searchMoviesByTitle);

// Get a movie by id
router.get("/:id([0-9]+)", getApiMovieById);

// Get a collection of movies (now playing, popular, top rated or upcoming)
router.get("/collection/:collection?", getMovieCollection);

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

// Delete movie review
router.delete("/review", deleteMovieReview);

// Get movie review
router.get("/review", getMovieReview);

// Get reviews of an specific movie
router.get("/review/:movie_id([0-9]+)", getMovieReviews);

export default router;
