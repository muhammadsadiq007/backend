import salarySchema from "../models/Salary.js";
import mongoose, { Schema } from "mongoose";
import User from "../models/User.js"
import employeeSchema from "../models/Employee.js";
import jwt from "jsonwebtoken";

export const getMonthlySalaries = async (req, res) => {  
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
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

    const Salary = mongoose.model(network_name + "_salary", salarySchema);
          const Employee =  mongoose.model(network_name + "_employee", employeeSchema);     
    const salaryRecords = await Salary.find({
      paydate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate("userId", {name: 1}).populate({
      path: 'employeeId',select: 'emp_salary', model: Employee
    }).populate("addedbyId", {name:1})
    // const salaryRecords = await Salary.find()

    // if (!salaryRecords) {
    //   const salaryRecords = await Salary.findOne({ employeeId: id }).populate(
    //     "employeeId"
    //   );
    // }
    return res.status(200).json({ success: true, salaryRecords });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, error: "Can't Get Salary Records Server Error" });
  }
};

export const getSalaries = async (req, res) => {  
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;

    const timeZoneOffset = `+05:00`
    const now = new Date()
    // First day of the month at 00:00:00.000
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = startOfMonth.toISOString().split('T')[0] + `T23:59:59.999${timeZoneOffset}`;
 
    // Last day of the month at 23:59:59.999
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endDate = endOfMonth.toISOString().split('T')[0] + `T23:59:59.999${timeZoneOffset}`;

    const Salary = mongoose.model(network_name + "_salary", salarySchema);
          const Employee =  mongoose.model(network_name + "_employee", employeeSchema);     
    const salaryRecords = await Salary.find({
      paydate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate("userId", {name: 1}).populate({
      path: 'employeeId',select: 'emp_salary', model: Employee
    }).populate("addedbyId", {name:1})
    // const salaryRecords = await Salary.find()

    // if (!salaryRecords) {
    //   const salaryRecords = await Salary.findOne({ employeeId: id }).populate(
    //     "employeeId"
    //   );
    // }
    return res.status(200).json({ success: true, salaryRecords });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, error: "Can't Get Salary Records Server Error" });
  }
};

export const getSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    

    const Salary = mongoose.model(network_name + "_salary", salarySchema);
          const Employee =  mongoose.model(network_name + "_employee", employeeSchema);     
    const salaryRecords = await Salary.find({ employeeId: id }).populate("userId").populate("addedbyId", {name:1}).populate({
      path: 'employeeId', model: Employee
    })
    // const salaryRecords = await Salary.find()

    // if (!salaryRecords) {
    //   const salaryRecords = await Salary.findOne({ employeeId: id }).populate(
    //     "employeeId"
    //   );
    // }
    return res.status(200).json({ success: true, salaryRecords });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Can't Get Salary Records Server Error" });
  }
};

export const addSalary = async (req, res) => {
  try {
    const {
      employeeId,
      userId,
      basicsalary,
      allowances,
      deduction,
      paydate,
      addedbyId,
      network_name,
    } = req.body;
    const Salary = mongoose.model(network_name + "_salary", salarySchema);
    const totalSalary =
      parseInt(basicsalary) + parseInt(allowances) - parseInt(deduction);
    const newSalary = new Salary({
      employeeId,
      userId,
      basicsalary,
      allowances,
      deduction,
      netsalary: totalSalary,
      paydate,
      addedbyId,
    });
    await newSalary.save();
    return res
      .status(200)
      .json({ success: true, message: "Salary given to Employee" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Can't give Salary to employee Server Error",
      data: req.body
    });
  }
};

