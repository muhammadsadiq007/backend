import mongoose, { Schema } from "mongoose";

const Network = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  global.network_name = network_name;
};

export const expenseSchema = new mongoose.Schema({
  expensetype: { type: String, required: true },
  expensebyId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true },
  details: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const expHeadSchema = new mongoose.Schema({
  exphead: { type: String, required: true },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const exptypeSchema = new mongoose.Schema({
    exptype: {type: String, required: true},
    details: {type: String},
    expheadId : {
      type: Schema.Types.ObjectId,
      ref: global.network_name + "_exphead",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
 })

