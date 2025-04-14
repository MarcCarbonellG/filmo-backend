import axios from "axios";
import dotenv from "dotenv";
import {
  addReview,
  addToFav,
  addToWatched,
  createMovie,
  filterValidMovies,
  findFavorite,
  findMovieById,
  findReview,
  findWatched,
  getReviews,
  removeFav,
  removeFromWatched,
  removeReview,
} from "../services/movie.service.js";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const searchMoviesByTitle = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query, language: "es-ES" },
    });

    res.json(filterValidMovies(response.data.results));
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieList = async (req, res) => {
  let { listName } = req.params;

  if (
    !listName ||
    !["now_playing", "popular", "top_rated", "upcoming"].includes(listName)
  ) {
    listName = "now_playing";
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${listName}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMovieToFav = async (req, res) => {
  const { user_id, movie_id, title, release_date, poster } = req.body;

  try {
    if (!user_id || !movie_id || !title || !date || !poster) {
      return res.status(400).json({ message: "Bad request" });
    }

    let movie_fav = await findFavorite(user_id, movie_id);

    if (movie_fav) {
      return res.status(400).json({
        message: "Selected movie was already in favorites",
      });
    } else {
      let movie = await findMovieById(movie_id);

      if (!movie) {
        movie = await createMovie(movie_id, title, release_date, poster);
      }

      movie_fav = await addToFav(user_id, movie_id);

      res.status(201).json({
        message: "Movie successfully added to favorites",
        data: { movie_fav, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieToFav:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMovieFav = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, user_id and movie_id are required" });
    }

    const movie_fav = await findFavorite(user_id, movie_id);

    if (movie_fav) {
      await removeFav(user_id, movie_id);
    } else {
      return res.status(400).json({
        message: "Selected movie was not in favorites",
      });
    }

    res.status(201).json({
      message: "Movie successfully removed from favorites",
      data: movie_fav,
    });
  } catch (error) {
    console.error("Error in removeMovieFav:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMovieToWatched = async (req, res) => {
  const { user_id, movie_id, title, release_date, poster } = req.body;

  try {
    if (!user_id || !movie_id || !title || !date || !poster) {
      return res.status(400).json({ message: "Bad request" });
    }

    let movie_watched = await findWatched(user_id, movie_id);

    if (movie_watched) {
      return res.status(400).json({
        message: "Selected movie was already in watched",
      });
    } else {
      let movie = await findMovieById(movie_id);

      if (!movie) {
        movie = await createMovie(movie_id, title, release_date, poster);
      }

      movie_watched = await addToWatched(user_id, movie_id);

      res.status(201).json({
        message: "Movie successfully added to watched",
        data: { movie_watched, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieToWatched:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMovieWatched = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, user_id and movie_id are required" });
    }

    const movie_watched = await findWatched(user_id, movie_id);

    if (movie_watched) {
      await removeFromWatched(user_id, movie_id);
    } else {
      return res.status(400).json({
        message: "Selected movie was not in watched",
      });
    }

    res.status(201).json({
      message: "Movie successfully removed from watched",
      data: movie_watched,
    });
  } catch (error) {
    console.error("Error in removeMovieWatched:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGenres = async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    res.json(response.data.genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLanguages = async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/configuration/languages`,
      {
        params: { api_key: TMDB_API_KEY },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMovieReview = async (req, res) => {
  const { user_id, movie_id, title, release_date, poster, rating, content } =
    req.body;

  try {
    if (
      !user_id ||
      !movie_id ||
      !title ||
      !release_date ||
      !poster ||
      !rating
    ) {
      return res.status(400).json({ message: "Bad request" });
    }

    let movie_review = await findReview(user_id, movie_id);

    if (movie_review) {
      return res.status(400).json({
        message: "Selected movie was already reviewed",
      });
    } else {
      let movie = await findMovieById(movie_id);

      if (!movie) {
        movie = await createMovie(movie_id, title, release_date, poster);
      }

      movie_review = await addReview(user_id, movie_id, rating, content);

      res.status(201).json({
        message: "Movie successfully reviewed",
        data: { movie_review, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieReview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMovieReview = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, user_id and movie_id are required" });
    }

    const movie_review = await findReview(user_id, movie_id);

    if (movie_review) {
      await removeReview(user_id, movie_id);
    } else {
      return res.status(400).json({
        message: "Selected movie was not reviewed",
      });
    }

    res.status(201).json({
      message: "Movie review successfully removed",
      data: movie_review,
    });
  } catch (error) {
    console.error("Error in removeMovieReview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findMovieReview = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, user_id and movie_id are required" });
    }

    const response = await findReview(user_id, movie_id);

    if (!response) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(response);
  } catch (error) {
    console.error("Error in findMovieReview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieReviews = async (req, res) => {
  const { movie_id } = req.params;

  try {
    if (!movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, movie_id is required" });
    }

    const response = await getReviews(movie_id);

    res.json(response);
  } catch (error) {
    console.error("Error in getMovieReviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
