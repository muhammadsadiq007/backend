import salarySchema from "../models/Salary.js";
import mongoose, { Schema } from "mongoose";
import User from "../models/User.js"
import employeeSchema from "../models/Employee.js";
import jwt from "jsonwebtoken";


export const getSalaries = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    

    const Salary = mongoose.model(network_name + "_salary", salarySchema);
          const Employee =  mongoose.model(network_name + "_employee", employeeSchema);     
    const salaryRecords = await Salary.find().populate("userId", {name: 1}).populate({
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

// export const getSalary = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let salaryRecords = (await Salary.find({ employeeId: id }).populate("employeeId"));
//     if(!salaryRecords || salaryRecords.length < 1 ) {
//       const employee = await Employee.findOne({userId: id})
//       salaryRecords = await Salary.find({employeeId: employee._id})
//       .populate('employeeId', 'emp_id')
//      }

//   return res.status(200).json({ success: true, salaryRecords });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ success: false, error: "Can't Get Salary Records Server Error" });
//   }
// };
