require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./models/post");

const AUTHOR_ID = "6aa6ce878a11f0f798483e29";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const posts = [];
    for (let i = 1; i <= 15; i++) {
      posts.push({
        title: `Seed post B${i}`,
        content: `This is seed post ${i}`,
        tags: i % 3 ? ["node"] : ["react"],
        author: AUTHOR_ID,
        state: i % 2 ? "draft" : "published",
      });
    }
    const createdPost = await Post.insertMany(posts);
    console.log(`${createdPost.length} posts created`);
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
  }
};

seed();
