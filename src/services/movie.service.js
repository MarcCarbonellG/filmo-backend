import axios from "axios";
import pool from "../config/db.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

import { getCache, setCache } from "../utils/cache.js";

export const isValidMovie = (movie) => {
  const requiredProps = [
    "adult",
    "backdrop_path",
    "genre_ids",
    "id",
    "original_language",
    "original_title",
    "overview",
    "popularity",
    "poster_path",
    "release_date",
    "title",
    "video",
    "vote_average",
    "vote_count",
  ];

  return requiredProps.every(
    (prop) =>
      movie.hasOwnProperty(prop) &&
      movie[prop] !== null &&
      movie[prop] !== "" &&
      !(Array.isArray(movie[prop]) && movie[prop].length === 0)
  );
};

export const filterValidMovies = (movies) => {
  return movies.filter((movie) => isValidMovie(movie));
};

export const findMovieById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
  return rows[0];
};

export const findMovieFromApiById = async (id) => {
  const cacheKey = `tmdb:movie:${id}`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
    params: { api_key: TMDB_API_KEY, language: "es-ES" },
  });

  setCache(cacheKey, response.data, 60);
  return response.data;
};

export const createMovie = async (id, title, releaseDate, poster) => {
  const { rows } = await pool.query(
    "INSERT INTO movies (id, title, release_date, poster_path) VALUES ($1, $2, $3, $4)",
    [id, title, releaseDate, poster]
  );
  return rows[0];
};

export const findTopRatedMovies = async () => {
  const { rows } = await pool.query(
    `
    SELECT 
      m.*, 
      stats.promedio_rating, 
      stats.total_reviews
    FROM movies m
    JOIN (
      SELECT 
        movie_id, 
        AVG(rating) AS promedio_rating, 
        COUNT(rating) AS total_reviews
      FROM reviews
      GROUP BY movie_id
      HAVING COUNT(rating) >= 1
    ) stats ON stats.movie_id = m.id
    ORDER BY stats.promedio_rating DESC
    LIMIT 30;
    `
  );
  return rows;
};

export const findPopularMovies = async () => {
  const { rows } = await pool.query(
    `
    SELECT 
      m.*, 
      COALESCE(favs.total_favs, 0) AS total_favs
    FROM movies m
    JOIN (
      SELECT 
        movie_id, 
        COUNT(user_id) AS total_favs
      FROM movie_fav
      GROUP BY movie_id
    ) favs ON favs.movie_id = m.id
    ORDER BY favs.total_favs DESC
    LIMIT 30;
    `
  );
  return rows;
};

export const findPopularAmongFollowed = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      m.*, 
      COALESCE(favs.total_favs, 0) AS total_favs
    FROM movies m
    JOIN (
      SELECT 
        f.movie_id, 
        COUNT(f.user_id) AS total_favs
      FROM movie_fav f
      JOIN following fo ON f.user_id = fo.followed_id
      WHERE fo.follower_id = $1
      GROUP BY f.movie_id
    ) favs ON favs.movie_id = m.id
    ORDER BY favs.total_favs DESC
    LIMIT 30;
    `,
    [userId]
  );
  return rows;
};

export const findFavorites = async (movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_fav WHERE movie_id = $1",
    [movie_id]
  );
  return rows;
};

export const findFavorite = async (userId, movieId) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_fav WHERE user_id = $1 AND movie_id = $2",
    [userId, movieId]
  );
  return rows[0];
};

export const addToFavorites = async (userId, movieId) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_fav (user_id, movie_id) VALUES ($1, $2) RETURNING *",
    [userId, movieId]
  );
  return rows[0];
};

export const removeFavorite = async (userId, movieId) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_fav WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [userId, movieId]
  );
  return rows[0];
};

export const findWatchedArray = async (movieId) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_watched WHERE movie_id = $1",
    [movieId]
  );
  return rows;
};

export const findWatched = async (userId, movieId) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_watched WHERE user_id = $1 AND movie_id = $2",
    [userId, movieId]
  );
  return rows[0];
};

export const addToWatched = async (userId, movieId) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_watched (user_id, movie_id) VALUES ($1, $2) RETURNING *",
    [userId, movieId]
  );
  return rows[0];
};

export const removeFromWatched = async (userId, movieId) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_watched WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [userId, movieId]
  );
  return rows[0];
};

export const findReview = async (userId, movieId) => {
  const { rows } = await pool.query(
    `
    SELECT reviews.*, users.username, users.avatar
    FROM reviews
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.user_id = $1 AND reviews.movie_id = $2`,
    [userId, movieId]
  );
  return rows[0];
};

export const addReview = async (userId, movieId, rating, content) => {
  const { rows } = await pool.query(
    "INSERT INTO reviews (user_id, movie_id, rating, content) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, movieId, rating, content]
  );
  return rows[0];
};

export const deleteReview = async (userId, movieId) => {
  const { rows } = await pool.query(
    "DELETE FROM reviews WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [userId, movieId]
  );
  return rows[0];
};

export const findReviews = async (movieId) => {
  const { rows } = await pool.query(
    `
    SELECT reviews.*, users.username, users.avatar
    FROM reviews JOIN users ON reviews.user_id = users.id
    WHERE reviews.movie_id = $1`,
    [movieId]
  );
  return rows;
};

export const createRecommendation = async (
  recommenderId,
  recommendedId,
  movieId
) => {
  const { rows } = await pool.query(
    "INSERT INTO recommendations (recommender_id, recommended_id, movie_id) VALUES ($1, $2, $3)",
    [recommenderId, recommendedId, movieId]
  );
  return rows[0];
};

export const deleteRecommendation = async (recommendationId) => {
  const { rows } = await pool.query(
    "DELETE FROM recommendations WHERE id = $1 RETURNING *",
    [recommendationId]
  );
  return rows[0];
};
