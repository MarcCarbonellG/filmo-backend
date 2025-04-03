import pool from "../config/db.js";

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

const findFavById = async (user_id, movie_id) => {
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

const removeFav = async (movie_fav_id) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_fav WHERE movie_fav_id = $1 RETURNING *",
    [movie_fav_id]
  );

  return rows[0];
};

export { addToFav, createMovie, findFavById, findMovieById, removeFav };
