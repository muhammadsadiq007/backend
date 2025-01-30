import User from "../models/User.js";
import crypto from "crypto";

export const getNetworkData = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await User.findOne({ _id: id }, {permissions:1});

    return res.status(200).json({ success: true, networkData: data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Somthing is wrong with server" });
  }
};

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

export const editNetworkPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const newUser = User.findByIdAndUpdate(
      { _id: id },
      {
        password: hashPassword,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Somthing is Wrong with server" });
  }
};

export const editNetworkPermission = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  
  try {
    // Validate permissions
    if (!permissions || typeof permissions !== "object" || Object.keys(permissions).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Permission Object" });
    }

    // Find and update user permissions
    const updatedUser = await User.findByIdAndUpdate(
      id, // Find by ID
      { permissions }, // Update permissions
      { new: true } // Return updated document
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, error: "User Not Found" });
    }

    return res.status(200).json({
      success: true,
      message: "Permissions updated successfully.",
      data: updatedUser, // Send updated user as response (optional)
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Something went wrong with the server" });
  }
};

export const getNetworks = async (req, res) => {
  try {
    const user = await User.find({ role: "admin" });
    // const user = await User.find({password:0})
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "cant get user server error" });
  }
};
