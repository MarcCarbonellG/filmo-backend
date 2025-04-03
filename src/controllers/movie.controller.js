import axios from "axios";
import dotenv from "dotenv";
import {
  addToFav,
  createMovie,
  findFavById,
  findMovieById,
  removeFav,
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

    res.json(response.data.results);
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
  const { user_id, movie_id, title, year, image } = req.body;

  try {
    if (!user_id || !movie_id || !title || !year || !image) {
      return res.status(400).json({ message: "Bad request" });
    }

    const movie_fav = await findFavById(user_id, movie_id);

    if (movie_fav) {
      return res.status(400).json({
        message: "Selected movie was already in favorites",
      });
    } else {
      const movie = await findMovieById(movie_id);

      if (!movie) {
        movie = await createMovie(movie_id, title, year, image);
      }

      const movie_fav = await addToFav(user_id, movie_id);

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
  const { id } = req.params;

  try {
    if (!id) {
      return res
        .status(400)
        .json({ message: "Bad request, movie_fav_id is required" });
    }

    const movie_fav = await findFavById(id);

    if (movie_fav) {
      await removeFav(id);
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
