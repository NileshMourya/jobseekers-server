import { Router } from "express";
import {
  createUsers,
  deleteUser,
  login,
  refreshToken,
} from "../Auth/Authentication.js";
const route = Router();

route.post("/signup", createUsers);
route.post("/login", login);
route.post("/refresh-token", refreshToken);
route.post("/removeUser", deleteUser);
export default route;
