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
  getUserRecommendations,
  getUserReviews,
  getWatchedByUsername,
  unfollowUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get public user data by username
router.get("/:username", getPublicUserByUsername);

// Delete user account by id
router.delete("/:userId", authMiddleware, deleteUserById);

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
router.post("/profile/follow", authMiddleware, followUser);

// Delte a following relationship between two users
router.delete("/profile/unfollow", authMiddleware, unfollowUser);

// Get users that an specific user follows
router.get("/profile/followed/:followerId([0-9]+)", getFollowed);

// Get users that follow an specific user
router.get("/profile/followers/:followedId([0-9]+)", getFollowers);

// Get users that follow and are followed by an specific user
router.get("/profile/friends/:userId", getFriends);

// Get user reviews
router.get("/reviews/:userId", getUserReviews);

// Get user recommendations
router.get("/recommendations/:userId", getUserRecommendations);

export default router;
