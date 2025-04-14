import express from "express";
import {
  addMovieReview,
  addMovieToFav,
  addMovieToWatched,
  findMovieReview,
  getGenres,
  getLanguages,
  getMovieById,
  getMovieList,
  getMovieReviews,
  removeMovieFav,
  removeMovieReview,
  removeMovieWatched,
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
router.delete("/fav", removeMovieFav);

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
router.get("/review", findMovieReview);

// Get movie review
router.get("/review/:movie_id([0-9]+)", getMovieReviews);

export default router;
