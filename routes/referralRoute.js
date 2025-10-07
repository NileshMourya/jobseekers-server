import { Router } from "express";
import { protect, restrictTo } from "../util/middleware.js";
import { completeSignup, createRefferral } from "../Auth/referral.js";

const route = Router();

route.post("/job/referrals", protect, restrictTo("employee"), createRefferral);
route.post("/invite/complete-signup", completeSignup);

export default route;
