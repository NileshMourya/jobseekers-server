import jwt from "jsonwebtoken";
import { promisify } from "util";
import { jobs } from "../model/jobs.js";
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
