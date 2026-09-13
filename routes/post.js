const express = require("express");
const protect = require("../middleware/auth");
const { createPost, publishPost } = require("../controllers/postController");

const router = express.Router();

//  POST "/" -> protect, createPost
router.post("/", protect, createPost);
//  PATCH "/:id/publish" -> protect, publishPost
router.patch("/:id/publish", protect, publishPost);

module.exports = router;
