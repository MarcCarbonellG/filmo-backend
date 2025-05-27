import {
  createFollowing,
  deleteFollowing,
  deleteUser,
  findFavsByUsername,
  findFollowed,
  findFollowers,
  findFollowing,
  findFriends,
  findListsByUsername,
  findProfileLists,
  findUserByUsername,
  findUserRecommendations,
  findUserReviews,
  findWatchedsByUsername,
} from "../services/user.service.js";

export const getPublicUserByUsername = async (req, res) => {
  let { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { email, password, ...publicUserData } = user;

    res.json(publicUserData);
  } catch (error) {
    console.error("Error in getPublicUserByUsername:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getFavoritesByUsername = async (req, res) => {
  let { username } = req.params;
  let { page } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const favorites = await findFavsByUsername(username);

    page ??= 1;

    res.json({
      page: page ?? 1,
      movies: favorites.slice((page - 1) * 20, (page - 1) * 20 + 20),
      totalPages: Math.ceil(favorites.length / 20),
      totalResults: favorites.length,
    });
  } catch (error) {
    console.error("Error in getFavoritesByUsername:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getWatchedByUsername = async (req, res) => {
  let { username } = req.params;
  let { page } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const watched = await findWatchedsByUsername(username);

    page ??= 1;

    return res.json({
      page: page ?? 1,
      movies: watched.slice((page - 1) * 20, (page - 1) * 20 + 20),
      totalPages: Math.ceil(watched.length / 20),
      totalResults: watched.length,
    });
  } catch (error) {
    console.error("Error in getWatchedByUsername:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getListsByUsername = async (req, res) => {
  let { username } = req.params;
  let { page } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const lists = await findListsByUsername(username);

    page ??= 1;

    return res.json({
      page: page ?? 1,
      lists: lists.slice((page - 1) * 5, (page - 1) * 5 + 5),
      totalPages: Math.ceil(lists.length / 5),
      totalResults: lists.length,
    });
  } catch (error) {
    console.error("Error in getListsByUsername:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getProfileLists = async (req, res) => {
  let { username } = req.params;
  let { page } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const lists = await findProfileLists(username);

    page ??= 1;

    return res.json({
      page: page ?? 1,
      lists: lists.slice((page - 1) * 5, (page - 1) * 5 + 5),
      totalPages: Math.ceil(lists.length / 5),
      totalResults: lists.length,
    });
  } catch (error) {
    console.error("Error in getProfileLists:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getFollowing = async (req, res) => {
  let { followerId, followedId } = req.query;

  try {
    if (!followerId || !followedId) {
      return res.status(400).json({
        message: "Follower and followed ids are required",
      });
    }

    const following = await findFollowing(followerId, followedId);

    return res.json(following);
  } catch (error) {
    console.error("Error in getFollowing:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const followUser = async (req, res) => {
  let { followerId, followedId } = req.body;

  try {
    if (!followerId || !followedId) {
      return res.status(400).json({
        message: "Follower and followed ids are required",
      });
    }

    let following = await findFollowing(followerId, followedId);

    if (following) {
      return res.status(400).json({
        message: "Selected user was already followed by this user",
      });
    }

    following = await createFollowing(followerId, followedId);

    res.json(following);
  } catch (error) {
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ message: "One of the users does not exist" });
    } else if (error.code === "23514") {
      return res
        .status(400)
        .json({ message: "A user can not be followed by himself" });
    }
    console.error("Error in followUser:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const unfollowUser = async (req, res) => {
  let { followerId, followedId } = req.body;

  try {
    if (!followerId || !followedId) {
      return res.status(400).json({
        message: "Follower and followed ids are required",
      });
    }

    const following = await deleteFollowing(followerId, followedId);

    res.json(following);
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getFollowed = async (req, res) => {
  let { followerId } = req.params;

  try {
    if (!followerId) {
      return res.status(400).json({
        message: "Follower id is required",
      });
    }

    const followed = await findFollowed(followerId);

    return res.json(followed);
  } catch (error) {
    console.error("Error in getFollowed:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getFollowers = async (req, res) => {
  let { followedId } = req.params;

  try {
    if (!followedId) {
      return res.status(400).json({
        message: "Followed id is required",
      });
    }

    const followers = await findFollowers(followedId);

    return res.json(followers);
  } catch (error) {
    console.error("Error in getFollowers:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const deleteUserById = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "User id is required",
      });
    }

    const deletedUser = await deleteUser(userId);

    return res.json(deletedUser);
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getFriends = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "User id is required",
      });
    }

    const friends = await findFriends(userId);

    return res.json(friends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getUserReviews = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "User id is required",
      });
    }

    const reviews = await findUserReviews(userId);

    return res.json(reviews);
  } catch (error) {
    console.error("Error in getUserReviews:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};

export const getUserRecommendations = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "User id is required",
      });
    }

    const recommendations = await findUserRecommendations(userId);

    return res.json(recommendations);
  } catch (error) {
    console.error("Error in getUserRecommendations:", error);
    res.status(error.status).json({ message: "Internal server error" });
  }
};
