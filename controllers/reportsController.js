import collectionSchema from "../models/Collection.js";
import mongoose, { Schema } from "mongoose";
import packageSchema from "../models/Packages.js";
import clientSchema from "../models/Clients.js";
import subareaSchema from "../models/SubArea.js"; 
import jwt from "jsonwebtoken";
import { compareAsc, format } from "date-fns";
import salarySchema from "../models/Salary.js";
import expenseSchema from "../models/Expense.js";

export const monthlyReports = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;

  try {
    const {selectMonth} = req.body
    console.log(`Select Month  ${selectMonth}`)
    if(!selectMonth) {
      return res
      .status(400)
      .json({ success: false, error: "Month & Year are required" });
    }

    const parsedDate = new Date(selectMonth)
    // const year = parsedDate.getUTCFullYear()
    const year = parsedDate.getFullYear()
    const month = parsedDate.getMonth()
    
    const startDate = new Date(year, month, 1).toLocaleString()
    const endDate = new Date(year, month + 1, 1).toLocaleString()



    const Client = mongoose.model(network_name + "_client", clientSchema);

    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );

    const totalClient = await Collection.find(
       { paymentdate: {
        $gte : startDate,
        $lt : endDate,
      }
    },{status:"Paid"}).countDocuments()

    const totalRecovery = await Collection.aggregate([
      { $match: {paymentdate : {$gte : new Date(startDate), $lt : new Date(endDate)}} },
      { $group: { _id:null,  recovery: { $sum: "$monthly" } } },
    ]);

    const totalBalance = await Collection.aggregate([
      { $match: { paymentdate : {$gte : new Date(startDate), $lt : new Date(endDate)}, status: "Paid" } },
      { $group: { _id:null,  balance: { $sum: "$balance" } } },
    ])

    const Salary = mongoose.model(network_name + "_salary", salarySchema);
    const totalSalaries = await Salary.find({paydate: {
      $gte : startDate,
      $lt : endDate,
    }}).populate("userId", {name:1})

    const Expense = mongoose.model(network_name + "_expense", expenseSchema);
    const totalExpense = await Expense.find({date: {
      $gte : startDate,
      $lt : endDate,
    }})
    const localdate = new Date(startDate).toLocaleDateString()
    
       
      const totalCollection = await Collection.aggregate([
      { $match: { paymentdate : {$gte : new Date(startDate), $lt : new Date(endDate)}, status: "Paid"} },
      { $group: { _id: null, totalAmount: { $sum: "$monthly" } } }, 
    ]);


    return res.status(200).json({
      success: true,
      totalClient,
      recovery: totalRecovery[0]?.recovery || 0,
      totalSalaries,
      balance: totalBalance[0]?.balance || 0,
      totalExpense,
      totalCollection,
      totalAmount: totalCollection[0]?.totalAmount || 0,
    });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, error: "Can't get dashboard data server error" });
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
    const clients = await Client.find({ balance: { $gt: 0 } })
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
    const {startDate, endDate, network_name} = req.body
    try {
      const Collection = mongoose.model(
        network_name + "_collection",
        collectionSchema
      );
      const collectionReports = await Collection.find({
        paymentdate: {$gte: new Date(startDate),
            $lte: new Date(endDate),
        }
      });
      return res.status(200).json({ success: true, collectionReports });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Somthing Wrong with Server" });
    }
  };