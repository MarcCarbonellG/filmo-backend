import axios from "axios";
import pool from "../config/db.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
  const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
    params: { api_key: TMDB_API_KEY, language: "es-ES" },
  });
  return response.data;
};

export const createMovie = async (id, title, release_date, poster) => {
  const { rows } = await pool.query(
    "INSERT INTO movies (id, title, release_date, poster) VALUES ($1, $2, $3, $4)",
    [id, title, release_date, poster]
  );
  return rows[0];
};

export const findFavorites = async (movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_fav WHERE movie_id = $1",
    [movie_id]
  );
  return rows;
};

export const findFavorite = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_fav WHERE user_id = $1 AND movie_id = $2",
    [user_id, movie_id]
  );
  return rows[0];
};

export const addToFavorites = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_fav (user_id, movie_id) VALUES ($1, $2) RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

export const removeFavorite = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_fav WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

export const findWatchedArray = async (movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_watched WHERE movie_id = $1",
    [movie_id]
  );
  return rows;
};

export const findWatched = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_watched WHERE user_id = $1 AND movie_id = $2",
    [user_id, movie_id]
  );
  return rows[0];
};

export const addToWatched = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_watched (user_id, movie_id) VALUES ($1, $2) RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

export const removeFromWatched = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_watched WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

export const findReview = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    `
    SELECT reviews.*, users.username, users.avatar
    FROM reviews
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.user_id = $1 AND reviews.movie_id = $2"`,
    [user_id, movie_id]
  );
  return rows[0];
};

export const addReview = async (user_id, movie_id, rating, content) => {
  const { rows } = await pool.query(
    "INSERT INTO reviews (user_id, movie_id, rating, content) VALUES ($1, $2, $3, $4) RETURNING *",
    [user_id, movie_id, rating, content]
  );
  return rows[0];
};

export const removeReview = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "DELETE FROM reviews WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

export const findReviews = async (movie_id) => {
  const { rows } = await pool.query(
    `
    SELECT reviews.*, users.username, users.avatar
    FROM reviews JOIN users ON reviews.user_id = users.id
    WHERE reviews.movie_id = $1`,
    [movie_id]
  );
  return rows;
};
