import mongoose, { Schema } from "mongoose";

const expenseSchema = new mongoose.Schema({
  expensetype: { type: String, required: true },
  expensebyId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true },
  details: { type: String },
  date: { type: Date, default: Date.now },
  cratedate: { type: Date, default: Date.now },
  updatedate: { type: Date, default: Date.now },
});

export default expenseSchema;
