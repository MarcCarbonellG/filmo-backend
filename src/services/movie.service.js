import pool from "../config/db.js";

const isValidMovie = (movie) => {
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
      movie.hasOwnProperty(prop) && movie[prop] !== null && movie[prop] !== ""
  );
};

const filterValidMovies = (movies) => {
  return movies.filter((movie) => isValidMovie(movie));
};

const findMovieById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
  return rows[0];
};

const createMovie = async (id, title, year, image) => {
  const { rows } = await pool.query(
    "INSERT INTO movies (id, title, year, image) VALUES ($1, $2, $3, $4)",
    [id, title, year, image]
  );
  return rows[0];
};

const findFavorite = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_fav WHERE user_id = $1 AND movie_id = $2",
    [user_id, movie_id]
  );
  return rows[0];
};

const addToFav = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_fav (user_id, movie_id) VALUES ($1, $2) RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

const removeFav = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_fav WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

const findWatched = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_watched WHERE user_id = $1 AND movie_id = $2",
    [user_id, movie_id]
  );
  return rows[0];
};

const addToWatched = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_watched (user_id, movie_id) VALUES ($1, $2) RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

const removeFromWatched = async (user_id, movie_id) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_watched WHERE user_id = $1 AND movie_id = $2 RETURNING *",
    [user_id, movie_id]
  );
  return rows[0];
};

export {
  addToFav,
  addToWatched,
  createMovie,
  filterValidMovies,
  findFavorite,
  findMovieById,
  findWatched,
  isValidMovie,
  removeFav,
  removeFromWatched,
};
