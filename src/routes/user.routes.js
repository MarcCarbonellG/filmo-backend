import express from "express";
import {
  deleteUserById,
  followUser,
  getFavoritesByUsername,
  getFollowed,
  getFollowers,
  getFollowing,
  getFriends,
  getListsByUsername,
  getProfileLists,
  getPublicUserByUsername,
  getUserReviews,
  getWatchedByUsername,
  unfollowUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get public user data by username
router.get("/:username", getPublicUserByUsername);

// Delete user account by id
router.delete("/:user_id", deleteUserById);

// Get favorite movies by username
router.get("/profile/fav/:username", getFavoritesByUsername);

// Get watched movies by username
router.get("/profile/watched/:username", getWatchedByUsername);

// Get own lists by username
router.get("/profile/lists/:username", getListsByUsername);

// Get own and saved lists by username
router.get("/profile/lists/all/:username", getProfileLists);

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

// Get users that follow an specific user
router.get("/profile/friends/:userId", getFriends);

// Get user reviews
router.get("/reviews/:userId", getUserReviews);

export default router;
