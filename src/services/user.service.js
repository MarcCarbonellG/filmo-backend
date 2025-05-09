import pool from "../config/db.js";

export const findUserById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return rows[0];
};

export const findUserByUsername = async (username) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows[0];
};

export const createUser = async (username, email, hashedPassword) => {
  const { rows } = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, hashedPassword]
  );

  return rows[0];
};

export const deleteUser = async (user_id) => {
  const { rows } = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [user_id]
  );

  return rows[0];
};

export const findFavsByUsername = async (username) => {
  const { rows } = await pool.query(
    `
    SELECT movies.*
    FROM movie_fav
    JOIN users ON movie_fav.user_id = users.id
    JOIN movies ON movie_fav.movie_id = movies.id
    WHERE users.username = $1;
    `,
    [username]
  );
  return rows;
};

export const findWatchedsByUsername = async (username) => {
  const { rows } = await pool.query(
    `
    SELECT movies.*
    FROM movie_watched
    JOIN users ON movie_watched.user_id = users.id
    JOIN movies ON movie_watched.movie_id = movies.id
    WHERE users.username = $1;
    `,
    [username]
  );
  return rows;
};

export const findListsByUsername = async (username) => {
  const { rows } = await pool.query(
    `
    WITH user_lookup AS (
      SELECT id FROM users WHERE username = $1
    )
    SELECT
    lists.*,
    json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies,
    $1 AS author
    FROM lists
    JOIN user_lookup ON lists.user_id = user_lookup.id
    LEFT JOIN movie_list ON movie_list.list_id = lists.id
    LEFT JOIN movies ON movies.id = movie_list.movie_id
    WHERE lists.user_id = user_lookup.id
    GROUP BY lists.id;
    `,
    [username]
  );
  return rows;
};

export const findProfileLists = async (username) => {
  const { rows } = await pool.query(
    `
    WITH user_lookup AS (
      SELECT id FROM users WHERE username = $1
    )
    SELECT
      lists.*,
      json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies,
      $1 AS author
    FROM lists
    JOIN user_lookup ON lists.user_id = user_lookup.id
    LEFT JOIN movie_list ON movie_list.list_id = lists.id
    LEFT JOIN movies ON movies.id = movie_list.movie_id
    WHERE lists.user_id = user_lookup.id
    GROUP BY lists.id

    UNION ALL

    SELECT 
      lists.*, 
      json_agg(movies) FILTER (WHERE movies.id IS NOT NULL) AS movies,
      users.username AS author
    FROM list_saved
    JOIN lists ON lists.id = list_saved.list_id
    JOIN user_lookup ON list_saved.user_id = user_lookup.id
    LEFT JOIN movie_list ON movie_list.list_id = lists.id
    LEFT JOIN movies ON movies.id = movie_list.movie_id
    LEFT JOIN users ON lists.user_id = users.id
    GROUP BY lists.id, users.username;

    `,
    [username]
  );
  return rows;
};

export const findFollowing = async (followerId, followedId) => {
  const { rows } = await pool.query(
    "SELECT * FROM following WHERE follower_id = $1 AND followed_id = $2",
    [followerId, followedId]
  );
  return rows[0];
};

export const findFollowed = async (followerId) => {
  const { rows } = await pool.query(
    "SELECT * FROM following WHERE follower_id = $1",
    [followerId]
  );
  return rows;
};

export const findFollowers = async (followedId) => {
  const { rows } = await pool.query(
    "SELECT * FROM following WHERE followed_id = $1",
    [followedId]
  );
  return rows;
};

export const createFollowing = async (followerId, followedId) => {
  const { rows } = await pool.query(
    "INSERT INTO following (follower_id, followed_id) VALUES ($1, $2) RETURNING *",
    [followerId, followedId]
  );

  return rows[0];
};

export const deleteFollowing = async (followerId, followedId) => {
  const { rows } = await pool.query(
    "DELETE FROM following WHERE follower_id = $1 AND followed_id = $2 RETURNING *",
    [followerId, followedId]
  );

  return rows[0];
};
