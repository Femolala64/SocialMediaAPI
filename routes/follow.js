const express = require("express");
const protect = require("../middleware/auth");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require("../controllers/followController");

const router = express.Router();

router.get("/followers", protect, getFollowers);
router.get("/following", protect, getFollowing);
router.post("/:id", protect, followUser);
router.delete("/:id", protect, unfollowUser);

module.exports = router;
