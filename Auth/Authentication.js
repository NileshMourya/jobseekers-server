import { Profile } from "../model/profile.js";
import { users } from "../model/users.js";
import connectToDatabase from "../util/dbConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fetchToken } from "../util/middleware.js";
import { promisify } from "util";

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
    const newUser = await users.create({ email, name, password: hashed, role });

    const profile = Profile.create({
      userId: newUser._id,
      username: newUser.name,
    });

    newUser.profileId = profile._id;
    await newUser.save();

    if (!newUser) {
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
      { expiresIn: "2m" } // short-lived
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
    let refreshToken;

    // 1️⃣ Get token from Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      refreshToken = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.refreshToken) {
      refreshToken = req.cookies?.refreshToken;
    }

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
      return res.status(200).json({
        accessToken,
        role: user.role,
      });
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

export const handleProfile = async (req, res) => {
  const { username, role, bio, location, skills, socialLinks = {} } = req.body;
  const { github, linkedin } = socialLinks;

  try {
    const token = await fetchToken(req);
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decode.id;

    const updateProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          role,
          username,
          bio,
          location,
          skills,
          socialLinks: {
            github,
            linkedin,
          },
        },
      },
      { new: true, upsert: false }
    );

    if (!updateProfile) {
      return res.Status(404).json({ message: "Profile Not Found" });
    }

    return res.status(200).json({ message: "Profile created" });
  } catch (error) {
    console.log(error);
  }
};

export const handleFetchProfile = async (req, res) => {
  try {
    const token = await fetchToken(req);

    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const profileData = await Profile.findOne({ userId: decode.id });

    if (!profileData) {
      return res.status(404).json({ message: "Profile Not Found" });
    }

    return res.status(200).json(profileData);
  } catch (error) {
    console.log(error);
  }
};
