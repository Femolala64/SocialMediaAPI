const express = require("express");
const protect = require("../middleware/auth");
const { likePost, unlikePost } = require("../controllers/likeController");

const router = express.Router();

router.post("/:id", protect, likePost);
router.delete("/:id", protect, unlikePost);

module.exports = router;
