import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title: String,
  companyName: String,
  location: String,
  skills: String,
  decription: String,
  roleResponsibility: String,
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  createdAt: { type: Date, default: Date.now() },
});

export const jobs = mongoose.model("jobs", jobSchema);
