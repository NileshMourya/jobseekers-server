import jwt from "jsonwebtoken";
import { promisify } from "util";
import { users } from "../model/users.js"; // update path to your user model

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Get token from Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies?.accessToken;
    }

    // 2️⃣ If no token, block access

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access",
      });
    }

    // 3️⃣ Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 4️⃣ Check if user still exists
    const currentUser = await users.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists",
      });
    }

    // 5️⃣ Attach user to request for next middlewares
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

export const fetchToken = async (req) => {
  let token;

  // 1️⃣ Get token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  return token;
};
