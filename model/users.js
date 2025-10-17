// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  role: {
    type: String,
    enum: ["jobseeker", "employee", "recruiter", "admin"],
    default: "jobseeker",
  },

  password: {
    type: String,
    minlength: 8,
    required: function () {
      return !this.isInvited; // password only required if not invited
    },
  },

  isInvited: { type: Boolean, default: false },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
});

export const users = mongoose.model("users", userSchema);
