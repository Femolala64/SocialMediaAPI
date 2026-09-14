const express = require("express");
const protect = require("../middleware/auth");
const {
  createPost,
  publishPost,
  updatePost,
  deletePost,
  getMyPosts,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/me", protect, getMyPosts);
router.patch("/:id/publish", protect, publishPost);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
