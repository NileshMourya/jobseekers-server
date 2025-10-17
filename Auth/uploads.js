import cloudinary from "cloudinary";
import { fetchToken } from "../util/middleware.js";
import { Profile } from "../model/profile.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import streamifier from "streamifier";
import multer from "multer";
// 2️⃣ Configure Cloudinary
export const upload = multer({ storage: multer.memoryStorage() });
cloudinary.v2.config({
  cloud_name: "dvz4gagrs",
  api_key: "163428724147162",
  api_secret: "iRQiZ_c-FvlFp3flj5sDdmddziE",
});

// 3️⃣ Stream upload function
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "raw", folder: "resumes" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const handlePdfUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).json({ message: "File not found" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(401).json({ message: "only PDF file are allowed" });
    }

    const uploadResult = await streamUpload(req.file.buffer);
    const resumeUrl = await uploadResult.secure_url;
    console.log(resumeUrl);

    const token = await fetchToken(req);
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decode.id;

    const updateProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          socialLinks: {
            resumeLink: resumeUrl,
          },
        },
      },
      { new: true, upsert: false }
    );

    if (!updateProfile) {
      return res.status(404).json({ message: "Profile Not Found" });
    }

    return res.status(200).json({ message: "Resume uploaded successfully" });
  } catch (error) {
    console.log(error);
  }
};
