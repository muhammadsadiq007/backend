import clientSchema from "../models/Clients.js";
import packageSchema from "../models/Packages.js";
import subareaSchema from "../models/SubArea.js";
import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";

export const deactivateClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY); 
  const network_name = decoded.networkname;


  const { id } = req.params;
  const {
    status,
  } = req.body

try {
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const updclient = await Client.findByIdAndUpdate({_id: id},{
    status,
  })
  if (!updclient) {
    return res
      .status(404)
      .json({ success: false, error: "Document Not Found" });
  }
  return res
  .status(200)
  .json({ success: true, message: "Client Deactivated Successfully" });
} catch (error) {
return res
  .status(500)
  .json({ success: false, error: "Edit Client server error" });
}
}

export const activateClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY); 
  const network_name = decoded.networkname;


  const { id } = req.params;
  const {
    rechargedate,
  } = req.body

try {
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const updclient = await Client.findByIdAndUpdate({_id: id},{
    status : "Active",
    rechargedate,
  })
  if (!updclient) {
    return res
      .status(404)
      .json({ success: false, error: "Document Not Found" });
  }
  return res
  .status(200)
  .json({ success: true, message: "Client Activated Successfully" });
} catch (error) {
return res
  .status(500)
  .json({ success: false, error: "Edit Client server error" });
}
}

export const getClient = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Package = mongoose.model(network_name + "_packages", packageSchema);
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const client = await Client.findById(id)
      .populate({
        path: "packageId",
        select: "package_name",
        model: Package,
      })
      .populate({
        path: "subareaId",
        model: SubArea,
      });
    return res.status(200).json({ success: true, client });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const editClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;


  const { id } = req.params;
  const {
    subareaId,
    name,
    address,
    phonenumber,
    mobilenumber,
    packageId,
    monthly,
    status,
    rechargedate,
  } = req.body

try {
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const updclient = await Client.findByIdAndUpdate({_id: id},{
    subareaId,
    name,
    address,
    phonenumber, 
    mobilenumber,
    packageId,
    monthly,
    status,
    rechargedate,
  })
  if (!updclient) {
    return res
      .status(404)
      .json({ success: false, error: "Document Not Found" });
  }
  return res
  .status(200)
  .json({ success: true, message: "Client Updated Successfully" });
} catch (error) {
return res
  .status(500)
  .json({ success: false, error: "Edit Client server error" });
}
}

export const getClients = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Package = mongoose.model(network_name + "_packages", packageSchema);
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clients = await Client.find()
      .populate("userId", { name: 1 })
      .populate({
        path: "packageId",
        select: "package_name",
        model: Package,
      })
      .populate({
        path: "subareaId",
        select: "subarea",
        model: SubArea,
      });
    return res.status(200).json({ success: true, clients });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const addClients = async (req, res) => {
  try {
    const {
      internetid,
      userId,
      subareaId,
      name,
      address,
      monthly,
      phonenumber,
      mobilenumber,
      packageId,
      inscharges,
      insdate,
      balance,
      rechargedate,
      status,
      network_name,
    } = req.body;
    const Client = mongoose.model(network_name + "_client", clientSchema);

    const client = await Client.findOne({ internetid: internetid });
    if (client) {
      return res
        .status(400) 
        .json({ success: false, error: `${internetid} Already Exists!`, input:req.body });
    }
    const newClient = new Client({
      internetid,
      userId,
      subareaId,
      name,
      address,
      monthly,
      phonenumber,
      mobilenumber,
      packageId,
      inscharges,
      insdate,
      balance,
      rechargedate,
      status,
    });
    await newClient.save();
    return res
      .status(200)
      .json({ success: true, message: "Client Add Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Server Error",
    });
  }
};
