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

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials ",
      });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      status: true,
      message: "Login Successful",
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = { signup, signin };
