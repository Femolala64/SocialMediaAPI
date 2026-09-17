const express = require("express");
const protect = require("../middleware/auth");
const {
  createPost,
  publishPost,
  updatePost,
  deletePost,
  getMyPosts,
  getAllPosts,
  getPostById,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/me", protect, getMyPosts);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.patch("/:id/publish", protect, publishPost);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
