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
      return res
        .status(400)
        .json({ message: "Bad request. Username is required" });
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
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFavoritesByUsername = async (req, res) => {
  let { username } = req.params;

  try {
    if (!username) {
      return res
        .status(400)
        .json({ message: "Bad request. Username is required" });
    }

    const favorites = await findFavsByUsername(username);

    res.json(favorites);
  } catch (error) {
    console.error("Error in getFavoritesByUsername:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWatchedByUsername = async (req, res) => {
  let { username } = req.params;

  try {
    if (!username) {
      return res
        .status(400)
        .json({ message: "Bad request. Username is required" });
    }

    const watched = await findWatchedsByUsername(username);

    res.json(watched);
  } catch (error) {
    console.error("Error in getWatchedByUsername:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getListsByUsername = async (req, res) => {
  let { username } = req.params;

  try {
    if (!username) {
      return res
        .status(400)
        .json({ message: "Bad request. Username is required" });
    }

    const lists = await findListsByUsername(username);

    res.json(lists);
  } catch (error) {
    console.error("Error in getListsByUsername:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileLists = async (req, res) => {
  let { username } = req.params;

  try {
    if (!username) {
      return res
        .status(400)
        .json({ message: "Bad request. Username is required" });
    }

    const lists = await findProfileLists(username);

    res.json(lists);
  } catch (error) {
    console.error("Error in getProfileLists:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFollowing = async (req, res) => {
  let { follower_id, followed_id } = req.query;

  try {
    if (!follower_id || !followed_id) {
      return res.status(400).json({
        message: "Bad request. Follower and followed ids are required",
      });
    }

    const following = await findFollowing(follower_id, followed_id);

    return res.json(following);
  } catch (error) {
    console.error("Error in getFollowing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUser = async (req, res) => {
  let { follower_id, followed_id } = req.body;

  try {
    if (!follower_id || !followed_id) {
      return res.status(400).json({
        message: "Bad request. Follower and followed ids are required",
      });
    }

    let following = await findFollowing(follower_id, followed_id);

    if (following) {
      return res.status(400).json({
        message: "Selected user was already followed by this user",
      });
    }

    following = await createFollowing(follower_id, followed_id);

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
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unfollowUser = async (req, res) => {
  let { follower_id, followed_id } = req.body;

  try {
    if (!follower_id || !followed_id) {
      return res.status(400).json({
        message: "Bad request. Follower and followed ids are required",
      });
    }

    const following = await deleteFollowing(follower_id, followed_id);

    res.json(following);
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFollowed = async (req, res) => {
  let { follower_id } = req.params;

  try {
    if (!follower_id) {
      return res.status(400).json({
        message: "Bad request. Follower id is required",
      });
    }

    const followed = await findFollowed(follower_id);

    return res.json(followed);
  } catch (error) {
    console.error("Error in getFollowed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFollowers = async (req, res) => {
  let { followed_id } = req.params;

  try {
    if (!followed_id) {
      return res.status(400).json({
        message: "Bad request. Followed id is required",
      });
    }

    const followers = await findFollowers(followed_id);

    return res.json(followers);
  } catch (error) {
    console.error("Error in getFollowers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserById = async (req, res) => {
  let { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({
        message: "Bad request. User id is required",
      });
    }

    const deletedUser = await deleteUser(user_id);

    return res.json(deletedUser);
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriends = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "Bad request. User id is required",
      });
    }

    const friends = await findFriends(userId);

    return res.json(friends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserReviews = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "Bad request. User id is required",
      });
    }

    const reviews = await findUserReviews(userId);

    return res.json(reviews);
  } catch (error) {
    console.error("Error in getUserReviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserRecommendations = async (req, res) => {
  let { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        message: "Bad request. User id is required",
      });
    }

    const recommendations = await findUserRecommendations(userId);

    return res.json(recommendations);
  } catch (error) {
    console.error("Error in getUserRecommendations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
