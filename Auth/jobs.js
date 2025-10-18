import jwt from "jsonwebtoken";
import { promisify } from "util";
import { jobs } from "../model/jobs.js";
import { Profile } from "../model/profile.js";

export const createJobs = async (req, res) => {
  try {
    const {
      title,
      companyName,
      location,
      skills,
      decription,
      roleResponsibility,
    } = req.body;

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

    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const data = await jobs.create({
      title,
      companyName,
      location,
      skills,
      decription,
      roleResponsibility,
      postedBy: decode.id,
    });

    if (!data) {
      return res.json({ status: 400, message: "something went wrong" });
    }

    return res.json({ status: 200, message: "Job posted successfully" });
  } catch (error) {
    return res.json({ status: 400, message: error });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobData = await jobs.find();

    return res.status(200).json(jobData);
  } catch (error) {
    return res.json({ status: 404, message: error });
  }
};

// JOB RECOMMENDATION BASED ON SKILLS
export const getRecommendation = async (req, res) => {
  try {
    const { userId } = req.body;

    // GET PROFILE FROM BY USING USERID
    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const userSkills = profile.skills || [];

    // USER REGX FOR INCASESENSITVE

    const skillRegexArray = userSkills.map(
      (skill) => new RegExp(skill.replace(/\s+/g, "-"), "i")
    );

    if (!userSkills.length) {
      return res
        .status(200)
        .json({ message: "No skills found in profile", jobs: [] });
    }

    if (!matchedJobs.length) {
      return res.status(200).json({
        message: "No matching jobs found for your skills",
        jobs: [],
      });
    }

    // FIND SKILLS FOR MATCHING SKILLS
    const matchedJobs = await jobs.find({
      skills: { $in: skillRegexArray },
    });

    // RETURN MATCHING SKILLS

    return res.status(200).json({
      message: "Jobs found",
      count: matchedJobs.length,
      jobs: matchedJobs,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
