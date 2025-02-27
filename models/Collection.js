import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const Network = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  global.network_name = network_name;
};

const collectionSchema = new mongoose.Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: global.network_name + "_client",
      required: true,
    },
    internetid: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    packageId: { type: String, default: undefined},
    subareaId: {
      type: Schema.Types.ObjectId,
      ref: global.network_name + "_subarea",
      required: true,
    },
    paidby: { type: String },
    transid: { type: String },
    monthly: { type: Number, default: undefined},
    tvpackage: { type: String, default: undefined},
    remarks: { type: String, default: undefined},
    tvmonthly: { type: Number, default: undefined},
    amountpaid: { type: Number, default: undefined}, 
    monthspaid: { type: Number, default: undefined}, 
    entries: [
      {
        month: {type : String},
        _id: false,
      },
    ],
    balance: { type: Number, default: 0 },
    status: { type: String, default: undefined}, 
    paymentmethod: { type: String, default: undefined}, 
    paymentdate: { type: Date, default: undefined}, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    strictPopulate: false,
  }
);

export default collectionSchema;
