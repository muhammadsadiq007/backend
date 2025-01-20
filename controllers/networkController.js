import User from "../models/User.js";
import crypto from "crypto";


export const addNetwork = async (req, res) => {
  try {
    const {
      network_name,
      net_admin_name,
      net_admin_password,
      net_admin_email,
      net_admin_role,
    } = req.body;

    const networkName = await User.findOne({ networkname: network_name });
    if (networkName) {
      return res
        .status(400)
        .json({ success: false, error: "Network Already Exists!" });
    }
    const user = await User.findOne({ email: net_admin_email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User Already Exists!" });
    }
    
    const hashPassword = crypto
      .createHash("sha256")
      .update(net_admin_password)
      .digest("hex");

    const newUser = new User({
      name: net_admin_name,
      networkname: network_name,
      password: hashPassword,
      email: net_admin_email,
      role: net_admin_role,
    });
    await newUser.save();
    return res.status(200).json({ success: true, network: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Cant Add Network server error" });
  }
};

export const getNetworks = async (req, res) => {;
  try {
    const user = await User.find({role: 'admin'})
    // const user = await User.find({password:0})
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "cant get user server error" });
  }
};