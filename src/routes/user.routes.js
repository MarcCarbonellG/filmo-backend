import express from "express";
import {
  followUser,
  getFavoritesByUsername,
  getFollowed,
  getFollowers,
  getFollowing,
  getPublicUserByUsername,
  getWatchedByUsername,
  unfollowUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get public user data by id
router.get("/:username", getPublicUserByUsername);

// Get favorite movies by username
router.get("/profile/fav/:username", getFavoritesByUsername);

// Get watched movies by username
router.get("/profile/watched/:username", getWatchedByUsername);

// Get following relationship between two users
router.get("/profile/following", getFollowing);

// Create a following relationship between two users
router.post("/profile/follow", followUser);

// Delte a following relationship between two users
router.delete("/profile/unfollow", unfollowUser);

// Get users that an specific user follows
router.get("/profile/followed/:follower_id([0-9]+)", getFollowed);

// Get users that follow an specific user
router.get("/profile/followers/:followed_id([0-9]+)", getFollowers);

export default router;
