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
      SELECT * FROM users WHERE username = $1
    ),
    movie_agg AS (
      SELECT 
        movie_list.list_id,
        json_agg(m) FILTER (WHERE m.id IS NOT NULL) AS movies
      FROM movie_list
      LEFT JOIN movies m ON m.id = movie_list.movie_id
      GROUP BY movie_list.list_id
    )
    SELECT 
      l.*,
      COALESCE(ma.movies, '[]'::json) AS movies,
      $1 AS author,
      u.avatar as author_avatar
    FROM lists l
    JOIN user_lookup u ON l.user_id = u.id
    LEFT JOIN movie_agg ma ON ma.list_id = l.id
    WHERE l.user_id = u.id;
    `,
    [username]
  );
  return rows;
};

export const findProfileLists = async (username) => {
  const { rows } = await pool.query(
    `
    WITH user_lookup AS (
      SELECT * FROM users WHERE username = $1
    ),
    movie_agg AS (
      SELECT 
        movie_list.list_id,
        json_agg(m) FILTER (WHERE m.id IS NOT NULL) AS movies
      FROM movie_list
      LEFT JOIN movies m ON m.id = movie_list.movie_id
      GROUP BY movie_list.list_id
    )
    SELECT 
      l.*, 
      COALESCE(ma.movies, '[]'::json) AS movies, 
      $1 AS author,
      u.avatar as author_avatar
    FROM lists l
    JOIN user_lookup u ON l.user_id = u.id
    LEFT JOIN movie_agg ma ON ma.list_id = l.id
    UNION ALL
    SELECT 
      l.*, 
      COALESCE(ma.movies, '[]'::json) AS movies, 
      u2.username AS author,
      u2.avatar as author_avatar
    FROM list_saved ls
    JOIN lists l ON l.id = ls.list_id
    JOIN user_lookup u ON ls.user_id = u.id
    LEFT JOIN movie_agg ma ON ma.list_id = l.id
    LEFT JOIN users u2 ON l.user_id = u2.id;
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
    `
    SELECT users.id, users.username, users.avatar, users.is_admin
    FROM following
    JOIN users ON following.followed_id = users.id
    WHERE following.follower_id = $1;
    `,
    [followerId]
  );
  return rows;
};

export const findFollowers = async (followedId) => {
  const { rows } = await pool.query(
    `
    SELECT users.id, users.username, users.avatar, users.is_admin
    FROM following
    JOIN users ON following.follower_id = users.id
    WHERE following.followed_id = $1;
    `,
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

export const findFriends = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT u.id, u.username, u.avatar, u.is_admin
    FROM following f1
    JOIN following f2 
      ON f1.follower_id = f2.followed_id 
    AND f1.followed_id = f2.follower_id
    JOIN users u 
      ON u.id = f1.followed_id
    WHERE f1.follower_id = $1;

    `,
    [userId]
  );
  return rows;
};

export const findUserReviews = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM reviews
    WHERE user_id = $1
    `,
    [userId]
  );
  return rows;
};

export const findUserRecommendations = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      r.*,
      u.username AS recommender_username,
      u.avatar AS recommender_avatar,
      m.title AS movie_title
    FROM recommendations r
    JOIN users u ON r.recommender_id = u.id
    JOIN movies m ON r.movie_id = m.id
    WHERE r.recommended_id = $1;
    `,
    [userId]
  );
  return rows;
};
