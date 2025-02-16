import packageSchema from "../models/Packages.js";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";


export const getPackages = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname 
    const Package = mongoose.model(network_name + '_packages', packageSchema)
    const packages = await Package.find();
    return res.status(200).json({ success: true, packages });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get package server error" });
  }
};

export const addPackage = async (req, res) => {
  try {
    const { package_name, package_type, package_price, network_name } = req.body;
    const Package = mongoose.model(network_name + '_packages', packageSchema)
    const pkg = await Package.findOne({ package_name : package_name  });
    if (pkg) {
      return res
        .status(400)
        .json({ success: false, error: `Package ${package_name} Already Exists!` });
    }
    const newPkg = new Package({
      package_name,
      package_price,
      package_type,
    });
    await newPkg.save();
    return res.status(200).json({ success: true, package: newPkg });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, error: "add package server error" });
  }
};

export const getPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname 
    const Package = mongoose.model(network_name + '_packages', packageSchema)
    const packages = await Package.findById(id);
    return res.status(200).json({ success: true, packages });
  } catch (error) {  
    return res
      .status(500)
      .json({ success: false, error: "get package server errorss" });
  }
};

export const editPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname 
    const Package = mongoose.model(network_name + '_packages', packageSchema)
    const { package_name, package_type, package_price } = req.body;    
    const updatePkg = await Package.findByIdAndUpdate({_id: id}, {
      package_name,
      package_price,
      package_type,
    });
    return res.status(200).json({ success: true, updatePkg });
  } catch (error) {  
    return res
      .status(500)
      .json({ success: false, error: "Edit Package server errorss" });
  }
};
