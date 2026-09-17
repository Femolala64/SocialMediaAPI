const Like = require("../models/like");
const Post = require("../models/post");

const likePost = async (req, res) => {
  try {
    const post = req.params.id;
    const user = req.user._id;

    const existingPost = await Post.findById(post);

    if (!existingPost) {
      return res.status(404).json({
        status: false,
        message: "Post does not exist",
      });
    }
    await Like.create({
      user,
      post,
    });

    await Post.findByIdAndUpdate(post, {
      $inc: { like_count: 1 },
    });
    return res.status(201).json({
      status: true,
      message: "Post liked",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Post Already liked",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid Post Id",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const post = req.params.id;
    const user = req.user._id;

    const deleted = await Like.findOneAndDelete({
      user,
      post,
    });

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "you have not liked this post",
      });
    }

    await Post.findByIdAndUpdate(post, { $inc: { like_count: -1 } });
    return res.status(200).json({
      status: true,
      message: "Unliked Post",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid Post Id",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

module.exports = { likePost, unlikePost };
