import User from "../models/User.js";
import crypto from "crypto";

export const changePassword = async (req, res) => {
  try {
    const { userId, oldpassword, newpassword } = req.body;
    const user = await User.findById({ _id: userId });
    if (!user || user.length < 1 ) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }
    const hashPassword = crypto
      .createHash("sha256")
      .update(oldpassword)
      .digest("hex");

      const NewhashPassword = crypto
      .createHash("sha256")
      .update(newpassword)
      .digest("hex");
    
    if (hashPassword !== user.password) {
      return res
        .status(404)
        .json({ success: false, error: "Old Pasword was wrong!" });
    }
    const newUser = await User.findByIdAndUpdate({_id: userId}, {password: NewhashPassword})
        return res.status(200).json({success: true, error: "Password Changed Successfully" })

  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Setting Error Server Error" });
  }
};
