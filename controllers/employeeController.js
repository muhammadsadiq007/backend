import employeeSchema from "../models/Employee.js";
import mongoose, { Schema } from "mongoose";
import User from "../models/User.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const getEmployees = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const Employee = mongoose.model(network_name + "_employee", employeeSchema);
    const employees = await Employee.find().populate("userId", { password: 0 });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employee server error" });
  }
};

export const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const network_name = decoded.networkname;
    const Employee = mongoose.model(network_name + "_employee", employeeSchema);
    let employees;
    employees = await Employee.findById(id).populate("userId");
    if (!employees) {
      employees = await Employee.findOne({ userId: id }).populate("userId", {
        password: 0,
      });
    }
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employee server error" });
  }
};

export const EmployeeByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ emp_department: id })
      .populate("userId", { password: 0 })
      .populate("emp_department");
    return res
      .status(200)
      .json({ success: true, employees, message: "All Ok" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employee server error" });
  }
};

export const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      emp_name,
      emp_department,
      emp_salary,
      emp_password,
      emp_role,
      network_name,
    } = req.body;
    const Employee = mongoose.model(network_name + "_employee", employeeSchema);
    const employee = await Employee.findById({ _id: id });

    const hashPassword = crypto
      .createHash("sha256")
      .update(emp_password)
      .digest("hex");
    const updateUser = await User.findByIdAndUpdate(
      { _id: employee.userId },
      {
        name: emp_name,
        password: hashPassword,
         role: emp_role,
      }
    );
    const updateEmployee = await Employee.findByIdAndUpdate(
      { _id: id },
      {
        emp_department,
        emp_salary,
      }
    );

    if (!updateUser || !updateEmployee) {
      return res
        .status(404)
        .json({ success: false, error: "Document Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Employee Updated Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Edit Employee server error" });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const {
      emp_name,
      emp_email,
      emp_department,
      emp_salary,
      emp_password,
      emp_role,
      network_name,
    } = req.body;
    const email = emp_email;
    const user = await User.findOne({ email: emp_email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "Email Address Already Exists!", input:req.body });
    }
    const hashPassword = crypto
      .createHash("sha256")
      .update(emp_password)
      .digest("hex");
    const newUser = new User({
      name: emp_name,
      email: emp_email,
      password: hashPassword,
      networkname: network_name,
      role: emp_role,
    });
    const savedUser = await newUser.save();

    const Employee = mongoose.model(network_name + "_employee", employeeSchema);
    const newEmp = new Employee({
      userId: savedUser._id,
      emp_department,
      emp_salary,
    });
    await newEmp.save();
    return res.status(200).json({ success: true, message: "Employee Created" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add employee server error" });
  }
};
