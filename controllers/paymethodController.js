import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import payMethodSchema from "../models/PaymentMethod.js";

export const getPaymethods = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const PayMethod = mongoose.model(
      network_name + "_paymethod",
      payMethodSchema
    );
    const paymethods = await PayMethod.find();
    return res.status(200).json({ success: true, paymethods });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get package server error" });
  }
};

export const addPaymethod = async (req, res) => {
  try {
    const { paymethod, details, network_name } = req.body;
    const PayMethod = mongoose.model(
      network_name + "_paymethod",
      payMethodSchema
    );
    const method = await PayMethod.findOne({ paymethod: paymethod });
    if (method) {
      return res.status(400).json({
        success: false,
        error: `This ${paymethod} Already Exists!`,
      });
    }
    const methods = new PayMethod({
      paymethod,
      details,
    });
    await methods.save();
    return res.status(200).json({ success: true, methods: methods });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add payment mode server error" });
  }
};

export const getPaymethod = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;

    const PayMethod = mongoose.model(
      network_name + "_paymethod",
      payMethodSchema
    );
    const methods = await PayMethod.findById(id);
    return res.status(200).json({ success: true, methods });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get package server errors" });
  }
};

export const editPaymethod = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const PayMethod = mongoose.model(
      network_name + "_paymethod",
      payMethodSchema
    );
    const { paymethod, details } = req.body;
    const updateMethod = await PayMethod.findByIdAndUpdate(
      { _id: id },
      {
        paymethod,
        details,
      }
    );
    return res.status(200).json({ success: true, updateMethod });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Edit Package server errorss" });
  }
};
