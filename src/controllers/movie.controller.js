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

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const searchMoviesByTitle = async (req, res) => {
  const { query, page } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        language: "es-ES",
        page: page === "undefined" ? 1 : Number(page),
      },
    });

    res.json({
      page: response.data.page,
      movies: response.data.results,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
    });
  } catch (error) {
    console.error("Error in searchMoviesByTitle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getApiMovieById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error in getApiMovieById:", error);
    res.status(500).json({ message: "Internal server error" });
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

    switch (collection) {
      case "top_rated":
        movies = await findTopRatedMovies();
        break;
      case "popular":
        movies = await findPopularMovies();
        break;
      default:
        const response = await axios.get(
          `${TMDB_BASE_URL}/movie/${collection}`,
          {
            params: { api_key: TMDB_API_KEY, language: "es-ES" },
          }
        );
        movies = response.data.results;
    }
    res.json(movies);
  } catch (error) {
    console.error("Error in getMovieCollection:", error);
    res.status(500).json({ message: "Internal server error" });
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
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieFavorites = async (req, res) => {
  const { movie_id } = req.params;

  try {
    if (!movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request. Movie id is required" });
    }

    const movie_favs = await findFavorites(movie_id);

    return res.json(movie_favs);
  } catch (error) {
    console.error("Error in getMovieFavorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMovieToFavorites = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
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
        const movie_data = await findMovieFromApiById(movie_id);
        if (movie_data) {
          movie = await createMovie(
            movie_id,
            movie_data.title,
            movie_data.release_date,
            movie_data.poster_path
          );
        } else {
          res.status(404).json({ message: "Movie not found" });
        }
      }

      movie_fav = await addToFavorites(user_id, movie_id);

      res.status(201).json({
        message: "Movie successfully added to favorites",
        data: { movie_fav, movie },
      });
    }
  } catch (error) {
    console.error("Error in addMovieToFavorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMovieFavorite = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, user_id and movie_id are required" });
    }

    const movie_fav = await removeFavorite(user_id, movie_id);

    res.status(201).json({
      message: "Movie successfully removed from favorites",
      data: movie_fav,
    });
  } catch (error) {
    console.error("Error in removeMovieFavorite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieWatched = async (req, res) => {
  const { movie_id } = req.params;

  try {
    if (!movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request. Movie id is required" });
    }

    const movie_watched = await findWatchedArray(movie_id);

    return res.json(movie_watched);
  } catch (error) {
    console.error("Error in getMovieWatched:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMovieToWatched = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
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
        const movie_data = await findMovieFromApiById(movie_id);
        if (movie_data) {
          movie = await createMovie(
            movie_id,
            movie_data.title,
            movie_data.release_date,
            movie_data.poster_path
          );
        } else {
          res.status(404).json({ message: "Movie not found" });
        }
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

    const movie_watched = await removeFromWatched(user_id, movie_id);

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
    console.error("Error in getLanguages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMovieReview = async (req, res) => {
  const { user_id, movie_id, rating, content } = req.body;

  try {
    if (!user_id || !movie_id || !rating) {
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
        const movie_data = await findMovieFromApiById(movie_id);
        if (movie_data) {
          movie = await createMovie(
            movie_id,
            movie_data.title,
            movie_data.release_date,
            movie_data.poster_path
          );
        } else {
          res.status(404).json({ message: "Movie not found" });
        }
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

export const deleteMovieReview = async (req, res) => {
  const { user_id, movie_id } = req.body;

  try {
    if (!user_id || !movie_id) {
      return res
        .status(400)
        .json({ message: "Bad request, user_id and movie_id are required" });
    }

    const movie_review = await deleteReview(user_id, movie_id);

    res.status(201).json({
      message: "Movie review successfully removed",
      data: movie_review,
    });
  } catch (error) {
    console.error("Error in deleteMovieReview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieReview = async (req, res) => {
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
    console.error("Error in getMovieReview:", error);
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

    const response = await findReviews(movie_id);

    res.json(response);
  } catch (error) {
    console.error("Error in getMovieReviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieGenres = async (req, res) => {
  const { movieId } = req.params;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: { api_key: TMDB_API_KEY, language: "es-ES" },
    });

    res.json({ id: movieId, genres: response.data.genres });
  } catch (error) {
    console.error("Error in getMovieGenres:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMovieRecommendation = async (req, res) => {
  const { recommenderId, recommendedId, movieId } = req.body;

  try {
    if (!recommenderId || !recommendedId || !movieId) {
      return res.status(400).json({
        message:
          "Bad request. Recommender, recommended and movie ids are required",
      });
    }

    let movie = await findMovieById(movieId);

    if (!movie) {
      const movie_data = await findMovieFromApiById(movieId);
      if (movie_data) {
        movie = await createMovie(
          movieId,
          movie_data.title,
          movie_data.release_date,
          movie_data.poster_path
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
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMovieRecommendation = async (req, res) => {
  const { recommendationId } = req.body;

  try {
    if (!recommendationId) {
      return res
        .status(400)
        .json({ message: "Bad request. Recommendation id is required" });
    }

    const recommendation = await deleteRecommendation(recommendationId);

    res.status(201).json({
      message: "Movie recommendation successfully removed",
      data: recommendation,
    });
  } catch (error) {
    console.error("Error in deleteMovieRecommendation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
