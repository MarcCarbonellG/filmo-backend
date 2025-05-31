import axios from "axios";
import dotenv from "dotenv";
import {
  addReview,
  addToFavorites,
  addToWatched,
  createMovie,
  createRecommendation,
  deleteRecommendation,
  deleteReview,
  findFavorite,
  findFavorites,
  findMovieById,
  findMovieFromApiById,
  findPopularAmongFollowed,
  findPopularMovies,
  findReview,
  findReviews,
  findTopRatedMovies,
  findWatched,
  findWatchedArray,
  removeFavorite,
  removeFromWatched,
} from "../services/movie.service.js";
import { getCache, setCache } from "../utils/cache.js";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const searchMoviesByTitle = async (req, res) => {
  const { query, page } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  const cacheKey = `tmdb:search:${query}`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: "es-ES",
        page: page === "undefined" || page === NaN ? 1 : Number(page),
      },
    });

    const data = {
      page: response.data.page,
      movies: response.data.results,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
    };

    setCache(cacheKey, data, 60);
    res.json(data);
  } catch (error) {
    console.error("Error in searchMoviesByTitle:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getApiMovieById = async (req, res) => {
  const { id } = req.params;

  const cacheKey = `tmdb:movie:${id}`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    setCache(cacheKey, response.data, 60);
    res.json(response.data);
  } catch (error) {
    console.error("Error in getApiMovieById:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getMovieCollection = async (req, res) => {
  let { collection } = req.params;

  if (
    !collection ||
    !["now_playing", "popular", "top_rated", "upcoming", "following"].includes(
      collection
    )
  ) {
    collection = "now_playing";
  }

  try {
    let movies;

    if (collection === "top_rated") {
      movies = await findTopRatedMovies();
    } else if (collection === "popular") {
      movies = await findPopularMovies();
    } else {
      const cacheKey = `tmdb:${collection}`;

      const cachedData = getCache(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const response = await axios.get(`${TMDB_BASE_URL}/movie/${collection}`, {
        params: { api_key: TMDB_API_KEY, language: "es-ES" },
      });
      movies = response.data.results;
      setCache(cacheKey, movies, 60);
    }

    res.json(movies);
  } catch (error) {
    console.error("Error in getMovieCollection:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getPopularAmongFollowed = async (req, res) => {
  let { userId } = req.params;

  try {
    let movies;
    movies = await findPopularAmongFollowed(userId);
    res.json(movies);
  } catch (error) {
    console.error("Error in getPopularAmongFollowed:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getMovieFavorites = async (req, res) => {
  const { movieId } = req.params;

  try {
    if (!movieId) {
      return res.status(400).json({ message: "Movie id is required" });
    }

    const movieFavs = await findFavorites(movieId);

    return res.json(movieFavs);
  } catch (error) {
    console.error("Error in getMovieFavorites:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const addMovieToFavorites = async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    let movieFav = await findFavorite(userId, movieId);

    if (movieFav) {
      return res.status(400).json({
        message: "Selected movie was already in favorites",
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
          res.status(404).json({ message: "Movie not found" });
        }
      }

      movieFav = await addToFavorites(userId, movieId);

      res.status(201).json({
        message: "Movie successfully added to favorites",
        data: { movieFav, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieToFavorites:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const removeMovieFavorite = async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    const movieFav = await removeFavorite(userId, movieId);

    res.status(201).json({
      message: "Movie successfully removed from favorites",
      data: movieFav,
    });
  } catch (error) {
    console.error("Error in removeMovieFavorite:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getMovieWatched = async (req, res) => {
  const { movieId } = req.params;

  try {
    if (!movieId) {
      return res.status(400).json({ message: " Movie id is required" });
    }

    const movieWatched = await findWatchedArray(movieId);

    return res.json(movieWatched);
  } catch (error) {
    console.error("Error in getMovieWatched:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const addMovieToWatched = async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    let movieWatched = await findWatched(userId, movieId);

    if (movieWatched) {
      return res.status(400).json({
        message: "Selected movie was already in watched",
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
          res.status(404).json({ message: "Movie not found" });
        }
      }

      movieWatched = await addToWatched(userId, movieId);

      res.status(201).json({
        message: "Movie successfully added to watched",
        data: { movieWatched, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieToWatched:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const removeMovieWatched = async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    const movieWatched = await removeFromWatched(userId, movieId);

    res.status(201).json({
      message: "Movie successfully removed from watched",
      data: movieWatched,
    });
  } catch (error) {
    console.error("Error in removeMovieWatched:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getGenres = async (req, res) => {
  const cacheKey = `tmdb:genres`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    setCache(cacheKey, response.data.genres, 60);
    res.json(response.data.genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getLanguages = async (req, res) => {
  const cacheKey = `tmdb:languages`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/configuration/languages`,
      {
        params: { api_key: TMDB_API_KEY },
      }
    );

    setCache(cacheKey, response.data, 60);
    res.json(response.data);
  } catch (error) {
    console.error("Error in getLanguages:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const addMovieReview = async (req, res) => {
  const { userId, movieId, rating, content } = req.body;

  try {
    if (!userId || !movieId || !rating) {
      return res
        .status(400)
        .json({ message: "User id, movie id and rating are required" });
    }

    let movieReview = await findReview(userId, movieId);

    if (movieReview) {
      return res.status(400).json({
        message: "Selected movie was already reviewed",
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
          res.status(404).json({ message: "Movie not found" });
        }
      }

      movieReview = await addReview(userId, movieId, rating, content);

      res.status(201).json({
        message: "Movie successfully reviewed",
        data: { movieReview, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieReview:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const deleteMovieReview = async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    const movieReview = await deleteReview(userId, movieId);

    res.status(201).json({
      message: "Movie review successfully removed",
      data: movieReview,
    });
  } catch (error) {
    console.error("Error in deleteMovieReview:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getMovieReview = async (req, res) => {
  const { userId, movieId } = req.body;

  try {
    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "User id and movie id are required" });
    }

    const response = await findReview(userId, movieId);

    if (!response) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(response);
  } catch (error) {
    console.error("Error in getMovieReview:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getMovieReviews = async (req, res) => {
  const { movieId } = req.params;

  try {
    if (!movieId) {
      return res.status(400).json({ message: "Movie id is required" });
    }

    const response = await findReviews(movieId);

    res.json(response);
  } catch (error) {
    console.error("Error in getMovieReviews:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getMovieGenres = async (req, res) => {
  const { movieId } = req.params;

  const cacheKey = `tmdb:genres:${movieId}`;

  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    setCache(cacheKey, { id: movieId, genres: response.data.genres }, 60);
    res.json({ id: movieId, genres: response.data.genres });
  } catch (error) {
    console.error("Error in getMovieGenres:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const createMovieRecommendation = async (req, res) => {
  const { recommenderId, recommendedId, movieId } = req.body;

  try {
    if (!recommenderId || !recommendedId || !movieId) {
      return res.status(400).json({
        message: "Recommender, recommended and movie ids are required",
      });
    }

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

    const recommendation = await createRecommendation(
      recommenderId,
      recommendedId,
      movieId
    );

    res.status(201).json({
      message: "Recommendation successfully created",
      data: { recommendation, movie },
    });
  } catch (error) {
    console.error("Error in createMovieRecommendation:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const deleteMovieRecommendation = async (req, res) => {
  const { recommendationId } = req.body;

  try {
    if (!recommendationId) {
      return res.status(400).json({ message: "Recommendation id is required" });
    }

    const recommendation = await deleteRecommendation(recommendationId);

    res.status(201).json({
      message: "Movie recommendation successfully removed",
      data: recommendation,
    });
  } catch (error) {
    console.error("Error in deleteMovieRecommendation:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};
