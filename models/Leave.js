import mongoose, { Schema } from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  leavetype: {
    type: String,
    enum: ["Sick Leave", "Casual Leave", "Annual Leave"],
    required: true,
  },
  fromdate: { type: Date, required: true },
  enddate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  appliedat: { type: Date, default: Date.now },
  updatedat: { type: Date, default: Date.now },
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
