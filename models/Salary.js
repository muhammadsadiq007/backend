import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const Mame = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  global.network_name = network_name;
};
const salarySchema = new mongoose.Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: global.network_name + "Employee",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  basicsalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netsalary: { type: Number, required: true },
  paydate: { type: Date, required: true },
  addedbyId: { type: Schema.Types.ObjectId,
    ref: "user",
    required: true, },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},{
  strictPopulate: false
} );

export default salarySchema;
