import collectionSchema from "../models/Collection.js";
import mongoose, { Schema } from "mongoose";
import packageSchema from "../models/Packages.js";
import clientSchema from "../models/Clients.js";
import subareaSchema from "../models/SubArea.js";
import jwt from "jsonwebtoken";
import salarySchema from "../models/Salary.js";
import { expenseSchema, exptypeSchema } from "../models/Expense.js";
import logsSchema from "../models/Logs.js";

export const monthlyReports = async (req, res) => {
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

    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );

    const paymentmethod = await Collection.aggregate([
      {
        $match: {
          paymentdate: { $gte: new Date(startDate), $lt: new Date(endDate) },
          status: "Paid",
        },
      },
      {
        $group: {
          _id: "$paymentmethod",
          amount: {
            $sum: "$amountpaid",
          },
        },
      },
      {
        $project: {
          _id: 0,
          paymethod: "$_id",
          amount: 1,
        },
      },
      {
        $sort: {
          amount: -1,
        },
      },
    ]);

    const packageCount = await Collection.aggregate([
      {
        $match: {
          paymentdate: { $gte: new Date(startDate), $lt: new Date(endDate) },
          status: "Paid",
        },
      },
      {
        $group: {
          _id: "$packageId",
          clients: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          package_name: "$_id",
          clients: 1,
        },
      },
      {
        $sort: {
          clients: -1,
        },
      },
    ]);

    const totalRecovery = await Collection.aggregate([
      {
        $match: {
          paymentdate: { $gte: new Date(startDate), $lt: new Date(endDate) },
        },
      },
      { $group: { _id: null, recovery: { $sum: "$monthly" } } },
    ]);

    const totalOldBalance = await Collection.aggregate([
      {
        $match: {
          paymentdate: { $gte: new Date(startDate), $lt: new Date(endDate) },
        },
      },
      { $group: { _id: null, balance: { $sum: "$balance" } } },
    ]);

    const Client = mongoose.model(network_name + "_client", clientSchema);
    const totalClientBalance = await Client.aggregate([
      { $match: { status: "Terminated" } },
      { $group: { _id: null, clientBalance: { $sum: "$balance" } } },
    ]);
    const Salary = mongoose.model(network_name + "_salary", salarySchema);
    const totalSalaries = await Salary.find({
      paydate: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate("userId", { name: 1 })
      .sort({ netsalary: -1 });
    const ExpenseType = mongoose.model(
      network_name + "_exptype",
      exptypeSchema
    );
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);
    const totalExpense = await Expense.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate({ path: "exptypeId", model: ExpenseType })
      .sort({ amount: -1 });

    const totalCollection = await Collection.aggregate([
      {
        $match: {
          paymentdate: { $gte: new Date(startDate), $lt: new Date(endDate) },
          status: "Paid",
        },
      },
      { $group: { _id: null, totalAmount: { $sum: "$amountpaid" } } },
    ]);

    return res.status(200).json({
      success: true,
      recovery: totalRecovery[0]?.recovery || 0,
      totalSalaries,
      balance: totalOldBalance[0]?.balance || 0,
      totalExpense,
      clientBalance: totalClientBalance[0]?.clientBalance || 0,
      totalCollection,
      packageCount,
      paymentmethod,
      totalAmount: totalCollection[0]?.totalAmount || 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Can't fetcg monthly reports server error",
    });
  }
};

export const clientreports = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Package = mongoose.model(network_name + "_packages", packageSchema);
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clients = await Client.find({
      $and: [{ balance: { $gt: 0 } }, { status: { $ne: "Terminated" } }],
    })
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

export const clientbBadDebt = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Package = mongoose.model(network_name + "_packages", packageSchema);
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clients = await Client.find({
      $and: [{ balance: { $gt: 0 } }, { status: { $ne: "Active" } }],
    })
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

export const collectionReports = async (req, res) => {
  const { startDate, endDate, network_name } = req.body;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const collectionReports = await Collection.find({
      paymentdate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    return res.status(200).json({ success: true, collectionReports });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Somthing Wrong with Server" });
  }
};

export const activityLogs = async (req, res) => {
  const { startDate, endDate, cmdType, network_name } = req.body;
  const startDates = new Date(`${startDate}T00:00:00.000+05:00`);
  const endDates = new Date(`${endDate}T23:59:59.999+09:00`);
  console.log(req.body)
  console.log("Start Date" ,startDates, "end Date" ,endDates)

  try {
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const activityLogs = await Logs.find({
      timestamp: { $gte: startDates, $lte: endDates },
      cmd: cmdType,
    })
      .populate("userId", { name: 1 })
      .populate({ path: "targetId", select: "internetid name", model: Client });

    return res.status(200).json({ success: true, activityLogs });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, error: "Somthing Wrong with Server" });
  }
};

export const balanceSheet = async (req, res) => {
  try {
    
    const { startDates, endDates, network_name } = req.body;
    const startDate = new Date(`${startDates}T00:00:00.000+05:00`);
    const endDate = new Date(`${endDates}T23:59:59.000+00:00`);
    console.log(req.body)
    console.log("Start Date" ,startDate, "end Date" ,endDate)
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    // Step 1: Fetch Collections (Credit)
    const balanceSheet = await Collection.aggregate([
      {
        $match: {
          paymentdate: { $gte: new Date(startDate), $lt: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: "$paymentdate",
          amount: { $sum: "$amountpaid" },
          details: { $push: "User Collections" },
        },
      },
      {
        $addFields: {
          type: "Credit",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          type: 1,
          amount: 1,
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
    ]);
    const Expense = mongoose.model(network_name + "_expense", expenseSchema);
        const ExpenseType = mongoose.model(
            network_name + "_exptype",
            exptypeSchema
          );
    // Step 2: Fetch Expenses (Debit)
    const expenseSheet = await Expense.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lt: new Date(endDate) },
        },
      },
      {
        $lookup: {
          from: network_name + "_exptypes", // Expense types table
          localField: "exptypeId", // Foreign key in expenses
          foreignField: "_id", // Primary key in expense_types
          as: "expenseType",
        }
      },
      {
        $group: {
          _id: { date: "$date", type: "$expenseType.exptype" },
          amounts: { $sum: "$amount" },
        },
      },
      {
        $addFields: {
          type: "Debit",
          details: "$_id.type",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          type: 1,
          amounts: 1,
          details: 1,
        },
      },
    ]);

    // Step 3: Fetch Salary (Debit)
    const Salary = mongoose.model(network_name + "_salary", salarySchema);
    const salarySheet = await Salary.aggregate([
      {
        $match: {
          paydate: { $gte: new Date(startDate), $lt: new Date(endDate) },
        },
      },
      {
        $lookup: {
          from: "users", // Expense types table
          localField: "userId", // Foreign key in expenses
          foreignField: "_id", // Primary key in expense_types
          as: "employeename",
        }
      },
      {
        $group: {
          _id: { date: "$paydate", type: "$employeename.name" },
          amounts: { $sum: "$netsalary" },
        },
      },
      {
        $addFields: {
          type: "Debit",
          details: "$_id.type",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          type: 1,
          amounts: 1,
          details: 1,
        },
      },
    ]);

    // Step 3: Merge Collections and Expenses
    let transactions = [...balanceSheet, ...expenseSheet,...salarySheet];

    // Step 4: Sort by Date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Step 5: Calculate Running Balance
    let runningBalance = 0;
    transactions.forEach((entry) => {
      if (entry.type === "Credit") {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amounts;
      }
      entry.balance = runningBalance;
    });
    return res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Somthing Wrong with Server" });
  }
};
