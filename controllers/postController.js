const Post = require("../models/post");

const createPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        status: false,
        message: "Provide a title and content",
      });
    }
    const post = await Post.create({
      title,
      content,
      tags,
      author: req.user._id,
    });
    return res.status(201).json({
      status: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid post data",
      });
    }
    console.error("Create post error:", error);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

const publishPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        status: false,
        message: "you do not own this post",
      });
    }

    if (post.state === "published") {
      return res.status(400).json({
        status: false,
        message: "Post is already published",
      });
    }

    post.state = "published";
    await post.save();

    return res.status(200).json({
      status: true,
      message: "Post published successfully",
      data: post,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid Post Id",
      });
    }

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { createPost, publishPost };
