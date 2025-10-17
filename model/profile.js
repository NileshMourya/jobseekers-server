import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, default: "" },
  username: { type: String, default: "" },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: { type: [String], default: [] },
  socialLinks: {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    resumeLink: { type: String, default: "" },
  },
});

export const Profile = mongoose.model("Profile", ProfileSchema);
