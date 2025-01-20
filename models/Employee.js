import mongoose, { Schema } from "mongoose";

const employeeSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  emp_department: { type: String },
  emp_salary: { type: String, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},{
  strictPopulate: false
});

export default employeeSchema;
