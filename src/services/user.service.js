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
