import subareaSchema from "../models/SubArea.js";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

export const getSubareas = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const subAreas = await SubArea.find();
    return res.status(200).json({ success: true, subAreas });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get package server error" });
  }
};

export const getSubarea = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const { id } = req.params;
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const subAreas = await SubArea.findById(id);
    return res.status(200).json({ success: true, subAreas });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get package server error" });
  }
};

export const editSubarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { subarea_name, contact, subarea, address, network_name } = req.body;
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);

    const updateSub = await SubArea.findByIdAndUpdate(
      { _id: id },
      {
        subarea_name,
        contact,
        address,
        subarea,
      }
    );
    return res.status(200).json({ success: true, updateSub });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Edit Package server errorss" });
  }
};

export const addSubarea = async (req, res) => {
  try {
    const { subarea_name, contact, subarea, address, network_name } = req.body;
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const initials = await SubArea.findOne({ subarea: subarea });
    if (initials) {
      return res
        .status(400)
        .json({ success: false, error: `${subarea} initials Already Exists!` });
    }
    const newArea = new SubArea({
      subarea_name,
      subarea,
      contact,
      address,
    });
    await newArea.save();
    return res.status(200).json({ success: true, subArea: newArea });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add package server error" });
  }
};
