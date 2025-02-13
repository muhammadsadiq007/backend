import mongoose, { Schema } from "mongoose";
import {expenseSchema, expHeadSchema, exptypeSchema} from "../models/Expense.js";
import jwt from "jsonwebtoken";

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
    const { exptype, details, network_name, expheadId } = req.body;
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
      expheadId,
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
    const { exptype, details, expheadId } = req.body;
    const expType = await ExpenseType.findByIdAndUpdate(
      { _id: id },
      {
        exptype,
        expheadId,
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

export const addExpHead = async (req, res) => {
  try {
    const { exphead, expheadId, details, network_name } =
      req.body;
    const ExpHead = mongoose.model(network_name + "_exphead", expHeadSchema);
    const newExp = new ExpHead({
      expheadId,
      exphead,
      details,
    });
    await newExp.save();
    return res.status(200).json({
      success: true,
      message: `${exphead} has been created!` ,
    });
  } catch (error) {
    return res.status(500).json({

      success: false,
      error: "There is somthing wrong contact admin",
    });
  }
};

export const getExpHead = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const ExpHead = mongoose.model(network_name + "_exphead", expHeadSchema);

    const expHeadData = await ExpHead.find()
      .sort({ cratedate: -1 });
    return res.status(200).json({ success: true, expHeadData });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Somthing Wrong Contact Admin" });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { exptypeId, date, amount, details, network_name, expenseby } =
      req.body;
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);
    const newExp = new Expense({
      exptypeId,
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

export const editExpense = async (req, res) => {
  try {
    const {id} = req.params
    const { exptypeId, amount, details, network_name } =
      req.body;
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);
    const newExp = await Expense.findByIdAndUpdate({_id: id} , {
      exptypeId,
      amount,
      details,
    });
    return res.status(200).json({
      success: true,
      message: "Expense Updated Successfully",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: "There is somthing wrong contact admin",
    });
  }
};

export const getExpense = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
      const timeZoneOffset = `+05:00` 
      const now = new Date()
      // First day of the month at 00:00:00.000
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startDate = startOfMonth.toISOString().split('T')[0] + `T23:59:59.999${timeZoneOffset}`;
  
      // Last day of the month at 23:59:59.999
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const endDate = endOfMonth.toISOString().split('T')[0] + `T23:59:59.999${timeZoneOffset}`;


    const Expense = mongoose.model(network_name + "_expense", expenseSchema);

    const expenseData = await Expense.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate("expensebyId",{name:1})
      .sort({ cratedate: -1 }).populate({ path: "exptypeId",  model: network_name + "_exptype", populate: { path: "expheadId", model: network_name + "_exphead" }});
    return res.status(200).json({ success: true, expenseData });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, error: "Somthing Wrong Contact Admin" });
  }
};

export const getExpenseById = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const { id } = req.params;
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);

    const editExp = await Expense.findOne({_id : id
    }).populate({ path: "exptypeId", model: network_name + "_exptype" })
    return res.status(200).json({ success: true, editExp });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Somthing Wrong Contact Admin" });
  }
};

export const getMonthlyExpense = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const { selectMonth } = req.body;
    if (!selectMonth) {
      return res
        .status(400)
        .json({ success: false, error: "Month & Year are required" });
    }
    const parsedDate = new Date(selectMonth);
    // const year = parsedDate.getUTCFullYear()
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);


    const Expense = mongoose.model(network_name + "_expense", expenseSchema);

    const expenseData = await Expense.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate("expensebyId",{name:1})
      .sort({ cratedate: -1 }).populate({ path: "exptypeId",  model: network_name + "_exptype", populate: { path: "expheadId", model: network_name + "_exphead" }});
    return res.status(200).json({ success: true, expenseData });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, error: "Somthing Wrong Contact Admin" });
  }
}; 
