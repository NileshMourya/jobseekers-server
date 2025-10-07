import { Router } from "express";
import { createJobs, getAllJobs } from "../Auth/jobs.js";
import { protect, restrictTo } from "../util/middleware.js";
const router = Router();

router.post("/addJobs", protect, restrictTo("recruiter"), createJobs);
router.get("/getJobs", protect, getAllJobs);
export default router;
