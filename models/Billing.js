import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const Network = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  global.network_name = network_name;
};

const billingSchema = new mongoose.Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: global.network_name + "_client",
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  entries: [
    {
      month: { type: String },
      _id: false,
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Paid", "Unpaid"],
    default: "Pending",
  },
  balance: { type: Number, default: 0 }, // Outstanding balance if unpaid
  createdAt: { type: Date, default: Date.now },
});

export default billingSchema;
