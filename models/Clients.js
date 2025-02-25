import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const Network = (req) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  global.network_name = network_name;
};

const clientSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  subareaId: {
    type: Schema.Types.ObjectId,
    ref: global.network_name + "_subarea",
    required: true,
  }, 
  packageId: {
    type: Schema.Types.ObjectId,
    ref: global.network_name + "_package",
    default: undefined,
  },
  tvpackageId: {
    type: Schema.Types.ObjectId,
    ref: global.network_name + "_package"
    , default: undefined},
  internetid: { type: String, required: true, unique:true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phonenumber: { type: Number },
  mobilenumber: { type: Number },
  inscharges: { type: Number, default:0 },
  monthly: { type: Number, default: undefined},
  discount: { type: String},
  tvdiscount: { type: String},
  insdate: { type: Date, default: Date.now },
  rechargedate: { type: Date, default: Date.now },
  status: { type: String, default: "Active" },
  ispaid: { type: String, default: "Unpaid" },
  istvpaid: { type: String, default: undefined },
  tvcable: { type: String, default: "Internet"},
  tvmonthly: { type: Number, default: undefined},
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},{
  strictPopulate: false
});

// const Client = mongoose.model(network_name + '_client', clientSchema);
export default clientSchema;

