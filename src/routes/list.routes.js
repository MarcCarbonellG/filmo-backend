import express from "express";
import {
  addListToSaved,
  addMovieToList,
  createMovieList,
  deleteListById,
  getFollowedLists,
  getListById,
  getListSaved,
  getPopularLists,
  getUserListsWithMovieStatus,
  removeListSaved,
  removeMovieFromList,
  updateMovieList,
} from "../controllers/list.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new list
router.post("/", authMiddleware, createMovieList);

// Get user lists
router.get("/", getUserListsWithMovieStatus);

// Get a collection of popular lists
router.get("/popular", getPopularLists);

// Get lists created by followed users
router.get("/followed/:userId", getFollowedLists);

// Adds movie to a list
router.post("/movie", authMiddleware, addMovieToList);

// Removes movie from list
router.delete("/movie", authMiddleware, removeMovieFromList);

// Get list saved
router.get("/saved", getListSaved);

// Add movie to saved
router.post("/saved", addListToSaved);

// Remove movie from saved
router.delete("/saved", removeListSaved);

// Get list by id
router.get("/:listId", getListById);

// Deletes list by id
router.delete("/:listId", authMiddleware, deleteListById);

// Update list
router.put("/:listId", authMiddleware, updateMovieList);

export default router;
