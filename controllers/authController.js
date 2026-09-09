const User = require("../models/user");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
  try {
    const { first_name, last_name, username, email, password } = req.body;

    if (!first_name || !last_name || !username || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "all fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(409).json({
        status: false,
        message: `This ${field} is already registered`,
      });
    }

    const user = await User.create({
      first_name,
      last_name,
      username,
      email,
      password,
    });
    const token = generateToken(user._id);

    return res.status(201).json({
      status: true,
      message: "user created successfully",
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: false,
        message: `${field} already in exists`,
      });
    }
    console.log("SignUp error", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server error",
    });
  }
};

module.exports = { signup };
