import mongoose from "mongoose";

const referralSchema = mongoose.Schema({
  job: { type: mongoose.Schema.ObjectId, ref: "jobs" },
  refferedBy: { type: mongoose.Schema.ObjectId, ref: "users" },
  candinate: { type: mongoose.Schema.ObjectId, ref: "users" },
  status: {
    type: String,
    emum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const referral = mongoose.model("referral", referralSchema);
