import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import payMethodSchema from "../models/PaymentMethod.js";
import exptypeSchema from "../models/ExpenseType.js";

export const getExpTypes = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const ExpenseType = mongoose.model(
        network_name + "_exptype",
        exptypeSchema
      );
    const expensetype = await ExpenseType.find();
    return res.status(200).json({ success: true, expensetype });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get expense type server error" });
  }
};

export const addExpType = async (req, res) => {
  try {
    const { exptype, details, network_name } = req.body;
    const ExpenseType = mongoose.model(
      network_name + "_exptype",
      exptypeSchema
    );
    const expensetype = await ExpenseType.findOne({ exptype: exptype });
    if (expensetype) {
      return res.status(400).json({
        success: false,
        error: `This ${exptype} Already Exists!`,
      });
    }
    const exptypes = new ExpenseType({
      exptype,
      details,
    });
    await exptypes.save();
    return res.status(200).json({ success: true, exptypes: exptypes });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add expense category server error" });
  }
};

export const getExpType = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;

    const ExpenseType = mongoose.model(
        network_name + "_exptype",
        exptypeSchema
      );

    const expTypes = await ExpenseType.findById(id);
    return res.status(200).json({ success: true, expTypes });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Fetching Data Server Error" });
  }
};

export const editExpType = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const ExpenseType = mongoose.model(
        network_name + "_exptype",
        exptypeSchema
      );
    const { exptype, details } = req.body;
    const expType = await ExpenseType.findByIdAndUpdate(
      { _id: id },
      {
        exptype,
        details,
      }
    );
    return res.status(200).json({ success: true, expType });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Edit Expense Category Server Errors" });
  }
};
