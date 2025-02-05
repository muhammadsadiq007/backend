import logsSchema from "../models/Logs.js";
import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";

export const logsAction = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;
//   const date = new Date().toUTCString()

  try {
    const Logs = mongoose.model(network_name + "_logs", logsSchema); 
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      targetId: req.params.id || null,
    });
    console.log(log);
    // await log.save();
    next();
  } catch (error) {
    console.error("Logging error:", error);
    next(); // Error ke bawajood request proceed kare
  }
};
