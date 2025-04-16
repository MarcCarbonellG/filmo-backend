import express from "express";
import {
  followUser,
  getFavoritesByUsername,
  getFollowed,
  getFollowers,
  getPublicUserByUsername,
  getWatchedByUsername,
  unfollowUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get public user data by id
router.get("/:username", getPublicUserByUsername);

// Get favorite movies by username
router.get("/fav/:username", getFavoritesByUsername);

// Get watched movies by username
router.get("/watched/:username", getWatchedByUsername);

// Create a following relationship between users
router.post("/follow", followUser);

// Delte a following relationship between users
router.delete("/unfollow", unfollowUser);

// Get users that an specific user follows
router.get("/followed/:follower_id([0-9]+)", getFollowed);

// Get users that follow an specific user
router.get("/followers/:followed_id([0-9]+)", getFollowers);

export default router;
