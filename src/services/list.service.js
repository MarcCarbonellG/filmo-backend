import pool from "../config/db.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const createList = async (userId, title, description) => {
  const { rows } = await pool.query(
    "INSERT INTO lists (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
    [userId, title, description]
  );
  return rows[0];
};

export const deleteList = async (listId) => {
  const { rows } = await pool.query(
    "DELETE FROM lists WHERE id = $1 RETURNING *",
    [listId]
  );
  return rows[0];
};

export const findListById = async (listId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      l.*, 
      COALESCE(ml.movies, '[]'::json) AS movies,
      u.username AS author,
      COALESCE(ls.saved, 0) AS saved
    FROM lists l
    LEFT JOIN (
      SELECT 
          movie_list.list_id,
          json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies
      FROM movie_list
      LEFT JOIN movies ON movies.id = movie_list.movie_id
      GROUP BY movie_list.list_id
    ) ml ON ml.list_id = l.id
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN (
      SELECT list_id, COUNT(*) AS saved
      FROM list_saved
      GROUP BY list_id
    ) ls ON ls.list_id = l.id
    WHERE l.id = $1;
    `,
    [listId]
  );
  return rows[0];
};

export const findUserListsWithMovieStatus = async (userId, movieId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      *,
      EXISTS (
        SELECT 1
        FROM movie_list
        WHERE movie_list.list_id = lists.id
          AND movie_list.movie_id = $1 
      ) AS has_movie
    FROM lists
    WHERE lists.user_id = $2;
    `,
    [movieId, userId]
  );
  return rows;
};

export const findMovieListRelation = async (listId, movieId) => {
  const { rows } = await pool.query(
    "SELECT * FROM movie_list WHERE list_id = $1 AND movie_id = $2",
    [listId, movieId]
  );
  return rows[0];
};

export const addToList = async (listId, movieId) => {
  const { rows } = await pool.query(
    "INSERT INTO movie_list (list_id, movie_id) VALUES ($1, $2) RETURNING *",
    [listId, movieId]
  );
  return rows[0];
};

export const removeFromList = async (listId, movieId) => {
  const { rows } = await pool.query(
    "DELETE FROM movie_list WHERE list_id = $1 AND movie_id = $2 RETURNING *",
    [listId, movieId]
  );
  return rows[0];
};

export const updateList = async (listId, title, description) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(title);
  }

  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }

  if (fields.length === 0) return null;

  const query = `
    UPDATE lists
    SET ${fields.join(", ")}
    WHERE id = ${listId}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const findSaved = async (userId, listId) => {
  const { rows } = await pool.query(
    "SELECT * FROM list_saved WHERE user_id = $1 AND list_id = $2",
    [userId, listId]
  );
  return rows[0];
};

export const addToSaved = async (userId, listId) => {
  const { rows } = await pool.query(
    "INSERT INTO list_saved (user_id, list_id) VALUES ($1, $2) RETURNING *",
    [userId, listId]
  );
  return rows[0];
};

export const removeFromSaved = async (userId, listId) => {
  const { rows } = await pool.query(
    "DELETE FROM list_saved WHERE user_id = $1 AND list_id = $2 RETURNING *",
    [userId, listId]
  );
  return rows[0];
};

export const findPopularLists = async () => {
  const { rows } = await pool.query(
    `
    SELECT 
      l.*, 
      COALESCE(ml.movies, '[]'::json) AS movies,
      u.username AS author,
      COALESCE(ls.saved, 0) AS saved
    FROM lists l
    LEFT JOIN (
      SELECT 
        movie_list.list_id,
        json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies
      FROM movie_list
      LEFT JOIN movies ON movies.id = movie_list.movie_id
      GROUP BY movie_list.list_id
    ) ml ON ml.list_id = l.id
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN (
      SELECT list_id, COUNT(*) AS saved
      FROM list_saved
      GROUP BY list_id
    ) ls ON ls.list_id = l.id
    ORDER BY saved DESC
    LIMIT 10;

    `
  );
  return rows;
};

export const findFollowedLists = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      l.*, 
      COALESCE(ml.movies, '[]'::json) AS movies,
      u.username AS author,
      COALESCE(ls.saved, 0) AS saved
    FROM following f
    JOIN lists l ON l.user_id = f.followed_id
    LEFT JOIN (
      SELECT 
        movie_list.list_id,
        json_agg(m) FILTER (WHERE m.id IS NOT NULL) AS movies
      FROM movie_list
      LEFT JOIN movies m ON m.id = movie_list.movie_id
      GROUP BY movie_list.list_id
    ) ml ON ml.list_id = l.id
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN (
      SELECT list_id, COUNT(*) AS saved
      FROM list_saved
      GROUP BY list_id
    ) ls ON ls.list_id = l.id
    WHERE f.follower_id = $1
    ORDER BY saved DESC
    LIMIT 10;
    `,
    [userId]
  );
  return rows;
};
