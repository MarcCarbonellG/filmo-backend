import pool from "../config/db.js";

const findUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return rows[0];
};

const findUserByUsername = async (username) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows[0];
};

const createUser = async (username, email, hashedPassword) => {
  return pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
    [username, email, hashedPassword]
  );
};

export { createUser, findUserByEmail, findUserByUsername };
