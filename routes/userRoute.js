import { Router } from "express";
import {
  createUsers,
  deleteUser,
  handleFetchProfile,
  handleLogout,
  handleProfile,
  login,
  refreshToken,
} from "../Auth/Authentication.js";
import { protect } from "../util/middleware.js";
const route = Router();

route.post("/signup", createUsers);
route.post("/login", login);
route.post("/refresh-token", refreshToken);
route.post("/removeUser", deleteUser);
route.post("/profile-update", protect, handleProfile);
route.get("/profile", protect, handleFetchProfile);
route.get("/logout", handleLogout);
export default route;
