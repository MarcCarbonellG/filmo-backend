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
    lists.*,
    json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies,
    users.username AS author,
    (
      SELECT COUNT(*)
      FROM list_saved
      WHERE list_saved.list_id = lists.id
    ) AS saved
    FROM lists
    LEFT JOIN movie_list ON movie_list.list_id = lists.id
    LEFT JOIN movies ON movies.id = movie_list.movie_id
    LEFT JOIN users ON lists.user_id = users.id
    WHERE lists.id = $1
    GROUP BY lists.id, users.username; 
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
      lists.*,
      json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies,
      users.username AS author,
      (
        SELECT COUNT(*)
        FROM list_saved
        WHERE list_saved.list_id = lists.id
      ) AS saved
    FROM lists
    LEFT JOIN movie_list ON movie_list.list_id = lists.id
    LEFT JOIN movies ON movies.id = movie_list.movie_id
    LEFT JOIN users ON lists.user_id = users.id
    GROUP BY lists.id, users.username
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
      lists.*,
      json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies,
      users.username AS author,
      (
        SELECT COUNT(*)
        FROM list_saved
        WHERE list_saved.list_id = lists.id
      ) AS saved
    FROM following
    JOIN lists ON lists.user_id = following.followed_id
    LEFT JOIN movie_list ON movie_list.list_id = lists.id
    LEFT JOIN movies ON movies.id = movie_list.movie_id
    LEFT JOIN users ON lists.user_id = users.id
    WHERE following.follower_id = $1
    GROUP BY lists.id, users.username
    ORDER BY saved DESC
    LIMIT 10;
    `,
    [userId]
  );
  return rows;
};
