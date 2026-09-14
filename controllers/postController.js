const { post } = require("../app");
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

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post Not found",
      });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        status: false,
        message: "Not Authorized",
      });
    }

    if (req.body.title !== undefined) {
      post.title = req.body.title;
    }
    if (req.body.content !== undefined) {
      post.content = req.body.content;
    }
    if (req.body.tags !== undefined) {
      post.tags = req.body.tags;
    }
    await post.save();
    return res.status(200).json({
      status: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: "Invalid postId",
      });
    }
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post Not Found",
      });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({
        status: false,
        message: "Not Authorized",
      });
    }
    await post.deleteOne();
    return res.status(200).json({
      status: true,
      message: "Post deleted successfully ",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: false,
        message: "Invalid Post Id",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const state = req.query.state;
    const filter = { author: req.user._id };

    if (state !== undefined) {
      if (state !== "draft" && state !== "published") {
        return res.status(400).json({
          status: false,
          message: "Invalid state Use draft or published.",
        });
      }
      filter.state = state;
    }
    const skip = (page - 1) * limit;
    const posts = await Post.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalPost = await Post.countDocuments(filter);
    return res.status(200).json({
      status: true,
      posts,
      page,
      limit,
      totalPost,
    });
  } catch (error) {
    // 500
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
module.exports = {
  createPost,
  publishPost,
  updatePost,
  deletePost,
  getMyPosts,
};
