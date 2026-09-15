const Follow = require("../models/follow");
const User = require("../models/user");

const followUser = async (req, res) => {
  try {
    const following = req.params.id;
    const follower = req.user._id;
    if (following.toString() === follower.toString()) {
      return res.status(400).json({
        status: false,
        message: "You cannont follow yourself",
      });
    }
    const user = await User.findById(following);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User does not exist",
      });
    }
    const follow = await Follow.create({
      following,
      follower,
    });
    return res.status(201).json({
      status: true,
      follow,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "You are already following this user",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid User ID",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const follower = req.user._id;
    const following = req.params.id;
    const follow = await Follow.findOneAndDelete({
      follower: follower,
      following: following,
    });

    if (!follow) {
      return res.status(404).json({
        status: false,
        message: "You do not follow this user",
      });
    }
    return res.status(200).json({
      status: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid User ID",
      });
    }
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({
      follower: req.user._id,
    }).populate("following", "first_name last_name username");
    return res.status(200).json({
      status: true,
      following,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({
      following: req.user._id,
    }).populate("follower", "first_name last_name username");
    return res.status(200).json({
      status: true,
      followers,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
