import { referral } from "../model/referals.js";
import { users } from "../model/users.js";
import jwt from "jsonwebtoken";
import { fetchToken } from "../util/middleware.js";
import { promisify } from "util";
import bcrypt from "bcrypt";

// FUNTION FOR CREATING REFERRAL
export const createRefferral = async (req, res) => {
  try {
    const { jobId, candinateName, candinateEmail } = req.body;

    // EXTRACTING TOKEN
    const reftoken = await fetchToken(req);
    const decode = await promisify(jwt.verify)(
      reftoken,
      process.env.JWT_SECRET
    );

    // CHECK FOR CLIENT EXIST
    let candinate = await users.findOne({ candinateEmail });
    if (!candinate) {
      candinate = await users.create({
        name: candinateName,
        email: candinateEmail,
        isInvited: true,
      });
    }

    // CREATE REFERRAL
    await referral.create({
      job: jobId,
      refferedBy: decode.id,
      candinate: candinate._id,
    });

    // CREATE TOKEN
    const token = jwt.sign(
      { id: candinate._id, purpose: "invite" },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    // ATTACH TOKEN WITH INVITE LINK
    const inviteLink = `http://localhost/3000/complete-signup?token=${token}`;

    return res.json({ status: 200, inviteLink });
  } catch (error) {
    return res.json({ status: 400, message: error });
  }
};

// FUNCTION FOR INCOMPLETE SIGNUP
export const completeSignup = async (req, res) => {
  try {
    const { token, password } = req.body;

    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (decode.purpose !== "invite") {
      return res.json({ status: 400, message: "Invalid token not invite" });
    }

    const user = await users.findById(decode.id);
    if (!user || !user.isInvited) {
      return res.json({ status: 400, message: "Invalid Token" });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    return res.json({ status: 200, message: "Password updated successfully" });
  } catch (error) {
    return res.json({ status: 400, error });
  }
};
