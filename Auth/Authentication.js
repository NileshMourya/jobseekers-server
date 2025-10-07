import { users } from "../model/users.js";
import connectToDatabase from "../util/dbConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// CREATING USERS

export const createUsers = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // CHECK FOR EMPTY FIELDS FIRST
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // CHECK FOR DUPLICATE EMAIL
    const checkEmail = await users.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // HASHED PASSWORD
    const hashed = await bcrypt.hash(password, 10);

    // CREATE USER
    const data = await users.create({ email, name, password: hashed, role });
    if (!data) {
      return res.status(500).json({ message: "Error occurred" });
    }

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 400, message: "User not found" });
    }

    // 2. Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ status: 400, message: "Invalid password" });
    }

    // 3. Create tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // short-lived
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // long-lived
    );

    // 4. Store refresh token in HttpOnly cookie
    res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Secure`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=Strict; Secure`,
    ]);

    // 5. Send access token in JSON (frontend keeps it in memory, not localStorage)
    return res.json({
      status: 200,
      refreshToken,
      accessToken,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Invalid or expired refresh token" });
      }

      // Issue a new access token
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.setHeader("Set-Cookie", [
        `accessToken=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Secure`,
      ]);
      return res.json({ role: user.role });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await users.findByIdAndDelete(id);
    if (!result) {
      return res.json({ status: 404, message: "users not found" });
    }
    return res.json({ status: 200, message: "users deleted successfully" });
  } catch (error) {
    return res.json({ status: 400, message: error });
  }
};
