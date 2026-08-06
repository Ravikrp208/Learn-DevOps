import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

// Signup function to create a new user and generate a token
export const signup = async (req, res) => {
  try {
    const { email, password, assistantName } = req.body;

    if (!email || !password || !assistantName) {
      return res.status(400).json({ message: "All fields (email, password, assistantName) are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existEmail = await User.findOne({ email: normalizedEmail });
    if (existEmail) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      assistantName: assistantName.trim(),
      password: hashedPassword,
      email: normalizedEmail,
    });

    const token = await genToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json(userObj);
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Backward compatibility alias for signup
export const singup = signup;

// Login function to authenticate a user and generate a token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = await genToken(existingUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = existingUser.toObject();
    delete userObj.password;

    return res.status(200).json(userObj);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Logout function to clear the authentication token cookie
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Logout error" });
  }
};

// Get authenticated user details
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

