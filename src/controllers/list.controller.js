import {
  addToList,
  addToSaved,
  createList,
  deleteList,
  findFollowedLists,
  findListById,
  findMovieListRelation,
  findPopularLists,
  findSaved,
  findUserListsWithMovieStatus,
  removeFromList,
  removeFromSaved,
  updateList,
} from "../services/list.service.js";

import {
  createMovie,
  findMovieById,
  findMovieFromApiById,
} from "../services/movie.service.js";

export const createMovieList = async (req, res) => {
  const { userId, title, description, movieId } = req.body;
  try {
    if (!userId || !title || !movieId) {
      return res
        .status(400)
        .json({ message: "User id, title and movie id are required" });
    }

    const list = await createList(userId, title, description);

    let movie = await findMovieById(movieId);

    if (!movie) {
      const movieData = await findMovieFromApiById(movieId);
      if (movieData) {
        movie = await createMovie(
          movieId,
          movieData.title,
          movieData.release_date,
          movieData.poster_path
        );
      } else {
        res.status(404).json({ message: "Movie not found" });
      }
    }

    const movieList = await addToList(list.id, movieId);

    res.status(201).json({
      message: "List successfully created",
      data: { list, movieList },
    });
  } catch (error) {
    console.error("Error in createMovieList:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getListById = async (req, res) => {
  const { listId } = req.params;
  let { page } = req.query;

  try {
    if (!listId) {
      return res.status(400).json({ message: "List id is required" });
    }

    const list = await findListById(listId);

    if (list) {
      page ??= 1;

      return res.json({
        ...list,
        page: page ?? 1,
        movies: list.movies.slice((page - 1) * 20, (page - 1) * 20 + 20),
        totalPages: Math.ceil(list.movies.length / 20),
        totalResults: list.movies.length,
      });
    }
    res.status(404).json({ message: "List not found" });
  } catch (error) {
    console.error("Error in getListById:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getUserListsWithMovieStatus = async (req, res) => {
  const { userId, movieId } = req.query;

  try {
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    const lists = await findUserListsWithMovieStatus(userId, movieId);

    return res.json(lists);
  } catch (error) {
    console.error("Error in getUserListsWithMovieStatus:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const addMovieToList = async (req, res) => {
  const { listId, movieId } = req.body;

  try {
    if (!listId || !movieId) {
      return res
        .status(400)
        .json({ message: "List id and movie id are required" });
    }

    let movieList = await findMovieListRelation(listId, movieId);

    if (movieList) {
      return res.status(400).json({
        message: "Selected movie was already in the list",
      });
    } else {
      let movie = await findMovieById(movieId);

      if (!movie) {
        const movieData = await findMovieFromApiById(movieId);
        if (movieData) {
          movie = await createMovie(
            movieId,
            movieData.title,
            movieData.release_date,
            movieData.poster_path
          );
        } else {
          return res.status(404).json({ message: "Movie not found" });
        }
      }

      movieList = await addToList(listId, movieId);

      res.status(201).json({
        message: "Movie successfully added to list",
        data: { movieList, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieToList:", error);
    res.status(error.status || 500).json({ message: "Internal server error" });
  }
};

export const removeMovieFromList = async (req, res) => {
  const { listId, movieId } = req.body;

  try {
    if (!listId || !movieId) {
      return res
        .status(400)
        .json({ message: " List id and movie id are required" });
    }

    const movieList = await removeFromList(listId, movieId);

    res.status(201).json({
      message: "Movie successfully removed from list",
      data: movieList,
    });
  } catch (error) {
    console.error("Error in removeMovieFromList:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const deleteListById = async (req, res) => {
  let { listId } = req.params;

  try {
    if (!listId) {
      return res.status(400).json({
        message: "List id is required",
      });
    }

    const deletedList = await deleteList(listId);

    return res.json({
      message: "List successfully deleted",
      data: { deletedList },
    });
  } catch (error) {
    console.error("Error in deleteListById:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const updateMovieList = async (req, res) => {
  const { listId } = req.params;
  const { title, description } = req.body;

  try {
    const updatedList = await updateList(listId, title, description);

    if (!updatedList) {
      return res
        .status(404)
        .json({ error: "List not found or without updates" });
    }

    res.json(updatedList);
  } catch (err) {
    console.error("Error in updateMovieList:", err);
    res.status(error.status).json({ error: "Internal server error" });
  }
};

export const getListSaved = async (req, res) => {
  const { userId, listId } = req.query;

  try {
    if (!userId || !listId) {
      return res
        .status(400)
        .json({ message: "User id and list id are required" });
    }

    const listSaved = await findSaved(userId, listId);

    return res.json(listSaved);
  } catch (error) {
    console.error("Error in getListSaved:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const addListToSaved = async (req, res) => {
  const { userId, listId } = req.body;

  try {
    if (!userId || !listId) {
      return res
        .status(400)
        .json({ message: "User id and list id are required" });
    }

    let listSaved = await findSaved(listId);

    if (listSaved) {
      return res.status(400).json({
        message: "Selected movie was already in saved",
      });
    } else {
      listSaved = await addToSaved(userId, listId);

      res.status(201).json({
        message: "List successfully added to saved",
        data: listSaved,
      });
    }
  } catch (error) {
    console.error("Error in addListToSaved:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const removeListSaved = async (req, res) => {
  const { userId, listId } = req.body;

  try {
    if (!userId || !listId) {
      return res
        .status(400)
        .json({ message: "User id and list id are required" });
    }

    const listSaved = await removeFromSaved(userId, listId);

    res.status(201).json({
      message: "List successfully removed from saved",
      data: listSaved,
    });
  } catch (error) {
    console.error("Error in removeListSaved:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getPopularLists = async (req, res) => {
  try {
    const lists = await findPopularLists();

    res.json(lists);
  } catch (error) {
    console.error("Error in getPopularLists:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getFollowedLists = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const lists = await findFollowedLists(userId);

    res.status(201).json(lists);
  } catch (error) {
    console.error("Error in getFollowedLists:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};
