import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user === null) {
            res.status(404).json({ success: false, error: "Email Not Found" });
    }
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    if (user.password !== hashPassword) {
      res.status(404).json({ success: false, error: "Wrong Password" });
    }

    if (user.password === hashPassword) {
      const token = jwt.sign(
        { _id: user._id, role: user.role, networkname :user.networkname, permissions: user.permissions, expirytype: user.expirytype },
        process.env.JWT_KEY,
        { expiresIn: "1d" }

      );
      res.status(200).json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, role: user.role, networkname :user.networkname, permissions: user.permissions, expirytype: user.expirytype },
      });
    }
   
  } catch (error) {
    return;
    res.status(500).json({ success: false, error: error.message });
  }
};
export const verify = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
