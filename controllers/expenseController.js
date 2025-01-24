import mongoose, { Schema } from "mongoose";
import expenseSchema from "../models/Expense.js";
import jwt from "jsonwebtoken";


export const addExpense = async (req, res) => {
  try {
    const { expensetype, date, amount, details, network_name, expenseby } =
      req.body;
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);
    const newExp = new Expense({
      expensetype,
      date,
      amount,
      details,
      expensebyId: expenseby,
    });
    await newExp.save();
    return res.status(200).json({
      success: true,
      message: "Expense Added Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "There is somthing wrong contact admin",
    });
  }
};

export const getExpense = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);

    const expenseData = await Expense.find()
      .populate("expensebyId",{name:1})
      .sort({ cratedate: -1 });
    return res.status(200).json({ success: true, expenseData });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Somthing Wrong Contact Admin" });
  }
};
