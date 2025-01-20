import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";

export const addLeave = async (req, res) => {
  try {
    const { leavetype, fromdate, enddate, reason, userId } = req.body;
    const employee = await Employee.findOne({ userId });
    const newLeave = new Leave({
      employeeId: employee._id,
      leavetype,
      fromdate,
      enddate,
      reason,
    });
    await newLeave.save();
    return res
      .status(200)
      .json({ success: true, message: "Leave Apply Successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Can't apply for leave Server Error" });
  }
};

export const getLeave = async (req, res) => {
  try {
    const { id } = req.params;
   
    const employee = await Employee.findOne({ userId: id });
    const leaveRecords = await Leave.find({ employeeId: employee._id });
      return res.status(200).json({ success: true, leaveRecords });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Can't Get Leave Data server error" });
  }
};
