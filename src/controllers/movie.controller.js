import axios from "axios";
import dotenv from "dotenv";

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
