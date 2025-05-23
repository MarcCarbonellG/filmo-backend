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

const router = express.Router();

// Create a new list
router.post("/", createMovieList);

// Get user lists
router.get("/", getUserListsWithMovieStatus);

// Get a collection of popular lists
router.get("/popular", getPopularLists);

// Get lists created by followed users
router.get("/followed/:userId", getFollowedLists);

// Adds movie to a list
router.post("/movie", addMovieToList);

// Removes movie from list
router.delete("/movie", removeMovieFromList);

// Get list saved
router.get("/saved", getListSaved);

// Add movie to saved
router.post("/saved", addListToSaved);

// Remove movie from saved
router.delete("/saved", removeListSaved);

// Get list by id
router.get("/:listId", getListById);

// Deletes list by id
router.delete("/:listId", deleteListById);

// Update list
router.put("/:listId", updateMovieList);

export default router;
